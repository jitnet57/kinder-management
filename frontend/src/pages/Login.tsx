import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import {
  generateDeviceId,
  getUserIpAddress,
  getSavedDevice,
  getSavedUser,
  saveDevice,
  saveUser,
  verifyAccess,
  Device,
  User,
} from '../utils/deviceManager';

const ALL_USERS = [
  {
    email: 'admin@akms.com',
    password: 'admin123',
    name: '관리자',
    role: 'admin' as const,
  },
  {
    email: 'therapist@akms.com',
    password: 'therapist123',
    name: '치료사1',
    role: 'therapist' as const,
  },
  {
    email: 'parent@akms.com',
    password: 'parent123',
    name: '학부모',
    role: 'parent' as const,
  },
];

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deviceInfo, setDeviceInfo] = useState<Device | null>(null);
  const [status, setStatus] = useState<'initial' | 'device_register' | 'pending_approval' | 'approved'>('initial');

  useEffect(() => {
    checkExistingLogin();
  }, []);

  // 승인 완료 후 대시보드로 이동
  useEffect(() => {
    if (status === 'approved') {
      const timer = setTimeout(() => {
        console.log('✅ 대시보드로 이동');
        navigate('/dashboard', { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const checkExistingLogin = async () => {
    // 개발 환경에서는 로그인 페이지에서 자동 리다이렉트 비활성화
    // 사용자가 명시적으로 로그인하도록 유도
    const savedUser = getSavedUser();
    const savedDevice = getSavedDevice();

    if (savedUser && savedDevice) {
      const isValid = await verifyAccess(savedUser.id, savedDevice.id);
      if (!isValid) {
        setError('저장된 사용자 또는 디바이스가 승인되지 않았습니다.');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 로그인 시작...');
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 자동으로 admin 계정으로 로그인 (입력값 무시)
      console.log('🔓 자동 로그인 - 입력 검증 스킵');
      const user = ALL_USERS[0];  // 항상 admin 계정 사용

      console.log('✅ 자동 로그인 완료');

      // 디바이스 정보 수집
      console.log('📱 디바이스 정보 수집 중...');
      const deviceId = generateDeviceId();
      const ipAddress = await getUserIpAddress();

      const newDevice: Device = {
        id: deviceId,
        name: `${navigator.platform} - ${new Date().toLocaleDateString()}`,
        userAgent: navigator.userAgent,
        ipAddress,
        registeredAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
        adminApproved: false,
        developerApproved: false,
        isApproved: false,
        status: 'pending',
      };

      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name: user.name,
        role: user.role,
        registeredAt: new Date().toISOString(),
        adminApproved: false,
        developerApproved: false,
        devices: [deviceId],
        status: 'pending',
      };

      setDeviceInfo(newDevice);

      // 저장 (아직 승인 안 됨)
      console.log('💾 데이터 저장 중...');
      await saveDevice(newDevice);
      await saveUser(newUser);
      console.log('✅ 데이터 저장 완료');

      // 즉시 승인된 상태로 저장 (승인 프로세스 완전 스킵)
      console.log('⚡ 테스트 모드: 승인 없이 즉시 진입');

      const approvedUser = {
        ...newUser,
        adminApproved: true,
        developerApproved: true,
        status: 'approved'
      };

      const approvedDevice = {
        ...newDevice,
        adminApproved: true,
        developerApproved: true,
        isApproved: true,
        status: 'approved'
      };

      const allUsers = JSON.parse(localStorage.getItem('akms_users') || '[]');
      const allDevices = JSON.parse(localStorage.getItem('akms_devices') || '[]');

      allUsers.push(approvedUser);
      allDevices.push(approvedDevice);

      localStorage.setItem('akms_users', JSON.stringify(allUsers));
      localStorage.setItem('akms_devices', JSON.stringify(allDevices));

      console.log('✅ 승인된 상태로 저장 완료');
      setStatus('approved');

      // 즉시 대시보드로 이동
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);

    } catch (err) {
      console.log('❌ 에러:', err);
      setError('로그인 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-purple to-pastel-pink flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-12 max-w-md w-full text-center">
          <CheckCircle2 size={64} className="mx-auto text-green-500 mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">승인 완료! 🎉</h2>
          <p className="text-gray-600 mb-6">
            디바이스가 승인되었습니다.<br />
            시스템에 접근합니다...
          </p>
          <div className="animate-spin">
            <Loader size={32} className="mx-auto text-pastel-purple" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'pending_approval') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-purple to-pastel-pink flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-12 max-w-md w-full">
          <AlertCircle size={64} className="mx-auto text-yellow-500 mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">승인 대기 중</h2>

          <div className="bg-white bg-opacity-50 rounded-xl p-6 mb-6 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-pastel-purple mt-1.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800">사용자</p>
                <p className="text-gray-600">{email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-pastel-purple mt-1.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800">디바이스</p>
                <p className="text-gray-600 break-all">{deviceInfo?.id.slice(0, 16)}...</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-pastel-purple mt-1.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800">IP 주소</p>
                <p className="text-gray-600">{deviceInfo?.ipAddress}</p>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 mb-6">
            관리자가 이 디바이스와 사용자를 확인한 후<br />
            승인하면 접근이 가능합니다.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => window.location.href = '/admin/approvals'}
              className="w-full px-4 py-3 bg-pastel-purple text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              👨‍💼 관리자 승인 페이지
            </button>
            <button
              onClick={() => {
                setStatus('initial');
                setEmail('');
                setPassword('');
                setSuccess('');
              }}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              뒤로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple to-pastel-pink flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-12 max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <Lock size={48} className="text-pastel-purple mr-3" />
          <h1 className="text-4xl font-bold text-gray-800">AKMS</h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">로그인</h2>
        <p className="text-center text-gray-600 mb-8">
          디바이스 인증 필수
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 rounded text-green-700 text-sm whitespace-pre-line">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value="admin@akms.com"
              placeholder="admin@akms.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple bg-gray-100"
              disabled={true}
            />
            <p className="text-xs text-gray-500 mt-1">자동 로그인 (입력 불필요)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value="admin123"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple bg-gray-100"
              disabled={true}
            />
            <p className="text-xs text-gray-500 mt-1">자동 로그인 (입력 불필요)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-pastel-purple text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '대시보드로 이동 중...' : '🚀 대시보드로 이동'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white border-opacity-30">
          <p className="text-xs text-gray-600 text-center mb-4">
            🔐 보안 정보
          </p>
          <div className="space-y-2 text-xs text-gray-600 bg-white bg-opacity-30 rounded-lg p-4">
            <p>✓ 처음 로그인하면 디바이스 등록</p>
            <p>✓ 관리자 승인 필수</p>
            <p>✓ 승인된 디바이스만 접근 가능</p>
            <p>✓ 모든 접근 기록 저장</p>
          </div>
        </div>
      </div>
    </div>
  );
}
