/**
 * useAutoSave - 자동 저장 커스텀 훅
 *
 * 사용 예시:
 * const [children, setChildren] = useAutoSave('children', [], {
 *   debounce: 500,
 *   syncToServer: true,
 * });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { storageManager, syncQueue } from '../utils/storage';

interface UseAutoSaveOptions {
  debounce?: number;          // 저장 지연 시간 (ms)
  syncToServer?: boolean;      // 서버에 동기화할지 여부
  onSyncError?: (error: Error) => void;
  onSyncSuccess?: () => void;
}

export function useAutoSave<T>(
  key: string,
  initialValue: T,
  options: UseAutoSaveOptions = {}
): [T, (value: T | ((prev: T) => T)) => void, { saved: boolean; synced: boolean }] {
  const {
    debounce = 500,
    syncToServer = false,
    onSyncError,
    onSyncSuccess,
  } = options;

  const [state, setState] = useState<T>(initialValue);
  const [saved, setSaved] = useState(false);
  const [synced, setSynced] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const isOnline = useRef(navigator.onLine);

  // 서버에 동기화
  const performSync = useCallback(async () => {
    if (!isOnline.current) return;

    try {
      const synced = await syncQueue.syncToServer(
        process.env.REACT_APP_API_URL || 'http://localhost:3000',
        localStorage.getItem('authToken') || ''
      );

      if (synced) {
        setSynced(true);
        onSyncSuccess?.();
      } else {
        setSynced(false);
      }
    } catch (error) {
      setSynced(false);
      onSyncError?.(error as Error);
    }
  }, [onSyncError, onSyncSuccess]);

  // 온라인 상태 감지
  useEffect(() => {
    const handleOnline = () => {
      isOnline.current = true;
      if (syncToServer) {
        performSync();
      }
    };

    const handleOffline = () => {
      isOnline.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncToServer, performSync]);

  // 상태 업데이트 (자동 저장 포함)
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setState((prevState) => {
      const actualNewValue =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(prevState)
          : newValue;

      // 저장 타이머 취소
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // 새로운 저장 타이머 설정
      debounceTimer.current = setTimeout(async () => {
        await storageManager.set(key, actualNewValue);
        setSaved(true);

        // 서버 동기화 추가
        if (syncToServer && isOnline.current) {
          syncQueue.add(key, actualNewValue);
          await performSync();
        } else if (syncToServer) {
          syncQueue.add(key, actualNewValue);
        }

        // 저장 상태 표시 (3초 후 사라짐)
        setTimeout(() => setSaved(false), 3000);
      }, debounce);

      return actualNewValue;
    });
  }, [key, debounce, syncToServer, performSync]);

  // 컴포넌트 마운트 시 저장된 데이터 복원
  useEffect(() => {
    (async () => {
      const savedValue = await storageManager.get<T>(key);
      if (savedValue !== null) {
        setState(savedValue);
      }
    })();
  }, [key]);

  return [state, setValue, { saved, synced }];
}

/**
 * useAutoSaveMultiple - 여러 키 자동 저장
 *
 * 사용 예시:
 * const data = useAutoSaveMultiple({
 *   children: [],
 *   schedules: [],
 *   sessions: [],
 * });
 */
export function useAutoSaveMultiple<T extends Record<string, any>>(
  initialValues: T,
  options: UseAutoSaveOptions = {}
) {
  const {
    debounce = 500,
    syncToServer = false,
  } = options;

  const [state, setState] = useState<T>(initialValues);
  const [saved, setSaved] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // 전체 상태 업데이트
  const update = useCallback(
    (updates: Partial<T>) => {
      setState((prev) => {
        const newState = { ...prev, ...updates };

        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(async () => {
          await storageManager.setMany(newState);
          setSaved(true);

          if (syncToServer) {
            for (const [key, value] of Object.entries(newState)) {
              syncQueue.add(key, value);
            }
          }

          setTimeout(() => setSaved(false), 3000);
        }, debounce);

        return newState;
      });
    },
    [debounce, syncToServer]
  );

  // 복원
  useEffect(() => {
    (async () => {
      const restored = await storageManager.getAll<any>();
      if (Object.keys(restored).length > 0) {
        const mergedState = { ...initialValues, ...restored };
        setState(mergedState);
      }
    })();
  }, []);

  return { data: state, update, saved };
}
