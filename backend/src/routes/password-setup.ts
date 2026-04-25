/**
 * 브라우저 캐시 비밀번호 설정 API 엔드포인트
 *
 * 기능:
 * 1. 비밀번호 설정
 * 2. 비밀번호 변경
 * 3. 비밀번호 제거
 */

import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import {
  setStoragePassword,
  changePassword,
  disablePassword,
  isPasswordEnabled,
  validatePassword,
} from '../utils/encryption';

const app = new Hono();

// ============================================================================
// POST /api/password/setup - 비밀번호 초기 설정
// ============================================================================

/**
 * 처음 비밀번호 설정
 *
 * Request Body:
 * {
 *   "password": "NewPassword123!@#"
 * }
 */
app.post('/setup', async (c) => {
  try {
    const body = await c.req.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return c.json(
        { error: 'Password required', message: '비밀번호를 입력하세요' },
        400
      );
    }

    // 비밀번호 강도 검사
    const validation = validatePassword(password);
    if (!validation.valid) {
      return c.json(
        {
          error: 'Password validation failed',
          feedback: validation.feedback,
        },
        400
      );
    }

    // 비밀번호 설정
    await setStoragePassword(password);

    return c.json({
      status: 'success',
      message: '✅ 비밀번호가 설정되었습니다',
      strength: validation.strength,
    });
  } catch (error) {
    return c.json(
      {
        error: 'Password setup failed',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

// ============================================================================
// POST /api/password/change - 비밀번호 변경
// ============================================================================

/**
 * 기존 비밀번호 변경
 *
 * Request Body:
 * {
 *   "oldPassword": "OldPassword123!@#",
 *   "newPassword": "NewPassword456!@#"
 * }
 */
app.post('/change', async (c) => {
  try {
    const body = await c.req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return c.json(
        { error: 'Passwords required', message: '기존 비밀번호와 새 비밀번호를 입력하세요' },
        400
      );
    }

    // 새 비밀번호 강도 검사
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return c.json(
        {
          error: 'Password validation failed',
          feedback: validation.feedback,
        },
        400
      );
    }

    // 비밀번호 변경
    await changePassword(oldPassword, newPassword);

    return c.json({
      status: 'success',
      message: '✅ 비밀번호가 변경되었습니다',
      strength: validation.strength,
    });
  } catch (error) {
    return c.json(
      {
        error: 'Password change failed',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

// ============================================================================
// POST /api/password/disable - 비밀번호 비활성화
// ============================================================================

/**
 * 캐시 암호화 비활성화 (비밀번호 확인 필요)
 *
 * Request Body:
 * {
 *   "password": "CurrentPassword123!@#"
 * }
 */
app.post('/disable', async (c) => {
  try {
    const body = await c.req.json();
    const { password } = body;

    if (!password) {
      return c.json(
        { error: 'Password required', message: '비밀번호를 입력하세요' },
        400
      );
    }

    // 비밀번호 비활성화
    await disablePassword(password);

    return c.json({
      status: 'success',
      message: '✅ 캐시 암호화가 비활성화되었습니다',
      warning: '⚠️ 향후 저장되는 데이터는 암호화되지 않습니다',
    });
  } catch (error) {
    return c.json(
      {
        error: 'Password disable failed',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

// ============================================================================
// GET /api/password/status - 비밀번호 상태 조회
// ============================================================================

/**
 * 현재 비밀번호 활성화 상태 조회
 */
app.get('/status', async (c) => {
  try {
    const enabled = isPasswordEnabled();

    return c.json({
      status: 'success',
      passwordEnabled: enabled,
      message: enabled ? '🔐 암호화 활성화' : '🔓 암호화 비활성화',
    });
  } catch (error) {
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
// POST /api/password/validate - 비밀번호 강도 검사 (사전 검증)
// ============================================================================

/**
 * 비밀번호 강도 사전 검증 (설정 전에 UI에서 사용)
 *
 * Request Body:
 * {
 *   "password": "TestPassword123!@#"
 * }
 */
app.post('/validate', async (c) => {
  try {
    const body = await c.req.json();
    const { password } = body;

    if (!password) {
      return c.json(
        { error: 'Password required' },
        400
      );
    }

    const validation = validatePassword(password);

    return c.json({
      status: 'success',
      valid: validation.valid,
      strength: validation.strength,
      feedback: validation.feedback,
    });
  } catch (error) {
    return c.json(
      {
        error: 'Validation failed',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

export default app;
