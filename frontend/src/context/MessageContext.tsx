import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Message,
  Conversation,
  Feedback,
  Milestone,
  ChildId
} from '../types';
import { storageManager } from '../utils/storage';
import { getSavedUser, User } from '../utils/deviceManager';

interface MessageContextType {
  // Conversation operations
  conversations: Conversation[];
  getConversations: (userId: string, childId?: number) => Conversation[];
  createConversation: (type: 'group' | 'direct', name: string, childId: number, participantIds: string[]) => Promise<Conversation>;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => Promise<void>;
  pinConversation: (conversationId: string, isPinned: boolean) => Promise<void>;

  // Message operations
  getMessages: (conversationId: string, limit?: number, offset?: number) => Promise<Message[]>;
  sendMessage: (conversationId: string, content: string, type: 'text' | 'image' | 'file' | 'feedback' | 'milestone', metadata?: any) => Promise<Message>;
  markAsRead: (conversationId: string, userId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string, userId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  // Feedback operations
  sendFeedback: (childId: number, feedbackData: Omit<Feedback, 'id' | 'createdAt'>) => Promise<Feedback>;
  getFeedbackByChild: (childId: number) => Promise<Feedback[]>;
  getFeedbackByType: (childId: number, type: Feedback['type']) => Promise<Feedback[]>;
  updateFeedback: (feedbackId: string, updates: Partial<Feedback>) => Promise<void>;
  completeFeedbackAction: (feedbackId: string, actionItemId: string) => Promise<void>;

  // Milestone operations
  createMilestone: (milestone: Omit<Milestone, 'id'>) => Promise<Milestone>;
  getMilestonesByChild: (childId: number) => Promise<Milestone[]>;
  deleteMilestone: (milestoneId: string) => Promise<void>;

  // Search & Filter
  searchMessages: (query: string, childId?: number) => Promise<Message[]>;
  searchFeedback: (query: string, childId?: number) => Promise<Feedback[]>;
  getMessagesByTag: (tag: string, childId?: number) => Promise<Message[]>;

  // File upload
  uploadFile: (file: File) => Promise<{ id: string; url: string; filename: string }>;

  // Statistics
  getUnreadCount: (userId: string) => number;
  getFeedbackStats: (childId: number) => {
    progress: number;
    concern: number;
    suggestion: number;
    celebration: number;
  };
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = getSavedUser();
    setUser(savedUser);
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const stored = await storageManager.get<Conversation[]>('conversations');
      if (stored) {
        setConversations(stored);
      }
    } catch (error) {
      console.error('대화 목록 로드 실패:', error);
    }
  };

  const getConversations = useCallback((userId: string, childId?: number): Conversation[] => {
    return conversations.filter(conv => {
      const hasParticipant = conv.participants.some(p => p.userId === userId);
      const matchesChild = !childId || conv.childId === childId;
      return hasParticipant && matchesChild;
    });
  }, [conversations]);

  const createConversation = useCallback(async (
    type: 'group' | 'direct',
    name: string,
    childId: number,
    participantIds: string[]
  ): Promise<Conversation> => {
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      type,
      name,
      childId,
      participants: participantIds.map(id => ({
        userId: id,
        name: id,
        role: 'parent',
        joinedAt: new Date().toISOString(),
      })),
      unreadCount: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
    };

    const updated = [...conversations, newConversation];
    setConversations(updated);
    await storageManager.set('conversations', updated);
    return newConversation;
  }, [conversations]);

  const updateConversation = useCallback(async (
    conversationId: string,
    updates: Partial<Conversation>
  ): Promise<void> => {
    const updated = conversations.map(conv =>
      conv.id === conversationId
        ? { ...conv, ...updates, updatedAt: new Date().toISOString() }
        : conv
    );
    setConversations(updated);
    await storageManager.set('conversations', updated);
  }, [conversations]);

  const pinConversation = useCallback(async (
    conversationId: string,
    isPinned: boolean
  ): Promise<void> => {
    await updateConversation(conversationId, { isPinned });
  }, [updateConversation]);

  const getMessages = useCallback(async (
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> => {
    try {
      const messages = await storageManager.get<Message[]>(`messages_${conversationId}`) || [];
      return messages.slice(offset, offset + limit).reverse();
    } catch (error) {
      console.error('메시지 로드 실패:', error);
      return [];
    }
  }, []);

  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    type: Message['type'],
    metadata?: any
  ): Promise<Message> => {
    if (!user) throw new Error('사용자 정보가 없습니다');

    const message: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: user.id || 'unknown',
      senderName: user.name || 'Unknown',
      senderRole: (user.role as any) || 'parent',
      childId: 1, // Default, should be set based on conversation
      type,
      content,
      createdAt: new Date().toISOString(),
      metadata,
      reactions: [],
    };

    // Save message
    const messages = await storageManager.get<Message[]>(`messages_${conversationId}`) || [];
    const updated = [...messages, message];
    await storageManager.set(`messages_${conversationId}`, updated);

    // Update conversation last message
    await updateConversation(conversationId, { lastMessage: message });

    return message;
  }, [user, updateConversation]);

  const markAsRead = useCallback(async (
    conversationId: string,
    userId: string
  ): Promise<void> => {
    const updated = conversations.map(conv =>
      conv.id === conversationId
        ? { ...conv, unreadCount: { ...conv.unreadCount, [userId]: 0 } }
        : conv
    );
    setConversations(updated);
    await storageManager.set('conversations', updated);
  }, [conversations]);

  const addReaction = useCallback(async (
    messageId: string,
    emoji: string,
    userId: string
  ): Promise<void> => {
    const messages = await storageManager.get<Message[]>('all_messages') || [];
    const updated = messages.map(msg => {
      if (msg.id === messageId) {
        const existing = msg.reactions?.find(r => r.emoji === emoji);
        if (existing) {
          if (!existing.userIds.includes(userId)) {
            existing.userIds.push(userId);
            existing.count++;
          }
        } else {
          msg.reactions = [...(msg.reactions || []), { emoji, count: 1, userIds: [userId] }];
        }
      }
      return msg;
    });
    await storageManager.set('all_messages', updated);
  }, []);

  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    const messages = await storageManager.get<Message[]>('all_messages') || [];
    const updated = messages.filter(msg => msg.id !== messageId);
    await storageManager.set('all_messages', updated);
  }, []);

  const sendFeedback = useCallback(async (
    childId: number,
    feedbackData: Omit<Feedback, 'id' | 'createdAt'>
  ): Promise<Feedback> => {
    const feedback: Feedback = {
      id: `feedback_${Date.now()}`,
      ...feedbackData,
      createdAt: new Date().toISOString(),
    };

    const feedbacks = await storageManager.get<Feedback[]>(`feedback_${childId}`) || [];
    const updated = [...feedbacks, feedback];
    await storageManager.set(`feedback_${childId}`, updated);

    return feedback;
  }, []);

  const getFeedbackByChild = useCallback(async (childId: number): Promise<Feedback[]> => {
    try {
      return await storageManager.get<Feedback[]>(`feedback_${childId}`) || [];
    } catch (error) {
      console.error('피드백 로드 실패:', error);
      return [];
    }
  }, []);

  const getFeedbackByType = useCallback(async (
    childId: number,
    type: Feedback['type']
  ): Promise<Feedback[]> => {
    const feedbacks = await getFeedbackByChild(childId);
    return feedbacks.filter(f => f.type === type);
  }, [getFeedbackByChild]);

  const updateFeedback = useCallback(async (
    feedbackId: string,
    updates: Partial<Feedback>
  ): Promise<void> => {
    // Implementation would search across all feedback files
    console.log(`Updating feedback ${feedbackId}`, updates);
  }, []);

  const completeFeedbackAction = useCallback(async (
    feedbackId: string,
    actionItemId: string
  ): Promise<void> => {
    console.log(`Completing action ${actionItemId} for feedback ${feedbackId}`);
  }, []);

  const createMilestone = useCallback(async (
    milestone: Omit<Milestone, 'id'>
  ): Promise<Milestone> => {
    const newMilestone: Milestone = {
      id: `milestone_${Date.now()}`,
      ...milestone,
    };

    const milestones = await storageManager.get<Milestone[]>(`milestones_${milestone.childId}`) || [];
    const updated = [...milestones, newMilestone];
    await storageManager.set(`milestones_${milestone.childId}`, updated);

    return newMilestone;
  }, []);

  const getMilestonesByChild = useCallback(async (childId: number): Promise<Milestone[]> => {
    try {
      return await storageManager.get<Milestone[]>(`milestones_${childId}`) || [];
    } catch (error) {
      console.error('마일스톤 로드 실패:', error);
      return [];
    }
  }, []);

  const deleteMilestone = useCallback(async (milestoneId: string): Promise<void> => {
    console.log(`Deleting milestone ${milestoneId}`);
  }, []);

  const searchMessages = useCallback(async (
    query: string,
    childId?: number
  ): Promise<Message[]> => {
    const messages = await storageManager.get<Message[]>('all_messages') || [];
    return messages.filter(msg => {
      const matchesQuery = msg.content.toLowerCase().includes(query.toLowerCase());
      const matchesChild = !childId || msg.childId === childId;
      return matchesQuery && matchesChild;
    });
  }, []);

  const searchFeedback = useCallback(async (
    query: string,
    childId?: number
  ): Promise<Feedback[]> => {
    if (childId) {
      const feedbacks = await getFeedbackByChild(childId);
      return feedbacks.filter(f =>
        f.content.toLowerCase().includes(query.toLowerCase())
      );
    }
    return [];
  }, [getFeedbackByChild]);

  const getMessagesByTag = useCallback(async (
    tag: string,
    childId?: number
  ): Promise<Message[]> => {
    const messages = await storageManager.get<Message[]>('all_messages') || [];
    return messages.filter(msg => {
      const hasTags = msg.tags?.includes(tag);
      const matchesChild = !childId || msg.childId === childId;
      return hasTags && matchesChild;
    });
  }, []);

  const uploadFile = useCallback(async (
    file: File
  ): Promise<{ id: string; url: string; filename: string }> => {
    // Simulate file upload (in production, would upload to cloud storage)
    return {
      id: `file_${Date.now()}`,
      url: URL.createObjectURL(file),
      filename: file.name,
    };
  }, []);

  const getUnreadCount = useCallback((userId: string): number => {
    return conversations.reduce((sum, conv) => {
      return sum + (conv.unreadCount[userId] || 0);
    }, 0);
  }, [conversations]);

  const getFeedbackStats = useCallback((childId: number) => {
    const feedbacks = conversations
      .filter(c => c.childId === childId)
      .flatMap(c => c.lastMessage ? [c.lastMessage] : [])
      .filter(m => m.type === 'feedback') as any[];

    return {
      progress: feedbacks.filter((f: any) => f.metadata?.type === 'progress').length,
      concern: feedbacks.filter((f: any) => f.metadata?.type === 'concern').length,
      suggestion: feedbacks.filter((f: any) => f.metadata?.type === 'suggestion').length,
      celebration: feedbacks.filter((f: any) => f.metadata?.type === 'celebration').length,
    };
  }, [conversations]);

  const value: MessageContextType = {
    conversations,
    getConversations,
    createConversation,
    updateConversation,
    pinConversation,
    getMessages,
    sendMessage,
    markAsRead,
    addReaction,
    deleteMessage,
    sendFeedback,
    getFeedbackByChild,
    getFeedbackByType,
    updateFeedback,
    completeFeedbackAction,
    createMilestone,
    getMilestonesByChild,
    deleteMilestone,
    searchMessages,
    searchFeedback,
    getMessagesByTag,
    uploadFile,
    getUnreadCount,
    getFeedbackStats,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}
