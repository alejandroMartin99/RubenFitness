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
  loadingConversation = false;
  userId: string | null = null;
  showQuickActions = true;
  selectedCategory: 'nutrition' | 'training' | null = null;

  // Sidebar conversations (backend)
  sessions: { id: string; title: string; createdAt: string; updatedAt: string }[] = [];
  selectedChatId: string | 'new' = 'new';
  confirmDeleteId: string | null = null;

  // Quick Actions - Main Categories
  quickActions: QuickAction[] = [
    {
      id: 'nutrition',
      title: 'Nutrición avanzada',
      icon: 'restaurant',
      category: 'nutrition',
      message: 'Quiero ajustar mi nutrición para rendimiento y recomposición corporal',
      color: 'nutrition'
    },
    {
      id: 'training',
      title: 'Entrenamiento pro',
      icon: 'fitness_center',
      category: 'training',
      message: 'Necesito optimizar mi entrenamiento para fuerza/hipertrofia con buena técnica',
      color: 'training'
    }
  ];

  // Nutrition Sub-actions
  nutritionActions: SubAction[] = [
    {
      id: 'calories',
      title: 'Ajuste calórico',
      icon: 'local_fire_department',
      message: 'Calcula y ajusta mis calorías para recomposición o definición manteniendo rendimiento'
    },
    {
      id: 'macros',
      title: 'Macronutrientes finos',
      icon: 'pie_chart',
      message: 'Define macros diarios (prote, carbs, grasas) y timing para entrenar fuerte'
    },
    {
      id: 'meal-plan',
      title: 'Meal prep eficiente',
      icon: 'restaurant_menu',
      message: 'Crea un plan de comidas batch (meal prep) optimizado para proteína y micronutrientes'
    },
    {
      id: 'pre-workout',
      title: 'Pre-entreno',
      icon: 'bolt',
      message: 'Dame opciones de pre-entreno según hora y tipo de sesión (fuerza o cardio)'
    },
    {
      id: 'post-workout',
      title: 'Post-entreno',
      icon: 'refresh',
      message: 'Optimiza mi post-entreno para recuperación y síntesis proteica'
    },
    {
      id: 'supplements',
      title: 'Suplementos útiles',
      icon: 'medication',
      message: 'Suplementos con evidencia para fuerza/hipertrofia y timing recomendado'
    }
  ];

  // Training Sub-actions
  trainingActions: SubAction[] = [
    {
      id: 'routine',
      title: 'Rutina pro',
      icon: 'list_alt',
      message: 'Diseña una rutina de fuerza/hipertrofia con progresión y deloads'
    },
    {
      id: 'sets-reps',
      title: 'Series, RIR y descansos',
      icon: 'repeat',
      message: 'Define series, repeticiones, RIR/RPE y descansos óptimos para mi objetivo'
    },
    {
      id: 'technique',
      title: 'Técnica y riesgos',
      icon: 'school',
      message: 'Pautas de técnica y control de fatiga para evitar lesiones en básicos'
    },
    {
      id: 'strength',
      title: 'Bloque de fuerza',
      icon: 'sports_gymnastics',
      message: 'Planifica un bloque de fuerza (3-6 semanas) con progresión semanal'
    },
    {
      id: 'cardio',
      title: 'Cardio estratégico',
      icon: 'directions_run',
      message: 'Integra cardio (LISS/HIIT) sin interferir con mis ganancias de fuerza'
    },
    {
      id: 'recovery',
      title: 'Recuperación pro',
      icon: 'healing',
      message: 'Mejora recuperación: sueño, variabilidad, gestión de volumen y movilidad'
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
    this.loadingConversation = true;
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
        this.loadingConversation = false;
      },
      error: () => {
        this.messages = [];
        this.showQuickActions = true;
        this.loadingConversation = false;
      }
    });
  }

  deleteConversation(chatId: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.confirmDeleteId = chatId;
  }

  confirmDelete(): void {
    if (!this.confirmDeleteId) return;
    const chatId = this.confirmDeleteId;
    this.chatService.deleteConversation(chatId).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.id !== chatId);
        if (this.selectedChatId === chatId) {
          this.startNewChat();
        }
        this.confirmDeleteId = null;
      },
      error: () => {
        this.confirmDeleteId = null;
      }
    });
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
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
    if (!clean) return 'Nuevo chat';
    // Dar más contexto fitness pro
    const keywords = ['fuerza', 'hipertrofia', 'rendimiento', 'nutrición', 'suplementos'];
    const found = keywords.find(k => clean.toLowerCase().includes(k));
    if (found) return `Plan ${found}: ${clean.slice(0, 32)}`;
    return clean.slice(0, 50);
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
