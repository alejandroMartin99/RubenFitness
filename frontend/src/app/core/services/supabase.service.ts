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
   * Sign in with Google OAuth
   */
  signInWithGoogle(): Observable<any> {
    return from(
      this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
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
}

