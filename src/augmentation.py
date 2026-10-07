"""
augmentation.py — Data augmentation for retinal fundus images.

Augmentation is applied ONLY during training to artificially increase the
diversity of the training set and reduce overfitting.

Why augmentation matters for our project:
    Our ACRIMA dataset has only ~452 training images (after validation split).
    This is very small by deep learning standards. Augmentation creates
    realistic variations of existing images so the model sees more diversity.

Why these specific augmentations?
    - Horizontal/Vertical Flip: Retinal images can be from left or right eyes,
      and fundus cameras can capture from different orientations.
    - Rotation: The optic disc can appear at different angles.
    - Shift/Scale: The optic disc isn't always perfectly centered.
    - Color Jitter: Different fundus cameras produce different color profiles.
    - CoarseDropout: Randomly masks small patches, forcing the model to not
      rely on any single local region (acts as regularization).

IMPORTANT: Validation and test images receive NO augmentation — only the
deterministic preprocessing pipeline (CLAHE + median filter + normalize).
"""

import albumentations as A
from albumentations.pytorch import ToTensorV2
import numpy as np

from src.config import IMAGE_SIZE, IMAGENET_MEAN, IMAGENET_STD


def get_train_augmentation():
    """
    Training augmentation pipeline using Albumentations.

    Returns an Albumentations Compose object that takes a numpy image
    and returns an augmented + normalized tensor.
    """
    return A.Compose([
        # Spatial augmentations
        A.HorizontalFlip(p=0.5),
        A.VerticalFlip(p=0.5),
        A.RandomRotate90(p=0.5),
        A.ShiftScaleRotate(
            shift_limit=0.1,    # Shift up to 10% of image size
            scale_limit=0.1,    # Scale ±10%
            rotate_limit=15,    # Rotate ±15 degrees
            border_mode=0,      # Fill border with black
            p=0.5
        ),

        # Color augmentations (simulate different fundus cameras)
        A.ColorJitter(
            brightness=0.2,
            contrast=0.2,
            saturation=0.1,
            hue=0.05,
            p=0.3
        ),

        # Regularization: randomly erase small patches
        A.CoarseDropout(
            max_holes=4,
            max_height=20,
            max_width=20,
            min_holes=1,
            min_height=8,
            min_width=8,
            fill_value=0,
            p=0.3
        ),

        # Normalize and convert to tensor
        A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ToTensorV2(),
    ])


def get_val_test_augmentation():
    """
    Validation/test transform — NO random augmentation.
    Only normalization and tensor conversion.
    """
    return A.Compose([
        A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ToTensorV2(),
    ])
