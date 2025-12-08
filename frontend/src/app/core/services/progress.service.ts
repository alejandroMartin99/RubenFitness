/**
 * Progress Service
 * Handles workout progress tracking, achievements, streaks, and photos
 */

import { Injectable } from '@angular/core';
import { Observable, from, forkJoin } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { SupabaseService } from './supabase.service';
import { 
  ProgressSummary, 
  ProgressStats, 
  WorkoutRecord,
  Achievement,
  Streak,
  ProgressPhoto,
  PerformanceMetric,
  ChartData
} from '../models/progress.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  constructor(
    private apiService: ApiService,
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  /**
   * Record workout completion
   * Automatically updates streaks and checks for achievements
   * @param workoutId Workout identifier
   * @param notes Optional notes
   */
  recordWorkout(workoutId: string, notes?: string): Observable<any> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.apiService.post<any>('/api/v1/progress', {
      user_id: user.id,
      workout_id: workoutId,
      date: new Date().toISOString(),
      notes
    }).pipe(
      tap((result) => {
        // Automatically check for new achievements (non-blocking)
        // This happens in the backend automatically, but we can also call it here
        this.apiService.post<any>('/api/v1/motivation/check-achievements', {
          user_id: user.id
        }).subscribe({
          next: (achievements) => {
            if (achievements.newly_unlocked && achievements.newly_unlocked.length > 0) {
              console.log('New achievements unlocked:', achievements.newly_unlocked);
              // You could show a notification here
            }
          },
          error: (err) => {
            console.error('Error checking achievements:', err);
          }
        });
      })
    );
  }

  /**
   * Log a detailed workout with exercises
   */
  logWorkout(payload: any): Observable<any> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const body = {
      user_id: user.id,
      date: payload.date,
      type: payload.type,
      notes: payload.notes,
      exercises: payload.exercises
    };

    return this.apiService.post<any>('/api/v1/progress/log-workout', body).pipe(
      catchError((err) => {
        console.warn('Backend log-workout not available, returning mock data', err);
        return from(Promise.resolve(body));
      })
    );
  }

  /**
   * Get progress summary for current user
   */
  getSummary(): Observable<ProgressSummary> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.apiService.get<ProgressSummary>(`/api/v1/progress/${user.id}`);
  }

  /**
   * Get detailed progress statistics
   */
  getStats(): Observable<ProgressStats> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.apiService.get<ProgressStats>(`/api/v1/progress/${user.id}/stats`);
  }

  /**
   * Get user achievements
   */
  getAchievements(): Observable<Achievement[]> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return from(
      this.supabaseService.getClient()
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          type: item.type,
          title: item.title,
          description: item.description,
          icon: item.icon,
          unlockedAt: new Date(item.unlocked_at),
          progress: item.progress,
          target: item.target
        }));
      })
    );
  }

  /**
   * Get user streak information
   */
  getStreak(): Observable<Streak> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return from(
      this.supabaseService.getClient()
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error && error.code !== 'PGRST116') throw error;
        
        if (!data) {
          // Return default streak if none exists
          return {
            current: 0,
            longest: 0,
            weeklyStreak: 0,
            monthlyStreak: 0
          };
        }

        return {
          current: data.current_streak || 0,
          longest: data.longest_streak || 0,
          lastWorkoutDate: data.last_workout_date ? new Date(data.last_workout_date) : undefined,
          weeklyStreak: data.weekly_streak || 0,
          monthlyStreak: data.monthly_streak || 0
        };
      })
    );
  }

  /**
   * Get progress photos (before/after)
   */
  getProgressPhotos(): Observable<ProgressPhoto[]> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return from(
      this.supabaseService.getClient()
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('taken_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          photoType: item.photo_type,
          photoUrl: item.photo_url,
          thumbnailUrl: item.thumbnail_url,
          takenAt: new Date(item.taken_at),
          notes: item.notes,
          measurements: item.measurements
        }));
      })
    );
  }

  /**
   * Save progress photo
   */
  saveProgressPhoto(photo: Omit<ProgressPhoto, 'id' | 'takenAt'>): Observable<ProgressPhoto> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return from(
      this.supabaseService.getClient()
        .from('progress_photos')
        .insert({
          user_id: user.id,
          photo_type: photo.photoType,
          photo_url: photo.photoUrl,
          thumbnail_url: photo.thumbnailUrl,
          notes: photo.notes,
          measurements: photo.measurements
        })
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return {
          id: data.id,
          userId: data.user_id,
          photoType: data.photo_type,
          photoUrl: data.photo_url,
          thumbnailUrl: data.thumbnail_url,
          takenAt: new Date(data.taken_at),
          notes: data.notes,
          measurements: data.measurements
        };
      })
    );
  }

  /**
   * Delete progress photo
   */
  deleteProgressPhoto(photoId: string): Observable<void> {
    return from(
      this.supabaseService.getClient()
        .from('progress_photos')
        .delete()
        .eq('id', photoId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Get performance metrics over time
   * @param days Number of days to retrieve (default: 30)
   */
  getPerformanceMetrics(days: number = 30): Observable<PerformanceMetric[]> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return from(
      this.supabaseService.getClient()
        .from('progress')
        .select('workout_date, duration_minutes, satisfaction_rating')
        .eq('user_id', user.id)
        .gte('workout_date', startDate.toISOString().split('T')[0])
        .order('workout_date', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        
        // Group by date
        const grouped = (data || []).reduce((acc: any, item: any) => {
          const date = item.workout_date;
          if (!acc[date]) {
            acc[date] = {
              date: new Date(date),
              workouts: 0,
              totalDuration: 0,
              ratings: [] as number[]
            };
          }
          acc[date].workouts++;
          acc[date].totalDuration += item.duration_minutes || 0;
          if (item.satisfaction_rating) {
            acc[date].ratings.push(item.satisfaction_rating);
          }
          return acc;
        }, {});

        return Object.values(grouped).map((item: any) => ({
          date: item.date,
          workouts: item.workouts,
          totalDuration: item.totalDuration,
          averageRating: item.ratings.length > 0
            ? item.ratings.reduce((a: number, b: number) => a + b, 0) / item.ratings.length
            : undefined
        })) as PerformanceMetric[];
      })
    );
  }

  /**
   * Get chart data for workouts over time
   */
  getWorkoutsChartData(days: number = 30): Observable<ChartData> {
    return this.getPerformanceMetrics(days).pipe(
      map((metrics) => {
        return {
          labels: metrics.map(m => m.date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Workouts',
            data: metrics.map(m => m.workouts),
            backgroundColor: 'rgba(102, 126, 234, 0.6)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 2
          }]
        };
      })
    );
  }

  /**
   * Get chart data for duration over time
   */
  getDurationChartData(days: number = 30): Observable<ChartData> {
    return this.getPerformanceMetrics(days).pipe(
      map((metrics) => {
        return {
          labels: metrics.map(m => m.date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Duration (minutes)',
            data: metrics.map(m => m.totalDuration),
            backgroundColor: 'rgba(118, 75, 162, 0.6)',
            borderColor: 'rgba(118, 75, 162, 1)',
            borderWidth: 2
          }]
        };
      })
    );
  }

  /**
   * Check and unlock achievements automatically
   */
  checkAchievements(): Observable<Achievement[]> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // This would typically be called after recording a workout
    // The backend should handle achievement unlocking logic
    return this.getAchievements();
  }
}

