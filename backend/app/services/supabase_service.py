"""
Supabase Service
Wrapper for Supabase database operations (users, workouts, progress)
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
import re
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
    
    def _is_valid_uuid(self, uuid_string: str) -> bool:
        """Validate UUID format"""
        uuid_pattern = re.compile(
            r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            re.IGNORECASE
        )
        return bool(uuid_pattern.match(uuid_string))
    
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
        
        # Validate UUID format
        if not self._is_valid_uuid(user_id):
            print(f"Warning: Invalid user_id format: {user_id}. Skipping database save.")
            return None
        
        # Check if user exists in database before saving
        user_exists = self.get_user(user_id) is not None
        if not user_exists:
            # For mock users, we'll skip saving to avoid foreign key errors
            # The chat will still work, messages just won't be persisted
            print(f"Info: User {user_id} not found in database. Chat will work but messages won't be saved.")
            return None
        
        try:
            # Supabase will automatically set created_at with DEFAULT NOW()
            result = self.supabase.table("chat_messages").insert({
                "user_id": user_id,
                "role": role,
                "content": content
            }).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            # Check if it's a foreign key constraint error
            error_str = str(e)
            if 'foreign key constraint' in error_str.lower() or '23503' in error_str:
                print(f"Info: User {user_id} not found in database. Skipping message save.")
            else:
                print(f"Error saving chat message: {e}")
            return None
    
    def get_chat_history(self, user_id: str, limit: int = 10) -> List[ChatMessage]:
        """Get user's chat history"""
        if not self.is_connected():
            return []
        
        # Validate UUID format
        if not self._is_valid_uuid(user_id):
            print(f"Warning: Invalid user_id format: {user_id}. Returning empty history.")
            return []
        
        # Check if user exists in database
        user_exists = self.get_user(user_id) is not None
        if not user_exists:
            # For mock users, return empty history
            return []
        
        try:
            result = self.supabase.table("chat_messages")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            messages = []
            if result.data:
                for msg in reversed(result.data):
                    # Handle created_at field (could be ISO string or None)
                    timestamp = None
                    if msg.get("created_at"):
                        try:
                            if isinstance(msg["created_at"], str):
                                # Handle different ISO formats from Supabase
                                date_str = msg["created_at"]
                                # Replace Z with +00:00 for UTC
                                if date_str.endswith('Z'):
                                    date_str = date_str.replace('Z', '+00:00')
                                # Parse ISO format
                                timestamp = datetime.fromisoformat(date_str)
                            elif isinstance(msg["created_at"], datetime):
                                timestamp = msg["created_at"]
                            else:
                                # Fallback to current time
                                timestamp = datetime.utcnow()
                        except (ValueError, AttributeError) as e:
                            print(f"Error parsing timestamp: {e}")
                            timestamp = datetime.utcnow()
                    else:
                        # If no created_at, use current time
                        timestamp = datetime.utcnow()
                    
                    messages.append(ChatMessage(
                        role=msg.get("role", "user"),
                        content=msg.get("content", ""),
                        timestamp=timestamp
                    ))
            
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


