/**
 * Progress Service
 * Handles workout progress tracking
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ProgressSummary, ProgressStats, WorkoutRecord } from '../models/progress.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  /**
   * Record workout completion
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
    });
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
}

