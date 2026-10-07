# Multi-Scale Feature Fusion with Vision Transformers for Robust Glaucoma Detection from Retinal Fundus Images

## Abstract

This project presents a hybrid deep learning architecture for automated glaucoma detection from retinal fundus images. The proposed system combines **Multi-Scale Convolutional Neural Networks (CNN)** with a **Vision Transformer (ViT)** to capture both local retinal structures and global spatial context. Three parallel CNN branches using 3×3, 5×5, and 7×7 convolution kernels extract features at different scales, which are fused and fed into a Vision Transformer for classification. The system also incorporates **Grad-CAM** for visual explainability, providing heatmap overlays that highlight the regions influencing the model's predictions.

> **⚠️ Medical Disclaimer**: This system is developed for academic and research purposes only. It is not a medical diagnostic tool and should not replace evaluation by a qualified eye-care professional.

---

## Problem Statement

Glaucoma is a leading cause of irreversible blindness, affecting over 80 million people worldwide. Early detection through retinal examination is critical, but manual screening is time-consuming, subjective, and requires expert ophthalmologists. Automated AI-based systems can assist in faster, more consistent screening.

## Objectives

1. Develop a multi-scale CNN to extract retinal features at fine, medium, and large scales
2. Implement feature fusion to combine multi-scale representations
3. Integrate a Vision Transformer for global context understanding
4. Achieve robust binary classification (Normal vs. Glaucoma)
5. Provide visual explainability using Grad-CAM
6. Build a web application for practical demonstration

---

## Dataset

**ACRIMA** (Annotated Retinal Images for Glaucoma Analysis)

| Split | Glaucoma | Non Glaucoma | Total |
|-------|----------|--------------|-------|
| Train | 326 | 239 | 565 |
| Test | 70 | 70 | 140 |
| **Total** | **396** | **309** | **705** |

- Format: JPEG fundus images
- The existing train/test split is preserved
- Validation set: 20% stratified split from training data (~113 images)
- Test set: Completely untouched (140 images)

### Dataset Structure

```
dataset/
├── train/
│   ├── Glaucoma/       (326 images)
│   └── Non Glaucoma/   (239 images)
└── test/
    ├── Glaucoma/       (70 images)
    └── Non Glaucoma/   (70 images)
```

---

## Preprocessing Pipeline

1. **Read Image**: Load retinal fundus image (OpenCV BGR)
2. **RGB Conversion**: Convert BGR → RGB
3. **Resize**: Standardize to 224×224 pixels
4. **CLAHE**: Contrast Limited Adaptive Histogram Equalization on green channel (clip_limit=2.0, tile=8×8)
5. **Median Filter**: 3×3 kernel for salt-and-pepper noise removal
6. **Normalization**: ImageNet mean/std normalization for pretrained ViT compatibility

---

## Multi-Scale CNN Architecture

Three parallel convolution branches process the preprocessed image simultaneously:

| Branch | Kernel Size | Purpose |
|--------|-------------|---------|
| Branch 1 | 3×3 | Fine/local features (thin blood vessels, micro-details) |
| Branch 2 | 5×5 | Medium-scale features (vessel bifurcations, hemorrhages) |
| Branch 3 | 7×7 | Large-scale features (optic disc shape, cup boundaries) |

Each branch: `Conv → BN → GELU → Conv → BN → GELU → AdaptiveAvgPool(14×14)`

Output: F1, F2, F3 — three feature maps of shape (B, 64, 14, 14)

---

## Feature Fusion (MSFF)

```
F1 (B, 64, 14, 14)  ─┐
F2 (B, 64, 14, 14)  ─┤── Concat → (B, 192, 14, 14)
F3 (B, 64, 14, 14)  ─┘
        ↓
1×1 Conv Projection → (B, 192, 14, 14)
        ↓
Channel Attention (SE-style)
        ↓
Fused Features → Vision Transformer
```

---

## Vision Transformer

**Backbone**: `vit_tiny_patch16_224` (from timm library)
- Pretrained on: ImageNet-1K
- Embedding dimension: 192
- Transformer blocks: 12
- Attention heads: 3
- Parameters: ~5.7M

The fused CNN features replace the ViT's standard patch embedding:
- Fused map (B, 192, 14, 14) → reshape → (B, 196, 192) tokens
- CLS token prepended + positional embeddings added
- 12× Transformer encoder blocks with Multi-Head Self-Attention
- CLS token → Classification Head → [Normal, Glaucoma]

---

## Training Methodology

