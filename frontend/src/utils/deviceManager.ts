/**
 * Device & User Management System
 * 디바이스 인증 및 사용자 승인 시스템
 */

import { Notification } from '../types/index';

export interface Device {
  id: string;
  name: string;
  userAgent: string;
  ipAddress: string;
  registeredAt: string;
  lastUsedAt: string;
  isApproved: boolean;
  adminApproved: boolean;
  adminApprovedBy?: string;
  adminApprovedAt?: string;
  developerApproved: boolean;
  developerApprovedBy?: string;
  developerApprovedAt?: string;
  status?: 'pending' | 'admin_approved' | 'developer_approved' | 'rejected';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'therapist' | 'parent';
  registeredAt: string;
  adminApproved: boolean;
  adminApprovedBy?: string;
  adminApprovedAt?: string;
  developerApproved: boolean;
  developerApprovedBy?: string;
  developerApprovedAt?: string;
  devices: string[]; // Device IDs
  status: 'pending' | 'admin_approved' | 'developer_approved' | 'suspended';
  isApproved?: boolean; // 호환성
}

export interface AccessLog {
  id: string;
  userId: string;
  deviceId: string;
  timestamp: string;
  action: 'login' | 'logout' | 'access_denied';
  reason?: string;
}

/**
 * 디바이스 ID 생성 (브라우저 핑거프린팅)
 */
export function generateDeviceId(): string {
  const navigator_ = typeof navigator !== 'undefined' ? navigator : null;
  const screen_ = typeof screen !== 'undefined' ? screen : null;

  const components = [
    navigator_?.userAgent || 'unknown',
    navigator_?.language || 'unknown',
    screen_?.width || 0,
    screen_?.height || 0,
    screen_?.colorDepth || 0,
    new Date().getTimezoneOffset(),
    navigator_?.hardwareConcurrency || 0,
  ];

  return btoa(components.join('|')).slice(0, 32);
}

/**
 * 사용자의 IP 주소 가져오기
 */
