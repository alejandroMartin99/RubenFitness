/**
 * Water Service
 * Handles water intake tracking and history
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { WaterRequest, WaterResponse } from '../models/water.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WaterService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  /**
   * Record water intake (adds to existing amount)
   * @param waterMl Milliliters of water to add
   */
  addWater(waterMl: number): Observable<any> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.apiService.post<any>('/api/v1/water', {
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      water_ml: waterMl
    });
  }

  /**
   * Get water data for current user
   * @param days Number of days to retrieve (default: 7)
   */
  getWaterData(days: number = 7): Observable<WaterResponse> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.apiService.get<WaterResponse>(`/api/v1/water/${user.id}?days=${days}`);
  }
}

