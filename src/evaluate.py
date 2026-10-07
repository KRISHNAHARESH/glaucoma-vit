"""
evaluate.py — Evaluation and visualization for the trained models.

Evaluates ONLY on the untouched test set (140 images).
Generates all required plots and metrics.

All metrics are computed from actual model inference — NEVER fabricated.

Usage:
    python -m src.evaluate                        # Evaluate proposed model
    python -m src.evaluate --model all            # Evaluate all + comparison
"""

import argparse
import json
from pathlib import Path

import numpy as np
import torch
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, roc_curve, auc

from src.config import (
    DEVICE, BEST_MODEL_PATH, CNN_BASELINE_PATH, VIT_BASELINE_PATH,
    RESULTS_DIR, CLASS_NAMES, NUM_CLASSES,
)
from src.utils import set_seed, compute_all_metrics
from src.dataset import get_data_loaders
from src.model import get_model


@torch.no_grad()
def evaluate_model(model, test_loader, device):
    """
    Run inference on the test set and collect predictions.

    Returns:
        y_true: Ground truth labels
        y_pred: Predicted labels
        y_prob: Predicted probabilities for the Glaucoma class
    """
    model.eval()
    y_true, y_pred, y_prob = [], [], []

    for images, labels, _ in test_loader:
        images = images.to(device)
        outputs = model(images)

        # Softmax converts raw logits to probabilities
        probs = torch.softmax(outputs, dim=1)
        _, predicted = outputs.max(1)

        y_true.extend(labels.cpu().numpy())
        y_pred.extend(predicted.cpu().numpy())
        y_prob.extend(probs[:, 1].cpu().numpy())  # Probability of Glaucoma class

    return y_true, y_pred, y_prob


def plot_confusion_matrix(y_true, y_pred, save_path: Path, model_name: str = ""):
    """
    Generate and save a confusion matrix heatmap.

    The confusion matrix shows:
        TN (top-left): Correctly identified Normal eyes
        FP (top-right): Normal eyes wrongly flagged as Glaucoma
        FN (bottom-left): Glaucoma eyes MISSED (DANGEROUS in medicine!)
        TP (bottom-right): Correctly caught Glaucoma
    """
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES,
        annot_kws={"size": 16},
    )
    plt.xlabel("Predicted Label", fontsize=13)
    plt.ylabel("True Label", fontsize=13)
    title = f"Confusion Matrix"
    if model_name:
        title += f" — {model_name}"
    plt.title(title, fontsize=15)
    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"[INFO] Confusion matrix saved: {save_path}")


def plot_roc_curve(y_true, y_prob, save_path: Path, model_name: str = ""):
    """
    Generate and save the ROC curve.

    ROC (Receiver Operating Characteristic) plots:
        X-axis: False Positive Rate (1 - Specificity)
        Y-axis: True Positive Rate (Sensitivity / Recall)

    AUC (Area Under the Curve):
        - 1.0 = perfect separation between Normal and Glaucoma
        - 0.5 = random guessing (the diagonal line)
    """
    fpr, tpr, _ = roc_curve(y_true, y_prob)
    roc_auc = auc(fpr, tpr)

    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color="darkorange", lw=2, label=f"ROC Curve (AUC = {roc_auc:.4f})")
    plt.plot([0, 1], [0, 1], color="navy", lw=1, linestyle="--", label="Random Classifier")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate (1 - Specificity)", fontsize=13)
    plt.ylabel("True Positive Rate (Sensitivity)", fontsize=13)
    title = "ROC Curve"
    if model_name:
        title += f" — {model_name}"
    plt.title(title, fontsize=15)
    plt.legend(loc="lower right", fontsize=12)
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"[INFO] ROC curve saved: {save_path}")


