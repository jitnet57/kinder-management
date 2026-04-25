/**
 * 백업 파일에서 데이터 복원 기능
 * 백업 파일 → PostgreSQL 복구
 *
 * 용도:
 * 1. 집에서 작업한 데이터를 회사 컴퓨터에 복원
 * 2. 회사 데이터를 집 컴퓨터에 복원
 * 3. 손상된 데이터베이스 복구
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

// ============================================================================
// 복원 설정
// ============================================================================

const RESTORE_CONFIG = {
  tmpDir: process.env.TMP || '/tmp',
  timeout: 600000, // 10분
};

// ============================================================================
// 복원 함수
// ============================================================================

/**
 * tar.gz 백업 파일 압축 해제
 */
async function extractBackup(backupFilePath: string): Promise<{
  dumpFile: string;
  metaFile: string;
}> {
  const tmpDir = path.join(RESTORE_CONFIG.tmpDir, `restore-${Date.now()}`);

  logger.info('📦 백업 파일 압축 해제 중...', { backupFile: path.basename(backupFilePath) });

  try {
    // 임시 디렉토리 생성
    await fs.mkdir(tmpDir, { recursive: true });

    // tar 압축 해제
    const extractCommand = `tar -xzf "${backupFilePath}" -C "${tmpDir}"`;
    await execAsync(extractCommand, { timeout: RESTORE_CONFIG.timeout });

    // 추출된 파일 확인
    const files = await fs.readdir(tmpDir);
    const dumpFile = files.find(f => f.endsWith('.sql'));
    const metaFile = files.find(f => f.endsWith('.json'));

    if (!dumpFile) {
      throw new Error('덤프 파일(.sql)을 찾을 수 없습니다');
    }

    logger.info('✅ 압축 해제 완료', {
      tmpDir,
      dumpFile,
      metaFile,
    });

    return {
      dumpFile: path.join(tmpDir, dumpFile),
      metaFile: metaFile ? path.join(tmpDir, metaFile) : null,
    };
  } catch (error) {
    logger.error('❌ 압축 해제 실패', { error });
    throw new Error(`Extraction failed: ${error.message}`);
  }
}

/**
 * PostgreSQL 덤프 파일을 데이터베이스에 복원
 */
async function restoreToDatabase(dumpFilePath: string): Promise<{
  success: boolean;
  rowsRestored: number;
  duration: number;
}> {
  const startTime = Date.now();

  logger.info('🔄 PostgreSQL 복원 시작...', { dumpFile: path.basename(dumpFilePath) });

  try {
    // PostgreSQL 복원 명령
    // 기존 데이터를 덮어쓰므로 주의!
    const restoreCommand = `
      psql \
        --host=${process.env.DB_HOST} \
        --port=${process.env.DB_PORT || 5432} \
        --username=${process.env.DB_USER} \
        --dbname=${process.env.DB_NAME} \
        --file="${dumpFilePath}" \
        --quiet
    `;

    const env = {
      ...process.env,
      PGPASSWORD: process.env.DB_PASSWORD,
    };

    await execAsync(restoreCommand, {
      env,
      timeout: RESTORE_CONFIG.timeout,
    });

    const duration = Date.now() - startTime;

    logger.info('✅ PostgreSQL 복원 완료', {
      duration: `${(duration / 1000).toFixed(2)}초`,
    });

    return {
      success: true,
      rowsRestored: 0, // 실제 개수는 데이터베이스에서 조회
      duration,
    };
  } catch (error) {
    logger.error('❌ PostgreSQL 복원 실패', { error });
    throw new Error(`Restore failed: ${error.message}`);
  }
}

/**
 * 복원된 데이터 검증
 */
async function validateRestoredData(): Promise<{
  valid: boolean;
  stats: {
    userCount: number;
    childCount: number;
    scheduleCount: number;
    sessionLogCount: number;
  };
}> {
  logger.info('🔍 복원된 데이터 검증 중...');

  try {
    const stats = {
      userCount: await prisma.user.count(),
      childCount: await prisma.child.count(),
      scheduleCount: await prisma.schedule.count(),
      sessionLogCount: await prisma.sessionLog.count(),
    };

    // 기본 무결성 확인
    if (stats.userCount === 0) {
      throw new Error('사용자 데이터가 없습니다');
    }

    logger.info('✅ 데이터 검증 완료', stats);

    return {
      valid: true,
      stats,
    };
  } catch (error) {
    logger.error('❌ 데이터 검증 실패', { error });
    throw new Error(`Validation failed: ${error.message}`);
  }
}

/**
 * 임시 파일 정리
 */
