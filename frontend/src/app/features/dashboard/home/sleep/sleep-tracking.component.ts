import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SleepService } from '../../../../core/services/sleep.service';
import { User } from '../../../../core/models/user.model';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-sleep-tracking',
  templateUrl: './sleep-tracking.component.html',
  styleUrls: ['./sleep-tracking.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SleepTrackingComponent implements OnInit, OnDestroy {
  @Input() user: User | null = null;
  @ViewChild('sleepChart', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  todaySleepHours = 0;
  todaySleepMinutes = 0;
  sleepHistory: any[] = [];
  averageSleep = 0;
  loadingSleep = false;

  private readonly FIXED_DAYS = 15;
  private sleepChart: Chart | null = null;

  constructor(
    private sleepService: SleepService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.user) this.loadSleepData();
  }

  ngOnDestroy(): void {
    this.sleepChart?.destroy();
  }

  loadSleepData(): void {
    if (!this.user) return;
    this.loadingSleep = true;
    this.cdr.markForCheck();

    this.sleepService.getSleepData(this.FIXED_DAYS).subscribe({
      next: (res: any) => {
        this.todaySleepHours = res.hours || 0;
        this.todaySleepMinutes = res.minutes || 0;
        this.sleepHistory = res.last_7_days || res.history || res.data || [];
        this.averageSleep = res.average_sleep || 0;
        this.loadingSleep = false;
        this.cdr.markForCheck();

        requestAnimationFrame(() => {
          if (this.chartCanvas?.nativeElement) this.initChart();
        });
      },
      error: () => {
        this.todaySleepHours = 0;
        this.todaySleepMinutes = 0;
        this.sleepHistory = [];
        this.averageSleep = 0;
        this.loadingSleep = false;
        this.cdr.markForCheck();
      }
    });
  }

  saveSleep(): void {
    if (!this.user) return;
    this.loadingSleep = true;
    this.cdr.markForCheck();

    this.sleepService.recordSleep(this.todaySleepHours, this.todaySleepMinutes).subscribe({
      next: (res: any) => {
        this.todaySleepHours = res.hours || this.todaySleepHours;
        this.todaySleepMinutes = res.minutes || this.todaySleepMinutes;
        this.loadingSleep = false;
        this.cdr.markForCheck();
        this.reloadSleepData();
      },
      error: () => {
        this.loadingSleep = false;
        this.cdr.markForCheck();
      }
    });
  }

  adjustSleep(type: 'hours' | 'minutes', delta: number): void {
    if (type === 'hours') {
      this.todaySleepHours = Math.max(0, Math.min(24, this.todaySleepHours + delta));
    } else {
      let newMinutes = this.todaySleepMinutes + delta;
      if (newMinutes >= 60) {
        this.todaySleepHours = Math.min(24, this.todaySleepHours + 1);
        newMinutes = newMinutes % 60;
      } else if (newMinutes < 0) {
        if (this.todaySleepHours > 0) {
          this.todaySleepHours--;
          newMinutes = 60 + newMinutes;
        } else {
          newMinutes = 0;
        }
      }
      this.todaySleepMinutes = newMinutes;
    }
    this.cdr.markForCheck();
  }

  private reloadSleepData(): void {
    if (!this.user) return;

    this.sleepService.getSleepData(this.FIXED_DAYS).subscribe({
      next: (res: any) => {
        this.todaySleepHours = res.hours || this.todaySleepHours;
        this.todaySleepMinutes = res.minutes || this.todaySleepMinutes;
        this.sleepHistory = res.last_7_days || res.history || res.data || [];
        this.averageSleep = res.average_sleep || 0;
        this.cdr.markForCheck();

        requestAnimationFrame(() => {
          if (this.chartCanvas?.nativeElement) this.initChart();
        });
      },
      error: () => {}
    });
  }

  initChart(): void {
    if (!this.chartCanvas?.nativeElement) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const historyMap = new Map<string, number>();
    this.sleepHistory.forEach(day => {
      const dateStr = day.date || day.sleep_date || day.created_at;
      if (dateStr) {
        const d = new Date(dateStr);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        historyMap.set(key, day.hours || day.total_hours || 0);
      }
    });

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayTotal = this.todaySleepHours + (this.todaySleepMinutes / 60);
    if (todayTotal > 0) historyMap.set(todayKey, todayTotal);

    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 14; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      labels.push(d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
      data.push(key === todayKey && todayTotal > 0 ? todayTotal : (historyMap.get(key) || 0));
    }

    const colors = data.map(v => {
      if (v === 0) return 'rgba(139, 92, 246, 0.2)';
      if (v >= 7 && v <= 9) return '#8b5cf6';
      if (v < 7) return 'rgba(139, 92, 246, 0.6)';
      return 'rgba(139, 92, 246, 0.8)';
    });

    if (this.sleepChart?.canvas?.parentNode) {
      this.sleepChart.data.labels = labels;
      this.sleepChart.data.datasets[0].data = data;
      (this.sleepChart.data.datasets[0] as any).backgroundColor = colors;
      this.sleepChart.update('none');
      return;
    }

    this.sleepChart?.destroy();

    this.sleepChart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.85)',
            padding: 10,
            displayColors: false,
            callbacks: {
              label: ctx => {
                const v = ctx.parsed.y ?? 0;
                const h = Math.floor(v);
                const m = Math.round((v - h) * 60);
                return m === 0 ? `${h}h` : `${h}h ${m}m`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 12,
            ticks: { callback: (v: any) => v + 'h', font: { size: 10 }, stepSize: 2 },
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          x: {
            ticks: { font: { size: 10 }, maxRotation: 45 },
            grid: { display: false }
          }
        }
      }
    });
  }
}
