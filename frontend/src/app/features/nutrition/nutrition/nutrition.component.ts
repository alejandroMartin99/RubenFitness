import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { NutritionService, NutritionPlan, NutritionMeal, ChatMessage } from '../../../core/services/nutrition.service';
import { AuthService } from '../../../core/services/auth.service';
import { interval, Subscription } from 'rxjs';
import { getExamplePlan, getExampleMeals, DAY_LABELS, DAY_SHORT_LABELS } from './example-plan.data';

@Component({
  selector: 'app-nutrition',
  templateUrl: './nutrition.component.html',
  styleUrls: ['./nutrition.component.scss']
})
export class NutritionComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  plan: NutritionPlan | null = null;
  meals: NutritionMeal[] = [];
  messages: ChatMessage[] = [];
  
  loading = true;
  chatLoading = false;
  sendingMessage = false;
  
  newMessage = '';
  userId = '';
  userName = '';
  
  showChat = false;
  unreadCount = 0;
  isExamplePlan = false;
  
  selectedDay = 'monday';
  days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  dayLabels = DAY_LABELS;
  dayShortLabels = DAY_SHORT_LABELS;
  
  private pollSubscription?: Subscription;
  private shouldScrollToBottom = false;

  mealTypeLabels: { [key: string]: string } = {
    'breakfast': 'Desayuno',
    'lunch': 'Almuerzo',
    'dinner': 'Cena',
    'snack': 'Merienda'
  };

  mealTypeIcons: { [key: string]: string } = {
    'breakfast': 'wb_sunny',
    'lunch': 'restaurant',
    'dinner': 'nights_stay',
    'snack': 'coffee'
  };

  constructor(
    private nutritionService: NutritionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Seleccionar el día actual
    const today = new Date().getDay();
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    this.selectedDay = dayMap[today];
    
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.userName = user.fullName || user.email?.split('@')[0] || 'Usuario';
        this.loadPlan();
        this.loadChat();
        this.startPolling();
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  loadPlan(): void {
    this.loading = true;
    this.nutritionService.getUserPlan(this.userId).subscribe({
      next: (response) => {
        if (response.plan) {
          this.plan = response.plan;
          this.meals = response.meals || [];
          this.isExamplePlan = false;
        } else {
          this.loadExamplePlan();
        }
        this.loading = false;
      },
      error: () => {
        this.loadExamplePlan();
        this.loading = false;
      }
    });
  }

  loadExamplePlan(): void {
    this.isExamplePlan = true;
    this.plan = getExamplePlan(this.userId);
    this.meals = getExampleMeals();
  }

  selectDay(day: string): void {
    this.selectedDay = day;
  }

  getMealsForDay(day: string): NutritionMeal[] {
    return this.meals
      .filter(m => m.day_of_week === day)
      .sort((a, b) => a.meal_order - b.meal_order);
  }

  getMealsForSelectedDay(): NutritionMeal[] {
    return this.getMealsForDay(this.selectedDay);
  }

  getDayTotals(day: string): { calories: number; protein: number; carbs: number; fat: number } {
    const dayMeals = this.getMealsForDay(day);
    return {
      calories: dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
      protein: dayMeals.reduce((sum, m) => sum + (m.protein_grams || 0), 0),
      carbs: dayMeals.reduce((sum, m) => sum + (m.carbs_grams || 0), 0),
      fat: dayMeals.reduce((sum, m) => sum + (m.fat_grams || 0), 0)
    };
  }

  isToday(day: string): boolean {
    const today = new Date().getDay();
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayMap[today] === day;
  }

  loadChat(): void {
    this.chatLoading = true;
    this.nutritionService.getChatMessages(this.userId).subscribe({
      next: (response) => {
        this.messages = response.messages || [];
        this.chatLoading = false;
        this.shouldScrollToBottom = true;
        
        if (this.showChat && this.messages.length > 0) {
          this.markAsRead();
        }
      },
      error: () => {
        this.chatLoading = false;
      }
    });
  }

  startPolling(): void {
    this.pollSubscription = interval(10000).subscribe(() => {
      this.checkUnread();
      if (this.showChat) {
        this.loadChat();
      }
    });
  }

  checkUnread(): void {
    this.nutritionService.getUnreadCount(this.userId, 'user').subscribe({
      next: (response) => {
        this.unreadCount = response.unread;
      }
    });
  }

  toggleChat(): void {
    this.showChat = !this.showChat;
    if (this.showChat) {
      this.loadChat();
      this.markAsRead();
    }
  }

  markAsRead(): void {
    this.nutritionService.markMessagesRead(this.userId, 'user').subscribe({
      next: () => {
        this.unreadCount = 0;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.sendingMessage) return;

    this.sendingMessage = true;
    const message: ChatMessage = {
      user_id: this.userId,
      sender_id: this.userId,
      sender_role: 'user',
      message: this.newMessage.trim()
    };

    this.nutritionService.sendMessage(message).subscribe({
      next: (response) => {
        this.messages.push(response.message);
        this.newMessage = '';
        this.sendingMessage = false;
        this.shouldScrollToBottom = true;
      },
      error: () => {
        this.sendingMessage = false;
      }
    });
  }

  scrollToBottom(): void {
    if (this.chatContainer) {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ayer ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return date.toLocaleDateString('es-ES', { weekday: 'short' }) + ' ' + 
             date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  }

  trackByMeal(index: number, meal: NutritionMeal): string {
    return meal.id;
  }

  trackByMessage(index: number, msg: ChatMessage): string {
    return msg.id || index.toString();
  }
}
