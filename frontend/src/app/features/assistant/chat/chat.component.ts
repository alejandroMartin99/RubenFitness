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
  allHistory: ChatMessage[] = [];
  inputMessage = '';
  loading = false;
  userId: string | null = null;
  showQuickActions = true;
  selectedCategory: 'nutrition' | 'training' | null = null;

  // Sidebar conversations (backend)
  sessions: { id: string; title: string; createdAt: string; updatedAt: string }[] = [];
  selectedChatId: string | 'new' = 'new';

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
      this.loadSessions();
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  /**
   * Load chat history
   */
  loadSessions(): void {
    this.chatService.listConversations().subscribe({
      next: (res: any) => {
        const list = res?.conversations || [];
        this.sessions = list.map((c: any) => ({
          id: c.id,
          title: c.title,
          createdAt: c.created_at || c.createdAt,
          updatedAt: c.updated_at || c.updatedAt
        }));
        this.startNewChat();
      },
      error: () => {
        this.sessions = [];
        this.startNewChat();
      }
    });
  }

  // (removed legacy recentChats helpers)

  startNewChat(): void {
    this.selectedChatId = 'new';
    this.messages = [];
    this.showQuickActions = true;
    this.selectedCategory = null;
  }

  openChat(chatId: string): void {
    this.selectedChatId = chatId;
    this.chatService.listMessagesByConversation(chatId).subscribe({
      next: (res: any) => {
        const msgs = res?.messages || [];
        this.messages = msgs.map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
          userId: this.userId || undefined
        }));
        this.showQuickActions = this.messages.length === 0;
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => {
        this.messages = [];
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
    // Persist to local right away (optimistic)
    this.appendToLocalHistory(userMessage);

    // Scroll to bottom after adding user message
    setTimeout(() => this.scrollToBottom(), 100);

    const context: any = {};
    if (this.selectedChatId && this.selectedChatId !== 'new') {
      context.session_id = this.selectedChatId;
    }
    this.chatService.sendMessage(messageToSend, context).subscribe({
      next: (response) => {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: response.timestamp ? new Date(response.timestamp) : new Date(),
          userId: this.userId || undefined
        };
        this.messages.push(aiMessage);
        // Also push into allHistory for the current day bucket so it shows in sidebar
        try {
          if (this.selectedChatId === 'new') {
            const title = this.generateSessionTitle(userMessage.content);
            this.chatService.createConversation(title).subscribe({
              next: (conv: any) => {
                this.sessions = [{
                  id: conv.id,
                  title: conv.title,
                  createdAt: conv.created_at,
                  updatedAt: conv.updated_at
                }, ...this.sessions];
                this.selectedChatId = conv.id;
              },
              error: () => {}
            });
          }
        } catch {}
        this.loading = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.loading = false;
        
        // Show user-friendly error message
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo en un momento.',
          timestamp: new Date(),
          userId: this.userId || undefined
        };
        this.messages.push(errorMessage);
        this.appendToLocalHistory(errorMessage);
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  /** Local storage fallback to persist chat when backend cannot save (e.g., mock users) */
  private localKey(): string {
    const uid = this.userId || 'guest';
    return `rf_chat_history_${uid}`;
  }

  private loadLocalHistory(): ChatMessage[] {
    try {
      const raw = localStorage.getItem(this.localKey());
      if (!raw) return [];
      const arr = JSON.parse(raw) as any[];
      return arr.map(m => ({ ...m, timestamp: m.timestamp ? new Date(m.timestamp) : new Date() }));
    } catch {
      return [];
    }
  }

  private saveLocalHistory(history: ChatMessage[]): void {
    try {
      const serializable = history.map(m => ({ ...m, timestamp: (m.timestamp as Date).toISOString() }));
      localStorage.setItem(this.localKey(), JSON.stringify(serializable));
    } catch {}
  }

  private appendToLocalHistory(message: ChatMessage): void {
    const current = this.loadLocalHistory();
    current.push({ ...message, timestamp: message.timestamp as Date });
    this.saveLocalHistory(current);
  }

  private mergeHistories(a: ChatMessage[], b: ChatMessage[]): ChatMessage[] {
    const key = (m: ChatMessage) => `${(m.timestamp as Date).toISOString()}|${m.role}|${m.content}`;
    const map = new Map<string, ChatMessage>();
    [...a, ...b].forEach(m => map.set(key(m), m));
    return Array.from(map.values()).sort((m1, m2) => (m1.timestamp as Date).getTime() - (m2.timestamp as Date).getTime());
  }

  private generateSessionTitle(firstMessage: string): string {
    const clean = (firstMessage || '').replace(/\s+/g, ' ').trim();
    return clean ? clean.slice(0, 40) : 'Nuevo chat';
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
