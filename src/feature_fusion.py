"""
feature_fusion.py — Multi-Scale Feature Fusion (MSFF) module.

This is a CORE RESEARCH CONTRIBUTION of the project.

Purpose:
    Combine the three separate feature maps (F1, F2, F3) from the
    Multi-Scale CNN into a single, rich representation that captures
    information at ALL scales simultaneously.

Architecture:
    F1 (B, 64, 14, 14)  ─┐
    F2 (B, 64, 14, 14)  ─┤── Concatenate along channel dim
    F3 (B, 64, 14, 14)  ─┘
            ↓
    Concatenated: (B, 192, 14, 14)
            ↓
    1×1 Convolution: (B, 192, 14, 14) → (B, embed_dim, 14, 14)
            ↓
    BatchNorm → GELU
            ↓
    Fused Feature Map: (B, embed_dim, 14, 14)

Why concatenation?
    Concatenation preserves ALL information from each branch. Unlike
    addition (which averages features), concatenation keeps the fine
    details from 3×3 AND the broad structures from 7×7 side by side.

Why 1×1 convolution after concatenation?
    After concatenation we have 192 channels (64 × 3). The 1×1 conv
    serves as a learnable projection that:
    1. Reduces dimensionality to match ViT's embedding dimension
    2. Learns which cross-scale feature combinations are most important
    3. Creates a unified representation from multi-scale inputs

    Think of 1×1 conv as a "smart mixer" — it looks at all 192 features
    at each spatial position and decides which combinations matter.

Why this feeds into ViT:
    The fused output (B, embed_dim, 14, 14) has exactly 14×14 = 196
    spatial positions. When reshaped to (B, 196, embed_dim), each
    spatial position becomes a token for the Vision Transformer —
    replacing ViT's standard patch embedding entirely.
"""

import torch
import torch.nn as nn

from src.config import FUSED_CHANNELS, VIT_EMBED_DIM, DROPOUT_RATE


class FeatureFusion(nn.Module):
    """
    Multi-Scale Feature Fusion module.

    Takes three feature maps from the Multi-Scale CNN branches and
    produces a single fused representation compatible with the ViT.

    Input:  F1, F2, F3 — each (B, 64, 14, 14)
    Output: Fused features (B, embed_dim, 14, 14)
    """

    def __init__(self, in_channels: int = FUSED_CHANNELS, out_channels: int = VIT_EMBED_DIM):
        super().__init__()

        # 1×1 Convolution: projects concatenated features to ViT embedding dimension
        # This is a learnable linear combination across channels at each spatial position
        self.projection = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.GELU(),
            nn.Dropout2d(p=DROPOUT_RATE * 0.5),
        )

        # Optional: channel attention to weight the importance of different features
        # This is a Squeeze-and-Excitation style block (lightweight)
        self.channel_attention = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),          # (B, C, 1, 1) — global average
            nn.Flatten(),                      # (B, C)
            nn.Linear(out_channels, out_channels // 4),  # Squeeze
            nn.GELU(),
            nn.Linear(out_channels // 4, out_channels),  # Excite
            nn.Sigmoid(),                      # Attention weights in [0, 1]
        )

    def forward(self, f1, f2, f3):
        """
        Args:
            f1: 3×3 branch features (B, 64, 14, 14) — fine/local
            f2: 5×5 branch features (B, 64, 14, 14) — medium-scale
            f3: 7×7 branch features (B, 64, 14, 14) — large-scale

        Returns:
            fused: (B, embed_dim, 14, 14) — ready for ViT tokenization
        """
        # Step 1: Concatenate along channel dimension
        # (B, 64, 14, 14) × 3 → (B, 192, 14, 14)
        concatenated = torch.cat([f1, f2, f3], dim=1)

        # Step 2: 1×1 projection to ViT embedding dimension
        # (B, 192, 14, 14) → (B, embed_dim, 14, 14)
        fused = self.projection(concatenated)

        # Step 3: Channel attention — learn to weight different features
        # attention_weights: (B, embed_dim)
        attention_weights = self.channel_attention(fused)
        attention_weights = attention_weights.unsqueeze(-1).unsqueeze(-1)  # (B, embed_dim, 1, 1)

        # Apply attention: element-wise multiply
        fused = fused * attention_weights

        return fused
