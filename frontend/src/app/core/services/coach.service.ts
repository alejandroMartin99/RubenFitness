/**
 * Coach Service
 * Handles admin/coach operations for user management and insights
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface ClientKpi {
  label: string;
  value: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export interface ClientRow {
  id: string;
  name: string;
  email: string;
  lastWorkout: string;
  lastWorkoutDate?: string;
  workoutsWeek: number;
  volumeWeek: number;
  workoutsTrend: number;
  volumeTrend: number;
  streak: number;
  longestStreak: number;
  weight: number | null;
  fat: number | null;
  muscle: number | null;
  goals: string[];
  fitnessLevel: string;
  createdAt?: string;
  monthlyWorkouts: number;
  monthlyVolume: number;
  phone?: string | null;
}

export interface AdminDashboardData {
  kpis: {
    activeUsers: number;
    totalUsers: number;
    workoutsWeek: number;
    volumeWeek: number;
    avgStreak: number;
    workoutsTrend: number;
    volumeTrend: number;
    workoutsLastWeek: number;
    volumeLastWeek: number;
  };
  clients: ClientRow[];
  evolution: Array<{
    date: string;
    workouts: number;
    volume: number;
    activeUsers: number;
  }>;
}

interface AdminUsersResponse {
  success: boolean;
  kpis: AdminDashboardData['kpis'];
  clients: ClientRow[];
  evolution: AdminDashboardData['evolution'];
}

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  constructor(private apiService: ApiService) {}

  /**
   * Get all users with detailed metrics
   */
  getAllUsers(): Observable<AdminDashboardData> {
    return this.apiService.get<AdminUsersResponse>('/api/v1/admin/users').pipe(
      map(response => {
        if (response.success) {
          return {
            kpis: response.kpis,
            clients: response.clients,
            evolution: response.evolution
          };
        }
        throw new Error('Failed to fetch users');
      })
    );
  }

  /**
   * Get detailed insights for a specific user
   */
  getUserDetails(userId: string): Observable<any> {
    return this.apiService.get(`/api/v1/admin/user/${userId}/details`);
  }

  /**
   * Format KPIs for display
   */
  formatKpis(kpis: AdminDashboardData['kpis']): ClientKpi[] {
    const workoutsTrendText = kpis.workoutsTrend >= 0 
      ? `+${kpis.workoutsTrend.toFixed(1)}% vs semana pasada`
      : `${kpis.workoutsTrend.toFixed(1)}% vs semana pasada`;
    
    const volumeTrendText = kpis.volumeTrend >= 0
      ? `+${kpis.volumeTrend.toFixed(1)}% vs semana pasada`
      : `${kpis.volumeTrend.toFixed(1)}% vs semana pasada`;

    return [
      {
        label: 'Usuarios activos',
        value: `${kpis.activeUsers} / ${kpis.totalUsers}`,
        trend: `${((kpis.activeUsers / kpis.totalUsers) * 100).toFixed(0)}% activos`,
        trendType: 'neutral'
      },
      {
        label: 'Workouts esta semana',
        value: kpis.workoutsWeek.toString(),
        trend: workoutsTrendText,
        trendType: kpis.workoutsTrend >= 0 ? 'positive' : 'negative'
      },
      {
        label: 'Volumen total',
        value: `${(kpis.volumeWeek / 1000).toFixed(1)}k kg`,
        trend: volumeTrendText,
        trendType: kpis.volumeTrend >= 0 ? 'positive' : 'negative'
      },
      {
        label: 'Racha media',
        value: `${kpis.avgStreak} días`,
        trend: 'Entre usuarios activos',
        trendType: 'neutral'
      },
      {
        label: 'Workouts mes',
        value: `${Math.round(kpis.workoutsWeek * 4.33)} est.`,
        trend: 'Proyección mensual',
        trendType: 'neutral'
      },
      {
        label: 'Volumen mes',
        value: `${(kpis.volumeWeek * 4.33 / 1000).toFixed(1)}k kg est.`,
        trend: 'Proyección mensual',
        trendType: 'neutral'
      }
    ];
  }

  /**
   * Open WhatsApp chat with user
   */
  openWhatsApp(phone: string, name: string): void {
    if (!phone) {
      alert(`No hay número de teléfono registrado para ${name}`);
      return;
    }
    
    // Remove any non-numeric characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // If phone doesn't start with +, assume it's a Spanish number
    const whatsappNumber = cleanPhone.startsWith('+') ? cleanPhone : `+34${cleanPhone}`;
    
    const message = encodeURIComponent(`Hola ${name}, te contacto desde Rubén Fitness para revisar tu progreso.`);
    const url = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`;
    
    window.open(url, '_blank');
  }
}
