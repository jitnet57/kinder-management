# 아동관리 ABA 웹앱 | 아키텍처 설계서

**작성자**: Winston (Architect) | **날짜**: 2026-04-26  
**Status**: Phase 3 아키텍처 확정 ✓

---

## 1. 시스템 아키텍처 (High-Level)

### 1.1 3계층 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                  Presentation Layer                  │
│  React 18 + TypeScript + Tailwind CSS               │
│  (Browser, SPA)                                     │
└────────────────┬────────────────────────────────────┘
                 │ REST API / JSON
                 ▼
┌─────────────────────────────────────────────────────┐
│                   API Layer                         │
│  Hono (Lightweight) + JWT Auth + Prisma ORM         │
│  (Node.js 18+, edge-ready)                          │
└────────────────┬────────────────────────────────────┘
                 │ SQL
                 ▼
┌─────────────────────────────────────────────────────┐
│                  Data Layer                          │
│  PostgreSQL 14+ (Supabase)                          │
│  S3-compatible storage (files)                      │
└─────────────────────────────────────────────────────┘
```

### 1.2 컴포넌트 다이어그램

```
Frontend (React)
├── Pages
│   ├── Dashboard
│   ├── Schedule
│   ├── ChildProfile
│   ├── SessionLog
│   ├── CompletionList
│   └── Curriculum
├── Components
│   ├── WeeklyTable (Schedule)
│   ├── CardGrid (Children, Curriculum)
│   ├── SessionLogCard
│   ├── Chart (Recharts)
│   └── Form (Modal)
├── Hooks
│   ├── useSchedule
│   ├── useChild
│   ├── useSessionLog
│   └── useAuth
├── State (Zustand)
│   └── Store
│       ├── childStore
│       ├── scheduleStore
│       └── authStore
└── Utils
    ├── api.ts (client)
    └── formatter.ts

Backend (Hono)
├── Routes
│   ├── /auth (login, register, logout)
│   ├── /children (CRUD)
│   ├── /schedules (CRUD, weekly view)
│   ├── /session-logs (CRUD, daily)
│   ├── /completions (list, filter)
│   └── /curriculum (CRUD, tree)
├── Middleware
│   ├── authMiddleware
│   ├── errorHandler
│   └── corsMiddleware
├── Services
│   ├── ChildService
│   ├── ScheduleService
│   ├── SessionLogService
│   └── CurriculumService
├── Validators
│   ├── childValidator
│   ├── scheduleValidator
│   └── ...
└── Database
    └── Prisma (ORM)

Database (PostgreSQL)
├── Tables
│   ├── users
│   ├── children
│   ├── schedules
│   ├── session_logs
│   ├── curriculum
│   └── completion_logs
└── Indexes
    ├── child_id
    ├── schedule_date
    └── session_log_date
```

---

## 2. 데이터베이스 스키마

### 2.1 Entity-Relationship Diagram (ERD)

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │
│ email        │
│ password_hash│
│ role         │────┐
│ createdAt    │    │
└──────────────┘    │
                    │ 1:N
                    ▼
            ┌──────────────────┐
            │     children     │
            ├──────────────────┤
            │ id (PK)          │
            │ name             │
            │ dateOfBirth      │
            │ phone            │
            │ address          │
            │ notes            │
            │ attachments(JSON)│
            │ color            │
            │ status           │
            │ createdAt        │
            └────────┬─────────┘
                     │
         ┌───────────┼───────────┐
         │ 1:N       │ 1:N       │
         ▼           ▼           ▼
    ┌─────────┐ ┌──────────────┐ ┌────────────────┐
    │schedules│ │session_logs  │ │curriculum_      │
    ├─────────┤ ├──────────────┤ │assignments     │
    │ id (PK) │ │ id (PK)      │ ├────────────────┤
    │childId  │ │ childId      │ │ id (PK)        │
    │session  │ │ curriculumId │ │ childId        │
    │ name    │ │ date         │ │ curriculumId   │
    │ dayOf   │ │ score        │ │ assignedAt     │
    │ Week    │ │ notes        │ └────────────────┘
    │startTime│ │ startTime    │
    │endTime  │ │ endTime      │
    │color    │ │ createdAt    │
    │createdAt│ └──────────────┘
    └─────────┘
                ┌──────────────────┐
                │  curriculum      │
                ├──────────────────┤
                │ id (PK)          │
                │ domain           │
                │ lto              │
                │ sto              │
                │ notes            │
                │ order            │
                │ status           │
                │ createdAt        │
                └──────────────────┘

┌────────────────────┐
│  completion_logs   │
├────────────────────┤
│ id (PK)            │
│ session_logId      │
│ status             │
│ completedAt        │
│ completedBy        │
└────────────────────┘
```

