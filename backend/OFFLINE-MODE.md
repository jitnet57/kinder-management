# 오프라인 모드 지원 | 인터넷 없이 작동

**작성**: 2026-04-26  
**목표**: 인터넷 연결 유무와 관계없이 시스템이 계속 작동하고 데이터를 안전하게 보관

---

## 1. 오프라인 지원 아키텍처

```
┌─────────────────────────────────────────────────┐
│        Kinder ABA 관리 시스템                    │
├─────────────────────────────────────────────────┤
│                                                │
│  🖥️ 로컬 호스팅                                 │
│  ├─ React SPA (로컬 서버에서 실행)             │
│  ├─ Hono 백엔드 (로컬 머신에서 실행)           │
│  └─ PostgreSQL (로컬 DB)                      │
│                                                │
│  💾 로컬 저장소                                 │
│  ├─ LocalStorage (세션, 설정)                 │
│  ├─ IndexedDB (캐시 데이터)                   │
│  └─ 파일시스템 (백업, 내보내기)                │
│                                                │
└─────────────────────────────────────────────────┘
        ↓ 인터넷 연결 불필요
```

---

## 2. 백엔드 | 로컬 저장 + 오프라인 백업

### 2.1 PostgreSQL 데이터베이스 (로컬)

```
설정:
- 호스트: localhost:5432
- 데이터베이스: kinder_local
- 사용자: kinder_user
- 암호: .env.local에 저장

접근:
- 같은 네트워크 내: localhost:5432
- 다른 머신에서: {IP_ADDRESS}:5432
```

### 2.2 Hono 백엔드 서버

```typescript
// .env.local 예시
DATABASE_URL=postgresql://kinder_user:password@localhost:5432/kinder_local
NODE_ENV=production
PORT=3000
BACKUP_DIR=C:\kinder-backups\daily  # Windows
BACKUP_DIR=/var/kinder-backups/daily # Linux/Mac
```

**실행:**
```bash
# 개발
npm run dev:backend

# 프로덕션 (오프라인)
npm run start:backend
```

### 2.3 일자별 자동 백업 (인터넷 불필요)

```typescript
// ✅ 순전히 로컬 저장
매일 자정 → PostgreSQL 덤프 → tar.gz 압축 → 로컬 폴더에 저장
              (인터넷 X)        (인터넷 X)       (인터넷 X)

예:
C:\kinder-backups\daily\
├─ kinder-backup-2026-04-26.tar.gz  (50MB)
├─ kinder-backup-2026-04-25.tar.gz
├─ kinder-backup-2026-04-24.tar.gz
└─ backup.log  (로그)
```

### 2.4 관리자 API (로컬)

```
오프라인에서도 작동:

GET  /api/admin/backup/status
     → 로컬 백업 파일 스캔, 최근 백업 시간 표시

GET  /api/admin/backup/history
     → 로컬 파일시스템에서 백업 이력 조회

POST /api/admin/backup/trigger
     → 수동 백업 실행 (인터넷 불필요)
```

---

## 3. 프론트엔드 | 오프라인 캐싱 + 동기화

### 3.1 LocalStorage 캐싱

```typescript
// 자동 캐싱 (API 응답)
const cacheKey = `kinder_${endpoint}`;
localStorage.setItem(cacheKey, JSON.stringify(data));

// 오프라인 시 캐시 사용
async function fetchWithFallback(endpoint) {
  try {
    // 온라인이면 최신 데이터
    return await fetch(`/api${endpoint}`);
  } catch (error) {
    // 오프라인이면 캐시 사용
    const cached = localStorage.getItem(`kinder_${endpoint}`);
    return cached ? JSON.parse(cached) : null;
  }
}
```

### 3.2 IndexedDB (대용량 캐시)

```typescript
// 필요한 경우 IndexedDB로 확장
class OfflineStore {
  async saveSession(childId, sessionData) {
    // 로컬 DB에 저장
  }

  async syncWhenOnline() {
    // 인터넷 복구 시 동기화
  }
}
```

### 3.3 Export (오프라인 가능)

```typescript
// Excel/Word export는 로컬에서 처리
// 클라우드 업로드 불필요

export async function exportToExcel() {
  const data = await getLocalData();
  return generateExcel(data);  // 클라이언트 측 생성
}
```

---

## 4. 네트워크 상태 감지

### 4.1 온/오프라인 표시

```typescript
// src/hooks/useOnlineStatus.ts
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('🌐 인터넷 복구됨');
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification('📴 오프라인 모드 (로컬 데이터만 사용)');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### 4.2 UI 피드백

```typescript
// 대시보드 우측 상단
{isOnline ? (
  <span>🌐 온라인</span>
) : (
  <span style={{ color: 'orange' }}>📴 오프라인 (로컬 데이터)</span>
)}
```

---

## 5. 배포 시나리오

### 시나리오 1: 로컬 호스팅 (오프라인 친화적)

```
관리자 컴퓨터:
├─ React SPA (포트 5173)
├─ Hono 백엔드 (포트 3000)
├─ PostgreSQL (포트 5432)
└─ 백업 폴더 (C:\kinder-backups\)

