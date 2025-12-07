import { Component, OnInit } from '@angular/core';
import { ProgressService } from '../../../core/services/progress.service';
import { MotivationService } from '../../../core/services/motivation.service';
import { Streak } from '../../../core/models/progress.model';

@Component({
  selector: 'app-streaks',
  templateUrl: './streaks.component.html',
  styleUrls: ['./streaks.component.scss']
})
export class StreaksComponent implements OnInit {
  streak: Streak | null = null;
  loading = false;
  motivationalMessage = '';
  loadingMessage = false;

  constructor(
    private progressService: ProgressService,
    private motivationService: MotivationService
  ) {}

  ngOnInit(): void {
    this.loadStreak();
    this.loadMotivationalMessage();
  }

  /**
   * Load streak data
   */
  loadStreak(): void {
    this.loading = true;
    this.progressService.getStreak().subscribe({
      next: (streak) => {
        this.streak = streak;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading streak:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Load motivational message from IA
   */
  loadMotivationalMessage(): void {
    this.loadingMessage = true;
    this.motivationService.getMotivationalMessage().subscribe({
      next: (message) => {
        this.motivationalMessage = message;
        this.loadingMessage = false;
      },
      error: (err) => {
        console.error('Error loading motivational message:', err);
        this.motivationalMessage = 'Keep going! You\'re doing great! 💪';
        this.loadingMessage = false;
      }
    });
  }

  /**
   * Refresh motivational message
   */
  refreshMessage(): void {
    this.loadMotivationalMessage();
  }
}

