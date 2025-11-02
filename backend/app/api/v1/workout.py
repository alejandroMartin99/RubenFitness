"""
Workout Calendar API Endpoints
Handles workout day tracking and calendar
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, date, timedelta
from app.models.schemas import WorkoutRequest, WorkoutResponse
from app.services.supabase_service import supabase_service

router = APIRouter()


@router.post("/workout", response_model=dict)
async def mark_workout_day(request: WorkoutRequest):
    """
    Mark a day as having a workout
    
    Args:
        request: Workout request with user_id and date
    
    Returns:
        Success confirmation
    """
    try:
        # Save workout day to database
        result = supabase_service.save_workout_day(
            user_id=request.user_id,
            workout_date=request.date
        )
        
        return {
            "success": True,
            "user_id": request.user_id,
            "date": request.date.isoformat(),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marking workout day: {str(e)}")


@router.get("/workout/{user_id}")
async def get_workout_days(user_id: str, year: int, month: int):
    """
    Get workout days for a specific month
    
    Args:
        user_id: User identifier
        year: Year (e.g., 2024)
        month: Month (1-12)
    
    Returns:
        List of dates that have workouts
    """
    try:
        workout_days = supabase_service.get_workout_days(user_id, year, month)
        
        # Convert to list of date strings (YYYY-MM-DD)
        workout_days_list = [day.isoformat() if isinstance(day, date) else str(day) for day in workout_days]
        
        return {
            "user_id": user_id,
            "workout_days": workout_days_list,
            "month": month,
            "year": year,
            "success": True
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching workout days: {str(e)}")

