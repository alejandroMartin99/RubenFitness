import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { NutritionService, NutritionPlan, NutritionMeal, ChatMessage } from '../../../core/services/nutrition.service';
import { AuthService } from '../../../core/services/auth.service';
import { interval, Subscription } from 'rxjs';

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
  
  private pollSubscription?: Subscription;
  private shouldScrollToBottom = false;

  mealTypeLabels: { [key: string]: string } = {
    'breakfast': 'Desayuno',
    'lunch': 'Almuerzo',
    'dinner': 'Cena',
    'snack': 'Snack',
    'pre_workout': 'Pre-entreno',
    'post_workout': 'Post-entreno'
  };

  mealTypeIcons: { [key: string]: string } = {
    'breakfast': 'wb_sunny',
    'lunch': 'restaurant',
    'dinner': 'nights_stay',
    'snack': 'local_cafe',
    'pre_workout': 'fitness_center',
    'post_workout': 'sports_score'
  };

  constructor(
    private nutritionService: NutritionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
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
        this.plan = response.plan;
        this.meals = response.meals || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadChat(): void {
    this.chatLoading = true;
    this.nutritionService.getChatMessages(this.userId).subscribe({
      next: (response) => {
        this.messages = response.messages || [];
        this.chatLoading = false;
        this.shouldScrollToBottom = true;
        
        // Mark messages as read
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
    // Poll for new messages every 10 seconds
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

  getMealsByType(type: string): NutritionMeal[] {
    return this.meals.filter(m => m.meal_type === type);
  }

  getMealTypes(): string[] {
    const types = ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'];
    return types.filter(t => this.meals.some(m => m.meal_type === t));
  }

  formatTime(time: string | undefined): string {
    if (!time) return '';
    return time;
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

