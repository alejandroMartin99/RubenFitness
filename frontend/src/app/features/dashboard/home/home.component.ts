import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { SleepService } from '../../../core/services/sleep.service';
import { WaterService } from '../../../core/services/water.service';
import { User } from '../../../core/models/user.model';

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
  waterHistory: any[] = [];
  
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
  sleepHistory: any[] = [];
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
    this.loadSleepData();
  }

  // ==================== WATER TRACKING ====================
  
  loadWaterData(): void {
    if (!this.user) return;
    
    this.waterService.getWaterData(7).subscribe({
      next: (response: any) => {
        console.log('💧 Water GET response:', response);
        
        // Extract water amount from response
        const waterAmount = response.total_today || response.water_ml || 0;
        
        // Update state
        this.waterDrunk = waterAmount;
        this.waterGlasses = Math.floor(this.waterDrunk / 200);
        this.waterHistory = response.last_7_days || [];
        this.calculateProgress();
        
        console.log('✅ Water updated:', this.waterDrunk, 'ml,', this.waterGlasses, 'glasses');
        console.log('💧 Water history:', this.waterHistory);
      },
      error: (err) => {
        console.error('❌ Error loading water:', err);
        this.waterDrunk = 0;
        this.waterGlasses = 0;
        this.calculateProgress();
      }
    });
  }

  addWater(): void {
    if (!this.user) return;
    
    console.log('💧 Adding 200ml water...');
    
    this.waterService.addWater(200).subscribe({
      next: (response: any) => {
        console.log('💧 Water POST response:', response);
        
        // Update immediately from POST response
        const newAmount = response.total_today || response.water_ml || (this.waterDrunk + 200);
        this.waterDrunk = newAmount;
        this.waterGlasses = Math.floor(this.waterDrunk / 200);
        this.calculateProgress();
        
        console.log('✅ Water added:', this.waterDrunk, 'ml,', this.waterGlasses, 'glasses');
        
        // Reload from backend after a short delay to ensure consistency
        setTimeout(() => {
          this.loadWaterData();
        }, 300);
      },
      error: (err) => {
        console.error('❌ Error adding water:', err);
      }
    });
  }

  calculateProgress(): void {
    this.waterPercentage = Math.min((this.waterDrunk / this.waterGoal) * 100, 100);
  }

  getMotivationalMessage(): string {
    const percentage = this.waterPercentage;
    
    if (this.waterGlasses === 0) {
      return this.motivationalMessages.empty;
    } else if (percentage >= 100) {
      if (this.waterDrunk > this.waterGoal) {
        const messages = this.motivationalMessages.exceeded;
        return messages[Math.floor(Math.random() * messages.length)];
      } else {
        const messages = this.motivationalMessages.completed;
        return messages[Math.floor(Math.random() * messages.length)];
      }
    } else if (percentage >= 75) {
      const messages = this.motivationalMessages.high;
      return messages[Math.floor(Math.random() * messages.length)];
    } else if (percentage >= 50) {
      const messages = this.motivationalMessages.medium;
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = this.motivationalMessages.low;
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }

  getRemainingWater(): number {
    return Math.max(0, this.waterGoal - this.waterDrunk);
  }

  isGoalCompleted(): boolean {
    return this.waterDrunk >= this.waterGoal;
  }
  
  // ==================== SLEEP TRACKING ====================
  
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

  getWaterBarHeight(waterMl: number): number {
    // Max height is 100px, and max water is goal (2000ml)
    const maxHeight = 100;
    const percentage = (waterMl / this.waterGoal);
    return Math.min(percentage * maxHeight, maxHeight);
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
