"""
model.py — Complete model definitions for all three experiments.

This file defines three models:
    1. GlaucomaViT (PROPOSED): Multi-Scale CNN → Feature Fusion → ViT
    2. CNNBaseline: Multi-Scale CNN → Global Avg Pool → FC Head
    3. ViTBaseline: Standard ViT (vit_tiny_patch16_224) without our CNN

The proposed GlaucomaViT is the core research contribution.
The baselines exist ONLY for comparison to show that the hybrid approach
is superior to either CNN-only or ViT-only.
"""

import torch
import torch.nn as nn
import timm

from src.config import (
    NUM_CLASSES, VIT_EMBED_DIM, CNN_BRANCH_CHANNELS_2,
    CNN_FEATURE_MAP_SIZE, VIT_MODEL_NAME, VIT_PRETRAINED,
    DROPOUT_RATE,
)
from src.multiscale_cnn import MultiScaleCNN
from src.feature_fusion import FeatureFusion
from src.vit_model import HybridViT


class GlaucomaViT(nn.Module):
    """
    PROPOSED ARCHITECTURE: Multi-Scale CNN + Feature Fusion + Vision Transformer.

    Complete pipeline:
        Input: Retinal Fundus Image (B, 3, 224, 224)
            ↓
        Multi-Scale CNN:
            ├── 3×3 branch → F1 (B, 64, 14, 14) [fine features]
            ├── 5×5 branch → F2 (B, 64, 14, 14) [medium features]
            └── 7×7 branch → F3 (B, 64, 14, 14) [large features]
            ↓
        Feature Fusion:
            Concat(F1, F2, F3) → (B, 192, 14, 14)
            → 1×1 Conv Projection → (B, 192, 14, 14)
            → Channel Attention
            ↓
        Vision Transformer:
            Reshape → (B, 196, 192) tokens
            + CLS token → (B, 197, 192)
            + Positional Embeddings
            → 12× Transformer Encoder Blocks
            → CLS token output (B, 192)
            ↓
        Classification Head:
            LayerNorm → Dropout → Linear → (B, 2)
            ↓
        Output: [Normal_logit, Glaucoma_logit]

    Why this architecture works:
        - CNN captures local retinal textures and structures at multiple scales
        - Feature fusion combines all scale information into a rich representation
        - ViT captures global context: how the optic disc relates to distant vessels
        - Together, they understand BOTH local pathology AND global anatomy
    """

    def __init__(self):
        super().__init__()
        self.multiscale_cnn = MultiScaleCNN()
        self.feature_fusion = FeatureFusion()
        self.vit = HybridViT()

    def forward(self, x):
        """
        Args:
            x: Input image tensor (B, 3, 224, 224)

        Returns:
            logits: Class predictions (B, 2)
        """
        # Step 1: Multi-Scale Feature Extraction
        f1, f2, f3 = self.multiscale_cnn(x)

        # Step 2: Feature Fusion
        fused = self.feature_fusion(f1, f2, f3)

        # Step 3: Vision Transformer Classification
        logits = self.vit(fused)

        return logits

    def get_fusion_layer(self):
        """Return the fusion projection layer for Grad-CAM hooking."""
        return self.feature_fusion.projection


class CNNBaseline(nn.Module):
    """
    BASELINE 1: CNN-only (no Transformer).

    Uses the same Multi-Scale CNN and Feature Fusion, but replaces the
    ViT with a simple Global Average Pooling + Fully Connected head.

    Purpose: Show what the CNN alone can achieve. We expect the proposed
    GlaucomaViT to outperform this because it adds global context via attention.
    """

    def __init__(self):
        super().__init__()
        self.multiscale_cnn = MultiScaleCNN()
        self.feature_fusion = FeatureFusion()

        # Replace ViT with simple pooling + FC
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),        # (B, embed_dim, 1, 1)
            nn.Flatten(),                    # (B, embed_dim)
            nn.LayerNorm(VIT_EMBED_DIM),
            nn.Dropout(p=DROPOUT_RATE),
            nn.Linear(VIT_EMBED_DIM, NUM_CLASSES),
        )

    def forward(self, x):
        f1, f2, f3 = self.multiscale_cnn(x)
        fused = self.feature_fusion(f1, f2, f3)
        logits = self.classifier(fused)
        return logits

    def get_fusion_layer(self):
        return self.feature_fusion.projection


class ViTBaseline(nn.Module):
    """
    BASELINE 2: Standard ViT-only (no custom CNN front-end).

    Uses the standard vit_tiny_patch16_224 with its built-in patch embedding.
    The image goes directly into ViT without our multi-scale CNN.

    Purpose: Show what ViT alone can achieve. We expect it to underperform
    the proposed model because it lacks the multi-scale local feature extraction.
    """

    def __init__(self):
        super().__init__()
        self.vit = timm.create_model(
            VIT_MODEL_NAME,
            pretrained=VIT_PRETRAINED,
            num_classes=NUM_CLASSES,
            drop_rate=DROPOUT_RATE,
        )

    def forward(self, x):
        return self.vit(x)

    def get_fusion_layer(self):
        """For Grad-CAM: use the patch embedding projection as the target layer."""
        return self.vit.patch_embed.proj


def get_model(model_type: str = "proposed") -> nn.Module:
    """
    Factory function to create a model by name.

    Args:
        model_type: One of "proposed", "cnn_baseline", "vit_baseline"

    Returns:
        nn.Module instance
    """
    models = {
        "proposed": GlaucomaViT,
        "cnn_baseline": CNNBaseline,
        "vit_baseline": ViTBaseline,
    }
    if model_type not in models:
        raise ValueError(f"Unknown model type: {model_type}. Choose from {list(models.keys())}")

    model = models[model_type]()
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"\n[INFO] Model: {model_type}")
    print(f"[INFO] Total parameters: {total_params:,}")
    print(f"[INFO] Trainable parameters: {trainable_params:,}")

    return model
