/**
 * Chat Models
 * Represents chat messages and interactions with the AI assistant
 */

export interface ChatMessage {
  /** Message role: user or assistant */
  role: 'user' | 'assistant';
  /** Message content */
  content: string;
  /** Message timestamp */
  timestamp?: Date;
  /** Optional user ID for this message */
  userId?: string;
}

/** Request payload for sending a chat message */
export interface ChatRequest {
  userId: string;
  message: string;
  context?: Record<string, any>;
}

/** Response from chat API */
export interface ChatResponse {
  message: string;
  userId: string;
  timestamp: Date;
}

/** Chat history for a user */
export interface ChatHistory {
  userId: string;
  messages: ChatMessage[];
}


