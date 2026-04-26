import React, { useEffect, useState } from 'react';
import { NotificationHistory } from '../types';

interface ToastNotificationProps {
  notification: NotificationHistory | null;
  duration?: number;
  onDismiss?: () => void;
}

const SEVERITY_COLORS = {
  info: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  urgent: 'bg-red-600',
};

export function ToastNotification({
  notification,
  duration = 5000,
  onDismiss,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(!!notification);

  useEffect(() => {
    if (!notification) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [notification, duration, onDismiss]);

  if (!notification || !isVisible) return null;

  const event = notification.notificationEvent;

  return (
    <div
      className={`fixed bottom-4 right-4 ${SEVERITY_COLORS[event.severity]} text-white rounded-lg shadow-lg p-4 max-w-sm animate-slide-up z-40 transition-all`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{event.icon}</span>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{event.title}</h3>
          <p className="text-xs text-gray-100 mt-1">{event.description}</p>

          {event.actionUrl && event.actionLabel && (
            <a
              href={event.actionUrl}
              className="inline-block text-xs font-semibold mt-2 underline hover:text-gray-200 transition-colors"
            >
              → {event.actionLabel}
            </a>
          )}
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 text-white hover:text-gray-200 transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 rounded-b-lg animate-shrink" style={{
        animation: `shrink ${duration}ms linear forwards`,
      }} />

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-shrink {
          animation: shrink ${duration}ms linear forwards;
        }
      `}</style>
    </div>
  );
}
