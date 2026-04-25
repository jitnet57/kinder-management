# 🎓 아동관리 ABA 데이터 시스템 (AKMS)

> **Kinder Management System** — 응용행동분석(ABA) 기반 아동 교육/치료 기관을 위한 통합 웹앱

---

## 📖 프로젝트 개요

### 핵심 목표
아동 교육/치료 기관에서 **주간 스케줄링, 아동 정보 관리, 일일 데이터 기록, 커리큘럼 연동**을 통합 관리하는 웹앱

### 주요 특징
✅ **한 화면 주간 시간표** — 월-토 시간표 형식, 아동별 색상 코딩  
✅ **아동정보 카드형** — 생년월일, 전화, 주소, 파일 첨부  
✅ **일일 데이터 기록** — 과제별 점수 입력 + 7일 추세 그래프  
✅ **커리큘럼 연동** — 발달영역 > LTO > STO 계층형 관리  
✅ **완료목록** — 세션 진행도 추적 및 리포팅

---

## 📋 문서 구조 (BMAD × LangGraph 협업 결과)

### Phase 1️⃣: 분석 (Analysis)
📄 [`docs/project-brief.md`](docs/project-brief.md)  
**담당**: Analyst (Mary)  
**내용**:
- 프로젝트 목표 & 가치 제안
- 주요 기능 분석 (5개 모듈)
- 데이터 흐름 & 관계도
- 기술 요구사항 (권장 스택)
- 위험 요소 & 완화 전략

### Phase 2️⃣: 기획 & 설계 (Planning)
📄 [`docs/prd.md`](docs/prd.md) — PM (John)  
📄 [`docs/ux-spec.md`](docs/ux-spec.md) — UX Designer (Sally)

**내용**:
- 사양 요약 & 사용자 여정
- 기술 스택 (React 18 + Hono + PostgreSQL)
- 모듈별 UI/UX 상세 설계
- 디자인 시스템 (파스텔톤 글래스 모르피즘)
- 마일스톤 & KPI

### Phase 3️⃣: 아키텍처 & 구조화 (Solutioning)
📄 [`docs/architecture.md`](docs/architecture.md) — Architect (Winston)  
📄 [`docs/epics-stories.md`](docs/epics-stories.md) — Scrum Master (Bob)

**내용**:
- 3계층 아키텍처 (FE, API, DB)
- 완전한 Prisma 스키마 (6개 테이블)
- REST API 엔드포인트 명세 (전체 30+ 엔드포인트)
- 보안 & 성능 전략
- 19개 스토리 / 139 포인트로 분할
- 5주 개발 + 2주 QA 일정

### Phase 4️⃣: 구현 (Implementation) — 다음 단계
**예정**: Dev (Amelia) + QA (Quinn) 리드

---

## 🛠 기술 스택 (확정)

### 프론트엔드
- **프레임워크**: React 18 + TypeScript
- **상태 관리**: Zustand + TanStack Query (SWR)
- **스타일**: Tailwind CSS + HeadlessUI
- **차트**: Recharts (7일 추세)
- **배포**: Vercel

### 백엔드
- **런타임**: Node.js 18+
- **프레임워크**: Hono (가볍고 빠름)
- **ORM**: Prisma (타입 안전)
- **인증**: JWT + httpOnly cookies
- **검증**: Zod (스키마)
- **배포**: Fly.io 또는 Railway

### 데이터베이스
- **DBMS**: PostgreSQL 14+
- **호스팅**: Supabase (추천) 또는 자체 호스팅
- **스토리지**: S3-compatible (R2 또는 Minio)
- **마이그레이션**: Prisma migrations

### DevOps & 모니터링
- **VCS**: GitHub
- **CI/CD**: GitHub Actions
- **에러 추적**: Sentry
- **모니터링**: Vercel Analytics + CloudFlare

---

## 📊 핵심 모듈

### 1️⃣ 스케줄 관리
- 월-토 시간표 (한 화면)
- 아동별 색상 코딩
- 중복 선택 & 일괄 편집
- 시간 충돌 감지

### 2️⃣ 아동정보
- 카드형 그리드 (반응형)
- 생년월일, 전화, 주소, 파일 첨부
- CRUD 기능

### 3️⃣ 데이터 기록지
- 아동별 격리된 뷰
- 과제 카드형
- 점수 입력 (0-100)
- 7일 추세 그래프

### 4️⃣ 커리큘럼
- 트리형 (도메인 → LTO → STO)
- SessionLog와 양방향 연동
- 관리자 편집

### 5️⃣ 완료목록
- SessionLog 집계
- 필터 & 정렬
- 완료율 리포팅

---

## 🎨 디자인 시스템

