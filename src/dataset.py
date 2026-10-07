"""
dataset.py — Dataset loading and splitting for the ACRIMA glaucoma dataset.

Key design decisions:
    1. The existing train/test split is NEVER modified.
    2. Validation is carved out from the EXISTING training set (stratified 80/20).
    3. The test set is completely untouched until final evaluation.
    4. Corrupt images are skipped with a warning (not crash).

Dataset structure on disk:
    dataset/
    ├── train/
    │   ├── Glaucoma/       (326 images)
    │   └── Non Glaucoma/   (239 images)
    └── test/
        ├── Glaucoma/       (70 images)
        └── Non Glaucoma/   (70 images)

Class mapping:
    "Non Glaucoma" → 0 (Normal)
    "Glaucoma"     → 1 (Glaucoma)
"""

import os
from pathlib import Path
from typing import Tuple, List, Optional

import numpy as np
import torch
from PIL import Image
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split

from src.config import (
    TRAIN_DIR, TEST_DIR, CLASS_NAMES, VAL_SPLIT_RATIO,
    BATCH_SIZE, NUM_WORKERS, SEED, IMAGE_SIZE,
)
from src.preprocessing import preprocess_image
from src.augmentation import get_train_augmentation, get_val_test_augmentation


class GlaucomaDataset(Dataset):
    """
    Custom PyTorch Dataset for the ACRIMA retinal fundus dataset.

    Each sample returns:
        - image: Preprocessed and augmented tensor (C, H, W)
        - label: 0 (Non Glaucoma / Normal) or 1 (Glaucoma)
        - filename: Original filename for tracking/logging
    """

    def __init__(
        self,
        image_paths: List[str],
        labels: List[int],
        transform=None,
        preprocess: bool = True,
    ):
        """
        Args:
            image_paths: List of absolute paths to images
            labels: Corresponding integer labels
            transform: Albumentations transform (augmentation + normalization)
            preprocess: Whether to apply CLAHE + median filter
        """
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform
        self.preprocess = preprocess

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        label = self.labels[idx]
        filename = os.path.basename(img_path)

        if self.preprocess:
            # Apply our custom preprocessing (CLAHE + median filter)
            image = preprocess_image(img_path)
        else:
            # Fallback: just read and resize
            import cv2
            image = cv2.imread(str(img_path))
            if image is not None:
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                image = cv2.resize(image, (IMAGE_SIZE, IMAGE_SIZE))

        # Handle corrupt / unreadable images
        if image is None:
            print(f"[WARNING] Skipping corrupt image: {img_path}")
            # Return a black image with correct label rather than crashing
            image = np.zeros((IMAGE_SIZE, IMAGE_SIZE, 3), dtype=np.uint8)

        # Apply augmentation + normalization (Albumentations)
        if self.transform:
            transformed = self.transform(image=image)
            image = transformed["image"]

        return image, label, filename


def collect_image_paths_and_labels(data_dir: Path) -> Tuple[List[str], List[int]]:
    """
    Scan a directory with class subfolders and collect all image paths + labels.

    Folder structure expected:
        data_dir/
        ├── Glaucoma/       → label 1
        └── Non Glaucoma/   → label 0
    """
    image_paths = []
    labels = []
    valid_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}

    for class_idx, class_name in enumerate(CLASS_NAMES):
        class_dir = data_dir / class_name
        if not class_dir.exists():
            print(f"[WARNING] Class directory not found: {class_dir}")
            continue

        for img_file in sorted(class_dir.iterdir()):
            if img_file.suffix.lower() in valid_extensions:
                image_paths.append(str(img_file))
                labels.append(class_idx)

    print(f"[INFO] Found {len(image_paths)} images in {data_dir}")
    for cls_idx, cls_name in enumerate(CLASS_NAMES):
        count = sum(1 for l in labels if l == cls_idx)
        print(f"       Class '{cls_name}' (label={cls_idx}): {count} images")

    return image_paths, labels


def get_data_loaders(
    batch_size: int = BATCH_SIZE,
    num_workers: int = NUM_WORKERS,
) -> Tuple[DataLoader, DataLoader, DataLoader]:
    """
    Create train, validation, and test data loaders.

    Split strategy:
        - Existing train folder → 80% train, 20% validation (stratified)
        - Existing test folder → 100% test (untouched)

    Returns:
        (train_loader, val_loader, test_loader)
    """
    # ---- Collect all training images ----
    train_paths, train_labels = collect_image_paths_and_labels(TRAIN_DIR)

    # ---- Stratified train/val split ----
    # Stratified = maintains the same class ratio in both splits
    train_paths_split, val_paths, train_labels_split, val_labels = train_test_split(
        train_paths,
        train_labels,
        test_size=VAL_SPLIT_RATIO,
        stratify=train_labels,
        random_state=SEED,
    )

    print(f"\n[INFO] Training split: {len(train_paths_split)} images")
    print(f"[INFO] Validation split: {len(val_paths)} images")

    # ---- Collect test images ----
    test_paths, test_labels = collect_image_paths_and_labels(TEST_DIR)
    print(f"[INFO] Test set: {len(test_paths)} images (untouched)")

    # ---- Create datasets with appropriate transforms ----
    train_dataset = GlaucomaDataset(
        train_paths_split, train_labels_split,
        transform=get_train_augmentation(),
        preprocess=True,
    )
    val_dataset = GlaucomaDataset(
        val_paths, val_labels,
        transform=get_val_test_augmentation(),
        preprocess=True,
    )
    test_dataset = GlaucomaDataset(
        test_paths, test_labels,
        transform=get_val_test_augmentation(),
        preprocess=True,
    )

    # ---- Create data loaders ----
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,           # Shuffle training data each epoch
        num_workers=num_workers,
        pin_memory=torch.cuda.is_available(),
        drop_last=False,
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,          # No need to shuffle validation
        num_workers=num_workers,
        pin_memory=torch.cuda.is_available(),
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,          # Never shuffle test data
        num_workers=num_workers,
        pin_memory=torch.cuda.is_available(),
    )

    return train_loader, val_loader, test_loader


def get_train_labels() -> List[int]:
    """
    Get labels from the training split only (for computing class weights).

    This function re-performs the same stratified split to ensure consistency.
    """
    train_paths, train_labels = collect_image_paths_and_labels(TRAIN_DIR)
    train_paths_split, _, train_labels_split, _ = train_test_split(
        train_paths,
        train_labels,
        test_size=VAL_SPLIT_RATIO,
        stratify=train_labels,
        random_state=SEED,
    )
    return train_labels_split
