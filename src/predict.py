"""
predict.py — Single-image prediction utility.

Used by both the command line and the FastAPI backend.

Usage:
    python -m src.predict --image path/to/fundus_image.jpg
"""

import argparse
import base64
import io
from pathlib import Path

import cv2
import numpy as np
import torch
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for server use
import matplotlib.pyplot as plt

from src.config import DEVICE, BEST_MODEL_PATH, CLASS_NAMES, IMAGE_SIZE
from src.preprocessing import preprocess_image
from src.augmentation import get_val_test_augmentation
from src.model import get_model
from src.gradcam import GradCAM, create_overlay


class GlaucomaPredictor:
    """
    High-level prediction interface for single fundus images.

    Loads the trained model once and provides predict() for repeated use.
    Also generates Grad-CAM heatmaps for each prediction.
    """

    def __init__(self, model_path: str = None):
        model_path = Path(model_path) if model_path else BEST_MODEL_PATH

        if not model_path.exists():
            raise FileNotFoundError(
                f"No trained model found at {model_path}. "
                "Please train the model first: python -m src.train"
            )

        # Load model
        self.model = get_model("proposed")
        checkpoint = torch.load(model_path, map_location=DEVICE, weights_only=False)
        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.model = self.model.to(DEVICE)
        self.model.eval()

        # Grad-CAM setup
        target_layer = self.model.get_fusion_layer()
        self.gradcam = GradCAM(self.model, target_layer)

        # Transform for inference
        self.transform = get_val_test_augmentation()

        print("[INFO] GlaucomaPredictor initialized successfully")

    def predict(self, image_path: str = None, image_array: np.ndarray = None):
        """
        Predict glaucoma from a single fundus image.

        Args:
            image_path: Path to the image file
            image_array: OR a numpy RGB image array (H, W, 3)

        Returns:
            dict with:
                prediction: "Glaucoma" or "Non Glaucoma"
                confidence: float (0-1)
                probabilities: {class_name: probability}
                heatmap: numpy array (H, W)
                overlay: numpy array (H, W, 3)
                display_image: numpy array (H, W, 3) — preprocessed original
        """
        # Get the display image (preprocessed, no normalization)
        if image_path:
            display_image = preprocess_image(image_path)
        elif image_array is not None:
            display_image = cv2.resize(image_array, (IMAGE_SIZE, IMAGE_SIZE))
        else:
            raise ValueError("Provide either image_path or image_array")

        if display_image is None:
            raise ValueError(f"Could not read image: {image_path}")

        # Transform for model input
        transformed = self.transform(image=display_image)
        input_tensor = transformed["image"].unsqueeze(0).to(DEVICE)

        # Forward pass
        with torch.no_grad():
            output = self.model(input_tensor)
            probs = torch.softmax(output, dim=1)

        pred_class = output.argmax(dim=1).item()
        confidence = probs[0, pred_class].item()

        # Generate Grad-CAM
        # Need to re-enable gradients for Grad-CAM
        input_tensor.requires_grad_(True)
        heatmap = self.gradcam.generate(input_tensor)
        overlay = create_overlay(display_image, heatmap)

        return {
            "prediction": CLASS_NAMES[pred_class],
            "confidence": float(confidence),
            "probabilities": {
                CLASS_NAMES[i]: float(probs[0, i].item())
                for i in range(len(CLASS_NAMES))
            },
            "heatmap": heatmap,
            "overlay": overlay,
            "display_image": display_image,
        }

    def predict_to_json(self, image_path: str = None, image_array: np.ndarray = None):
        """
        Predict and return JSON-serializable result with base64 images.
        Used by the FastAPI backend.
        """
        result = self.predict(image_path=image_path, image_array=image_array)

        # Convert images to base64 for JSON transport
        def numpy_to_base64(img_array):
            img = cv2.cvtColor(img_array.astype(np.uint8), cv2.COLOR_RGB2BGR)
            _, buffer = cv2.imencode(".png", img)
            return base64.b64encode(buffer).decode("utf-8")

        def heatmap_to_base64(heatmap):
            colored = cv2.applyColorMap(
                (heatmap * 255).astype(np.uint8), cv2.COLORMAP_JET
            )
            _, buffer = cv2.imencode(".png", colored)
            return base64.b64encode(buffer).decode("utf-8")

        return {
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "probabilities": result["probabilities"],
            "heatmap": heatmap_to_base64(result["heatmap"]),
            "overlay": numpy_to_base64(result["overlay"]),
        }


def main():
    parser = argparse.ArgumentParser(description="Predict Glaucoma from Fundus Image")
    parser.add_argument("--image", type=str, required=True, help="Path to fundus image")
    args = parser.parse_args()

    predictor = GlaucomaPredictor()
    result = predictor.predict(image_path=args.image)

    print(f"\n{'='*40}")
    print(f"  Prediction: {result['prediction']}")
    print(f"  Confidence: {result['confidence']:.2%}")
    print(f"{'='*40}")
    for cls, prob in result["probabilities"].items():
        print(f"    {cls}: {prob:.4f}")


if __name__ == "__main__":
    main()
