import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  NotificationEvent,
  NotificationEventType,
  NotificationHistory,
  PushSubscription,
  NotificationMetadata,
  NotificationSeverity,
  NotificationPriority,
  CANONICAL_CHILDREN,
  LTOCompletedEvent,
  ScoreImprovedEvent,
  MessageReceivedEvent,
  MilestoneAchievedEvent,
} from '../types';
import { storageManager } from '../utils/storage';

interface NotificationContextType {
  // 알림 조회
  notifications: NotificationHistory[];
  getNotifications: (userId: string, filter?: NotificationFilter) => NotificationHistory[];
  getUnreadCount: (userId: string) => number;

  // 알림 생성 및 발송
  createEvent: (eventData: Omit<NotificationEvent, 'id' | 'createdAt'>) => Promise<NotificationEvent>;
  emitEvent: (eventType: NotificationEventType, metadata: NotificationMetadata) => Promise<void>;

  // 알림 관리
  markAsRead: (notificationId: string, userId: string) => void;
  markAllAsRead: (userId: string) => void;
  deleteNotification: (notificationId: string) => void;
  markAsClicked: (notificationId: string, userId: string) => void;

  // 푸시 구독
  registerPushSubscription: (subscription: Omit<PushSubscription, 'id' | 'createdAt'>) => Promise<PushSubscription>;
  getPushSubscriptions: (userId: string) => PushSubscription[];
  updatePushPreferences: (subscriptionId: string, preferences: PushSubscription['preferences']) => void;

  // 이벤트 리스너
  onNotificationReceived: (callback: (notification: NotificationHistory) => void) => () => void;
}

