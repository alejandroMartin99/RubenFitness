"""
Water Tracking API Endpoints
Handles water intake tracking and history
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, date, timedelta
from app.models.schemas import WaterRequest, WaterResponse, WaterRecord
from app.services.supabase_service import supabase_service

router = APIRouter()


@router.post("/water", response_model=dict)
async def record_water(request: WaterRequest):
    """
    Record water intake for a specific date
    
    Args:
        request: Water tracking request with user_id, date, and water_ml
    
    Returns:
        Success confirmation with water data
    """
    try:
        # Save water data to database
        result = supabase_service.save_water_data(
            user_id=request.user_id,
            water_date=request.date,
            water_ml=request.water_ml
        )
        
        if result is None:
            # Return mock response if database is not connected
            return {
                "message": "Water recorded (mock mode)",
                "user_id": request.user_id,
                "date": request.date.isoformat(),
                "water_ml": request.water_ml
            }
        
        return {
            "message": "Water recorded successfully",
            "water": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recording water: {str(e)}")


@router.get("/water/{user_id}", response_model=WaterResponse)
async def get_water_data(user_id: str, days: int = 7):
    """
    Get user's water intake data
    
    Args:
        user_id: User identifier
        days: Number of days to retrieve (default: 7)
    
    Returns:
        WaterResponse with today's water and last N days history
    """
    try:
        water_data = supabase_service.get_water_data(user_id, days=days)
        
        # Get today's water
        today_water = None
        last_7_days = []
        total_today = 0
        
        if water_data:
            today = date.today()
            today_str = today.isoformat()
            
            # Find today's record
            today_record = None
            for w in water_data:
                record_date = w.get("date", "")
                # Normalize date strings
                if isinstance(record_date, str):
                    record_date = record_date.split('T')[0] if 'T' in record_date else record_date
                    record_date = record_date.split(' ')[0] if ' ' in record_date else record_date
                
                if str(record_date) == today_str:
                    today_record = w
                    break
            
            if today_record:
                water_ml = int(today_record.get("water_ml", 0))
                total_today = water_ml
                today_water = WaterRecord(
                    date=today,
                    water_ml=water_ml
                )
            
            # Get last N days
            for i in range(days):
                day_date = today - timedelta(days=i)
                day_str = day_date.isoformat()
                
                # Find day record
                day_record = None
                for w in water_data:
                    record_date = w.get("date", "")
                    if isinstance(record_date, str):
                        record_date = record_date.split('T')[0] if 'T' in record_date else record_date
                        record_date = record_date.split(' ')[0] if ' ' in record_date else record_date
                    
                    if str(record_date) == day_str:
                        day_record = w
                        break
                
                if day_record:
                    water_ml = int(day_record.get("water_ml", 0))
                    last_7_days.append(WaterRecord(
                        date=day_date,
                        water_ml=water_ml
                    ))
                else:
                    last_7_days.append(WaterRecord(
                        date=day_date,
                        water_ml=0
                    ))
            
            # Reverse to get chronological order (oldest to newest)
            last_7_days.reverse()
        
        return WaterResponse(
            user_id=user_id,
            today_water=today_water,
            last_7_days=last_7_days,
            total_today=total_today,
            goal=2000,  # Default goal: 2 liters
            created_at=datetime.utcnow()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching water data: {str(e)}")