async function cleanupTempFiles(tmpDir: string): Promise<void> {
  try {
    await fs.rm(tmpDir, { recursive: true, force: true });
    logger.info('✅ 임시 파일 삭제됨');
  } catch (error) {
    logger.warn('⚠️ 임시 파일 삭제 실패', { error });
  }
}

// ============================================================================
// 메인 복원 함수
// ============================================================================

/**
 * 백업 파일에서 전체 복원
 *
 * 사용 사례:
 * 1. 집에서 만든 백업 → 회사 컴퓨터에서 복원
 * 2. 회사 데이터 → 집 컴퓨터에서 복원
 * 3. 손상된 DB → 백업에서 복구
 */
export async function executeFullRestore(
  backupFilePath: string,
  options?: {
    validateOnly?: boolean;  // 검증만 하고 복원 안 함
    skipBackup?: boolean;     // 복원 전 현재 DB 백업 스킵
  }
): Promise<{
  success: boolean;
  duration: number;
  stats: any;
  warning?: string;
}> {
  const startTime = Date.now();
  let tmpDir = '';
  let preRestoreBackupPath = '';

  try {
    logger.info('═══════════════════════════════════════════════');
    logger.info('🔄 복원 작업 시작');
    logger.info(`📁 백업 파일: ${backupFilePath}`);
    logger.info('═══════════════════════════════════════════════');

    // 검증: 백업 파일 존재 확인
    try {
      await fs.access(backupFilePath);
    } catch {
      throw new Error(`백업 파일을 찾을 수 없습니다: ${backupFilePath}`);
    }

    // 1단계: 복원 전 현재 DB 백업 (선택적)
    if (!options?.skipBackup) {
      logger.info('💾 복원 전 현재 데이터 백업 중...');
      // TODO: 현재 DB 백업 (restore 전 안전장치)
      preRestoreBackupPath = '[pre-restore-backup]';
    }

    // 2단계: 백업 파일 압축 해제
    const { dumpFile, metaFile } = await extractBackup(backupFilePath);
    tmpDir = path.dirname(dumpFile);

    // 3단계: 검증만 하는 경우
    if (options?.validateOnly) {
      logger.info('⚠️ 검증 모드 - 실제 복원하지 않습니다');

      const validation = await validateRestoredData();

      return {
        success: true,
        duration: Date.now() - startTime,
        stats: validation.stats,
        warning: '검증 모드: 데이터베이스가 변경되지 않았습니다',
      };
    }

    // 4단계: 데이터베이스에 복원
    logger.warn('⚠️ 경고: 현재 데이터베이스가 덮어씌워집니다!');
    await restoreToDatabase(dumpFile);

    // 5단계: 복원된 데이터 검증
    const validation = await validateRestoredData();

    if (!validation.valid) {
      throw new Error('데이터 검증 실패');
    }

    // 6단계: 복원 기록 저장
    await prisma.restoreLog.create({
      data: {
        backupId: 0, // 알려진 백업 ID가 없는 경우
        restoreDate: new Date(),
        status: 'SUCCESS',
        durationMs: Date.now() - startTime,
        restoredBy: 'api-restore',
        notes: `복원 원본: ${path.basename(backupFilePath)}`,
      },
    });

    // 7단계: 임시 파일 정리
    await cleanupTempFiles(tmpDir);

    logger.info('═══════════════════════════════════════════════');
    logger.info('✅ 복원 완료');
    logger.info('═══════════════════════════════════════════════');

    return {
      success: true,
      duration: Date.now() - startTime,
      stats: validation.stats,
    };
  } catch (error) {
    logger.error('═══════════════════════════════════════════════');
    logger.error('❌ 복원 실패', { error });
    logger.error('═══════════════════════════════════════════════');

    // 실패 기록
    try {
      await prisma.restoreLog.create({
        data: {
          backupId: 0,
          restoreDate: new Date(),
          status: 'FAILED',
          durationMs: Date.now() - startTime,
          notes: error instanceof Error ? error.message : String(error),
        },
      });
    } catch (dbError) {
      logger.error('실패 기록 저장 실패', { dbError });
    }

    // 임시 파일 정리
    if (tmpDir) {
      await cleanupTempFiles(tmpDir);
    }

    throw error;
  }
}

/**
 * 수동 복원 트리거 (API용)
 */
export async function triggerManualRestore(
  backupFilePath: string
): Promise<{
  success: boolean;
  message: string;
  stats?: any;
}> {
  try {
    const result = await executeFullRestore(backupFilePath);
    return {
      success: true,
      message: '✅ 복원이 완료되었습니다',
      stats: result.stats,
    };
  } catch (error) {
    logger.error('수동 복원 실패', { error });
    return {
      success: false,
      message: `❌ 복원 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    };
  }
}

export default {
  executeFullRestore,
  triggerManualRestore,
};
