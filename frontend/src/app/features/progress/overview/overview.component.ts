import { Component, OnInit } from '@angular/core';
import { ProgressService } from '../../../core/services/progress.service';
import { ProgressSummary, ProgressStats } from '../../../core/models/progress.model';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  summary: ProgressSummary | null = null;
  stats: ProgressStats | null = null;
  loading = false;

  constructor(private progressService: ProgressService) {}

  ngOnInit(): void {
    this.loadProgress();
  }

  /**
   * Load progress data
   */
  loadProgress(): void {
    this.loading = true;

    // Load summary
    this.progressService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading progress summary:', err);
        this.loading = false;
      }
    });

    // Load stats
    this.progressService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        console.error('Error loading progress stats:', err);
      }
    });
  }

  /**
   * Record workout completion
   */
  recordWorkout(workoutId: string): void {
    this.progressService.recordWorkout(workoutId, 'Workout completed').subscribe({
      next: () => {
        console.log('Workout recorded successfully');
        this.loadProgress(); // Reload data
      },
      error: (err) => {
        console.error('Error recording workout:', err);
      }
    });
  }
}
