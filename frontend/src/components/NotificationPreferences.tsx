import React, { useState, useEffect } from 'react';
import { NotificationEventType } from '../types';
import { useNotification } from '../context/NotificationContext';

interface NotificationPreferencesProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const EVENT_LABELS: Record<NotificationEventType, string> = {
  lto_completed: 'LTO 완성',
  score_improved: '점수 향상',
  message_received: '메시지 수신',
  feedback_received: '피드백 도착',
  milestone_achieved: '마일스톤 달성',
  approval_required: '승인 필요',
  session_scheduled: '세션 예약',
  reminder: '리마인더',
};

export function NotificationPreferences({
  userId,
  isOpen,
  onClose,
}: NotificationPreferencesProps) {
  const { getPushSubscriptions, updatePushPreferences } = useNotification();
  const [subscriptions, setSubscriptions] = useState(getPushSubscriptions(userId));
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(
    subscriptions[0]?.id || null
  );

  useEffect(() => {
    setSubscriptions(getPushSubscriptions(userId));
    if (subscriptions.length > 0) {
      setSelectedSubscriptionId(subscriptions[0].id);
    }
  }, [userId]);

  const selectedSubscription = subscriptions.find(s => s.id === selectedSubscriptionId);

  const handleToggleMutedCategory = (category: NotificationEventType) => {
    if (!selectedSubscription) return;

    const mutedCategories = selectedSubscription.preferences.mutedCategories || [];
    const newMutedCategories = mutedCategories.includes(category)
      ? mutedCategories.filter(c => c !== category)
      : [...mutedCategories, category];

    updatePushPreferences(selectedSubscription.id, {
      ...selectedSubscription.preferences,
      mutedCategories: newMutedCategories,
    });

    setSubscriptions(prev =>
      prev.map(s =>
        s.id === selectedSubscription.id
          ? {
              ...s,
              preferences: {
                ...s.preferences,
                mutedCategories: newMutedCategories,
              },
            }
          : s
      )
    );
  };

  const handleUpdateQuietHours = (start: string, end: string) => {
    if (!selectedSubscription) return;

    updatePushPreferences(selectedSubscription.id, {
      ...selectedSubscription.preferences,
      quietHours: { start, end },
    });

    setSubscriptions(prev =>
      prev.map(s =>
        s.id === selectedSubscription.id
          ? {
              ...s,
              preferences: {
                ...s.preferences,
                quietHours: { start, end },
              },
            }
          : s
      )
    );
  };

  const handleToggleChannel = (channel: 'inApp' | 'push' | 'email') => {
    if (!selectedSubscription) return;

    const newEnabledChannels = {
      ...selectedSubscription.enabledChannels,
      [channel]: !selectedSubscription.enabledChannels[channel],
    };

    // Update subscription with new channels
    // Implementation: Call backend or update state
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">알림 설정</h2>
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

          {/* Content */}
          <div className="p-6">
            {subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">등록된 장치가 없습니다.</p>
                <button
                  onClick={onClose}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  닫기
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Device Selection */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">장치 선택</h3>
                  <div className="space-y-2">
                    {subscriptions.map(sub => (
                      <label
                        key={sub.id}
                        className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="subscription"
                          value={sub.id}
                          checked={selectedSubscriptionId === sub.id}
                          onChange={() => setSelectedSubscriptionId(sub.id)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">
                            {sub.role === 'therapist' ? '치료사' : sub.role === 'parent' ? '부모' : '관리자'}
                          </p>
                          <p className="text-xs text-gray-500">
                            등록된 날짜: {new Date(sub.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedSubscription && (
                  <>
                    {/* Channel Preferences */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">알림 채널</h3>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedSubscription.enabledChannels.inApp}
                            onChange={() => handleToggleChannel('inApp')}
                            className="rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">앱 내 알림</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedSubscription.enabledChannels.push}
                            onChange={() => handleToggleChannel('push')}
                            className="rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">푸시 알림</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedSubscription.enabledChannels.email}
                            onChange={() => handleToggleChannel('email')}
                            className="rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">이메일</span>
                        </label>
                      </div>
                    </div>

                    {/* Quiet Hours */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">조용한 시간</h3>
                      <p className="text-xs text-gray-600 mb-3">
                        이 시간대에는 푸시 알림이 발송되지 않습니다.
                      </p>
                      <div className="flex gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            시작
                          </label>
                          <input
                            type="time"
                            value={selectedSubscription.preferences.quietHours?.start || '22:00'}
                            onChange={(e) =>
                              handleUpdateQuietHours(
                                e.target.value,
                                selectedSubscription.preferences.quietHours?.end || '08:00'
                              )
                            }
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            종료
                          </label>
                          <input
                            type="time"
                            value={selectedSubscription.preferences.quietHours?.end || '08:00'}
                            onChange={(e) =>
                              handleUpdateQuietHours(
                                selectedSubscription.preferences.quietHours?.start || '22:00',
                                e.target.value
                              )
                            }
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Muted Categories */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">음소거할 알림 타입</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(EVENT_LABELS).map(([eventType, label]) => (
                          <label
                            key={eventType}
                            className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={
                                selectedSubscription.preferences.mutedCategories?.includes(
                                  eventType as NotificationEventType
                                ) || false
                              }
                              onChange={() =>
                                handleToggleMutedCategory(eventType as NotificationEventType)
                              }
                              className="rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
