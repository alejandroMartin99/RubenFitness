"""
Pydantic Schemas
Data validation and serialization models for API requests/responses
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# User Models
class UserBase(BaseModel):
    """Base user model"""
    email: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    fitness_level: Optional[str] = None  # beginner, intermediate, advanced


class UserCreate(UserBase):
    """User creation model"""
    password: str


class UserResponse(UserBase):
    """User response model"""
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Chat Models
class ChatMessage(BaseModel):
    """Individual chat message"""
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Chat API request model"""
    user_id: str = Field(..., description="User identifier")
    message: str = Field(..., description="User's message to the AI assistant")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")


class ChatResponse(BaseModel):
    """Chat API response model"""
    message: str = Field(..., description="AI assistant response")
    user_id: str
    timestamp: datetime


# Progress Models
class WorkoutRecord(BaseModel):
    """Individual workout record"""
    workout_id: str
    name: str
    completed: bool
    duration_minutes: Optional[int] = None
    date: datetime


class ProgressRequest(BaseModel):
    """Progress tracking request"""
    user_id: str
    workout_id: str
    date: datetime
    notes: Optional[str] = None


class ProgressResponse(BaseModel):
    """Progress tracking response"""
    user_id: str
    total_workouts: int
    current_streak: int
    recent_workouts: List[WorkoutRecord]
    created_at: datetime


# Health Status
class HealthStatus(BaseModel):
    """Health check response"""
    status: str
    database: str
    openai: str


