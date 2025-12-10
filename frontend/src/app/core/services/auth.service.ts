/**
 * Authentication Service
 * Simplified and robust authentication handling
 */

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { User, LoginCredentials, RegisterData } from '../models/user.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private initialized = false;

  constructor(private supabaseService: SupabaseService) {
    this.initialize();
  }

  /**
   * Initialize auth service - restore session and listen to changes
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    // Restore from localStorage first (synchronous)
    this.restoreFromStorage();

    // Then verify with Supabase (asynchronous)
    this.verifySession();

    // Listen to auth state changes
    this.supabaseService.getClient().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.loadAndSetUser(session.user.id, session.access_token || undefined);
      } else if (event === 'SIGNED_OUT') {
        this.clearUser();
      }
    });
  }

  /**
   * Restore user from localStorage (synchronous for guards)
   */
  private restoreFromStorage(): void {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored) as User;
        // Ensure admin email has admin role
        if (user.email === 'admin@ruben.fitness' && user.role !== 'admin') {
          user.role = 'admin';
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
      }
    } catch (e) {
      console.error('Error restoring from storage:', e);
      this.clearUser();
    }
  }

  /**
   * Verify session with Supabase and update if needed
   */
  private async verifySession(): Promise<void> {
    try {
      const { data: { session }, error } = await this.supabaseService.getClient().auth.getSession();
      if (error || !session?.user) {
        this.clearUser();
        return;
      }

      // Update token if available
      if (session.access_token) {
        localStorage.setItem('accessToken', session.access_token);
      }

      // Load user profile
      await this.loadAndSetUser(session.user.id, session.access_token);
    } catch (error) {
      console.error('Error verifying session:', error);
      // Don't clear on error - keep localStorage state
    }
  }

  /**
   * Load user profile from database and set in state
   */
  private async loadAndSetUser(userId: string, accessToken?: string): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      let user: User;

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist - create basic one
        const session = await this.supabaseService.getClient().auth.getSession();
        const authUser = session.data.session?.user;
        
        const { error: insertError } = await this.supabaseService.getClient()
          .from('users')
          .insert({
            id: userId,
            email: authUser?.email || '',
            full_name: authUser?.user_metadata?.['full_name'] || '',
            role: authUser?.email === 'admin@ruben.fitness' ? 'admin' : 'user',
            fitness_level: 'beginner'
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          // Create minimal user from auth data
          user = {
            id: userId,
            email: authUser?.email || '',
            fullName: authUser?.user_metadata?.['full_name'] || '',
            role: authUser?.email === 'admin@ruben.fitness' ? 'admin' : 'user',
            fitnessLevel: 'beginner'
          };
        } else {
          // Retry fetch after insert
          const { data: newData } = await this.supabaseService.getClient()
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
          user = this.mapUserFromData(newData || { id: userId, email: authUser?.email || '' });
        }
      } else if (data) {
        user = this.mapUserFromData(data);
      } else {
        throw new Error('Failed to load user profile');
      }

      // Ensure admin email has admin role
      if (user.email === 'admin@ruben.fitness' && user.role !== 'admin') {
        user.role = 'admin';
      }

      this.setUser(user);
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Keep existing user state on error
    }
  }

  /**
   * Map database user data to User model
   */
  private mapUserFromData(data: any): User {
    return {
      id: data.id || '',
      email: data.email || '',
      fullName: data.full_name,
      age: data.age,
      fitnessLevel: data.fitness_level,
      role: data.role || (data.email === 'admin@ruben.fitness' ? 'admin' : 'user'),
      goals: data.goals,
      availability: data.availability,
    };
  }

  /**
   * Set user in state and localStorage
   */
  private setUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Clear user from state and storage
   */
  private clearUser(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    const keys = Object.keys(localStorage).filter(k => k.startsWith('rf_profile_'));
    keys.forEach(k => localStorage.removeItem(k));
  }

  /**
   * Log in with email and password
   */
  login(credentials: LoginCredentials): Observable<User> {
    return this.supabaseService.signIn(credentials.email, credentials.password).pipe(
      switchMap(async (result) => {
        if (result.error) {
          throw new Error(result.error.message || 'Invalid credentials');
        }
        if (!result.data.session?.user) {
          throw new Error('No user session returned');
        }

        const userId = result.data.session.user.id;
        const accessToken = result.data.session.access_token;

        // Load user profile
        await this.loadAndSetUser(userId, accessToken);

        const user = this.currentUserSubject.value;
        if (!user) {
          throw new Error('Failed to load user after login');
        }

        return user;
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  /**
   * Register a new user
   */
  register(data: RegisterData): Observable<User> {
    return this.supabaseService.signUp(
      data.email,
      data.password,
      {
        full_name: data.fullName,
        age: data.age,
        fitness_level: data.fitnessLevel
      }
    ).pipe(
      switchMap(async (result) => {
        if (result.error) {
          throw new Error(result.error.message || 'Registration failed');
        }
        if (!result.data.user) {
          throw new Error('No user returned from registration');
        }

        const userId = result.data.user.id;
        
        // Create user profile
        const { error: profileError } = await this.supabaseService.getClient()
          .from('users')
          .insert({
            id: userId,
            email: data.email,
            full_name: data.fullName,
            age: data.age,
            fitness_level: data.fitnessLevel || 'beginner',
            role: 'user'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // Load and set user
        await this.loadAndSetUser(userId);

        const user = this.currentUserSubject.value;
        if (!user) {
          throw new Error('Failed to load user after registration');
        }

        return user;
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  /**
   * Log out the current user
   */
  logout(): Observable<boolean> {
    // Clear local state immediately
    this.clearUser();

    // Attempt Supabase signout (fire and forget)
    return this.supabaseService.signOut().pipe(
      map(() => true),
      catchError((error) => {
        console.warn('Supabase signout error (local state already cleared):', error);
        return of(true); // Return success anyway
      })
    );
  }

  /**
   * Get current user (synchronous)
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated (synchronous for guards)
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Check if current user has admin role
   */
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return user.role === 'admin' || user.email === 'admin@ruben.fitness';
  }

  /**
   * Check if current user has any of the provided roles
   */
  hasRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    // Admin email is always treated as admin
    if (user.email === 'admin@ruben.fitness') {
      return roles.includes('admin');
    }
    
    return user.role ? roles.includes(user.role) : false;
  }

  /**
   * Login with Google OAuth
   */
  loginWithGoogle(): Observable<any> {
    return this.supabaseService.signInWithGoogle();
  }

  /**
   * Login with Apple OAuth
   */
  loginWithApple(): Observable<any> {
    return this.supabaseService.signInWithApple();
  }
}
