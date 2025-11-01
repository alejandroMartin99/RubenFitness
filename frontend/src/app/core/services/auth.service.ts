/**
 * Authentication Service
 * Handles user authentication and session management
 */

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { User, LoginCredentials, RegisterData } from '../models/user.model';
import { ApiService } from './api.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** Current user observable */
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  /** Mock users for development (simple in-memory auth) */
  // Using valid UUIDs for compatibility with Supabase
  private readonly users: Array<{ email: string; password: string; user: User }> = [
    {
      email: 'admin@ruben.fitness',
      password: 'admin',
      user: {
        id: '00000000-0000-0000-0000-000000000001', // Valid UUID for admin
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
        id: '00000000-0000-0000-0000-000000000002', // Valid UUID for tester
        email: 'tester@ruben.fitness',
        fullName: 'Tester',
        role: 'user',
        fitnessLevel: 'intermediate'
      }
    }
  ];

  constructor(
    private apiService: ApiService,
    private supabaseService: SupabaseService
  ) {
    // Check if user is already logged in (check localStorage, session, etc.)
    this.checkAuthStatus();
    // Listen to Supabase auth changes
    this.listenToAuthChanges();
  }

  /**
   * Listen to Supabase authentication state changes
   */
  private listenToAuthChanges(): void {
    this.supabaseService.getClient().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.['full_name'] || '',
          role: session.user.user_metadata?.['role'] || 'user',
          fitnessLevel: session.user.user_metadata?.['fitness_level'] || 'beginner'
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('accessToken', session.access_token);
        this.currentUserSubject.next(user);
      } else if (event === 'SIGNED_OUT') {
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
      }
    });
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
          // Fallback to mock - generate valid UUID
          const newUser: User = {
            id: uuidv4(), // Generate valid UUID for Supabase compatibility
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

  /**
   * Login with Google OAuth
   */
  loginWithGoogle(): Observable<User> {
    return new Observable(observer => {
      // Use Supabase Google OAuth
      this.supabaseService.signInWithGoogle().subscribe({
        next: (result) => {
          console.log('Google OAuth result:', result);
          // Supabase OAuth redirects to Google, so we don't get user data here
          // The user will be redirected back after authentication
          observer.complete();
        },
        error: (err) => {
          console.error('Google OAuth error:', err);
          observer.error(err);
        }
      });
    });
  }
}