### 색상 팔레트
```
Primary: #8B7DC1 (Soft Purple)
Secondary: #A8D8D8 (Soft Teal)
Accent: #F7B8C8 (Soft Pink)

아동 할당 색상 (8가지 파스텔)
#FFB6D9 #B4D7FF #C1FFD7 #FFE4B5 
#E6D7FF #FFD9B3 #D4F1F4 #FFE6CC
```

### 글래스 모르피즘 설정
- Background: `rgba(255, 255, 255, 0.7)`
- Blur: `10px`
- Border: `1px solid rgba(255, 255, 255, 0.5)`

### 반응형 Breakpoints
- Mobile: < 640px (1열)
- Tablet: 640-1024px (2열)
- Desktop: > 1024px (4-6열)

---

## 🚀 빠른 시작

### 개발 환경 셋업

```bash
# 1. 저장소 클론
git clone https://github.com/jitnet57/kinder-management.git
cd kinder-management

# 2. 환경 변수 설정
cp .env.example .env.local
# DATABASE_URL, JWT_SECRET 등 입력

# 3. 백엔드 의존성 설치
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate

# 4. 프론트엔드 의존성 설치
cd ../frontend
npm install

# 5. 동시 실행 (root에서)
npm run dev
```

### 개발 서버 실행
```bash
# FE: http://localhost:3000
# BE: http://localhost:3001
```

### 데이터베이스 초기화
```bash
npm run prisma:reset  # 샘플 데이터 포함
```

---

## 🚄 개발 일정

| Sprint | 기간 | 목표 | 포인트 |
|--------|------|------|--------|
| Sprint 1 | 1주 | 인증 + 아동정보 기초 | 34pts |
| Sprint 2 | 1주 | 아동정보 완성 + 스케줄 기초 | 32pts |
| Sprint 3 | 1주 | 스케줄 고급 + 세션로그 기초 | 26pts |
| Sprint 4 | 1주 | 그래프 + 완료목록 + 커리큘럼 | 31pts |
| Sprint 5 | 1주 | 통합 & 버그 수정 | TBD |
| QA | 2주 | 통합 테스트 + 배포 준비 | - |
| **총** | **7주** | **MVP 출시** | **139pts** |

---

## 🎯 성공 지표 (KPI)

| 지표 | 목표 | 측정 |
|------|------|------|
| **사용자 만족도** | 4.5/5 | 월간 설문 |
| **시스템 가용성** | 99.5% | Sentry, Uptime Robot |
| **평균 응답 시간** | < 300ms | CloudFlare Analytics |
| **기능 완성도** | 100% MVP | Sprint 완료 |

---

## 🔒 보안 & 성능

### 보안
- ✅ JWT 토큰 인증
- ✅ 개인정보 암호화
- ✅ HTTPS 전송 필수
- ✅ CORS 화이트리스트
- ✅ SQL Injection 방지 (ORM)
- ✅ XSS 방지 (React)

### 성능
- ✅ DB 인덱싱 (childId, date, curriculumId)
- ✅ 클라이언트 캐싱 (TanStack Query SWR 50초)
- ✅ 페이지네이션 (limit 50)
- ✅ 이미지 CDN (S3)

---

## 📚 추가 리소스

| 문서 | 설명 |
|------|------|
| [docs/project-brief.md](docs/project-brief.md) | Phase 1: 분석 |
| [docs/prd.md](docs/prd.md) | Phase 2: 기획 |
| [docs/ux-spec.md](docs/ux-spec.md) | Phase 2: UX/UI |
| [docs/architecture.md](docs/architecture.md) | Phase 3: 아키텍처 |
| [docs/epics-stories.md](docs/epics-stories.md) | Phase 3: 스토리 |

---

## 👥 팀 (BMAD 에이전트)

| 역할 | 담당자 | Phase | 상태 |
|------|--------|-------|------|
| **Analyst** | Mary | 1 | ✓ 완료 |
| **PM** | John | 2 | ✓ 완료 |
| **UX Designer** | Sally | 2 | ✓ 완료 |
| **Architect** | Winston | 3 | ✓ 완료 |
| **Scrum Master** | Bob | 3 | ✓ 완료 |
| **Frontend Dev** | Amelia | 4 | → 준비 중 |
| **Backend Dev** | (공석) | 4 | → 준비 중 |
| **QA** | Quinn | 4 | → 준비 중 |

---

**마지막 업데이트**: 2026-04-26  
**상태**: Phase 3 완료 ✓ | **다음**: Phase 4 개발 시작


## 깃허브
# https://github.com/jitnet57/kinder-management

## 배포 

https://dash.cloudflare.com/c0dccd0131e560697f98e0dd0825b833/workers/services/view/kinder-management/production

jitnet57@gmail.com
