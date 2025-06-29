/**
 * Messaging System Types - Clean Architecture Implementation
 * 
 * This file contains all TypeScript interfaces and types for the unified
 * messaging system, ensuring type safety across the entire application.
 */

// =================================================================
// CORE ENTITIES
// =================================================================

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'system';
  created_at: string;
  updated_at: string;
  read_receipts: Record<string, string>; // user_id -> timestamp
  metadata: Record<string, any>;
}

export interface Conversation {
  id: string;
  match_id?: string;
  created_at: string;
  updated_at: string;
  last_message_id?: string;
  participant_count: number;
  metadata: Record<string, any>;
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at?: string;
  notification_settings: Record<string, any>;
}

// =================================================================
// ENHANCED ENTITIES (WITH RELATIONSHIPS)
// =================================================================

export interface Participant {
  user_id: string;
  name: string;
  avatar_url?: string;
  joined_at: string;
  last_read_at?: string;
  notification_settings: Record<string, any>;
}

export interface ConversationWithParticipants extends Conversation {
  participants: Participant[];
  last_message?: Message;
  unread_count?: number;
  other_participant?: Participant; // For 1-on-1 conversations
}

export interface MessageWithSender extends Message {
  sender: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  is_own_message: boolean;
  is_read_by_other: boolean;
}

// =================================================================
// API DATA TRANSFER OBJECTS
// =================================================================

export interface CreateConversationDTO {
  match_id?: string;
  participant_ids: string[];
  metadata?: Record<string, any>;
}

export interface CreateMessageDTO {
  conversation_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'system';
  metadata?: Record<string, any>;
}

export interface UpdateConversationDTO {
  metadata?: Record<string, any>;
  notification_settings?: Record<string, any>;
}

export interface MarkAsReadDTO {
  conversation_id: string;
  message_id?: string; // If provided, mark up to this message
}

// =================================================================
// REPOSITORY INTERFACES
// =================================================================

export interface ConversationRepository {
  findByUserId(userId: string): Promise<ConversationWithParticipants[]>;
  findByMatchId(matchId: string): Promise<ConversationWithParticipants | null>;
  findById(id: string): Promise<ConversationWithParticipants | null>;
  create(data: CreateConversationDTO): Promise<ConversationWithParticipants>;
  update(id: string, data: UpdateConversationDTO): Promise<ConversationWithParticipants>;
  delete(id: string): Promise<void>;
  ensureFromMatch(matchId: string): Promise<ConversationWithParticipants>;
}

export interface MessageRepository {
  findByConversationId(conversationId: string, limit?: number, before?: string): Promise<MessageWithSender[]>;
  findById(id: string): Promise<MessageWithSender | null>;
  create(data: CreateMessageDTO): Promise<MessageWithSender>;
  update(id: string, content: string): Promise<MessageWithSender>;
  delete(id: string): Promise<void>;
  markAsRead(conversationId: string, userId: string, messageId?: string): Promise<void>;
  getUnreadCount(conversationId: string, userId: string): Promise<number>;
}

// =================================================================
// SERVICE INTERFACES
// =================================================================

export interface MessagingServiceInterface {
  // Conversation operations
  getConversations(userId: string): Promise<ConversationWithParticipants[]>;
  getConversation(conversationId: string): Promise<ConversationWithParticipants | null>;
  ensureConversation(matchId: string): Promise<ConversationWithParticipants>;
  createConversation(data: CreateConversationDTO): Promise<ConversationWithParticipants>;
  updateConversation(id: string, data: UpdateConversationDTO): Promise<ConversationWithParticipants>;
  deleteConversation(id: string): Promise<void>;

  // Message operations
  getMessages(conversationId: string, limit?: number, before?: string): Promise<MessageWithSender[]>;
  sendMessage(conversationId: string, content: string, type?: 'text' | 'image'): Promise<MessageWithSender>;
  updateMessage(messageId: string, content: string): Promise<MessageWithSender>;
  deleteMessage(messageId: string): Promise<void>;

