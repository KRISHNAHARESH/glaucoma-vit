"""
preprocessing.py — Retinal fundus image preprocessing pipeline.

Pipeline:
    1. Read image (OpenCV loads as BGR)
    2. Convert BGR → RGB
    3. Resize to 224×224
    4. Apply CLAHE on the green channel (best vessel contrast)
    5. Apply median filter to reduce noise
    6. Normalize pixel values to [0, 1] then apply ImageNet normalization

Why each step matters for glaucoma detection:
    - CLAHE: Retinal images often have uneven illumination. CLAHE enhances
      the optic disc boundary and blood vessel visibility locally without
      over-brightening already-bright regions.
    - Green channel CLAHE: The green channel provides the best contrast for
      retinal blood vessels and the optic disc structure.
    - Median filter: Removes salt-and-pepper noise from camera sensors while
      preserving sharp edges of blood vessels (unlike Gaussian blur).
    - ImageNet normalization: Since our ViT backbone is pretrained on ImageNet,
      we normalize using the same mean/std so the features align properly.
"""

import cv2
import numpy as np
import torch
from torchvision import transforms

from src.config import (
    IMAGE_SIZE,
    CLAHE_CLIP_LIMIT,
    CLAHE_TILE_SIZE,
    MEDIAN_FILTER_SIZE,
    IMAGENET_MEAN,
    IMAGENET_STD,
)


def apply_clahe(image: np.ndarray) -> np.ndarray:
    """
    Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to the
    green channel of a retinal fundus image.

    What is CLAHE?
        Standard histogram equalization stretches pixel values globally, which
        can wash out details in bright areas. CLAHE divides the image into a
        grid of small tiles and equalizes each tile independently, then
        blends the boundaries. The "clip limit" caps how much any histogram
        bin can be amplified, preventing noise from being over-enhanced.

    Parameters:
        clip_limit = 2.0: Maximum contrast amplification factor per tile.
            Higher → more contrast but more noise. 2.0 is a safe default.
        tileGridSize = (8, 8): Image is divided into 8×8 = 64 tiles.
            Smaller tiles → more local adaptation.

    Why green channel only?
        In retinal imaging, the green channel captures the highest contrast
        between blood vessels and the retinal background. The red channel is
        often saturated, and the blue channel has poor signal-to-noise ratio.
    """
    # Split into R, G, B channels
    r, g, b = cv2.split(image)

    # Create CLAHE object
    clahe = cv2.createCLAHE(
        clipLimit=CLAHE_CLIP_LIMIT,
        tileGridSize=CLAHE_TILE_SIZE
    )

    # Apply CLAHE to the green channel
    g_enhanced = clahe.apply(g)

    # Merge channels back
    enhanced = cv2.merge([r, g_enhanced, b])
    return enhanced


def apply_median_filter(image: np.ndarray) -> np.ndarray:
    """
    Apply median filtering to remove noise while preserving edges.

    How it works:
        For each pixel, look at a 3×3 neighborhood, sort all 9 values,
        and replace the center pixel with the median (middle) value.

    Example (3×3 window):
        [120, 130, 125]
        [128,  10, 131]  ← 10 is noise (salt)
        [127, 129, 126]

        Sorted: [10, 120, 125, 126, 127, 128, 129, 130, 131]
        Median = 128 → replaces the noisy 10

    Why median instead of Gaussian?
        Gaussian blur averages pixels, which blurs edges of blood vessels.
        Median filter removes outlier noise while keeping sharp boundaries
        intact — critical for detecting thin retinal vessels.
    """
    return cv2.medianBlur(image, MEDIAN_FILTER_SIZE)


def preprocess_image(image_path: str) -> np.ndarray:
    """
    Full preprocessing pipeline for a single retinal fundus image.

    Returns:
        Preprocessed RGB image as numpy array (H, W, 3) with uint8 values.
        Returns None if image cannot be read.
    """
    # Step 1: Read image (OpenCV loads as BGR by default)
    image = cv2.imread(str(image_path))
    if image is None:
        print(f"[WARNING] Could not read image: {image_path}")
        return None

    # Step 2: Convert BGR → RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Step 3: Resize to standard dimensions (224×224)
    # Uses bilinear interpolation for smooth scaling
    image = cv2.resize(image, (IMAGE_SIZE, IMAGE_SIZE), interpolation=cv2.INTER_LINEAR)

    # Step 4: Apply CLAHE for contrast enhancement
    image = apply_clahe(image)

    # Step 5: Apply median filter for noise reduction
    image = apply_median_filter(image)

    return image


def get_tensor_transforms(is_training: bool = False):
    """
    Get the final tensor transforms (normalization).

    Note: Data augmentation is handled separately in augmentation.py.
    This function only handles the conversion from numpy/PIL to a
    normalized PyTorch tensor.

    The normalization uses ImageNet statistics because our ViT backbone
    (vit_tiny_patch16_224) was pretrained on ImageNet. Using the same
    normalization ensures the pretrained features are properly calibrated.

    Normalization formula per channel:
        normalized_pixel = (pixel / 255.0 - mean) / std

    Example for green channel:
        Raw pixel = 180
        Scaled = 180 / 255 = 0.706
        Normalized = (0.706 - 0.456) / 0.224 = 1.116
    """
    transform_list = [
        transforms.ToTensor(),                           # [0, 255] → [0.0, 1.0] + HWC → CHW
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD)  # ImageNet standardization
    ]
    return transforms.Compose(transform_list)
