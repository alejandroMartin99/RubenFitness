import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { WaterService } from '../../../../core/services/water.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-water-tracking',
  templateUrl: './water-tracking.component.html',
  styleUrls: ['./water-tracking.component.scss']
})
export class WaterTrackingComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;

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

