import React, { useState, useEffect } from 'react';
import {
  NotificationEventType,
  NotificationSeverity,
  NotificationPriority,
  CANONICAL_CHILDREN,
} from '../types';
import { useNotification } from '../context/NotificationContext';
import { NotificationItem } from './NotificationItem';

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ userId, isOpen, onClose }: NotificationCenterProps) {
  const { getNotifications, markAllAsRead, onNotificationReceived } = useNotification();
  const [filteredNotifications, setFilteredNotifications] = useState(
    getNotifications(userId)
  );

  // Filter states
  const [typeFilter, setTypeFilter] = useState<NotificationEventType[]>([]);
  const [severityFilter, setSeverityFilter] = useState<NotificationSeverity[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority[]>([]);
  const [childFilter, setChildFilter] = useState<number | undefined>();
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'priority'>('recent');

  // Listen for new notifications
  useEffect(() => {
    return onNotificationReceived(() => {
      updateFilteredNotifications();
    });
  }, [onNotificationReceived]);

  // Update filtered notifications when filters change
  useEffect(() => {
    updateFilteredNotifications();
  }, [typeFilter, severityFilter, priorityFilter, childFilter, readFilter, userId]);

  const updateFilteredNotifications = () => {
    let notifications = getNotifications(userId, {
      type: typeFilter.length > 0 ? typeFilter : undefined,
      severity: severityFilter.length > 0 ? severityFilter : undefined,
      priority: priorityFilter.length > 0 ? priorityFilter : undefined,
      childId: childFilter,
      readStatus: readFilter,
    });

    if (sortBy === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, normal: 2 };
      notifications = notifications.sort(
        (a, b) =>
          priorityOrder[a.notificationEvent.priority] -
          priorityOrder[b.notificationEvent.priority]
      );
    }

    setFilteredNotifications(notifications);
  };

  const handleMarkAllRead = () => {
    markAllAsRead(userId);
  };

  const handleClearAllNotifications = () => {
    if (window.confirm('모든 알림을 삭제하시겠습니까?')) {
      // Implementation: clear all
    }
  };

  const toggleTypeFilter = (type: NotificationEventType) => {
    setTypeFilter(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleSeverityFilter = (severity: NotificationSeverity) => {
    setSeverityFilter(prev =>
      prev.includes(severity) ? prev.filter(s => s !== severity) : [...prev, severity]
    );
  };

  const togglePriorityFilter = (priority: NotificationPriority) => {
    setPriorityFilter(prev =>
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  const typeOptions: NotificationEventType[] = [
    'lto_completed',
    'score_improved',
    'message_received',
    'feedback_received',
    'milestone_achieved',
    'approval_required',
    'session_scheduled',
    'reminder',
  ];

  const severityOptions: NotificationSeverity[] = ['info', 'success', 'warning', 'urgent'];
  const priorityOptions: NotificationPriority[] = ['normal', 'high', 'urgent'];

  const typeLabels: Record<NotificationEventType, string> = {
    lto_completed: 'LTO 완성',
    score_improved: '점수 향상',
    message_received: '메시지',
    feedback_received: '피드백',
    milestone_achieved: '마일스톤',
    approval_required: '승인 필요',
    session_scheduled: '세션 예약',
    reminder: '리마인더',
  };

  const severityLabels: Record<NotificationSeverity, string> = {
    info: '정보',
    success: '성공',
    warning: '경고',
    urgent: '긴급',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">알림 센터</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-4 py-3 border-b border-gray-200 flex gap-2 bg-gray-50">
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
          >
            모두 읽음
          </button>
          <button
            onClick={handleClearAllNotifications}
            className="text-xs font-semibold text-gray-600 hover:text-gray-800 underline"
          >
            모두 삭제
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 overflow-y-auto max-h-48">
          <div className="space-y-3">
            {/* Type Filter */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">타입</p>
              <div className="flex flex-wrap gap-1">
                {typeOptions.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      typeFilter.includes(type)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {typeLabels[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">심각도</p>
              <div className="flex flex-wrap gap-1">
                {severityOptions.map(severity => (
                  <button
                    key={severity}
                    onClick={() => toggleSeverityFilter(severity)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      severityFilter.includes(severity)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {severityLabels[severity]}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">우선순위</p>
              <div className="flex flex-wrap gap-1">
                {priorityOptions.map(priority => (
                  <button
                    key={priority}
                    onClick={() => togglePriorityFilter(priority)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      priorityFilter.includes(priority)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {priority === 'normal' ? '보통' : priority === 'high' ? '높음' : '긴급'}
                  </button>
                ))}
              </div>
            </div>

            {/* Child Filter */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">아동</p>
              <select
                value={childFilter || ''}
                onChange={(e) => setChildFilter(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="">전체</option>
                {CANONICAL_CHILDREN.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Read Status Filter */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">상태</p>
              <div className="flex gap-1">
                {(['all', 'read', 'unread'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setReadFilter(status)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      readFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {status === 'all' ? '전체' : status === 'read' ? '읽음' : '미읽음'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">정렬</p>
              <div className="flex gap-1">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    sortBy === 'recent'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  최신순
                </button>
                <button
                  onClick={() => setSortBy('priority')}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    sortBy === 'priority'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  우선순위
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg
                className="w-12 h-12 text-gray-300 mb-3"
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
              <p className="text-gray-500 text-sm">알림이 없습니다</p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  userId={userId}
                  onClick={(n) => {
                    if (n.notificationEvent.actionUrl) {
                      window.location.href = n.notificationEvent.actionUrl;
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