interface NotificationFilter {
  type?: NotificationEventType[];
  severity?: NotificationSeverity[];
  priority?: NotificationPriority[];
  childId?: number;
  readStatus?: 'read' | 'unread' | 'all';
  startDate?: string;
  endDate?: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Storage key constants
const STORAGE_KEYS = {
  EVENTS: 'notification_events',
  HISTORIES: 'notification_histories',
  SUBSCRIPTIONS: 'push_subscriptions',
  PREFERENCES: 'notification_preferences',
};

// 조용한 시간 확인 유틸리티
const isQuietHoursActive = (preferences: PushSubscription['preferences']): boolean => {
  if (!preferences.quietHours) return false;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const { start, end } = preferences.quietHours;

  if (start < end) {
    return currentTime >= start && currentTime < end;
  } else {
    // 자정을 넘어가는 경우 (예: 22:00 ~ 08:00)
    return currentTime >= start || currentTime < end;
  }
};

// 이벤트 템플릿 (텍스트 기반)
const EVENT_TEMPLATES: Record<NotificationEventType, (metadata: NotificationMetadata) => Partial<NotificationEvent>> = {
  lto_completed: (metadata) => {
    const child = CANONICAL_CHILDREN.find(c => c.id === metadata.childId);
    const ltoName = metadata.ltoName || 'LTO';

    return {
      severity: 'success',
      title: `${child?.name || '아동'} - ${ltoName} 완성!`,
      description: `${child?.name || '아동'}이(가) ${metadata.domainName || '영역'} 내 ${ltoName}을 완성했습니다.`,
      icon: '🎉',
      priority: 'high',
      actionLabel: 'Dashboard',
      actionUrl: `/dashboard/child/${metadata.childId}`,
    };
  },

  score_improved: (metadata) => {
    const child = CANONICAL_CHILDREN.find(c => c.id === metadata.childId);
    const improvement = metadata.improvementPercent || 0;

    return {
      severity: 'success',
      title: `${child?.name || '아동'} - 점수 향상! (+${improvement.toFixed(1)}%)`,
      description: `${child?.name || '아동'}의 점수가 ${metadata.previousScore?.toFixed(1)} → ${metadata.score?.toFixed(1)}로 향상되었습니다.`,
      icon: '📈',
      priority: 'normal',
      actionLabel: 'Details',
      actionUrl: `/reports?childId=${metadata.childId}`,
    };
  },

  message_received: (metadata) => {
    return {
      severity: 'info',
      title: `새 메시지 도착 - ${metadata.senderName || 'Unknown'}`,
      description: metadata.messagePreview || '새로운 메시지가 도착했습니다.',
      icon: '💬',
      priority: 'normal',
      actionLabel: 'Open',
      actionUrl: `/messages?conversationId=${metadata.conversationId}`,
    };
  },

  feedback_received: (metadata) => {
    return {
      severity: 'info',
      title: `피드백 도착 - ${metadata.senderName || 'Therapist'}`,
      description: `${metadata.senderName || 'Therapist'}으로부터 피드백이 도착했습니다.`,
      icon: '📋',
      priority: 'normal',
      actionLabel: 'View',
      actionUrl: `/messages?conversationId=${metadata.conversationId}`,
    };
  },

  milestone_achieved: (metadata) => {
    const child = CANONICAL_CHILDREN.find(c => c.id === metadata.childId);

    return {
      severity: 'success',
      title: `마일스톤 달성! 🏆`,
      description: metadata.celebrationMessage || `${child?.name || '아동'}이(가) 마일스톤을 달성했습니다!`,
      icon: '🏆',
      priority: 'high',
      actionLabel: 'Celebrate',
      actionUrl: `/dashboard?milestone=${metadata.milestoneId}`,
    };
  },

  approval_required: (metadata) => {
    return {
      severity: 'urgent',
      title: '승인 필요',
      description: `${metadata.ltoName || 'Item'}에 대한 승인이 필요합니다.`,
      icon: '⚠️',
      priority: 'urgent',
      actionLabel: 'Approve',
      actionUrl: `/approvals`,
    };
  },

  session_scheduled: (metadata) => {
    const child = CANONICAL_CHILDREN.find(c => c.id === metadata.childId);

    return {
      severity: 'info',
      title: `세션 예약됨 - ${child?.name || 'Child'}`,
      description: `새로운 세션이 ${metadata.childId}에 대해 예약되었습니다.`,
      icon: '📅',
      priority: 'normal',
      actionLabel: 'View Schedule',
      actionUrl: '/schedule',
    };
  },

  reminder: (metadata) => {
    return {
      severity: 'info',
      title: '알림',
      description: metadata.messagePreview || '알림입니다.',
      icon: '🔔',
      priority: 'normal',
    };
  },
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationHistory[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORIES);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.value || [];
      } catch (error) {
        console.error('Failed to parse notification histories:', error);
        return [];
      }
    }
    return [];
  });

  const [pushSubscriptions, setPushSubscriptions] = useState<PushSubscription[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.value || [];
      } catch (error) {
        console.error('Failed to parse push subscriptions:', error);
        return [];
      }
    }
    return [];
  });

  const [notificationListeners, setNotificationListeners] = useState<((n: NotificationHistory) => void)[]>([]);

  // Persist to storage
  useEffect(() => {
    storageManager.set('notification_histories', notifications);
  }, [notifications]);

  useEffect(() => {
    storageManager.set('push_subscriptions', pushSubscriptions);
  }, [pushSubscriptions]);

  // 알림 조회 (필터링 포함)
  const getNotifications = useCallback(
    (userId: string, filter?: NotificationFilter): NotificationHistory[] => {
      let result = notifications.filter(n => n.userId === userId);

      if (filter) {
        if (filter.type?.length) {
          result = result.filter(n => filter.type!.includes(n.notificationEvent.type));
        }
        if (filter.severity?.length) {
          result = result.filter(n => filter.severity!.includes(n.notificationEvent.severity));
        }
        if (filter.priority?.length) {
          result = result.filter(n => filter.priority!.includes(n.notificationEvent.priority));
        }
        if (filter.childId) {
          result = result.filter(n => n.notificationEvent.metadata.childId === filter.childId);
        }
        if (filter.readStatus === 'read') {
          result = result.filter(n => n.interactionStatus === 'viewed' || n.interactionStatus === 'clicked');
        } else if (filter.readStatus === 'unread') {
          result = result.filter(n => n.interactionStatus === 'unread' || n.interactionStatus === 'dismissed');
        }
        if (filter.startDate) {
          result = result.filter(n => new Date(n.createdAt) >= new Date(filter.startDate!));
        }
        if (filter.endDate) {
          result = result.filter(n => new Date(n.createdAt) <= new Date(filter.endDate!));
        }
      }

      return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    [notifications]
  );

  // 미읽음 개수
  const getUnreadCount = useCallback(
    (userId: string): number => {
      return notifications.filter(
        n => n.userId === userId && n.interactionStatus === 'unread'
      ).length;
    },
    [notifications]
  );

  // 이벤트 생성
  const createEvent = useCallback(
    async (eventData: Omit<NotificationEvent, 'id' | 'createdAt'>): Promise<NotificationEvent> => {
      const event: NotificationEvent = {
        ...eventData,
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        read: false,
      };

      // 자동 만료 설정 (7일)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      event.expiresAt = expiresAt.toISOString();

      return event;
    },
    []
  );

  // 이벤트 발송
  const emitEvent = useCallback(
    async (eventType: NotificationEventType, metadata: NotificationMetadata) => {
      const template = EVENT_TEMPLATES[eventType];
      if (!template) {
        console.warn(`Unknown event type: ${eventType}`);
        return;
      }

      const templateData = template(metadata);
      const event = await createEvent({
        type: eventType,
        severity: (templateData.severity as NotificationSeverity) || 'info',
        title: templateData.title || '',
        description: templateData.description || '',
        icon: templateData.icon || '🔔',
        priority: (templateData.priority as NotificationPriority) || 'normal',
        actionUrl: templateData.actionUrl,
        actionLabel: templateData.actionLabel,
        targetUsers: [{ role: 'all' }], // 기본값, 필요에 따라 조정
        metadata,
        channels: {
          inApp: true,
          push: true,
          email: false, // 기본값
        },
      });

      // 대상 사용자들에게 알림 발송
      for (const subscription of pushSubscriptions) {
        // 음소거된 카테고리 확인
        if (subscription.preferences.mutedCategories?.includes(eventType)) {
          continue;
        }

        // 조용한 시간 확인 (push만)
        if (event.channels.push && isQuietHoursActive(subscription.preferences)) {
          continue;
        }

        const history: NotificationHistory = {
          id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: subscription.userId,
          eventId: event.id,
          notificationEvent: event,
          deliveryStatus: {
            inApp: 'delivered',
            push: event.channels.push ? 'pending' : undefined,
            email: event.channels.email ? 'pending' : undefined,
          },
          deliveredAt: {
            inApp: new Date().toISOString(),
          },
          interactionStatus: 'unread',
          createdAt: new Date().toISOString(),
        };

        setNotifications(prev => [...prev, history]);

        // 리스너 호출
        notificationListeners.forEach(listener => listener(history));
      }
    },
    [createEvent, pushSubscriptions, notificationListeners]
  );

  // 읽음 표시
  const markAsRead = useCallback((notificationId: string, userId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId && n.userId === userId
          ? {
              ...n,
              interactionStatus: 'viewed' as const,
              interactedAt: new Date().toISOString(),
            }
          : n
      )
    );
  }, []);

  // 모두 읽음
  const markAllAsRead = useCallback((userId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.userId === userId && n.interactionStatus === 'unread'
          ? {
              ...n,
              interactionStatus: 'viewed' as const,
              interactedAt: new Date().toISOString(),
            }
          : n
      )
    );
  }, []);

  // 클릭 표시
  const markAsClicked = useCallback((notificationId: string, userId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId && n.userId === userId
          ? {
              ...n,
              interactionStatus: 'clicked' as const,
              interactedAt: new Date().toISOString(),
            }
          : n
      )
    );
  }, []);

  // 알림 삭제
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // 푸시 구독 등록
  const registerPushSubscription = useCallback(
    async (subscription: Omit<PushSubscription, 'id' | 'createdAt'>): Promise<PushSubscription> => {
      const newSubscription: PushSubscription = {
        ...subscription,
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      setPushSubscriptions(prev => [...prev, newSubscription]);
      return newSubscription;
    },
    []
  );

  // 푸시 구독 조회
  const getPushSubscriptions = useCallback(
    (userId: string): PushSubscription[] => {
      return pushSubscriptions.filter(s => s.userId === userId);
    },
    [pushSubscriptions]
  );

  // 푸시 선호도 업데이트
  const updatePushPreferences = useCallback((subscriptionId: string, preferences: PushSubscription['preferences']) => {
    setPushSubscriptions(prev =>
      prev.map(s =>
        s.id === subscriptionId
          ? {
              ...s,
              preferences,
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );
  }, []);

  // 이벤트 리스너
  const onNotificationReceived = useCallback((callback: (notification: NotificationHistory) => void) => {
    setNotificationListeners(prev => [...prev, callback]);
    return () => {
      setNotificationListeners(prev => prev.filter(l => l !== callback));
    };
  }, []);

  const value: NotificationContextType = {
    notifications,
    getNotifications,
    getUnreadCount,
    createEvent,
    emitEvent,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    markAsClicked,
    registerPushSubscription,
    getPushSubscriptions,
    updatePushPreferences,
    onNotificationReceived,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
