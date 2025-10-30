"""
Supabase Service
Wrapper for Supabase database operations (users, workouts, progress)
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from supabase import create_client, Client
from app.core.config import settings
from app.models.schemas import UserCreate, UserResponse, ChatMessage


class SupabaseService:
    """Service for managing Supabase database operations"""
    
    def __init__(self):
        """Initialize Supabase client"""
        self.supabase: Optional[Client] = None
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                self.supabase = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_KEY
                )
            except Exception as e:
                print(f"Warning: Could not initialize Supabase client: {e}")
    
    def is_connected(self) -> bool:
        """Check if Supabase is connected"""
        return self.supabase is not None
    
    # User Operations
    def create_user(self, user_data: UserCreate) -> Optional[Dict[str, Any]]:
        """Create a new user in the database"""
        if not self.is_connected():
            return None
        
        try:
            result = self.supabase.table("users").insert({
                "email": user_data.email,
                "full_name": user_data.full_name,
                "age": user_data.age,
                "fitness_level": user_data.fitness_level
            }).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating user: {e}")
            return None
    
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        if not self.is_connected():
            return None
        
        try:
            result = self.supabase.table("users").select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
    
    # Chat Operations
    def save_chat_message(
        self, 
        user_id: str, 
        role: str, 
        content: str
    ) -> Optional[Dict[str, Any]]:
        """Save a chat message to the database"""
        if not self.is_connected():
            return None
        
        try:
            result = self.supabase.table("chat_messages").insert({
                "user_id": user_id,
                "role": role,
                "content": content,
                "timestamp": datetime.utcnow().isoformat()
            }).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error saving chat message: {e}")
            return None
    
    def get_chat_history(self, user_id: str, limit: int = 10) -> List[ChatMessage]:
        """Get user's chat history"""
        if not self.is_connected():
            return []
        
        try:
            result = self.supabase.table("chat_messages")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("timestamp", desc=True)\
                .limit(limit)\
                .execute()
            
            messages = [
                ChatMessage(
                    role=msg["role"],
                    content=msg["content"],
                    timestamp=datetime.fromisoformat(msg["timestamp"])
                ) for msg in reversed(result.data)
            ] if result.data else []
            
            return messages
        except Exception as e:
            print(f"Error getting chat history: {e}")
            return []
    
    # Progress Operations
    def save_progress(
        self, 
        user_id: str, 
        workout_id: str, 
        date: datetime, 
        notes: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Save workout progress to the database"""
        if not self.is_connected():
            return None
        
        try:
            result = self.supabase.table("progress").insert({
                "user_id": user_id,
                "workout_id": workout_id,
                "date": date.isoformat(),
                "notes": notes
            }).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error saving progress: {e}")
            return None
    
    def get_progress_summary(self, user_id: str) -> Dict[str, Any]:
        """Get user's progress summary"""
        if not self.is_connected():
            return self._get_mock_progress(user_id)
        
        try:
            # Get total workouts
            workouts_result = self.supabase.table("progress")\
                .select("*", count="exact")\
                .eq("user_id", user_id)\
                .execute()
            
            total_workouts = workouts_result.count if workouts_result.count else 0
            
            # Get recent workouts
            recent_result = self.supabase.table("progress")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("date", desc=True)\
                .limit(10)\
                .execute()
            
            recent_workouts = recent_result.data if recent_result.data else []
            
            return {
                "user_id": user_id,
                "total_workouts": total_workouts,
                "current_streak": self._calculate_streak(user_id),
                "recent_workouts": recent_workouts
            }
        except Exception as e:
            print(f"Error getting progress summary: {e}")
            return self._get_mock_progress(user_id)
    
    def _calculate_streak(self, user_id: str) -> int:
        """Calculate current workout streak (simplified)"""
        # This is a simplified implementation
        # In production, you'd calculate based on consecutive workout days
        return 3  # Mock value
    
    def _get_mock_progress(self, user_id: str) -> Dict[str, Any]:
        """Return mock progress data for development"""
        return {
            "user_id": user_id,
            "total_workouts": 5,
            "current_streak": 3,
            "recent_workouts": [
                {
                    "workout_id": "1",
                    "name": "Upper Body Strength",
                    "date": datetime.utcnow().isoformat()
                }
            ]
        }


# Global instance
supabase_service = SupabaseService()


