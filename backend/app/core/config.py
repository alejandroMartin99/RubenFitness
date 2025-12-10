"""
Application Configuration
Centralized configuration management using Pydantic Settings
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    model_config = SettingsConfigDict(
        env_file="../.env",  # .env está en la raíz del proyecto
        case_sensitive=True,
        extra="ignore"
    )
    
    # Application
    APP_NAME: str = "Rubén Fitness API"
    DEBUG: bool = False
    
    # CORS - defaults (can be overridden by environment variable)
    # In production, this will be overridden to ["*"] in main.py
    # You can also set CORS_ORIGINS environment variable as comma-separated list
    CORS_ORIGINS: List[str] = [
        "http://localhost:4200",
        "http://localhost:3000",
        "https://ruben-fitness.vercel.app",
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ]
    
    # Supabase Configuration
    SUPABASE_URL: str = "https://nymrsnhnzcagvwwnkyno.supabase.co"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bXJzbmhuemNhZ3Z3d25reW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkzMjc2NiwiZXhwIjoyMDc3NTA4NzY2fQ.ged_tdZwochk2HsYKlrIr2_ZLNERaclBrTvYzrXNrxs"
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = ""
    
    # Firebase Configuration
    FIREBASE_CREDENTIALS_PATH: str = ""
    
    # Database (if needed separately)
    DATABASE_URL: str = ""


# Global settings instance
settings = Settings()


