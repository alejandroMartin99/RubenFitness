import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { WaterService } from '../../../../core/services/water.service';
import { User } from '../../../../core/models/user.model';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-water-tracking',
  templateUrl: './water-tracking.component.html',
  styleUrls: ['./water-tracking.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaterTrackingComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() user: User | null = null;
  @ViewChild('waterChart', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  waterGoal = 2000;
  waterDrunk = 0;
  waterPercentage = 0;
  waterHistory: any[] = [];
  motivationalMessage = '';
  loading = false;

  private readonly FIXED_DAYS = 15;
  private waterChart: Chart | null = null;

  constructor(
    private waterService: WaterService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.user) this.loadWaterData();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.waterChart?.destroy();
  }

  loadWaterData(): void {
    if (!this.user) return;
    this.loading = true;
    this.cdr.markForCheck();

    this.waterService.getWaterData(this.FIXED_DAYS).subscribe({
      next: (res: any) => {
        this.waterDrunk = res.total_today || res.water_ml || 0;
        this.waterHistory = res.last_7_days || res.history || res.data || [];
        this.calculateProgress();
        this.loading = false;
        this.cdr.markForCheck();
        
        requestAnimationFrame(() => {
          if (this.chartCanvas?.nativeElement) this.initChart();
        });
      },
      error: () => {
        this.waterDrunk = 0;
        this.waterHistory = [];
        this.calculateProgress();
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  addWater(): void {
    if (!this.user || this.loading) return;

    this.waterService.addWater(200).subscribe({
      next: (res: any) => {
        this.waterDrunk = res.total_today || res.water_ml || (this.waterDrunk + 200);
        this.calculateProgress();
        this.cdr.markForCheck();
        this.reloadWaterData();
      },
      error: () => {}
    });
  }

  private reloadWaterData(): void {
    if (!this.user) return;

    this.waterService.getWaterData(this.FIXED_DAYS).subscribe({
      next: (res: any) => {
        this.waterDrunk = res.total_today || res.water_ml || 0;
        this.waterHistory = res.last_7_days || res.history || res.data || [];
        this.calculateProgress();
        this.cdr.markForCheck();
        
        requestAnimationFrame(() => {
          if (this.chartCanvas?.nativeElement) this.initChart();
        });
      },
      error: () => {}
    });
  }

  calculateProgress(): void {
    this.waterPercentage = Math.min((this.waterDrunk / this.waterGoal) * 100, 100);
    this.updateMotivationalMessage();
  }

  getFilledLines(): number {
    return Math.floor((this.waterPercentage / 100) * 10);
  }

  private updateMotivationalMessage(): void {
    const p = this.waterPercentage;
    if (p === 0) {
      this.motivationalMessage = 'Comienza hidratándote para maximizar tu rendimiento.';
    } else if (p >= 100) {
      this.motivationalMessage = 'Objetivo alcanzado. Mantén esta hidratación.';
    } else if (p >= 75) {
      this.motivationalMessage = 'Estás cerca. La hidratación acelera la recuperación.';
    } else if (p >= 50) {
      this.motivationalMessage = 'Bien hidratado mejoras el transporte de nutrientes.';
    } else {
      this.motivationalMessage = 'Cada sorbo mejora tu rendimiento.';
    }
  }

  initChart(): void {
    if (!this.chartCanvas?.nativeElement) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const historyMap = new Map<string, number>();
    this.waterHistory.forEach(day => {
      const dateStr = day.date || day.water_date || day.created_at;
      if (dateStr) {
        const d = new Date(dateStr);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        historyMap.set(key, day.water_ml || day.water_amount || 0);
      }
    });

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (this.waterDrunk > 0) historyMap.set(todayKey, this.waterDrunk);

    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 14; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      labels.push(d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
      data.push(key === todayKey && this.waterDrunk > 0 ? this.waterDrunk : (historyMap.get(key) || 0));
    }

    const colors = data.map(v => v === 0 ? 'rgba(0, 114, 255, 0.5)' : '#0072ff');

    if (this.waterChart?.canvas?.parentNode) {
      this.waterChart.data.labels = labels;
      this.waterChart.data.datasets[0].data = data;
      (this.waterChart.data.datasets[0] as any).pointBackgroundColor = colors;
      this.waterChart.update('none');
      return;
    }

    this.waterChart?.destroy();

    this.waterChart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          borderColor: '#0072ff',
          backgroundColor: 'rgba(0, 114, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 2.5,
          pointHoverRadius: 3,
          pointBackgroundColor: colors,
          pointBorderColor: '#fff',
          pointBorderWidth: 1
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
              label: ctx => `${ctx.parsed.y} ml`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (v: any) => v + ' ml', font: { size: 10 } },
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

  Math = Math;
}
