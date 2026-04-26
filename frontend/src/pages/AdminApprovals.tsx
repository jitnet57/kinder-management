import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, Clock, Loader, User as UserIcon } from 'lucide-react';
import {
  getSavedUser,
  getSavedDevice,
  User,
  Device,
} from '../utils/deviceManager';

export function AdminApprovals() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'developer' | null>(null);
  const [filter, setFilter] = useState<'pending' | 'partial' | 'approved' | 'all'>('pending');
  const [approveInfo, setApproveInfo] = useState<{ userId?: string; deviceId?: string } | null>(null);
  const [allApproved, setAllApproved] = useState(false);

  useEffect(() => {
    const currentUser = getSavedUser();
    if (currentUser?.role === 'admin') {
      setUserRole('admin');
    } else {
      // Non-admin users are developers who can approve
      setUserRole('developer');
    }
    loadPendingItems();
  }, []);

  // 현재 사용자의 모든 승인 여부 확인
  useEffect(() => {
    if (allApproved) {
      const timer = setTimeout(() => {
        console.log('✅ 모든 승인 완료 - 대시보드로 이동');
        navigate('/dashboard', { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allApproved, navigate]);

  // 사용자와 디바이스의 승인 상태 확인
  const checkApprovalStatus = (usersList: User[], devicesList: Device[]) => {
    const currentUser = getSavedUser();
    if (!currentUser) return;

    const user = usersList.find(u => u.id === currentUser.id);
    const devices = devicesList.filter(d => currentUser.devices?.includes(d.id));

    if (user && devices.length > 0) {
      const userApproved = user.adminApproved && user.developerApproved;
      const allDevicesApproved = devices.every(d => d.adminApproved && d.developerApproved);

      if (userApproved && allDevicesApproved) {
        console.log('✅ 사용자와 모든 디바이스 승인됨');
        setAllApproved(true);
      }
    }
  };

  const loadPendingItems = () => {
    setLoading(true);
    try {
      // Get all users from localStorage
      const allUsers = JSON.parse(localStorage.getItem('akms_users') || '[]') as User[];
      setUsers(allUsers);

      // Get all devices from localStorage
      const allDevices = JSON.parse(localStorage.getItem('akms_devices') || '[]') as Device[];
      setDevices(allDevices);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveUserAsAdmin = (userId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          adminApproved: true,
          adminApprovedBy: 'admin',
          adminApprovedAt: new Date().toISOString(),
          status: 'admin_approved' as const,
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('akms_users', JSON.stringify(updatedUsers));

    // 현재 세션도 업데이트 (중요!)
    const currentUser = getSavedUser();
    if (currentUser && currentUser.id === userId) {
      const updatedSessionUser = { ...currentUser, adminApproved: true, adminApprovedBy: 'admin', adminApprovedAt: new Date().toISOString(), status: 'admin_approved' as const };
      localStorage.setItem('akms_user', JSON.stringify(updatedSessionUser));
      console.log('✅ 세션 사용자 업데이트:', updatedSessionUser);
    }

    setApproveInfo(null);
    checkApprovalStatus(updatedUsers, devices);
  };

  const approveUserAsDeveloper = (userId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          developerApproved: true,
          developerApprovedBy: 'developer',
          developerApprovedAt: new Date().toISOString(),
          status: 'developer_approved' as const,
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('akms_users', JSON.stringify(updatedUsers));

    // 현재 세션도 업데이트 (중요!)
    const currentUser = getSavedUser();
    if (currentUser && currentUser.id === userId) {
      const updatedSessionUser = { ...currentUser, developerApproved: true, developerApprovedBy: 'developer', developerApprovedAt: new Date().toISOString(), status: 'developer_approved' as const };
      localStorage.setItem('akms_user', JSON.stringify(updatedSessionUser));
      console.log('✅ 세션 사용자 업데이트:', updatedSessionUser);
    }

    setApproveInfo(null);
    checkApprovalStatus(updatedUsers, devices);
  };

  const rejectUser = (userId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'suspended' as const,
          adminApproved: false,
          developerApproved: false,
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('akms_users', JSON.stringify(updatedUsers));
  };

  const approveDeviceAsAdmin = (deviceId: string) => {
    const updatedDevices = devices.map(d => {
      if (d.id === deviceId) {
        return {
          ...d,
          adminApproved: true,
          adminApprovedBy: 'admin',
          adminApprovedAt: new Date().toISOString(),
          status: 'admin_approved' as const,
        };
      }
      return d;
    });

    setDevices(updatedDevices);
    localStorage.setItem('akms_devices', JSON.stringify(updatedDevices));

    // 현재 세션도 업데이트 (중요!)
    const currentDevice = getSavedDevice();
    if (currentDevice && currentDevice.id === deviceId) {
      const updatedSessionDevice = { ...currentDevice, adminApproved: true, adminApprovedBy: 'admin', adminApprovedAt: new Date().toISOString(), status: 'admin_approved' as const };
      localStorage.setItem('akms_device', JSON.stringify(updatedSessionDevice));
      console.log('✅ 세션 디바이스 업데이트:', updatedSessionDevice);
    }

    setApproveInfo(null);
    checkApprovalStatus(users, updatedDevices);
  };

  const approveDeviceAsDeveloper = (deviceId: string) => {
    const updatedDevices = devices.map(d => {
      if (d.id === deviceId) {
        return {
          ...d,
          developerApproved: true,
          developerApprovedBy: 'developer',
          developerApprovedAt: new Date().toISOString(),
          status: 'developer_approved' as const,
          isApproved: true, // 호환성
        };
      }
      return d;
    });

    setDevices(updatedDevices);
    localStorage.setItem('akms_devices', JSON.stringify(updatedDevices));

    // 현재 세션도 업데이트 (중요!)
    const currentDevice = getSavedDevice();
    if (currentDevice && currentDevice.id === deviceId) {
      const updatedSessionDevice = { ...currentDevice, developerApproved: true, developerApprovedBy: 'developer', developerApprovedAt: new Date().toISOString(), status: 'developer_approved' as const, isApproved: true };
      localStorage.setItem('akms_device', JSON.stringify(updatedSessionDevice));
      console.log('✅ 세션 디바이스 업데이트:', updatedSessionDevice);
    }

    setApproveInfo(null);
    checkApprovalStatus(users, updatedDevices);
  };

  const rejectDevice = (deviceId: string) => {
    const updatedDevices = devices.map(d => {
      if (d.id === deviceId) {
        return {
          ...d,
          status: 'rejected' as const,
          adminApproved: false,
          developerApproved: false,
        };
      }
      return d;
    });
    setDevices(updatedDevices);
    localStorage.setItem('akms_devices', JSON.stringify(updatedDevices));
  };

  const getFilteredUsers = () => {
    if (filter === 'pending') return users.filter(u => u.status === 'pending');
    if (filter === 'partial') return users.filter(u => u.status === 'admin_approved');
    if (filter === 'approved') return users.filter(u => u.status === 'developer_approved');
    return users;
  };

  const getFilteredDevices = () => {
    if (filter === 'pending') return devices.filter(d => d.status === 'pending');
    if (filter === 'partial') return devices.filter(d => d.status === 'admin_approved');
    if (filter === 'approved') return devices.filter(d => d.status === 'developer_approved');
    return devices;
  };

  const filteredUsers = getFilteredUsers();
  const filteredDevices = getFilteredDevices();

  if (allApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-purple to-pastel-pink flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-12 max-w-md w-full text-center">
          <CheckCircle2 size={64} className="mx-auto text-green-500 mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">모든 승인 완료! 🎉</h2>
          <p className="text-gray-600 mb-6">
            대시보드로 이동 중입니다...
          </p>
          <div className="animate-spin">
            <Loader size={32} className="mx-auto text-pastel-purple" />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <Loader className="animate-spin text-pastel-purple" size={32} />
        </div>
      </div>
    );
  }

  // 현재 사용자의 모든 디바이스가 승인되었는지 확인
  const currentUser = getSavedUser();
  const userApproved = currentUser && users.find(u => u.id === currentUser.id)?.adminApproved && users.find(u => u.id === currentUser.id)?.developerApproved;
  const allUserDevicesApproved = currentUser && currentUser.devices && devices.filter(d => currentUser.devices?.includes(d.id)).every(d => d.adminApproved && d.developerApproved);
  const canAccessDashboard = userApproved && allUserDevicesApproved && currentUser.devices && devices.filter(d => currentUser.devices?.includes(d.id)).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">👨‍💼 승인 관리</h1>
              <p className="text-gray-600">
                {userRole === 'admin'
                  ? '1단계: 관리자 승인 후 2단계: 개발자 최종 승인이 필요합니다'
                  : '2단계: 개발자 최종 승인을 진행합니다'}
              </p>
            </div>
            {canAccessDashboard && (
              <button
                onClick={() => {
                  console.log('✅ 대시보드로 이동 (새로고침)');
                  window.location.href = '/dashboard';
                }}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center gap-2"
              >
                <CheckCircle2 size={20} />
                대시보드로 이동
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['pending', 'partial', 'approved', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === tab
                  ? 'bg-pastel-purple text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab === 'pending' && '⏳ 대기중'}
              {tab === 'partial' && '📋 관리자 승인됨'}
              {tab === 'approved' && '✅ 최종 승인됨'}
              {tab === 'all' && '📋 전체'}
            </button>
          ))}
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <UserIcon size={24} className="text-pastel-purple" />
            사용자 ({filteredUsers.length})
          </h2>

          {filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">해당하는 사용자가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{user.email}</h3>
                      <p className="text-sm text-gray-600">{user.name} • {user.role}</p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        {user.adminApproved ? (
                          <span className="flex items-center gap-1 text-green-600 font-semibold">
                            <CheckCircle2 size={16} /> 관리자 ✅
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                            <Clock size={16} /> 관리자 ⏳
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {user.developerApproved ? (
                          <span className="flex items-center gap-1 text-green-600 font-semibold">
                            <CheckCircle2 size={16} /> 개발자 ✅
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                            <Clock size={16} /> 개발자 ⏳
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <p className="text-gray-600">등록일</p>
                      <p className="font-mono text-gray-800">
                        {new Date(user.registeredAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">디바이스 수</p>
                      <p className="font-semibold text-gray-800">{user.devices.length}개</p>
                    </div>
                  </div>

                  {user.status !== 'suspended' && (
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      {/* 관리자 승인 */}
                      {userRole === 'admin' && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="font-semibold text-blue-900 mb-3">1단계: 관리자 승인</p>
                          {!user.adminApproved ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => approveUserAsAdmin(user.id)}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                              >
                                <CheckCircle2 size={18} />
                                관리자 승인
                              </button>
                              <button
                                onClick={() => rejectUser(user.id)}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                              >
                                <XCircle size={18} />
                                거부
                              </button>
                            </div>
                          ) : (
                            <p className="text-green-700 font-semibold">✅ 관리자 승인 완료</p>
                          )}
                        </div>
                      )}

                      {/* 개발자 승인 */}
                      {user.adminApproved && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="font-semibold text-purple-900 mb-3">2단계: 개발자 최종 승인</p>
                          {!user.developerApproved ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => approveUserAsDeveloper(user.id)}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                              >
                                <CheckCircle2 size={18} />
                                최종 승인
                              </button>
                              <button
                                onClick={() => rejectUser(user.id)}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                              >
                                <XCircle size={18} />
                                거부
                              </button>
                            </div>
                          ) : (
                            <p className="text-green-700 font-semibold">✅ 최종 승인 완료</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {user.status === 'suspended' && (
                    <div className="mt-4 p-3 bg-red-100 rounded-lg text-red-700 text-sm">
                      🚫 이 사용자는 거부되었습니다.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devices Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle size={24} className="text-pastel-purple" />
            디바이스 ({filteredDevices.length})
          </h2>

          {filteredDevices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">해당하는 디바이스가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {filteredDevices.map((device) => (
                <div key={device.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 font-mono break-all">
                        {device.id.slice(0, 16)}...
                      </h3>
                      <p className="text-sm text-gray-600">{device.name}</p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        {device.adminApproved ? (
                          <span className="flex items-center gap-1 text-green-600 font-semibold">
                            <CheckCircle2 size={16} /> 관리자 ✅
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                            <Clock size={16} /> 관리자 ⏳
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {device.developerApproved ? (
                          <span className="flex items-center gap-1 text-green-600 font-semibold">
                            <CheckCircle2 size={16} /> 개발자 ✅
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                            <Clock size={16} /> 개발자 ⏳
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">IP 주소</p>
                      <p className="font-mono text-gray-800">{device.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">등록일</p>
                      <p className="font-mono text-gray-800">
                        {new Date(device.registeredAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 text-sm">
                    <p className="text-gray-600">브라우저</p>
                    <p className="font-mono text-gray-700 text-xs break-all">{device.userAgent}</p>
                  </div>

                  {device.status !== 'rejected' && (
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      {/* 관리자 승인 */}
                      {userRole === 'admin' && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="font-semibold text-blue-900 mb-3">1단계: 관리자 승인</p>
                          {!device.adminApproved ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => approveDeviceAsAdmin(device.id)}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                              >
                                <CheckCircle2 size={18} />
                                관리자 승인
                              </button>
                              <button
                                onClick={() => rejectDevice(device.id)}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                              >
                                <XCircle size={18} />
                                거부
                              </button>
                            </div>
                          ) : (
                            <p className="text-green-700 font-semibold">✅ 관리자 승인 완료</p>
                          )}
                        </div>
                      )}

                      {/* 개발자 승인 */}
                      {device.adminApproved && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="font-semibold text-purple-900 mb-3">2단계: 개발자 최종 승인</p>
                          {!device.developerApproved ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => approveDeviceAsDeveloper(device.id)}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                              >
                                <CheckCircle2 size={18} />
                                최종 승인
                              </button>
                              <button
                                onClick={() => rejectDevice(device.id)}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                              >
                                <XCircle size={18} />
                                거부
                              </button>
                            </div>
                          ) : (
                            <p className="text-green-700 font-semibold">✅ 최종 승인 완료</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {device.status === 'rejected' && (
                    <div className="mt-4 p-3 bg-red-100 rounded-lg text-red-700 text-sm">
                      🚫 이 디바이스는 거부되었습니다.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
