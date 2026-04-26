# AKMS v1.0 빠른 시작 가이드

## 🚀 즉시 시작하기

### 1. 프로젝트 구조 확인

```
kinder-management/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx        # ✅ 로그인 페이지
│   │   │   ├── AdminApprovals.tsx # ✅ 관리자 승인 페이지
│   │   │   └── ... (기타 페이지)
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx  # ✅ 인증 보호 라우팅
│   │   │   ├── Layout.tsx          # ✅ 로그아웃 버튼 추가
│   │   │   └── ... (기타 컴포넌트)
│   │   ├── utils/
│   │   │   └── deviceManager.ts    # ✅ 디바이스 관리 유틸
│   │   ├── context/
│   │   │   └── CurriculumContext.tsx # ✅ 커리큘럼 데이터 로드
│   │   ├── data/
│   │   │   └── curriculum.json    # ✅ 252 LTO 데이터
│   │   ├── App.tsx                # ✅ 라우팅 업데이트
│   │   └── ... (기타 파일)
│   ├── package.json
│   ├── tsconfig.json
│   └── ... (설정 파일)
├── generate_curriculum.py         # ✅ 커리큘럼 생성 스크립트
├── USER_MANUAL.md                # ✅ 2500줄 사용자 메뉴얼
├── IMPLEMENTATION_SUMMARY.md      # ✅ 구현 보고서
└── QUICKSTART.md                 # 이 파일
```

### 2. 개발 환경 시작

```bash
# 1. 프론트엔드 디렉토리로 이동
cd frontend

# 2. 의존성 설치 (이미 완료된 경우 생략)
npm install

# 3. 개발 서버 시작
npm run dev
```

**출력 예시:**
```
VITE v5.x.x  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### 3. 브라우저에서 열기

1. `http://localhost:5173/` 열기
2. 로그인 페이지 표시됨

### 4. 첫 로그인 테스트

#### 관리자 계정 (테스트용)
```
이메일: admin@akms.com
비밀번호: admin123
```

#### 로그인 흐름
1. 이메일/비밀번호 입력
2. "로그인" 버튼 클릭
3. 디바이스 자동 등록
4. 승인 대기 화면 표시
   - 디바이스 ID 표시
   - IP 주소 표시
5. "👨‍💼 관리자 승인 페이지" 버튼 클릭
6. 관리자 승인 페이지로 이동
7. 사용자 및 디바이스 목록 조회
8. "승인" 버튼 클릭
9. 메인 대시보드 접근 가능

---

## 📋 주요 파일 및 기능

### 로그인 시스템

#### `frontend/src/pages/Login.tsx`
```typescript
// 테스트 계정
ADMIN_USERS = [{
  email: 'admin@akms.com',
  password: 'admin123',
  name: '관리자',
  role: 'admin'
}]

// 로그인 상태: 'initial' | 'pending_approval' | 'approved'
// 자동 디바이스 등록 및 IP 수집
```

### 관리자 승인 페이지

#### `frontend/src/pages/AdminApprovals.tsx`
```typescript
// 필터: 대기중 | 승인됨 | 전체
// 사용자 승인/거부
// 디바이스 승인/거부
// 실시간 상태 업데이트
```

### 디바이스 관리

#### `frontend/src/utils/deviceManager.ts`
```typescript
// 핵심 함수들:
generateDeviceId()               // 디바이스 ID 생성
getUserIpAddress()               // IP 주소 조회
verifyAccess(userId, deviceId)   // 접근 권한 검증
logout()                         // 로그아웃
```

### 라우팅 및 인증

#### `frontend/src/components/ProtectedRoute.tsx`
```typescript
// 모든 페이지를 보호합니다
<ProtectedRoute>
  <Page />
</ProtectedRoute>

// 관리자 페이지만 추가 보호
<ProtectedRoute requireAdmin>
  <AdminPage />
</ProtectedRoute>
```

### 커리큘럼 데이터

