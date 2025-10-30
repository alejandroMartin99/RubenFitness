"""
Application Configuration
Centralized configuration management using Pydantic Settings
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "Rubén Fitness API"
    DEBUG: bool = False
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:4200", "http://localhost:3000"]
    
    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = ""
    
    # Firebase Configuration
    FIREBASE_CREDENTIALS_PATH: str = ""
    
    # Database (if needed separately)
    DATABASE_URL: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()


