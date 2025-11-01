/**
 * Sleep Service
 * Handles sleep data tracking and history
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SleepRecord, SleepRequest, SleepResponse } from '../models/sleep.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SleepService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  /**
   * Record sleep hours for today
   * @param hours Hours of sleep
   * @param minutes Additional minutes (optional)
   */
  recordSleep(hours: number, minutes: number = 0): Observable<any> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.apiService.post<any>('/api/v1/sleep', {
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      hours: hours,
      minutes: minutes
    });
  }

  /**
   * Get sleep data for current user
   * @param days Number of days to retrieve (default: 7)
   */
  getSleepData(days: number = 7): Observable<SleepResponse> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.apiService.get<SleepResponse>(`/api/v1/sleep/${user.id}?days=${days}`);
  }
}

