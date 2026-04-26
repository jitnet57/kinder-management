import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

interface NotificationBellProps {
  userId: string;
  onOpenNotifications?: () => void;
}

export function NotificationBell({ userId, onOpenNotifications }: NotificationBellProps) {
  const { getUnreadCount, notifications } = useNotification();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = getUnreadCount(userId);
    setUnreadCount(count);
  }, [userId, notifications, getUnreadCount]);

  return (
    <div className="relative inline-block">
      <button
        onClick={onOpenNotifications}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
