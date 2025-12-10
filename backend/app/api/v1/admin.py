"""
Admin API Endpoints
Handles admin-only operations for user management and insights
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional
import json
from app.services.supabase_service import supabase_service

router = APIRouter()


@router.get("/admin/users")
async def get_all_users():
    """
    Get all users with detailed metrics and insights
    Returns comprehensive data for admin dashboard
    """
    try:
        if not supabase_service.is_connected():
            raise HTTPException(status_code=503, detail="Database not connected")

        # Get all users
        users_result = supabase_service.supabase.table("users").select("*").execute()
        users = users_result.data if users_result.data else []

        # Get current week boundaries
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_start_str = week_start.isoformat()
        today_str = today.isoformat()
        last_week_start = week_start - timedelta(days=7)
        last_week_start_str = last_week_start.isoformat()

        # Get all progress records for this week and last week
        progress_result = supabase_service.supabase.table("progress")\
            .select("*")\
            .gte("workout_date", last_week_start_str)\
            .lte("workout_date", today_str)\
            .execute()
        all_progress = progress_result.data if progress_result.data else []
        week_progress = [p for p in all_progress if p.get("workout_date", "") >= week_start_str]
        last_week_progress = [p for p in all_progress if last_week_start_str <= p.get("workout_date", "") < week_start_str]

        # Get all streaks
        streaks_result = supabase_service.supabase.table("streaks").select("*").execute()
        streaks_data = streaks_result.data if streaks_result.data else []
        streaks_map = {s["user_id"]: s for s in streaks_data}

        # Get all body composition data (latest per user)
        body_comp_result = supabase_service.supabase.table("body_composition")\
            .select("*")\
            .order("date", desc=True)\
            .execute()
        body_comp_data = body_comp_result.data if body_comp_result.data else []
        
        # Get latest body comp per user
        body_comp_map = {}
        for bc in body_comp_data:
            user_id = bc.get("user_id")
            if user_id and user_id not in body_comp_map:
                body_comp_map[user_id] = bc

        # Get user profiles for additional data
        profiles_result = supabase_service.supabase.table("user_profiles").select("*").execute()
        profiles_data = profiles_result.data if profiles_result.data else []
        profiles_map = {p["user_id"]: p for p in profiles_data}

        # Get all progress for evolution charts (last 30 days)
        month_start = today - timedelta(days=30)
        month_progress = supabase_service.supabase.table("progress")\
            .select("*")\
            .gte("workout_date", month_start.isoformat())\
            .lte("workout_date", today_str)\
            .execute()
        month_progress_data = month_progress.data if month_progress.data else []

        # Process each user
        clients = []
        total_workouts_week = 0
        total_volume_week = 0
        total_streaks = 0
        active_users = 0
        total_workouts_last_week = 0
        total_volume_last_week = 0

        for user in users:
            user_id = user.get("id")
            if not user_id:
                continue

            # Skip admin user from client list
            if user.get("email") == "admin@ruben.fitness":
                continue

            # Get user's progress for this week and last week
            user_progress = [p for p in week_progress if p.get("user_id") == user_id]
            user_last_week = [p for p in last_week_progress if p.get("user_id") == user_id]
            user_month_progress = [p for p in month_progress_data if p.get("user_id") == user_id]
            
            # Calculate weekly metrics
            workouts_week = len(user_progress)
            volume_week = sum(float(p.get("total_volume", 0) or 0) for p in user_progress)
            workouts_last_week = len(user_last_week)
            volume_last_week = sum(float(p.get("total_volume", 0) or 0) for p in user_last_week)
            
            # Calculate trends
            workouts_trend = ((workouts_week - workouts_last_week) / workouts_last_week * 100) if workouts_last_week > 0 else (100 if workouts_week > 0 else 0)
            volume_trend = ((volume_week - volume_last_week) / volume_last_week * 100) if volume_last_week > 0 else (100 if volume_week > 0 else 0)
            
            # Get last workout
            last_workout = None
            last_workout_date = None
            if user_progress:
                latest = max(user_progress, key=lambda x: x.get("workout_date", ""))
                last_workout_date = latest.get("workout_date")
                if last_workout_date:
                    try:
                        workout_date = datetime.fromisoformat(last_workout_date.replace('Z', '+00:00')).date()
                        days_ago = (today - workout_date).days
                        if days_ago == 0:
                            last_workout = "Hoy"
                        elif days_ago == 1:
                            last_workout = "Ayer"
                        else:
                            last_workout = f"Hace {days_ago} días"
                    except:
                        last_workout = "Reciente"
            else:
                # Try to get any workout
                any_progress = supabase_service.supabase.table("progress")\
                    .select("workout_date")\
                    .eq("user_id", user_id)\
                    .order("workout_date", desc=True)\
                    .limit(1)\
                    .execute()
                if any_progress.data:
                    last_workout_date = any_progress.data[0].get("workout_date")
                    if last_workout_date:
                        try:
                            workout_date = datetime.fromisoformat(last_workout_date.replace('Z', '+00:00')).date()
                            days_ago = (today - workout_date).days
                            if days_ago == 0:
                                last_workout = "Hoy"
                            elif days_ago == 1:
                                last_workout = "Ayer"
                            else:
                                last_workout = f"Hace {days_ago} días"
                        except:
                            last_workout = "Reciente"
                else:
                    last_workout = "Sin entrenos"

            # Get streak
            streak_data = streaks_map.get(user_id, {})
            current_streak = streak_data.get("current_streak", 0) or 0
            longest_streak = streak_data.get("longest_streak", 0) or 0

            # Get body composition
            body_comp = body_comp_map.get(user_id, {})
            weight = body_comp.get("weight") or profiles_map.get(user_id, {}).get("weight_kg")
            fat = body_comp.get("fat") or profiles_map.get(user_id, {}).get("body_fat_percent")
            muscle = body_comp.get("muscle") or profiles_map.get(user_id, {}).get("muscle_mass_kg")

            # Get goals
            goals = user.get("goals", []) or []
            profile = profiles_map.get(user_id, {})
            if profile.get("goal") and profile.get("goal") not in goals:
                goals.append(profile.get("goal"))

            # Check if user is active (has workout in last 7 days)
            is_active = workouts_week > 0 or (last_workout_date and (today - datetime.fromisoformat(last_workout_date.replace('Z', '+00:00')).date()).days <= 7)
            if is_active:
                active_users += 1

            # Calculate monthly stats for evolution
            monthly_workouts = len(user_month_progress)
            monthly_volume = sum(float(p.get("total_volume", 0) or 0) for p in user_month_progress)

            clients.append({
                "id": user_id,
                "name": user.get("full_name") or profile.get("full_name") or "Sin nombre",
                "email": user.get("email", ""),
                "lastWorkout": last_workout or "Sin entrenos",
                "lastWorkoutDate": last_workout_date,
                "workoutsWeek": workouts_week,
                "volumeWeek": round(volume_week, 1),
                "workoutsTrend": round(workouts_trend, 1),
                "volumeTrend": round(volume_trend, 1),
                "streak": current_streak,
                "longestStreak": longest_streak,
                "weight": round(float(weight), 1) if weight else None,
                "fat": round(float(fat), 1) if fat else None,
                "muscle": round(float(muscle), 1) if muscle else None,
                "goals": goals if isinstance(goals, list) else [],
                "fitnessLevel": user.get("fitness_level", "beginner"),
                "createdAt": user.get("created_at"),
                "monthlyWorkouts": monthly_workouts,
                "monthlyVolume": round(monthly_volume, 1),
                "phone": profile.get("phone") or None  # For WhatsApp
            })

            total_workouts_week += workouts_week
            total_volume_week += volume_week
            total_workouts_last_week += workouts_last_week
            total_volume_last_week += volume_last_week
            if current_streak > 0:
                total_streaks += current_streak

        # Calculate average streak
        active_streaks = [c["streak"] for c in clients if c["streak"] > 0]
        avg_streak = round(sum(active_streaks) / len(active_streaks), 1) if active_streaks else 0

        # Calculate trends
        workouts_trend_global = ((total_workouts_week - total_workouts_last_week) / total_workouts_last_week * 100) if total_workouts_last_week > 0 else (100 if total_workouts_week > 0 else 0)
        volume_trend_global = ((total_volume_week - total_volume_last_week) / total_volume_last_week * 100) if total_volume_last_week > 0 else (100 if total_volume_week > 0 else 0)

        # Calculate KPIs
        kpis = {
            "activeUsers": active_users,
            "totalUsers": len(clients),
            "workoutsWeek": total_workouts_week,
            "volumeWeek": round(total_volume_week, 1),
            "avgStreak": avg_streak,
            "workoutsTrend": round(workouts_trend_global, 1),
            "volumeTrend": round(volume_trend_global, 1),
            "workoutsLastWeek": total_workouts_last_week,
            "volumeLastWeek": round(total_volume_last_week, 1)
        }

        # Get evolution data for charts (last 30 days grouped by day)
        evolution_data = {}
        for p in month_progress_data:
            workout_date = p.get("workout_date", "")
            if workout_date:
                try:
                    date_obj = datetime.fromisoformat(workout_date.replace('Z', '+00:00')).date()
                    date_str = date_obj.isoformat()
                    if date_str not in evolution_data:
                        evolution_data[date_str] = {"workouts": 0, "volume": 0, "users": set()}
                    evolution_data[date_str]["workouts"] += 1
                    evolution_data[date_str]["volume"] += float(p.get("total_volume", 0) or 0)
                    evolution_data[date_str]["users"].add(p.get("user_id"))
                except:
                    pass

        # Format evolution data for chart
        evolution_chart = []
        for i in range(30):
            day = today - timedelta(days=29-i)
            day_str = day.isoformat()
            data = evolution_data.get(day_str, {"workouts": 0, "volume": 0, "users": set()})
            evolution_chart.append({
                "date": day_str,
                "workouts": data["workouts"],
                "volume": round(data["volume"], 1),
                "activeUsers": len(data["users"])
            })

        return {
            "success": True,
            "kpis": kpis,
            "clients": clients,
            "evolution": evolution_chart
        }

    except Exception as e:
        print(f"Error in get_all_users: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")


@router.get("/admin/user/{user_id}/details")
async def get_user_details(user_id: str):
    """
    Get detailed insights for a specific user
    """
    try:
        if not supabase_service.is_connected():
            raise HTTPException(status_code=503, detail="Database not connected")

        # Get user
        user_result = supabase_service.supabase.table("users")\
            .select("*")\
            .eq("id", user_id)\
            .single()\
            .execute()
        
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")

        user = user_result.data

        # Get all progress
        progress_result = supabase_service.supabase.table("progress")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("workout_date", desc=True)\
            .limit(50)\
            .execute()
        workouts = progress_result.data if progress_result.data else []

        # Get streak
        streak_result = supabase_service.supabase.table("streaks")\
            .select("*")\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        streak = streak_result.data if streak_result.data else {}

        # Get body composition history
        body_comp_result = supabase_service.supabase.table("body_composition")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("date", desc=True)\
            .limit(30)\
            .execute()
        body_comp_history = body_comp_result.data if body_comp_result.data else []

        # Get profile
        profile_result = supabase_service.supabase.table("user_profiles")\
            .select("*")\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        profile = profile_result.data if profile_result.data else {}

        return {
            "success": True,
            "user": user,
            "profile": profile,
            "workouts": workouts,
            "streak": streak,
            "bodyComposition": body_comp_history
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_user_details: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching user details: {str(e)}")
