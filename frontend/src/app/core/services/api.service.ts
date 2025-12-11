/**
 * API Service
 * Base service for making HTTP requests to the backend API
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /** Base API URL */
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    // Log API URL on initialization for debugging
    console.log(`[API Service] Initialized with API URL: ${this.apiUrl}`);
    console.log(`[API Service] Environment: ${environment.production ? 'production' : 'development'}`);
    
    // Warn if using localhost in production
    if (environment.production && this.apiUrl.includes('localhost')) {
      console.error('[API Service] ⚠️ WARNING: Using localhost URL in production!', this.apiUrl);
    }
  }

  /**
   * Log error details for debugging
   */
  private handleError(error: HttpErrorResponse, endpoint: string): Observable<never> {
    const errorMessage = error.error?.message || error.message || 'Unknown error';
    const statusCode = error.status || 'Unknown';
    const fullUrl = `${this.apiUrl}${endpoint}`;
    
    console.error(`[API Error] ${error.statusText || 'Error'}`, {
      url: fullUrl,
      endpoint,
      status: statusCode,
      statusText: error.statusText,
      message: errorMessage,
      error: error.error,
      headers: error.headers
    });

    return throwError(() => ({
      ...error,
      apiUrl: fullUrl,
      endpoint,
      userMessage: this.getUserFriendlyMessage(error)
    }));
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }
    if (error.status === 404) {
      return 'El recurso solicitado no fue encontrado.';
    }
    if (error.status === 500) {
      return 'Error interno del servidor. Por favor, intenta más tarde.';
    }
    if (error.status === 401) {
      return 'No autorizado. Por favor, inicia sesión nuevamente.';
    }
    if (error.status === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }
    return error.error?.message || error.message || 'Ocurrió un error inesperado.';
  }

  /**
   * Generic GET request
   * @param endpoint API endpoint (e.g., '/api/v1/chat/history/123')
   */
  get<T>(endpoint: string): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    console.log(`[API] GET ${url}`);
    
    return this.http.get<T>(url).pipe(
      tap(() => console.log(`[API] GET ${url} - Success`)),
      catchError((error) => this.handleError(error, endpoint))
    );
  }

  /**
   * Generic POST request
   * @param endpoint API endpoint
   * @param data Request body
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    console.log(`[API] POST ${url}`, data);
    
    return this.http.post<T>(url, data).pipe(
      tap(() => console.log(`[API] POST ${url} - Success`)),
      catchError((error) => this.handleError(error, endpoint))
    );
  }

  /**
   * Generic PUT request
   * @param endpoint API endpoint
   * @param data Request body
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    console.log(`[API] PUT ${url}`, data);
    
    return this.http.put<T>(url, data).pipe(
      tap(() => console.log(`[API] PUT ${url} - Success`)),
      catchError((error) => this.handleError(error, endpoint))
    );
  }

  /**
   * Generic PATCH request
   * @param endpoint API endpoint
   * @param data Request body
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    console.log(`[API] PATCH ${url}`, data);
    
    return this.http.patch<T>(url, data).pipe(
      tap(() => console.log(`[API] PATCH ${url} - Success`)),
      catchError((error) => this.handleError(error, endpoint))
    );
  }

  /**
   * Generic DELETE request
   * @param endpoint API endpoint
   */
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    console.log(`[API] DELETE ${url}`);
    
    return this.http.delete<T>(url).pipe(
      tap(() => console.log(`[API] DELETE ${url} - Success`)),
      catchError((error) => this.handleError(error, endpoint))
    );
  }
}


