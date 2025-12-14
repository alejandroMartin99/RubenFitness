import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
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
export class ChartsComponent implements OnInit, OnDestroy, AfterViewInit {
  workoutsChart: Chart | null = null;
  durationChart: Chart | null = null;
  volumeChart: Chart | null = null;
  muscleGroupChart: Chart | null = null;
  muscleFrequencyChart: Chart | null = null;
  exerciseVolumeChart: Chart | null = null;
  exerciseProgressChart: Chart | null = null;
  
  loading = true;
  selectedPeriod: '7' | '30' | '90' = '30';
  
  private destroy$ = new Subject<void>();

  constructor(private progressService: ProgressService) {}

  ngOnInit(): void {
    // Don't load charts here - wait for AfterViewInit
  }

  ngAfterViewInit(): void {
    // Wait a bit for the DOM to be ready
    setTimeout(() => {
      this.loadCharts();
    }, 300);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  /**
   * Load all charts data
   */
  loadCharts(): void {
    this.loading = true;
    this.chartsLoaded = 0;
    this.destroyCharts(); // Destroy existing charts before creating new ones
    const days = parseInt(this.selectedPeriod);

    // Section 1: Entrenamientos
    this.progressService.getWorkoutsChartData(days)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.createWorkoutsChart(data);
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Error loading workouts chart:', err);
          this.checkLoadingComplete();
        }
      });

    this.progressService.getDurationChartData(days)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.createDurationChart(data);
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Error loading duration chart:', err);
          this.checkLoadingComplete();
        }
      });

    this.progressService.getVolumeChartData(days)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.createVolumeChart(data);
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Error loading volume chart:', err);
          this.checkLoadingComplete();
        }
      });

    // Section 2: Grupo Muscular
    this.progressService.getMuscleGroupChartData(days)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.createMuscleGroupChart(data);
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Error loading muscle group chart:', err);
          this.checkLoadingComplete();
        }
      });

    this.progressService.getMuscleFrequencyChartData(days)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.createMuscleFrequencyChart(data);
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Error loading muscle frequency chart:', err);
          this.checkLoadingComplete();
        }
      });

    // Section 3: Ejercicios
    this.progressService.getExerciseVolumeChartData(days)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.createExerciseVolumeChart(data);
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Error loading exercise volume chart:', err);
          this.checkLoadingComplete();
        }
      });

    this.progressService.getExerciseProgressChartData(days)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.createExerciseProgressChart(data);
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Error loading exercise progress chart:', err);
          this.checkLoadingComplete();
        }
      });
  }

  private chartsLoaded = 0;
  private totalCharts = 7; // Total number of charts to load

  private checkLoadingComplete(): void {
    this.chartsLoaded++;
    if (this.chartsLoaded >= this.totalCharts) {
      setTimeout(() => {
        this.loading = false;
      }, 300);
    }
  }

  /**
   * Create workouts chart
   */
  private createWorkoutsChart(data: ChartData): void {
    // Wait a bit for DOM to be ready
    setTimeout(() => {
      const canvas = document.getElementById('workoutsChart') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Workouts chart canvas not found');
        return;
      }

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
          legend: { display: false },
          title: {
            display: true,
            text: 'Entrenamientos por Día',
            font: { size: 16, weight: 'bold' as const },
            color: '#ffffff'
          }
        },
        scales: {
          x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: { beginAtZero: true, ticks: { color: '#ffffff', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    };

      this.workoutsChart = new Chart(canvas, config);
    }, 50);
  }

  /**
   * Create duration chart
   */
  private createDurationChart(data: ChartData): void {
    setTimeout(() => {
      const canvas = document.getElementById('durationChart') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Duration chart canvas not found');
        return;
      }

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
          legend: { display: false },
          title: {
            display: true,
            text: 'Duración Total (minutos)',
            font: { size: 16, weight: 'bold' as const },
            color: '#ffffff'
          }
        },
        scales: {
          x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: { beginAtZero: true, ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    };

      this.durationChart = new Chart(canvas, config);
    }, 50);
  }

  /**
   * Create volume chart
   */
  private createVolumeChart(data: ChartData): void {
    setTimeout(() => {
      const canvas = document.getElementById('volumeChart') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Volume chart canvas not found');
        return;
      }

    if (this.volumeChart) {
      this.volumeChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Volumen Total (kg)',
            font: { size: 16, weight: 'bold' as const },
            color: '#ffffff'
          }
        },
        scales: {
          x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: { beginAtZero: true, ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    };

      this.volumeChart = new Chart(canvas, config);
    }, 50);
  }

  /**
   * Create muscle group chart
   */
  private createMuscleGroupChart(data: ChartData): void {
    setTimeout(() => {
      const canvas = document.getElementById('muscleGroupChart') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Muscle group chart canvas not found');
        return;
      }

    if (this.muscleGroupChart) {
      this.muscleGroupChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: true,
            position: 'right',
            labels: { color: '#ffffff' }
          },
          title: {
            display: true,
            text: 'Volumen por Grupo Muscular',
            font: { size: 16, weight: 'bold' as const },
            color: '#ffffff'
          }
        }
      }
    };

      this.muscleGroupChart = new Chart(canvas, config);
    }, 50);
  }

  /**
   * Create muscle frequency chart
   */
  private createMuscleFrequencyChart(data: ChartData): void {
    setTimeout(() => {
      const canvas = document.getElementById('muscleFrequencyChart') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Muscle frequency chart canvas not found');
        return;
      }

    if (this.muscleFrequencyChart) {
      this.muscleFrequencyChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Frecuencia por Grupo Muscular',
            font: { size: 16, weight: 'bold' as const },
            color: '#ffffff'
          }
        },
        scales: {
          x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: { beginAtZero: true, ticks: { color: '#ffffff', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    };

      this.muscleFrequencyChart = new Chart(canvas, config);
    }, 50);
  }

  /**
   * Create exercise volume chart
   */
  private createExerciseVolumeChart(data: ChartData): void {
    setTimeout(() => {
      const canvas = document.getElementById('exerciseVolumeChart') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Exercise volume chart canvas not found');
        return;
      }

    if (this.exerciseVolumeChart) {
      this.exerciseVolumeChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Top 10 Ejercicios por Volumen',
            font: { size: 16, weight: 'bold' as const },
            color: '#ffffff'
          }
        },
        scales: {
          x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    };

      this.exerciseVolumeChart = new Chart(canvas, config);
    }, 50);
  }

  /**
   * Create exercise progress chart
   */
  private createExerciseProgressChart(data: ChartData): void {
    setTimeout(() => {
      const canvas = document.getElementById('exerciseProgressChart') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Exercise progress chart canvas not found');
        return;
      }

    if (this.exerciseProgressChart) {
      this.exerciseProgressChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: true,
            position: 'top',
            labels: { color: '#ffffff' }
          },
          title: {
            display: true,
            text: 'Progreso por Ejercicio',
            font: { size: 16, weight: 'bold' as const },
            color: '#ffffff'
          }
        },
        scales: {
          x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: { beginAtZero: true, ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    };

      this.exerciseProgressChart = new Chart(canvas, config);
    }, 50);
  }

  /**
   * Destroy all charts
   */
  private destroyCharts(): void {
    [this.workoutsChart, this.durationChart, this.volumeChart, 
     this.muscleGroupChart, this.muscleFrequencyChart, 
     this.exerciseVolumeChart, this.exerciseProgressChart].forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
  }

  /**
   * Change time period
   */
  onPeriodChange(): void {
    this.destroyCharts();
    this.loadCharts();
  }
}
