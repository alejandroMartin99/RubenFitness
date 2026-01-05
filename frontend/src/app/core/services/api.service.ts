/**
 * API Service
 * Base service for making HTTP requests to the backend API
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse, endpoint: string): Observable<never> {
    // Solo log en desarrollo
    if (!environment.production) {
      console.error(`[API] ${endpoint}`, error.status, error.message);
    }
    return throwError(() => ({
      status: error.status,
      message: error.error?.message || error.message,
      endpoint
    }));
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`).pipe(
      catchError((error) => this.handleError(error, endpoint))
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data).pipe(
      catchError((error) => this.handleError(error, endpoint))
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data).pipe(
      catchError((error) => this.handleError(error, endpoint))
    );
  }

  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, data).pipe(
      catchError((error) => this.handleError(error, endpoint))
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`).pipe(
      catchError((error) => this.handleError(error, endpoint))
    );
  }
}
