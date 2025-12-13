import { Component, OnInit, OnChanges, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { WaterService } from '../../../../core/services/water.service';
import { User } from '../../../../core/models/user.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-water-tracking',
  templateUrl: './water-tracking.component.html',
  styleUrls: ['./water-tracking.component.scss']
})
export class WaterTrackingComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() user: User | null = null;
  @ViewChild('waterChart', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  // Water tracking
  waterGoal: number = 2000; // 2 liters = 10 x 200ml
  waterDrunk: number = 0;
  waterPercentage: number = 0;
  waterHistory: any[] = [];
  motivationalMessage: string = '';
  
  // Chart settings - fixed to 15 days
  private readonly FIXED_DAYS = 15;
  
  private waterChart: Chart | null = null;
  loading: boolean = false;

  constructor(private waterService: WaterService) {}

  ngOnInit(): void {
    if (this.user) {
      this.loadWaterData();
    }
  }

  ngOnChanges(): void {
    if (this.user) {
      this.loadWaterData();
    }
  }

  ngAfterViewInit(): void {
    // Chart will be initialized after data loads
  }

  ngOnDestroy(): void {
    if (this.waterChart) {
      this.waterChart.destroy();
    }
  }

  loadWaterData(): void {
    if (!this.user) return;
    
    this.loading = true;
    const days = this.FIXED_DAYS;
    
    this.waterService.getWaterData(days).subscribe({
      next: (response: any) => {
        console.log('💧 Water GET response:', response);
        
        // Extract water amount from response
        const waterAmount = response.total_today || response.water_ml || 0;
        
        // Update state
        this.waterDrunk = waterAmount;
        // Store all history data from backend
        const historyData = response.last_7_days || response.history || response.data || [];
        this.waterHistory = Array.isArray(historyData) ? historyData : [];
        this.calculateProgress();
        
        // Initialize or update chart smoothly - ensure chart canvas is ready
        setTimeout(() => {
          if (this.chartCanvas && this.chartCanvas.nativeElement) {
            this.initChart();
          }
          this.loading = false;
        }, 100);
        
        console.log('✅ Water updated:', this.waterDrunk, 'ml');
        console.log('💧 Water history:', this.waterHistory, 'days:', days);
      },
      error: (err) => {
        console.error('❌ Error loading water:', err);
        this.waterDrunk = 0;
        this.waterHistory = [];
        this.calculateProgress();
        this.loading = false;
      }
    });
  }

  addWater(): void {
    if (!this.user || this.loading) return;
    
    console.log('💧 Adding 200ml water...');
    
    this.waterService.addWater(200).subscribe({
      next: (response: any) => {
        console.log('💧 Water POST response:', response);
        
        // Update immediately from POST response
        const newAmount = response.total_today || response.water_ml || (this.waterDrunk + 200);
        this.waterDrunk = newAmount;
        this.calculateProgress();
        
        console.log('✅ Water added:', this.waterDrunk, 'ml');
        
        // Reload data and update chart smoothly without hiding canvas
        this.reloadWaterData();
      },
      error: (err) => {
        console.error('❌ Error adding water:', err);
      }
    });
  }

  private reloadWaterData(): void {
    if (!this.user) return;
    
    const days = this.FIXED_DAYS;
    
    this.waterService.getWaterData(days).subscribe({
      next: (response: any) => {
        console.log('💧 Water GET response:', response);
        
        // Extract water amount from response
        const waterAmount = response.total_today || response.water_ml || 0;
        
        // Update state
        this.waterDrunk = waterAmount;
        // Store all history data from backend
        const historyData = response.last_7_days || response.history || response.data || [];
        this.waterHistory = Array.isArray(historyData) ? historyData : [];
        this.calculateProgress();
        
        // Update chart without hiding canvas
        setTimeout(() => {
          if (this.chartCanvas && this.chartCanvas.nativeElement) {
            this.initChart();
          }
        }, 100);
        
        console.log('✅ Water updated:', this.waterDrunk, 'ml');
        console.log('💧 Water history:', this.waterHistory, 'days:', days);
      },
      error: (err) => {
        console.error('❌ Error loading water:', err);
      }
    });
  }

  calculateProgress(): void {
    this.waterPercentage = Math.min((this.waterDrunk / this.waterGoal) * 100, 100);
    this.updateMotivationalMessage();
  }

  getFilledLines(): number {
    // Return number of filled lines (0-10) based on percentage
    return Math.floor((this.waterPercentage / 100) * 10);
  }

  private updateMotivationalMessage(): void {
    const percentage = this.waterPercentage;
    const messages = {
      empty: 'Comienza tu día hidratándote para maximizar tu rendimiento.',
      low: [
        'Cada sorbo cuenta. La hidratación mejora tu capacidad de entrenamiento.',
        'Sigue hidratándote para optimizar tu rendimiento físico.'
      ],
      medium: [
        'Bien hidratado mantienes la temperatura corporal y el volumen plasmático en niveles óptimos.',
        'La hidratación óptima mejora el transporte de nutrientes y la recuperación.'
      ],
      high: [
        'Estás cerca de tu objetivo. La hidratación adecuada acelera la recuperación.',
        'Excelente progreso. Sigue así para maximizar tu rendimiento.'
      ],
      completed: [
        'Objetivo alcanzado. Mantén esta hidratación para optimizar tu rendimiento.',
        'Hidratación óptima lograda. Esencial para tu rendimiento deportivo.'
      ],
      exceeded: [
        'Excelente trabajo. Continúa así para maximizar tu recuperación.',
        'Hidratación óptima mantenida. Sigue cuidando tu cuerpo.'
      ]
    };

    if (percentage === 0) {
      this.motivationalMessage = messages.empty;
    } else if (percentage >= 100) {
      if (this.waterDrunk > this.waterGoal) {
        this.motivationalMessage = messages.exceeded[Math.floor(Math.random() * messages.exceeded.length)];
      } else {
        this.motivationalMessage = messages.completed[Math.floor(Math.random() * messages.completed.length)];
      }
    } else if (percentage >= 75) {
      this.motivationalMessage = messages.high[Math.floor(Math.random() * messages.high.length)];
    } else if (percentage >= 50) {
      this.motivationalMessage = messages.medium[Math.floor(Math.random() * messages.medium.length)];
    } else {
      this.motivationalMessage = messages.low[Math.floor(Math.random() * messages.low.length)];
    }
  }

  initChart(): void {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      return;
    }

    // Generate 15 days array (last 15 days including today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysArray: { date: Date; water_ml: number }[] = [];
    for (let i = 14; i >= 0; i--) {
      const dayDate = new Date(today);
      dayDate.setDate(dayDate.getDate() - i);
      daysArray.push({ date: dayDate, water_ml: 0 });
    }

    // Create a map from history data for quick lookup
    const historyMap = new Map<string, number>();
    this.waterHistory.forEach(day => {
      const dateStr = (day.date || day.water_date || day.created_at);
      if (dateStr) {
        const date = new Date(dateStr);
        // Normalize to local date (remove time component)
        const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const key = normalizedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        const waterValue = day.water_ml || day.water_amount || 0;
        historyMap.set(key, waterValue);
      }
    });

    // Also add today's water from current state if not in history
    const todayKey = today.toISOString().split('T')[0];
    if (!historyMap.has(todayKey) && this.waterDrunk > 0) {
      historyMap.set(todayKey, this.waterDrunk);
    }

    // Fill in the data from history map
    const filteredHistory = daysArray.map(day => {
      const key = day.date.toISOString().split('T')[0];
      // For today, prefer current waterDrunk value if available
      if (key === todayKey && this.waterDrunk > 0) {
        return {
          date: day.date,
          water_ml: this.waterDrunk
        };
      }
      return {
        date: day.date,
        water_ml: historyMap.get(key) || 0
      };
    });

    const labels = filteredHistory.map(day => {
      return day.date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    });

    const data = filteredHistory.map(day => day.water_ml);
    
    // Calculate point radius and colors for each data point - all same size, smaller
    const pointRadius = 2.5; // Same small size for all points
    const pointBackgroundColors = data.map(value => value === 0 ? 'rgba(0, 114, 255, 0.5)' : '#0072ff');

    // If chart exists, update it smoothly instead of destroying
    if (this.waterChart && this.waterChart.canvas && this.waterChart.canvas.parentNode) {
      try {
        this.waterChart.data.labels = labels;
        this.waterChart.data.datasets[0].data = data;
        // Update point properties - ensure all points have same size
        const dataset = this.waterChart.data.datasets[0] as any;
        if (dataset) {
          // Force pointRadius to be a number (not array or function)
          dataset.pointRadius = pointRadius;
          dataset.pointHoverRadius = 3; // Keep hover size close to normal size
          dataset.pointBackgroundColor = pointBackgroundColors;
          // Remove any array/function-based pointRadius if it exists
          if (Array.isArray(dataset.pointRadius) || typeof dataset.pointRadius === 'function') {
            dataset.pointRadius = pointRadius;
          }
        }
        this.waterChart.update('active'); // Smooth animation
        return;
      } catch (error) {
        console.error('Error updating chart:', error);
        // If update fails, destroy and recreate
        try {
          this.waterChart.destroy();
        } catch (e) {
          console.error('Error destroying chart:', e);
        }
        this.waterChart = null;
      }
    } else if (this.waterChart) {
      // Chart exists but canvas is invalid, destroy it
      try {
        this.waterChart.destroy();
      } catch (e) {
        // Ignore destroy errors
      }
      this.waterChart = null;
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Agua (ml)',
          data: data,
          borderColor: '#0072ff',
          backgroundColor: 'rgba(0, 114, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: pointRadius as any,
          pointHoverRadius: 3,
          pointBackgroundColor: pointBackgroundColors as any,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#0072ff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 750,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            padding: 12,
            titleFont: {
              size: 13,
              weight: 'bold'
            },
            bodyFont: {
              size: 12
            },
            displayColors: false,
            caretSize: 6,
            cornerRadius: 6,
            position: 'nearest',
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y ?? 0;
                return `${value} ml (${(value / 1000).toFixed(1)}L)`;
              },
              title: (context) => {
                const index = context[0].dataIndex;
                if (filteredHistory[index] && filteredHistory[index].date) {
                  return filteredHistory[index].date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
                }
                return '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return value + ' ml';
              },
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            }
          },
          x: {
            ticks: {
              font: {
                size: 11
              },
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.waterChart = new Chart(this.chartCanvas.nativeElement, config);
  }

  getAverageWater(): number {
    if (!this.waterHistory || this.waterHistory.length === 0) return 0;
    const total = this.waterHistory.reduce((sum, day) => sum + (day.water_ml || 0), 0);
    const count = this.waterHistory.filter(day => (day.water_ml || 0) > 0).length;
    return count > 0 ? total / count : 0;
  }
  
  // Expose Math for template
  Math = Math;
}


