"""
Progress Tracking API Endpoints
Handles workout progress tracking and statistics
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, date, timedelta
from app.models.schemas import ProgressRequest, ProgressResponse
from app.services.supabase_service import supabase_service

router = APIRouter()


def _update_streaks(user_id: str, workout_date: date):
    """
    Update user streaks automatically when a workout is recorded
    """
    try:
        # Get current streak data
        streak_result = supabase_service.supabase.table("streaks")\
            .select("*")\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        
        today = date.today()
        workout_date_obj = workout_date if isinstance(workout_date, date) else datetime.fromisoformat(str(workout_date)).date()
        
        if not streak_result.data:
            # Create new streak record
            supabase_service.supabase.table("streaks").insert({
                "user_id": user_id,
                "current_streak": 1,
                "longest_streak": 1,
                "last_workout_date": workout_date_obj.isoformat(),
                "weekly_streak": 1,
                "monthly_streak": 1
            }).execute()
        else:
            # Update existing streak
            last_workout = datetime.fromisoformat(streak_result.data["last_workout_date"]).date() if streak_result.data.get("last_workout_date") else None
            current_streak = streak_result.data.get("current_streak", 0)
            longest_streak = streak_result.data.get("longest_streak", 0)
            
            # Calculate new streak
            if last_workout:
                days_diff = (workout_date_obj - last_workout).days
                if days_diff == 0:
                    # Same day, don't increment
                    new_streak = current_streak
                elif days_diff == 1:
                    # Consecutive day
                    new_streak = current_streak + 1
                else:
                    # Streak broken, restart
                    new_streak = 1
            else:
                new_streak = 1
            
            # Update longest streak if needed
            if new_streak > longest_streak:
                longest_streak = new_streak
            
            # Calculate weekly and monthly streaks
            weekly_streak = streak_result.data.get("weekly_streak", 0)
            monthly_streak = streak_result.data.get("monthly_streak", 0)
            
            # Simple logic: if workout is within 7 days, increment weekly
            if last_workout and (workout_date_obj - last_workout).days <= 7:
                weekly_streak = min(weekly_streak + 1, 7)
            else:
                weekly_streak = 1
            
            # Update monthly similarly
            if last_workout and (workout_date_obj - last_workout).days <= 30:
                monthly_streak = min(monthly_streak + 1, 30)
            else:
                monthly_streak = 1
            
            # Update streak record
            supabase_service.supabase.table("streaks")\
                .update({
                    "current_streak": new_streak,
                    "longest_streak": longest_streak,
                    "last_workout_date": workout_date_obj.isoformat(),
                    "weekly_streak": weekly_streak,
                    "monthly_streak": monthly_streak,
                    "updated_at": datetime.utcnow().isoformat()
                })\
                .eq("user_id", user_id)\
                .execute()
    except Exception as e:
        print(f"Error updating streaks: {e}")


@router.post("/progress", response_model=dict)
async def record_progress(request: ProgressRequest):
    """
    Record a workout completion
    
    Args:
        request: Progress tracking request with user_id, workout_id, and date
    
    Returns:
        Success confirmation with progress data
    """
    try:
        # Save progress to database
        result = supabase_service.save_progress(
            user_id=request.user_id,
            workout_id=request.workout_id,
            date=request.date,
            notes=request.notes
        )
        
        if result is None:
            # Return mock response if database is not connected
            return {
                "message": "Progress recorded (mock mode)",
                "user_id": request.user_id,
                "workout_id": request.workout_id,
                "date": request.date.isoformat()
            }
        
        # Update streaks automatically
        try:
            _update_streaks(request.user_id, request.date)
        except Exception as e:
            print(f"Error updating streaks: {e}")
        
        # Check for new achievements (async, non-blocking)
        try:
            from app.api.v1.motivation import check_achievements
            # This will be called asynchronously
            import asyncio
            asyncio.create_task(check_achievements(request.user_id))
        except Exception as e:
            print(f"Error checking achievements: {e}")
        
        return {
            "message": "Progress recorded successfully",
            "progress": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recording progress: {str(e)}")


@router.get("/progress/{user_id}", response_model=ProgressResponse)
async def get_progress(user_id: str):
    """
    Get user's progress summary
    
    Args:
        user_id: User identifier
    
    Returns:
        ProgressResponse with workout statistics
    """
    try:
        summary = supabase_service.get_progress_summary(user_id)
        
        # Convert to WorkoutRecord format
        from app.models.schemas import WorkoutRecord
        recent_workouts = [
            WorkoutRecord(
                workout_id=w.get("workout_id", ""),
                name=w.get("name", "Workout"),
                completed=True,
                date=datetime.fromisoformat(w.get("date", datetime.utcnow().isoformat()))
            )
            for w in summary.get("recent_workouts", [])
        ]
        
        return ProgressResponse(
            user_id=user_id,
            total_workouts=summary.get("total_workouts", 0),
            current_streak=summary.get("current_streak", 0),
            recent_workouts=recent_workouts,
            created_at=datetime.utcnow()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching progress: {str(e)}")


@router.get("/progress/{user_id}/stats")
async def get_progress_stats(user_id: str):
    """
    Get detailed progress statistics
    
    Args:
        user_id: User identifier
    
    Returns:
        Detailed progress statistics
    """
    try:
        summary = supabase_service.get_progress_summary(user_id)
        
        return {
            "user_id": user_id,
            "stats": {
                "total_workouts": summary.get("total_workouts", 0),
                "current_streak": summary.get("current_streak", 0),
                "weekly_goal": 3,  # Configure based on user preferences
                "current_week": summary.get("total_workouts", 0) % 7 if summary.get("total_workouts", 0) < 7 else 7
            },
            "last_updated": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching progress stats: {str(e)}")


