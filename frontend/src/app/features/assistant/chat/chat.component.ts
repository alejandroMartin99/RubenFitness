import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../../core/services/chat.service';
import { ChatMessage } from '../../../core/models/chat.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: ChatMessage[] = [];
  inputMessage = '';
  loading = false;
  userId: string | null = null;

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

  /**
   * Load chat history
   */
  loadHistory(): void {
    this.chatService.getHistory().subscribe({
      next: (response) => {
        this.messages = response.messages || [];
      },
      error: (err) => {
        console.error('Error loading chat history:', err);
      }
    });
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
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.loading = false;
        // Add error message
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
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
}