#### `frontend/src/data/curriculum.json`
```json
{
  "version": "1.0",
  "totalDomains": 14,
  "totalLTOs": 252,
  "domains": [...]
}

// 14개 도메인:
// 1. 요청(Mand)
// 2. 명명(Tact)
// 3. 상호언어(Intraverbal)
// ... (11개 더)
```

---

## 🔍 테스트 시나리오

### 시나리오 1: 신규 사용자 온보딩

```
1. 브라우저에서 http://localhost:5173 접속
2. 로그인 페이지 표시
3. admin@akms.com / admin123 입력
4. "로그인" 클릭
5. 디바이스 자동 등록
6. "승인 대기 중" 화면 표시
7. "👨‍💼 관리자 승인 페이지" 클릭
8. 관리자 승인 페이지 열기
   - 대기중 탭에서 새 사용자 보이기
   - "✅ 승인" 버튼 클릭
9. 메인 대시보드 접근 가능
10. 로그아웃 버튼으로 로그아웃 가능
```

### 시나리오 2: 재로그인

```
1. 로그인 페이지에서 admin@akms.com / admin123 입력
2. "로그인" 클릭
3. 이미 승인된 디바이스 → 바로 대시보드로 이동 ✅
```

### 시나리오 3: 커리큘럼 페이지 확인

```
1. 대시보드에서 "커리큘럼" 클릭
2. 14개 도메인 표시:
   - 요청(Mand) - 18개 LTO
   - 명명(Tact) - 18개 LTO
   - ... (12개 더)
3. 각 도메인을 클릭하면 LTO 목록 표시
4. 각 LTO를 클릭하면:
   - LTO 이름 및 목표
   - 4개 STO 표시
   - 교수 팁 표시
```

---

## 🛠️ 빌드 및 배포

### 개발 빌드

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

**출력:**
```
✓ built in 234ms
```

생성 파일: `dist/` 디렉토리

### Cloudflare Pages 배포

```bash
# 1. Cloudflare에 로그인
wrangler login

# 2. Pages 배포
wrangler pages deploy dist/

# 또는 GitHub 연동으로 자동 배포
```

---

## 📊 데이터 흐름

```
사용자 입력 (이메일/비밀번호)
    ↓
localStorage에 저장
    ↓
deviceManager.ts에서 검증
    ↓
승인 상태 확인
    ↓
승인됨 → 대시보드 접근 ✅
대기중 → 승인 대기 화면
거부됨 → 로그인 거부
    ↓
sessionTask/completionTask 로드
    ↓
CurriculumContext에서 curriculum.json 로드
    ↓
14 도메인 × 252 LTO 표시
```

---

## 🔐 보안 확인사항

### ✅ 구현된 보안 기능

- [x] 디바이스 ID 자동 생성 (브라우저 핑거프린팅)
- [x] IP 주소 자동 수집
- [x] 사용자 승인 필수
- [x] 디바이스 승인 필수
- [x] 모든 접근 로그 기록
- [x] 로그아웃 기능
- [x] ProtectedRoute로 인증 검증
- [x] 관리자 전용 페이지 보호

### ⚠️ 프로덕션 배포 전 확인

- [ ] 실제 사용자 계정 시스템 연동 필요
- [ ] 백엔드 API 서버 필요
- [ ] 데이터베이스 (MongoDB/PostgreSQL) 필요
- [ ] HTTPS 활성화
- [ ] 비밀번호 해싱 구현
- [ ] 세션 관리 개선 (서버 세션 추천)
- [ ] CORS 설정
- [ ] Rate limiting 구현

---

## 📱 응답형 디자인

모든 페이지가 모바일 친화적으로 설계되었습니다:

```
데스크톱 (1200px+)    태블릿 (768px-1199px)   모바일 (< 768px)
├─ 사이드바 표시      ├─ 축소된 사이드바      ├─ 햄버거 메뉴
├─ 풀 레이아웃        ├─ 조정된 레이아웃      ├─ 스택 레이아웃
└─ 모든 정보 표시     └─ 최적화된 정보        └─ 필수 정보만
```

