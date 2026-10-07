"""
utils.py — Utility functions for reproducibility, metric computation, and visualization.
"""

import os
import random
import numpy as np
import torch
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve
)

from src.config import SEED


def set_seed(seed: int = SEED):
    """
    Set random seeds for complete reproducibility across all libraries.

    Why: Neural network training involves many random operations (weight init,
    data shuffling, dropout). Fixing seeds ensures the same results every run.
    """
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    # Deterministic algorithms (may slightly reduce speed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
    os.environ["PYTHONHASHSEED"] = str(seed)
    print(f"[INFO] Random seed set to {seed}")


def compute_all_metrics(y_true, y_pred, y_prob):
    """
    Compute all evaluation metrics for binary classification.

    Args:
        y_true: Ground truth labels (0 or 1)
        y_pred: Predicted labels (0 or 1)
        y_prob: Predicted probabilities for the positive class (Glaucoma)

    Returns:
        Dictionary of all metrics

    Metrics explained:
        - Accuracy:    (TP + TN) / Total — overall correctness
        - Precision:   TP / (TP + FP) — "of predicted Glaucoma, how many truly are?"
        - Recall/Sensitivity: TP / (TP + FN) — "of actual Glaucoma, how many caught?"
        - Specificity:  TN / (TN + FP) — "of actual Normal, how many correctly cleared?"
        - F1-score:    Harmonic mean of Precision and Recall
        - ROC-AUC:     Area under the ROC curve (1.0 = perfect separation)
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    y_prob = np.array(y_prob)

    # Confusion matrix: [[TN, FP], [FN, TP]]
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()

    metrics = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),  # = Sensitivity
        "sensitivity": float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0,
        "specificity": float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0,
        "f1_score": float(f1_score(y_true, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_true, y_prob)),
        "confusion_matrix": {
            "TP": int(tp),
            "TN": int(tn),
            "FP": int(fp),
            "FN": int(fn),
        },
    }
    return metrics


def compute_class_weights(labels):
    """
    Compute inverse-frequency class weights for handling imbalanced data.

    In our ACRIMA dataset, there are ~326 Glaucoma vs ~239 Normal images in
    training. Without weighting, the model would bias toward the majority class.

    Formula: weight_i = total_samples / (num_classes * count_i)
    Example: weight_normal = 565 / (2 * 239) ≈ 1.18
             weight_glaucoma = 565 / (2 * 326) ≈ 0.87
    """
    labels = np.array(labels)
    unique_classes = np.unique(labels)
    total = len(labels)
    num_classes = len(unique_classes)

    weights = []
    for cls in sorted(unique_classes):
        count = np.sum(labels == cls)
        weight = total / (num_classes * count)
        weights.append(weight)
        print(f"[INFO] Class {cls}: count={count}, weight={weight:.4f}")

    return torch.FloatTensor(weights)


class EarlyStopping:
    """
    Stop training when validation loss stops improving.

    Why: Prevents overfitting by halting training when the model starts
    memorizing training data instead of learning generalizable patterns.

    How: Tracks the best validation loss. If it doesn't improve for
    `patience` consecutive epochs, training stops.
    """

    def __init__(self, patience: int = 15, min_delta: float = 1e-4):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = None
        self.should_stop = False

    def __call__(self, val_loss):
        if self.best_loss is None:
            self.best_loss = val_loss
        elif val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.should_stop = True
                print(f"[INFO] Early stopping triggered after {self.patience} epochs without improvement.")
        return self.should_stop
