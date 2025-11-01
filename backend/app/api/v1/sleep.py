"""
Sleep Tracking API Endpoints
Handles sleep data tracking and history
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, date, timedelta
from app.models.schemas import SleepRequest, SleepResponse, SleepRecord
from app.services.supabase_service import supabase_service

router = APIRouter()


@router.post("/sleep", response_model=dict)
async def record_sleep(request: SleepRequest):
    """
    Record sleep hours for a specific date
    
    Args:
        request: Sleep tracking request with user_id, date, and hours
    
    Returns:
        Updated sleep data after saving
    """
    try:
        # Save sleep data to database
        result = supabase_service.save_sleep_data(
            user_id=request.user_id,
            sleep_date=request.date,
            hours=request.hours,
            minutes=request.minutes or 0
        )
        
        # Get updated sleep data for today
        sleep_data = supabase_service.get_sleep_data(request.user_id, days=1)
        today = date.today()
        today_str = today.isoformat()
        
        today_hours = 0
        today_minutes = 0
        if sleep_data:
            for s in sleep_data:
                record_date = s.get("date", "")
                if isinstance(record_date, str):
                    record_date = record_date.split('T')[0] if 'T' in record_date else record_date
                    record_date = record_date.split(' ')[0] if ' ' in record_date else record_date
                
                if str(record_date) == today_str:
                    hours = float(s.get("hours", 0))
                    today_hours = int(hours)
                    today_minutes = int(round((hours - today_hours) * 60))
                    break
        
        return {
            "success": True,
            "user_id": request.user_id,
            "hours": today_hours,
            "minutes": today_minutes,
            "total_hours": today_hours + (today_minutes / 60),
            "date": today_str,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recording sleep: {str(e)}")


@router.get("/sleep/{user_id}")
async def get_sleep_data(user_id: str, days: int = 7):
    """
    Get user's sleep data
    
    Args:
        user_id: User identifier
        days: Number of days to retrieve (default: 7)
    
    Returns:
        Simple JSON response with sleep data
    """
    try:
        sleep_data = supabase_service.get_sleep_data(user_id, days=days)
        
        today = date.today()
        today_str = today.isoformat()
        
        # Build a map of date -> hours for quick lookup
        sleep_map = {}
        if sleep_data:
            for s in sleep_data:
                record_date = s.get("date", "")
                # Normalize date strings
                if isinstance(record_date, str):
                    record_date = record_date.split('T')[0] if 'T' in record_date else record_date
                    record_date = record_date.split(' ')[0] if ' ' in record_date else record_date
                
                hours = float(s.get("hours", 0))
                sleep_map[str(record_date)] = hours
        
        # Get today's sleep
        today_hours_value = sleep_map.get(today_str, 0)
        today_hours = int(today_hours_value)
        today_minutes = int(round((today_hours_value - today_hours) * 60))
        
        # Build history
        last_7_days = []
        for i in range(days):
            day_date = today - timedelta(days=i)
            day_str = day_date.isoformat()
            day_hours_value = sleep_map.get(day_str, 0)
            
            last_7_days.append({
                "date": day_str,
                "hours": day_hours_value
            })
        
        # Reverse to get chronological order (oldest to newest)
        last_7_days.reverse()
        
        # Calculate average
        total = sum(day["hours"] for day in last_7_days if day["hours"] > 0)
        count = sum(1 for day in last_7_days if day["hours"] > 0)
        average = total / count if count > 0 else 0
        
        # Return simple JSON response
        response = {
            "user_id": user_id,
            "hours": today_hours,
            "minutes": today_minutes,
            "total_hours": today_hours_value,
            "last_7_days": last_7_days,
            "average_sleep": average,
            "success": True
        }
        
        print(f"Sleep GET response: hours={today_hours}, minutes={today_minutes}")
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sleep data: {str(e)}")

