import os
os.environ["NO_ALBUMENTATIONS_UPDATE"] = "1"
import sys
import shutil
import uuid
import base64
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
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
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user),
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
        
        pred_id = None
        created_time = datetime.utcnow()
        if current_user:
            # Save prediction to database for authenticated user
            db_prediction = models.Prediction(
                user_id=current_user.id,
                image_filename=unique_filename,
                prediction=result["prediction"],
                confidence=result["confidence"]
            )
            db.add(db_prediction)
            db.commit()
            db.refresh(db_prediction)
            pred_id = db_prediction.id
            created_time = db_prediction.created_at
            
        return schemas.PredictionResponse(
            id=pred_id,
            prediction=result["prediction"],
            confidence=result["confidence"],
            probabilities=result.get("probabilities", {}),
            heatmap=result.get("heatmap"),
            overlay=result.get("overlay"),
            created_at=created_time
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

# ============================================================
# Serve React Frontend SPA (Built in frontend/dist)
# ============================================================
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")

if os.path.exists(frontend_dist) and os.path.exists(os.path.join(frontend_dist, "index.html")):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_frontend_root():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        target = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/", response_class=HTMLResponse)
    def serve_fallback_root():
        return """<!DOCTYPE html>
<html>
<head><title>Glaucoma-ViT Backend API</title></head>
<body style="font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:40px;">
  <h2>Glaucoma-ViT Backend API Online</h2>
  <p><a href="/docs" style="color:#38bdf8;">Swagger Interactive API Docs</a></p>
  <p><a href="/health" style="color:#34d399;">Health Status</a></p>
</body>
</html>"""
