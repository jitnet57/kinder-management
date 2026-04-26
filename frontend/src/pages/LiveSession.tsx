/**
 * LiveSession.tsx - 실시간 AI 코칭
 * Phase 5 Stream P2.1
 */

import { useState, useEffect } from 'react';
import { Play, Pause, StopCircle, BarChart3, Zap } from 'lucide-react';
import { useLiveSession } from '../context/LiveSessionContext';
import { LiveSessionContext } from '../types';

export function LiveSession() {
  const { startLiveSession, endLiveSession, updateSessionMetrics, currentSession, isConnected } = useLiveSession();
  const [isSessionActive, setIsSessionActive] = useState(false);

  const startSession = () => {
    const newSession: LiveSessionContext = {
      id: `session_${Date.now()}`,
      childId: 1,
      childName: '민준',
      sessionStartTime: new Date().toISOString(),
      ltoId: 'lto_1',
      ltoName: '요청하기',
      therapistId: 'therapist_1',
      isLive: true,
      currentActivity: '앉기 훈련',
      currentScore: 0,
      trials: 0,
      correctTrials: 0,
      coachingAdvice: [],
      realTimeMetrics: {
        responseLatency: 0,
        accuracyRate: 0,
        independenceLevel: 'assisted',
        engagement: 0,
      },
      aiModel: {
        modelVersion: 'v2.1',
        processingTime: 0,
        confidence: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    startLiveSession(newSession);
    setIsSessionActive(true);
  };

  const stopSession = () => {
    if (currentSession) {
      endLiveSession(currentSession.id);
      setIsSessionActive(false);
    }
  };

  useEffect(() => {
    if (currentSession && isSessionActive) {
      const interval = setInterval(() => {
        updateSessionMetrics(currentSession.id, {
          responseLatency: Math.floor(Math.random() * 5) + 1,
          accuracyRate: Math.floor(Math.random() * 100),
          independenceLevel: ['assisted', 'partial', 'independent'][Math.floor(Math.random() * 3)],
          engagement: Math.floor(Math.random() * 100),
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentSession, isSessionActive, updateSessionMetrics]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-pastel-purple">🎯 실시간 AI 코칭</h1>
          <p className="text-gray-600 mt-2">세션 중 실시간 조언 및 피드백</p>
        </div>
        <div className="flex gap-2">
          {!isSessionActive ? (
            <button
              onClick={startSession}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              <Play size={20} />
              세션 시작
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <StopCircle size={20} />
              세션 종료
            </button>
          )}
        </div>
      </div>

      {isSessionActive && currentSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 세션 정보 */}
          <div className="lg:col-span-2 glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-pastel-purple mb-4">현재 세션</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">아동명</p>
                  <p className="text-lg font-bold">{currentSession.childName}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">목표</p>
                  <p className="text-lg font-bold">{currentSession.ltoName}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">활동</p>
                  <p className="text-lg font-bold">{currentSession.currentActivity}</p>
                </div>
                <div className={`rounded-lg p-4 ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className="text-sm text-gray-600">연결 상태</p>
                  <p className="text-lg font-bold">{isConnected ? '연결됨' : '연결 안됨'}</p>
                </div>
              </div>

              {/* 실시간 메트릭 */}
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3">실시간 메트릭</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">정확도</span>
                      <span className="text-sm font-bold">{currentSession.realTimeMetrics.accuracyRate.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-pastel-purple h-2 rounded-full transition-all"
                        style={{ width: `${currentSession.realTimeMetrics.accuracyRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">참여도</span>
                      <span className="text-sm font-bold">{currentSession.realTimeMetrics.engagement.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${currentSession.realTimeMetrics.engagement}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">응답 시간</p>
                      <p className="text-xl font-bold text-blue-600">{currentSession.realTimeMetrics.responseLatency}초</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">독립성</p>
                      <p className="text-sm font-bold text-indigo-600">{currentSession.realTimeMetrics.independenceLevel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI 코칭 팬 */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-bold text-pastel-purple mb-4 flex items-center gap-2">
              <Zap size={20} className="text-yellow-500" />
              AI 코칭 팁
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentSession.coachingAdvice.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">AI 조언을 기다리는 중...</p>
                </div>
              ) : (
                currentSession.coachingAdvice.map((advice, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border-l-4 border-yellow-500">
                    <p className="text-xs font-bold text-yellow-600 mb-1">{advice.type}</p>
                    <p className="text-sm">{advice.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-gray-600 text-lg">세션을 시작하여 실시간 AI 코칭을 받으세요.</p>
        </div>
      )}
    </div>
  );
}

export default LiveSession;
