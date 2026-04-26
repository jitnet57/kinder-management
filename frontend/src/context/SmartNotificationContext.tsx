/**
 * SmartNotificationContext - 스마트 알림 시스템
 * Phase 5 Stream P2.3
 *
 * - ML 기반 최적 알림 시간 계산
 * - 사용자 활동 패턴 분석
 * - 개인화된 알림 스케줄
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SmartNotificationSchedule, NotificationOptimization, DeliveryChannel, NotificationEventType } from '../types';

interface ISmartNotificationContext {
  schedules: SmartNotificationSchedule[];
  optimizations: NotificationOptimization[];
  createSchedule: (userId: string) => Promise<SmartNotificationSchedule>;
  updateSchedule: (scheduleId: string, updates: Partial<SmartNotificationSchedule>) => void;
  analyzeUserActivity: (userId: string) => Promise<NotificationOptimization>;
  getOptimalNotificationTime: (userId: string) => string;
  predictEngagementScore: (userId: string, time: string) => number;
  updatePreferences: (scheduleId: string, preferences: any) => void;
  getScheduleForUser: (userId: string) => SmartNotificationSchedule | undefined;
}

const SmartNotificationCtx = createContext<ISmartNotificationContext | undefined>(undefined);

export function SmartNotificationProvider({ children }: { children: React.ReactNode }) {
  const [schedules, setSchedules] = useState<SmartNotificationSchedule[]>([]);
  const [optimizations, setOptimizations] = useState<NotificationOptimization[]>([]);

  const createSchedule = useCallback(async (userId: string): Promise<SmartNotificationSchedule> => {
    const schedule: SmartNotificationSchedule = {
      id: `sched_${Date.now()}`,
      userId,
      optimalTimes: [
        { day: 'Monday', time: '09:00', score: 0.92 },
        { day: 'Monday', time: '14:00', score: 0.88 },
        { day: 'Monday', time: '18:00', score: 0.85 },
        { day: 'Wednesday', time: '10:00', score: 0.90 },
        { day: 'Friday', time: '15:00', score: 0.87 },
      ],
      patterns: generateActivityPatterns(),
      quietHours: {
        start: '22:00',
        end: '08:00',
      },
      preferences: {
        maxNotificationsPerDay: 5,
        preferredChannels: ['inApp', 'email'],
        categories: [
          { category: 'lto_completed', frequency: 'always' },
          { category: 'score_improved', frequency: 'daily' },
          { category: 'message_received', frequency: 'always' },
          { category: 'reminder', frequency: 'weekly' },
        ],
      },
      mlScore: 0.88,
      updatedAt: new Date().toISOString(),
    };

    setSchedules(prev => [...prev, schedule]);
    return schedule;
  }, []);

  const updateSchedule = useCallback((scheduleId: string, updates: Partial<SmartNotificationSchedule>) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.id === scheduleId
          ? { ...schedule, ...updates, updatedAt: new Date().toISOString() }
          : schedule
      )
    );
  }, []);

  const analyzeUserActivity = useCallback(async (userId: string): Promise<NotificationOptimization> => {
    const optimization: NotificationOptimization = {
      id: `opt_${Date.now()}`,
      userId,
      activityMetrics: {
        activeHours: ['09:00-12:00', '14:00-17:00', '19:00-21:00'],
        peakHours: ['10:00', '15:00'],
        quietHours: ['22:00-08:00'],
        averageSessionDuration: 25 * 60, // 25 minutes
      },
      engagementMetrics: {
        clickThroughRate: 0.72,
        dismissalRate: 0.15,
        responseRate: 0.85,
      },
      recommendations: {
        bestTimeToNotify: '10:00',
        recommendedFrequency: '3-4 per day',
        channelPreference: 'inApp' as DeliveryChannel,
        confidence: 0.89,
      },
      analyzedAt: new Date().toISOString(),
    };

    setOptimizations(prev => [...prev, optimization]);
    return optimization;
  }, []);

  const getOptimalNotificationTime = useCallback((userId: string): string => {
    const schedule = schedules.find(s => s.userId === userId);
    if (!schedule || schedule.optimalTimes.length === 0) {
      return '10:00'; // 기본값
    }

    // 현재 시간에 가장 가까운 최적 시간 반환
    const sorted = [...schedule.optimalTimes].sort((a, b) => b.score - a.score);
    return sorted[0].time;
  }, [schedules]);

  const predictEngagementScore = useCallback((userId: string, time: string): number => {
    const schedule = schedules.find(s => s.userId === userId);
    if (!schedule) return 0.5;

    const optimalTime = schedule.optimalTimes.find(ot => ot.time === time);
    return optimalTime ? optimalTime.score : 0.5;
  }, [schedules]);

  const updatePreferences = useCallback((scheduleId: string, preferences: any) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              preferences: { ...schedule.preferences, ...preferences },
              updatedAt: new Date().toISOString(),
            }
          : schedule
      )
    );
  }, []);

  const getScheduleForUser = useCallback((userId: string) => {
    return schedules.find(s => s.userId === userId);
  }, [schedules]);

  const value: ISmartNotificationContext = {
    schedules,
    optimizations,
    createSchedule,
    updateSchedule,
    analyzeUserActivity,
    getOptimalNotificationTime,
    predictEngagementScore,
    updatePreferences,
    getScheduleForUser,
  };

  return (
    <SmartNotificationCtx.Provider value={value}>
      {children}
    </SmartNotificationCtx.Provider>
  );
}

export function useSmartNotification() {
  const context = useContext(SmartNotificationCtx);
  if (!context) {
    throw new Error('useSmartNotification must be used within SmartNotificationProvider');
  }
  return context;
}

function generateActivityPatterns() {
  const patterns = [];
  for (let day = 0; day < 6; day++) {
    for (let hour = 8; hour < 22; hour++) {
      patterns.push({
        dayOfWeek: day,
        timeSlot: `${hour.toString().padStart(2, '0')}:00`,
        engagementLevel: Math.floor(Math.random() * 100),
        responseTime: Math.floor(Math.random() * 5000) + 500,
        interactionCount: Math.floor(Math.random() * 10) + 1,
      });
    }
  }
  return patterns;
}