| Parameter | Value |
|-----------|-------|
| Optimizer | AdamW |
| CNN Learning Rate | 1e-4 |
| ViT Learning Rate | 1e-5 (fine-tuning) |
| Batch Size | 16 |
| Max Epochs | 100 |
| Scheduler | CosineAnnealingLR |
| Loss Function | Weighted CrossEntropyLoss |
| Early Stopping | Patience = 15 |
| Mixed Precision | Enabled (if CUDA available) |

---

## Evaluation Metrics

- Accuracy, Precision, Recall/Sensitivity, Specificity, F1-score, ROC-AUC
- Confusion Matrix visualization
- ROC Curve visualization
- Training/Validation loss and accuracy curves

---

## Grad-CAM Explainability

Gradient-weighted Class Activation Mapping provides visual heatmaps showing which retinal regions influenced the model's prediction. The heatmap is generated from the feature fusion layer's 1×1 projection.

- **Red/Yellow**: Regions of high importance
- **Blue/Green**: Regions of low importance

---

## Model Comparison

Three models are trained and evaluated on the same data:

| Model | Description |
|-------|-------------|
| CNN Baseline | Multi-Scale CNN + Global Avg Pool + FC Head |
| ViT Baseline | Standard vit_tiny_patch16_224 |
| **Proposed** | **Multi-Scale CNN + Feature Fusion + ViT** |

---

## Backend Architecture

**Framework**: FastAPI

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/auth/register` | POST | User registration |
| `/auth/login` | POST | JWT authentication |
| `/predict` | POST | Upload image → prediction + Grad-CAM |
| `/history` | GET | Prediction history |

**Authentication**: JWT with bcrypt password hashing
**Database**: MySQL (with SQLite fallback)

---

## Frontend Architecture

**Stack**: React + Tailwind CSS (via Vite)

Pages: Landing, Login, Signup, Dashboard, Analyze, History, About

---

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL Server (optional, SQLite fallback available)

### Setup

```bash
# Clone repository
git clone <repository-url>
cd Glaucoma-ViT

# Python environment
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt

# Frontend
cd frontend
npm install
cd ..

# Environment variables
copy .env.example .env
# Edit .env with your MySQL credentials
```

### Model Training

```bash
# Train the proposed model
python -m src.train --model proposed

# Train all models for comparison
python -m src.train --model all
```

### Model Evaluation

```bash
# Evaluate proposed model
python -m src.evaluate --model proposed

# Evaluate all models + comparison
python -m src.evaluate --model all
```

### Generate Grad-CAM

```bash
python -m src.gradcam
```

### Running the Backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Running the Frontend

```bash
cd frontend
npm run dev
```

---

## Project Structure

```
Glaucoma-ViT/
├── dataset/                    # ACRIMA dataset (not in git)
├── src/                        # ML pipeline
│   ├── config.py               # Central configuration
│   ├── preprocessing.py        # CLAHE + median filter
│   ├── augmentation.py         # Training augmentations
│   ├── dataset.py              # Data loading + splitting
│   ├── multiscale_cnn.py       # 3×3, 5×5, 7×7 branches
│   ├── feature_fusion.py       # MSFF + channel attention
│   ├── vit_model.py            # Hybrid ViT adapter
│   ├── model.py                # Complete model definitions
│   ├── train.py                # Training loop
│   ├── evaluate.py             # Metrics + visualization
│   ├── gradcam.py              # Grad-CAM explainability
│   ├── predict.py              # Single-image prediction
│   └── utils.py                # Utilities
├── backend/                    # FastAPI server
├── frontend/                   # React application
├── models/                     # Saved model weights
├── results/                    # Evaluation outputs
├── requirements.txt
├── README.md
└── .gitignore
```

---

## Limitations

1. Dataset size is relatively small (~705 images)
2. Single dataset evaluation (ACRIMA only)
3. Grad-CAM shows where the model looked, not clinical correctness
4. System not validated for clinical diagnostic use
5. Performance may vary across different fundus camera types

## Future Scope

1. Multi-dataset evaluation (ORIGA, REFUGE, RIM-ONE)
2. Multi-class grading (early, moderate, advanced glaucoma)
3. Optic disc/cup segmentation integration
4. Federated learning for privacy-preserving training
5. Mobile application deployment
6. Clinical validation studies

---

## Medical Disclaimer

**This system is developed for academic and research purposes only. It is not a medical diagnostic tool and should not replace evaluation by a qualified eye-care professional. Do not use this system for clinical diagnosis.**
