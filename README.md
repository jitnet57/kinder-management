# 🎓 AKMS (아동관리 ABA 데이터 시스템)

> **아동 교육/치료 기관을 위한 통합 ABA 데이터 관리 플랫폼**  
> *Kinder Management System for ABA-based Educational Institutions*

---

## 📖 프로젝트 개요

### 🎯 핵심 목표

응용행동분석(ABA: Applied Behavior Analysis) 기반 아동 교육/치료 기관에서 **주간 스케줄 관리, 아동 정보 관리, 일일 데이터 기록, 수준별 커리큘럼 관리**를 통합 운영할 수 있는 웹 기반 소프트웨어 솔루션입니다.

### ✨ 주요 기능

| 기능 | 설명 | 대상 사용자 |
|------|------|----------|
| **📅 주간 스케줄 관리** | 월-토 시간표 한눈에 보기, 아동별 색상 코딩, 시간 충돌 감지 | 관리자, 치료사 |
| **👶 아동정보 카드 관리** | 생년월일, 연락처, 주소, 이미지 첨부, CRUD 기능 | 관리자, 치료사, 부모 |
| **📊 일일 데이터 기록** | 세션별 과제 점수 입력(0-100), 7일 추세 그래프 시각화 | 치료사 |
| **🎓 계층형 커리큘럼** | 발달영역 → 장기목표(LTO) → 단기목표(STO) 구조 | 관리자, 치료사 |
| **📈 고급 분석 대시보드** | 행동 패턴 분석(ABC), 학습 속도 추적, 중재 효과 분석 | 관리자, 치료사 |
| **💬 협업 메시징** | 부모-치료사 실시간 피드백, 마일스톤 공유 | 부모, 치료사 |
| **✅ 완료목록 & 리포팅** | 세션 진행도 추적, 정기 보고서 생성 | 관리자, 부모 |

### 🔑 핵심 특징

- ✅ **다중 역할 지원** — 관리자, 치료사, 부모의 3가지 역할별 맞춤 인터페이스
- ✅ **오프라인 동작** — 클라우드 동기화 지원하는 PWA 구조
- ✅ **4-스트림 병렬 아키텍처** — 메시징, 분석, 협업, 배포 기능 동시 개발
- ✅ **252개 맞춤형 LTO** — 읽기, 쓰기, 수학 영역별 완전한 커리큘럼
- ✅ **타입 안전성** — TypeScript + Context API로 런타임 에러 방지
- ✅ **접근성 우선** — WCAG 2.1 AA 준수, 키보드 네비게이션 지원

---

## 🎨 스크린샷 가이드

> **주요 페이지 스크린샷 설명** (각 이미지는 `/docs/screenshots/` 디렉토리에 저장)

### 1️⃣ 로그인 페이지 (`/login`)
- 역할 선택 드롭다운 (Admin, Therapist, Parent)
- 이메일 & 비밀번호 입력
- 데모 계정 빠른 로그인

### 2️⃣ 대시보드 (`/dashboard`)
- 주간 스케줄 한눈에 보기
- 오늘의 세션 요약
- 빠른 통계 (아동 수, 완료율, 평균 점수)

### 3️⃣ 아동정보 관리 (`/children`)
- 카드형 그리드 (아동별 프로필)
- 상세정보 모달 (생년월일, 연락처, 첨부파일)
- 추가/수정/삭제 기능

### 4️⃣ 일일 기록 (`/schedule`)
- 월-토 시간표 (시간대별 아동 배치)
- 세션 선택 → 과제 입력 → 점수 저장
- 실시간 그래프 업데이트

### 5️⃣ 분석 페이지 (`/abc-analysis`, `/behavior-prediction`, 등)
- ABC 행동 분석 (Antecedent, Behavior, Consequence)
- 행동 패턴 예측 모델
- 중재 효과 분석 차트

### 6️⃣ 협업 메시징 (`/messages`)
- 아동별 대화방
- 피드백 특화 UI (증거, 실행 항목)
- 마일스톤 축하 알림

### 7️⃣ 부모 대시보드 (`/parent-dashboard`)
- 자녀 성장 추이 (주간, 월간)
- 마일스톤 기록
- 치료사 피드백 조회

---

## 🚀 빠른 시작 (5분 안에 시작하기)

### 사전 요구사항

```bash
# 필수 소프트웨어
- Node.js 18.x 이상
- npm 또는 yarn
- Git

# 선택 (배포용)
- Docker
- Vercel CLI
```

