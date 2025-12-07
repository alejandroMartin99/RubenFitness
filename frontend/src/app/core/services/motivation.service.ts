/**
 * Motivation Service
 * Handles motivational messages, achievements sharing, and positive reinforcement
 */

import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Achievement } from '../models/progress.model';

@Injectable({
  providedIn: 'root'
})
export class MotivationService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  /**
   * Get motivational message from IA
   */
  getMotivationalMessage(): Observable<string> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return of('Keep going! You\'re doing great! 💪');
    }

    // Try to get from backend IA service
    return this.apiService.post<any>('/api/v1/motivation/message', {
      user_id: user.id
    }).pipe(
      map((response) => {
        return response.message || response.text || 'Keep going! You\'re doing great! 💪';
      }),
      catchError((error) => {
        console.error('Error getting motivational message:', error);
        // Return default messages if backend fails
        const defaultMessages = [
          'Every workout counts! Keep pushing forward! 💪',
          'You\'re stronger than you think! Keep it up! 🔥',
          'Progress is progress, no matter how small! 🌟',
          'Your future self will thank you! Keep going! ⚡',
          'You\'re building something amazing, one workout at a time! 🏋️'
        ];
        return of(defaultMessages[Math.floor(Math.random() * defaultMessages.length)]);
      })
    );
  }

  /**
   * Share achievement on social media
   * @param achievement Achievement to share
   * @param platform Platform to share on
   */
  shareAchievement(achievement: Achievement, platform: 'twitter' | 'facebook' | 'whatsapp' | 'copy'): void {
    const text = `🎉 I just unlocked "${achievement.title}" in Rubén Fitness! ${achievement.description} #Fitness #Achievement`;
    const url = `${window.location.origin}/motivation`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(`${text} ${url}`).then(() => {
          alert('Achievement text copied to clipboard!');
        }).catch(() => {
          alert('Failed to copy to clipboard');
        });
        break;
    }
  }

  /**
   * Get weekly streak message
   */
  getStreakMessage(streakDays: number): string {
    if (streakDays === 0) {
      return 'Start your streak today!';
    } else if (streakDays < 7) {
      return `Great start! ${streakDays} day${streakDays > 1 ? 's' : ''} strong!`;
    } else if (streakDays < 30) {
      return `Amazing! ${streakDays} days in a row! Keep it up!`;
    } else if (streakDays < 100) {
      return `Incredible! ${streakDays} days! You're a consistency champion!`;
    } else {
      return `Legendary! ${streakDays} days! You're unstoppable!`;
    }
  }

  /**
   * Get achievement celebration message
   */
  getAchievementCelebration(achievement: Achievement): string {
    return `🎉 Congratulations! You've unlocked "${achievement.title}"! ${achievement.description}`;
  }
}

