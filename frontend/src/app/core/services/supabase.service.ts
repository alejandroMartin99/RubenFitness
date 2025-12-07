/**
 * Supabase Service
 * Wrapper for Supabase operations in the frontend
 */

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  /**
   * Get Supabase client instance
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Sign up with email and password
   */
  signUp(email: string, password: string, metadata?: any): Observable<any> {
    return from(
      this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
    );
  }

  /**
   * Sign in with email and password
   */
  signIn(email: string, password: string): Observable<any> {
    return from(
      this.supabase.auth.signInWithPassword({
        email,
        password
      })
    );
  }

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle(): Observable<any> {
    return from(
      this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      })
    );
  }

  /**
   * Sign in with Apple OAuth
   */
  signInWithApple(): Observable<any> {
    return from(
      this.supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      })
    );
  }

  /**
   * Get current session
   */
  getSession(): Observable<any> {
    return from(this.supabase.auth.getSession());
  }

  /**
   * Sign out
   */
  signOut(): Observable<any> {
    return from(this.supabase.auth.signOut());
  }

  /**
   * Get current user
   */
  getCurrentUser(): Observable<any> {
    return from(this.supabase.auth.getUser());
  }

  /**
   * Get user profile from public.users table
   */
  getUserProfile(userId: string): Observable<any> {
    return from(
      this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
    );
  }

  /**
   * Update user profile in public.users table
   */
  updateUserProfile(userId: string, profileData: any): Observable<any> {
    return from(
      this.supabase
        .from('users')
        .update(profileData)
        .eq('id', userId)
    );
  }

  /**
   * Create user profile in public.users table
   */
  createUserProfile(userId: string, email: string, profileData: any): Observable<any> {
    return from(
      this.supabase
        .from('users')
        .insert({
          id: userId,
          email,
          ...profileData
        })
    );
  }
}

