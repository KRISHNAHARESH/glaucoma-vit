import os
os.environ["NO_ALBUMENTATIONS_UPDATE"] = "1"
import sys
import shutil
import uuid
import base64
from typing import List
from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Add project root to path for src imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from . import models, schemas, auth
from .database import engine, get_db

app = FastAPI(title="Glaucoma-ViT Backend API", version="1.0.0")

# Setup CORS (Allow localhost, Vercel deployments, and external domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global predictor instance
predictor = None
last_model_mtime = None

def get_predictor():
    global predictor, last_model_mtime
    model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "best_model.pth")
    if os.path.exists(model_path):
        mtime = os.path.getmtime(model_path)
        if predictor is None or last_model_mtime != mtime:
            try:
                import gc
                import torch
                torch.set_num_threads(1)
                from src.predict import GlaucomaPredictor
                predictor = GlaucomaPredictor(model_path=model_path)
                last_model_mtime = mtime
                gc.collect()
                print(f"Predictor loaded/updated with latest checkpoint (mtime: {mtime}).")
            except Exception as e:
                print(f"Error loading predictor: {e}")
    return predictor

@app.on_event("startup")
def startup_event():
    # Only initialize database tables at startup to keep memory minimal (~50MB) and boot instant
    models.Base.metadata.create_all(bind=engine)

@app.get("/", response_class=HTMLResponse)
def root():
    return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Glaucoma-ViT Detection API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px; max-width: 520px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
    .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; }
    h1 { font-size: 24px; margin-bottom: 12px; color: #ffffff; letter-spacing: -0.5px; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 28px; }
    .links { display: flex; flex-direction: column; gap: 12px; }
    .btn { display: block; text-align: center; text-decoration: none; padding: 13px 20px; border-radius: 10px; font-weight: 500; font-size: 14px; transition: all 0.15s ease; }
    .btn-primary { background: #2563eb; color: #ffffff; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary { background: #334155; color: #cbd5e1; }
    .btn-secondary:hover { background: #475569; }
    .meta { margin-top: 28px; padding-top: 18px; border-top: 1px solid #334155; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span>Backend API Online</div>
    <h1>Glaucoma-ViT Detection API</h1>
    <p>The FastAPI cloud backend for glaucoma detection with Multi-Scale CNN &amp; Vision Transformer feature fusion is running successfully.</p>
    <div class="links">
      <a href="/docs" class="btn btn-primary">Open Interactive API Docs (Swagger UI) &rarr;</a>
      <a href="/health" class="btn btn-secondary">Check Health Endpoint (JSON)</a>
    </div>
    <div class="meta">Glaucoma-ViT v1.0.0 &bull; Deployed on Render</div>
  </div>
</body>
</html>"""

@app.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "message": "Glaucoma-ViT backend is running"}

@app.post("/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name, 
        email=user.email, 
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not auth.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/predict", response_model=schemas.PredictionResponse)
def predict_image(
    file: UploadFile = File(...), 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a retinal fundus image and get glaucoma prediction with Grad-CAM.
    
    Uses actual model inference via src.predict.GlaucomaPredictor.
    Returns prediction, confidence, and base64-encoded heatmap/overlay images.
    """
    active_predictor = get_predictor()
    if active_predictor is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="Model is not trained or loaded yet. Please wait for training to complete."
        )
    
    # Save uploaded file temporarily
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    if not ext:
        ext = ".jpg"
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Run actual model inference with Grad-CAM
        # predict_to_json returns JSON-serializable dict with base64 images
        result = active_predictor.predict_to_json(image_path=file_path)
        
        # Save prediction to database
        db_prediction = models.Prediction(
            user_id=current_user.id,
            image_filename=unique_filename,
            prediction=result["prediction"],
            confidence=result["confidence"]
        )
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
            
        return schemas.PredictionResponse(
            id=db_prediction.id,
            prediction=result["prediction"],
            confidence=result["confidence"],
            probabilities=result.get("probabilities", {}),
            heatmap=result.get("heatmap"),
            overlay=result.get("overlay"),
            created_at=db_prediction.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")
    finally:
        # Clean up temp file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass

@app.get("/history", response_model=List[schemas.HistoryResponse])
def get_history(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Get prediction history for the authenticated user."""
    history = db.query(models.Prediction).filter(models.Prediction.user_id == current_user.id).order_by(models.Prediction.created_at.desc()).all()
    return history
