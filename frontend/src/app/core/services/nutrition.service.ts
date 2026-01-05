import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface NutritionPlan {
  id: string;
  user_id: string;
  coach_id?: string;
  name: string;
  description?: string;
  daily_calories?: number;
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NutritionMeal {
  id: string;
  plan_id: string;
  meal_type: string;
  meal_order: number;
  name: string;
  description?: string;
  day_of_week?: string;
  calories?: number;
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;
  time_suggestion?: string;
  foods?: MealFood[];
  created_at: string;
  updated_at: string;
}

export interface MealFood {
  name: string;
  portion: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface ChatMessage {
  id?: string;
  user_id: string;
  coach_id?: string;
  sender_id: string;
  sender_role: 'user' | 'coach';
  message: string;
  message_type?: string;
  metadata?: any;
  is_read?: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  constructor(private api: ApiService) {}

  // =====================================================
  // PLANS
  // =====================================================

  getUserPlan(userId: string): Observable<{ plan: NutritionPlan | null; meals: NutritionMeal[] }> {
    return this.api.get(`/api/v1/nutrition/plan/${userId}`);
  }

  getAllUserPlans(userId: string): Observable<{ plans: NutritionPlan[] }> {
    return this.api.get(`/api/v1/nutrition/plans/${userId}`);
  }

  createPlan(plan: Partial<NutritionPlan>): Observable<{ plan: NutritionPlan }> {
    return this.api.post('/api/v1/nutrition/plan', plan);
  }

  updatePlan(planId: string, updates: Partial<NutritionPlan>): Observable<{ plan: NutritionPlan }> {
    return this.api.patch(`/api/v1/nutrition/plan/${planId}`, updates);
  }

  deletePlan(planId: string): Observable<{ success: boolean }> {
    return this.api.delete(`/api/v1/nutrition/plan/${planId}`);
  }

  // =====================================================
  // MEALS
  // =====================================================

  addMeal(planId: string, meal: Partial<NutritionMeal>): Observable<{ meal: NutritionMeal }> {
    return this.api.post(`/api/v1/nutrition/meal/${planId}`, meal);
  }

  updateMeal(mealId: string, updates: Partial<NutritionMeal>): Observable<{ meal: NutritionMeal }> {
    return this.api.patch(`/api/v1/nutrition/meal/${mealId}`, updates);
  }

  deleteMeal(mealId: string): Observable<{ success: boolean }> {
    return this.api.delete(`/api/v1/nutrition/meal/${mealId}`);
  }

  // =====================================================
  // CHAT
  // =====================================================

  getChatMessages(userId: string, limit: number = 50): Observable<{ messages: ChatMessage[] }> {
    return this.api.get(`/api/v1/nutrition/chat/${userId}?limit=${limit}`);
  }

  sendMessage(message: ChatMessage): Observable<{ message: ChatMessage }> {
    return this.api.post('/api/v1/nutrition/chat', message);
  }

  markMessagesRead(userId: string, readerRole: 'user' | 'coach'): Observable<{ success: boolean }> {
    return this.api.patch(`/api/v1/nutrition/chat/read/${userId}?reader_role=${readerRole}`, {});
  }

  getUnreadCount(userId: string, readerRole: 'user' | 'coach'): Observable<{ unread: number }> {
    return this.api.get(`/api/v1/nutrition/chat/unread/${userId}?reader_role=${readerRole}`);
  }

  // =====================================================
  // COACH
  // =====================================================

  getCoachClients(): Observable<{ clients: any[] }> {
    return this.api.get('/api/v1/nutrition/coach/clients');
  }
}