### 2.2 Prisma Schema (prisma/schema.prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String     @id @default(cuid())
  email     String     @unique
  passwordHash String
  role      Role       @default(USER)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

enum Role {
  ADMIN
  USER
}

model Child {
  id            String   @id @default(cuid())
  name          String
  dateOfBirth   DateTime
  phone         String?
  address       String?
  notes         String?
  attachments   Json     @default("[]") // [{fileId, fileName, uploadedAt}, ...]
  color         String   @default("#FFB6D9")
  status        ChildStatus @default(ACTIVE)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  schedules     Schedule[]
  sessionLogs   SessionLog[]
  curriculumAssignments CurriculumAssignment[]

  @@index([status])
}

enum ChildStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

model Schedule {
  id            String   @id @default(cuid())
  childId       String
  child         Child    @relation(fields: [childId], references: [id], onDelete: Cascade)
  sessionName   String
  dayOfWeek     DayOfWeek
  startTime     String   // "09:00" format
  endTime       String   // "10:00" format
  color         String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([childId, dayOfWeek, startTime])
  @@index([dayOfWeek])
  @@index([childId])
}

enum DayOfWeek {
  MON
  TUE
  WED
  THU
  FRI
  SAT
}

model Curriculum {
  id        String   @id @default(cuid())
  domain    String   // "언어발달"
  lto       String   // "어휘력 증진"
  sto       String   // "100개 단어 습득"
  notes     String?
  order     Int      @default(0)
  status    CurriculumStatus @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessionLogs SessionLog[]
  assignments CurriculumAssignment[]

  @@index([domain])
  @@index([status])
}

enum CurriculumStatus {
  ACTIVE
  ARCHIVED
}

model SessionLog {
  id            String   @id @default(cuid())
  childId       String
  child         Child    @relation(fields: [childId], references: [id], onDelete: Cascade)
  curriculumId  String
  curriculum    Curriculum @relation(fields: [curriculumId], references: [id])
  date          DateTime
  score         Int?     // 0-100, nullable for Pass/Fail
  notes         String?
  sessionStartTime String?
  sessionEndTime   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  completionLog CompletionLog?

  @@unique([childId, curriculumId, date])
  @@index([childId])
  @@index([date])
  @@index([curriculumId])
}

model CurriculumAssignment {
  id            String   @id @default(cuid())
  childId       String
  child         Child    @relation(fields: [childId], references: [id], onDelete: Cascade)
  curriculumId  String
  curriculum    Curriculum @relation(fields: [curriculumId], references: [id], onDelete: Cascade)
  assignedAt    DateTime @default(now())
  
  @@unique([childId, curriculumId])
  @@index([childId])
}

model CompletionLog {
  id            String   @id @default(cuid())
  sessionLogId  String   @unique
  sessionLog    SessionLog @relation(fields: [sessionLogId], references: [id], onDelete: Cascade)
  status        CompletionStatus @default(COMPLETED)
  completedAt   DateTime @default(now())
  completedBy   String?
  
  @@index([status])
}

enum CompletionStatus {
  COMPLETED
  IN_PROGRESS
  PENDING
}
```

---

## 3. API 엔드포인트 스펙 (REST)

### 3.1 인증 (Auth)

```
POST /api/auth/register
  Body: { email, password }
  Response: { userId, token }

POST /api/auth/login
  Body: { email, password }
  Response: { userId, token, role }

POST /api/auth/logout
  Headers: Authorization: Bearer <token>
  Response: { success }

GET /api/auth/me
  Headers: Authorization: Bearer <token>
  Response: { userId, email, role }
```

### 3.2 아동 (Children)

```
GET /api/children
  Query: ?status=ACTIVE&sort=name
  Response: { data: Child[], total: number }

GET /api/children/:id
  Response: { Child }

POST /api/children
  Body: { name, dateOfBirth, phone, address, notes }
  Response: { Child }

PUT /api/children/:id
  Body: { name, phone, address, notes, status }
  Response: { Child }

DELETE /api/children/:id
  Response: { success }

POST /api/children/:id/upload
  Body: FormData (file)
  Response: { fileId, fileName, url }
```

### 3.3 스케줄 (Schedules)

```
GET /api/schedules?week=2026-04-26
  Response: { schedules: Schedule[], conflicts: [] }

