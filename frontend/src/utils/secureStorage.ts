/**
 * 암호화된 보안 저장소
 * 비밀번호를 통해 모든 캐시 데이터를 암호화
 */

import { storageManager, StorageItem } from './storage';
import {
  encryptData,
  decryptData,
  isPasswordEnabled,
  confirmPassword,
} from './encryption';

interface SecureStorageOptions {
  useEncryption?: boolean;
}

class SecureStorageManager {
  private useEncryption: boolean = false;

  async initialize(): Promise<void> {
    await storageManager.initialize();
    this.useEncryption = isPasswordEnabled();

    if (this.useEncryption) {
      console.log('🔐 암호화된 저장소 활성화');
    }
  }

  /**
   * 암호화가 필요한지 확인하고 비밀번호 검증
   */
  private async ensurePassword(password?: string): Promise<boolean> {
    if (!this.useEncryption) {
      return true;
    }

    if (!password) {
      return false;
    }

    return confirmPassword(password);
  }

  /**
   * 데이터 저장 (암호화)
   */
  async set(key: string, value: any, password?: string): Promise<void> {
    if (this.useEncryption) {
      const isValid = await this.ensurePassword(password);
      if (!isValid) {
        throw new Error('비밀번호가 필요합니다');
      }

      const encrypted = await encryptData(value, password!);
      await storageManager.set(key, {
        encrypted: true,
        data: encrypted,
      });
    } else {
      await storageManager.set(key, {
        encrypted: false,
        data: value,
      });
    }
  }

  /**
   * 데이터 조회 (복호화)
   */
  async get<T = any>(key: string, password?: string): Promise<T | null> {
    const stored = await storageManager.get<any>(key);

    if (!stored) {
      return null;
    }

    if (stored.encrypted) {
      if (!password) {
        throw new Error('비밀번호가 필요합니다');
      }

      const isValid = await this.ensurePassword(password);
      if (!isValid) {
        throw new Error('비밀번호가 올바르지 않습니다');
      }

      return decryptData<T>(stored.data, password);
    }

    return stored.data as T;
  }

  /**
   * 여러 항목 저장
   */
  async setMany(items: Record<string, any>, password?: string): Promise<void> {
    for (const [key, value] of Object.entries(items)) {
      await this.set(key, value, password);
    }
  }

  /**
   * 여러 항목 조회
   */
  async getMany<T = any>(keys: string[], password?: string): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    for (const key of keys) {
      result[key] = await this.get<T>(key, password);
    }
    return result;
  }

  /**
   * 모든 항목 조회
   */
  async getAll<T = any>(password?: string): Promise<Record<string, T>> {
    const allData = await storageManager.getAll<any>();
    const result: Record<string, T> = {};

    for (const [key, stored] of Object.entries(allData)) {
      if (stored?.encrypted) {
        if (!password) {
          throw new Error('비밀번호가 필요합니다');
        }
        result[key] = await decryptData<T>(stored.data, password);
      } else {
        result[key] = stored?.data as T;
      }
    }

    return result;
  }

  /**
   * 항목 삭제
   */
  async remove(key: string): Promise<void> {
    await storageManager.remove(key);
  }

  /**
   * 전체 캐시 삭제 (비밀번호 확인 후)
   */
  async clear(password?: string): Promise<void> {
    if (this.useEncryption) {
      const isValid = await this.ensurePassword(password);
      if (!isValid) {
        throw new Error('비밀번호가 올바르지 않습니다');
      }
    }

    await storageManager.clear();
  }

  /**
   * 저장소 상태
   */
  getStatus() {
    return {
      ...storageManager.getStatus(),
      encryptionEnabled: this.useEncryption,
    };
  }

  /**
   * 저장소 크기 조회
   */
  async getStorageSize() {
    return storageManager.getStorageSize();
  }
}

export const secureStorageManager = new SecureStorageManager();

/**
 * 자동 저장 시 비밀번호 관리
 */
class PasswordManager {
  private password: string | null = null;
  private passwordExpireTime: number = 0;
  private passwordTimeout: number = 30 * 60 * 1000; // 30분

  /**
   * 비밀번호 입력
   */
  setPassword(password: string): void {
    this.password = password;
    this.resetTimeout();
  }

  /**
   * 비밀번호 초기화 (타임아웃)
   */
  resetTimeout(): void {
    this.passwordExpireTime = Date.now() + this.passwordTimeout;
  }

  /**
   * 비밀번호 유효성 확인
   */
  isPasswordValid(): boolean {
    if (!this.password) {
      return false;
    }

    if (Date.now() > this.passwordExpireTime) {
      this.clearPassword();
      return false;
    }

    return true;
  }

  /**
   * 저장된 비밀번호 조회
   */
  getPassword(): string | null {
    if (this.isPasswordValid()) {
      return this.password;
    }
    return null;
  }

  /**
   * 비밀번호 초기화
   */
  clearPassword(): void {
    this.password = null;
    this.passwordExpireTime = 0;
  }

  /**
   * 비밀번호 타임아웃 시간 설정
   */
  setPasswordTimeout(minutes: number): void {
    this.passwordTimeout = minutes * 60 * 1000;
  }
}

export const passwordManager = new PasswordManager();
