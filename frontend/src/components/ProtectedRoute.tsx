import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSavedUser, getSavedDevice, verifyAccess } from '../utils/deviceManager';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const user = getSavedUser();
    const device = getSavedDevice();

    if (!user || !device) {
      setIsValid(false);
      return;
    }

    if (requireAdmin && user.role !== 'admin') {
      setIsValid(false);
      return;
    }

    // 2단계 승인 확인: 관리자 승인 AND 개발자 승인
    if (!user.adminApproved || !user.developerApproved) {
      setIsValid(false);
      return;
    }

    if (!device.adminApproved || !device.developerApproved) {
      setIsValid(false);
      return;
    }

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
