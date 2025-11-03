from fastapi import APIRouter, HTTPException
from app.models.schemas import ProfileRequest, ProfileResponse
from app.services.supabase_service import supabase_service
from datetime import datetime

router = APIRouter()

@router.get("/profile/{user_id}", response_model=ProfileResponse)
async def get_profile(user_id: str):
  try:
    data = supabase_service.get_profile(user_id)
    if not data:
      # Return empty profile structure
      now = datetime.utcnow()
      return ProfileResponse(user_id=user_id, created_at=now, updated_at=now)
    return ProfileResponse(
      user_id=str(data.get("user_id")),
      full_name=data.get("full_name"),
      gender=data.get("gender"),
      birth_date=data.get("birth_date"),
      height_cm=data.get("height_cm"),
      weight_kg=data.get("weight_kg"),
      goal=data.get("goal"),
      activity_level=data.get("activity_level"),
      habits=data.get("habits"),
      photo_url=data.get("photo_url"),
      created_at=data.get("created_at"),
      updated_at=data.get("updated_at"),
    )
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

@router.post("/profile", response_model=ProfileResponse)
async def upsert_profile(req: ProfileRequest):
  try:
    saved = supabase_service.upsert_profile(req)
    if not saved:
      raise HTTPException(status_code=400, detail="Could not save profile")
    return ProfileResponse(
      user_id=str(saved.get("user_id")),
      full_name=saved.get("full_name"),
      gender=saved.get("gender"),
      birth_date=saved.get("birth_date"),
      height_cm=saved.get("height_cm"),
      weight_kg=saved.get("weight_kg"),
      goal=saved.get("goal"),
      activity_level=saved.get("activity_level"),
      habits=saved.get("habits"),
      photo_url=saved.get("photo_url"),
      created_at=saved.get("created_at"),
      updated_at=saved.get("updated_at"),
    )
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Error saving profile: {str(e)}")


