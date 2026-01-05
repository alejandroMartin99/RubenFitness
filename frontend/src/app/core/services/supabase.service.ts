/**
 * Supabase Service
 * Wrapper for Supabase operations in the frontend
 */

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Observable, from } from 'rxjs';

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

  getClient(): SupabaseClient {
    return this.supabase;
  }

  signUp(email: string, password: string, metadata?: any): Observable<any> {
    return from(
      this.supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      })
    );
  }

  signIn(email: string, password: string): Observable<any> {
    return from(
      this.supabase.auth.signInWithPassword({ email, password })
    );
  }

  private getRedirectUrl(): string {
    return `${window.location.origin}/auth/callback`;
  }

  signInWithGoogle(): Observable<any> {
    return from(
      this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: this.getRedirectUrl(),
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      })
    );
  }

  signInWithApple(): Observable<any> {
    return from(
      this.supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: this.getRedirectUrl() }
      })
    );
  }

  getSession(): Observable<any> {
    return from(this.supabase.auth.getSession());
  }

  signOut(): Observable<any> {
    return from(this.supabase.auth.signOut());
  }

  getCurrentUser(): Observable<any> {
    return from(this.supabase.auth.getUser());
  }

  getUserProfile(userId: string): Observable<any> {
    return from(
      this.supabase.from('users').select('*').eq('id', userId).single()
    );
  }

  updateUserProfile(userId: string, profileData: any): Observable<any> {
    return from(
      this.supabase.from('users').update(profileData).eq('id', userId)
    );
  }

  createUserProfile(userId: string, email: string, profileData: any): Observable<any> {
    return from(
      this.supabase.from('users').insert({ id: userId, email, ...profileData })
    );
  }
}
