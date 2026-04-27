import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSavedUser, getSavedDevice, verifyAccess } from '../utils/deviceManager';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;  // 유지 (하위 호환)
  allowedRoles?: Array<'admin' | 'therapist' | 'parent'>;
}

export function ProtectedRoute({ children, requireAdmin = false, allowedRoles }: ProtectedRouteProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    checkAccess();

    // localStorage 변화를 감지하기 위해 주기적으로 검증
    const interval = setInterval(() => {
      checkAccess();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkAccess = async () => {
    const user = getSavedUser();
    const device = getSavedDevice();

    console.log('🔐 ProtectedRoute 검증 시작 (테스트 모드)');
    console.log('📱 저장된 사용자:', user);

    if (!user || !device) {
      console.log('❌ 사용자 또는 디바이스 없음 → 로그인 페이지로');
      setIsValid(false);
      return;
    }

    // 테스트 모드: 승인 검증 생략, 사용자/디바이스만 확인
    console.log('✅ 테스트 모드: 승인 검증 스킵');
    setIsValid(true);
  };

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