### 1️⃣ 저장소 클론 및 의존성 설치

```bash
# 저장소 클론
git clone https://github.com/jitnet57/kinder-management.git
cd kinder-management

# 의존성 설치
npm install

# (선택) 특정 패키지 설치
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 2️⃣ 환경 변수 설정

```bash
# 프로젝트 루트에서 .env.local 생성
cat > .env.local << 'EOF'
# 백엔드
DATABASE_URL=postgresql://user:password@localhost:5432/akms_dev
JWT_SECRET=your-super-secret-key-change-in-production
API_URL=http://localhost:3001

# 프론트엔드
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=AKMS
EOF
```

### 3️⃣ 데이터베이스 마이그레이션 (선택사항)

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed  # 샘플 데이터 추가
cd ..
```

### 4️⃣ 개발 서버 실행

```bash
# 루트 디렉토리에서
npm run dev

# 또는 개별 실행
# 터미널 1: 백엔드 (http://localhost:3001)
cd backend && npm run dev

# 터미널 2: 프론트엔드 (http://localhost:3000)
cd frontend && npm run dev
```

### 5️⃣ 로그인 및 확인

```
🌐 브라우저에서 http://localhost:3000 접속
📧 테스트 계정:
   - 관리자: admin@akms.local / password123
   - 치료사: therapist@akms.local / password123
   - 부모: parent@akms.local / password123
```

---

## 💻 기술 스택

### 프론트엔드

| 기술 | 용도 | 버전 |
|------|------|------|
| **React** | UI 프레임워크 | 18.x |
| **TypeScript** | 타입 안전성 | 5.x |
| **Context API** | 상태 관리 | Built-in |
| **Tailwind CSS** | 스타일링 | 3.x |
| **Recharts** | 데이터 시각화 | 2.x |
| **Vite** | 빌드 도구 | 4.x |

**설치된 주요 라이브러리:**

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "recharts": "^2.10.0",
  "react-icons": "^4.11.0",
  "zustand": "^4.4.0"
}
```

### 백엔드

| 기술 | 용도 | 버전 |
|------|------|------|
| **Node.js** | 런타임 | 18.x+ |
| **Hono** | 웹 프레임워크 | 3.x |
| **Prisma** | ORM | 5.x |
| **JWT** | 인증 | 9.x |
| **Zod** | 스키마 검증 | 3.x |

**설치된 주요 라이브러리:**

```json
{
  "hono": "^3.10.0",
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "jsonwebtoken": "^9.1.0",
  "zod": "^3.22.0"
}
```

### 데이터베이스

| 기술 | 용도 | 버전 |
|------|------|------|
| **PostgreSQL** | 기본 RDBMS | 14.x+ |
| **Prisma Migrations** | 스키마 관리 | Auto |
| **Redis** (선택) | 세션 캐싱 | 7.x |

### DevOps & 배포

| 기술 | 용도 | 특징 |
|------|------|------|
| **Vercel** | 프론트엔드 배포 | Zero-config |
| **Railway/Fly.io** | 백엔드 배포 | Docker support |
| **GitHub Actions** | CI/CD | 자동 테스트 & 배포 |
| **Cloudflare** | CDN & DNS | Edge caching |
| **Sentry** | 에러 추적 | 실시간 모니터링 |

---

## 📁 프로젝트 구조

```
kinder-management/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── pages/              # 라우트별 페이지 (15+ 페이지)
│   │   ├── components/         # 재사용 가능한 UI 컴포넌트
│   │   ├── context/            # Context API (8개 context)
│   │   ├── hooks/              # 커스텀 React 훅
│   │   ├── types/              # TypeScript 인터페이스
│   │   ├── utils/              # 유틸리티 함수
│   │   ├── data/               # 커리큘럼 데이터 (252 LTOs)
│   │   └── App.tsx
│   └── vite.config.ts
│
├── backend/                     # Node.js + Hono 백엔드
│   ├── src/
│   │   ├── routes/             # API 엔드포인트 (30+ 엔드포인트)
│   │   ├── middleware/         # 인증, 검증 미들웨어
│   │   ├── services/           # 비즈니스 로직
│   │   ├── types/              # TypeScript 인터페이스
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma       # 데이터베이스 스키마
│   │   └── migrations/         # DB 마이그레이션
│   └── package.json
│
├── docs/                        # 문서 디렉토리
│   ├── README.md               # 메인 문서 (이 파일)
│   ├── ARCHITECTURE.md         # 시스템 아키텍처
│   ├── USER_GUIDE.md           # 사용자 완전 가이드
│   ├── DEVELOPER_GUIDE.md      # 개발자 가이드
│   ├── DEPLOYMENT_GUIDE.md     # 배포 가이드
│   ├── API_REFERENCE.md        # API 레퍼런스
│   ├── FEATURES_CHECKLIST.md   # 기능 체크리스트
│   ├── CHANGELOG.md            # 변경 기록
│   └── screenshots/            # 스크린샷 (예정)
│
├── scripts/                     # 자동화 스크립트
├── .github/workflows/           # CI/CD 설정
└── package.json                 # 루트 패키지 설정
```

---

## 🔄 배포 및 설치 방법

### 개발 환경 배포

```bash
# 1. 클론 및 설치
git clone https://github.com/jitnet57/kinder-management.git
cd kinder-management
npm install

