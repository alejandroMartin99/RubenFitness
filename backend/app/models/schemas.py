"""
Pydantic Models for API Requests and Responses
Defines data structures for all API endpoints
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date


# User Models
class UserCreate(BaseModel):
    """User creation request"""
    email: str
    full_name: str
    password: str
    role: Optional[str] = "user"
    fitness_level: Optional[str] = None
    age: Optional[int] = None


class UserResponse(BaseModel):
    """User response model"""
    id: str
    email: str
    full_name: str
    role: str
    fitness_level: Optional[str] = None
    age: Optional[int] = None
    created_at: datetime


# Chat Models
class ChatMessage(BaseModel):
    """Chat message model"""
    user_id: str
    message: str
    role: str  # 'user' or 'assistant'
    created_at: datetime


class ChatRequest(BaseModel):
    """Chat request model"""
    user_id: str
    message: str
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    """Chat response model"""
    message: str
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


# Sleep Models
class SleepRecord(BaseModel):
    """Individual sleep record"""
    date: date
    hours: float
    minutes: Optional[int] = None


class SleepRequest(BaseModel):
    """Sleep tracking request"""
    user_id: str
    date: date
    hours: float = Field(..., ge=0, le=24, description="Hours of sleep (0-24)")
    minutes: Optional[int] = Field(None, ge=0, le=59, description="Additional minutes (0-59)")


class SleepResponse(BaseModel):
    """Sleep tracking response"""
    user_id: str
    today_sleep: Optional[SleepRecord] = None
    last_7_days: List[SleepRecord] = []
    average_sleep: Optional[float] = None
    created_at: datetime


# Water Models
class WaterRecord(BaseModel):
    """Individual water record"""
    date: date
    water_ml: int


class WaterRequest(BaseModel):
    """Water tracking request"""
    user_id: str
    date: date
    water_ml: int = Field(..., ge=0, description="Water in milliliters")


class WaterResponse(BaseModel):
    """Water tracking response"""
    user_id: str
    today_water: Optional[WaterRecord] = None
    last_7_days: List[WaterRecord] = []
    total_today: int = 0
    goal: int = 2000
    created_at: datetime


# Workout Models
class WorkoutRequest(BaseModel):
    """Workout day tracking request"""
    user_id: str
    date: date


class WorkoutResponse(BaseModel):
    """Workout days response"""
    user_id: str
    workout_days: List[str] = []  # List of dates (YYYY-MM-DD) that have workouts
    month: int
    year: int
    success: bool


# Health Status
class HealthStatus(BaseModel):
    """Health check response"""
    status: str
    database: str
    openai: str

# Chat Conversations (sessions)
class ConversationCreateRequest(BaseModel):
    user_id: str
    title: Optional[str] = None

class ConversationUpdateRequest(BaseModel):
    title: str

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime

class ConversationsListResponse(BaseModel):
    conversations: List[ConversationResponse]