POST /api/schedules
  Body: { childId, sessionName, dayOfWeek, startTime, endTime }
  Response: { Schedule }

PUT /api/schedules/:id
  Body: { sessionName, startTime, endTime }
  Response: { Schedule }

DELETE /api/schedules/:id
  Response: { success }

POST /api/schedules/batch-delete
  Body: { ids: string[] }
  Response: { deleted: number }

POST /api/schedules/batch-update
  Body: { ids: string[], updates: { ... } }
  Response: { updated: number }
```

### 3.4 세션 기록 (SessionLogs)

```
GET /api/session-logs?childId=xxx&date=2026-04-26
  Response: { logs: SessionLog[] }

GET /api/session-logs/trend?curriculumId=xxx&days=7
  Response: { trend: { date, score }[] }

POST /api/session-logs
  Body: { childId, curriculumId, date, score, notes, sessionStartTime, sessionEndTime }
  Response: { SessionLog }

PUT /api/session-logs/:id
  Body: { score, notes }
  Response: { SessionLog }

DELETE /api/session-logs/:id
  Response: { success }
```

### 3.5 완료목록 (Completions)

```
GET /api/completions?childId=xxx&status=COMPLETED
  Response: { logs: CompletionLog[] }

GET /api/completions/summary?week=2026-04-26
  Response: { completionRate: number, total: number, completed: number }
```

### 3.6 커리큘럼 (Curriculum)

```
GET /api/curriculum?domain=xxx&status=ACTIVE
  Response: { curriculum: Curriculum[] }

POST /api/curriculum
  Body: { domain, lto, sto, notes }
  Response: { Curriculum }

PUT /api/curriculum/:id
  Body: { domain, lto, sto, notes, order }
  Response: { Curriculum }

DELETE /api/curriculum/:id
  Response: { success }
```

---

## 4. 보안 & 성능 전략

### 4.1 보안
- **인증**: JWT (Bearer token) with httpOnly cookies
- **인가**: Role-based access control (RBAC)
  - ADMIN: 모든 권한
  - USER: 자신의 아동정보만 조회/수정
- **데이터 보호**:
  - 개인정보 (phone, address) 암호화 (TweetNaCl.js)
  - HTTPS 전송 (필수)
  - CORS (프론트 도메인만 허용)

### 4.2 성능
- **DB 최적화**:
  - 필드 인덱싱 (childId, date, curriculumId)
  - 쿼리 배치 (N+1 방지)
  - 페이지네이션 (limit 50)
- **캐싱**:
  - 클라이언트: TanStack Query (SWR 50초)
  - 서버: Redis (선택사항, 초기는 불필요)
- **이미지/파일**:
  - S3 CDN 사용
  - 썸네일 생성 (Sharp.js)

### 4.3 모니터링
- **로깅**: Winston (또는 Pino)
  - 모든 API 요청/응답 기록
  - 에러 스택 추적
- **에러 추적**: Sentry
  - 클라이언트 + 서버 에러 통합
- **성능**: Vercel Analytics / CloudFlare
  - 응답 시간, 첫 바이트 시간 모니터링

---

## 5. 배포 아키텍처 (DevOps)

### 5.1 개발 환경 (Local)

```bash
# 필수 도구
Node.js 18+
PostgreSQL (Docker)
npm/yarn

# 실행
npm install
npm run dev
```

### 5.2 프로덕션 스택

```
GitHub (Source Control)
  │
  ├─ [FE] Vercel (Deployment) → CDN
  │
  └─ [BE] Railway/Fly.io → Hono
         ├─ Supabase (PostgreSQL)
         ├─ R2 (S3-compatible, Cloudflare)
         └─ Sentry (Error Tracking)
```

### 5.3 CI/CD 파이프라인 (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
on: [push to main]

jobs:
  test:
    - run: npm ci
    - run: npm run test
    - run: npm run lint
  
  deploy:
    - FE: vercel deploy
    - BE: railway deploy
```

---

## 6. 확장성 (Scalability)

### 6.1 Phase 2 (3-6개월 후)
- 모바일 앱 (React Native)
- 실시간 알림 (WebSocket)
- 고급 리포팅 (BI 대시보드)

### 6.2 Phase 3 (6-12개월 후)
- 다중 기관 지원 (Tenant isolation)
- 보호자 앱 (read-only)
- AI 기반 진행도 예측

---

**다음 단계**: Phase 3-B 에픽/스토리 분할 → SM (Bob) 리드

