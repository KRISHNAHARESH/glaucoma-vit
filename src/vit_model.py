"""
vit_model.py — Vision Transformer integration for the hybrid architecture.

This module adapts a pretrained ViT to receive features from our
Multi-Scale CNN + Feature Fusion pipeline instead of raw image patches.

Standard ViT pipeline (what we REPLACE):
    Image (224×224) → Patch Embedding (16×16 patches) → 196 tokens → Transformer

Our hybrid pipeline (what we DO):
    Image → Multi-Scale CNN → Feature Fusion → 196 spatial tokens → Transformer

Key idea:
    The fused feature map (B, embed_dim, 14, 14) already has 14×14 = 196
    spatial positions with embed_dim features each. We simply reshape this
    into a sequence and use it as the input tokens for the Transformer,
    BYPASSING the standard patch embedding entirely.

ViT backbone: vit_tiny_patch16_224 (from timm library)
    - Pretrained on: ImageNet-1K
    - Input resolution: 224×224
    - Patch size: 16×16
    - Embedding dimension: 192
    - Transformer blocks: 12
    - Attention heads: 3
    - Parameters: ~5.7M
    - Why this size: Our dataset has only ~565 images. A larger ViT (e.g.,
      vit_base with 86M params) would severely overfit. vit_tiny is the
      smallest and most appropriate choice.
"""

import torch
import torch.nn as nn
import timm

from src.config import (
    VIT_MODEL_NAME,
    VIT_EMBED_DIM,
    VIT_NUM_PATCHES,
    VIT_PRETRAINED,
    NUM_CLASSES,
    DROPOUT_RATE,
)


class HybridViT(nn.Module):
    """
    Hybrid Vision Transformer that receives fused CNN features as tokens.

    Instead of the standard ViT patch embedding:
        Image → split into 16×16 patches → linear projection → tokens

    We use:
        Fused features (B, embed_dim, 14, 14) → reshape → (B, 196, embed_dim) → tokens

    Architecture:
        Fused Features (B, 192, 14, 14)
            ↓ reshape
        Token Sequence (B, 196, 192)
            ↓ prepend CLS token
        (B, 197, 192)
            ↓ add positional embeddings
        (B, 197, 192)
            ↓ 12× Transformer Encoder blocks
        CLS token output (B, 192)
            ↓ Classification Head
        Logits (B, 2)

    What happens inside each Transformer block:
        Input → LayerNorm → Multi-Head Self-Attention → + Residual
                                                         ↓
                                          LayerNorm → FFN (MLP) → + Residual
                                                                     ↓
                                                                   Output
    """

    def __init__(self, pretrained: bool = VIT_PRETRAINED):
        super().__init__()

        # Load ViT from timm (pretrained only if requested, e.g. for training)
        self.vit = timm.create_model(
            VIT_MODEL_NAME,
            pretrained=pretrained,
            num_classes=0,          # Remove the original classification head
            drop_rate=DROPOUT_RATE,
        )

        # We will NOT use the ViT's built-in patch_embed.
        # Instead, we provide our own tokens from the CNN feature fusion.
        # The CLS token and positional embeddings are still used from the pretrained ViT.

        # Classification head: maps CLS token output → class predictions
        # The ViT's CLS token (after all attention layers) is a 192-dim vector
        # that has aggregated global information from ALL patches.
        self.classification_head = nn.Sequential(
            nn.LayerNorm(VIT_EMBED_DIM),
            nn.Dropout(p=DROPOUT_RATE),
            nn.Linear(VIT_EMBED_DIM, NUM_CLASSES),
        )

    def forward(self, fused_features):
        """
        Args:
            fused_features: Output from FeatureFusion (B, embed_dim, 14, 14)

        Returns:
            logits: Class predictions (B, NUM_CLASSES)
        """
        B = fused_features.shape[0]

        # ---- Step 1: Reshape fused features into token sequence ----
        # (B, embed_dim, 14, 14) → (B, embed_dim, 196) → (B, 196, embed_dim)
        tokens = fused_features.flatten(2).transpose(1, 2)  # (B, 196, 192)

        # ---- Step 2: Prepend CLS token ----
        # The CLS token is a learnable vector that will attend to ALL patches.
        # After the transformer blocks, the CLS token's final state is used
        # for classification because self-attention has forced it to absorb
        # global information from every patch.
        cls_token = self.vit.cls_token.expand(B, -1, -1)  # (B, 1, 192)
        tokens = torch.cat([cls_token, tokens], dim=1)     # (B, 197, 192)

        # ---- Step 3: Add positional embeddings ----
        # Without positional info, the transformer doesn't know WHERE each
        # token came from in the image. Positional embeddings encode the
        # spatial location of each patch.
        tokens = tokens + self.vit.pos_embed  # (B, 197, 192) + (1, 197, 192)

        # ---- Step 4: Apply Transformer Encoder blocks ----
        # Each block contains:
        #   - Multi-Head Self-Attention (MHSA): every token attends to every
        #     other token, learning relationships between distant retinal regions
        #   - Feed-Forward Network (FFN): non-linear transformation
        #   - Residual connections: prevent vanishing gradients
        #   - LayerNorm: stabilize training
        tokens = self.vit.pos_drop(tokens)
        tokens = self.vit.blocks(tokens)     # 12 transformer blocks
        tokens = self.vit.norm(tokens)        # Final layer normalization

        # ---- Step 5: Extract CLS token ----
        # The CLS token (index 0) has now attended to all 196 patch tokens
        # across 12 layers, giving it a holistic understanding of the retina.
        cls_output = tokens[:, 0]  # (B, 192)

        # ---- Step 6: Classification ----
        logits = self.classification_head(cls_output)  # (B, 2)

        return logits
