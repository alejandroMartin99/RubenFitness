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
      // Mock authentication - replace with actual Supabase auth
      const found = this.users.find(u => u.email === credentials.email && u.password === credentials.password);
      if (!found) {
        observer.error('Invalid credentials');
        return;
      }
      localStorage.setItem('currentUser', JSON.stringify(found.user));
      this.currentUserSubject.next(found.user);
      observer.next(found.user);
      observer.complete();
    });
  }

  /**
   * Register a new user
   * @param data Registration data
   */
  register(data: RegisterData): Observable<User> {
    return new Observable(observer => {
      // Mock registration - replace with actual Supabase auth
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
    });
  }

  /**
   * Log out the current user
   */
  logout(): void {
    localStorage.removeItem('currentUser');
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


