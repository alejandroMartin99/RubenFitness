"""
Motivation API Endpoints
Handles motivational messages, achievements, and positive reinforcement
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app.services.openai_service import openai_service
from app.services.supabase_service import supabase_service

router = APIRouter()


class MotivationRequest(BaseModel):
    """Request for motivational message"""
    user_id: str


class MotivationResponse(BaseModel):
    """Response with motivational message"""
    message: str
    timestamp: datetime


@router.post("/motivation/message", response_model=MotivationResponse)
async def get_motivational_message(request: MotivationRequest):
    """
    Get a personalized motivational message from AI
    
    Args:
        request: Motivation request with user_id
    
    Returns:
        MotivationResponse with AI-generated motivational message
    """
    try:
        # Get user's progress data for context
        user = supabase_service.get_user(request.user_id)
        progress_summary = supabase_service.get_progress_summary(request.user_id)
        
        # Get streak information
        streak_data = None
        try:
            streak_result = supabase_service.supabase.table("streaks")\
                .select("*")\
                .eq("user_id", request.user_id)\
                .single()\
                .execute()
            if streak_result.data:
                streak_data = streak_result.data
        except:
            pass
        
        # Build context for AI
        context = {
            "user_name": user.get("full_name", "there") if user else "there",
            "total_workouts": progress_summary.get("total_workouts", 0),
            "current_streak": progress_summary.get("current_streak", 0),
            "longest_streak": streak_data.get("longest_streak", 0) if streak_data else 0
        }
        
        # Generate motivational message with OpenAI
        prompt = f"""Generate a short, personalized motivational message for a fitness app user.

User context:
- Name: {context['user_name']}
- Total workouts completed: {context['total_workouts']}
- Current streak: {context['current_streak']} days
- Longest streak: {context['longest_streak']} days

Generate an encouraging, positive message (2-3 sentences max) that:
- Acknowledges their progress
- Motivates them to continue
- Is warm and supportive
- Uses emojis appropriately (1-2 max)

Message:"""
        
        try:
            ai_response = openai_service.get_chat_response(
                [{"role": "user", "content": prompt}],
                user_context={"user_id": request.user_id}
            )
            message = ai_response.strip()
        except Exception as e:
            print(f"Error getting AI response: {e}")
            # Fallback messages
            fallback_messages = [
                f"Keep going, {context['user_name']}! Every workout brings you closer to your goals! 💪",
                f"You're doing amazing, {context['user_name']}! {context['current_streak']} days strong! 🔥",
                f"Progress is progress, {context['user_name']}! Keep pushing forward! ⚡",
                f"Your consistency is inspiring, {context['user_name']}! Keep it up! 🌟"
            ]
            import random
            message = random.choice(fallback_messages)
        
        return MotivationResponse(
            message=message,
            timestamp=datetime.utcnow()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating motivational message: {str(e)}")


@router.post("/motivation/check-achievements")
async def check_achievements(request: MotivationRequest):
    """
    Check and unlock achievements automatically based on user progress
    This should be called after recording a workout
    
    Args:
        user_id: User identifier
    
    Returns:
        List of newly unlocked achievements
    """
    try:
        user_id = request.user_id
        # Get user progress
        progress_summary = supabase_service.get_progress_summary(user_id)
        total_workouts = progress_summary.get("total_workouts", 0)
        current_streak = progress_summary.get("current_streak", 0)
        
        # Get existing achievements
        existing_achievements = supabase_service.supabase.table("achievements")\
            .select("type")\
            .eq("user_id", user_id)\
            .execute()
        
        existing_types = [a["type"] for a in (existing_achievements.data or [])]
        newly_unlocked = []
        
        # Check for first workout achievement
        if total_workouts >= 1 and "first_workout" not in existing_types:
            achievement = supabase_service.supabase.table("achievements").insert({
                "user_id": user_id,
                "type": "first_workout",
                "title": "First Steps",
                "description": "Completed your first workout!",
                "icon": "star"
            }).execute()
            if achievement.data:
                newly_unlocked.append(achievement.data[0])
        
        # Check for week streak
        if current_streak >= 7 and "week_streak" not in existing_types:
            achievement = supabase_service.supabase.table("achievements").insert({
                "user_id": user_id,
                "type": "week_streak",
                "title": "Week Warrior",
                "description": "7 days in a row!",
                "icon": "local_fire_department"
            }).execute()
            if achievement.data:
                newly_unlocked.append(achievement.data[0])
        
        # Check for month streak
        if current_streak >= 30 and "month_streak" not in existing_types:
            achievement = supabase_service.supabase.table("achievements").insert({
                "user_id": user_id,
                "type": "month_streak",
                "title": "Month Master",
                "description": "30 days in a row!",
                "icon": "whatshot"
            }).execute()
            if achievement.data:
                newly_unlocked.append(achievement.data[0])
        
        # Check for total workouts milestones
        if total_workouts >= 10 and "total_workouts_10" not in existing_types:
            achievement = supabase_service.supabase.table("achievements").insert({
                "user_id": user_id,
                "type": "total_workouts",
                "title": "10 Workouts",
                "description": "Completed 10 workouts!",
                "icon": "fitness_center",
                "progress": total_workouts,
                "target": 10
            }).execute()
            if achievement.data:
                newly_unlocked.append(achievement.data[0])
        
        return {
            "newly_unlocked": newly_unlocked,
            "count": len(newly_unlocked)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking achievements: {str(e)}")

