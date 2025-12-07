/**
 * Authentication Service
 * Handles user authentication and session management
 */

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { User, LoginCredentials, RegisterData } from '../models/user.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** Current user observable */
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService
  ) {
    // Check if user is already logged in
    this.checkAuthStatus();
    // Listen to Supabase auth changes
    this.listenToAuthChanges();
  }

  /**
   * Listen to Supabase authentication state changes
   */
  private listenToAuthChanges(): void {
    this.supabaseService.getClient().auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
      }
    });
  }

  /**
   * Load user profile from database
   */
  private async loadUserProfile(userId: string): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading user profile:', error);
        // If profile doesn't exist, create a basic one
        const session = await this.supabaseService.getClient().auth.getSession();
        if (session.data.session?.user) {
          const user: User = {
            id: session.data.session.user.id,
            email: session.data.session.user.email || '',
            fullName: session.data.session.user.user_metadata?.['full_name'] || '',
            role: 'user',
            fitnessLevel: 'beginner',
          };
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          return;
        }
      }

      if (data) {
        const user: User = {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          age: data.age,
          fitnessLevel: data.fitness_level,
          role: data.role,
          goals: data.goals,
          availability: data.availability,
        };
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  }

  /**
   * Check if user is currently authenticated
   */
  private async checkAuthStatus(): Promise<void> {
    try {
      const { data: { session } } = await this.supabaseService.getClient().auth.getSession();
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  }

  /**
   * Log in with email and password
   * @param credentials Login credentials
   */
  login(credentials: LoginCredentials): Observable<User> {
    return this.supabaseService.signIn(credentials.email, credentials.password).pipe(
      switchMap((result) => {
        if (result.error) {
          throw new Error(result.error.message || 'Invalid credentials');
        }
        if (!result.data.session?.user) {
          throw new Error('No user session returned');
        }
        const userId = result.data.session.user.id;
        const accessToken = result.data.session.access_token;
        const session = result.data.session;
        
        // Store access token
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        
        // Get user profile
        return from(
          this.supabaseService.getClient()
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()
        ).pipe(
          switchMap((profileResult) => {
            // If profile doesn't exist, create a basic one
            if (profileResult.error && profileResult.error.code === 'PGRST116') {
              return from(
                this.supabaseService.getClient()
                  .from('users')
                  .insert({
                    id: userId,
                    email: session.user.email || credentials.email,
                    full_name: session.user.user_metadata?.['full_name'],
                    role: 'user',
                    fitness_level: 'beginner'
                  })
              ).pipe(
                map(() => ({
                  data: {
                    id: userId,
                    email: session.user.email || credentials.email,
                    full_name: session.user.user_metadata?.['full_name'],
                    role: 'user',
                    fitness_level: 'beginner'
                  },
                  session: session
                }))
              );
            }
            
            // Profile exists, return it with session
            return from(Promise.resolve({ 
              data: profileResult.data, 
              session: session 
            }));
          })
        );
      }),
      map((result) => {
        const userData = result.data || {};
        const email = userData.email || (result.session?.user?.email || '');
        const user: User = {
          id: userData.id || '',
          email: email,
          fullName: userData.full_name,
          age: userData.age,
          fitnessLevel: userData.fitness_level,
          role: userData.role || 'user',
          goals: userData.goals,
          availability: userData.availability,
        };
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
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
   * @param data Registration data
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
      switchMap((result) => {
        if (result.error) {
          throw new Error(result.error.message || 'Registration failed');
        }
        if (!result.data.user) {
          throw new Error('No user returned from registration');
        }
        // Create user profile in public.users table
        const userId = result.data.user.id;
        return this.supabaseService.createUserProfile(
          userId,
          data.email,
          {
            full_name: data.fullName,
            age: data.age,
            fitness_level: data.fitnessLevel || 'beginner',
            role: 'user'
          }
        ).pipe(
          map(() => result.data.user)
        );
      }),
      map((userData) => {
        const user: User = {
          id: userData.id,
          email: userData.email || data.email,
          fullName: data.fullName,
          age: data.age,
          fitnessLevel: data.fitnessLevel || 'beginner',
          role: 'user',
        };
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
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
  logout(): Observable<any> {
    return this.supabaseService.signOut().pipe(
      map(() => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        this.currentUserSubject.next(null);
      })
    );
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


