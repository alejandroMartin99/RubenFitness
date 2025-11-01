import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../../../core/services/chat.service';
import { ChatMessage } from '../../../core/models/chat.model';
import { AuthService } from '../../../core/services/auth.service';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  category: 'nutrition' | 'training';
  message: string;
  color: string;
}

interface SubAction {
  id: string;
  title: string;
  icon: string;
  message: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  messages: ChatMessage[] = [];
  inputMessage = '';
  loading = false;
  userId: string | null = null;
  showQuickActions = true;
  selectedCategory: 'nutrition' | 'training' | null = null;

  // Quick Actions - Main Categories
  quickActions: QuickAction[] = [
    {
      id: 'nutrition',
      title: 'Alimentación',
      icon: 'restaurant',
      category: 'nutrition',
      message: 'Quiero consejos sobre alimentación y nutrición',
      color: 'nutrition'
    },
    {
      id: 'training',
      title: 'Entrenamiento',
      icon: 'fitness_center',
      category: 'training',
      message: 'Necesito ayuda con mi entrenamiento y ejercicios',
      color: 'training'
    }
  ];

  // Nutrition Sub-actions
  nutritionActions: SubAction[] = [
    {
      id: 'calories',
      title: 'Calorías Diarias',
      icon: 'local_fire_department',
      message: '¿Cuántas calorías debería consumir al día?'
    },
    {
      id: 'macros',
      title: 'Macronutrientes',
      icon: 'pie_chart',
      message: 'Explícame sobre proteínas, carbohidratos y grasas'
    },
    {
      id: 'meal-plan',
      title: 'Plan de Comidas',
      icon: 'restaurant_menu',
      message: 'Ayúdame a crear un plan de comidas saludable'
    },
    {
      id: 'pre-workout',
      title: 'Alimentación Pre-Entreno',
      icon: 'bolt',
      message: '¿Qué debo comer antes de entrenar?'
    },
    {
      id: 'post-workout',
      title: 'Alimentación Post-Entreno',
      icon: 'refresh',
      message: '¿Qué debo comer después de entrenar?'
    },
    {
      id: 'supplements',
      title: 'Suplementos',
      icon: 'medication',
      message: '¿Qué suplementos debería tomar?'
    }
  ];

  // Training Sub-actions
  trainingActions: SubAction[] = [
    {
      id: 'routine',
      title: 'Rutina de Ejercicios',
      icon: 'list_alt',
      message: 'Crea una rutina de entrenamiento personalizada para mí'
    },
    {
      id: 'sets-reps',
      title: 'Series y Repeticiones',
      icon: 'repeat',
      message: 'Explícame sobre series, repeticiones y descansos'
    },
    {
      id: 'technique',
      title: 'Técnica de Ejercicios',
      icon: 'school',
      message: 'Enséñame la técnica correcta de ejercicios'
    },
    {
      id: 'strength',
      title: 'Fuerza',
      icon: 'sports_gymnastics',
      message: 'Quiero aumentar mi fuerza'
    },
    {
      id: 'cardio',
      title: 'Cardio',
      icon: 'directions_run',
      message: 'Necesito consejos sobre ejercicios cardiovasculares'
    },
    {
      id: 'recovery',
      title: 'Recuperación',
      icon: 'healing',
      message: 'Cómo mejorar mi recuperación después del entrenamiento'
    }
  ];

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUser()?.id || null;
    if (this.userId) {
      this.loadHistory();
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  /**
   * Load chat history
   */
  loadHistory(): void {
    this.chatService.getHistory().subscribe({
      next: (response) => {
        this.messages = response.messages || [];
        this.showQuickActions = this.messages.length === 0;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Error loading chat history:', err);
        this.showQuickActions = true;
      }
    });
  }

  /**
   * Select a category (Nutrition or Training)
   */
  selectCategory(category: 'nutrition' | 'training'): void {
    this.selectedCategory = category;
  }

  /**
   * Go back to main categories
   */
  backToCategories(): void {
    this.selectedCategory = null;
  }

  /**
   * Handle quick action click
   */
  onQuickActionClick(action: QuickAction): void {
    if (action.category) {
      this.selectCategory(action.category);
    } else {
      this.sendQuickMessage(action.message);
    }
  }

  /**
   * Handle sub-action click
   */
  onSubActionClick(action: SubAction): void {
    this.sendQuickMessage(action.message);
    this.selectedCategory = null;
    this.showQuickActions = false;
  }

  /**
   * Send a quick message from action buttons
   */
  sendQuickMessage(message: string): void {
    this.inputMessage = message;
    this.sendMessage();
  }

  /**
   * Send a message to the AI assistant
   */
  sendMessage(): void {
    if (!this.inputMessage.trim() || this.loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: this.inputMessage,
      timestamp: new Date(),
      userId: this.userId || undefined
    };

    this.messages.push(userMessage);
    const messageToSend = this.inputMessage;
    this.inputMessage = '';
    this.loading = true;
    this.showQuickActions = false;
    this.selectedCategory = null;

    // Scroll to bottom after adding user message
    setTimeout(() => this.scrollToBottom(), 100);

    this.chatService.sendMessage(messageToSend).subscribe({
      next: (response) => {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date(response.timestamp),
          userId: this.userId || undefined
        };
        this.messages.push(aiMessage);
        this.loading = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.loading = false;
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  /**
   * Handle Enter key
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Format message for display (support basic markdown-like formatting)
   */
  formatMessage(content: string): string {
    // Escape HTML first
    let formatted = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Convert newlines to <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Basic markdown-like formatting
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return formatted;
  }

  /**
   * Format timestamp for display
   */
  formatTime(timestamp: Date): string {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)} h`;
    
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * Scroll chat to bottom
   */
  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = 
          this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling:', err);
    }
  }
}
