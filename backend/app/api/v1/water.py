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
        Updated water data after saving
    """
    try:
        # Save water data to database
        result = supabase_service.save_water_data(
            user_id=request.user_id,
            water_date=request.date,
            water_ml=request.water_ml
        )
        
        # Get updated water data for today
        water_data = supabase_service.get_water_data(request.user_id, days=1)
        today = date.today()
        today_str = today.isoformat()
        
        total_today = 0
        if water_data:
            for w in water_data:
                record_date = w.get("date", "")
                if isinstance(record_date, str):
                    record_date = record_date.split('T')[0] if 'T' in record_date else record_date
                    record_date = record_date.split(' ')[0] if ' ' in record_date else record_date
                
                if str(record_date) == today_str:
                    total_today = int(w.get("water_ml", 0) or 0)
                    break
        
        return {
            "success": True,
            "user_id": request.user_id,
            "total_today": total_today,
            "water_ml": total_today,
            "date": today_str,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recording water: {str(e)}")


@router.get("/water/{user_id}")
async def get_water_data(user_id: str, days: int = 7):
    """
    Get user's water intake data
    
    Args:
        user_id: User identifier
        days: Number of days to retrieve (default: 7)
    
    Returns:
        Simple JSON response with water data
    """
    try:
        water_data = supabase_service.get_water_data(user_id, days=days)
        
        today = date.today()
        today_str = today.isoformat()
        
        # Build a map of date -> water_ml for quick lookup
        water_map = {}
        if water_data:
            for w in water_data:
                record_date = w.get("date", "")
                # Normalize date strings
                if isinstance(record_date, str):
                    record_date = record_date.split('T')[0] if 'T' in record_date else record_date
                    record_date = record_date.split(' ')[0] if ' ' in record_date else record_date
                
                water_ml = int(w.get("water_ml", 0) or 0)
                water_map[str(record_date)] = water_ml
        
        # Get today's water
        total_today = water_map.get(today_str, 0)
        
        # Build history
        last_7_days = []
        for i in range(days):
            day_date = today - timedelta(days=i)
            day_str = day_date.isoformat()
            day_water_ml = water_map.get(day_str, 0)
            
            last_7_days.append({
                "date": day_str,
                "water_ml": day_water_ml
            })
        
        # Reverse to get chronological order (oldest to newest)
        last_7_days.reverse()
        
        # Return simple JSON response
        response = {
            "user_id": user_id,
            "total_today": total_today,
            "water_ml": total_today,  # Alias for compatibility
            "last_7_days": last_7_days,
            "goal": 2000,
            "success": True
        }
        
        print(f"Water GET response: total_today={total_today}")
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching water data: {str(e)}")

