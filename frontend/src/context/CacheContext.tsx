/**
 * CacheContext - 앱 전역 캐시 관리
 *
 * 기능:
 * 1. localStorage/IndexedDB 자동 저장/복원
 * 2. 온라인/오프라인 상태 감지
 * 3. 캐시 동기화 상태 추적
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { storageManager, syncQueue } from '../utils/storage';

interface CacheContextType {
  // 상태
  isOnline: boolean;
  isSyncing: boolean;
  cacheReady: boolean;

  // 캐시 관리
  getFromCache: <T = any>(key: string) => Promise<T | null>;
  setInCache: (key: string, value: any) => Promise<void>;
  removeFromCache: (key: string) => Promise<void>;
  clearCache: () => Promise<void>;

  // 동기화
  syncWithServer: () => Promise<boolean>;
  getStorageInfo: () => Promise<{ used: number; available: number }>;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

interface CacheProviderProps {
  children: React.ReactNode;
  apiUrl?: string;
}

export function CacheProvider({ children, apiUrl = 'http://localhost:3000' }: CacheProviderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cacheReady, setCacheReady] = useState(false);

  // 저장소 초기화
  useEffect(() => {
    (async () => {
      await storageManager.initialize();
      setCacheReady(true);
      console.log('✅ 캐시 준비 완료');
    })();
  }, []);

  // 온라인 상태 감지
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 온라인 상태');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📵 오프라인 상태');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 서버 동기화
  const syncWithServer = useCallback(async (): Promise<boolean> => {
    if (!isOnline) {
      console.warn('⚠️ 오프라인 상태에서는 동기화할 수 없습니다');
      return false;
    }

    setIsSyncing(true);
    try {
      const authToken = localStorage.getItem('authToken') || '';
      const success = await syncQueue.syncToServer(apiUrl, authToken);

      if (success) {
        console.log('✅ 서버 동기화 완료');
      } else {
        console.log('⚠️ 서버 동기화 실패');
      }

      return success;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, apiUrl]);

  // 캐시에서 데이터 조회
  const getFromCache = useCallback(
    async <T = any,>(key: string): Promise<T | null> => {
      if (!cacheReady) return null;
      return storageManager.get<T>(key);
    },
    [cacheReady]
  );

  // 캐시에 데이터 저장
  const setInCache = useCallback(
    async (key: string, value: any): Promise<void> => {
      if (!cacheReady) return;
      await storageManager.set(key, value);
    },
    [cacheReady]
  );

  // 캐시에서 데이터 삭제
  const removeFromCache = useCallback(
    async (key: string): Promise<void> => {
      if (!cacheReady) return;
      await storageManager.remove(key);
    },
    [cacheReady]
  );

  // 전체 캐시 삭제
  const clearCache = useCallback(async (): Promise<void> => {
    if (!cacheReady) return;
    await storageManager.clear();
    console.log('✅ 캐시 삭제 완료');
  }, [cacheReady]);

  // 저장소 정보 조회
  const getStorageInfo = useCallback(async () => {
    return storageManager.getStorageSize();
  }, []);

  const value: CacheContextType = {
    isOnline,
    isSyncing,
    cacheReady,
    getFromCache,
    setInCache,
    removeFromCache,
    clearCache,
    syncWithServer,
    getStorageInfo,
  };

  return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>;
}

export function useCache(): CacheContextType {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within CacheProvider');
  }
  return context;
}
