import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface UserProfile {
  fullName?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string; // ISO
  heightCm?: number;
  weightKg?: number;
  goal?: string; // e.g., lose weight, gain muscle
  activityLevel?: 'low' | 'medium' | 'high';
  habits?: string;
  photoUrl?: string; // data URL or remote URL
  complexion?: 'ectomorph' | 'mesomorph' | 'endomorph';
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private authService: AuthService, private api: ApiService) {}

  private key(): string {
    const uid = this.authService.getCurrentUser()?.id || 'guest';
    return `rf_profile_${uid}`;
  }

  getProfile(): UserProfile | null {
    // Try backend first (sync), fallback to local
    // Note: This synchronous signature kept for simplicity in component; could be Observable in future
    try {
      // This is a lightweight sync wrapper using local cache; real app should refactor to async
      const cached = localStorage.getItem(this.key());
      if (cached) return JSON.parse(cached) as UserProfile;
    } catch {}
    return null;
  }

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(this.key(), JSON.stringify(profile));
    } catch {}
  }

  /** Persist to backend (fire-and-forget) */
  saveProfileToBackend(profile: UserProfile): void {
    const uid = this.authService.getCurrentUser()?.id;
    if (!uid) return;
    this.api.post<any>('/api/v1/profile', {
      user_id: uid,
      full_name: profile.fullName,
      gender: profile.gender,
      birth_date: profile.birthDate,
      height_cm: profile.heightCm,
      weight_kg: profile.weightKg,
      goal: profile.goal,
      activity_level: profile.activityLevel,
      habits: profile.habits,
      photo_url: profile.photoUrl
    }).subscribe({ next: () => {}, error: () => {} });
  }
}


