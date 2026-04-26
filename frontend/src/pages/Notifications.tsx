import React, { useState, useEffect } from 'react';
import {
  NotificationEventType,
  NotificationSeverity,
  NotificationPriority,
  CANONICAL_CHILDREN,
} from '../types';
import { useNotification } from '../context/NotificationContext';
import { NotificationItem } from '../components/NotificationItem';
import { NotificationPreferences } from '../components/NotificationPreferences';

export function Notifications() {
  const userId = 'user-' + Math.random().toString(36).substr(2, 9); // Mock user ID
  const { getNotifications, markAllAsRead, deleteNotification, getUnreadCount } =
    useNotification();

  // State
  const [notifications, setNotifications] = useState(getNotifications(userId));
  const [unreadCount, setUnreadCount] = useState(getUnreadCount(userId));
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<NotificationEventType[]>([]);
  const [severityFilter, setSeverityFilter] = useState<NotificationSeverity[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority[]>([]);
  const [childFilter, setChildFilter] = useState<number | undefined>();
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'priority'>('recent');

  // Update notifications and unread count
  useEffect(() => {
    const updated = getNotifications(userId, {
      type: typeFilter.length > 0 ? typeFilter : undefined,
      severity: severityFilter.length > 0 ? severityFilter : undefined,
      priority: priorityFilter.length > 0 ? priorityFilter : undefined,
      childId: childFilter,
      readStatus: readFilter,
    });

    if (sortBy === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, normal: 2 };
      updated.sort(
        (a, b) =>
          priorityOrder[a.notificationEvent.priority] -
          priorityOrder[b.notificationEvent.priority]
      );
    }

    setNotifications(updated);
    setUnreadCount(getUnreadCount(userId));
  }, [userId, typeFilter, severityFilter, priorityFilter, childFilter, readFilter, sortBy]);

  const handleMarkAllRead = () => {
    markAllAsRead(userId);
  };

  const handleClearAll = () => {
    if (window.confirm('모든 알림을 삭제하시겠습니까?')) {
      notifications.forEach(n => deleteNotification(n.id));
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">알림</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setPreferencesOpen(true)}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                설정
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            미읽음: <span className="font-bold">{unreadCount}</span> / 전체:{' '}
            <span className="font-bold">{notifications.length}</span>
          </p>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            모두 읽음 표시
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            모두 삭제
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">필터</h2>

          <div className="space-y-4">
            {/* Type Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">타입</p>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      typeFilter.includes(type)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {typeLabels[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">심각도</p>
              <div className="flex flex-wrap gap-2">
                {severityOptions.map(severity => (
                  <button
                    key={severity}
                    onClick={() => toggleSeverityFilter(severity)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      severityFilter.includes(severity)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {severityLabels[severity]}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">우선순위</p>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map(priority => (
                  <button
                    key={priority}
                    onClick={() => togglePriorityFilter(priority)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      priorityFilter.includes(priority)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {priority === 'normal' ? '보통' : priority === 'high' ? '높음' : '긴급'}
                  </button>
                ))}
              </div>
            </div>

            {/* Child Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">아동</p>
              <select
                value={childFilter || ''}
                onChange={(e) => setChildFilter(e.target.value ? Number(e.target.value) : undefined)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                {CANONICAL_CHILDREN.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Read Status & Sort */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">읽음 상태</p>
                <div className="flex gap-1">
                  {(['all', 'read', 'unread'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setReadFilter(status)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        readFilter === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {status === 'all' ? '전체' : status === 'read' ? '읽음' : '미읽음'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">정렬</p>
                <div className="flex gap-1">
                  {(['recent', 'priority'] as const).map(sort => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        sortBy === sort
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {sort === 'recent' ? '최신순' : '우선순위'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
              <p className="text-gray-500 text-lg font-semibold">알림이 없습니다</p>
            </div>
          ) : (
            notifications.map(notification => (
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
            ))
          )}
        </div>
      </div>

      {/* Preferences Modal */}
      <NotificationPreferences
        userId={userId}
        isOpen={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
      />
    </div>
  );
}
