/**
 * 백업 파일 암호화/복호화
 *
 * 기능:
 * 1. PostgreSQL 덤프 + tar.gz 암호화 (AES-256)
 * 2. USB 전송 시 안전성 보장
 * 3. 비밀번호 기반 복호화
 */

import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

interface EncryptedBackupMetadata {
  version: string;
  algorithm: string;
  encryptionMethod: 'password' | 'none';
  timestamp: string;
  originalSize: number;
  encryptedSize: number;
  salt: string;
  iv: string;
}

const ALGORITHM = 'aes-256-gcm';
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100000;

/**
 * 비밀번호로부터 암호화 키 도출 (PBKDF2)
 */
function deriveKey(
  password: string,
  salt: Buffer
): crypto.KeyObject {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256');
}

/**
 * 백업 파일 암호화
 */
export async function encryptBackupFile(
  inputPath: string,
  outputPath: string,
  password?: string
): Promise<EncryptedBackupMetadata> {
  const startTime = Date.now();

  try {
    // 입력 파일 읽기
    const fileBuffer = await fs.readFile(inputPath);
    const originalSize = fileBuffer.length;

    // 암호화 수행
    let encryptedBuffer: Buffer;
    let salt: Buffer;
    let iv: Buffer;
    let authTag: Buffer;

    if (password) {
      // 랜덤 salt, iv 생성
      salt = crypto.randomBytes(SALT_LENGTH);
      iv = crypto.randomBytes(IV_LENGTH);

      // 키 도출
      const key = deriveKey(password, salt);

      // 암호화
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      const encrypted = cipher.update(fileBuffer);
      cipher.final();
      authTag = cipher.getAuthTag();

      // IV + salt + authTag + encrypted 순서로 저장
      encryptedBuffer = Buffer.concat([
        iv,
        salt,
        authTag,
        encrypted,
      ]);
    } else {
      // 암호화 없음
      salt = Buffer.alloc(SALT_LENGTH);
      iv = Buffer.alloc(IV_LENGTH);
      authTag = Buffer.alloc(AUTH_TAG_LENGTH);
      encryptedBuffer = fileBuffer;
    }

    // 메타데이터 작성
    const metadata: EncryptedBackupMetadata = {
      version: '1.0',
      algorithm: ALGORITHM,
      encryptionMethod: password ? 'password' : 'none',
      timestamp: new Date().toISOString(),
      originalSize,
      encryptedSize: encryptedBuffer.length,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
    };

    // JSON 메타데이터 작성
    const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
    const metadataLengthBuffer = Buffer.alloc(4);
    metadataLengthBuffer.writeUInt32BE(metadataBuffer.length, 0);

    // 최종 파일: [metadataLength(4)] + [metadata(JSON)] + [encryptedData]
    const finalBuffer = Buffer.concat([
      metadataLengthBuffer,
      metadataBuffer,
      encryptedBuffer,
    ]);

    // 파일로 저장
    await fs.writeFile(outputPath, finalBuffer);

    const duration = Date.now() - startTime;

    console.log(
      `✅ 백업 암호화 완료: ${originalSize} → ${encryptedBuffer.length} bytes (${duration}ms)`
    );

    return metadata;
  } catch (error) {
    console.error('백업 암호화 실패:', error);
    throw new Error(`백업 파일 암호화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 백업 파일 복호화
 */
export async function decryptBackupFile(
  inputPath: string,
  outputPath: string,
  password?: string
): Promise<EncryptedBackupMetadata> {
  const startTime = Date.now();

  try {
    // 암호화된 파일 읽기
    const fileBuffer = await fs.readFile(inputPath);

    // 메타데이터 길이 읽기 (처음 4바이트)
    const metadataLength = fileBuffer.readUInt32BE(0);
    const metadataBuffer = fileBuffer.slice(4, 4 + metadataLength);
    const metadata: EncryptedBackupMetadata = JSON.parse(metadataBuffer.toString());

    // 암호화된 데이터 추출
    const encryptedData = fileBuffer.slice(4 + metadataLength);

    let decryptedBuffer: Buffer;

    if (metadata.encryptionMethod === 'password') {
      if (!password) {
        throw new Error('이 백업은 암호화되어 있습니다. 비밀번호가 필요합니다.');
      }

      // 메타데이터에서 salt, iv 추출
      const salt = Buffer.from(metadata.salt, 'hex');
      const iv = Buffer.from(metadata.iv, 'hex');

      // encryptedData에서 authTag와 실제 데이터 분리
      const authTag = encryptedData.slice(0, AUTH_TAG_LENGTH);
      const ciphertext = encryptedData.slice(AUTH_TAG_LENGTH);

      // 키 도출
      const key = deriveKey(password, salt);

      // 복호화
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      try {
        const decrypted = decipher.update(ciphertext);
        decipher.final();
        decryptedBuffer = decrypted;
      } catch (error) {
        throw new Error('비밀번호가 올바르지 않거나 파일이 손상되었습니다');
      }
    } else {
      // 암호화 없음
      decryptedBuffer = encryptedData;
    }

    // 파일로 저장
    await fs.writeFile(outputPath, decryptedBuffer);

    const duration = Date.now() - startTime;

    console.log(
      `✅ 백업 복호화 완료: ${decryptedBuffer.length} bytes (${duration}ms)`
    );

    return metadata;
  } catch (error) {
    console.error('백업 복호화 실패:', error);
    throw new Error(`백업 파일 복호화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 백업 파일 메타데이터 읽기 (복호화 없이)
 */
export async function readBackupMetadata(
  filePath: string
): Promise<EncryptedBackupMetadata> {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const metadataLength = fileBuffer.readUInt32BE(0);
    const metadataBuffer = fileBuffer.slice(4, 4 + metadataLength);
    return JSON.parse(metadataBuffer.toString()) as EncryptedBackupMetadata;
  } catch (error) {
    throw new Error(`메타데이터 읽기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 백업 파일 암호화 여부 확인
 */
export async function isBackupEncrypted(filePath: string): Promise<boolean> {
  try {
    const metadata = await readBackupMetadata(filePath);
    return metadata.encryptionMethod === 'password';
  } catch {
    return false;
  }
}

/**
 * 백업 파일 검증
 */
export async function validateBackupFile(
  filePath: string,
  password?: string
): Promise<{
  valid: boolean;
  encrypted: boolean;
  size: number;
  timestamp: string;
  error?: string;
}> {
  try {
    const metadata = await readBackupMetadata(filePath);
    const encrypted = metadata.encryptionMethod === 'password';

    if (encrypted && !password) {
      return {
        valid: false,
        encrypted: true,
        size: 0,
        timestamp: metadata.timestamp,
        error: '암호화된 백업입니다. 비밀번호가 필요합니다.',
      };
    }

    return {
      valid: true,
      encrypted,
      size: metadata.originalSize,
      timestamp: metadata.timestamp,
    };
  } catch (error) {
    return {
      valid: false,
      encrypted: false,
      size: 0,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/**
 * 파일 암호화 상태 확인 (간단 버전)
 */
export async function getBackupInfo(filePath: string): Promise<{
  exists: boolean;
  encrypted: boolean;
  size: number;
  originalSize: number;
  timestamp: string;
}> {
  try {
    const stat = await fs.stat(filePath);
    const metadata = await readBackupMetadata(filePath);

    return {
      exists: true,
      encrypted: metadata.encryptionMethod === 'password',
      size: stat.size,
      originalSize: metadata.originalSize,
      timestamp: metadata.timestamp,
    };
  } catch (error) {
    throw new Error(`파일 정보 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}
