"""
Authentication API Endpoints
Handles user authentication with Supabase Auth
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.services.supabase_service import supabase_service

router = APIRouter()


class LoginRequest(BaseModel):
    """Login request model"""
    email: str
    password: str


class RegisterRequest(BaseModel):
    """Registration request model"""
    email: str
    password: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    fitness_level: Optional[str] = "beginner"


class AuthResponse(BaseModel):
    """Authentication response model"""
    access_token: str
    user: dict
    success: bool


@router.post("/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Login user with email and password
    
    Args:
        request: Login credentials
    
    Returns:
        AuthResponse with access token and user data
    """
    try:
        if not supabase_service.is_connected():
            raise HTTPException(status_code=503, detail="Database not connected")
        
        # Authenticate with Supabase
        result = supabase_service.supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if not result.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Get user data from public.users table
        user_data = supabase_service.get_user(result.user.id)
        if not user_data:
            # User doesn't exist in public.users, create it
            user_data = {
                "id": result.user.id,
                "email": result.user.email,
                "full_name": None,
                "role": "user"
            }
        
        return AuthResponse(
            access_token=result.session.access_token,
            user={
                "id": user_data.get("id"),
                "email": user_data.get("email"),
                "full_name": user_data.get("full_name"),
                "role": user_data.get("role", "user"),
                "fitness_level": user_data.get("fitness_level")
            },
            success=True
        )
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")


@router.post("/auth/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """
    Register a new user
    
    Args:
        request: Registration data
    
    Returns:
        AuthResponse with access token and user data
    """
    try:
        if not supabase_service.is_connected():
            raise HTTPException(status_code=503, detail="Database not connected")
        
        # Create user in Supabase Auth
        result = supabase_service.supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name,
                    "fitness_level": request.fitness_level
                }
            }
        })
        
        if not result.session:
            raise HTTPException(status_code=400, detail="Registration failed")
        
        # Create user in public.users table
        user_data = supabase_service.supabase.table("users").insert({
            "id": result.user.id,
            "email": request.email,
            "full_name": request.full_name,
            "age": request.age,
            "fitness_level": request.fitness_level,
            "role": "user"
        }).execute()
        
        return AuthResponse(
            access_token=result.session.access_token,
            user={
                "id": result.user.id,
                "email": result.user.email,
                "full_name": request.full_name,
                "role": "user",
                "fitness_level": request.fitness_level
            },
            success=True
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")


@router.post("/auth/logout")
async def logout():
    """
    Logout user (invalidate session)
    
    Returns:
        Success message
    """
    try:
        if not supabase_service.is_connected():
            raise HTTPException(status_code=503, detail="Database not connected")
        
        supabase_service.supabase.auth.sign_out()
        
        return {"success": True, "message": "Logged out successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")


@router.get("/auth/session")
async def get_session():
    """
    Get current user session
    
    Returns:
        Current user data or null
    """
    try:
        if not supabase_service.is_connected():
            raise HTTPException(status_code=503, detail="Database not connected")
        
        user = supabase_service.supabase.auth.get_user()
        
        if not user:
            return {"user": None}
        
        # Get user data from public.users table
        user_data = supabase_service.get_user(user.user.id)
        
        return {
            "user": user_data if user_data else {
                "id": user.user.id,
                "email": user.user.email,
                "role": "user"
            }
        }
    
    except Exception as e:
        return {"user": None}

