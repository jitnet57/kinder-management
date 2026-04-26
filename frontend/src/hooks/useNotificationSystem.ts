import { useEffect, useCallback, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useCurriculum } from '../context/CurriculumContext';
import {
  NotificationEventType,
  NotificationMetadata,
  CANONICAL_CHILDREN,
} from '../types';
import { initializePushNotifications } from '../utils/pushNotificationManager';

/**
 * Hook for integrating notification system with app events
 * Listens to curriculum events and emits notifications
 */

export function useNotificationSystem(userId: string) {
  const { emitEvent } = useNotification();
  const { sessionTasks, completionTasks } = useCurriculum();
  const [notificationListenersActive, setNotificationListenersActive] = useState(false);

  // Initialize push notifications
  useEffect(() => {
    const initPush = async () => {
      try {
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (vapidKey) {
          await initializePushNotifications({
            vapidPublicKey: vapidKey,
          });
        }
      } catch (error) {
        console.warn('Failed to initialize push notifications:', error);
      }
    };

    initPush();
  }, []);

  // Listen for session task completion
  useEffect(() => {
    const handleSessionTaskCompletion = () => {
      // Trigger LTO completion check
      completionTasks.forEach(task => {
        const domainId = task.domainId;
        const ltoId = task.ltoId;

        // Get LTO name from curriculum
        const metadata: NotificationMetadata = {
          childId: task.childId,
          ltoId: ltoId,
          ltoName: `LTO ${ltoId}`, // Should fetch from curriculum
          domainId: domainId,
          domainName: `Domain ${domainId}`, // Should fetch from curriculum
          score: task.score,
          completedAt: task.completedAt,
        };

        emitEvent('lto_completed', metadata);
      });
    };

    if (completionTasks.length > 0) {
      // Only emit if there are recent completions
      handleSessionTaskCompletion();
    }
  }, [completionTasks, emitEvent]);

  // Emit score improved event
  const emitScoreImprovement = useCallback(
    (
      childId: number,
      ltoId: string,
      previousScore: number,
      currentScore: number
    ) => {
      const improvement = currentScore - previousScore;
      const improvementPercent = (improvement / previousScore) * 100;

      const metadata: NotificationMetadata = {
        childId,
        ltoId,
        previousScore,
        score: currentScore,
        improvementPercent,
      };

      emitEvent('score_improved', metadata);
    },
    [emitEvent]
  );

  // Emit message received event
  const emitMessageReceived = useCallback(
    (
      childId: number,
      messageId: string,
      conversationId: string,
      senderName: string,
      senderRole: string,
      messagePreview: string
    ) => {
      const metadata: NotificationMetadata = {
        childId,
        messageId,
        conversationId,
        senderName,
        senderRole: senderRole as 'therapist' | 'parent' | 'admin',
        messagePreview,
      };

      emitEvent('message_received', metadata);
    },
    [emitEvent]
  );

  // Emit feedback received event
  const emitFeedbackReceived = useCallback(
    (
      childId: number,
      conversationId: string,
      senderName: string,
      senderRole: string
    ) => {
      const metadata: NotificationMetadata = {
        childId,
        conversationId,
        senderName,
        senderRole: senderRole as 'therapist' | 'parent' | 'admin',
      };

      emitEvent('feedback_received', metadata);
    },
    [emitEvent]
  );

  // Emit milestone achievement event
  const emitMilestoneAchieved = useCallback(
    (
      childId: number,
      milestoneId: string,
      milestoneType: string,
      celebrationMessage: string
    ) => {
      const metadata: NotificationMetadata = {
        childId,
        milestoneId,
        milestoneType,
        celebrationMessage,
      };

      emitEvent('milestone_achieved', metadata);
    },
    [emitEvent]
  );

  // Emit approval required event
  const emitApprovalRequired = useCallback(
    (childId: number, ltoId: string, ltoName: string) => {
      const metadata: NotificationMetadata = {
        childId,
        ltoId,
        ltoName,
      };

      emitEvent('approval_required', metadata);
    },
    [emitEvent]
  );

  // Emit session scheduled event
  const emitSessionScheduled = useCallback(
    (childId: number) => {
      const metadata: NotificationMetadata = {
        childId,
      };

      emitEvent('session_scheduled', metadata);
    },
    [emitEvent]
  );

  // Emit reminder event
  const emitReminder = useCallback(
    (childId: number, message: string) => {
      const metadata: NotificationMetadata = {
        childId,
        messagePreview: message,
      };

      emitEvent('reminder', metadata);
    },
    [emitEvent]
  );

  return {
    emitScoreImprovement,
    emitMessageReceived,
    emitFeedbackReceived,
    emitMilestoneAchieved,
    emitApprovalRequired,
    emitSessionScheduled,
    emitReminder,
  };
}
