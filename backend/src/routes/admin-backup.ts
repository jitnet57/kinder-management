/**
 * 관리자 백업 관리 API
 * 백업 상태 조회, 수동 트리거, 복구 이력
 *
 * Routes:
 * - GET  /api/admin/backup/status      - 백업 상태 조회
 * - GET  /api/admin/backup/history     - 백업 이력 조회
 * - POST /api/admin/backup/trigger     - 수동 백업 실행
 * - POST /api/admin/backup/restore/:id - 특정 백업에서 복구 (테스트용)
 */

import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { bearerAuth } from 'hono/bearer-auth';
import { logger } from '../utils/logger';
import { triggerManualBackup } from '../jobs/backup';

const prisma = new PrismaClient();
const app = new Hono();

// ============================================================================
// Middleware: 관리자 인증
// ============================================================================

async function requireAdmin(req: any, res: any, next: any) {
  const user = req.user;

  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: '관리자 권한이 필요합니다',
    });
  }

  // 감시 로깅: 관리자 백업 접근
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'ADMIN_BACKUP_ACCESS',
      entity: 'backup',
      entityId: 0,
      ipAddress: req.ip,
    },
  }).catch(err => logger.error('감시 로그 저장 실패', { err }));

  next();
}

// ============================================================================
// GET /api/admin/backup/status - 백업 상태 조회
// ============================================================================