---

## 🎨 색상 스키마

```
주색상:
- 보라색 (pastel-purple): #C084FC - 메인 UI
- 분홍색 (pastel-pink): #F472B6 - 강조색

상태:
- 초록색: 승인됨 / 완료
- 노란색: 대기중
- 빨간색: 거부됨 / 오류

차트:
- 하늘색, 주황색, 초록색 등 다양한 색상
```

---

## 🐛 문제 해결

### 로그인 페이지가 표시되지 않음

```bash
# 1. 개발 서버 확인
npm run dev

# 2. http://localhost:5173 접속 (포트 확인)

# 3. 브라우저 콘솔 확인 (F12 → Console)
```

### 승인 후 로그인이 안 됨

```bash
# 1. 브라우저 캐시 삭제
# Ctrl+Shift+Delete

# 2. 다시 로그인 시도

# 3. localStorage 확인
# F12 → Application → Local Storage → http://localhost:5173
# akms_user와 akms_device 확인
```

### 커리큘럼 데이터가 로드되지 않음

```bash
# 1. curriculum.json 파일 확인
ls frontend/src/data/curriculum.json

# 2. 파일이 없으면 다시 생성
python generate_curriculum.py

# 3. 브라우저 콘솔 에러 확인
```

### 관리자 승인 페이지 접근 불가

```bash
# 1. 로그인한 사용자가 관리자(admin) 역할인지 확인
# 현재 테스트 계정: admin@akms.com (역할: admin)

# 2. /admin/approvals URL 직접 접속

# 3. 콘솔에서 에러 메시지 확인
```

---

## 📞 핵심 연락처 정보

| 항목 | 값 |
|------|---|
| **로컬 서버** | http://localhost:5173 |
| **관리자 이메일** | admin@akms.com |
| **관리자 비밀번호** | admin123 |
| **관리자 페이지** | /admin/approvals |
| **로그인 페이지** | /login |
| **메인 대시보드** | / |

---

## 📈 다음 단계

### 즉시 (현재)
- [x] 로그인 시스템 완성
- [x] 관리자 승인 인터페이스 완성
- [x] 252 LTO 데이터 생성
- [x] 사용자 메뉴얼 작성

### 단기 (1-2주)
- [ ] 백엔드 API 서버 구축
- [ ] 데이터베이스 설계 및 연동
- [ ] 실제 사용자 계정 연동
- [ ] 다중 역할 지원 (admin/therapist/parent)

### 중기 (1개월)
- [ ] 실시간 협업 기능
- [ ] 부모/치료사 메시징
- [ ] 실시간 알림
- [ ] 고급 데이터 분석

### 장기 (3-6개월)
- [ ] 모바일 앱 (iOS/Android)
- [ ] 머신러닝 기반 분석
- [ ] 국제화 (다언어 지원)
- [ ] 오프라인 모드

---

## ✅ 체크리스트

### 개발 환경
- [ ] Node.js 18+ 설치
- [ ] npm 의존성 설치
- [ ] 개발 서버 실행
- [ ] 브라우저에서 접속 가능

### 기능 테스트
- [ ] 로그인 페이지 표시
- [ ] 관리자 승인 페이지 접근
- [ ] 사용자 승인/거부 기능
- [ ] 디바이스 승인/거부 기능
- [ ] 로그아웃 기능
- [ ] 커리큘럼 페이지 로드
- [ ] 대시보드 표시

### 배포 준비
- [ ] npm run build 성공
- [ ] dist/ 폴더 생성됨
- [ ] Cloudflare Pages 계정 생성
- [ ] 배포 설정 완료

---

**마지막 업데이트**: 2024년 4월 26일  
**현재 버전**: v1.0.0  
**상태**: 🟢 준비 완료
