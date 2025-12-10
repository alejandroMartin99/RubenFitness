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
   * Get the correct redirect URL for OAuth
   * Uses environment variable if available, otherwise falls back to window.location.origin
   */
  private getRedirectUrl(): string {
    // In production, use the production URL from environment or window.location.origin
    const origin = window.location.origin;
    const callbackPath = '/auth/callback';
    
    // Ensure we're using the correct protocol (https in production)
    const protocol = window.location.protocol;
    const host = window.location.host;
    
    // Build the redirect URL
    let redirectUrl = `${protocol}//${host}${callbackPath}`;
    
    // Log for debugging
    console.log('OAuth redirect URL:', redirectUrl);
    
    return redirectUrl;
  }

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle(): Observable<any> {
    const redirectUrl = this.getRedirectUrl();
    console.log('Initiating Google OAuth with redirect:', redirectUrl);
    
    return from(
      this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
    );
  }

  /**
   * Sign in with Apple OAuth
   */
  signInWithApple(): Observable<any> {
    const redirectUrl = this.getRedirectUrl();
    console.log('Initiating Apple OAuth with redirect:', redirectUrl);
    
    return from(
      this.supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl
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

