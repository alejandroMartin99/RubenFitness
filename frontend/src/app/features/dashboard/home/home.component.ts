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
    caloriesBurned: null as number | null,
    goalCompletion: null as number | null,
    dayStreak: null as number | null,
    loading: false
  };

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
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    this.api.get<{ workout_days: string[] }>(`/api/v1/workout/${this.user.id}?year=${year}&month=${month}`)
      .subscribe({
        next: (res) => {
          this.stats.daysActive = Array.isArray(res.workout_days) ? res.workout_days.length : 0;
          // Datos no disponibles aún: mostramos null para que el template ponga '-'
          this.stats.caloriesBurned = null;
          this.stats.goalCompletion = null;
          this.stats.dayStreak = null;
          this.stats.loading = false;
        },
        error: () => {
          this.stats.loading = false;
        }
      });
  }
}

