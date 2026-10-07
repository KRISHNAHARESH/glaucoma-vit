"""
gradcam.py — Gradient-weighted Class Activation Mapping (Grad-CAM).

Grad-CAM provides visual explainability for the model's predictions.
It generates a heatmap showing which regions of the retinal image most
influenced the model's decision.

How Grad-CAM works:
    1. Run a forward pass to get the prediction
    2. Compute the gradient of the predicted class score with respect to
       the feature maps of a chosen convolutional layer
    3. Global-average-pool these gradients to get importance weights
    4. Compute weighted combination of feature maps
    5. Apply ReLU (keep only positive influences)
    6. Resize to original image size → heatmap

In our hybrid architecture, we hook into the Feature Fusion module's
1×1 projection layer, because:
    - It sits between the CNN and ViT
    - It contains the fused multi-scale features
    - The gradients flowing back through it reflect what the ViT found
      most important from the CNN features

Heatmap colors:
    RED/YELLOW: Regions the model focused on most (high activation)
    BLUE/GREEN: Regions the model largely ignored (low activation)

For a correct glaucoma prediction, we expect RED to cluster around
the optic disc (where cupping occurs).

IMPORTANT: Grad-CAM provides model interpretability — it shows WHERE
the model looked, not whether it looked at the RIGHT thing clinically.
It does NOT prove clinical correctness.

Usage:
    python -m src.gradcam
"""

import os
from pathlib import Path

import cv2
import numpy as np
import torch
import torch.nn.functional as F
import matplotlib.pyplot as plt

from src.config import (
    DEVICE, BEST_MODEL_PATH, GRADCAM_DIR, TEST_DIR,
    CLASS_NAMES, IMAGE_SIZE, IMAGENET_MEAN, IMAGENET_STD,
)
from src.utils import set_seed
from src.dataset import collect_image_paths_and_labels
from src.preprocessing import preprocess_image
from src.augmentation import get_val_test_augmentation
from src.model import get_model


class GradCAM:
    """
    Grad-CAM implementation for convolutional layers.

    The algorithm:
        1. Hook into the target layer to capture:
           - Forward activations (feature maps)
           - Backward gradients
        2. After forward + backward pass:
           - Compute importance weights = global_avg_pool(gradients)
           - Heatmap = ReLU(Σ weight_k × activation_k)
        3. Normalize and resize heatmap to image size
    """

    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

        # Register hooks to capture activations and gradients
        self._register_hooks()

    def _register_hooks(self):
        """
        Register forward and backward hooks on the target layer.

        Forward hook: Captures the layer's output (activations/feature maps)
        Backward hook: Captures the gradients flowing back through the layer
        """
        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()

        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_full_backward_hook(backward_hook)

    def generate(self, input_tensor, target_class=None):
        """
        Generate Grad-CAM heatmap for a given input.

        Args:
            input_tensor: Preprocessed image tensor (1, 3, 224, 224)
            target_class: Class to explain (None = use predicted class)

        Returns:
            heatmap: Normalized heatmap array (224, 224) in range [0, 1]
        """
        self.model.eval()

        # Forward pass
        output = self.model(input_tensor)

        # Use predicted class if not specified
        if target_class is None:
            target_class = output.argmax(dim=1).item()

        # Zero gradients
        self.model.zero_grad()

        # Backward pass: compute gradient of target class score
        target_score = output[0, target_class]
        target_score.backward()

        # Get the gradients and activations from our hooks
        gradients = self.gradients    # (1, C, H, W)
        activations = self.activations  # (1, C, H, W)

        # Global average pooling of gradients → importance weights
        # (1, C, H, W) → (1, C) by averaging over spatial dims
        weights = torch.mean(gradients, dim=(2, 3), keepdim=True)  # (1, C, 1, 1)

        # Weighted combination of activation maps
        # Each feature map is weighted by its importance
        heatmap = torch.sum(weights * activations, dim=1, keepdim=True)  # (1, 1, H, W)

        # ReLU: keep only positive contributions
        # (negative values mean the feature suppresses the target class)
        heatmap = F.relu(heatmap)

        # Resize to original image dimensions
        heatmap = F.interpolate(heatmap, size=(IMAGE_SIZE, IMAGE_SIZE),
                                mode="bilinear", align_corners=False)

        # Normalize to [0, 1]
        heatmap = heatmap.squeeze().cpu().numpy()
        if heatmap.max() > 0:
            heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min())

        return heatmap


