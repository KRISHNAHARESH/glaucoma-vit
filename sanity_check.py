"""Quick 2-epoch sanity check to verify training pipeline works."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import src.config as cfg
    cfg.NUM_WORKERS = 0
    cfg.EPOCHS = 2
    cfg.EARLY_STOPPING_PATIENCE = 100

    from src.utils import set_seed
    set_seed()

    from src.train import train_model
    history = train_model("proposed")

    print("\n=== SANITY CHECK RESULTS ===")
    for i, (tl, ta, vl, va) in enumerate(zip(
        history["train_loss"], history["train_acc"],
        history["val_loss"], history["val_acc"]
    )):
        print(f"  Epoch {i+1}: train_loss={tl:.4f} train_acc={ta:.4f} val_loss={vl:.4f} val_acc={va:.4f}")
    print("=== SANITY CHECK PASSED ===")
