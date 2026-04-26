# 🏗️ AKMS 아키텍처 문서

> **시스템 구조, Phase별 진행 사항, 데이터 흐름 완전 가이드**

---

## 📋 목차

1. [전체 시스템 구조](#전체-시스템-구조)
2. [Phase별 구현 현황](#phase별-구현-현황)
3. [4-스트림 병렬 아키텍처](#4-스트림-병렬-아키텍처)
4. [데이터 흐름](#데이터-흐름)
5. [Context API 구조](#context-api-구조)
6. [라우팅 맵](#라우팅-맵)
7. [데이터베이스 스키마](#데이터베이스-스키마)
8. [API 엔드포인트](#api-엔드포인트)

---

## 전체 시스템 구조

### 🎯 3계층 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│              (프론트엔드 - React 18 + TypeScript)             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┬─────────┬─────────┬─────────┬──────────────┐  │
│  │ Pages   │Component│ Context │  Hooks  │   Utils      │  │
│  │  (15+)  │ (100+)  │  (8)    │ Custom  │              │  │
│  └─────────┴─────────┴─────────┴─────────┴──────────────┘  │
│                                                             │
│                    State Management                        │
│              (Context API + localStorage)                  │
└─────────────────────────────────────────────────────────────┘
                            ↑↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
│       (JWT 검증, 요청 라우팅, 미들웨어 처리)                │
├─────────────────────────────────────────────────────────────┤
│         Hono Framework (Node.js 경량 웹 프레임워크)          │
└─────────────────────────────────────────────────────────────┘
                            ↑↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                        │
│         (Prisma ORM + PostgreSQL 쿼리 최적화)               │
├─────────────────────────────────────────────────────────────┤
│              ┌────────────────────────────────┐             │
│              │  PostgreSQL 14+                │             │
│              │  ├─ Users (사용자)             │             │
│              │  ├─ Children (아동)            │             │
│              │  ├─ Sessions (세션)            │             │
│              │  ├─ SessionLogs (기록)         │             │
│              │  ├─ Curriculum (커리큘럼)      │             │
│              │  ├─ Messages (메시지)          │             │
│              │  └─ Approvals (승인 이력)      │             │
│              └────────────────────────────────┘             │
│                   Redis (캐시/세션)                        │
│                   S3 (이미지/파일 저장소)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase별 구현 현황

### ✅ Phase 1: 분석 (완료)

**담당**: Analyst (Mary)  
**기간**: 1주  
**성과**:

- ✅ 프로젝트 목표 & 가치 제안 분석
- ✅ 주요 모듈 5개 정의 (스케줄, 아동정보, 데이터 기록, 커리큘럼, 완료목록)
- ✅ 데이터 흐름 & 관계도 설계
- ✅ 기술 요구사항 문서화
- ✅ 위험 분석 & 완화 전략

**문서**: `docs/project-brief.md`

---

### ✅ Phase 2: 기획 & 설계 (완료)

**담당**: PM (John) + UX Designer (Sally)  
**기간**: 1주  
**성과**:

**2.1 기능 정의 (PRD)**
- ✅ 사용자 여정 맵 (User Journey Map)
- ✅ 기술 스택 확정 (React 18, Hono, PostgreSQL)
- ✅ 3가지 역할 정의 (Admin, Therapist, Parent)
- ✅ 5개 모듈별 기능 명세

**2.2 UX/UI 설계 (Specification)**
- ✅ 와이어프레임 (Figma)
- ✅ 파스텔톤 색상 팔레트 (8가지 아동 색상)
- ✅ 글래스 모르피즘 디자인 시스템
- ✅ 반응형 Breakpoint (Mobile/Tablet/Desktop)
- ✅ 모든 페이지별 UI 상세 설명

**2.3 기술 스택 선정**
- ✅ 프론트엔드: React 18 + TypeScript + Tailwind CSS
- ✅ 백엔드: Node.js + Hono + Prisma
- ✅ DB: PostgreSQL + Redis
- ✅ 배포: Vercel (FE) + Railway (BE)

**문서**: `docs/prd.md`, `docs/ux-spec.md`

---

### ✅ Phase 3: 아키텍처 & 협업 기능 (완료)

**담당**: Architect (Winston) + Dev Team  
**기간**: 2주  
**구성**: 4-스트림 병렬 개발

#### Stream C1: 부모-치료사 메시징 시스템
- ✅ 메시지 타입 정의 (text, image, file, feedback, milestone)
- ✅ 아동별 대화방 구현
- ✅ 실시간 피드백 시스템
- ✅ 마일스톤 축하 알림
- **구현 파일**: `MessageContext.tsx`, `Messages.tsx`, `NotificationContext.tsx`

#### Stream C2: ABC 행동 분석 시스템
- ✅ ABC 분석 데이터 모델 (Antecedent, Behavior, Consequence)
- ✅ 행동 패턴 추출 알고리즘
- ✅ 시각화 차트 (Recharts)
- ✅ 데이터 저장소 (Context + localStorage)
- **구현 파일**: `ABCContext.tsx`, `ABCAnalysis.tsx`

#### Stream C3: 협업 대시보드
- ✅ 아동별 협업 목표 설정
- ✅ 실시간 협업 노트
- ✅ 진행 상황 공유
- ✅ 팀원 간 의견 수집
- **구현 파일**: `CollaborativeDashboardContext.tsx`, `CollaborativeDashboard.tsx`

#### Stream C4: 분석 기능 확장
- ✅ 행동 예측 모델 (Behavior Prediction)
- ✅ 중재 효과 분석 (Intervention Analysis)
- ✅ 학습 속도 추적 (Learning Velocity)
- ✅ 자동 인사이트 (AutoInsights)
- **구현 파일**: `BehaviorPrediction.tsx`, `InterventionAnalysis.tsx`, `LearningVelocity.tsx`, `AutoInsights.tsx`

**문서**: `docs/architecture.md` (Phase 3), `docs/epics-stories.md`

---

### ✅ Phase 4: TypeScript & QA (완료)

**담당**: Dev Team + QA (Quinn)  
**기간**: 2주  
**구성**: 4-스트림 병렬 검증

#### Stream D1: TypeScript 완성
- ✅ 8개 TypeScript 에러 해결
- ✅ `useCallback` 타입 정확화
- ✅ Context 인자 타입 일관성
- ✅ 모든 파일 strict mode 통과
- **빌드 결과**: ✅ 0 에러, 12.70초

#### Stream D2: 역할별 QA 검증
- ✅ 관리자 (Admin): 모든 기능 접근 가능
- ✅ 치료사 (Therapist): 담당 아동 협업 기능 검증
- ✅ 부모 (Parent): 자녀 성장 추이 기능 검증
- ✅ 4가지 분석 페이지 모두 로드 성공

#### Stream D3: 성능 & 보안 테스트
- ✅ 평균 응답 시간: < 300ms
- ✅ 번들 크기: 393.15 kB (gzip)
- ✅ JWT 인증 검증
- ✅ CORS 정책 검증

#### Stream D4: 배포 준비
- ✅ 환경 변수 검증
- ✅ 빌드 최적화
- ✅ 배포 체크리스트 완성
- ✅ 모니터링 설정

**문서**: `PHASE4_D4_FINAL_COMPLETION_REPORT.md`

---

### 🚀 Phase 5: 완벽한 문서화 (진행 중)

**담당**: Technical Writer  
**기간**: 1주  
**구성**: 3-스트림

#### Stream P1: 사용자 교육 자료 ✅
- ✅ 비디오 스크립트
- ✅ 빠른 시작 가이드
- ✅ FAQ & 트러블슈팅

#### Stream P2: 배포 & 운영 가이드 ✅
- ✅ 배포 체크리스트
- ✅ 환경 설정
- ✅ 모니터링 & 로깅

#### Stream P3: 완벽한 문서화 🚀 (현재)
- 🚀 **README.md** — 프로젝트 개요, 기술 스택, 빠른 시작
- 🚀 **ARCHITECTURE.md** — 이 문서
- 🚀 **USER_GUIDE.md** — 역할별 완전 가이드
- 🚀 **DEVELOPER_GUIDE.md** — 개발자 가이드
- 🚀 **DEPLOYMENT_GUIDE.md** — 배포 가이드
- 🚀 **API_REFERENCE.md** — API & Context 레퍼런스
- 🚀 **FEATURES_CHECKLIST.md** — 기능 체크리스트
- 🚀 **CHANGELOG.md** — 변경 기록

---

## 4-스트림 병렬 아키텍처

### 개요

AKMS는 **독립적인 기능 스트림 4개가 병렬로 개발**되는 혁신적인 구조를 채택합니다.

```
┌────────────────────────────────────────────────────────────┐
│            AKMS 4-스트림 병렬 아키텍처                      │
└────────────────────────────────────────────────────────────┘

  C1 메시징          C2 ABC분석        C3 협업대시보드      C4 분석확장
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ Messages │     │   ABC    │     │Collabor.│     │ Analytics│
  │ System   │     │ Analysis │     │Dashboard │     │ Features │
  ├──────────┤     ├──────────┤     ├──────────┤     ├──────────┤
  │• Messaging     │• Patterns │     │• Notes   │     │• Prediction
  │• Feedback      │• Visualize     │• Goals   │     │• Intervention
  │• Milestones    │• Trends   │     │• Progress│     │• Learning
  │• Reactions     │• Storage  │     │• Sharing │     │• AutoInsights
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
      ↓                ↓                 ↓                ↓
  ┌────────────────────────────────────────────────────────┐
  │             Context API & localStorage                │
  │  (MessageContext, ABCContext, CDContext, AnalyticsCtx)│
  └────────────────────────────────────────────────────────┘
      ↓
  ┌────────────────────────────────────────────────────────┐
  │              REST API (Backend/Hono)                   │
  │  • POST /api/messages      • GET /api/abc              │
  │  • GET /api/conversations  • POST /api/collaborative   │
  └────────────────────────────────────────────────────────┘
      ↓
  ┌────────────────────────────────────────────────────────┐
  │        PostgreSQL Database (6 Main Tables)             │
  │  Users | Children | Sessions | SessionLogs |          │
  │  Curriculum | Messages                                 │
  └────────────────────────────────────────────────────────┘
```

### 각 스트림의 독립성

| 스트림 | 독립 Context | 관련 Pages | 데이터 저장소 | 의존성 |
|--------|-------------|-----------|-------------|--------|
| **C1** | MessageCtx | Messages | PostgreSQL | None |
| **C2** | ABCContext | ABCAnalysis | localStorage | Child ID |
| **C3** | CDContext | CollaborativeDashboard | localStorage | Child ID |
| **C4** | AnalyticsCtx | 4 pages | localStorage | Session logs |

### 스트림 통합 지점

```
통합 지점 1: Children 페이지
├─ C1 활성화: 메시지 아이콘
├─ C2 활성화: ABC 분석 버튼
├─ C3 활성화: 협업 대시보드 링크
└─ C4 활성화: 분석 페이지 링크

통합 지점 2: Dashboard 페이지
├─ C1: 최신 메시지 3개 미리보기
├─ C2: ABC 패턴 요약
├─ C3: 협업 목표 진행 상황
└─ C4: 오늘의 학습 속도

통합 지점 3: SessionLog (일일 기록)
├─ C2 입력: 행동 관찰 데이터
├─ C1 트리거: 진행 상황 자동 피드백
├─ C3 업데이트: 협업 목표 달성도
└─ C4 계산: 학습 속도 변화
```

---

## 데이터 흐름

### 1️⃣ 인증 흐름

```
┌─────────────────────────────────────────────────────────┐
│                   로그인 프로세스                         │
└─────────────────────────────────────────────────────────┘

사용자 입력 (이메일, 비밀번호, 역할)
    ↓
Login 페이지 (Frontend)
    ├─ 입력 검증 (Zod schema)
    ├─ POST /api/auth/login 요청
    └─ JWT 토큰 + 사용자 정보 전송
    ↓
Hono Backend
    ├─ 이메일 & 비밀번호 검증 (bcrypt)
    ├─ JWT 토큰 생성 (HS256)
    ├─ HTTP-only Cookie 설정
    └─ 응답: { token, user: { id, role, name } }
    ↓
Frontend (Login 성공)
    ├─ localStorage 저장: 사용자 정보
    ├─ Context 업데이트: currentUser
    ├─ 역할별 라우트 리다이렉트
    │  ├─ admin → /dashboard
    │  ├─ therapist → /dashboard
    │  └─ parent → /parent-dashboard
    └─ 페이지 로드
    ↓
모든 API 요청
    ├─ Authorization 헤더에 JWT 포함
    ├─ 서버에서 검증
    └─ 토큰 만료 시 → 로그인 페이지 리다이렉트
```

### 2️⃣ 아동 정보 조회 흐름

```
┌─────────────────────────────────────────────────────────┐
│              아동정보 조회 흐름 (Children.tsx)             │
└─────────────────────────────────────────────────────────┘

페이지 로드 (Children.tsx)
    ↓
useEffect 실행
    ├─ CurriculumContext.fetchChildren() 호출
    └─ 로딩 상태 설정
    ↓
CurriculumContext (React)
    ├─ GET /api/children 요청
    ├─ 응답 저장: children (배열)
    ├─ 로딩 상태 false로 변경
    └─ 컴포넌트 재렌더링
    ↓
Hono Backend
    ├─ GET /api/children
    ├─ JWT 검증
    ├─ 현재 사용자 역할 확인
    │  ├─ admin → 모든 아동 반환
    │  ├─ therapist → 담당 아동만
    │  └─ parent → 자녀만
    ├─ Prisma 쿼리 실행
    └─ JSON 응답: Child[]
    ↓
PostgreSQL
    ├─ SELECT * FROM Children WHERE ...
    ├─ 인덱스 활용 (userId, role)
    └─ 결과 반환 (< 100ms)
    ↓
Frontend (Children.tsx)
    ├─ 아동 카드 렌더링 (그리드)
    ├─ 각 아동별 색상 적용
    └─ 상세보기 모달 활성화
```

### 3️⃣ 세션 로그 기록 흐름

```
┌─────────────────────────────────────────────────────────┐
│         세션 로그 기록 및 분석 흐름                       │
└─────────────────────────────────────────────────────────┘

Schedule 페이지 (시간표)
    ├─ 세션 선택 (월, 시간대, 아동)
    └─ "세션 시작" 클릭
    ↓
SessionLog 모달
    ├─ 과제 선택 (LTO → STO 자동 필터)
    ├─ 점수 입력 (0-100)
    ├─ 메모 추가 (관찰, 행동 분석)
    └─ "저장" 클릭
    ↓
CurriculumContext.addSessionLog()
    ├─ SessionLog 객체 생성
    ├─ POST /api/session-logs 요청
    └─ 로컬 상태 업데이트
    ↓
Hono Backend
    ├─ POST /api/session-logs (Zod 검증)
    ├─ Prisma 쿼리 실행:
    │  ├─ INSERT SessionLog
    │  └─ UPDATE SessionTask (completed=true)
    └─ 응답: { id, sessionLogId, ... }
    ↓
PostgreSQL 저장
    ├─ SessionLogs 테이블 삽입
    ├─ SessionTasks 테이블 업데이트
    └─ Timestamp 자동 생성
    ↓
Frontend 자동 트리거
    ├─ ABC 분석 (C2): 패턴 추출
    │  └─ ABCContext.analyzePatterns()
    ├─ 협업 대시보드 (C3): 목표 진행도 계산
    │  └─ CDContext.updateProgress()
    ├─ 분석 기능 (C4): 학습 속도 계산
    │  └─ AnalyticsContext.calculateVelocity()
    └─ 메시지 (C1): 자동 피드백 제안
        └─ MessageContext.suggestFeedback()
    ↓
최종 결과
    ├─ 그래프 업데이트 (7일 추이)
    ├─ 협업 노트 자동 생성 (optional)
    ├─ 부모 알림 발송 (선택사항)
    └─ 대시보드 스냅샷 업데이트
```

### 4️⃣ 협업 메시징 흐름

```
┌─────────────────────────────────────────────────────────┐
│          협업 메시징 (C1) 흐름                           │
└─────────────────────────────────────────────────────────┘

치료사가 메시지 작성 (Messages.tsx)
    ├─ 아동 선택
    ├─ 메시지 타입 선택 (text, feedback, milestone)
    ├─ 내용 작성
    └─ "전송" 클릭
    ↓
MessageContext.sendMessage()
    ├─ Message 객체 생성
    ├─ POST /api/messages 요청
    └─ 로컬 상태 즉시 업데이트 (optimistic update)
    ↓
Hono Backend
    ├─ POST /api/messages (JWT 검증)
    ├─ Zod 스키마 검증
    ├─ Prisma: INSERT Message
    ├─ (Optional) WebSocket 브로드캐스트
    └─ 응답: { id, createdAt, ... }
    ↓
PostgreSQL 저장
    └─ Messages 테이블 삽입
    ↓
부모 디바이스 (실시간)
    ├─ WebSocket 수신 또는 polling
    ├─ MessageContext 업데이트
    ├─ Messages.tsx 재렌더링
    └─ 알림 표시
    ↓
부모 응답
    ├─ 메시지 읽음 표시
    ├─ 반응 추가 (emoji) 또는 답장
    └─ 다시 치료사에게 전송
```

---

## Context API 구조

### 1️⃣ CurriculumContext (코어)

**파일**: `/frontend/src/context/CurriculumContext.tsx`

```typescript
interface CurriculumContextType {
  // 아동 관리
  children: Child[];
  fetchChildren: () => Promise<void>;
  addChild: (child: Omit<Child, 'id'>) => Promise<Child>;
  updateChild: (id: number, updates: Partial<Child>) => Promise<void>;
  deleteChild: (id: number) => Promise<void>;

  // 커리큘럼 관리
  curriculum: DevelopmentDomain[];
  fetchCurriculum: () => Promise<void>;
  updateCurriculum: (domainId: string, updates: Partial<DevelopmentDomain>) => Promise<void>;

  // 세션 로그
  sessionLogs: SessionTask[];
  addSessionLog: (log: SessionTask) => Promise<void>;
  getSessionLogsForChild: (childId: number, dateRange?: { start: string; end: string }) => SessionTask[];

  // 스케줄
  scheduleSessions: ScheduleSession[];
  addScheduleSession: (session: Omit<ScheduleSession, 'id'>) => Promise<void>;
  updateScheduleSession: (id: string, updates: Partial<ScheduleSession>) => Promise<void>;
  deleteScheduleSession: (id: string) => Promise<void>;
}
```

**주요 메서드**:

```typescript
// 아동 조회 (역할별 자동 필터링)
const children = await fetchChildren();

// 세션 로그 조회 (날짜 범위 지정)
const logs = getSessionLogsForChild(1, {
  start: '2026-04-20',
  end: '2026-04-27'
});

// 새 세션 로그 추가
await addSessionLog({
  id: 'session-001',
  childId: 1,
  domainId: 'reading',
  ltoId: 'lto-001',
  stoId: 'sto-001',
  date: '2026-04-27',
  startTime: '08:00',
  endTime: '09:00',
  score: 85,
  notes: '긍정적인 태도 보임',
  completed: true
});
```

---

### 2️⃣ ABCContext (행동 분석)

**파일**: `/frontend/src/context/ABCContext.tsx`

```typescript
interface ABCContextType {
  // 데이터
  patterns: ABCPattern[];
  trends: BehaviorTrend[];

  // 메서드
  analyzePatterns: (childId: number, dateRange?: DateRange) => Promise<void>;
  getPatternsForChild: (childId: number) => ABCPattern[];
  getLatestTrend: (childId: number) => BehaviorTrend | undefined;
  savePatternsToStorage: () => void;
  loadPatternsFromStorage: () => void;
}

interface ABCPattern {
  id: string;
  childId: number;
  antecedent: string;      // 선행 조건
  behavior: string;         // 행동
  consequence: string;      // 결과
  frequency: number;        // 빈도
  severity: 'low' | 'medium' | 'high';
  effectiveIntervention?: string;
  lastObservedAt: string;
}
```

**사용 예시**:

```typescript
const { analyzePatterns, getPatternsForChild } = useContext(ABCContext);

// 분석 실행
await analyzePatterns(childId, {
  start: '2026-04-20',
  end: '2026-04-27'
});

// 결과 조회
const patterns = getPatternsForChild(childId);
// → [
//   {
//     antecedent: "새로운 장난감 제시",
//     behavior: "침착할 수 없음",
//     consequence: "10분간 혼자 방에 앉히기",
//     frequency: 3,
//     severity: "high"
//   },
//   ...
// ]
```

---

### 3️⃣ MessageContext (협업)

**파일**: `/frontend/src/context/MessageContext.tsx`

```typescript
interface MessageContextType {
  // 대화
  conversations: Conversation[];
  getConversations: (userId: string, childId?: number) => Conversation[];
  createConversation: (type: 'group' | 'direct', name: string, childId: number, participantIds: string[]) => Promise<Conversation>;

  // 메시지
  messages: Message[];
  getConversationMessages: (conversationId: string) => Message[];
  sendMessage: (conversationId: string, content: string, type: 'text' | 'feedback' | 'milestone', metadata?: any) => Promise<Message>;
  markAsRead: (messageId: string) => Promise<void>;

  // 피드백
  sendFeedback: (childId: number, type: 'progress' | 'concern' | 'suggestion' | 'celebration', content: string) => Promise<Feedback>;
  getFeedbackForChild: (childId: number) => Feedback[];

  // 마일스톤
  shareMilestone: (childId: number, milestone: Milestone) => Promise<void>;
  getMilestonesForChild: (childId: number) => Milestone[];
}
```

---

### 4️⃣ CollaborativeDashboardContext (협업)

**파일**: `/frontend/src/context/CollaborativeDashboardContext.tsx`

```typescript
interface CollaborativeDashboardContextType {
  dashboards: CollaborativeDashboard[];
  notes: CollaborativeNote[];
  goals: DashboardGoal[];

  // 대시보드 관리
  createDashboard: (childId: number, therapistId: string, parentId: string) => Promise<CollaborativeDashboard>;
  updateDashboardStatus: (dashboardId: string, status: 'active' | 'archived') => Promise<void>;

  // 노트 관리
  addNote: (dashboardId: string, content: string, author: string, tags?: string[]) => Promise<CollaborativeNote>;
  updateNote: (noteId: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;

  // 목표 관리
  setGoal: (dashboardId: string, title: string, dueDate: string) => Promise<DashboardGoal>;
  updateGoalProgress: (goalId: string, progress: number) => Promise<void>;
}
```

---

### 5️⃣ AnalyticsContext (분석)

**파일**: `/frontend/src/context/AnalyticsContext.tsx`

```typescript
interface AnalyticsContextType {
  // 데이터
  predictions: BehaviorPrediction[];
  interventionResults: InterventionResult[];
  velocityMetrics: LearningVelocity[];
  autoInsights: AutoInsight[];

  // 메서드
  generatePrediction: (childId: number, sessionLogs: SessionTask[]) => Promise<BehaviorPrediction>;
  analyzeInterventionEffectiveness: (childId: number, interventionName: string, dateRange: DateRange) => Promise<InterventionResult>;
  calculateLearningVelocity: (childId: number, domainId: string, windowDays?: number) => Promise<LearningVelocity>;
  generateAutoInsights: (childId: number) => Promise<AutoInsight[]>;
}
```

---

### Context 관계도

```
                    App.tsx
                       ↓
          ┌────────────┬────────────┬────────────┬────────────┐
          ↓            ↓            ↓            ↓            ↓
      Curriculum   MessageCtx   ABCContext   CDContext   AnalyticsCtx
       Context      (C1)         (C2)         (C3)         (C4)
          ↓            ↓            ↓            ↓            ↓
    ┌─────┴─────┬─────┴─────┬─────┴─────┬─────┴─────┐
    ↓           ↓           ↓           ↓           ↓
  All Pages (useContext로 접근)
  
  의존성:
  - ABCContext → CurriculumContext (sessionLogs 참조)
  - CDContext → CurriculumContext (goals 참조)
  - AnalyticsContext → CurriculumContext (sessionLogs 참조)
  - MessageContext → independent
```

---

## 라우팅 맵

### 전체 라우트 구조

```
AKMS 라우팅 맵 (React Router)

public 라우트
├─ / (Landing)                  → 로그인/프로젝트 소개
└─ /login                       → 로그인 페이지

protected 라우트 (JWT 검증)
├─ /dashboard
│  └─ 관리자/치료사 메인 대시보드
│
├─ /schedule
│  └─ 주간 시간표 (월-토)
│
├─ /children
│  ├─ 아동 목록 (그리드)
│  └─ /children/:childId       → 아동 상세 정보
│
├─ /abc-analysis
│  ├─ ABC 행동 분석 대시보드
│  └─ /abc-analysis/:childId   → 아동별 상세 분석
│
├─ /behavior-prediction
│  └─ 행동 패턴 예측 모델
│
├─ /intervention-analysis
│  └─ 중재 효과 분석
│
├─ /learning-velocity
│  └─ 학습 속도 추적
│
├─ /auto-insights
│  └─ 자동 분석 및 추천
│
├─ /messages
│  ├─ 메시지 목록 (아동별)
│  └─ /messages/:conversationId → 대화 상세
│
├─ /notifications
│  └─ 알림 센터
│
├─ /collaborative-dashboard
│  └─ 협업 대시보드
│
├─ /curriculum
│  └─ 커리큘럼 관리 (관리자용)
│
├─ /completion
│  └─ 완료 목록 & 리포팅
│
├─ /admin-approvals
│  └─ 2단계 승인 시스템
│
├─ /parent-dashboard
│  └─ 부모 전용 대시보드
│
├─ /help
│  └─ 도움말 & 문서
│
└─ *                            → 404 Not Found
```

### 역할별 접근 제어 (RBAC)

```typescript
const roleBasedRoutes = {
  admin: [
    '/dashboard',
    '/children',
    '/schedule',
    '/abc-analysis',
    '/behavior-prediction',
    '/intervention-analysis',
    '/learning-velocity',
    '/auto-insights',
    '/curriculum',
    '/admin-approvals',
    '/notifications'
  ],
  therapist: [
    '/dashboard',
    '/schedule',
    '/children',
    '/abc-analysis',
    '/behavior-prediction',
    '/messages',
    '/collaborative-dashboard',
    '/notifications'
  ],
  parent: [
    '/parent-dashboard',
    '/messages',
    '/children', // 자녀만 조회 가능
    '/notifications'
  ]
};
```

---

## 데이터베이스 스키마

### 테이블 구조

```sql
-- 1. Users 테이블
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'therapist', 'parent') NOT NULL,
  name VARCHAR(255) NOT NULL,
  institution_id INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Children 테이블
CREATE TABLE children (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  age INT,
  phone VARCHAR(20),
  address TEXT,
  notes TEXT,
  color VARCHAR(7), -- hex color (e.g., #FFB6D9)
  photo_url VARCHAR(255),
  therapist_id INT NOT NULL REFERENCES users(id),
  institution_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_therapist (therapist_id),
  INDEX idx_institution (institution_id)
);

-- 3. Curriculum 테이블 (발달영역 + LTO + STO)
CREATE TABLE curriculum (
  id VARCHAR(255) PRIMARY KEY,
  type ENUM('domain', 'lto', 'sto') NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id VARCHAR(255) REFERENCES curriculum(id),
  display_order INT,
  teaching_tips TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_parent (parent_id),
  INDEX idx_type (type)
);

-- 4. Sessions 테이블 (주간 스케줄)
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  day_of_week INT NOT NULL, -- 0=mon, 5=sat
  time_slot_index INT NOT NULL, -- 0-3
  child_id INT NOT NULL REFERENCES children(id),
  session_name VARCHAR(255),
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_child (child_id),
  INDEX idx_schedule (day_of_week, time_slot_index)
);

-- 5. SessionLogs 테이블 (일일 기록)
CREATE TABLE session_logs (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES sessions(id),
  child_id INT NOT NULL REFERENCES children(id),
  domain_id VARCHAR(255) REFERENCES curriculum(id),
  lto_id VARCHAR(255) REFERENCES curriculum(id),
  sto_id VARCHAR(255) REFERENCES curriculum(id),
  log_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  score INT CHECK (score >= 0 AND score <= 100),
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  therapist_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_child_date (child_id, log_date),
  INDEX idx_curriculum (domain_id, lto_id, sto_id),
  INDEX idx_completed (completed)
);

-- 6. Messages 테이블 (협업 메시징)
CREATE TABLE messages (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL,
  sender_id INT NOT NULL REFERENCES users(id),
  recipient_id INT REFERENCES users(id),
  child_id INT NOT NULL REFERENCES children(id),
  type ENUM('text', 'image', 'file', 'feedback', 'milestone') DEFAULT 'text',
  content TEXT NOT NULL,
  attachment_urls TEXT[], -- JSON 배열
  tags TEXT[], -- JSON 배열
  priority ENUM('normal', 'high', 'urgent') DEFAULT 'normal',
  read_at TIMESTAMP,
  metadata JSONB, -- LTO, session info 등
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conversation (conversation_id),
  INDEX idx_sender (sender_id),
  INDEX idx_child (child_id),
  INDEX idx_created (created_at)
);

-- 7. Approvals 테이블 (2단계 승인)
CREATE TABLE approvals (
  id VARCHAR(255) PRIMARY KEY,
  entity_type VARCHAR(255), -- 'curriculum', 'report' 등
  entity_id VARCHAR(255),
  submitted_by INT REFERENCES users(id),
  approved_by INT REFERENCES users(id),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_status (status)
);
```

### 인덱스 전략

```
Primary Indexes (자주 조회):
- children(therapist_id, id)
- session_logs(child_id, log_date)
- sessions(day_of_week, time_slot_index)
- messages(conversation_id, created_at DESC)

Full-Text Search (선택):
- curriculum(name, description)
- session_logs(notes)
```

---

## API 엔드포인트

### 인증

```
POST /api/auth/login
  요청: { email, password, role }
  응답: { token, user: { id, name, role, institutionId } }

POST /api/auth/logout
  응답: { success: true }

GET /api/auth/me
  응답: { user: User }
```

### 아동 관리

```
GET /api/children
  응답: Child[]

POST /api/children
  요청: Omit<Child, 'id'>
  응답: Child

GET /api/children/:id
  응답: Child (상세 정보 포함)

PUT /api/children/:id
  요청: Partial<Child>
  응답: Child

DELETE /api/children/:id
  응답: { success: true }
```

### 세션 로그

```
GET /api/session-logs?childId=1&startDate=2026-04-20&endDate=2026-04-27
  응답: SessionTask[]

POST /api/session-logs
  요청: SessionTask
  응답: SessionTask

PUT /api/session-logs/:id
  요청: Partial<SessionTask>
  응답: SessionTask

DELETE /api/session-logs/:id
  응답: { success: true }
```

### 메시지

```
GET /api/messages/conversations
  응답: Conversation[]

GET /api/messages/conversations/:id
  응답: { conversation: Conversation, messages: Message[] }

POST /api/messages
  요청: { conversationId, content, type, metadata }
  응답: Message

PUT /api/messages/:id/read
  응답: { success: true }
```

### 분석 (C2, C4)

```
GET /api/analysis/abc?childId=1&startDate=2026-04-20&endDate=2026-04-27
  응답: { patterns: ABCPattern[], trends: BehaviorTrend[] }

GET /api/analysis/prediction?childId=1
  응답: BehaviorPrediction[]

GET /api/analysis/intervention?childId=1&intervention=xyz
  응답: InterventionResult[]

GET /api/analysis/learning-velocity?childId=1&domain=reading
  응답: LearningVelocity[]

GET /api/analysis/auto-insights?childId=1
  응답: AutoInsight[]
```

자세한 API 명세는 [`API_REFERENCE.md`](API_REFERENCE.md)를 참조하세요.

---

## 보안 아키텍처

### 인증 & 인가

```
Request Flow:
  1. 사용자 로그인 (email, password, role)
  2. 백엔드: bcrypt로 비밀번호 검증
  3. JWT 생성 (HS256, 24시간 만료)
  4. HTTP-only Cookie 설정 (CSRF 방지)
  5. 클라이언트: localStorage에 사용자 정보 저장

Protected Routes:
  1. 모든 API 요청: Authorization 헤더 확인
  2. 토큰 검증 (만료, 서명 확인)
  3. 사용자 역할 확인 (RBAC)
  4. 리소스 소유권 검증 (아동별 접근 제어)

토큰 만료 처리:
  1. 401 응답 수신
  2. 자동 로그아웃
  3. 로그인 페이지 리다이렉트
```

### 데이터 보호

```
민감한 데이터:
- 비밀번호: bcrypt (salt rounds: 10)
- 개인정보: DB 수준 암호화 (optional)
- API 응답: HTTPS 전송 필수
- 이미지: S3-compatible 스토리지 (CDN)

접근 제어:
- 아동 정보: therapist_id 소유권 확인
- 메시지: 참여자만 조회 가능
- 세션 로그: 담당 치료사만 수정 가능
```

---

**마지막 업데이트**: 2026-04-27  
**문서 버전**: 2.0 (Phase 5 P3)

더 자세한 정보는 다른 문서들을 참조하세요:
- 📖 [README.md](README.md) — 프로젝트 개요
- 👥 [USER_GUIDE.md](USER_GUIDE.md) — 사용자 가이드
- 💻 [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) — 개발자 가이드
- 🚀 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — 배포 가이드
- 📚 [API_REFERENCE.md](API_REFERENCE.md) — API 레퍼런스
