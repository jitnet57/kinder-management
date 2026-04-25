/**
 * AES-256 암호화/복호화 유틸리티
 *
 * 기능:
 * 1. 비밀번호를 통한 데이터 암호화
 * 2. 저장된 데이터 복호화
 * 3. 암호화 키 도출 (PBKDF2)
 */

const ALGORITHM = 'AES-GCM';
const KEY_SIZE = 256;
const ITERATIONS = 100000; // PBKDF2 iterations
const SALT_LENGTH = 16; // bytes
const TAG_LENGTH = 128; // bits for GCM

interface EncryptedData {
  ciphertext: string;      // Base64 encoded
  iv: string;              // Base64 encoded
  salt: string;            // Base64 encoded
  version: number;
}

/**
 * 비밀번호로부터 암호화 키 도출
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // PBKDF2로 기본 키 도출
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // AES-GCM 키 도출
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: ALGORITHM, length: KEY_SIZE },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 데이터 암호화
 */
export async function encryptData(data: any, password: string): Promise<EncryptedData> {
  try {
    // 랜덤 salt 생성
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

    // 랜덤 IV 생성
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96 bits for GCM

    // 암호화 키 도출
    const key = await deriveKey(password, salt);

    // 데이터를 JSON 문자열로 변환 후 암호화
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));

    // 암호화
    const cipherBuffer = await window.crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH,
      },
      key,
      dataBuffer
    );

    // Base64로 인코딩
    const ciphertext = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));
    const saltStr = btoa(String.fromCharCode(...salt));
    const ivStr = btoa(String.fromCharCode(...iv));

    return {
      ciphertext,
      iv: ivStr,
      salt: saltStr,
      version: 1,
    };
  } catch (error) {
    console.error('암호화 실패:', error);
    throw new Error('데이터 암호화에 실패했습니다');
  }
}

/**
 * 데이터 복호화
 */
export async function decryptData<T = any>(
  encrypted: EncryptedData,
  password: string
): Promise<T> {
  try {
    // Base64 디코딩
    const cipherBuffer = Uint8Array.from(atob(encrypted.ciphertext), c => c.charCodeAt(0));
    const salt = Uint8Array.from(atob(encrypted.salt), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(encrypted.iv), c => c.charCodeAt(0));

    // 암호화 키 도출
    const key = await deriveKey(password, salt);

    // 복호화
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH,
      },
      key,
      cipherBuffer
    );

    // 문자열로 변환
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);

    // JSON 파싱
    return JSON.parse(jsonString) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('비밀번호가 올바르지 않습니다');
    }
    console.error('복호화 실패:', error);
    throw new Error('데이터 복호화에 실패했습니다');
  }
}

/**
 * 비밀번호 강도 검사
 */
export function validatePassword(password: string): {
  valid: boolean;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // 길이 검사
  if (password.length < 8) {
    feedback.push('최소 8자 이상 입력하세요');
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
  }

  // 대문자 검사
  if (!/[A-Z]/.test(password)) {
    feedback.push('대문자를 포함하세요');
  } else {
    score += 1;
  }

  // 소문자 검사
  if (!/[a-z]/.test(password)) {
    feedback.push('소문자를 포함하세요');
  } else {
    score += 1;
  }

  // 숫자 검사
  if (!/[0-9]/.test(password)) {
    feedback.push('숫자를 포함하세요');
  } else {
    score += 1;
  }

  // 특수문자 검사
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('특수문자를 포함하세요');
  } else {
    score += 1;
  }

  const strengthMap: { [key: number]: 'weak' | 'fair' | 'good' | 'strong' } = {
    0: 'weak',
    1: 'weak',
    2: 'fair',
    3: 'good',
    4: 'strong',
    5: 'strong',
  };

  return {
    valid: feedback.length === 0,
    strength: strengthMap[score] || 'weak',
    feedback,
  };
}

/**
 * 비밀번호 해시 (검증용)
 * 로컬에서만 저장되므로 일반적인 해싱으로 충분
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 비밀번호 검증
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}

/**
 * 비밀번호 설정 저장 (로컬스토리지)
 * 실제 비밀번호는 저장하지 않고, 해시만 저장
 */
export async function setStoragePassword(password: string): Promise<void> {
  const validation = validatePassword(password);
  if (!validation.valid) {
    throw new Error(`비밀번호 요구사항을 충족하지 않습니다: ${validation.feedback.join(', ')}`);
  }

  const hash = await hashPassword(password);
  localStorage.setItem('kinder_password_hash', hash);
  localStorage.setItem('kinder_password_enabled', 'true');
}

/**
 * 저장된 비밀번호 확인
 */
export function isPasswordEnabled(): boolean {
  return localStorage.getItem('kinder_password_enabled') === 'true';
}

/**
 * 비밀번호 확인
 */
export async function confirmPassword(password: string): Promise<boolean> {
  const hash = localStorage.getItem('kinder_password_hash');
  if (!hash) return false;
  return verifyPassword(password, hash);
}

/**
 * 비밀번호 변경
 */
export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  const verified = await confirmPassword(oldPassword);
  if (!verified) {
    throw new Error('현재 비밀번호가 올바르지 않습니다');
  }

  await setStoragePassword(newPassword);
}

/**
 * 비밀번호 제거 (오프 상태로)
 */
export async function disablePassword(password: string): Promise<void> {
  const verified = await confirmPassword(password);
  if (!verified) {
    throw new Error('비밀번호가 올바르지 않습니다');
  }

  localStorage.removeItem('kinder_password_hash');
  localStorage.removeItem('kinder_password_enabled');
}
