"""
FastAPI Main Application
Application entry point for the Rubén Fitness Backend API
"""

import os
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import chat, progress, auth, sleep, water, workout, profile, motivation, admin, nutrition
from app.core.config import settings
from app.services.supabase_service import supabase_service

# Initialize FastAPI app
app = FastAPI(
    title="Rubén Fitness API",
    description="AI-powered fitness training platform API",
    version="1.0.0"
)

# Configure CORS to allow frontend requests
# In development, use explicit origins; in production, allow all origins
cors_origins = settings.CORS_ORIGINS

# Check if we're in production
is_production = os.getenv("ENVIRONMENT") == "production" or os.getenv("ENV") == "production"

if is_production:
    # In production, allow all origins for easier deployment
    # This allows requests from any Vercel deployment (production, preview, etc.)
    cors_origins = ["*"]
    print(f"[CORS] Production mode: Allowing all origins")
else:
    print(f"[CORS] Development mode: Allowing origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(chat.router, prefix="/api/v1", tags=["Chat"])
app.include_router(progress.router, prefix="/api/v1", tags=["Progress"])
app.include_router(sleep.router, prefix="/api/v1", tags=["Sleep"])
app.include_router(water.router, prefix="/api/v1", tags=["Water"])
app.include_router(workout.router, prefix="/api/v1", tags=["Workout"])
app.include_router(profile.router, prefix="/api/v1", tags=["Profile"])
app.include_router(motivation.router, prefix="/api/v1", tags=["Motivation"])
app.include_router(nutrition.router, prefix="/api/v1", tags=["Nutrition"])
app.include_router(admin.router, prefix="/api/v1", tags=["Admin"])


@app.get("/")
async def root():
    """Root endpoint health check"""
    return {
        "message": "Rubén Fitness API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/test")
async def test():
    """Test endpoint for debugging and verification"""
    return {
        "status": "ok",
        "message": "Backend is working correctly",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "cors_origins": cors_origins if not is_production else ["*"],
        "supabase_connected": supabase_service.is_connected() if hasattr(supabase_service, 'is_connected') else False,
        "timestamp": datetime.now().isoformat()
    }


