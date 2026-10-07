"""
multiscale_cnn.py — Multi-Scale CNN for retinal feature extraction.

This is a CORE RESEARCH CONTRIBUTION of the project.

Architecture:
    Three parallel convolution branches process the input simultaneously:

    Branch 1 (3×3 kernel):
        Captures FINE/LOCAL features — thin blood vessels, micro-hemorrhages,
        small nerve fiber details. The small receptive field detects edges
        and subtle texture patterns.

    Branch 2 (5×5 kernel):
        Captures MEDIUM-SCALE features — vessel bifurcations, small regions
        of hemorrhage, medium structural patterns in the retina.

    Branch 3 (7×7 kernel):
        Captures LARGE-SCALE / GLOBAL features — optic disc shape, cup
        boundaries, large-scale cupping patterns that indicate glaucoma.

Why multi-scale?
    Glaucoma manifests at multiple scales:
    - Microscopic: nerve fiber layer thinning (fine detail)
    - Mesoscopic: blood vessel pattern changes (medium detail)
    - Macroscopic: optic disc cupping (large structural change)
    A single kernel size would miss features at other scales.

Each branch outputs a feature map F_i, which will be fused in feature_fusion.py.
"""

import torch
import torch.nn as nn

from src.config import (
    CNN_BRANCH_CHANNELS_1,
    CNN_BRANCH_CHANNELS_2,
    CNN_FEATURE_MAP_SIZE,
    DROPOUT_RATE,
    NUM_CHANNELS,
)


class ConvBlock(nn.Module):
    """
    A single convolution block: Conv2d → BatchNorm → GELU → Dropout.

    Why BatchNorm?
        Normalizes the output of each layer to have zero mean and unit variance.
        This stabilizes training and allows higher learning rates.

    Why GELU instead of ReLU?
        GELU (Gaussian Error Linear Unit) is the standard activation in
        Transformers and modern architectures. Unlike ReLU which has a hard
        cutoff at zero, GELU has a smooth curve that can pass small negative
        values, leading to better gradient flow.
    """

    def __init__(self, in_channels: int, out_channels: int, kernel_size: int):
        super().__init__()
        # padding = kernel_size // 2 ensures output spatial size = input spatial size
        # e.g., 3×3 kernel → padding=1, 5×5 → padding=2, 7×7 → padding=3
        padding = kernel_size // 2

        self.block = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size, padding=padding, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.GELU(),
            nn.Dropout2d(p=DROPOUT_RATE * 0.5),  # Light dropout in conv layers
        )

    def forward(self, x):
        return self.block(x)


class CNNBranch(nn.Module):
    """
    A single branch of the Multi-Scale CNN.

    Architecture:
        Input (B, 3, 224, 224)
            ↓
        Conv1: (B, 3, 224, 224) → (B, 32, 224, 224)
            ↓
        Conv2: (B, 32, 224, 224) → (B, 64, 224, 224)
            ↓
        AdaptiveAvgPool: (B, 64, 224, 224) → (B, 64, 14, 14)

    The AdaptiveAvgPool2d reduces spatial dimensions to 14×14 to match
    the ViT patch grid (224 / 16 = 14). This creates exactly 196 spatial
    positions that map 1-to-1 with ViT patch tokens.
    """

    def __init__(self, kernel_size: int):
        super().__init__()
        self.branch = nn.Sequential(
            ConvBlock(NUM_CHANNELS, CNN_BRANCH_CHANNELS_1, kernel_size),
            ConvBlock(CNN_BRANCH_CHANNELS_1, CNN_BRANCH_CHANNELS_2, kernel_size),
            nn.AdaptiveAvgPool2d(CNN_FEATURE_MAP_SIZE),
        )

    def forward(self, x):
        return self.branch(x)


class MultiScaleCNN(nn.Module):
    """
    Multi-Scale CNN with three parallel branches (3×3, 5×5, 7×7).

    Input:  (B, 3, 224, 224) — preprocessed retinal fundus image
    Output: F1, F2, F3 — three feature maps, each (B, 64, 14, 14)

    The three branches run IN PARALLEL on the same input image.
    Each branch sees the same image but detects different-scale features.

    Example visualization:
        Same eye image → 3×3 branch sees thin vessels
                       → 5×5 branch sees medium structures
                       → 7×7 branch sees the whole optic disc shape
    """

    def __init__(self):
        super().__init__()
        self.branch_3x3 = CNNBranch(kernel_size=3)
        self.branch_5x5 = CNNBranch(kernel_size=5)
        self.branch_7x7 = CNNBranch(kernel_size=7)

    def forward(self, x):
        """
        Args:
            x: Input tensor (B, 3, 224, 224)

        Returns:
            f1: Fine features from 3×3 branch (B, 64, 14, 14)
            f2: Medium features from 5×5 branch (B, 64, 14, 14)
            f3: Large features from 7×7 branch (B, 64, 14, 14)
        """
        f1 = self.branch_3x3(x)   # Local / fine features
        f2 = self.branch_5x5(x)   # Medium-scale features
        f3 = self.branch_7x7(x)   # Large-scale features
        return f1, f2, f3
