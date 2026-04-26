/**
 * LiveSessionContext - 실시간 AI 코칭 시스템
 * Phase 5 Stream P2.1
 *
 * 세션 중 실시간 조언 시스템
 * - 현재 아동 행동 분석
 * - 즉시 피드백 제공
 * - WebSocket 기반 실시간 통신
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { LiveSessionContext as LiveSessionContextType, LiveCoachingAdvice } from '../types';

interface ILiveSessionContext {
  activeSessions: LiveSessionContextType[];
  currentSession: LiveSessionContextType | null;
  startLiveSession: (session: LiveSessionContextType) => void;
  endLiveSession: (sessionId: string) => void;
  updateSessionMetrics: (sessionId: string, metrics: any) => void;
  addCoachingAdvice: (sessionId: string, advice: LiveCoachingAdvice) => void;
  connectWebSocket: (sessionId: string) => void;
  disconnectWebSocket: (sessionId: string) => void;
  isConnected: boolean;
}

const LiveSessionCtx = createContext<ILiveSessionContext | undefined>(undefined);

export function LiveSessionProvider({ children }: { children: React.ReactNode }) {
  const [activeSessions, setActiveSessions] = useState<LiveSessionContextType[]>([]);
  const [currentSession, setCurrentSession] = useState<LiveSessionContextType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const startLiveSession = useCallback((session: LiveSessionContextType) => {
    setActiveSessions(prev => [...prev, session]);
    setCurrentSession(session);
  }, []);

  const endLiveSession = useCallback((sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
  }, [currentSession?.id]);

  const updateSessionMetrics = useCallback((sessionId: string, metrics: any) => {
    setActiveSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, realTimeMetrics: { ...session.realTimeMetrics, ...metrics } }
          : session
      )
    );
  }, []);

  const addCoachingAdvice = useCallback((sessionId: string, advice: LiveCoachingAdvice) => {
    setActiveSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, coachingAdvice: [...session.coachingAdvice, advice] }
          : session
      )
    );
  }, []);

  const connectWebSocket = useCallback((sessionId: string) => {
    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/live-session/${sessionId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected for live session:', sessionId);
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'coaching_advice') {
          addCoachingAdvice(sessionId, data.advice);
        } else if (data.type === 'metrics_update') {
          updateSessionMetrics(sessionId, data.metrics);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [addCoachingAdvice, updateSessionMetrics]);

  const disconnectWebSocket = useCallback((sessionId: string) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const value: ILiveSessionContext = {
    activeSessions,
    currentSession,
    startLiveSession,
    endLiveSession,
    updateSessionMetrics,
    addCoachingAdvice,
    connectWebSocket,
    disconnectWebSocket,
    isConnected,
  };

  return (
    <LiveSessionCtx.Provider value={value}>
      {children}
    </LiveSessionCtx.Provider>
  );
}

export function useLiveSession() {
  const context = useContext(LiveSessionCtx);
  if (!context) {
    throw new Error('useLiveSession must be used within LiveSessionProvider');
  }
  return context;
}
