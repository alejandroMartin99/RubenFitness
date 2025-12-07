import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProgressService } from '../../../core/services/progress.service';
import { ChartData } from '../../../core/models/progress.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-progress-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit, OnDestroy {
  workoutsChart: Chart | null = null;
  durationChart: Chart | null = null;
  ratingChart: Chart | null = null;
  loading = true;
  selectedPeriod: '7' | '30' | '90' = '30';
  
  private destroy$ = new Subject<void>();

  constructor(private progressService: ProgressService) {}

  ngOnInit(): void {
    this.loadCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  /**
   * Load charts data
   */
  loadCharts(): void {
    this.loading = true;
    const days = parseInt(this.selectedPeriod);

    // Load workouts chart
    this.progressService.getWorkoutsChartData(days)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.createWorkoutsChart(data);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading workouts chart:', err);
          this.loading = false;
        }
      });

    // Load duration chart
    this.progressService.getDurationChartData(days)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.createDurationChart(data);
        },
        error: (err) => {
          console.error('Error loading duration chart:', err);
        }
      });

    // Load rating chart
    this.progressService.getPerformanceMetrics(days)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => {
          const ratingData = this.buildRatingChartData(metrics);
          this.createRatingChart(ratingData);
        },
        error: (err) => {
          console.error('Error loading rating chart:', err);
        }
      });
  }

  /**
   * Create workouts chart
   */
  private createWorkoutsChart(data: ChartData): void {
    const canvas = document.getElementById('workoutsChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Destroy existing chart
    if (this.workoutsChart) {
      this.workoutsChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Workouts Over Time',
            font: {
              size: 16,
              weight: '600'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    this.workoutsChart = new Chart(canvas, config);
  }

  /**
   * Create duration chart
   */
  private createDurationChart(data: ChartData): void {
    const canvas = document.getElementById('durationChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.durationChart) {
      this.durationChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        ...data,
        datasets: [{
          ...data.datasets[0],
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Total Duration (minutes)',
            font: {
              size: 16,
              weight: '600'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    this.durationChart = new Chart(canvas, config);
  }

  /**
   * Build rating chart data
   */
  private buildRatingChartData(metrics: any[]): ChartData {
    const ratings = metrics
      .filter(m => m.averageRating)
      .map(m => m.averageRating);
    
    return {
      labels: metrics
        .filter(m => m.averageRating)
        .map(m => m.date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Average Rating',
        data: ratings,
        backgroundColor: 'rgba(255, 193, 7, 0.6)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    };
  }

  /**
   * Create rating chart
   */
  private createRatingChart(data: ChartData): void {
    const canvas = document.getElementById('ratingChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.ratingChart) {
      this.ratingChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Workout Satisfaction Rating',
            font: {
              size: 16,
              weight: '600'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    this.ratingChart = new Chart(canvas, config);
  }

  /**
   * Destroy all charts
   */
  private destroyCharts(): void {
    if (this.workoutsChart) {
      this.workoutsChart.destroy();
      this.workoutsChart = null;
    }
    if (this.durationChart) {
      this.durationChart.destroy();
      this.durationChart = null;
    }
    if (this.ratingChart) {
      this.ratingChart.destroy();
      this.ratingChart = null;
    }
  }

  /**
   * Change time period
   */
  onPeriodChange(): void {
    this.destroyCharts();
    this.loadCharts();
  }
}

