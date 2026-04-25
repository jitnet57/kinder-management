/**
 * 일자별 자동 데이터 백업 작업
 * 매일 자정(UTC+9) PostgreSQL 전체 덤프를 로컬 컴퓨터에 저장
 *
 * ADR-009: 일자별 자동 데이터 백업 전략 참고
 */

import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';
import { unlinkSync, statSync } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../utils/email';
import { logger } from '../utils/logger';
import { encryptBackupFile } from '../utils/backupEncryption';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

// ============================================================================
// 백업 설정
// ============================================================================

// 운영체제별 기본 백업 경로
function getDefaultBackupDir(): string {
  if (process.platform === 'win32') {
    return 'C:\\kinder-backups\\daily';
  } else if (process.platform === 'darwin') {
    return `${process.env.HOME}/kinder-backups/daily`;
  } else {
    return '/var/kinder-backups/daily';
  }
}

const BACKUP_CONFIG = {
  schedule: '0 0 * * *', // 매일 자정 (UTC+9)
  backupDir: process.env.BACKUP_DIR || getDefaultBackupDir(),
  tmpDir: process.env.TMP || '/tmp',
  retention: 30, // 일 단위
  timeout: 600000, // 10분
  encryptionEnabled: process.env.BACKUP_ENCRYPTION === 'true',
  backupPassword: process.env.BACKUP_PASSWORD, // USB 전송 시 암호화용
};

// ============================================================================
// 백업 함수
// ============================================================================

/**
 * PostgreSQL 전체 덤프 생성
 */
async function createPostgresDump(): Promise<{
  filename: string;
  filepath: string;
  sizeBytes: number;
}> {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `kinder-dump-${dateStr}.sql`;
  const tmpPath = path.join(BACKUP_CONFIG.tmpDir, filename);

  logger.info('🔄 PostgreSQL 덤프 시작...', { filename });

  try {
    // PostgreSQL pg_dump 실행
    const dumpCommand = `
      pg_dump \
        --host=${process.env.DB_HOST} \
        --port=${process.env.DB_PORT || 5432} \
        --username=${process.env.DB_USER} \
        --format=plain \
        --verbose \
        --file="${tmpPath}" \
        ${process.env.DB_NAME}
    `;

    const env = {
      ...process.env,
      PGPASSWORD: process.env.DB_PASSWORD,
    };

    await execAsync(dumpCommand, {
      env,
      timeout: BACKUP_CONFIG.timeout,
    });

    // 파일 크기 확인
    const stats = statSync(tmpPath);
    const sizeBytes = stats.size;

    logger.info('✅ PostgreSQL 덤프 완료', {
      filename,
      sizeBytes,
      sizeMB: (sizeBytes / 1024 / 1024).toFixed(2),
    });

    return { filename, filepath: tmpPath, sizeBytes };
  } catch (error) {
    logger.error('❌ PostgreSQL 덤프 실패', { error });
    throw new Error(`Dump failed: ${error.message}`);
  }
}

/**
 * 덤프 파일을 tar.gz로 압축 (로컬 저장)
 */
async function compressBackup(
  filepath: string,
  filename: string
): Promise<{
  compressedFilename: string;
  compressedPath: string;
  sizeBytes: number;
}> {
  const dateStr = new Date().toISOString().split('T')[0];
  const compressedFilename = `kinder-backup-${dateStr}.tar.gz`;
  const compressedPath = path.join(BACKUP_CONFIG.backupDir, compressedFilename);

  logger.info('📦 백업 파일 압축 중...', { compressedFilename });

  try {
    // 백업 디렉토리 생성
    await fs.mkdir(BACKUP_CONFIG.backupDir, { recursive: true });

    // tar + gzip 압축
    const compressCommand = `tar -czf "${compressedPath}" -C "${path.dirname(filepath)}" "${filename}"`;
    await execAsync(compressCommand, { timeout: BACKUP_CONFIG.timeout });

    // 압축 파일 크기
    const stats = statSync(compressedPath);
    const sizeBytes = stats.size;

    logger.info('✅ 압축 완료', {
      compressedFilename,
      sizeBytes,
      sizeMB: (sizeBytes / 1024 / 1024).toFixed(2),
      savedPath: compressedPath,
    });

    return { compressedFilename, compressedPath, sizeBytes };
  } catch (error) {
    logger.error('❌ 압축 실패', { error });
    throw new Error(`Compression failed: ${error.message}`);
  }
}

/**
 * 백업 파일 암호화 (USB 전송용)
 */
