from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List, Dict, Any

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str

    @validator("confirm_password")
    def passwords_match(cls, v, values, **kwargs):
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class PredictionResponse(BaseModel):
    id: Optional[int] = None
    prediction: str
    confidence: float
    probabilities: Dict[str, float]
    heatmap: Optional[str] = None
    overlay: Optional[str] = None
    created_at: Optional[datetime] = None
    disclaimer: str = "This is an AI-assisted prediction and should not replace professional medical advice. Please consult an ophthalmologist for a definitive diagnosis."

    class Config:
        from_attributes = True

class HistoryResponse(BaseModel):
    id: int
    image_filename: str
    prediction: str
    confidence: float
    created_at: datetime

    class Config:
        from_attributes = True
