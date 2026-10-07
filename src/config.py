"""
config.py — Central configuration for the Glaucoma-ViT project.

All hyperparameters, paths, and settings are defined here so that
every other module imports from a single source of truth.
"""

import os
import torch
from pathlib import Path

# ============================================================
# PATHS
# ============================================================
# Project root is one level up from src/
PROJECT_ROOT = Path(__file__).resolve().parent.parent

DATASET_DIR = PROJECT_ROOT / "dataset"
TRAIN_DIR = DATASET_DIR / "train"
TEST_DIR = DATASET_DIR / "test"

MODELS_DIR = PROJECT_ROOT / "models"
RESULTS_DIR = PROJECT_ROOT / "results"
GRADCAM_DIR = RESULTS_DIR / "gradcam"

# Create output directories if they don't exist
MODELS_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
GRADCAM_DIR.mkdir(parents=True, exist_ok=True)

BEST_MODEL_PATH = MODELS_DIR / "best_model.pth"
CNN_BASELINE_PATH = MODELS_DIR / "cnn_baseline.pth"
VIT_BASELINE_PATH = MODELS_DIR / "vit_baseline.pth"

# ============================================================
# CLASS MAPPING
# ============================================================
# The ACRIMA dataset uses these folder names
CLASS_NAMES = ["Non Glaucoma", "Glaucoma"]  # index 0 = Normal, index 1 = Glaucoma
NUM_CLASSES = 2

# ============================================================
# IMAGE & PREPROCESSING
# ============================================================
IMAGE_SIZE = 224           # Resize all images to 224×224
NUM_CHANNELS = 3           # RGB

# CLAHE (Contrast Limited Adaptive Histogram Equalization)
CLAHE_CLIP_LIMIT = 2.0     # Limits contrast amplification to avoid noise boost
CLAHE_TILE_SIZE = (8, 8)   # Divides image into 8×8 grid of tiles

# Median filter kernel size (must be odd)
MEDIAN_FILTER_SIZE = 3     # 3×3 window — removes salt-and-pepper noise

# ImageNet normalization (used because ViT is pretrained on ImageNet)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# ============================================================
# DATA SPLITS
# ============================================================
VAL_SPLIT_RATIO = 0.2      # 20% of training data → validation
STRATIFY = True             # Maintain class proportions in splits

# ============================================================
# MODEL ARCHITECTURE
# ============================================================
# Multi-Scale CNN branch channels
CNN_BRANCH_CHANNELS_1 = 32   # First conv layer output channels per branch
CNN_BRANCH_CHANNELS_2 = 64   # Second conv layer output channels per branch
CNN_FEATURE_MAP_SIZE = 14    # Spatial size after adaptive pooling (14×14 = 196 patches)

# Feature Fusion
FUSED_CHANNELS = CNN_BRANCH_CHANNELS_2 * 3  # 64 * 3 = 192 (after concatenation)

# Vision Transformer
VIT_MODEL_NAME = "vit_tiny_patch16_224"  # 5.7M params — suitable for small dataset
VIT_EMBED_DIM = 192          # Embedding dimension of vit_tiny
VIT_PATCH_SIZE = 16
VIT_NUM_PATCHES = (IMAGE_SIZE // VIT_PATCH_SIZE) ** 2  # 196 patches (14×14)
VIT_PRETRAINED = True        # Use ImageNet pretrained weights

# Dropout for regularization
DROPOUT_RATE = 0.3

# ============================================================
# TRAINING HYPERPARAMETERS
# ============================================================
BATCH_SIZE = 16              # Small dataset → smaller batch for better generalization
EPOCHS = 20                  # Practical for CPU training while sufficient for convergence
LEARNING_RATE = 1e-4         # Base learning rate for CNN layers
VIT_LEARNING_RATE = 1e-5     # Lower LR for pretrained ViT layers (fine-tuning)
WEIGHT_DECAY = 1e-4          # AdamW regularization

# Scheduler
SCHEDULER_TYPE = "cosine"    # "cosine" or "plateau"
COSINE_T_MAX = EPOCHS        # CosineAnnealingLR period
PLATEAU_PATIENCE = 5         # ReduceLROnPlateau patience
PLATEAU_FACTOR = 0.5         # ReduceLROnPlateau reduction factor

# Early stopping
EARLY_STOPPING_PATIENCE = 5  # Stop if val loss doesn't improve for 5 epochs

# ============================================================
# REPRODUCIBILITY
# ============================================================
SEED = 42

# ============================================================
# DEVICE
# ============================================================
def get_device():
    """Detect GPU and return appropriate device."""
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"[INFO] Using GPU: {torch.cuda.get_device_name(0)}")
    else:
        device = torch.device("cpu")
        print("[INFO] CUDA not available. Using CPU.")
    return device

DEVICE = get_device()

# Mixed precision is only useful on CUDA
USE_MIXED_PRECISION = torch.cuda.is_available()

# ============================================================
# NUMBER OF DATALOADER WORKERS
# ============================================================
# On Windows, PyTorch DataLoader multiprocessing (workers > 0) causes freeze/re-import bugs
NUM_WORKERS = 0
