/**
 * 양방향 데이터 동기화 API
 * 여러 컴퓨터 간 백업/복원으로 데이터 일관성 유지
 *
 * 사용 사례:
 * 1. 집 컴퓨터에서 작업 → USB 백업 → 회사 컴퓨터에서 복원
 * 2. 회사 컴퓨터 데이터 → USB 백업 → 집 컴퓨터에서 복원
 * 3. 두 시스템 간 최신 데이터 동기화
 *
 * Routes:
 * - POST /api/sync/restore         - 백업 파일 업로드 및 복원
 * - POST /api/sync/export          - 동기화용 내보내기 (JSON)
 * - GET  /api/sync/status          - 동기화 상태
 * - POST /api/sync/compare         - 두 백업 비교
 */

import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { bearerAuth } from 'hono/bearer-auth';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { executeFullRestore } from '../jobs/restore';
import { decryptBackupFile, readBackupMetadata, isBackupEncrypted } from '../utils/backupEncryption';

const prisma = new PrismaClient();
const app = new Hono();

// ============================================================================
// POST /api/sync/restore - 백업 파일 업로드 및 복원
// ============================================================================

/**
 * 클라이언트에서 백업 파일 업로드 → 복원
 *
 * 사용 예시:
 * 집에서 작업한 데이터 백업 (kinder-backup-2026-04-26.tar.gz)을
 * 회사 컴퓨터의 이 엔드포인트에 업로드 → 자동 복원
 */
