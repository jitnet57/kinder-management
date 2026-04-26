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

    console.log('🔐 ProtectedRoute 검증 시작...');
    console.log('📱 저장된 사용자:', user);
    console.log('💻 저장된 디바이스:', device);

    if (!user || !device) {
      console.log('❌ 사용자 또는 디바이스 없음');
      setIsValid(false);
      return;
    }

    if (requireAdmin && user.role !== 'admin') {
      console.log('❌ 관리자 권한 없음');
      setIsValid(false);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!user || !allowedRoles.includes(user.role)) {
        console.log('❌ 역할 권한 없음');
        setIsValid(false);
        return;
      }
    }

    // 2단계 승인 확인: 관리자 승인 AND 개발자 승인
    console.log(`사용자 승인 상태: 관리자=${user.adminApproved}, 개발자=${user.developerApproved}`);
    console.log(`디바이스 승인 상태: 관리자=${device.adminApproved}, 개발자=${device.developerApproved}`);

    if (!user.adminApproved || !user.developerApproved) {
      console.log('❌ 사용자 미승인');
      setIsValid(false);
      return;
    }

    if (!device.adminApproved || !device.developerApproved) {
      console.log('❌ 디바이스 미승인');
      setIsValid(false);
      return;
    }

    console.log('✅ 모든 검증 통과');
    const isValid = await verifyAccess(user.id, device.id);
    setIsValid(isValid);
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