  // Read status operations
  markAsRead(conversationId: string, userId: string, messageId?: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  getConversationUnreadCount(conversationId: string, userId: string): Promise<number>;

  // Real-time subscriptions
  subscribeToConversations(userId: string, callback: (conversations: ConversationWithParticipants[]) => void): () => void;
  subscribeToMessages(conversationId: string, callback: (messages: MessageWithSender[]) => void): () => void;
  subscribeToNewMessages(userId: string, callback: (message: MessageWithSender) => void): () => void;
}

// =================================================================
// STORE STATE INTERFACES
// =================================================================

export interface MessagingState {
  // Data
  conversations: ConversationWithParticipants[];
  messages: Record<string, MessageWithSender[]>; // conversation_id -> messages
  activeConversationId: string | null;

  // Loading states
  loading: {
    conversations: boolean;
    messages: Record<string, boolean>; // conversation_id -> loading
    sending: boolean;
    initializing: boolean;
  };

  // Error states
  errors: {
    conversations: string | null;
    messages: Record<string, string>; // conversation_id -> error
    sending: string | null;
    general: string | null;
  };

  // Metadata
  lastFetch: {
    conversations: number | null;
    messages: Record<string, number>; // conversation_id -> timestamp
  };

  // Subscriptions tracking
  subscriptions: {
    conversations: (() => void) | null;
    messages: Record<string, () => void>; // conversation_id -> unsubscribe
    newMessages: (() => void) | null;
  };
}

// Additional types for the unified messaging store
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface MatchCard {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  conversation_id?: string;
  has_unread_messages: boolean;
  last_message_at?: string;
  initiated_conversation_by?: string;
  otherUser: {
    id: string;
    name: string;
    profile_image_url?: string;
  };
}

export interface MessagingStoreState {
  conversations: Map<string, Conversation>;
  messages: Map<string, Message[]>;
  newMatches: MatchCard[];
  activeConversations: MatchCard[];
  loading: boolean;
  error: string | null;
  unreadCounts: Map<string, number>;
}

export interface MessagingStoreActions {
  loadConversations(userId: string): Promise<void>;
  loadMatchCards(userId: string): Promise<void>;
  loadMessages(conversationId: string, limit?: number, offset?: number): Promise<Message[]>;
  sendMessage(conversationId: string, content: string, senderId: string): Promise<Message>;
  createConversationFromMatch(matchId: string, initiatorId: string): Promise<Conversation>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  getConversationWithMessages(conversationId: string): ConversationWithMessages | null;
  getUnreadCount(conversationId: string): number;
  getTotalUnreadCount(): number;
  subscribeToConversations(userId: string): () => void;
  subscribeToMessages(conversationId: string): () => void;
  subscribeToMatches(userId: string): () => void;
  clearError(): void;
  reset(): void;
}

export interface MessagingActions {
  // Data fetching
  fetchConversations(): Promise<void>;
  fetchMessages(conversationId: string, limit?: number, before?: string): Promise<void>;
  refreshConversations(): Promise<void>;
  refreshMessages(conversationId: string): Promise<void>;

  // Conversation operations
  ensureConversation(matchId: string): Promise<string>;
  createConversation(data: CreateConversationDTO): Promise<string>;
  updateConversation(id: string, data: UpdateConversationDTO): Promise<void>;
  deleteConversation(id: string): Promise<void>;

  // Message operations
  sendMessage(conversationId: string, content: string, type?: 'text' | 'image'): Promise<void>;
  updateMessage(messageId: string, content: string): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;

