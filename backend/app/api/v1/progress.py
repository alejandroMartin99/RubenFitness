"""
Progress Tracking API Endpoints
Handles workout progress tracking and statistics
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, date, timedelta
from app.models.schemas import ProgressRequest, ProgressResponse, WorkoutLogRequest, ExerciseLog, ExerciseSet
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
        import json
        import re
        
        recent_workouts = []
        for w in summary.get("recent_workouts", []):
            # Handle both 'date' and 'workout_date' fields
            date_str = w.get("workout_date") or w.get("date") or datetime.utcnow().isoformat()
            try:
                # Try parsing as date first, then datetime
                if isinstance(date_str, str):
                    if 'T' in date_str:
                        workout_datetime = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    else:
                        # It's a date string, convert to datetime
                        workout_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                        workout_datetime = datetime.combine(workout_date, datetime.min.time())
                else:
                    workout_datetime = datetime.utcnow()
            except Exception as e:
                print(f"Error parsing date: {e}, using current time")
                workout_datetime = datetime.utcnow()
            
            # Try to extract workout type from notes JSON
            workout_name = w.get("name") or "Workout"
            notes = w.get("notes", "") or ""
            
            # Try to extract workout_type from JSON in notes
            try:
                json_match = re.search(r'WORKOUT_DATA:\s*({[\s\S]*?})', notes)
                if json_match:
                    workout_data = json.loads(json_match.group(1))
                    workout_type = workout_data.get("workout_type", "")
                    if workout_type:
                        workout_name = workout_type
            except Exception as e:
                # If JSON parsing fails, try to extract from notes text
                if "Tipo:" in notes:
                    try:
                        tipo_line = [line for line in notes.split('\n') if 'Tipo:' in line]
                        if tipo_line:
                            workout_name = tipo_line[0].split('Tipo:')[1].strip().split('\n')[0].strip()
                    except:
                        pass
            
            recent_workouts.append(WorkoutRecord(
                workout_id=w.get("workout_id") or w.get("id", ""),
                name=workout_name,
                completed=w.get("completed", True),
                date=workout_datetime
            ))
        
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


@router.post("/progress/log-workout")
async def log_workout(request: WorkoutLogRequest):
    """
    Log a detailed workout with exercises, sets, reps, and weight
    
    Args:
        request: WorkoutLogRequest with user_id, date, type, notes, and exercises
    
    Returns:
        Success confirmation with workout log ID
    """
    try:
        if not supabase_service.is_connected():
            # Return mock response if database is not connected
            return {
                "message": "Workout logged (mock mode)",
                "user_id": request.user_id,
                "date": request.date,
                "type": request.type,
                "exercises_count": len(request.exercises),
                "timestamp": datetime.utcnow().isoformat()
            }
        
        # Parse date
        workout_date = datetime.fromisoformat(request.date).date() if isinstance(request.date, str) else request.date
        
        # Calculate total volume and duration estimate
        total_volume = 0
        total_sets = 0
        for exercise in request.exercises:
            for set_data in exercise.sets:
                total_volume += set_data.reps * set_data.weight
                total_sets += 1
        
        # Estimate duration (rough calculation: ~2 minutes per set)
        estimated_duration = total_sets * 2
        
        # Build notes with workout type and exercise summary
        notes_content = f"Tipo: {request.type}\nEjercicios: {len(request.exercises)}"
        if request.notes:
            notes_content = f"{request.notes}\n\n{notes_content}"
        
        # Save progress record
        # workout_id is NULL because these are custom workouts not in the workouts table
        progress_result = supabase_service.supabase.table("progress").insert({
            "user_id": request.user_id,
            "workout_id": None,  # NULL for custom workouts
            "workout_date": workout_date.isoformat(),
            "duration_minutes": estimated_duration,
            "notes": notes_content
        }).execute()
        
        progress_id = progress_result.data[0]["id"] if progress_result.data else None
        
        # Save detailed exercises and sets as JSON in a separate field or table
        # For now, we'll store it as JSON in the notes or create a workout_logs table
        # Let's store it in a JSON field if available, otherwise append to notes
        
        # Save detailed exercises and sets data
        # Store as JSON in notes for now (can be migrated to a separate table later)
        try:
            import json
            workout_data = {
                "workout_type": request.type,
                "exercises": [
                    {
                        "name": ex.name,
                        "sets": [{"reps": s.reps, "weight": s.weight} for s in ex.sets]
                    }
                    for ex in request.exercises
                ],
                "total_volume": total_volume,
                "total_sets": total_sets
            }
            
            # Append JSON data to notes
            if progress_id:
                updated_notes = f"{notes_content}\n\n--- Datos detallados ---\n{json.dumps(workout_data, indent=2, ensure_ascii=False)}"
                supabase_service.supabase.table("progress")\
                    .update({
                        "notes": updated_notes
                    })\
                    .eq("id", progress_id)\
                    .execute()
        except Exception as e:
            print(f"Note: Could not save detailed workout data: {e}")
        
        # Update streaks automatically
        try:
            _update_streaks(request.user_id, workout_date)
        except Exception as e:
            print(f"Error updating streaks: {e}")
        
        return {
            "message": "Workout logged successfully",
            "progress_id": progress_id,
            "workout_type": request.type,
            "date": request.date,
            "exercises_count": len(request.exercises),
            "total_sets": total_sets,
            "total_volume": total_volume,
            "estimated_duration": estimated_duration,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        print(f"Error logging workout: {e}")
        raise HTTPException(status_code=500, detail=f"Error logging workout: {str(e)}")


@router.delete("/progress/{progress_id}")
async def delete_progress(progress_id: str):
    """
    Delete a progress/workout record
    
    Args:
        progress_id: Progress record ID to delete
    
    Returns:
        Success confirmation
    """
    try:
        if not supabase_service.is_connected():
            return {
                "message": "Progress deleted (mock mode)",
                "progress_id": progress_id
            }
        
        # Get the progress record first to verify it exists and get user_id
        progress_result = supabase_service.supabase.table("progress")\
            .select("user_id")\
            .eq("id", progress_id)\
            .single()\
            .execute()
        
        if not progress_result.data:
            raise HTTPException(status_code=404, detail="Progress record not found")
        
        user_id = progress_result.data.get("user_id")
        
        # Delete the progress record
        delete_result = supabase_service.supabase.table("progress")\
            .delete()\
            .eq("id", progress_id)\
            .eq("user_id", user_id)\
            .execute()
        
        # Note: We might want to update streaks here, but for simplicity we'll leave it
        # The streaks will be recalculated on the next workout
        
        return {
            "message": "Progress record deleted successfully",
            "progress_id": progress_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting progress: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting progress: {str(e)}")


