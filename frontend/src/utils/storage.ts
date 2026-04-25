/**
 * 로컬스토리지/IndexedDB 통합 저장소
 *
 * 기능:
 * 1. 자동 저장 (localStorage + IndexedDB)
 * 2. 자동 복원 (앱 시작 시)
 * 3. 동기화 상태 추적
 * 4. 용량 관리 (IndexedDB 사용 시)
 */

const DB_NAME = 'KinderABA';
const STORE_NAME = 'app-data';
const VERSION = 1;

export interface StorageItem {
  key: string;
  value: any;
  timestamp: number;
  synced?: boolean;
}

class StorageManager {
  private db: IDBDatabase | null = null;
  private useIndexedDB = false;

  async initialize(): Promise<void> {
    try {
      // IndexedDB 지원 여부 확인
      const indexedDB = window.indexedDB || (window as any).mozIndexedDB || (window as any).webkitIndexedDB;
      if (!indexedDB) {
        console.warn('📦 IndexedDB 미지원, localStorage 사용');
        this.useIndexedDB = false;
        return;
      }

      const request = indexedDB.open(DB_NAME, VERSION);

      return new Promise((resolve, reject) => {
        request.onerror = () => {
          console.warn('📦 IndexedDB 열기 실패, localStorage 사용');
          this.useIndexedDB = false;
          resolve();
        };

        request.onsuccess = () => {
          this.db = request.result;
          this.useIndexedDB = true;
          console.log('✅ IndexedDB 초기화 완료');
          resolve();
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          }
        };
      });
    } catch (error) {
      console.warn('📦 저장소 초기화 실패:', error);
      this.useIndexedDB = false;
    }
  }

  // 단일 항목 저장
  async set(key: string, value: any): Promise<void> {
    const item: StorageItem = {
      key,
      value,
      timestamp: Date.now(),
      synced: false,
    };

    // localStorage에 항상 저장 (빠른 접근)
    try {
      localStorage.setItem(`kinder_${key}`, JSON.stringify(item));
    } catch (error) {
      console.error('localStorage 저장 실패:', error);
    }

    // IndexedDB에도 저장 (큰 데이터용)
    if (this.useIndexedDB && this.db) {
      try {
        return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.put(item);

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      } catch (error) {
        console.error('IndexedDB 저장 실패:', error);
      }
    }
  }

  // 단일 항목 조회
  async get<T = any>(key: string): Promise<T | null> {
    // 먼저 localStorage에서 조회
    try {
      const item = localStorage.getItem(`kinder_${key}`);
      if (item) {
        const parsed: StorageItem = JSON.parse(item);
        return parsed.value as T;
      }
    } catch (error) {
      console.error('localStorage 조회 실패:', error);
    }

    // IndexedDB에서 조회
    if (this.useIndexedDB && this.db) {
      try {
        return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([STORE_NAME], 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(key);

          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            const result = request.result as StorageItem | undefined;
            resolve((result?.value as T) || null);
          };
        });
      } catch (error) {
        console.error('IndexedDB 조회 실패:', error);
      }
    }

    return null;
  }

  // 여러 항목 저장 (배치)
  async setMany(items: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(items)) {
      await this.set(key, value);
    }
  }

  // 여러 항목 조회 (배치)
  async getMany<T = any>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    for (const key of keys) {
      result[key] = await this.get<T>(key);
    }
    return result;
  }

  // 모든 항목 조회
  async getAll<T = any>(): Promise<Record<string, T>> {
    const result: Record<string, T> = {};

    // localStorage에서 모든 kinder_* 항목 조회
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('kinder_')) {
        const cleanKey = key.replace('kinder_', '');
        try {
          const item: StorageItem = JSON.parse(localStorage.getItem(key)!);
          result[cleanKey] = item.value as T;
        } catch (error) {
          console.error(`항목 파싱 실패: ${key}`, error);
        }
      }
    }

    return result;
  }

  // 항목 삭제
  async remove(key: string): Promise<void> {
    localStorage.removeItem(`kinder_${key}`);

    if (this.useIndexedDB && this.db) {
      try {
        return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.delete(key);

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      } catch (error) {
        console.error('IndexedDB 삭제 실패:', error);
      }
    }
  }

  // 모든 항목 삭제
  async clear(): Promise<void> {
    // localStorage 정리
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('kinder_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // IndexedDB 정리
    if (this.useIndexedDB && this.db) {
      try {
        return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.clear();

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      } catch (error) {
        console.error('IndexedDB 정리 실패:', error);
      }
    }
  }

  // 저장소 크기 조회
  async getStorageSize(): Promise<{ used: number; available: number }> {
    if (!navigator.storage?.estimate) {
      return { used: 0, available: 0 };
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0,
      };
    } catch (error) {
      console.error('저장소 크기 조회 실패:', error);
      return { used: 0, available: 0 };
    }
  }

  // 저장소 상태
  getStatus(): {
    initialized: boolean;
    useIndexedDB: boolean;
    available: boolean;
  } {
    return {
      initialized: this.db !== null || !this.useIndexedDB,
      useIndexedDB: this.useIndexedDB,
      available: this.useIndexedDB || typeof localStorage !== 'undefined',
    };
  }
}

// 싱글톤 인스턴스
export const storageManager = new StorageManager();

/**
 * 동기화 큐 관리 (온라인으로 돌아왔을 때 서버에 보낼 데이터)
 */
class SyncQueue {
  private queue: Array<{ key: string; value: any; timestamp: number }> = [];

  add(key: string, value: any): void {
    this.queue.push({
      key,
      value,
      timestamp: Date.now(),
    });
  }

  getAll(): Array<{ key: string; value: any; timestamp: number }> {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
  }

  async syncToServer(apiUrl: string, authToken: string): Promise<boolean> {
    if (this.queue.length === 0) return true;

    try {
      const response = await fetch(`${apiUrl}/api/sync/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: this.queue }),
      });

      if (response.ok) {
        this.queue = [];
        return true;
      }
      return false;
    } catch (error) {
      console.error('동기화 실패:', error);
      return false;
    }
  }
}

export const syncQueue = new SyncQueue();
