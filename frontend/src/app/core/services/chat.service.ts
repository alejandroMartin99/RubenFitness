/**
 * Chat Service
 * Handles AI assistant chat interactions
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ChatMessage, ChatResponse } from '../models/chat.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  /**
   * Send a message to the AI assistant
   * @param message User message
   * @param context Additional context
   */
  sendMessage(message: string, context?: any): Observable<ChatResponse> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.apiService.post<ChatResponse>('/api/v1/chat', {
      user_id: user.id,
      message,
      context
    });
  }

  /**
   * Get chat history for current user
   * @param limit Maximum number of messages
   */
  getHistory(limit: number = 20): Observable<any> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.apiService.get<any>(`/api/v1/chat/history/${user.id}?limit=${limit}`);
  }

  // Conversations API
  createConversation(title?: string): Observable<any> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    return this.apiService.post<any>('/api/v1/chat/conversations', {
      user_id: user.id,
      title: title || undefined
    });
  }

  listConversations(): Observable<any> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    return this.apiService.get<any>(`/api/v1/chat/conversations/${user.id}`);
  }

  renameConversation(conversationId: string, title: string): Observable<any> {
    return this.apiService.patch<any>(`/api/v1/chat/conversations/${conversationId}`, { title });
  }

  deleteConversation(conversationId: string): Observable<any> {
    return this.apiService.delete<any>(`/api/v1/chat/conversations/${conversationId}`);
  }

  listMessagesByConversation(conversationId: string, limit: number = 200): Observable<any> {
    return this.apiService.get<any>(`/api/v1/chat/conversations/${conversationId}/messages?limit=${limit}`);
  }
}