async function encryptBackupIfNeeded(
  compressedPath: string,
  compressedFilename: string
): Promise<{
  finalFilename: string;
  finalPath: string;
  sizeBytes: number;
  encrypted: boolean;
}> {
  if (!BACKUP_CONFIG.encryptionEnabled || !BACKUP_CONFIG.backupPassword) {
    // 암호화 안 함
    const stats = statSync(compressedPath);
    return {
      finalFilename: compressedFilename,
      finalPath: compressedPath,
      sizeBytes: stats.size,
      encrypted: false,
    };
  }

  logger.info('🔐 백업 파일 암호화 중...', { filename: compressedFilename });

  try {
    const encryptedFilename = `${compressedFilename}.enc`;
    const encryptedPath = compressedPath + '.enc';

    // 암호화 수행
    await encryptBackupFile(
      compressedPath,
      encryptedPath,
      BACKUP_CONFIG.backupPassword
    );

    // 원본 압축 파일 삭제
    await fs.unlink(compressedPath);

    const stats = statSync(encryptedPath);

    logger.info('✅ 암호화 완료', {
      encryptedFilename,
      sizeBytes: stats.size,
      sizeMB: (stats.size / 1024 / 1024).toFixed(2),
    });

    return {
      finalFilename: encryptedFilename,
      finalPath: encryptedPath,
      sizeBytes: stats.size,
      encrypted: true,
    };
  } catch (error) {
    logger.error('❌ 암호화 실패', { error });
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * 오래된 백업 파일 로컬에서 삭제 (retention 정책)
 */
async function cleanupOldBackups(): Promise<void> {
  logger.info('🧹 오래된 백업 삭제 중...', { retentionDays: BACKUP_CONFIG.retention });

  try {
    // 백업 디렉토리의 모든 파일 나열
    const files = await fs.readdir(BACKUP_CONFIG.backupDir);
    const backupFiles = files.filter(f => f.startsWith('kinder-backup-') && f.endsWith('.tar.gz'));

    if (backupFiles.length === 0) {
      logger.info('백업 파일 없음');
      return;
    }

    // retention 날짜 이전 파일 식별
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - BACKUP_CONFIG.retention);

    let deletedCount = 0;

    for (const filename of backupFiles) {
      const filepath = path.join(BACKUP_CONFIG.backupDir, filename);
      const stats = statSync(filepath);

      if (stats.mtime < retentionDate) {
        await fs.unlink(filepath);
        logger.info('🗑️ 삭제됨', { filename });
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.info('✅ 오래된 백업 삭제 완료', { deletedCount });
    } else {
      logger.info('삭제할 오래된 파일 없음');
    }
  } catch (error) {
    logger.error('⚠️ 오래된 백업 삭제 중 에러 (계속 진행)', { error });
    // 삭제 실패는 백업 전체 실패로 간주하지 않음
  }
}

/**
 * 로컬 임시 파일 삭제
 */
async function cleanupLocalFiles(
  dumpPath: string,
  compressedPath: string
): Promise<void> {
  try {
    unlinkSync(dumpPath);
    unlinkSync(compressedPath);
    logger.info('✅ 로컬 임시 파일 삭제 완료');
  } catch (error) {
    logger.warn('⚠️ 로컬 파일 삭제 중 에러', { error });
  }
}

/**
 * 백업 성공 알림 발송
 */
async function sendBackupSuccessEmail(
  compressedFilename: string,
  sizeBytes: number,
  localPath: string
): Promise<void> {
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@kinder.local',
      subject: `✅ Kinder ABA 백업 완료 (${new Date().toISOString().split('T')[0]})`,
      html: `
        <h2>데이터 백업이 완료되었습니다</h2>
        <ul>
          <li><strong>파일명:</strong> ${compressedFilename}</li>
          <li><strong>크기:</strong> ${(sizeBytes / 1024 / 1024).toFixed(2)}MB</li>
          <li><strong>완료 시간:</strong> ${new Date().toISOString()}</li>
          <li><strong>저장 위치:</strong> <code>${localPath}</code></li>
          <li><strong>보관 기간:</strong> 30일</li>
          <li><strong>다음 백업:</strong> ${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 00:00</li>
        </ul>
        <p style="color: #666; font-size: 12px;">
          💾 이 백업은 로컬 컴퓨터에 저장되어 있습니다.<br/>
          🔒 보안을 위해 정기적으로 USB 드라이브나 외장 HDD에 복사하시기 바랍니다.
        </p>
      `,
    });
    logger.info('✅ 성공 알림 이메일 발송');
  } catch (error) {
    logger.error('⚠️ 알림 이메일 발송 실패', { error });
  }
}

/**
 * 백업 실패 알림 발송
 */
