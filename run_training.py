"""
run_training.py — Launch full training pipeline.

Handles Windows multiprocessing issues and runs all 3 models.
Run from the project root: python run_training.py
"""
import sys
import os

# Ensure project root is on path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Fix Windows multiprocessing issue with DataLoader
if __name__ == "__main__":
    import multiprocessing
    multiprocessing.freeze_support()

    # Override NUM_WORKERS for Windows compatibility
    import src.config as cfg
    cfg.NUM_WORKERS = 0  # Avoid Windows multiprocessing fork issues

    from src.utils import set_seed
    set_seed()

    print("=" * 60)
    print("  GLAUCOMA-ViT TRAINING PIPELINE")
    print("=" * 60)
    print(f"  Device: {cfg.DEVICE}")
    print(f"  Epochs: {cfg.EPOCHS}")
    print(f"  Batch Size: {cfg.BATCH_SIZE}")
    print(f"  Mixed Precision: {cfg.USE_MIXED_PRECISION}")
    print("=" * 60)

    from src.train import train_model

    # Train all 3 models for comparison
    model_types = ["cnn_baseline", "vit_baseline", "proposed"]

    for model_type in model_types:
        try:
            print(f"\n{'#' * 60}")
            print(f"  TRAINING: {model_type.upper()}")
            print(f"{'#' * 60}")
            train_model(model_type)
        except Exception as e:
            print(f"[ERROR] Training {model_type} failed: {e}")
            import traceback
            traceback.print_exc()

    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE — Running Evaluation")
    print("=" * 60)

    # Evaluate all models
    try:
        from src.evaluate import compare_models
        compare_models()
    except Exception as e:
        print(f"[ERROR] Evaluation failed: {e}")
        import traceback
        traceback.print_exc()

    # Generate Grad-CAM examples
    try:
        from src.gradcam import generate_gradcam_examples
        generate_gradcam_examples()
    except Exception as e:
        print(f"[ERROR] Grad-CAM generation failed: {e}")
        import traceback
        traceback.print_exc()

    print("\n" + "=" * 60)
    print("  ALL DONE!")
    print("  Check: models/ for saved weights")
    print("  Check: results/ for metrics and plots")
    print("  Check: results/gradcam/ for heatmaps")
    print("=" * 60)
