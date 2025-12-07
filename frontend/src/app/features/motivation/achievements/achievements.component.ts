import { Component, OnInit } from '@angular/core';
import { ProgressService } from '../../../core/services/progress.service';
import { MotivationService } from '../../../core/services/motivation.service';
import { Achievement } from '../../../core/models/progress.model';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss']
})
export class AchievementsComponent implements OnInit {
  achievements: Achievement[] = [];
  loading = false;
  selectedAchievement: Achievement | null = null;
  showShareDialog = false;

  // Achievement icons mapping
  achievementIcons: { [key: string]: string } = {
    'first_workout': 'star',
    'week_streak': 'local_fire_department',
    'month_streak': 'whatshot',
    'total_workouts': 'fitness_center',
    'perfect_week': 'emoji_events',
    'early_bird': 'wb_sunny',
    'night_owl': 'nightlight',
    'consistency_king': 'trending_up',
    'weight_loss': 'monitor_weight',
    'muscle_gain': 'sports_gymnastics'
  };

  constructor(
    private progressService: ProgressService,
    private motivationService: MotivationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Load achievements and streak data
   */
  loadData(): void {
    this.loading = true;

    // Load achievements
    this.progressService.getAchievements().subscribe({
      next: (achievements) => {
        this.achievements = achievements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading achievements:', err);
        this.loading = false;
      }
    });

  }

  /**
   * Get icon for achievement type
   */
  getAchievementIcon(type: string): string {
    return this.achievementIcons[type] || 'star';
  }

  /**
   * Get achievement color based on type
   */
  getAchievementColor(type: string): string {
    const colors: { [key: string]: string } = {
      'first_workout': '#FFC107',
      'week_streak': '#FF5722',
      'month_streak': '#E91E63',
      'total_workouts': '#2196F3',
      'perfect_week': '#9C27B0',
      'early_bird': '#FF9800',
      'night_owl': '#673AB7',
      'consistency_king': '#4CAF50',
      'weight_loss': '#00BCD4',
      'muscle_gain': '#F44336'
    };
    return colors[type] || '#667eea';
  }

  /**
   * Check if achievement has progress
   */
  hasProgress(achievement: Achievement): boolean {
    return achievement.progress !== undefined && achievement.target !== undefined;
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(achievement: Achievement): number {
    if (!this.hasProgress(achievement)) return 0;
    return Math.min((achievement.progress! / achievement.target!) * 100, 100);
  }

  /**
   * Share achievement
   */
  shareAchievement(achievement: Achievement, platform: 'twitter' | 'facebook' | 'whatsapp' | 'copy'): void {
    this.motivationService.shareAchievement(achievement, platform);
  }

  /**
   * Open share dialog
   */
  openShareDialog(achievement: Achievement): void {
    this.selectedAchievement = achievement;
    this.showShareDialog = true;
  }

  /**
   * Close share dialog
   */
  closeShareDialog(): void {
    this.showShareDialog = false;
    this.selectedAchievement = null;
  }
}

