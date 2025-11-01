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
        Success confirmation with sleep data
    """
    try:
        # Save sleep data to database
        result = supabase_service.save_sleep_data(
            user_id=request.user_id,
            sleep_date=request.date,
            hours=request.hours,
            minutes=request.minutes or 0
        )
        
        if result is None:
            # Return mock response if database is not connected
            return {
                "message": "Sleep recorded (mock mode)",
                "user_id": request.user_id,
                "date": request.date.isoformat(),
                "hours": request.hours
            }
        
        return {
            "message": "Sleep recorded successfully",
            "sleep": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recording sleep: {str(e)}")


@router.get("/sleep/{user_id}", response_model=SleepResponse)
async def get_sleep_data(user_id: str, days: int = 7):
    """
    Get user's sleep data
    
    Args:
        user_id: User identifier
        days: Number of days to retrieve (default: 7)
    
    Returns:
        SleepResponse with today's sleep and last N days history
    """
    try:
        sleep_data = supabase_service.get_sleep_data(user_id, days=days)
        
        # Get today's sleep
        today_sleep = None
        last_7_days = []
        
        if sleep_data:
            today = date.today()
            today_str = today.isoformat()
            
            # Find today's record - handle date string matching
            today_record = None
            for s in sleep_data:
                record_date = s.get("date", "")
                # Normalize date strings (remove time portion if present)
                if isinstance(record_date, str):
                    record_date = record_date.split('T')[0] if 'T' in record_date else record_date
                    record_date = record_date.split(' ')[0] if ' ' in record_date else record_date
                
                if str(record_date) == today_str:
                    today_record = s
                    break
            
            if today_record:
                total_hours = float(today_record.get("hours", 0))
                hours = int(total_hours)
                minutes = int(round((total_hours - hours) * 60))
                today_sleep = SleepRecord(
                    date=today,
                    hours=total_hours,
                    minutes=minutes
                )
            
            # Get last N days
            for i in range(days):
                day_date = today - timedelta(days=i)
                day_str = day_date.isoformat()
                
                # Find day record - handle date string matching
                day_record = None
                for s in sleep_data:
                    record_date = s.get("date", "")
                    # Normalize date strings
                    if isinstance(record_date, str):
                        record_date = record_date.split('T')[0] if 'T' in record_date else record_date
                        record_date = record_date.split(' ')[0] if ' ' in record_date else record_date
                    
                    if str(record_date) == day_str:
                        day_record = s
                        break
                
                if day_record:
                    total_hours = float(day_record.get("hours", 0))
                    hours = int(total_hours)
                    minutes = int(round((total_hours - hours) * 60))
                    last_7_days.append(SleepRecord(
                        date=day_date,
                        hours=total_hours,
                        minutes=minutes
                    ))
                else:
                    last_7_days.append(SleepRecord(
                        date=day_date,
                        hours=0,
                        minutes=0
                    ))
            
            # Reverse to get chronological order (oldest to newest)
            last_7_days.reverse()
        
        # Calculate average
        if last_7_days:
            total = sum(day.hours for day in last_7_days if day.hours > 0)
            count = sum(1 for day in last_7_days if day.hours > 0)
            average = total / count if count > 0 else 0
        else:
            average = None
        
        return SleepResponse(
            user_id=user_id,
            today_sleep=today_sleep,
            last_7_days=last_7_days,
            average_sleep=average,
            created_at=datetime.utcnow()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sleep data: {str(e)}")