  // Read status
  markAsRead(conversationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;

  // Navigation
  setActiveConversation(conversationId: string | null): void;

  // Subscriptions
  subscribeToConversations(): void;
  subscribeToMessages(conversationId: string): void;
  subscribeToNewMessages(): void;
  unsubscribeFromMessages(conversationId: string): void;
  unsubscribeAll(): void;

  // Selectors (computed values)
  getConversation(id: string): ConversationWithParticipants | null;
  getMessages(conversationId: string): MessageWithSender[];
  getUnreadCount(): number;
  getConversationUnreadCount(conversationId: string): number;
  getConversationByMatchId(matchId: string): ConversationWithParticipants | null;
  getOtherParticipant(conversationId: string, currentUserId: string): Participant | null;
  isLoadingConversations(): boolean;
  isLoadingMessages(conversationId: string): boolean;
  isSending(): boolean;
  hasConversationError(conversationId: string): string | null;

  // Utility
  clearErrors(): void;
  clearConversationError(conversationId: string): void;
  cleanup(): void;
  reset(): void;
}

export type MessagingStore = MessagingState & MessagingActions;

// =================================================================
// REAL-TIME SUBSCRIPTION TYPES
// =================================================================

export interface SubscriptionCallback<T> {
  (data: T): void;
}

export interface ConversationSubscription {
  conversation_id: string;
  unsubscribe: () => void;
}

export interface MessageSubscription {
  conversation_id: string;
  unsubscribe: () => void;
}

// =================================================================
// UTILITY TYPES
// =================================================================

export type ConversationSortBy = 'updated_at' | 'created_at' | 'last_message_at';
export type MessageSortBy = 'created_at' | 'updated_at';

export interface ConversationFilters {
  hasUnread?: boolean;
  matchId?: string;
  participantId?: string;
}

export interface MessageFilters {
  senderId?: string;
  messageType?: 'text' | 'image' | 'system';
  after?: string; // timestamp
  before?: string; // timestamp
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  before?: string; // cursor-based pagination
  after?: string; // cursor-based pagination
}

// =================================================================
// ERROR TYPES
// =================================================================

export class MessagingError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'MessagingError';
  }
}

export class ConversationNotFoundError extends MessagingError {
  constructor(conversationId: string) {
    super(
      `Conversation not found: ${conversationId}`,
      'CONVERSATION_NOT_FOUND',
      { conversationId }
    );
  }
}

export class MessageNotFoundError extends MessagingError {
  constructor(messageId: string) {
    super(
      `Message not found: ${messageId}`,
      'MESSAGE_NOT_FOUND',
      { messageId }
    );
  }
}

export class UnauthorizedConversationError extends MessagingError {
  constructor(conversationId: string, userId: string) {
    super(
      `User ${userId} is not authorized to access conversation ${conversationId}`,
      'UNAUTHORIZED_CONVERSATION',
      { conversationId, userId }
    );
  }
}

// =================================================================
// COMPONENT PROP TYPES
// =================================================================

export interface ConversationListProps {
  conversations: ConversationWithParticipants[];
  loading: boolean;
  error: string | null;
  onConversationSelect: (conversationId: string) => void;
  onRefresh: () => void;
  currentUserId: string;
}

export interface MessageListProps {
  messages: MessageWithSender[];
  loading: boolean;
  error: string | null;
  onLoadMore: () => void;
  onRefresh: () => void;
  currentUserId: string;
}

export interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image') => void;
  loading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export interface ConversationHeaderProps {
  conversation: ConversationWithParticipants;
  currentUserId: string;
  onBack: () => void;
  onMoreOptions?: () => void;
}

// =================================================================
// HOOK RETURN TYPES
// =================================================================

export interface UseConversationsReturn {
  conversations: ConversationWithParticipants[];
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  getUnreadCount: () => number;
}

export interface UseMessagesReturn {
  messages: MessageWithSender[];
  loading: boolean;
  error: string | null;
  fetchMessages: () => Promise<void>;
  sendMessage: (content: string, type?: 'text' | 'image') => Promise<void>;
  markAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export interface UseConversationReturn {
  conversation: ConversationWithParticipants | null;
  loading: boolean;
  error: string | null;
  otherParticipant: Participant | null;
  unreadCount: number;
  markAsRead: () => Promise<void>;
}

// =================================================================
// LEGACY COMPATIBILITY (FOR MIGRATION)
// =================================================================

/**
 * @deprecated Use ConversationWithParticipants instead
 */
export interface LegacyConversation {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
  };
  unreadCount: number;
  updatedAt: string | Date;
}

/**
 * @deprecated Use MessageWithSender instead
 */
export interface LegacyMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
} 