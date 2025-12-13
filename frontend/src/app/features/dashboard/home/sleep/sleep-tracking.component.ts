import { Component, OnInit, OnChanges, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { SleepService } from '../../../../core/services/sleep.service';
import { User } from '../../../../core/models/user.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-sleep-tracking',
  templateUrl: './sleep-tracking.component.html',
  styleUrls: ['./sleep-tracking.component.scss']
})
export class SleepTrackingComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() user: User | null = null;
  @ViewChild('sleepChart', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  // Sleep tracking
  todaySleepHours: number = 0;
  todaySleepMinutes: number = 0;
  sleepHistory: any[] = [];
  averageSleep: number = 0;
  loadingSleep: boolean = false;
  
  // Chart settings - fixed to 15 days
  private readonly FIXED_DAYS = 15;
  
  private sleepChart: Chart | null = null;

  constructor(private sleepService: SleepService) {}

  ngOnInit(): void {
    if (this.user) {
      this.loadSleepData();
    }
  }

  ngOnChanges(): void {
    if (this.user) {
      this.loadSleepData();
    }
  }

  ngAfterViewInit(): void {
    // Chart will be initialized after data loads
  }

  ngOnDestroy(): void {
    if (this.sleepChart) {
      this.sleepChart.destroy();
    }
  }

  loadSleepData(): void {
    if (!this.user) return;
    
    this.loadingSleep = true;
    const days = this.FIXED_DAYS;
    
    this.sleepService.getSleepData(days).subscribe({
      next: (response: any) => {
        console.log('😴 Sleep GET response:', response);
        
        // Extract sleep data from response
        this.todaySleepHours = response.hours || 0;
        this.todaySleepMinutes = response.minutes || 0;
        const historyData = response.last_7_days || response.history || response.data || [];
        this.sleepHistory = Array.isArray(historyData) ? historyData : [];
        this.averageSleep = response.average_sleep || 0;
        
        // Initialize or update chart
        setTimeout(() => {
          if (this.chartCanvas && this.chartCanvas.nativeElement) {
            this.initChart();
          }
          this.loadingSleep = false;
        }, 100);
        
        console.log('✅ Sleep updated:', this.todaySleepHours, 'h', this.todaySleepMinutes, 'm');
      },
      error: (err) => {
        console.error('❌ Error loading sleep:', err);
        this.todaySleepHours = 0;
        this.todaySleepMinutes = 0;
        this.sleepHistory = [];
        this.averageSleep = 0;
        this.loadingSleep = false;
      }
    });
  }

  saveSleep(): void {
    if (!this.user) return;
    
    const totalHours = this.todaySleepHours + (this.todaySleepMinutes / 60);
    
    console.log('😴 Saving sleep:', totalHours, 'hours');
    
    this.loadingSleep = true;
    this.sleepService.recordSleep(this.todaySleepHours, this.todaySleepMinutes).subscribe({
      next: (response: any) => {
        console.log('😴 Sleep POST response:', response);
        
        // Update immediately from POST response
        this.todaySleepHours = response.hours || this.todaySleepHours;
        this.todaySleepMinutes = response.minutes || this.todaySleepMinutes;
        
        this.loadingSleep = false;
        
        console.log('✅ Sleep saved:', this.todaySleepHours, 'h', this.todaySleepMinutes, 'm');
        
        // Reload data and update chart smoothly
        this.reloadSleepData();
      },
      error: (err) => {
        console.error('❌ Error saving sleep:', err);
        this.loadingSleep = false;
      }
    });
  }

  adjustSleep(type: 'hours' | 'minutes', delta: number): void {
    if (type === 'hours') {
      this.todaySleepHours = Math.max(0, Math.min(24, this.todaySleepHours + delta));
    } else {
      this.todaySleepMinutes = Math.max(0, Math.min(59, this.todaySleepMinutes + delta));
      // If minutes exceed 59, convert to hours
      if (this.todaySleepMinutes >= 60) {
        this.todaySleepHours += Math.floor(this.todaySleepMinutes / 60);
        this.todaySleepMinutes = this.todaySleepMinutes % 60;
        if (this.todaySleepHours > 24) {
          this.todaySleepHours = 24;
          this.todaySleepMinutes = 0;
        }
      }
      // If minutes go below 0, borrow from hours
      if (this.todaySleepMinutes < 0) {
        this.todaySleepHours -= 1;
        this.todaySleepMinutes = 60 + this.todaySleepMinutes;
        if (this.todaySleepHours < 0) {
          this.todaySleepHours = 0;
          this.todaySleepMinutes = 0;
        }
      }
    }
  }

  formatSleepHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) {
      return `${h}h`;
    }
    return `${h}h ${m}m`;
  }

  formatSleepDisplay(hours: number, minutes: number): string {
    if (hours === 0 && minutes === 0) {
      return '--:--';
    }
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }

  private reloadSleepData(): void {
    if (!this.user) return;
    
    const days = this.FIXED_DAYS;
    
    this.sleepService.getSleepData(days).subscribe({
      next: (response: any) => {
        console.log('😴 Sleep GET response:', response);
        
        // Extract sleep data from response
        this.todaySleepHours = response.hours || this.todaySleepHours;
        this.todaySleepMinutes = response.minutes || this.todaySleepMinutes;
        const historyData = response.last_7_days || response.history || response.data || [];
        this.sleepHistory = Array.isArray(historyData) ? historyData : [];
        this.averageSleep = response.average_sleep || 0;
        
        // Update chart without hiding canvas
        setTimeout(() => {
          if (this.chartCanvas && this.chartCanvas.nativeElement) {
            this.initChart();
          }
        }, 100);
      },
      error: (err) => {
        console.error('❌ Error loading sleep:', err);
      }
    });
  }

  initChart(): void {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      return;
    }

    // Generate 15 days array (last 15 days including today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysArray: { date: Date; hours: number }[] = [];
    for (let i = 14; i >= 0; i--) {
      const dayDate = new Date(today);
      dayDate.setDate(dayDate.getDate() - i);
      daysArray.push({ date: dayDate, hours: 0 });
    }

    // Create a map from history data for quick lookup
    const historyMap = new Map<string, number>();
    this.sleepHistory.forEach(day => {
      const dateStr = (day.date || day.sleep_date || day.created_at);
      if (dateStr) {
        const date = new Date(dateStr);
        const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const key = normalizedDate.toISOString().split('T')[0];
        const sleepHours = day.hours || (day.total_hours || 0);
        historyMap.set(key, sleepHours);
      }
    });

    // Also add today's sleep from current state if not in history
    const todayKey = today.toISOString().split('T')[0];
    const todayTotalHours = this.todaySleepHours + (this.todaySleepMinutes / 60);
    if (!historyMap.has(todayKey) && todayTotalHours > 0) {
      historyMap.set(todayKey, todayTotalHours);
    }

    // Fill in the data from history map
    const filteredHistory = daysArray.map(day => {
      const key = day.date.toISOString().split('T')[0];
      // For today, prefer current sleep value if available
      if (key === todayKey && todayTotalHours > 0) {
        return {
          date: day.date,
          hours: todayTotalHours
        };
      }
      return {
        date: day.date,
        hours: historyMap.get(key) || 0
      };
    });

    const labels = filteredHistory.map(day => {
      return day.date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    });

    const data = filteredHistory.map(day => day.hours);
    
    // If chart exists, update it smoothly instead of destroying
    if (this.sleepChart && this.sleepChart.canvas && this.sleepChart.canvas.parentNode) {
      try {
        this.sleepChart.data.labels = labels;
        this.sleepChart.data.datasets[0].data = data;
        const dataset = this.sleepChart.data.datasets[0] as any;
        if (dataset) {
          dataset.backgroundColor = data.map((value: number) => {
            if (value === 0) return 'rgba(139, 92, 246, 0.2)';
            if (value >= 7 && value <= 9) return '#8b5cf6';
            if (value < 7) return 'rgba(139, 92, 246, 0.6)';
            return 'rgba(139, 92, 246, 0.8)';
          });
        }
        this.sleepChart.update('active');
        return;
      } catch (error) {
        console.error('Error updating chart:', error);
        try {
          this.sleepChart.destroy();
        } catch (e) {
          console.error('Error destroying chart:', e);
        }
        this.sleepChart = null;
      }
    } else if (this.sleepChart) {
      try {
        this.sleepChart.destroy();
      } catch (e) {
        // Ignore destroy errors
      }
      this.sleepChart = null;
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sueño (horas)',
          data: data,
          backgroundColor: data.map(value => {
            if (value === 0) return 'rgba(139, 92, 246, 0.2)';
            if (value >= 7 && value <= 9) return '#8b5cf6'; // Ideal range
            if (value < 7) return 'rgba(139, 92, 246, 0.6)'; // Less than ideal
            return 'rgba(139, 92, 246, 0.8)'; // More than ideal
          }),
          borderRadius: 4,
          borderSkipped: false,
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
            callbacks: {
              label: (context: any) => {
                const value = context.parsed.y ?? 0;
                const hours = Math.floor(value);
                const minutes = Math.round((value - hours) * 60);
                if (minutes === 0) {
                  return `${hours}h`;
                }
                return `${hours}h ${minutes}m`;
              },
              title: (context: any) => {
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
            max: 12,
            ticks: {
              callback: function(value: any) {
                return value + 'h';
              },
              font: {
                size: 11
              },
              stepSize: 2
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            }
          },
          x: {
            ticks: {
              font: {
                size: 10
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

    this.sleepChart = new Chart(this.chartCanvas.nativeElement, config);
  }
}

