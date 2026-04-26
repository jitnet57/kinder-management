import React, { useState } from 'react';
import { NotificationHistory } from '../types';
import { useNotification } from '../context/NotificationContext';

interface NotificationItemProps {
  notification: NotificationHistory;
  userId: string;
  onClick?: (notification: NotificationHistory) => void;
}

const SEVERITY_COLORS = {
  info: 'bg-blue-50 border-l-4 border-blue-400',
  success: 'bg-green-50 border-l-4 border-green-400',
  warning: 'bg-yellow-50 border-l-4 border-yellow-400',
  urgent: 'bg-red-50 border-l-4 border-red-400',
};

const PRIORITY_BADGES = {
  normal: 'bg-gray-200 text-gray-800',
  high: 'bg-orange-200 text-orange-800',
  urgent: 'bg-red-200 text-red-800',
};

export function NotificationItem({ notification, userId, onClick }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotification();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (notification.interactionStatus === 'unread') {
      markAsRead(notification.id, userId);
    }
    onClick?.(notification);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  const isRead = notification.interactionStatus === 'viewed' || notification.interactionStatus === 'clicked';
  const event = notification.notificationEvent;
  const createdTime = new Date(notification.createdAt);
  const timeAgo = getTimeAgo(createdTime);

  return (
    <div
      className={`${SEVERITY_COLORS[event.severity]} p-4 mb-3 rounded-lg cursor-pointer transition-all ${
        !isRead ? 'shadow-md' : 'shadow-sm'
      } ${isHovered ? 'shadow-lg' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl mt-1">{event.icon}</span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-sm ${!isRead ? 'font-bold' : ''}`}>
                {event.title}
              </h3>
              {!isRead && (
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </div>

            <p className="text-sm text-gray-700 mb-2">{event.description}</p>

            <div className="flex items-center gap-2 mt-2">
              {event.priority !== 'normal' && (
                <span className={`text-xs font-semibold px-2 py-1 rounded ${PRIORITY_BADGES[event.priority]}`}>
                  {event.priority === 'high' ? 'High' : 'Urgent'}
                </span>
              )}
              <span className="text-xs text-gray-500">{timeAgo}</span>
            </div>
          </div>
        </div>

        {isHovered && (
          <button
            onClick={handleDelete}
            className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Delete notification"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {event.actionUrl && event.actionLabel && (
        <div className="mt-3">
          <a
            href={event.actionUrl}
            className="inline-block text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
            onClick={(e) => e.stopPropagation()}
          >
            → {event.actionLabel}
          </a>
        </div>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return '방금 전';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;

  return date.toLocaleDateString('ko-KR');
}
