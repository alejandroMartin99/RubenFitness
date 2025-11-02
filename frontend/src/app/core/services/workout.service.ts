/**
 * Workout Service
 * Handles workout day tracking and calendar
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  /**
   * Mark a day as having a workout
   * @param workoutDate Date of the workout
   */
  markWorkoutDay(workoutDate: Date): Observable<any> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.apiService.post<any>('/api/v1/workout', {
      user_id: user.id,
      date: workoutDate.toISOString().split('T')[0]
    });
  }

  /**
   * Get workout days for a specific month
   * @param year Year (e.g., 2024)
   * @param month Month (1-12)
   */
  getWorkoutDays(year: number, month: number): Observable<any> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.apiService.get<any>(`/api/v1/workout/${user.id}?year=${year}&month=${month}`);
  }
}

