"""
Nutrition API Endpoints
Handles nutrition plans, meals, and coach-client chat
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from app.services.supabase_service import supabase_service

router = APIRouter()


# =====================================================
# MODELS
# =====================================================

class MealFood(BaseModel):
    name: str
    portion: str
    calories: Optional[int] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None


class MealCreate(BaseModel):
    meal_type: str  # breakfast, lunch, dinner, snack, pre_workout, post_workout
    meal_order: Optional[int] = 0
    name: str
    description: Optional[str] = None
    day_of_week: Optional[str] = None  # monday, tuesday, etc.
    calories: Optional[int] = None
    protein_grams: Optional[float] = None
    carbs_grams: Optional[float] = None
    fat_grams: Optional[float] = None
    time_suggestion: Optional[str] = None
    foods: Optional[List[dict]] = None


class MealUpdate(BaseModel):
    meal_type: Optional[str] = None
    meal_order: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    day_of_week: Optional[str] = None
    calories: Optional[int] = None
    protein_grams: Optional[float] = None
    carbs_grams: Optional[float] = None
    fat_grams: Optional[float] = None
    time_suggestion: Optional[str] = None
    foods: Optional[List[dict]] = None


class PlanCreate(BaseModel):
    user_id: str
    coach_id: Optional[str] = None
    name: Optional[str] = "Plan Nutricional"
    description: Optional[str] = None
    daily_calories: Optional[int] = None
    protein_grams: Optional[int] = None
    carbs_grams: Optional[int] = None
    fat_grams: Optional[int] = None
    notes: Optional[str] = None


class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    daily_calories: Optional[int] = None
    protein_grams: Optional[int] = None
    carbs_grams: Optional[int] = None
    fat_grams: Optional[int] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class ChatMessage(BaseModel):
    user_id: str
    coach_id: Optional[str] = None
    sender_id: str
    sender_role: str  # 'user' or 'coach'
    message: str
    message_type: Optional[str] = "text"
    metadata: Optional[dict] = None


# =====================================================
# NUTRITION PLANS ENDPOINTS
# =====================================================

@router.get("/nutrition/plan/{user_id}")
async def get_user_plan(user_id: str):
    """Get active nutrition plan for a user"""
    try:
        result = supabase_service.supabase.table("nutrition_plans")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("is_active", True)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        if not result.data:
            return {"plan": None, "meals": []}
        
        plan = result.data[0]
        
        # Get meals for this plan
        meals_result = supabase_service.supabase.table("nutrition_meals")\
            .select("*")\
            .eq("plan_id", plan["id"])\
            .order("meal_order")\
            .execute()
        
        return {
            "plan": plan,
            "meals": meals_result.data or []
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting nutrition plan: {str(e)}")


@router.get("/nutrition/plans/{user_id}")
async def get_all_user_plans(user_id: str):
    """Get all nutrition plans for a user (for coach view)"""
    try:
        result = supabase_service.supabase.table("nutrition_plans")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        
        return {"plans": result.data or []}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting nutrition plans: {str(e)}")


@router.post("/nutrition/plan")
async def create_plan(plan: PlanCreate):
    """Create a new nutrition plan"""
    try:
        # Deactivate existing active plans
        supabase_service.supabase.table("nutrition_plans")\
            .update({"is_active": False})\
            .eq("user_id", plan.user_id)\
            .eq("is_active", True)\
            .execute()
        
        # Create new plan
        plan_data = plan.dict()
        result = supabase_service.supabase.table("nutrition_plans")\
            .insert(plan_data)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create plan")
        
        return {"plan": result.data[0]}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating nutrition plan: {str(e)}")


@router.patch("/nutrition/plan/{plan_id}")
async def update_plan(plan_id: str, plan: PlanUpdate):
    """Update a nutrition plan"""
    try:
        update_data = {k: v for k, v in plan.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = supabase_service.supabase.table("nutrition_plans")\
            .update(update_data)\
            .eq("id", plan_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        return {"plan": result.data[0]}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating nutrition plan: {str(e)}")


@router.delete("/nutrition/plan/{plan_id}")
async def delete_plan(plan_id: str):
    """Delete a nutrition plan"""
    try:
        result = supabase_service.supabase.table("nutrition_plans")\
            .delete()\
            .eq("id", plan_id)\
            .execute()
        
        return {"success": True}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting nutrition plan: {str(e)}")


# =====================================================
# MEALS ENDPOINTS
# =====================================================

@router.post("/nutrition/meal/{plan_id}")
async def add_meal(plan_id: str, meal: MealCreate):
    """Add a meal to a plan"""
    try:
        meal_data = meal.dict()
        meal_data["plan_id"] = plan_id
        
        result = supabase_service.supabase.table("nutrition_meals")\
            .insert(meal_data)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to add meal")
        
        return {"meal": result.data[0]}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding meal: {str(e)}")


@router.patch("/nutrition/meal/{meal_id}")
async def update_meal(meal_id: str, meal: MealUpdate):
    """Update a meal"""
    try:
        update_data = {k: v for k, v in meal.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = supabase_service.supabase.table("nutrition_meals")\
            .update(update_data)\
            .eq("id", meal_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Meal not found")
        
        return {"meal": result.data[0]}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating meal: {str(e)}")


@router.delete("/nutrition/meal/{meal_id}")
async def delete_meal(meal_id: str):
    """Delete a meal"""
    try:
        result = supabase_service.supabase.table("nutrition_meals")\
            .delete()\
            .eq("id", meal_id)\
            .execute()
        
        return {"success": True}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting meal: {str(e)}")


# =====================================================
# COACH CHAT ENDPOINTS
# =====================================================

@router.get("/nutrition/chat/{user_id}")
async def get_chat_messages(user_id: str, limit: int = 50):
    """Get chat messages for a user"""
    try:
        result = supabase_service.supabase.table("coach_chat")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        # Reverse to get chronological order
        messages = list(reversed(result.data or []))
        
        return {"messages": messages}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting chat messages: {str(e)}")


@router.post("/nutrition/chat")
async def send_chat_message(msg: ChatMessage):
    """Send a chat message"""
    try:
        msg_data = msg.dict()
        msg_data["created_at"] = datetime.utcnow().isoformat()
        
        result = supabase_service.supabase.table("coach_chat")\
            .insert(msg_data)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to send message")
        
        return {"message": result.data[0]}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")


@router.patch("/nutrition/chat/read/{user_id}")
async def mark_messages_read(user_id: str, reader_role: str):
    """Mark messages as read for a user or coach"""
    try:
        # Mark messages from the other party as read
        other_role = "coach" if reader_role == "user" else "user"
        
        result = supabase_service.supabase.table("coach_chat")\
            .update({"is_read": True})\
            .eq("user_id", user_id)\
            .eq("sender_role", other_role)\
            .eq("is_read", False)\
            .execute()
        
        return {"success": True, "updated": len(result.data) if result.data else 0}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marking messages as read: {str(e)}")


@router.get("/nutrition/chat/unread/{user_id}")
async def get_unread_count(user_id: str, reader_role: str):
    """Get unread message count"""
    try:
        other_role = "coach" if reader_role == "user" else "user"
        
        result = supabase_service.supabase.table("coach_chat")\
            .select("id", count="exact")\
            .eq("user_id", user_id)\
            .eq("sender_role", other_role)\
            .eq("is_read", False)\
            .execute()
        
        return {"unread": result.count or 0}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting unread count: {str(e)}")


# =====================================================
# COACH ADMIN ENDPOINTS
# =====================================================

@router.get("/nutrition/coach/clients")
async def get_coach_clients_nutrition():
    """Get all clients with their nutrition plans for coach view"""
    try:
        # Get all users
        users_result = supabase_service.supabase.table("users")\
            .select("id, full_name, email")\
            .execute()
        
        clients = []
        for user in (users_result.data or []):
            # Get active plan
            plan_result = supabase_service.supabase.table("nutrition_plans")\
                .select("id, name, daily_calories, updated_at")\
                .eq("user_id", user["id"])\
                .eq("is_active", True)\
                .limit(1)\
                .execute()
            
            # Get unread messages
            unread_result = supabase_service.supabase.table("coach_chat")\
                .select("id", count="exact")\
                .eq("user_id", user["id"])\
                .eq("sender_role", "user")\
                .eq("is_read", False)\
                .execute()
            
            clients.append({
                "user": user,
                "plan": plan_result.data[0] if plan_result.data else None,
                "unread_messages": unread_result.count or 0
            })
        
        return {"clients": clients}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting coach clients: {str(e)}")

