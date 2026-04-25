/**
 * 비밀번호 설정/검증 모달
 *
 * 기능:
 * 1. 처음 설정: 새 비밀번호 등록
 * 2. 복원 시 입력: 저장된 데이터 복호화
 * 3. 변경: 기존 비밀번호 변경
 */

import React, { useState, useCallback } from 'react';
import {
  validatePassword,
  setStoragePassword,
  confirmPassword,
  changePassword,
} from '../utils/encryption';

interface PasswordModalProps {
  mode: 'setup' | 'verify' | 'change';
  onConfirm: (password: string) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
}

export function PasswordModal({
  mode,
  onConfirm,
  onCancel,
  title,
  subtitle,
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState<ReturnType<typeof validatePassword> | null>(null);

  // 비밀번호 입력 시 강도 검사
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setError('');

    if (mode === 'setup' || mode === 'change') {
      const val = validatePassword(pwd);
      setValidation(val);
    }
  };

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'setup') {
        // 새 비밀번호 등록
        if (password !== confirmPwd) {
          throw new Error('비밀번호가 일치하지 않습니다');
        }

        const val = validatePassword(password);
        if (!val.valid) {
          throw new Error(val.feedback.join(', '));
        }

        await setStoragePassword(password);
        onConfirm(password);
      } else if (mode === 'verify') {
        // 기존 비밀번호 검증
        const verified = await confirmPassword(password);
        if (!verified) {
          throw new Error('비밀번호가 올바르지 않습니다');
        }
        onConfirm(password);
      } else if (mode === 'change') {
        // 비밀번호 변경
        if (password !== confirmPwd) {
          throw new Error('새 비밀번호가 일치하지 않습니다');
        }

        const val = validatePassword(password);
        if (!val.valid) {
          throw new Error(val.feedback.join(', '));
        }

        await changePassword(oldPassword, password);
        onConfirm(password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const defaultTitle =
    mode === 'setup'
      ? '🔐 비밀번호 설정'
      : mode === 'verify'
        ? '🔓 비밀번호 입력'
        : '🔄 비밀번호 변경';

  const defaultSubtitle =
    mode === 'setup'
      ? '캐시 데이터 보호를 위한 강력한 비밀번호를 설정하세요'
      : mode === 'verify'
        ? '저장된 데이터에 접근하기 위해 비밀번호를 입력하세요'
        : '새로운 비밀번호로 변경하세요';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-white border-opacity-20">
        {/* 헤더 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title || defaultTitle}</h2>
        <p className="text-gray-600 text-sm mb-6">{subtitle || defaultSubtitle}</p>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 기존 비밀번호 입력 (변경 모드) */}
          {mode === 'change' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                현재 비밀번호
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="현재 비밀번호"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                required
              />
            </div>
          )}

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'verify' ? '비밀번호' : '새 비밀번호'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder={mode === 'verify' ? '비밀번호 입력' : '새 비밀번호 입력'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {/* 비밀번호 강도 (설정/변경 모드) */}
            {(mode === 'setup' || mode === 'change') && validation && (
              <div className="mt-3">
                {/* 강도 바 */}
                <div className="flex gap-1 mb-2">
                  {['weak', 'fair', 'good', 'strong'].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded transition-all ${
                        ['weak', 'fair', 'good', 'strong'].indexOf(validation.strength) >=
                        ['weak', 'fair', 'good', 'strong'].indexOf(level as any)
                          ? {
                              weak: 'bg-red-500',
                              fair: 'bg-yellow-500',
                              good: 'bg-blue-500',
                              strong: 'bg-green-500',
                            }[validation.strength]
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-xs font-medium ${
                    {
                      weak: 'text-red-600',
                      fair: 'text-yellow-600',
                      good: 'text-blue-600',
                      strong: 'text-green-600',
                    }[validation.strength]
                  }`}
                >
                  강도: {
                    {
                      weak: '약함',
                      fair: '보통',
                      good: '좋음',
                      strong: '매우 강함',
                    }[validation.strength]
                  }
                </p>

                {/* 요구사항 */}
                {validation.feedback.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {validation.feedback.map((feedback, i) => (
                      <li key={i} className="text-xs text-gray-600">
                        • {feedback}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* 비밀번호 확인 입력 (설정/변경 모드) */}
          {(mode === 'setup' || mode === 'change') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="비밀번호 다시 입력"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                required
              />
              {password && confirmPwd && password === confirmPwd && (
                <p className="text-xs text-green-600 mt-1">✅ 비밀번호가 일치합니다</p>
              )}
              {password && confirmPwd && password !== confirmPwd && (
                <p className="text-xs text-red-600 mt-1">❌ 비밀번호가 일치하지 않습니다</p>
              )}
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading || (mode === 'setup' && password !== confirmPwd)}
            >
              {loading && <span>⏳</span>}
              {mode === 'setup'
                ? '설정'
                : mode === 'verify'
                  ? '확인'
                  : '변경'}
            </button>
          </div>

          {/* 보안 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-blue-600 text-xs">
              🔒 <strong>보안 주의:</strong> 비밀번호는 브라우저에 저장되며, 분실 시 데이터를
              복구할 수 없습니다. 안전한 곳에 백업하세요.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
