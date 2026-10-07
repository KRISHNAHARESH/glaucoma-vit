"""
train.py — Training pipeline for all three model variants.

Training strategy:
    - Optimizer: AdamW (Adam with weight decay — better generalization)
    - Differential learning rates: CNN layers get higher LR (1e-4) because
      they are trained from scratch; ViT layers get lower LR (1e-5) because
      they are fine-tuned from pretrained ImageNet weights.
    - Scheduler: CosineAnnealingLR (smoothly reduces LR following a cosine curve)
    - Loss: Weighted CrossEntropyLoss (handles class imbalance)
    - Early stopping: Halts if val loss doesn't improve for 15 epochs
    - Mixed precision: Uses float16 on GPU for 2× speed (if CUDA available)
    - Checkpointing: Saves the model with the best validation loss

Usage:
    python -m src.train                    # Train proposed model
    python -m src.train --model cnn_baseline  # Train CNN baseline
    python -m src.train --model vit_baseline  # Train ViT baseline
    python -m src.train --model all           # Train all three
"""

import argparse
import json
import time
from pathlib import Path

import torch
import torch.nn as nn
from torch.cuda.amp import GradScaler, autocast

from src.config import (
    DEVICE, EPOCHS, LEARNING_RATE, VIT_LEARNING_RATE, WEIGHT_DECAY,
    COSINE_T_MAX, EARLY_STOPPING_PATIENCE, BEST_MODEL_PATH,
    CNN_BASELINE_PATH, VIT_BASELINE_PATH, RESULTS_DIR,
    USE_MIXED_PRECISION,
)
from src.utils import set_seed, compute_class_weights, EarlyStopping
from src.dataset import get_data_loaders, get_train_labels
from src.model import get_model


def get_optimizer(model, model_type: str):
    """
    Create AdamW optimizer with differential learning rates.

    For the proposed model:
        - CNN parameters (multiscale_cnn, feature_fusion): LR = 1e-4
          These are trained from scratch, so they need a higher LR.
        - ViT parameters: LR = 1e-5
          These are pretrained on ImageNet, so we fine-tune gently.

    For baselines: single learning rate.
    """
    if model_type == "proposed":
        # Separate CNN and ViT parameters
        cnn_params = []
        vit_params = []
        for name, param in model.named_parameters():
            if "vit" in name:
                vit_params.append(param)
            else:
                cnn_params.append(param)

        optimizer = torch.optim.AdamW([
            {"params": cnn_params, "lr": LEARNING_RATE},
            {"params": vit_params, "lr": VIT_LEARNING_RATE},
        ], weight_decay=WEIGHT_DECAY)
    else:
        optimizer = torch.optim.AdamW(
            model.parameters(),
            lr=LEARNING_RATE if model_type == "cnn_baseline" else VIT_LEARNING_RATE,
            weight_decay=WEIGHT_DECAY,
        )

    return optimizer


def train_one_epoch(model, loader, criterion, optimizer, scaler, device):
    """Train for one epoch. Returns average loss and accuracy."""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for batch_idx, (images, labels, _) in enumerate(loader):
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        # Mixed precision forward pass (faster on GPU)
        if USE_MIXED_PRECISION:
            with autocast():
                outputs = model(images)
                loss = criterion(outputs, labels)
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
        else:
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        correct += predicted.eq(labels).sum().item()
        total += labels.size(0)

        if (batch_idx + 1) % 5 == 0 or (batch_idx + 1) == len(loader):
            print(f"  Batch [{batch_idx+1}/{len(loader)}] Loss: {loss.item():.4f} Running Acc: {correct/total:.4f}", flush=True)

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc


@torch.no_grad()
def validate(model, loader, criterion, device):
    """Validate the model. Returns average loss and accuracy."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels, _ in loader:
        images = images.to(device)
        labels = labels.to(device)

        outputs = model(images)
        loss = criterion(outputs, labels)

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        correct += predicted.eq(labels).sum().item()
        total += labels.size(0)

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc


def train_model(model_type: str = "proposed"):
    """
    Full training loop for a single model variant.

    Args:
        model_type: "proposed", "cnn_baseline", or "vit_baseline"

    Returns:
        Dictionary with training history
    """
    set_seed()
    print(f"\n{'='*60}")
    print(f"  Training: {model_type.upper()}")
    print(f"{'='*60}")

    # ---- Data ----
    train_loader, val_loader, _ = get_data_loaders()

    # ---- Model ----
    model = get_model(model_type)
    model = model.to(DEVICE)

    # ---- Loss function with class weights ----
    train_labels = get_train_labels()
    class_weights = compute_class_weights(train_labels).to(DEVICE)
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    print(f"[INFO] Using Weighted CrossEntropyLoss: {class_weights.tolist()}")

    # ---- Optimizer ----
    optimizer = get_optimizer(model, model_type)

    # ---- Scheduler ----
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=COSINE_T_MAX
    )

    # ---- Mixed precision scaler ----
    scaler = GradScaler() if USE_MIXED_PRECISION else None

    # ---- Early stopping ----
    early_stopping = EarlyStopping(patience=EARLY_STOPPING_PATIENCE)

    # ---- Checkpoint path ----
    save_paths = {
        "proposed": BEST_MODEL_PATH,
        "cnn_baseline": CNN_BASELINE_PATH,
        "vit_baseline": VIT_BASELINE_PATH,
    }
    save_path = save_paths[model_type]

    # ---- Training history ----
    history = {
        "train_loss": [],
        "val_loss": [],
        "train_acc": [],
        "val_acc": [],
    }

    best_val_loss = float("inf")
    start_time = time.time()

    for epoch in range(1, EPOCHS + 1):
        epoch_start = time.time()

        # Train
        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, scaler, DEVICE
        )

        # Validate
        val_loss, val_acc = validate(model, val_loader, criterion, DEVICE)

        # Step scheduler
        scheduler.step()

        # Record history
        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["train_acc"].append(train_acc)
        history["val_acc"].append(val_acc)

        epoch_time = time.time() - epoch_start
        current_lr = optimizer.param_groups[0]["lr"]

        print(
            f"Epoch [{epoch}/{EPOCHS}] "
            f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | "
            f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f} | "
            f"LR: {current_lr:.2e} | Time: {epoch_time:.1f}s",
            flush=True
        )

        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_loss": val_loss,
                "val_acc": val_acc,
                "model_type": model_type,
            }, save_path)
            print(f"  [OK] Best model saved (val_loss: {val_loss:.4f})", flush=True)

        # Early stopping check
        if early_stopping(val_loss):
            print(f"\n[INFO] Early stopping at epoch {epoch}")
            break

    total_time = time.time() - start_time
    print(f"\n[INFO] Training completed in {total_time/60:.1f} minutes")
    print(f"[INFO] Best validation loss: {best_val_loss:.4f}")
    print(f"[INFO] Model saved to: {save_path}")

    # Save training history
    history_path = RESULTS_DIR / f"{model_type}_history.json"
    with open(history_path, "w") as f:
        json.dump(history, f, indent=2)
    print(f"[INFO] Training history saved to: {history_path}")

    return history


def main():
    parser = argparse.ArgumentParser(description="Train Glaucoma Detection Models")
    parser.add_argument(
        "--model", type=str, default="proposed",
        choices=["proposed", "cnn_baseline", "vit_baseline", "all"],
        help="Which model to train"
    )
    args = parser.parse_args()

    if args.model == "all":
        histories = {}
        for model_type in ["cnn_baseline", "vit_baseline", "proposed"]:
            histories[model_type] = train_model(model_type)
    else:
        train_model(args.model)


if __name__ == "__main__":
    main()