def plot_training_curves(history: dict, save_dir: Path, model_name: str = ""):
    """
    Plot training/validation accuracy and loss curves.

    These curves show:
        - Whether the model is learning (loss goes down)
        - Whether the model is overfitting (val loss goes up while train loss goes down)
        - When early stopping triggered (the curve ends before max epochs)
    """
    epochs = range(1, len(history["train_loss"]) + 1)

    # ---- Loss Curve ----
    plt.figure(figsize=(10, 5))
    plt.plot(epochs, history["train_loss"], "b-", label="Training Loss", linewidth=2)
    plt.plot(epochs, history["val_loss"], "r-", label="Validation Loss", linewidth=2)
    plt.xlabel("Epoch", fontsize=13)
    plt.ylabel("Loss", fontsize=13)
    title = "Training & Validation Loss"
    if model_name:
        title += f" — {model_name}"
    plt.title(title, fontsize=15)
    plt.legend(fontsize=12)
    plt.grid(alpha=0.3)
    plt.tight_layout()
    loss_path = save_dir / "loss_curve.png"
    plt.savefig(loss_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"[INFO] Loss curve saved: {loss_path}")

    # ---- Accuracy Curve ----
    plt.figure(figsize=(10, 5))
    plt.plot(epochs, history["train_acc"], "b-", label="Training Accuracy", linewidth=2)
    plt.plot(epochs, history["val_acc"], "r-", label="Validation Accuracy", linewidth=2)
    plt.xlabel("Epoch", fontsize=13)
    plt.ylabel("Accuracy", fontsize=13)
    title = "Training & Validation Accuracy"
    if model_name:
        title += f" — {model_name}"
    plt.title(title, fontsize=15)
    plt.legend(fontsize=12)
    plt.grid(alpha=0.3)
    plt.tight_layout()
    acc_path = save_dir / "accuracy_curve.png"
    plt.savefig(acc_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"[INFO] Accuracy curve saved: {acc_path}")


def evaluate_and_save(model_type: str = "proposed"):
    """Full evaluation pipeline for a single model."""
    set_seed()

    # ---- Load model ----
    model = get_model(model_type)
    save_paths = {
        "proposed": BEST_MODEL_PATH,
        "cnn_baseline": CNN_BASELINE_PATH,
        "vit_baseline": VIT_BASELINE_PATH,
    }
    checkpoint_path = save_paths[model_type]

    if not checkpoint_path.exists():
        print(f"[ERROR] No checkpoint found at {checkpoint_path}. Train the model first.")
        return None

    checkpoint = torch.load(checkpoint_path, map_location=DEVICE, weights_only=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model = model.to(DEVICE)
    print(f"[INFO] Loaded {model_type} from epoch {checkpoint.get('epoch', '?')}")

    # ---- Get test data ----
    _, _, test_loader = get_data_loaders()

    # ---- Evaluate ----
    y_true, y_pred, y_prob = evaluate_model(model, test_loader, DEVICE)

    # ---- Compute metrics ----
    metrics = compute_all_metrics(y_true, y_pred, y_prob)
    metrics["model_type"] = model_type

    print(f"\n{'='*40}")
    print(f"  Results: {model_type.upper()}")
    print(f"{'='*40}")
    for key, value in metrics.items():
        if key != "confusion_matrix":
            print(f"  {key:>15}: {value:.4f}" if isinstance(value, float) else f"  {key:>15}: {value}")

    # ---- Save metrics ----
    metrics_path = RESULTS_DIR / "metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"\n[INFO] Metrics saved: {metrics_path}")

    # ---- Generate plots ----
    plot_confusion_matrix(y_true, y_pred, RESULTS_DIR / "confusion_matrix.png", model_type)
    plot_roc_curve(y_true, y_prob, RESULTS_DIR / "roc_curve.png", model_type)

    # ---- Plot training curves if history exists ----
    history_path = RESULTS_DIR / f"{model_type}_history.json"
    if history_path.exists():
        with open(history_path) as f:
            history = json.load(f)
        plot_training_curves(history, RESULTS_DIR, model_type)

    return metrics


def compare_models():
    """
    Evaluate all three models and create a comparison CSV.

    Saves: results/model_comparison.csv
    """
    import pandas as pd

    all_metrics = []
    for model_type in ["cnn_baseline", "vit_baseline", "proposed"]:
        metrics = evaluate_and_save(model_type)
        if metrics:
            flat = {k: v for k, v in metrics.items() if k != "confusion_matrix"}
            flat.update(metrics.get("confusion_matrix", {}))
            all_metrics.append(flat)

    if all_metrics:
        df = pd.DataFrame(all_metrics)
        csv_path = RESULTS_DIR / "model_comparison.csv"
        df.to_csv(csv_path, index=False)
        print(f"\n[INFO] Model comparison saved: {csv_path}")
        print("\n" + df.to_string(index=False))


def main():
    parser = argparse.ArgumentParser(description="Evaluate Glaucoma Detection Models")
    parser.add_argument(
        "--model", type=str, default="proposed",
        choices=["proposed", "cnn_baseline", "vit_baseline", "all"],
    )
    args = parser.parse_args()

    if args.model == "all":
        compare_models()
    else:
        evaluate_and_save(args.model)


if __name__ == "__main__":
    main()
