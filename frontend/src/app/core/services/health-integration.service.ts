/**
 * Health Integration Service
 * Handles integration with Google Fit and Apple Health
 */

import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

declare global {
  interface Window {
    google?: any;
    webkit?: any;
  }
}

export interface HealthData {
  steps?: number;
  distance?: number; // in meters
  calories?: number;
  heartRate?: number; // bpm
  activeMinutes?: number;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class HealthIntegrationService {
  private isGoogleFitAvailable = false;
  private isAppleHealthAvailable = false;

  constructor() {
    this.checkAvailability();
  }

  /**
   * Check if Google Fit or Apple Health is available
   */
  private checkAvailability(): void {
    // Check for Google Fit API
    if (typeof window !== 'undefined' && window.google?.fit) {
      this.isGoogleFitAvailable = true;
    }

    // Check for Apple HealthKit (Web API - limited support)
    // Note: Full HealthKit integration requires native iOS app
    if (typeof window !== 'undefined' && 'webkit' in window) {
      // Basic check - full integration requires native app
      this.isAppleHealthAvailable = false; // Web API is very limited
    }
  }

  /**
   * Check if Google Fit is available
   */
  isGoogleFitSupported(): boolean {
    return this.isGoogleFitAvailable;
  }

  /**
   * Check if Apple Health is available
   */
  isAppleHealthSupported(): boolean {
    // Apple HealthKit requires native iOS app
    // Web browsers have very limited access
    return false; // Will be true only in native iOS app
  }

  /**
   * Request permission to access Google Fit data
   */
  requestGoogleFitPermission(): Observable<boolean> {
    if (!this.isGoogleFitAvailable) {
      return of(false);
    }

    return from(
      new Promise<boolean>((resolve) => {
        try {
          // Google Fit API requires OAuth and proper setup
          // This is a placeholder for the actual implementation
          window.google?.fit?.requestAuthorization({
            scopes: [
              'https://www.googleapis.com/auth/fitness.activity.read',
              'https://www.googleapis.com/auth/fitness.heart_rate.read',
              'https://www.googleapis.com/auth/fitness.location.read'
            ]
          }).then(() => {
            resolve(true);
          }).catch(() => {
            resolve(false);
          });
        } catch (error) {
          console.error('Google Fit permission error:', error);
          resolve(false);
        }
      })
    );
  }

  /**
   * Get health data from Google Fit
   */
  getGoogleFitData(startDate: Date, endDate: Date): Observable<HealthData[]> {
    if (!this.isGoogleFitAvailable) {
      return of([]);
    }

    return from(
      new Promise<HealthData[]>((resolve) => {
        try {
          // Placeholder for actual Google Fit API calls
          // Requires proper OAuth setup and API configuration
          window.google?.fit?.getData({
            startTime: startDate.getTime(),
            endTime: endDate.getTime(),
            dataTypes: ['steps', 'distance', 'calories', 'heart_rate']
          }).then((data: any) => {
            const healthData: HealthData[] = data.map((item: any) => ({
              steps: item.steps,
              distance: item.distance,
              calories: item.calories,
              heartRate: item.heartRate,
              activeMinutes: item.activeMinutes,
              date: new Date(item.timestamp)
            }));
            resolve(healthData);
          }).catch((error: any) => {
            console.error('Google Fit data error:', error);
            resolve([]);
          });
        } catch (error) {
          console.error('Google Fit error:', error);
          resolve([]);
        }
      })
    );
  }

  /**
   * Link Google Fit account
   */
  linkGoogleFit(): Observable<boolean> {
    return this.requestGoogleFitPermission().pipe(
      map((granted) => {
        if (granted) {
          // Store the connection status
          localStorage.setItem('googleFitLinked', 'true');
        }
        return granted;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Unlink Google Fit account
   */
  unlinkGoogleFit(): Observable<boolean> {
    localStorage.removeItem('googleFitLinked');
    return of(true);
  }

  /**
   * Check if Google Fit is linked
   */
  isGoogleFitLinked(): boolean {
    return localStorage.getItem('googleFitLinked') === 'true';
  }

  /**
   * Link Apple Health account
   * Note: Full integration requires native iOS app
   */
  linkAppleHealth(): Observable<boolean> {
    // This would require native iOS app integration
    // For web, we can only show instructions
    return of(false);
  }

  /**
   * Unlink Apple Health account
   */
  unlinkAppleHealth(): Observable<boolean> {
    localStorage.removeItem('appleHealthLinked');
    return of(true);
  }

  /**
   * Check if Apple Health is linked
   */
  isAppleHealthLinked(): boolean {
    return localStorage.getItem('appleHealthLinked') === 'true';
  }

  /**
   * Get instructions for linking health services
   */
  getLinkingInstructions(service: 'google-fit' | 'apple-health'): string {
    if (service === 'google-fit') {
      return 'To link Google Fit, you need to authorize the app to access your fitness data. Click the link button to start the authorization process.';
    } else {
      return 'Apple Health integration requires the native iOS app. Please use the mobile app to link your Apple Health data.';
    }
  }

  /**
   * Sync health data from connected services
   */
  syncHealthData(userId: string): Observable<HealthData[]> {
    const allData: HealthData[] = [];
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (this.isGoogleFitLinked()) {
      return this.getGoogleFitData(weekAgo, today).pipe(
        map((data) => {
          // Here you would typically save to your backend/database
          return data;
        }),
        catchError(() => of([]))
      );
    }

    return of([]);
  }
}

