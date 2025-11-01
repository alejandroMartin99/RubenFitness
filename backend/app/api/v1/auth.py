"""
Authentication API Endpoints
Handles user authentication with Supabase Auth
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.supabase_service import supabase_service

router = APIRouter()

# Mock users storage (in-memory for development)
_mock_users_storage: Dict[str, Dict[str, Any]] = {
    "admin@ruben.fitness": {"password": "admin", "role": "admin", "full_name": "Admin", "fitness_level": "advanced"},
    "tester@ruben.fitness": {"password": "tester", "role": "user", "full_name": "Tester", "fitness_level": "intermediate"}
}


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
            # Fallback to mock authentication
            return await _mock_login(request)
        
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
        error_msg = str(e)
        # Provide user-friendly error messages
        if "email not confirmed" in error_msg.lower():
            raise HTTPException(
                status_code=401, 
                detail="Email no confirmado. Por favor confirma tu email o desactiva 'Confirm email' en Supabase Dashboard > Authentication > Email"
            )
        elif "invalid" in error_msg.lower() and "credentials" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        else:
            raise HTTPException(status_code=401, detail=f"Login failed: {error_msg}")


async def _mock_login(request: LoginRequest) -> AuthResponse:
    """Mock login for development when Supabase is not connected"""
    user = _mock_users_storage.get(request.email)
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return AuthResponse(
        access_token="mock_token_" + request.email,
        user={
            "id": "mock_" + request.email.replace("@", "_"),
            "email": request.email,
            "full_name": user["full_name"],
            "role": user["role"],
            "fitness_level": user.get("fitness_level", "intermediate")
        },
        success=True
    )


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
            # Fallback to mock registration
            return await _mock_register(request)
        
        # Create user in Supabase Auth
        try:
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
        except Exception as signup_err:
            # Check if user already exists
            error_str = str(signup_err).lower()
            if "already" in error_str or "exists" in error_str:
                raise HTTPException(status_code=400, detail="Usuario ya existe")
            elif "rate limit" in error_str or "seconds" in error_str:
                raise HTTPException(status_code=429, detail="Espera unos segundos antes de intentar de nuevo")
            else:
                raise HTTPException(status_code=400, detail=f"Error al registrar: {signup_err}")
        
        # Supabase with email confirmation returns session=None
        # We still get the user object
        if not result.user:
            raise HTTPException(status_code=400, detail="Registration failed: No user created")
        
        # Create user in public.users table
        try:
            user_data = supabase_service.supabase.table("users").insert({
                "id": result.user.id,
                "email": request.email,
                "full_name": request.full_name,
                "age": request.age,
                "fitness_level": request.fitness_level,
                "role": "user"
            }).execute()
        except Exception as insert_err:
            # If insert fails, it might be due to RLS or duplicate
            print(f"Warning: Could not insert into public.users: {insert_err}")
        
        # Return response - use mock token if no session
        access_token = result.session.access_token if result.session else f"supabase_token_{request.email}"
        
        return AuthResponse(
            access_token=access_token,
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
        error_msg = str(e)
        # Check for common error messages
        if "already registered" in error_msg.lower() or "user already exists" in error_msg.lower():
            raise HTTPException(status_code=400, detail="Usuario ya existe")
        elif "email" in error_msg.lower() and "invalid" in error_msg.lower():
            raise HTTPException(status_code=400, detail="Email inválido")
        else:
            raise HTTPException(status_code=400, detail=f"Registration failed: {error_msg}")


async def _mock_register(request: RegisterRequest) -> AuthResponse:
    """Mock registration for development"""
    # Check if user already exists
    if request.email in _mock_users_storage:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Add user to mock storage
    _mock_users_storage[request.email] = {
        "password": request.password,
        "role": "user",
        "full_name": request.full_name,
        "fitness_level": request.fitness_level or "beginner"
    }
    
    return AuthResponse(
        access_token="mock_token_" + request.email,
        user={
            "id": "mock_" + request.email.replace("@", "_"),
            "email": request.email,
            "full_name": request.full_name,
            "role": "user",
            "fitness_level": request.fitness_level
        },
        success=True
    )


@router.post("/auth/logout")
async def logout():
    """
    Logout user (invalidate session)
    
    Returns:
        Success message
    """
    try:
        if not supabase_service.is_connected():
            return {"success": True, "message": "Logged out successfully (mock)"}
        
        supabase_service.supabase.auth.sign_out()
        
        return {"success": True, "message": "Logged out successfully"}
    
    except Exception as e:
        return {"success": True, "message": "Logged out (may have failed)"}


@router.get("/auth/session")
async def get_session():
    """
    Get current user session
    
    Returns:
        Current user data or null
    """
    try:
        if not supabase_service.is_connected():
            return {"user": None, "message": "Mock mode"}
        
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

