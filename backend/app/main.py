"""
FastAPI Main Application
Application entry point for the Rubén Fitness Backend API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import chat, progress
from app.core.config import settings

# Initialize FastAPI app
app = FastAPI(
    title="Rubén Fitness API",
    description="AI-powered fitness training platform API",
    version="1.0.0"
)

# Configure CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/v1", tags=["Chat"])
app.include_router(progress.router, prefix="/api/v1", tags=["Progress"])


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