export async function getUserIpAddress(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

/**
 * 저장된 디바이스 정보 가져오기
 */
export function getSavedDevice(): Device | null {
  try {
    const saved = localStorage.getItem('akms_device');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/**
 * 디바이스 정보 저장 (현재 디바이스)
 */
export async function saveDevice(device: Device): Promise<void> {
  localStorage.setItem('akms_device', JSON.stringify(device));

  // Also add to devices list for admin approval
  try {
    const devices = JSON.parse(localStorage.getItem('akms_devices') || '[]');
    const existingIndex = devices.findIndex((d: Device) => d.id === device.id);
    if (existingIndex >= 0) {
      devices[existingIndex] = device;
    } else {
      devices.push(device);
    }
    localStorage.setItem('akms_devices', JSON.stringify(devices));
  } catch (err) {
    console.error('Failed to update devices list:', err);
  }
}

/**
 * 디바이스 정보 삭제
 */
export function clearDevice(): void {
  localStorage.removeItem('akms_device');
}

/**
 * 로그아웃 (현재 세션 정보 삭제)
 */
export function logout(): void {
  clearDevice();
  localStorage.removeItem('akms_user');
  window.location.href = '/login';
}

/**
 * 저장된 사용자 정보 가져오기
 */
export function getSavedUser(): User | null {
  try {
    const saved = localStorage.getItem('akms_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/**
 * 사용자 정보 저장 (현재 사용자)
 */
export function saveUser(user: User): Promise<void> {
  localStorage.setItem('akms_user', JSON.stringify(user));

  // Also add to users list for admin approval
  try {
    const users = JSON.parse(localStorage.getItem('akms_users') || '[]');
    const existingIndex = users.findIndex((u: User) => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem('akms_users', JSON.stringify(users));
  } catch (err) {
    console.error('Failed to update users list:', err);
  }

  return Promise.resolve();
}

/**
 * 접근 로그 기록
 */
export function logAccess(log: AccessLog): void {
  try {
    const logs = JSON.parse(localStorage.getItem('akms_access_logs') || '[]');
    logs.push(log);
    // 최근 1000개만 유지
    if (logs.length > 1000) {
      logs.shift();
    }
    localStorage.setItem('akms_access_logs', JSON.stringify(logs));
  } catch {
    console.error('Failed to log access');
  }
}

/**
 * 접근 로그 조회
 */
export function getAccessLogs(): AccessLog[] {
  try {
    return JSON.parse(localStorage.getItem('akms_access_logs') || '[]');
  } catch {
    return [];
  }
}

/**
 * 디바이스 및 사용자 검증 (2단계 승인)
 */
export async function verifyAccess(userId: string, deviceId: string): Promise<boolean> {
  const user = getSavedUser();
  const device = getSavedDevice();

  if (!user) {
    logAccess({
      id: `log-${Date.now()}`,
      userId,
      deviceId,
      timestamp: new Date().toISOString(),
      action: 'access_denied',
      reason: '사용자 정보 없음',
    });
    return false;
  }

  // Check against all users to see if this user is approved by BOTH admin and developer
  try {
    const allUsers = JSON.parse(localStorage.getItem('akms_users') || '[]') as User[];
    const approvedUser = allUsers.find(u => u.id === user.id);

    if (!approvedUser) {
      logAccess({
        id: `log-${Date.now()}`,
        userId,
        deviceId,
        timestamp: new Date().toISOString(),
        action: 'access_denied',
        reason: '사용자 정보 없음',
      });
      return false;
    }

    // 관리자 승인 확인
    if (!approvedUser.adminApproved) {
      logAccess({
        id: `log-${Date.now()}`,
        userId,
        deviceId,
        timestamp: new Date().toISOString(),
        action: 'access_denied',
        reason: '관리자 승인 대기 중',
      });
      return false;
    }

    // 개발자 승인 확인
    if (!approvedUser.developerApproved) {
      logAccess({
        id: `log-${Date.now()}`,
        userId,
        deviceId,
        timestamp: new Date().toISOString(),
        action: 'access_denied',
        reason: '개발자 최종 승인 대기 중',
      });
      return false;
    }

    // 상태 확인
    if (approvedUser.status === 'suspended') {
      logAccess({
        id: `log-${Date.now()}`,
        userId,
        deviceId,
        timestamp: new Date().toISOString(),
        action: 'access_denied',
        reason: '사용자가 중단되었음',
      });
      return false;
    }
  } catch (err) {
    logAccess({
      id: `log-${Date.now()}`,
      userId,
      deviceId,
      timestamp: new Date().toISOString(),
      action: 'access_denied',
      reason: '사용자 검증 실패',
    });
    return false;
  }

  if (!device) {
    logAccess({
      id: `log-${Date.now()}`,
      userId,
      deviceId,
      timestamp: new Date().toISOString(),
      action: 'access_denied',
      reason: '디바이스 정보 없음',
    });
    return false;
  }

  // Check against all devices to see if this device is approved by BOTH admin and developer
  try {
    const allDevices = JSON.parse(localStorage.getItem('akms_devices') || '[]') as Device[];
    const approvedDevice = allDevices.find(d => d.id === device.id);

    if (!approvedDevice) {
      logAccess({
        id: `log-${Date.now()}`,
        userId,
        deviceId,
        timestamp: new Date().toISOString(),
        action: 'access_denied',
        reason: '디바이스 정보 없음',
      });
      return false;
    }

    // 관리자 승인 확인
    if (!approvedDevice.adminApproved) {
      logAccess({
        id: `log-${Date.now()}`,
        userId,
        deviceId,
        timestamp: new Date().toISOString(),
        action: 'access_denied',
        reason: '관리자 승인 대기 중',
      });
      return false;
    }

    // 개발자 승인 확인
    if (!approvedDevice.developerApproved) {
      logAccess({
        id: `log-${Date.now()}`,
        userId,
        deviceId,
        timestamp: new Date().toISOString(),
        action: 'access_denied',
        reason: '개발자 최종 승인 대기 중',
      });
      return false;
    }
  } catch (err) {
    logAccess({
      id: `log-${Date.now()}`,
      userId,
      deviceId,
      timestamp: new Date().toISOString(),
      action: 'access_denied',
      reason: '디바이스 검증 실패',
    });
    return false;
  }

  if (!user.devices.includes(device.id)) {
    logAccess({
      id: `log-${Date.now()}`,
      userId,
      deviceId,
      timestamp: new Date().toISOString(),
      action: 'access_denied',
      reason: '사용자의 디바이스가 아님',
    });
    return false;
  }

  logAccess({
    id: `log-${Date.now()}`,
    userId,
    deviceId,
    timestamp: new Date().toISOString(),
    action: 'login',
  });

  return true;
}

/**
 * 알림 추가
 */
export function addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): void {
  const notifications = getNotifications();
  notifications.push({
    ...notification,
    id: `notif-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
  });
  // 최근 100개만 유지
  localStorage.setItem('akms_notifications', JSON.stringify(notifications.slice(-100)));
}

/**
 * 알림 조회
 */
export function getNotifications(): Notification[] {
  try {
    return JSON.parse(localStorage.getItem('akms_notifications') || '[]');
  } catch {
    return [];
  }
}
