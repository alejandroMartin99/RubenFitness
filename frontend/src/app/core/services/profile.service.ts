import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface UserProfile {
  fullName?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string; // ISO
  heightCm?: number;
  weightKg?: number;
  bodyFatPercent?: number;
  muscleMassKg?: number;
  phone?: string;
  goal?: string; // e.g., lose weight, gain muscle
  trainingFrequency?: 'lt2' | '2-3' | '4+' | '';
  activityLevel?: 'low' | 'medium' | 'high';
  // Habits breakdown
  diet?: string;
  sleepHoursTarget?: number;
  waterGoalMl?: number;
  injuries?: string[];
  allergies?: string;
  medication?: string;
  trainingExperience?: string;
  equipment?: string[];
  availabilityDays?: string[];
  availabilityHours?: string[];
  stressLevel?: string;
  nutritionPreference?: string;
  smoking?: boolean;
  alcohol?: boolean;
  notes?: string;
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
    const join = (v: any) => Array.isArray(v) ? v.join(',') : v ?? null;
    this.api.post<any>('/api/v1/profile', {
      user_id: uid,
      full_name: profile.fullName,
      gender: profile.gender,
      birth_date: profile.birthDate,
      height_cm: profile.heightCm,
      weight_kg: profile.weightKg,
      body_fat_percent: profile.bodyFatPercent,
      muscle_mass_kg: profile.muscleMassKg,
      goal: profile.goal,
      training_frequency: profile.trainingFrequency,
      activity_level: profile.activityLevel,
      // new fields
      diet: profile.diet,
      sleep_hours_target: profile.sleepHoursTarget,
      water_goal_ml: profile.waterGoalMl,
      injuries: join(profile.injuries),
      medication: profile.medication,
      training_experience: profile.trainingExperience,
      equipment: join(profile.equipment),
      availability_hours: join(profile.availabilityHours),
      stress_level: profile.stressLevel,
      nutrition_preference: profile.nutritionPreference,
      smoking: profile.smoking,
      alcohol: profile.alcohol,
      notes: profile.notes,
      habits: profile.habits,
      photo_url: profile.photoUrl,
      phone: profile.phone
    }).subscribe({ next: () => {}, error: () => {} });
  }

  /** Fetch profile from backend and cache locally */
  fetchProfileFromBackend() {
    const uid = this.authService.getCurrentUser()?.id;
    if (!uid) return null;

    const normalize = (data: any): UserProfile => {
      const profile: UserProfile = {};
      const setIf = (key: keyof UserProfile, value: any) => {
        if (value !== undefined && value !== null && value !== '') {
          (profile as any)[key] = value;
        }
      };

      setIf('fullName', data?.full_name);
      setIf('gender', data?.gender);
      setIf('birthDate', data?.birth_date);
      setIf('heightCm', data?.height_cm);
      setIf('weightKg', data?.weight_kg);
      setIf('bodyFatPercent', data?.body_fat_percent);
      setIf('muscleMassKg', data?.muscle_mass_kg);
      setIf('goal', data?.goal);
      setIf('trainingFrequency', data?.training_frequency);
      setIf('activityLevel', data?.activity_level);
      setIf('diet', data?.diet);
      setIf('sleepHoursTarget', data?.sleep_hours_target);
      setIf('waterGoalMl', data?.water_goal_ml);

      const injuries = this.parseCsv(data?.injuries);
      if (injuries && injuries.length) setIf('injuries', injuries);

      setIf('medication', data?.medication);
      setIf('trainingExperience', data?.training_experience);

      const equipment = this.parseCsv(data?.equipment);
      if (equipment && equipment.length) setIf('equipment', equipment);

      const availabilityHours = this.parseCsv(data?.availability_hours);
      if (availabilityHours && availabilityHours.length) setIf('availabilityHours', availabilityHours);

      setIf('stressLevel', data?.stress_level);
      setIf('nutritionPreference', data?.nutrition_preference);
      if (data?.smoking !== undefined && data?.smoking !== null) setIf('smoking', data.smoking);
      if (data?.alcohol !== undefined && data?.alcohol !== null) setIf('alcohol', data.alcohol);
      setIf('notes', data?.notes);
      setIf('habits', data?.habits);
      setIf('photoUrl', data?.photo_url);
      setIf('phone', data?.phone);

      return profile;
    };

    return new Observable<UserProfile>((subscriber) => {
      this.api.get<any>(`/api/v1/profile/${uid}`).subscribe({
        next: (data) => {
          const normalized = normalize(data || {});
          this.saveProfile(normalized);
          subscriber.next(normalized);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err)
      });
    });
  }

  private parseCsv(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      const parts = value.split(',').map(v => v.trim()).filter(Boolean);
      return parts;
    }
    return [];
  }
}


