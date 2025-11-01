import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { SleepService } from '../../../core/services/sleep.service';
import { WaterService } from '../../../core/services/water.service';
import { User } from '../../../core/models/user.model';
import { SleepRecord } from '../../../core/models/sleep.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  isAdmin: boolean = false;

  // Water tracking
  waterGoal: number = 2000; // 2 liters = 10 x 200ml
  waterDrunk: number = 0;
  waterPercentage: number = 0;
  waterGlasses: number = 0; // Number of 200ml glasses
  motivationalMessage: string = '';
  
  private readonly motivationalMessages = {
    empty: '¡Empecemos! Tu primera copa te está esperando 💧',
    low: ['¡Vamos, tu cuerpo te lo agradecerá! 💪', 'Cada gota cuenta, ¡sigue así! 🌊'],
    medium: ['¡Vas por buen camino! 🎯', 'Más de la mitad, ¡estás genial! ⭐', '¡Sigue hidratándote, lo estás haciendo bien! 💦'],
    high: ['¡Casi lo tienes! Un poco más 💪', '¡Estás a punto de conseguirlo! 🌟', '¡Queda muy poco para tu meta! 🎉'],
    completed: ['¡Meta completada! 🎉 ¡Eres increíble!', '¡Perfecto! ¡Sigue bebiendo más si quieres! 🌊', '¡2 litros completados! ¡Excelente trabajo! ⭐'],
    exceeded: ['¡Increíble! Has superado tu meta 🏆', '¡Wow! ¡Eres una máquina de hidratación! 💧', '¡Fantástico! Tu cuerpo te lo agradecerá 🌟']
  };

  // Sleep tracking
  todaySleepHours: number = 0;
  todaySleepMinutes: number = 0;
  sleepHistory: SleepRecord[] = [];
  averageSleep: number = 0;
  loadingSleep: boolean = false;

  constructor(
    public authService: AuthService,
    private sleepService: SleepService,
    private waterService: WaterService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isAdmin();
    this.loadWaterData();
    this.updateMotivationalMessage();
    this.loadSleepData();
  }

  loadWaterData(): void {
    if (!this.user) return;
    
    this.waterService.getWaterData(7).subscribe({
      next: (response) => {
        if (response.todayWater) {
          this.waterDrunk = response.todayWater.water_ml;
          this.waterGlasses = Math.floor(this.waterDrunk / 200);
        } else {
          this.waterDrunk = 0;
          this.waterGlasses = 0;
        }
        this.calculateProgress();
        this.updateMotivationalMessage();
      },
      error: (err) => {
        console.error('Error loading water data:', err);
        // Fallback to localStorage
        const today = new Date().toDateString();
        const savedData = localStorage.getItem(`water_${this.user?.id || 'default'}_${today}`);
        if (savedData) {
          const data = JSON.parse(savedData);
          this.waterDrunk = data.waterDrunk || 0;
          this.waterGlasses = data.waterGlasses || 0;
        } else {
          this.waterDrunk = 0;
          this.waterGlasses = 0;
        }
        this.calculateProgress();
        this.updateMotivationalMessage();
      }
    });
  }

  addWater(): void {
    if (!this.user) return;
    
    // Update UI immediately
    this.waterDrunk += 200;
    this.waterGlasses++;
    this.calculateProgress();
    this.updateMotivationalMessage();
    
    // Save to backend
    this.waterService.addWater(200).subscribe({
      next: (response) => {
        // Reload to ensure sync with backend
        setTimeout(() => {
          this.loadWaterData();
        }, 200);
      },
      error: (err) => {
        console.error('Error saving water:', err);
        // Fallback: save to localStorage
        this.saveWaterDataLocal();
      }
    });
  }

  saveWaterDataLocal(): void {
    const today = new Date().toDateString();
    const data = {
      waterDrunk: this.waterDrunk,
      waterGlasses: this.waterGlasses,
      date: today
    };
    localStorage.setItem(`water_${this.user?.id || 'default'}_${today}`, JSON.stringify(data));
  }

  calculateProgress(): void {
    this.waterPercentage = Math.min((this.waterDrunk / this.waterGoal) * 100, 100);
  }

  updateMotivationalMessage(): void {
    const percentage = this.waterPercentage;
    
    if (this.waterGlasses === 0) {
      this.motivationalMessage = this.motivationalMessages.empty;
    } else if (percentage >= 100) {
      if (this.waterDrunk > this.waterGoal) {
        const messages = this.motivationalMessages.exceeded;
        this.motivationalMessage = messages[Math.floor(Math.random() * messages.length)];
      } else {
        const messages = this.motivationalMessages.completed;
        this.motivationalMessage = messages[Math.floor(Math.random() * messages.length)];
      }
    } else if (percentage >= 75) {
      const messages = this.motivationalMessages.high;
      this.motivationalMessage = messages[Math.floor(Math.random() * messages.length)];
    } else if (percentage >= 50) {
      const messages = this.motivationalMessages.medium;
      this.motivationalMessage = messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = this.motivationalMessages.low;
      this.motivationalMessage = messages[Math.floor(Math.random() * messages.length)];
    }
  }

  getRemainingWater(): number {
    return Math.max(0, this.waterGoal - this.waterDrunk);
  }

  isGoalCompleted(): boolean {
    return this.waterDrunk >= this.waterGoal;
  }
  
  // Sleep Methods
  loadSleepData(): void {
    if (!this.user) return;
    
    this.loadingSleep = true;
    this.sleepService.getSleepData(7).subscribe({
      next: (response) => {
        this.sleepHistory = response.last7Days || [];
        this.averageSleep = response.averageSleep || 0;
        
        if (response.todaySleep) {
          this.todaySleepHours = Math.floor(response.todaySleep.hours);
          this.todaySleepMinutes = Math.round((response.todaySleep.hours - this.todaySleepHours) * 60);
        } else {
          this.todaySleepHours = 0;
          this.todaySleepMinutes = 0;
        }
        
        this.loadingSleep = false;
      },
      error: (err) => {
        console.error('Error loading sleep data:', err);
        this.sleepHistory = [];
        this.todaySleepHours = 0;
        this.todaySleepMinutes = 0;
        this.loadingSleep = false;
      }
    });
  }

  saveSleep(): void {
    if (!this.user) return;
    
    const totalHours = this.todaySleepHours + (this.todaySleepMinutes / 60);
    
    this.loadingSleep = true;
    this.sleepService.recordSleep(totalHours, this.todaySleepMinutes).subscribe({
      next: (response) => {
        // Small delay to ensure backend has saved the data
        setTimeout(() => {
          this.loadSleepData(); // Reload to get updated data
        }, 300);
      },
      error: (err) => {
        console.error('Error saving sleep:', err);
        this.loadingSleep = false;
      }
    });
  }

  formatSleepHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) {
      return `${h}h`;
    }
    return `${h}h ${m}m`;
  }

  getSleepBarHeight(hours: number): number {
    // Max height is 100px, and max sleep is 12 hours
    const maxSleep = 12;
    return Math.min((hours / maxSleep) * 100, 100);
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

  formatSleepDisplay(hours: number, minutes: number): string {
    if (hours === 0 && minutes === 0) {
      return '--:--';
    }
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  
  // Expose Math for template
  Math = Math;
}


