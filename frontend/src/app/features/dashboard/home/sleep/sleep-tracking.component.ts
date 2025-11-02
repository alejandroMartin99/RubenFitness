import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { SleepService } from '../../../../core/services/sleep.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-sleep-tracking',
  templateUrl: './sleep-tracking.component.html',
  styleUrls: ['./sleep-tracking.component.scss']
})
export class SleepTrackingComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;

  // Sleep tracking
  todaySleepHours: number = 0;
  todaySleepMinutes: number = 0;
  sleepHistory: any[] = [];
  averageSleep: number = 0;
  loadingSleep: boolean = false;

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

  loadSleepData(): void {
    if (!this.user) return;
    
    this.loadingSleep = true;
    this.sleepService.getSleepData(7).subscribe({
      next: (response: any) => {
        console.log('😴 Sleep GET response:', response);
        
        // Extract sleep data from response
        this.todaySleepHours = response.hours || 0;
        this.todaySleepMinutes = response.minutes || 0;
        this.sleepHistory = response.last_7_days || [];
        this.averageSleep = response.average_sleep || 0;
        
        this.loadingSleep = false;
        
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
        
        // Reload from backend after a short delay to ensure consistency
        setTimeout(() => {
          this.loadSleepData();
        }, 300);
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

  getSleepBarHeight(hours: number): number {
    // Max height is 100px, and max sleep is 12 hours
    const maxSleep = 12;
    return Math.min((hours / maxSleep) * 100, 100);
  }
}

