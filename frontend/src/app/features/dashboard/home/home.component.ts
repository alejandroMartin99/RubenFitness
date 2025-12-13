import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  isAdmin: boolean = false;
  stats = {
    daysActive: null as number | null,
    workoutsWeek: null as number | null,
    weeklyTarget: null as number | null,
    goalCompletion: null as number | null,
    lastWorkout: '' as string,
    loading: false
  };
  private trainingFrequency: string | null = null;

  constructor(
    public authService: AuthService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isAdmin();
    if (this.user && !this.isAdmin) {
      this.loadStats();
    }
  }

  private loadStats(): void {
    if (!this.user) return;
    this.stats.loading = true;
    // Fetch profile to get training frequency
    this.api.get<any>(`/api/v1/profile/${this.user.id}`).subscribe({
      next: (prof) => {
        this.trainingFrequency = prof?.training_frequency || null;
        this.loadWorkoutDays();
      },
      error: () => {
        this.trainingFrequency = null;
        this.loadWorkoutDays();
      }
    });
  }

  private loadWorkoutDays(): void {
    if (!this.user) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    this.api.get<{ workout_days: string[] }>(`/api/v1/workout/${this.user.id}?year=${year}&month=${month}`)
      .subscribe({
        next: (res) => {
          this.stats.daysActive = Array.isArray(res.workout_days) ? res.workout_days.length : 0;
          const days = Array.isArray(res.workout_days) ? res.workout_days : [];
          const last7 = this.countLast7Days(days);
          const target = this.getWeeklyTarget();
          this.stats.workoutsWeek = last7;
          this.stats.weeklyTarget = target;
          this.stats.goalCompletion = target && target > 0
            ? Math.min(150, Math.round((last7 / target) * 100))
            : null;
          this.stats.lastWorkout = this.getLastWorkoutLabel(days);
          this.stats.loading = false;
        },
        error: () => {
          this.stats.loading = false;
        }
      });
  }

  private countLast7Days(days: string[]): number {
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() - 6);
    let count = 0;
    days.forEach(d => {
      const dt = new Date(d);
      if (!isNaN(dt.getTime()) && dt >= limit && dt <= now) {
        count += 1;
      }
    });
    return count;
  }

  private getWeeklyTarget(): number | null {
    const freq = this.trainingFrequency || '';
    if (freq === 'lt2') return 2;
    if (freq === '2-3') return 3;
    if (freq === '4+') return 4;
    return null;
  }

  private getLastWorkoutLabel(days: string[]): string {
    if (!days || days.length === 0) return 'Sin entrenos';
    const parsed = days
      .map(d => new Date(d))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => b.getTime() - a.getTime());
    if (!parsed.length) return 'Sin entrenos';
    return parsed[0].toLocaleDateString();
  }
}