↓ 같은 LAN의 다른 기기에서 접속
http://{ADMIN_IP}:5173

✅ 인터넷 불필요
✅ 성능 우수 (로컬 네트워크)
✅ 데이터 주권 유지
```

### 시나리오 2: 클라우드 백업 (선택사항)

```
기본 (로컬만):
Daily → kinder-backup-*.tar.gz (로컬) ← 충분

추가 보안 (선택):
Daily → kinder-backup-*.tar.gz (로컬)
      ↓
      USB 드라이브 (주간 수동 복사)
      또는
      외장 HDD (월간 아카이브)
      또는
      NAS (선택적 네트워크 동기화)
```

---

## 6. 오프라인 체크리스트

### 개발 단계

- [ ] 모든 API 엔드포인트가 인터넷 없이 작동하는가?
- [ ] LocalStorage 캐싱이 설정되어 있는가?
- [ ] 오프라인/온라인 상태 감지가 구현되어 있는가?
- [ ] 네트워크 에러 시 폴백이 있는가?

### 배포 전

- [ ] 로컬 PostgreSQL 설정 문서 작성
- [ ] .env.local 템플릿 제공
- [ ] 백업 디렉토리 권한 설정 확인
- [ ] Windows/Mac/Linux 모두 테스트

### 운영

- [ ] 정기적으로 로컬 백업 상태 확인
- [ ] 월 1회 복구 테스트 (오프라인 상태)
- [ ] 네트워크 에러 로깅 및 모니터링
- [ ] 사용자 교육 (오프라인 모드 설명)

---

## 7. 사용자 가이드

### 설정 (관리자)

**1단계: Kinder ABA 시스템 실행**
```bash
# 백엔드 시작
cd backend
npm install
npm start

# 프론트엔드 시작 (새 터미널)
cd frontend
npm install
npm start
```

**2단계: 브라우저에서 접속**
```
http://localhost:5173
```

**3단계: 인터넷 연결 확인 (선택사항)**
```
- 온라인: 최신 데이터 동기화
- 오프라인: 로컬 캐시 사용 (자동)
```

### 일상 운영

**매일:**
- ✅ 자동 백업 (자정)
- ✅ 데이터 기록
- ✅ 보고서 생성

**주간:**
- 📋 백업 상태 확인
- 💾 USB 드라이브에 복사 (선택)

**월간:**
- 🔄 복구 테스트 (오프라인에서)
- 📊 백업 로그 검토

---

## 8. 트러블슈팅

### "API 연결 실패"
```
✅ 백엔드가 실행 중인가?
  npm run dev:backend (개발)
  또는
  npm start (프로덕션)

✅ 포트 3000이 사용 중인가?
  netstat -ano | findstr :3000  (Windows)
  lsof -i :3000                (Mac/Linux)
```

### "백업 디렉토리 접근 거부"
```
✅ 디렉토리 권한 확인
  Windows: C:\kinder-backups\ (관리자 쓰기 권한)
  Linux:   chmod 755 /var/kinder-backups/
  Mac:     chmod 755 ~/kinder-backups/

✅ BACKUP_DIR 환경 변수 설정
  .env.local: BACKUP_DIR=C:\kinder-backups\daily
```

### "로컬 데이터만 보임"
```
✅ 이것은 정상입니다 (오프라인 모드)
  └─ 인터넷 복구 시 온라인 모드로 전환

✅ 강제 새로고침
  Ctrl+Shift+R (또는 Cmd+Shift+R Mac)
```

---

## 9. 보안 고려사항

### 로컬 저장의 장점
- ✅ 데이터 주권 (외부 서버 불필요)
- ✅ 높은 성능 (네트워크 지연 없음)
- ✅ 인터넷 불필요 (자연재해 안전)

### 로컬 저장의 주의점
- ⚠️ 컴퓨터 물리적 보안 중요
- ⚠️ 하드디스크 고장 시 데이터 손실 위험
  → USB/HDD 정기 백업 권장
- ⚠️ 접근 제어 필요
  → 시스템 로그인 암호 설정

### 권장 사항

```
1단계: 로컬 시스템 강화
  - OS 업데이트 (보안 패치)
  - 방화벽 활성화
  - 로그인 암호 설정

2단계: 정기 백업
  - USB 드라이브 주간 복사
  - 외장 HDD 월간 아카이브
  - 오프사이트 보관 (선택)

3단계: 접근 제어
  - 관리자만 /backup/ 폴더 접근
  - 정기적인 권한 감시
  - 퇴직자 계정 삭제
```

---

## 10. 결론

**Kinder ABA는 완전한 오프라인 운영이 가능합니다:**

- ✅ 인터넷 없이 전체 기능 사용
- ✅ 자동 로컬 백업 (매일)
- ✅ 데이터 손실 방지 (30일 보관)
- ✅ 빠른 복구 (로컬 접근)
- ✅ 비용 절감 (클라우드 불필요)

**다만:**
- 컴퓨터 물리적 안전 필요
- 정기적인 외부 백업 권장
- 단일 장애점 대비 필요

---

**다음 단계**: Phase 4에서 구현 시작 → 월 1회 오프라인 복구 테스트
