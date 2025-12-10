import { Component, OnInit, Input, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CoachService } from '../../../core/services/coach.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('workoutsChart') workoutsChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('volumeChart') volumeChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('bodyCompChart') bodyCompChartCanvas!: ElementRef<HTMLCanvasElement>;

  userId!: string;
  loading = true;
  error: string | null = null;
  details: any = null;

  workoutsChart: Chart | null = null;
  volumeChart: Chart | null = null;
  bodyCompChart: Chart | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private coachService: CoachService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.loadDetails();
    });
  }

  goBack(): void {
    this.router.navigate(['/coach']);
  }

  ngAfterViewInit(): void {
    // Charts will be created after data loads
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  loadDetails(): void {
    this.loading = true;
    this.error = null;

    this.coachService.getUserDetails(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data.success) {
            this.details = data;
            this.loading = false;
            
            setTimeout(() => {
              this.createCharts();
            }, 100);
          } else {
            this.error = 'Error al cargar los detalles';
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error loading details:', err);
          this.error = 'Error al cargar los detalles del usuario';
          this.loading = false;
        }
      });
  }

  createCharts(): void {
    if (!this.details) return;

    // Workouts over time chart
    if (this.workoutsChartCanvas && this.details.workouts) {
      const workouts = this.details.workouts.slice().reverse();
      const labels = workouts.map((w: any) => {
        const date = new Date(w.workout_date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
      
      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Workouts',
            data: workouts.map(() => 1),
            borderColor: '#f6c343',
            backgroundColor: 'rgba(246, 195, 67, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f1f24' }
            },
            x: {
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f1f24' }
            }
          }
        }
      };
      
      this.workoutsChart = new Chart(this.workoutsChartCanvas.nativeElement, config);
    }

    // Volume chart
    if (this.volumeChartCanvas && this.details.workouts) {
      const workouts = this.details.workouts.slice().reverse();
      const labels = workouts.map((w: any) => {
        const date = new Date(w.workout_date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
      
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Volumen (kg)',
            data: workouts.map((w: any) => w.total_volume || 0),
            backgroundColor: 'rgba(246, 195, 67, 0.6)',
            borderColor: '#f6c343',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f1f24' }
            },
            x: {
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f1f24' }
            }
          }
        }
      };
      
      this.volumeChart = new Chart(this.volumeChartCanvas.nativeElement, config);
    }

    // Body composition chart
    if (this.bodyCompChartCanvas && this.details.bodyComposition) {
      const comp = this.details.bodyComposition.slice().reverse();
      const labels = comp.map((c: any) => {
        const date = new Date(c.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
      
      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Peso (kg)',
              data: comp.map((c: any) => c.weight || null),
              borderColor: '#f6c343',
              backgroundColor: 'rgba(246, 195, 67, 0.1)',
              tension: 0.4,
              fill: false
            },
            {
              label: '% Grasa',
              data: comp.map((c: any) => c.fat || null),
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              fill: false
            },
            {
              label: 'Músculo (kg)',
              data: comp.map((c: any) => c.muscle || null),
              borderColor: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: { color: '#9ca3af' }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f1f24' }
            },
            x: {
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f1f24' }
            }
          }
        }
      };
      
      this.bodyCompChart = new Chart(this.bodyCompChartCanvas.nativeElement, config);
    }
  }

  destroyCharts(): void {
    if (this.workoutsChart) {
      this.workoutsChart.destroy();
      this.workoutsChart = null;
    }
    if (this.volumeChart) {
      this.volumeChart.destroy();
      this.volumeChart = null;
    }
    if (this.bodyCompChart) {
      this.bodyCompChart.destroy();
      this.bodyCompChart = null;
    }
  }

  formatNumber(value: number | null): string {
    if (value === null || value === undefined) return '-';
    return value.toFixed(1);
  }

  formatVolume(value: number): string {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(0);
  }

  parseWorkoutNotes(notes: string): any {
    try {
      return JSON.parse(notes);
    } catch {
      return null;
    }
  }

  openWhatsApp(phone: string, name: string): void {
    this.coachService.openWhatsApp(phone, name);
  }

  getHabitLogs(habitId: string): any[] {
    if (!this.details?.habitLogs) return [];
    return this.details.habitLogs.filter((log: any) => log.habit_id === habitId || log.habits?.id === habitId);
  }
}