# 2. 환경 변수 설정 (.env.local)
# DATABASE_URL, JWT_SECRET 등 설정

# 3. 백엔드 준비
cd backend
npm run prisma:migrate
npm run dev

# 4. 프론트엔드 시작 (새 터미널)
cd frontend
npm run dev
```

### 프로덕션 배포 (Vercel + Railway)

**프론트엔드 배포 (Vercel):**

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 배포
vercel --prod

# 3. 환경 변수 설정
# Dashboard에서 VITE_API_URL 입력
```

**백엔드 배포 (Railway):**

```bash
# 1. Railway CLI 설치 및 로그인
npm i -g @railway/cli
railway login

# 2. 프로젝트 연결
railway connect

# 3. 배포
railway up --detach

# 4. PostgreSQL 플러그인 추가 (Railway 대시보드)
```

자세한 배포 가이드는 [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)를 참조하세요.

---

## 🛡️ 보안 & 라이선스

### 보안 기능

- ✅ **JWT 토큰 인증** — HTTP-only cookies로 토큰 저장
- ✅ **개인정보 암호화** — 데이터베이스 수준 암호화
- ✅ **HTTPS 강제** — 프로덕션 환경에서 필수
- ✅ **CORS 화이트리스트** — 신뢰 가능한 도메인만 허용
- ✅ **SQL Injection 방지** — Prisma ORM으로 자동 방어
- ✅ **XSS 방지** — React 자체 보호 + CSP 헤더

### 라이선스

**MIT License** — 자유롭게 사용, 수정, 배포 가능 (상업용 포함)

자세한 조건은 `LICENSE` 파일을 참조하세요.

---

## 📚 추가 문서

| 문서 | 대상 | 내용 |
|------|------|------|
| [**ARCHITECTURE.md**](ARCHITECTURE.md) | 모든 팀원 | 시스템 구조, Phase 1-5 진행 사항, 아키텍처 다이어그램 |
| [**USER_GUIDE.md**](USER_GUIDE.md) | 최종 사용자 | 역할별 완전 가이드, 각 페이지 설명, FAQ, 문제 해결 |
| [**DEVELOPER_GUIDE.md**](DEVELOPER_GUIDE.md) | 개발자 | 환경 설정, 코드 컨벤션, 기능 추가 방법, 디버깅 팁 |
| [**DEPLOYMENT_GUIDE.md**](DEPLOYMENT_GUIDE.md) | DevOps/배포담당 | Vercel/Railway 설정, CI/CD, 모니터링, 트러블슈팅 |
| [**API_REFERENCE.md**](API_REFERENCE.md) | 프론트엔드/백엔드 개발자 | 모든 Context 함수, API 엔드포인트, 사용 예시 |
| [**FEATURES_CHECKLIST.md**](FEATURES_CHECKLIST.md) | PM/QA | Phase별 기능 목록, 완성도, 테스트 상태 |
| [**CHANGELOG.md**](CHANGELOG.md) | 모든 팀원 | 버전별 변경 사항, Breaking changes |

---

## 🤝 기여 방법

