/**
 * Progress Service
 * Handles workout progress tracking, achievements, streaks, and photos
 */

import { Injectable } from '@angular/core';
import { Observable, from, forkJoin, of } from 'rxjs';
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

    return this.apiService.get<any>(`/api/v1/progress/${user.id}`).pipe(
      map((response) => {
        // Ensure recentWorkouts is always an array
        const summary: ProgressSummary = {
          userId: response.user_id || user.id,
          totalWorkouts: response.total_workouts || 0,
          currentStreak: response.current_streak || 0,
          recentWorkouts: response.recent_workouts || [],
          createdAt: response.created_at ? new Date(response.created_at) : new Date()
        };
        
        // Map recentWorkouts to WorkoutRecord format if needed
        if (summary.recentWorkouts && summary.recentWorkouts.length > 0) {
          summary.recentWorkouts = summary.recentWorkouts.map((w: any) => ({
            workoutId: w.workout_id || w.id || '',
            name: w.name || 'Workout',
            completed: w.completed !== undefined ? w.completed : true,
            date: w.date ? (w.date instanceof Date ? w.date : new Date(w.date)) : new Date(),
            durationMinutes: w.duration_minutes
          }));
        }
        
        return summary;
      }),
      catchError((error) => {
        console.error('Error mapping progress summary:', error);
        // Return empty summary on error
        return of({
          userId: user.id,
          totalWorkouts: 0,
          currentStreak: 0,
          recentWorkouts: [],
          createdAt: new Date()
        });
      })
    );
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
   * Delete a workout/progress record
   */
  deleteWorkout(progressId: string): Observable<any> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.apiService.delete<any>(`/api/v1/progress/${progressId}`);
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
   * Get chart data for volume over time
   */
  getVolumeChartData(days: number = 30): Observable<ChartData> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return from(
      this.supabaseService.getClient()
        .from('progress')
        .select('workout_date, notes')
        .eq('user_id', user.id)
        .gte('workout_date', startDate.toISOString().split('T')[0])
        .order('workout_date', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        
        const volumeByDate: { [key: string]: number } = {};
        
        (data || []).forEach((item: any) => {
          const date = item.workout_date;
          try {
            // Try to extract volume from notes JSON
            const notes = item.notes || '';
            const jsonMatch = notes.match(/WORKOUT_DATA:\s*({[\s\S]*?})/);
            if (jsonMatch) {
              const workoutData = JSON.parse(jsonMatch[1]);
              if (workoutData.total_volume) {
                volumeByDate[date] = (volumeByDate[date] || 0) + workoutData.total_volume;
              }
            }
          } catch (e) {
            // Ignore parsing errors
          }
        });

        const dates = Object.keys(volumeByDate).sort();
        return {
          labels: dates.map(d => new Date(d).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Volumen Total (kg)',
            data: dates.map(d => volumeByDate[d]),
            backgroundColor: 'rgba(250, 204, 21, 0.6)',
            borderColor: 'rgba(250, 204, 21, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        };
      })
    );
  }

  /**
   * Get chart data by muscle group
   */
  getMuscleGroupChartData(days: number = 30): Observable<ChartData> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return from(
      this.supabaseService.getClient()
        .from('progress')
        .select('workout_date, notes')
        .eq('user_id', user.id)
        .gte('workout_date', startDate.toISOString().split('T')[0])
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        
        const muscleGroupMap: { [key: string]: number } = {};
        const muscleGroupFrequency: { [key: string]: number } = {};
        
        // Map workout types to muscle groups
        const typeToMuscles: { [key: string]: string[] } = {
          'Espalda - Bíceps': ['Espalda', 'Bíceps'],
          'Pecho - Tríceps': ['Pecho', 'Tríceps'],
          'Pierna': ['Pierna'],
          'Hombro - Brazo': ['Hombro', 'Brazo'],
          'Full Body': ['Full Body']
        };

        (data || []).forEach((item: any) => {
          try {
            const notes = item.notes || '';
            const jsonMatch = notes.match(/WORKOUT_DATA:\s*({[\s\S]*?})/);
            if (jsonMatch) {
              const workoutData = JSON.parse(jsonMatch[1]);
              const workoutType = workoutData.workout_type || '';
              const volume = workoutData.total_volume || 0;
              
              const muscles = typeToMuscles[workoutType] || [workoutType];
              muscles.forEach(muscle => {
                muscleGroupMap[muscle] = (muscleGroupMap[muscle] || 0) + volume;
                muscleGroupFrequency[muscle] = (muscleGroupFrequency[muscle] || 0) + 1;
              });
            }
          } catch (e) {
            // Ignore parsing errors
          }
        });

        const labels = Object.keys(muscleGroupMap);
        return {
          labels,
          datasets: [{
            label: 'Volumen por Grupo Muscular (kg)',
            data: labels.map(m => muscleGroupMap[m]),
            backgroundColor: [
              'rgba(250, 204, 21, 0.6)',
              'rgba(59, 130, 246, 0.6)',
              'rgba(16, 185, 129, 0.6)',
              'rgba(239, 68, 68, 0.6)',
              'rgba(139, 92, 246, 0.6)',
              'rgba(236, 72, 153, 0.6)'
            ],
            borderColor: [
              'rgba(250, 204, 21, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(16, 185, 129, 1)',
              'rgba(239, 68, 68, 1)',
              'rgba(139, 92, 246, 1)',
              'rgba(236, 72, 153, 1)'
            ],
            borderWidth: 2
          }]
        };
      })
    );
  }

  /**
   * Get muscle group frequency chart data
   */
  getMuscleFrequencyChartData(days: number = 30): Observable<ChartData> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return from(
      this.supabaseService.getClient()
        .from('progress')
        .select('workout_date, notes')
        .eq('user_id', user.id)
        .gte('workout_date', startDate.toISOString().split('T')[0])
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        
        const muscleGroupFrequency: { [key: string]: number } = {};
        const typeToMuscles: { [key: string]: string[] } = {
          'Espalda - Bíceps': ['Espalda', 'Bíceps'],
          'Pecho - Tríceps': ['Pecho', 'Tríceps'],
          'Pierna': ['Pierna'],
          'Hombro - Brazo': ['Hombro', 'Brazo'],
          'Full Body': ['Full Body']
        };

        (data || []).forEach((item: any) => {
          try {
            const notes = item.notes || '';
            const jsonMatch = notes.match(/WORKOUT_DATA:\s*({[\s\S]*?})/);
            if (jsonMatch) {
              const workoutData = JSON.parse(jsonMatch[1]);
              const workoutType = workoutData.workout_type || '';
              const muscles = typeToMuscles[workoutType] || [workoutType];
              muscles.forEach(muscle => {
                muscleGroupFrequency[muscle] = (muscleGroupFrequency[muscle] || 0) + 1;
              });
            }
          } catch (e) {
            // Ignore parsing errors
          }
        });

        const labels = Object.keys(muscleGroupFrequency);
        return {
          labels,
          datasets: [{
            label: 'Frecuencia de Entrenamiento',
            data: labels.map(m => muscleGroupFrequency[m]),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2
          }]
        };
      })
    );
  }

  /**
   * Get exercise volume chart data
   */
  getExerciseVolumeChartData(days: number = 30): Observable<ChartData> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return from(
      this.supabaseService.getClient()
        .from('progress')
        .select('workout_date, notes')
        .eq('user_id', user.id)
        .gte('workout_date', startDate.toISOString().split('T')[0])
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        
        const exerciseVolume: { [key: string]: number } = {};

        (data || []).forEach((item: any) => {
          try {
            const notes = item.notes || '';
            const jsonMatch = notes.match(/WORKOUT_DATA:\s*({[\s\S]*?})/);
            if (jsonMatch) {
              const workoutData = JSON.parse(jsonMatch[1]);
              const exercises = workoutData.exercises || [];
              exercises.forEach((ex: any) => {
                const exerciseName = ex.name || 'Sin nombre';
                const exVolume = ex.sets?.reduce((acc: number, s: any) => 
                  acc + (s.reps || 0) * (s.weight || 0), 0) || 0;
                exerciseVolume[exerciseName] = (exerciseVolume[exerciseName] || 0) + exVolume;
              });
            }
          } catch (e) {
            // Ignore parsing errors
          }
        });

        // Get top 10 exercises by volume
        const sorted = Object.entries(exerciseVolume)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        return {
          labels: sorted.map(([name]) => name),
          datasets: [{
            label: 'Volumen por Ejercicio (kg)',
            data: sorted.map(([, volume]) => volume),
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2
          }]
        };
      })
    );
  }

  /**
   * Get exercise progress chart data (volume over time for top exercises)
   */
  getExerciseProgressChartData(days: number = 30): Observable<ChartData> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return from(
      this.supabaseService.getClient()
        .from('progress')
        .select('workout_date, notes')
        .eq('user_id', user.id)
        .gte('workout_date', startDate.toISOString().split('T')[0])
        .order('workout_date', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        
        // Get all unique exercises
        const exerciseNames = new Set<string>();
        (data || []).forEach((item: any) => {
          try {
            const notes = item.notes || '';
            const jsonMatch = notes.match(/WORKOUT_DATA:\s*({[\s\S]*?})/);
            if (jsonMatch) {
              const workoutData = JSON.parse(jsonMatch[1]);
              const exercises = workoutData.exercises || [];
              exercises.forEach((ex: any) => {
                if (ex.name) exerciseNames.add(ex.name);
              });
            }
          } catch (e) {
            // Ignore
          }
        });

        // Get top 5 exercises
        const topExercises = Array.from(exerciseNames).slice(0, 5);
        
        // Build data by date for each exercise
        const exerciseData: { [key: string]: { [date: string]: number } } = {};
        topExercises.forEach(ex => {
          exerciseData[ex] = {};
        });

        (data || []).forEach((item: any) => {
          const date = item.workout_date;
          try {
            const notes = item.notes || '';
            const jsonMatch = notes.match(/WORKOUT_DATA:\s*({[\s\S]*?})/);
            if (jsonMatch) {
              const workoutData = JSON.parse(jsonMatch[1]);
              const exercises = workoutData.exercises || [];
              exercises.forEach((ex: any) => {
                if (topExercises.includes(ex.name)) {
                  const volume = ex.sets?.reduce((acc: number, s: any) => 
                    acc + (s.reps || 0) * (s.weight || 0), 0) || 0;
                  exerciseData[ex.name][date] = (exerciseData[ex.name][date] || 0) + volume;
                }
              });
            }
          } catch (e) {
            // Ignore
          }
        });

        const dates = Array.from(new Set((data || []).map((item: any) => item.workout_date))).sort();
        const colors = [
          'rgba(250, 204, 21, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)'
        ];

        return {
          labels: dates.map(d => new Date(d).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
          datasets: topExercises.map((ex, idx) => ({
            label: ex,
            data: dates.map(date => exerciseData[ex][date] || 0),
            borderColor: colors[idx % colors.length],
            backgroundColor: colors[idx % colors.length].replace('1)', '0.2)'),
            borderWidth: 2,
            fill: false,
            tension: 0.4
          }))
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

