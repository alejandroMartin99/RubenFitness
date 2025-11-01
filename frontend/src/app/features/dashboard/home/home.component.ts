import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
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
  motivationalMessage: string = '';
  
  private readonly motivationalMessages = {
    empty: '¡Empecemos! Tu primera copa te está esperando 💧',
    low: ['¡Vamos, tu cuerpo te lo agradecerá! 💪', 'Cada gota cuenta, ¡sigue así! 🌊'],
    medium: ['¡Vas por buen camino! 🎯', 'Más de la mitad, ¡estás genial! ⭐', '¡Sigue hidratándote, lo estás haciendo bien! 💦'],
    high: ['¡Casi lo tienes! Un poco más 💪', '¡Estás a punto de conseguirlo! 🌟', '¡Queda muy poco para tu meta! 🎉'],
    completed: ['¡Meta completada! 🎉 ¡Eres increíble!', '¡Perfecto! ¡Sigue bebiendo más si quieres! 🌊', '¡2 litros completados! ¡Excelente trabajo! ⭐'],
    exceeded: ['¡Increíble! Has superado tu meta 🏆', '¡Wow! ¡Eres una máquina de hidratación! 💧', '¡Fantástico! Tu cuerpo te lo agradecerá 🌟']
  };

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isAdmin();
    this.loadWaterData();
    this.updateMotivationalMessage();
  }

  loadWaterData(): void {
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
  }

  saveWaterData(): void {
    const today = new Date().toDateString();
    const data = {
      waterDrunk: this.waterDrunk,
      waterGlasses: this.waterGlasses,
      date: today
    };
    localStorage.setItem(`water_${this.user?.id || 'default'}_${today}`, JSON.stringify(data));
  }

  addWater(): void {
    this.waterDrunk += 200;
    this.waterGlasses++;
    this.calculateProgress();
    this.updateMotivationalMessage();
    this.saveWaterData();
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
  
  // Expose Math for template
  Math = Math;
}