### 코드 기여

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/kinder-management.git
   cd kinder-management
   ```

2. **Feature Branch 생성**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **코드 작성 & 테스트**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

4. **Commit & Push**
   ```bash
   git commit -m "feat: 기능 설명"
   git push origin feature/your-feature-name
   ```

5. **Pull Request 생성**
   - PR 제목: `feat: 기능명` 또는 `fix: 버그 설명`
   - 설명: 변경 사항, 테스트 결과, 스크린샷 첨부

### 버그 리포팅

- [GitHub Issues](https://github.com/jitnet57/kinder-management/issues) 에서 신규 이슈 생성
- 제목: `[BUG] 간단한 설명`
- 설명: 재현 단계, 예상 동작, 실제 동작, 스크린샷

---

## 📞 지원 및 문의

| 채널 | 연락처 | 용도 |
|------|--------|------|
| **GitHub Issues** | [링크](https://github.com/jitnet57/kinder-management/issues) | 버그 리포팅, 기능 요청 |
| **이메일** | jitnet57@gmail.com | 긴급 문의, 보안 이슈 |
| **Discord** (예정) | (준비 중) | 커뮤니티 채팅 |
| **문서** | 이 README 및 `/docs` | 자세한 가이드 |

---

## 🏆 주요 성과

### Phase 1-4 완료 (2026-04-27)

- ✅ **Phase 1**: 프로젝트 분석 & 요구사항 정의
- ✅ **Phase 2**: 기획 & 설계 (4-스트림 병렬 구조)
- ✅ **Phase 3**: C1-C4 협업 기능 구현 (메시징, ABC 분석, 협업 대시보드)
- ✅ **Phase 4**: D1-D4 분석 & 배포 준비 (TypeScript 완성, QA 검증)

### Phase 5 현황

🚀 **P3 Stream (완벽한 문서화)**: 8개 포괄적 마크다운 문서 작성 진행 중

---

## 📊 프로젝트 통계

```
📝 Total Lines of Code:        ~50,000+ LOC
🎨 UI Components:              100+ 컴포넌트
🔄 Context/State Management:   8개 Context
📚 커리큘럼 데이터:             252개 LTO
🧪 TypeScript Types:           150+ 인터페이스
🌐 API Endpoints:              30+ 엔드포인트
📄 Documentation Pages:         8개 마크다운 문서
```

---

## 🗓️ 로드맵

```
2026년 4월
├── Phase 5 P1: 사용자 교육 자료 ✅
├── Phase 5 P2: 배포 체크리스트 ✅
└── Phase 5 P3: 완벽한 문서화 🚀 (현재)

2026년 5월
├── Phase 5 P4: 실제 환경 테스트
├── Phase 5 P5: 고객 피드백 수집
└── Phase 6: 프로덕션 배포 (예정)
```

---

## 👥 팀 & 기여자

| 역할 | 담당자 | 상태 |
|------|--------|------|
| **Analyst** (Phase 1) | Mary | ✅ 완료 |
| **PM** (Phase 2) | John | ✅ 완료 |
| **UX Designer** (Phase 2) | Sally | ✅ 완료 |
| **Architect** (Phase 3) | Winston | ✅ 완료 |
| **Scrum Master** (Phase 3) | Bob | ✅ 완료 |
| **Frontend Dev** (Phase 4) | Amelia | ✅ 완료 |
| **Backend Dev** (Phase 4) | (협력자) | ✅ 완료 |
| **QA** (Phase 4) | Quinn | ✅ 완료 |
| **Technical Writer** (Phase 5) | Claude | 🚀 진행 중 |

---

## 🎓 학습 자료

AKMS는 다음 기술을 배우는 데 도움이 됩니다:

- **프론트엔드**: React 18, TypeScript, Tailwind CSS, Context API
- **백엔드**: Node.js, Hono, Prisma, REST API 설계
- **전체 스택**: JWT 인증, 데이터베이스 설계, 배포 파이프라인
- **협업**: Git 워크플로우, PR 리뷰, 애자일 방법론

---

**마지막 업데이트**: 2026-04-27  
**문서 버전**: 2.0 (Phase 5 P3)  
**상태**: 🚀 Active Development  

---

## 📄 라이선스

MIT License © 2026 Kinder Management Project

**Freedom to use, modify, and distribute** — 상업용 포함

---

## 🌍 다국어 지원

- 🇰🇷 **한국어** — 완전 지원 (Primary)
- 🇬🇧 **English** — 지원 예정

이 문서는 **한국어로 작성**되었습니다. 영어 버전은 추후 제공됩니다.

---

**Happy Coding! 🚀**  
더 궁금한 점이나 문제가 있으시면 GitHub Issues를 통해 문의해주세요.