app.post('/restore', bearerAuth({ token: process.env.ADMIN_API_KEY! }), async (c) => {
  try {
    // 파일 업로드 처리
    const body = await c.req.parseFormData();
    const backupFile = body.get('backup');
    const backupPassword = body.get('password')?.toString() || '';

    if (!backupFile || typeof backupFile === 'string') {
      return c.json(
        { error: 'Backup file required', message: 'multipart/form-data로 backup 파일을 전송하세요' },
        400
      );
    }

    // 업로드된 파일을 임시 경로에 저장
    const uploadDir = process.env.BACKUP_DIR || '/tmp';
    const fileName = `restore-${Date.now()}.tar.gz.enc`;
    const filePath = path.join(uploadDir, fileName);
    const decryptedPath = path.join(uploadDir, `restore-${Date.now()}.tar.gz`);

    // 파일 저장
    const buffer = await backupFile.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(buffer));

    logger.info('📤 백업 파일 업로드됨', { fileName, size: buffer.byteLength });

    // 암호화 여부 확인
    const encrypted = await isBackupEncrypted(filePath);
    let restoreFilePath = filePath;

    if (encrypted) {
      if (!backupPassword) {
        throw new Error('이 백업은 암호화되어 있습니다. 비밀번호를 입력하세요.');
      }

      logger.info('🔐 암호화된 백업 복호화 중...');

      try {
        await decryptBackupFile(filePath, decryptedPath, backupPassword);
        restoreFilePath = decryptedPath;
        logger.info('✅ 복호화 완료');
      } catch (error) {
        throw new Error(`복호화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
    }

    // 복원 실행
    logger.warn('🔄 데이터 복원 시작... (기존 데이터 덮어씌워짐)');

    const result = await executeFullRestore(restoreFilePath, {
      skipBackup: false, // 복원 전 현재 DB 백업
    });

    // 업로드된 파일 정리
    try {
      await fs.unlink(filePath);
      if (encrypted) {
        await fs.unlink(decryptedPath);
      }
    } catch (err) {
      logger.warn('임시 파일 삭제 실패', { err });
    }

    return c.json({
      status: 'success',
      message: '✅ 복원이 완료되었습니다',
      duration: `${(result.duration / 1000).toFixed(2)}초`,
      stats: result.stats,
      encrypted: encrypted ? '🔐 암호화된 파일' : null,
      warning: '⚠️ 이 작업으로 기존 데이터가 백업에 있는 데이터로 완전히 대체되었습니다',
    });
  } catch (error) {
    logger.error('복원 실패', { error });
    return c.json(
      {
        error: 'Restore failed',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

// ============================================================================
// POST /api/sync/export - 동기화용 JSON 내보내기
// ============================================================================

/**
 * 현재 데이터를 JSON으로 내보내기
 * (tar.gz 대신 JSON 형식으로, 버전 비교 용이)
 */
app.post('/export', bearerAuth({ token: process.env.ADMIN_API_KEY! }), async (c) => {
  try {
    logger.info('📊 데이터 내보내기 중...');

    // 모든 테이블 데이터 추출
    const snapshot = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      database: process.env.DB_NAME,
      tables: {
        users: await prisma.user.findMany(),
        children: await prisma.child.findMany(),
        schedules: await prisma.schedule.findMany(),
        curriculum: await prisma.curriculum.findMany(),
        sessionLogs: await prisma.sessionLog.findMany(),
        completionLogs: await prisma.completionLog.findMany(),
        curriculumAssignments: await prisma.curriculumAssignment.findMany(),
        backupLogs: await prisma.backupLog.findMany(),
      },
    };

    const fileName = `kinder-export-${new Date().toISOString().split('T')[0]}.json`;

    logger.info('✅ 내보내기 완료', { fileName });

    // JSON을 다운로드로 반환
    return c.json(snapshot, {
      headers: {
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    logger.error('내보내기 실패', { error });
    return c.json(
      {
        error: 'Export failed',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

// ============================================================================
// GET /api/sync/status - 동기화 상태 및 비교
// ============================================================================

/**
 * 현재 시스템의 데이터 상태 조회
 */
app.get('/status', bearerAuth({ token: process.env.ADMIN_API_KEY! }), async (c) => {
  try {
    const stats = {
      users: await prisma.user.count(),
      children: await prisma.child.count(),
      schedules: await prisma.schedule.count(),
      sessionLogs: await prisma.sessionLog.count(),
      curriculumAssignments: await prisma.curriculumAssignment.count(),
      completionLogs: await prisma.completionLog.count(),
    };

    const lastBackup = await prisma.backupLog.findFirst({
      where: { status: 'SUCCESS' },
      orderBy: { backupDate: 'desc' },
    });

    const lastRestore = await prisma.restoreLog.findFirst({
      where: { status: 'SUCCESS' },
      orderBy: { restoreDate: 'desc' },
    });

    return c.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      currentData: stats,
      lastBackup: lastBackup ? {
        date: lastBackup.backupDate,
        filename: lastBackup.filename,
      } : null,
      lastRestore: lastRestore ? {
        date: lastRestore.restoreDate,
        notes: lastRestore.notes,
      } : null,
      syncRecommendation: !lastBackup || !lastRestore
        ? '⚠️ 아직 동기화되지 않았습니다'
        : '✅ 동기화 상태 양호',
    });
  } catch (error) {
    logger.error('상태 조회 실패', { error });
    return c.json(
      {
        error: 'Status check failed',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

// ============================================================================
// POST /api/sync/compare - 두 백업 파일 비교 (선택)
// ============================================================================

/**
 * 두 백업의 데이터 개수를 비교하여 차이 확인
 * 어느 쪽 데이터가 더 최신인지 판단하는데 도움
 */
app.post('/compare', bearerAuth({ token: process.env.ADMIN_API_KEY! }), async (c) => {
  try {
    const body = await c.req.json();
    const { lastSyncDate } = body;

    if (!lastSyncDate) {
      return c.json(
        { error: 'lastSyncDate required' },
        400
      );
    }

    const syncDate = new Date(lastSyncDate);

    // 마지막 동기화 이후 추가된 데이터
    const newSessions = await prisma.sessionLog.count({
      where: { createdAt: { gte: syncDate } },
    });

    const newChildren = await prisma.child.count({
      where: { createdAt: { gte: syncDate } },
    });

    const updatedChildren = await prisma.child.count({
      where: { updatedAt: { gte: syncDate } },
    });

    return c.json({
      status: 'success',
      lastSyncDate: syncDate.toISOString(),
      changesSinceSync: {
        newChildren,
        updatedChildren,
        newSessionLogs: newSessions,
        totalChanges: newChildren + updatedChildren + newSessions,
      },
      recommendation: (newChildren + updatedChildren + newSessions) > 10
        ? '💾 백업을 추천합니다'
        : '✅ 변경사항이 적습니다',
    });
  } catch (error) {
    logger.error('비교 실패', { error });
    return c.json(
      {
        error: 'Comparison failed',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

export default app;
