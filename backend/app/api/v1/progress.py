"""
Progress Tracking API Endpoints
Handles workout progress tracking and statistics
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.models.schemas import ProgressRequest, ProgressResponse
from app.services.supabase_service import supabase_service

router = APIRouter()


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