app.get('/status', bearerAuth({ token: process.env.ADMIN_API_KEY! }), async (c) => {
  try {
    // 최근 백업 조회
    const lastBackup = await prisma.backupLog.findFirst({
      orderBy: { backupDate: 'desc' },
      take: 1,
    });

    // 이번 달 백업 통계
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const monthlyStats = await prisma.backupLog.aggregate({
      _count: true,
      _avg: {
        sizeBytes: true,
      },
      where: {
        backupDate: { gte: monthAgo },
      },
    });

    // 실패한 백업
    const failedBackups = await prisma.backupLog.findMany({
      where: { status: 'FAILED' },
      orderBy: { backupDate: 'desc' },
      take: 5,
    });

    // 복구 이력
    const lastRestore = await prisma.restoreLog.findFirst({
      orderBy: { restoreDate: 'desc' },
      take: 1,
    });

    return c.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      lastBackup: lastBackup ? {
        date: lastBackup.backupDate.toISOString(),
        status: lastBackup.status,
        filename: lastBackup.filename,
        sizeBytes: lastBackup.sizeBytes,
        sizeMB: lastBackup.sizeBytes ? (lastBackup.sizeBytes / 1024 / 1024).toFixed(2) : null,
        s3Url: lastBackup.s3Url,
        notes: lastBackup.notes,
      } : null,
      monthlyStats: {
        backupCount: monthlyStats._count || 0,
        averageSizeMB: monthlyStats._avg.sizeBytes
          ? (monthlyStats._avg.sizeBytes / 1024 / 1024).toFixed(2)
          : null,
      },
      failedBackups: failedBackups.length > 0 ? failedBackups.map(b => ({
        date: b.backupDate.toISOString(),
        filename: b.filename,
        notes: b.notes,
      })) : [],
      lastRestore: lastRestore ? {
        date: lastRestore.restoreDate.toISOString(),
        status: lastRestore.status,
        durationMs: lastRestore.durationMs,
        restoredBy: lastRestore.restoredBy,
      } : null,
      nextScheduledBackup: getNextBackupTime(),
    });
  } catch (error) {
    logger.error('백업 상태 조회 실패', { error });
    return c.json(
      {
        error: 'Failed to fetch backup status',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

// ============================================================================
// GET /api/admin/backup/history - 백업 이력 조회 (페이지네이션)
// ============================================================================

app.get('/history', bearerAuth({ token: process.env.ADMIN_API_KEY! }), async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const status = c.req.query('status'); // 'SUCCESS' | 'FAILED' | undefined (전체)

    const skip = (page - 1) * limit;

    // 필터 조건
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // 백업 이력 조회
    const backups = await prisma.backupLog.findMany({
      where,
      orderBy: { backupDate: 'desc' },
      skip,
      take: limit,
    });

    // 전체 개수 (페이지네이션용)
    const total = await prisma.backupLog.count({ where });

    return c.json({
      status: 'success',
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      backups: backups.map(b => ({
        id: b.id,
        date: b.backupDate.toISOString(),
        status: b.status,
        filename: b.filename,
        sizeBytes: b.sizeBytes,
        sizeMB: b.sizeBytes ? (b.sizeBytes / 1024 / 1024).toFixed(2) : null,
        localPath: b.localPath,  // ✅ 로컬 경로
        notes: b.notes,
      })),
    });
  } catch (error) {
    logger.error('백업 이력 조회 실패', { error });
    return c.json(
      {
        error: 'Failed to fetch backup history',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

// ============================================================================
// POST /api/admin/backup/trigger - 수동 백업 실행
// ============================================================================

app.post('/trigger', bearerAuth({ token: process.env.ADMIN_API_KEY! }), async (c) => {
  try {
    logger.info('👤 수동 백업 요청 (관리자)');

    // 비동기 실행 (응답은 즉시 반환)
    triggerManualBackup().catch(err => {
      logger.error('백그라운드 백업 실패', { err });
    });

    return c.json({
      status: 'success',
      message: '백업이 시작되었습니다',
      note: '백업 진행 상황은 상태 조회 API로 확인할 수 있습니다',
      nextCheck: new Date(Date.now() + 5000).toISOString(), // 5초 뒤 재확인
    });
  } catch (error) {
    logger.error('수동 백업 트리거 실패', { error });
    return c.json(
      {
        error: 'Failed to trigger backup',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

// ============================================================================
// POST /api/admin/backup/restore/:id - 복구 요청 (권장: 테스트 환경만)
// ============================================================================

/**
 * ⚠️ 주의: 이 엔드포인트는 테스트 목적용입니다
 * 프로덕션에서는 데이터베이스 팀에 복구 요청을 해야 합니다
 */
app.post('/restore/:id', bearerAuth({ token: process.env.ADMIN_API_KEY! }), async (c) => {
  const backupId = parseInt(c.req.param('id'));

  try {
    // 백업 존재 확인
    const backup = await prisma.backupLog.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      return c.json({ error: 'Backup not found' }, 404);
    }

    if (backup.status !== 'SUCCESS') {
      return c.json(
        { error: 'Cannot restore from failed backup' },
        400
      );
    }

    // 복구 시작 로깅
    const startTime = Date.now();

    try {
      // ⚠️ 실제 복구 로직은 수동으로 실행 (위험도 높음)
      // 여기서는 요청만 기록
      logger.warn('🚨 복구 요청 (수동 실행 필요)', {
        backupId,
        backupFile: backup.filename,
        s3Url: backup.s3Url,
        admin: c.req.header('X-Admin-Id') || 'unknown',
      });

      // 복구 이력 저장 (상태: IN_PROGRESS)
      const restore = await prisma.restoreLog.create({
        data: {
          backupId,
          status: 'IN_PROGRESS',
          restoredBy: c.req.header('X-Admin-Id') || 'api-manual',
        },
      });

      return c.json({
        status: 'success',
        message: '복구 요청이 접수되었습니다 (수동 처리 필요)',
        restoreId: restore.id,
        warning: '⚠️ 프로덕션 환경에서는 데이터베이스 팀에 직접 문의하세요',
        nextStep: '데이터베이스 팀이 복구를 진행하는 동안 기다립니다',
        estimatedTime: '5-30분',
      });
    } catch (error) {
      logger.error('복구 프로세스 오류', { error });

      // 복구 실패 기록
      await prisma.restoreLog.create({
        data: {
          backupId,
          status: 'FAILED',
          durationMs: Date.now() - startTime,
          notes: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  } catch (error) {
    logger.error('복구 요청 처리 실패', { error });
    return c.json(
      {
        error: 'Failed to process restore request',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

// ============================================================================
// 유틸 함수
// ============================================================================

/**
 * 다음 백업 예정 시간 계산
 */
function getNextBackupTime(): string {
  const now = new Date();
  const nextBackup = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

  // 이미 자정을 지났으면 내일 자정
  if (now > nextBackup) {
    nextBackup.setDate(nextBackup.getDate() + 1);
  }

  return nextBackup.toISOString();
}

export default app;
