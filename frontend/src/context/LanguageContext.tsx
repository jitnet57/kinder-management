/**
 * LanguageContext - 다국어 지원 (i18n)
 * Phase 5 Stream P2.5
 *
 * - 한국어, 영어, 중국어, 일본어 지원
 * - 모든 UI 텍스트 다국어화
 * - 날짜/숫자 지역화
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { SupportedLanguage, i18nContextType, UserLanguagePreference } from '../types';

const LanguageResources = {
  ko: {
    common: {
      dashboard: '대시보드',
      schedule: '스케줄',
      children: '아동정보',
      messages: '메시징',
      notifications: '알림',
      settings: '설정',
      logout: '로그아웃',
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      edit: '수정',
      back: '뒤로가기',
    },
    pages: {
      liveSession: '실시간 AI 코칭',
      videoAnalyzer: '비디오 분석',
      smartNotification: '스마트 알림',
      statistics: '통계 분석',
      language: '언어 설정',
    },
  },
  en: {
    common: {
      dashboard: 'Dashboard',
      schedule: 'Schedule',
      children: 'Children',
      messages: 'Messages',
      notifications: 'Notifications',
      settings: 'Settings',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
    },
    pages: {
      liveSession: 'Real-time AI Coaching',
      videoAnalyzer: 'Video Analysis',
      smartNotification: 'Smart Notifications',
      statistics: 'Statistical Analysis',
      language: 'Language Settings',
    },
  },
  zh: {
    common: {
      dashboard: '仪表板',
      schedule: '时间表',
      children: '儿童信息',
      messages: '消息',
      notifications: '通知',
      settings: '设置',
      logout: '退出登录',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      back: '返回',
    },
    pages: {
      liveSession: '实时人工智能辅导',
      videoAnalyzer: '视频分析',
      smartNotification: '智能通知',
      statistics: '统计分析',
      language: '语言设置',
    },
  },
  ja: {
    common: {
      dashboard: 'ダッシュボード',
      schedule: 'スケジュール',
      children: 'お子さん情報',
      messages: 'メッセージ',
      notifications: '通知',
      settings: '設定',
      logout: 'ログアウト',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      back: '戻る',
    },
    pages: {
      liveSession: 'リアルタイムAIコーチング',
      videoAnalyzer: 'ビデオ分析',
      smartNotification: 'スマート通知',
      statistics: '統計分析',
      language: '言語設定',
    },
  },
};

const DateFormats = {
  ko: 'YYYY년 MM월 DD일',
  en: 'MM/DD/YYYY',
  zh: 'YYYY年MM月DD日',
  ja: 'YYYY年MM月DD日',
};

const NumberFormats = {
  ko: { decimal: '.', thousands: ',' },
  en: { decimal: '.', thousands: ',' },
  zh: { decimal: '.', thousands: ',' },
  ja: { decimal: '.', thousands: ',' },
};

interface ILanguageContext extends i18nContextType {
  userPreferences: UserLanguagePreference[];
  setUserPreference: (userId: string, preference: Partial<UserLanguagePreference>) => void;
}

const LanguageCtx = createContext<ILanguageContext | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>('ko');
  const [userPreferences, setUserPreferences] = useState<UserLanguagePreference[]>([]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setCurrentLanguageState(lang);
    localStorage.setItem('preferred_language', lang);
  }, []);

  const t = useCallback((key: string, defaultValue: string = key): string => {
    const keys = key.split('.');
    let value: any = LanguageResources[currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return typeof value === 'string' ? value : defaultValue;
  }, [currentLanguage]);

  const formatDate = useCallback((date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (currentLanguage === 'ko') {
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    } else if (currentLanguage === 'en') {
      return d.toLocaleDateString('en-US');
    } else if (currentLanguage === 'zh') {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    } else if (currentLanguage === 'ja') {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
    return d.toString();
  }, [currentLanguage]);

  const formatNumber = useCallback((number: number): string => {
    const format = NumberFormats[currentLanguage];
    return number.toLocaleString(currentLanguage, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }, [currentLanguage]);

  const formatCurrency = useCallback((amount: number): string => {
    const symbols = {
      ko: '₩',
      en: '$',
      zh: '¥',
      ja: '¥',
    };
    return `${symbols[currentLanguage]}${formatNumber(amount)}`;
  }, [currentLanguage, formatNumber]);

  const setUserPreference = useCallback((userId: string, preference: Partial<UserLanguagePreference>) => {
    setUserPreferences(prev => {
      const existing = prev.find(p => p.userId === userId);
      if (existing) {
        return prev.map(p =>
          p.userId === userId
            ? { ...p, ...preference, updatedAt: new Date().toISOString() }
            : p
        );
      } else {
        return [
          ...prev,
          {
            id: `pref_${Date.now()}`,
            userId,
            language: currentLanguage,
            dateFormat: 'gregorian',
            timeFormat: '24h',
            numberFormat: 'standard',
            updatedAt: new Date().toISOString(),
            ...preference,
          },
        ];
      }
    });
  }, [currentLanguage]);

  const value: ILanguageContext = {
    currentLanguage,
    setLanguage,
    t,
    formatDate,
    formatNumber,
    formatCurrency,
    availableLanguages: ['ko', 'en', 'zh', 'ja'],
    userPreferences,
    setUserPreference,
  };

  return (
    <LanguageCtx.Provider value={value}>
      {children}
    </LanguageCtx.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageCtx);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
