/**
 * SmartNotificationSettings.tsx - 스마트 알림 시스템
 * Phase 5 Stream P2.3
 */

import { useState, useEffect } from 'react';
import { Bell, Clock, Settings as SettingsIcon } from 'lucide-react';
import { useSmartNotification } from '../context/SmartNotificationContext';

export function SmartNotificationSettings() {
  const { schedules, createSchedule, analyzeUserActivity, updatePreferences } = useSmartNotification();
  const [userId] = useState('user_1');
  const [showOptimalTimes, setShowOptimalTimes] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (schedules.length === 0) {
      createSchedule(userId);
    }
  }, []);

  const currentSchedule = schedules.find((s) => s.userId === userId);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await analyzeUserActivity(userId);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-pastel-purple">🔔 스마트 알림 시스템</h1>
        <p className="text-gray-600 mt-2">ML 기반으로 최적의 알림 시간을 자동으로 설정합니다</p>
      </div>

      {currentSchedule && (
        <>
          {/* 최적 알림 시간 */}
          <div className="glass rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock size={24} />
                최적 알림 시간
              </h2>
              <button
                onClick={() => setShowOptimalTimes(!showOptimalTimes)}
                className="text-pastel-purple hover:bg-gray-100 px-3 py-2 rounded transition"
              >
                {showOptimalTimes ? '닫기' : '보기'}
              </button>
            </div>

            {showOptimalTimes && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentSchedule.optimalTimes.map((time, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                    <p className="font-bold text-lg">{time.time}</p>
                    <p className="text-gray-600 text-sm">{time.day}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${time.score * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold">{(time.score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 조용한 시간 설정 */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">조용한 시간</h2>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">이 시간 동안은 알림이 표시되지 않습니다</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">시작 시간</label>
                  <input
                    type="time"
                    value={currentSchedule.quietHours.start}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">종료 시간</label>
                  <input
                    type="time"
                    value={currentSchedule.quietHours.end}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 알림 카테고리 설정 */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <SettingsIcon size={24} />
              알림 카테고리 설정
            </h2>
            <div className="space-y-3">
              {currentSchedule.preferences.categories.map((cat, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium capitalize">{cat.category.replace(/_/g, ' ')}</p>
                  </div>
                  <select
                    value={cat.frequency}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="always">항상</option>
                    <option value="daily">일일</option>
                    <option value="weekly">주간</option>
                    <option value="never">안함</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* 알림 채널 선호도 */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">알림 채널 선호도</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  defaultChecked={currentSchedule.preferences.preferredChannels.includes('inApp')}
                  className="w-4 h-4"
                />
                <span className="font-medium">앱 내 알림</span>
              </label>
              <label className="flex items-center gap-3 p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  defaultChecked={currentSchedule.preferences.preferredChannels.includes('push')}
                  className="w-4 h-4"
                />
                <span className="font-medium">푸시 알림</span>
              </label>
              <label className="flex items-center gap-3 p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  defaultChecked={currentSchedule.preferences.preferredChannels.includes('email')}
                  className="w-4 h-4"
                />
                <span className="font-medium">이메일 알림</span>
              </label>
            </div>
          </div>

          {/* 일일 최대 알림 수 */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">일일 최대 알림 수</h2>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={currentSchedule.preferences.maxNotificationsPerDay}
                  className="flex-1"
                />
                <span className="text-2xl font-bold w-12">
                  {currentSchedule.preferences.maxNotificationsPerDay}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                하루에 최대 {currentSchedule.preferences.maxNotificationsPerDay}개의 알림을 받습니다
              </p>
            </div>
          </div>

          {/* ML 분석 */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-pastel-purple text-white py-3 rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition font-bold flex items-center justify-center gap-2"
          >
            <Bell size={20} />
            {isAnalyzing ? '분석 중...' : 'ML 기반 최적화 분석'}
          </button>
        </>
      )}
    </div>
  );
}

export default SmartNotificationSettings;