def create_overlay(image, heatmap, alpha=0.4):
    """
    Overlay a Grad-CAM heatmap on the original image.

    Args:
        image: Original RGB image (H, W, 3) in uint8
        heatmap: Normalized heatmap (H, W) in [0, 1]
        alpha: Transparency of the heatmap overlay

    Returns:
        overlay: Combined image (H, W, 3) in uint8
    """
    # Convert heatmap to colormap (blue→green→yellow→red)
    heatmap_colored = cv2.applyColorMap(
        (heatmap * 255).astype(np.uint8), cv2.COLORMAP_JET
    )
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    # Blend original image with heatmap
    overlay = (image * (1 - alpha) + heatmap_colored * alpha).astype(np.uint8)
    return overlay


def generate_gradcam_examples(num_examples: int = 3):
    """
    Generate Grad-CAM visualizations for test set examples.

    Saves side-by-side plots: Original | Heatmap | Overlay
    for both Glaucoma and Normal examples.
    """
    set_seed()
    GRADCAM_DIR.mkdir(parents=True, exist_ok=True)

    # ---- Load model ----
    model = get_model("proposed")
    if not BEST_MODEL_PATH.exists():
        print("[ERROR] No trained model found. Run training first.")
        return

    checkpoint = torch.load(BEST_MODEL_PATH, map_location=DEVICE, weights_only=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model = model.to(DEVICE)
    print("[INFO] Model loaded for Grad-CAM")

    # ---- Get target layer for Grad-CAM ----
    # We hook into the feature fusion's 1×1 projection layer
    target_layer = model.get_fusion_layer()
    gradcam = GradCAM(model, target_layer)

    # ---- Get test images ----
    test_paths, test_labels = collect_image_paths_and_labels(TEST_DIR)
    transform = get_val_test_augmentation()

    for class_idx, class_name in enumerate(CLASS_NAMES):
        # Get images of this class
        class_paths = [p for p, l in zip(test_paths, test_labels) if l == class_idx]

        for i, img_path in enumerate(class_paths[:num_examples]):
            # Preprocess for display (no normalization)
            display_image = preprocess_image(img_path)
            if display_image is None:
                continue

            # Preprocess for model (with normalization)
            transformed = transform(image=display_image)
            input_tensor = transformed["image"].unsqueeze(0).to(DEVICE)

            # Generate Grad-CAM
            heatmap = gradcam.generate(input_tensor)

            # Get prediction
            with torch.no_grad():
                output = model(input_tensor)
                probs = torch.softmax(output, dim=1)
                pred_class = output.argmax(dim=1).item()
                confidence = probs[0, pred_class].item()

            # Create overlay
            overlay = create_overlay(display_image, heatmap)

            # ---- Plot side by side ----
            fig, axes = plt.subplots(1, 3, figsize=(15, 5))

            axes[0].imshow(display_image)
            axes[0].set_title("Original Image", fontsize=13)
            axes[0].axis("off")

            axes[1].imshow(heatmap, cmap="jet")
            axes[1].set_title("Grad-CAM Heatmap", fontsize=13)
            axes[1].axis("off")

            axes[2].imshow(overlay)
            axes[2].set_title(
                f"Overlay\nPredicted: {CLASS_NAMES[pred_class]} ({confidence:.1%})",
                fontsize=13,
            )
            axes[2].axis("off")

            label_name = class_name.lower().replace(" ", "_")
            save_name = f"{label_name}_example_{i+1:02d}.png"
            save_path = GRADCAM_DIR / save_name

            plt.suptitle(
                f"True Label: {class_name}",
                fontsize=15, fontweight="bold", y=1.02,
            )
            plt.tight_layout()
            plt.savefig(save_path, dpi=150, bbox_inches="tight")
            plt.close()
            print(f"[INFO] Grad-CAM saved: {save_path}")

    print(f"\n[INFO] All Grad-CAM visualizations saved to: {GRADCAM_DIR}")
    print("[DISCLAIMER] Grad-CAM provides model interpretability. It does NOT prove clinical correctness.")


if __name__ == "__main__":
    generate_gradcam_examples()
