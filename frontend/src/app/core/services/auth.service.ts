/**
 * Authentication Service
 * Handles user authentication and session management
 */

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { User, LoginCredentials, RegisterData } from '../models/user.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** Current user observable */
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  /** Mock users for development (simple in-memory auth) */
  private readonly users: Array<{ email: string; password: string; user: User }> = [
    {
      email: 'admin@ruben.fitness',
      password: 'admin',
      user: {
        id: 'admin-1',
        email: 'admin@ruben.fitness',
        fullName: 'Admin',
        role: 'admin',
        fitnessLevel: 'advanced'
      }
    },
    {
      email: 'tester@ruben.fitness',
      password: 'tester',
      user: {
        id: 'tester-1',
        email: 'tester@ruben.fitness',
        fullName: 'Tester',
        role: 'user',
        fitnessLevel: 'intermediate'
      }
    }
  ];

  constructor(private apiService: ApiService) {
    // Check if user is already logged in (check localStorage, session, etc.)
    this.checkAuthStatus();
  }

  /**
   * Check if user is currently authenticated
   */
  private checkAuthStatus(): void {
    // In a real app, you'd check Supabase session here
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  /**
   * Log in with email and password
   * @param credentials Login credentials
   */
  login(credentials: LoginCredentials): Observable<User> {
    return new Observable(observer => {
      // Try backend API first, fallback to mock if backend not available
      this.apiService.post<any>('/api/v1/auth/login', credentials).subscribe({
        next: (response) => {
          const user: User = {
            id: response.user.id,
            email: response.user.email,
            fullName: response.user.full_name,
            role: response.user.role,
            fitnessLevel: response.user.fitness_level,
            age: response.user.age
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('accessToken', response.access_token);
          this.currentUserSubject.next(user);
          observer.next(user);
          observer.complete();
        },
        error: (err) => {
          console.log('Backend not available, using mock auth');
          // Fallback to mock
          const found = this.users.find(u => u.email === credentials.email && u.password === credentials.password);
          if (!found) {
            observer.error('Invalid credentials');
            return;
          }
          localStorage.setItem('currentUser', JSON.stringify(found.user));
          this.currentUserSubject.next(found.user);
          observer.next(found.user);
          observer.complete();
        }
      });
    });
  }

  /**
   * Register a new user
   * @param data Registration data
   */
  register(data: RegisterData): Observable<User> {
    return new Observable(observer => {
      // Try backend API first, fallback to mock if backend not available
      this.apiService.post<any>('/api/v1/auth/register', {
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        age: data.age,
        fitness_level: data.fitnessLevel
      }).subscribe({
        next: (response) => {
          const newUser: User = {
            id: response.user.id,
            email: response.user.email,
            fullName: response.user.full_name,
            role: response.user.role,
            fitnessLevel: response.user.fitness_level,
            age: response.user.age
          };
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          localStorage.setItem('accessToken', response.access_token);
          this.currentUserSubject.next(newUser);
          observer.next(newUser);
          observer.complete();
        },
        error: (err) => {
          console.log('Backend not available, using mock auth');
          // Fallback to mock
          const newUser: User = {
            id: 'user-' + Date.now(),
            email: data.email,
            fullName: data.fullName,
            age: data.age,
            fitnessLevel: data.fitnessLevel,
            role: 'user'
          };
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          this.currentUserSubject.next(newUser);
          observer.next(newUser);
          observer.complete();
        }
      });
    });
  }

  /**
   * Log out the current user
   */
  logout(): void {
    // Try backend logout first
    this.apiService.post<any>('/api/v1/auth/logout', {}).subscribe({
      next: () => {
        console.log('Logged out from backend');
      },
      error: () => {
        console.log('Backend not available');
      }
    });
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    this.currentUserSubject.next(null);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /** Check if current user has admin role */
  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  /** Check if current user has any of the provided roles */
  hasRole(roles: string[]): boolean {
    const role = this.currentUserSubject.value?.role;
    return role ? roles.includes(role) : false;
  }
}