async function sendBackupFailureEmail(error: Error): Promise<void> {
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@kinder.local',
      subject: `⚠️ Kinder ABA 백업 실패 (${new Date().toISOString().split('T')[0]})`,
      html: `
        <h2 style="color: #d32f2f;">데이터 백업이 실패했습니다</h2>
        <p><strong>에러 메시지:</strong></p>
        <pre style="background: #f5f5f5; padding: 10px;">${error.message}</pre>
        <p><strong>시간:</strong> ${new Date().toISOString()}</p>
        <p style="color: #f57c00;"><strong>⚠️ 중요:</strong> 백업 실패가 지속되면 즉시 관리자에게 보고하세요.</p>
        <p>자동 재시도: 1시간 뒤</p>
      `,
    });
    logger.info('✅ 실패 알림 이메일 발송');
  } catch (error) {
    logger.error('⚠️ 실패 알림 이메일 발송 실패', { error });
  }
}

// ============================================================================
// 메인 백업 작업
// ============================================================================

/**
 * 전체 백업 프로세스 (Cron에서 호출)
 * 인터넷 없이도 작동 (로컬 저장)
 */
export async function executeBackupJob(): Promise<void> {
  let dumpPath = '';

  try {
    logger.info('═══════════════════════════════════════════════');
    logger.info('🔄 데이터 백업 작업 시작');
    logger.info('═══════════════════════════════════════════════');

    // 1. PostgreSQL 덤프 생성
    const { filepath, sizeBytes: dumpSize } = await createPostgresDump();
    dumpPath = filepath;

    // 2. 백업 파일 압축
    const { compressedPath, sizeBytes: compressedSize, compressedFilename } = await compressBackup(
      filepath,
      path.basename(filepath)
    );

    // 3. 암호화 (필요시)
    const { finalPath, finalFilename, sizeBytes: finalSize, encrypted } = await encryptBackupIfNeeded(
      compressedPath,
      compressedFilename
    );

    // 4. 백업 기록 저장 (로컬 경로 저장)
    await prisma.backupLog.create({
      data: {
        backupDate: new Date(),
        filename: finalFilename,
        sizeBytes: finalSize,
        localPath: finalPath,  // ✅ 로컬 경로 저장
        status: 'SUCCESS',
        notes: encrypted ? '🔐 암호화됨' : null,
      },
    });

    // 5. 오래된 백업 정리
    await cleanupOldBackups();

    // 6. 임시 덤프 파일 삭제
    try {
      unlinkSync(dumpPath);
      logger.info('✅ 임시 덤프 파일 삭제됨');
    } catch (err) {
      logger.warn('⚠️ 임시 파일 삭제 실패', { err });
    }

    // 7. 성공 알림
    await sendBackupSuccessEmail(
      finalFilename,
      finalSize,
      finalPath
    );

    logger.info('═══════════════════════════════════════════════');
    logger.info('✅ 백업 작업 완료');
    logger.info('📁 저장 위치:', finalPath);
    if (encrypted) {
      logger.info('🔐 암호화: 활성화');
    }
    logger.info('═══════════════════════════════════════════════');
  } catch (error) {
    logger.error('═══════════════════════════════════════════════');
    logger.error('❌ 백업 작업 실패', { error });
    logger.error('═══════════════════════════════════════════════');

    // 데이터베이스에 실패 기록
    try {
      await prisma.backupLog.create({
        data: {
          backupDate: new Date(),
          filename: 'FAILED',
          status: 'FAILED',
          notes: error instanceof Error ? error.message : String(error),
        },
      });
    } catch (dbError) {
      logger.error('❌ 실패 기록 저장 실패', { dbError });
    }

    // 실패 알림 발송
    await sendBackupFailureEmail(error instanceof Error ? error : new Error(String(error)));

    // 에러 재발생 (모니터링 시스템이 감지하도록)
    throw error;
  }
}

// ============================================================================
// Cron 스케줄 등록
// ============================================================================

/**
 * 백업 Cron 작업 초기화
 */
export function initializeBackupJob(): void {
  logger.info('🚀 백업 Cron 작업 초기화', { schedule: BACKUP_CONFIG.schedule });

  // 매일 자정에 백업 실행
  cron.schedule(BACKUP_CONFIG.schedule, async () => {
    try {
      await executeBackupJob();
    } catch (error) {
      logger.error('💥 Cron 백업 작업 실패', { error });
      // 에러는 이미 로깅 및 알림됨
    }
  });

  logger.info('✅ 백업 Cron 작업 등록 완료');
}

// ============================================================================
// 수동 트리거 (테스트 및 긴급 백업용)
// ============================================================================

/**
 * 관리자가 수동으로 백업 실행
 * POST /api/admin/backup/trigger
 */
export async function triggerManualBackup(): Promise<{
  success: boolean;
  message: string;
  backupFile?: string;
}> {
  try {
    await executeBackupJob();
    return {
      success: true,
      message: '백업이 완료되었습니다',
    };
  } catch (error) {
    logger.error('수동 백업 실패', { error });
    return {
      success: false,
      message: `백업 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    };
  }
}

export default {
  executeBackupJob,
  initializeBackupJob,
  triggerManualBackup,
};
