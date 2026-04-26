# 📚 AKMS API 레퍼런스

> **모든 Context 함수, API 엔드포인트, 사용 예시, 에러 처리**

---

## 📋 목차

1. [전체 API 개요](#전체-api-개요)
2. [CurriculumContext](#curriculumcontext)
3. [MessageContext](#messagecontext)
4. [ABCContext](#abccontext)
5. [CollaborativeDashboardContext](#collaborativedashboardcontext)
6. [AnalyticsContext](#analyticscontext)
7. [REST API 엔드포인트](#rest-api-엔드포인트)
8. [에러 처리](#에러-처리)
9. [인증 & 권한](#인증--권한)
10. [Rate Limiting](#rate-limiting)

---

## 전체 API 개요

```
┌─────────────────────────────────────────────────────────┐
│                  Context API (프론트엔드)                │
├─────────────────────────────────────────────────────────┤
│ CurriculumContext     MessageContext     ABCContext     │
│ CollaborativeDash...  AnalyticsContext   ...            │
└─────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────┐
│                  REST API (백엔드)                       │
├─────────────────────────────────────────────────────────┤
│ POST   /api/auth/login                                  │
│ GET    /api/children                                    │
│ POST   /api/session-logs                               │
│ GET    /api/messages/conversations                      │
│ POST   /api/analysis/abc                               │
│ ...                                                     │
└─────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                    │
└─────────────────────────────────────────────────────────┘
```

---

## CurriculumContext

### 개요

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

  // 세션 로그
  sessionLogs: SessionTask[];
  addSessionLog: (log: SessionTask) => Promise<void>;
  getSessionLogsForChild: (childId: number, dateRange?: DateRange) => SessionTask[];

  // 스케줄
  scheduleSessions: ScheduleSession[];
  addScheduleSession: (session: Omit<ScheduleSession, 'id'>) => Promise<void>;
}
```

### 아동 관리 메서드

#### `fetchChildren()`

아동 목록 조회

```typescript
// 사용
const { fetchChildren, children } = useCurriculum();

useEffect(() => {
  fetchChildren();
}, [fetchChildren]);

// 결과
console.log(children);
// [{
//   id: 1,
//   name: '민준',
//   age: 3,
//   birthDate: '2021-01-15',
//   phone: '010-1234-5678',
//   address: '서울시 강남구',
//   color: '#FFB6D9',
//   photo: null
// }, ...]
```

**역할별 필터**:
- Admin: 모든 아동 조회
- Therapist: 담당 아동만 조회
- Parent: 자녀만 조회

---

#### `addChild(child)`

새 아동 추가

```typescript
const { addChild } = useCurriculum();

const newChild = await addChild({
  name: '소영',
  age: 3,
  birthDate: '2021-06-10',
  phone: '010-2345-6789',
  address: '서울시 서초구',
  color: '#B4D7FF',
  notes: '활발한 성격',
  photo: null
});

// 반환값
console.log(newChild);
// {
//   id: 2,
//   name: '소영',
//   ...
// }
```

**파라미터**:
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| name | string | ✅ | 아동 이름 |
| age | number | ✅ | 나이 |
| birthDate | string (YYYY-MM-DD) | ✅ | 생년월일 |
| phone | string | - | 연락처 |
| address | string | - | 주소 |
| color | string (hex) | - | 표시 색상 |
| notes | string | - | 메모 |
| photo | string (URL) | - | 사진 URL |

---

#### `updateChild(id, updates)`

아동 정보 수정

```typescript
const { updateChild } = useCurriculum();

await updateChild(1, {
  name: '민준이',
  notes: '집중력이 좋아졌어요'
});
```

---

#### `deleteChild(id)`

아동 삭제 (완전 삭제 아님, 비활성화)

```typescript
const { deleteChild } = useCurriculum();

await deleteChild(1);
// 주의: 관련 데이터는 유지, 목록에서만 제외
```

---

### 세션 로그 메서드

#### `addSessionLog(log)`

새 세션 로그 추가

```typescript
const { addSessionLog } = useCurriculum();

const sessionLog: SessionTask = {
  id: 'session-001',
  childId: 1,
  domainId: 'reading',
  ltoId: 'lto-001',
  stoId: 'sto-001-01',
  date: '2026-04-27',
  startTime: '08:00',
  endTime: '09:00',
  score: 85,
  notes: '한글 ㄱ 인식 완벽함',
  completed: true
};

await addSessionLog(sessionLog);
```

**SessionTask 인터페이스**:

```typescript
interface SessionTask {
  id: string;              // 고유 ID (uuid)
  childId: number;         // 아동 ID (1-4)
  domainId: string;        // 발달영역 ('reading', 'writing', 'math')
  ltoId: string;          // 장기목표 ID ('lto-001', ...)
  stoId: string;          // 단기목표 ID ('sto-001-01', ...)
  date: string;           // 날짜 (YYYY-MM-DD)
  startTime: string;      // 시작 시간 (HH:MM)
  endTime: string;        // 종료 시간 (HH:MM)
  score: number;          // 점수 (0-100)
  notes: string;          // 관찰 메모
  completed: boolean;     // 완료 여부
  completedAt?: string;   // 완료 시간 (ISO 8601)
}
```

---

#### `getSessionLogsForChild(childId, dateRange?)`

아동의 세션 로그 조회

```typescript
const { getSessionLogsForChild } = useCurriculum();

// 최근 7일
const logs = getSessionLogsForChild(1, {
  start: '2026-04-20',
  end: '2026-04-27'
});

// 모든 로그 (날짜 범위 없음)
const allLogs = getSessionLogsForChild(1);
```

---

### 스케줄 메서드

#### `addScheduleSession(session)`

주간 스케줄에 세션 추가

```typescript
const { addScheduleSession } = useCurriculum();

await addScheduleSession({
  dayOfWeek: 0,           // 0=월요일, 5=토요일
  timeSlotIndex: 0,       // 0=08:00, 1=10:00, 2=14:00, 3=16:00
  childId: 1,
  childName: '민준',
  sessionName: '한글 학습',
  startTime: 8,           // 시간 (hour)
  endTime: 9,
  color: '#FFB6D9'
});
```

---

## MessageContext

### 개요

```typescript
interface MessageContextType {
  // 대화 관리
  conversations: Conversation[];
  getConversations: (userId: string, childId?: number) => Conversation[];
  createConversation: (type: 'group' | 'direct', name: string, childId: number, participantIds: string[]) => Promise<Conversation>;

  // 메시지
  messages: Message[];
  getConversationMessages: (conversationId: string) => Message[];
  sendMessage: (conversationId: string, content: string, type: MessageType, metadata?: any) => Promise<Message>;
  markAsRead: (messageId: string) => Promise<void>;

  // 피드백
  sendFeedback: (childId: number, type: FeedbackType, content: string) => Promise<Feedback>;
  getFeedbackForChild: (childId: number) => Feedback[];

  // 마일스톤
  shareMilestone: (childId: number, milestone: Milestone) => Promise<void>;
}
```

### 메시지 타입

```typescript
type MessageType = 'text' | 'image' | 'file' | 'feedback' | 'milestone';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'therapist' | 'parent' | 'admin';
  childId: number;
  type: MessageType;
  content: string;
  attachments?: MessageAttachment[];
  tags?: string[];
  priority?: 'normal' | 'high' | 'urgent';
  createdAt: string;
  readAt?: string;
  reactions?: MessageReaction[];
}
```

### 메서드 예시

#### `sendMessage(conversationId, content, type, metadata?)`

메시지 전송

```typescript
const { sendMessage } = useMessage();

// 일반 메시지
await sendMessage(
  'conv-001',
  '민준이가 오늘 한글을 잘 배웠어요!',
  'text'
);

// 피드백 메시지
await sendMessage(
  'conv-001',
  '한글 학습 LTO 달성!',
  'feedback',
  {
    ltoId: 'lto-001',
    category: 'reading',
    actionItems: ['가정에서도 매일 10분 복습']
  }
);

// 마일스톤 메시지
await sendMessage(
  'conv-001',
  '🎉 한글 학습 마일스톤 달성!',
  'milestone',
  {
    milestoneId: 'milestone-001',
    achievement: 'LTO 완료'
  }
);
```

---

#### `sendFeedback(childId, type, content)`

피드백 전송

```typescript
const { sendFeedback } = useMessage();

const feedback = await sendFeedback(
  1,  // childId
  'progress',  // type: 'progress' | 'concern' | 'suggestion' | 'celebration'
  '이번 주 한글 학습에서 ㄱ, ㄴ을 완벽히 구분하고 있습니다. ' +
  '다음 주에는 ㄷ, ㄹ 학습을 시작하겠습니다.'
);

// 반환값
console.log(feedback);
// {
//   id: 'feedback-001',
//   childId: 1,
//   type: 'progress',
//   content: '...',
//   sentiment: 'positive',
//   createdAt: '2026-04-27T10:30:00Z'
// }
```

---

## ABCContext

### 개요

```typescript
interface ABCContextType {
  patterns: ABCPattern[];
  trends: BehaviorTrend[];

  analyzePatterns: (childId: number, dateRange?: DateRange) => Promise<void>;
  getPatternsForChild: (childId: number) => ABCPattern[];
  getLatestTrend: (childId: number) => BehaviorTrend | undefined;
}
```

### ABC 분석 데이터 구조

```typescript
interface ABCPattern {
  id: string;
  childId: number;
  antecedent: string;      // 선행 조건 (A)
  behavior: string;         // 행동 (B)
  consequence: string;      // 결과/후속 (C)
  frequency: number;        // 빈도 (몇 회 관찰됨)
  severity: 'low' | 'medium' | 'high';
  effectiveIntervention?: string;
  lastObservedAt: string;   // ISO 8601
}

interface BehaviorTrend {
  childId: number;
  period: 'weekly' | 'monthly';
  mostCommonPattern: string;
  frequencyTrend: 'stable' | 'increasing' | 'decreasing';
  avgScore: number;
  recommendations: string[];
}
```

### 메서드 예시

#### `analyzePatterns(childId, dateRange?)`

행동 패턴 분석 실행

```typescript
const { analyzePatterns, getPatternsForChild } = useABC();

// 분석 실행 (최근 7일)
await analyzePatterns(1, {
  start: '2026-04-20',
  end: '2026-04-27'
});

// 결과 조회
const patterns = getPatternsForChild(1);
patterns.forEach(pattern => {
  console.log(`
    선행조건: ${pattern.antecedent}
    행동: ${pattern.behavior}
    결과: ${pattern.consequence}
    빈도: ${pattern.frequency}회
    심각도: ${pattern.severity}
    제안: ${pattern.effectiveIntervention}
  `);
});
```

**결과 예시**:

```
┌────────────────────────────────────────┐
│ 패턴 1: 새로운 과제 제시               │
├────────────────────────────────────────┤
│ 행동: 침착할 수 없음                   │
│ 결과: 10분간 혼자 방에 앉히기          │
│ 빈도: 3회 (최근 7일)                   │
│ 심각도: 높음 (High)                    │
│ 제안: 감각 장난감 제공 후 과제 제시    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 패턴 2: 친구와의 상호작용              │
├────────────────────────────────────────┤
│ 행동: 적극적 참여                      │
│ 결과: 칭찬 및 보상 제공                │
│ 빈도: 5회                              │
│ 심각도: 낮음 (Low)                     │
│ 제안: 계속 강화                        │
└────────────────────────────────────────┘
```

---

## CollaborativeDashboardContext

### 개요

```typescript
interface CollaborativeDashboardContextType {
  dashboards: CollaborativeDashboard[];
  notes: CollaborativeNote[];
  goals: DashboardGoal[];

  createDashboard: (childId: number, therapistId: string, parentId: string) => Promise<CollaborativeDashboard>;
  addNote: (dashboardId: string, content: string, author: string) => Promise<CollaborativeNote>;
  updateGoalProgress: (goalId: string, progress: number) => Promise<void>;
}
```

### 데이터 구조

```typescript
interface CollaborativeDashboard {
  id: string;
  childId: number;
  therapistId: string;
  parentId: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface CollaborativeNote {
  id: string;
  dashboardId: string;
  content: string;
  author: string;  // userId
  authorRole: 'therapist' | 'parent';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface DashboardGoal {
  id: string;
  dashboardId: string;
  title: string;
  description?: string;
  dueDate: string;
  progress: number;  // 0-100
  status: 'completed' | 'on_track' | 'at_risk';
  createdAt: string;
  updatedAt: string;
}
```

### 메서드 예시

#### `addNote(dashboardId, content, author)`

협업 노트 추가

```typescript
const { addNote } = useCollaborativeDashboard();

const note = await addNote(
  'dashboard-001',
  '이번 주 한글 학습에서 좋은 진전이 있었습니다. ' +
  '다음 주에는 더 어려운 단어를 시도해봅시다.',
  'therapist-001'
);
```

---

#### `updateGoalProgress(goalId, progress)`

목표 진행률 업데이트

```typescript
const { updateGoalProgress } = useCollaborativeDashboard();

// 50% 완료
await updateGoalProgress('goal-001', 50);

// 100% 완료
await updateGoalProgress('goal-001', 100);
```

---

## AnalyticsContext

### 개요

```typescript
interface AnalyticsContextType {
  predictions: BehaviorPrediction[];
  interventionResults: InterventionResult[];
  velocityMetrics: LearningVelocity[];

  generatePrediction: (childId: number, sessionLogs: SessionTask[]) => Promise<BehaviorPrediction>;
  analyzeInterventionEffectiveness: (childId: number, interventionName: string, dateRange: DateRange) => Promise<InterventionResult>;
  calculateLearningVelocity: (childId: number, domainId: string, windowDays?: number) => Promise<LearningVelocity>;
}
```

### 데이터 구조

```typescript
interface BehaviorPrediction {
  childId: number;
  predictedBehavior: string;
  confidence: number;  // 0-1 (확률)
  recommendedIntervention: string;
  timeHorizon: '24h' | '1w' | '1m';  // 예측 기간
}

interface InterventionResult {
  interventionName: string;
  applicationCount: number;  // 적용 횟수
  successRate: number;        // 0-1
  avgScore: number;           // 0-100
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

interface LearningVelocity {
  childId: number;
  domainId: string;
  initialScore: number;
  currentScore: number;
  scoreChange: number;  // 점수 변화량
  daysElapsed: number;
  scorePerDay: number;  // 일일 증가량
  projectedCompletionDate: string;  // YYYY-MM-DD
}
```

### 메서드 예시

#### `calculateLearningVelocity(childId, domainId, windowDays?)`

학습 속도 계산

```typescript
const { calculateLearningVelocity } = useAnalytics();

const velocity = await calculateLearningVelocity(
  1,          // childId
  'reading',  // domainId
  30          // 최근 30일 (선택사항, 기본값: 7일)
);

console.log(`
  초기 점수: ${velocity.initialScore}점
  현재 점수: ${velocity.currentScore}점
  진행률: +${velocity.scoreChange}점
  일일 증가: ${velocity.scorePerDay}점/일
  예상 완료일: ${velocity.projectedCompletionDate}
`);

// 예시 출력
// 초기 점수: 45점
// 현재 점수: 85점
// 진행률: +40점
// 일일 증가: 1.3점/일
// 예상 완료일: 2026-05-15
```

---

## REST API 엔드포인트

### 인증 (Auth)

#### `POST /api/auth/login`

로그인

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "therapist@akms.local",
    "password": "password123",
    "role": "therapist"
  }'
```

**요청**:

```typescript
interface LoginRequest {
  email: string;
  password: string;
  role: 'admin' | 'therapist' | 'parent';
}
```

**응답** (200 OK):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-001",
    "email": "therapist@akms.local",
    "role": "therapist",
    "name": "김치료사"
  }
}
```

**에러**:

```json
{
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

---

#### `POST /api/auth/logout`

로그아웃

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer {token}"
```

**응답** (200 OK):

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 아동 관리 (Children)

#### `GET /api/children`

아동 목록 조회

```bash
curl -X GET http://localhost:3001/api/children \
  -H "Authorization: Bearer {token}"
```

**응답** (200 OK):

```json
[
  {
    "id": 1,
    "name": "민준",
    "age": 3,
    "birthDate": "2021-01-15",
    "phone": "010-1234-5678",
    "address": "서울시 강남구",
    "color": "#FFB6D9",
    "photo": "https://...",
    "notes": "언어발달 우수"
  },
  ...
]
```

---

#### `POST /api/children`

아동 추가

```bash
curl -X POST http://localhost:3001/api/children \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "소영",
    "age": 3,
    "birthDate": "2021-06-10",
    "phone": "010-2345-6789",
    "address": "서울시 서초구",
    "color": "#B4D7FF",
    "notes": "활발한 성격"
  }'
```

**응답** (201 Created):

```json
{
  "id": 2,
  "name": "소영",
  ...
}
```

---

### 세션 로그 (Session Logs)

#### `GET /api/session-logs`

세션 로그 조회

```bash
curl -X GET "http://localhost:3001/api/session-logs?childId=1&startDate=2026-04-20&endDate=2026-04-27" \
  -H "Authorization: Bearer {token}"
```

**쿼리 파라미터**:

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| childId | number | ✅ | 아동 ID |
| startDate | string | - | 시작 날짜 (YYYY-MM-DD) |
| endDate | string | - | 종료 날짜 (YYYY-MM-DD) |

**응답** (200 OK):

```json
[
  {
    "id": "log-001",
    "childId": 1,
    "domainId": "reading",
    "ltoId": "lto-001",
    "stoId": "sto-001-01",
    "date": "2026-04-27",
    "startTime": "08:00",
    "endTime": "09:00",
    "score": 85,
    "notes": "한글 학습 완벽함",
    "completed": true,
    "completedAt": "2026-04-27T09:00:00Z"
  }
]
```

---

#### `POST /api/session-logs`

세션 로그 생성

```bash
curl -X POST http://localhost:3001/api/session-logs \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "childId": 1,
    "domainId": "reading",
    "ltoId": "lto-001",
    "stoId": "sto-001-01",
    "date": "2026-04-27",
    "startTime": "08:00",
    "endTime": "09:00",
    "score": 85,
    "notes": "좋은 진행",
    "completed": true
  }'
```

---

### 메시지 (Messages)

#### `GET /api/messages/conversations`

대화 목록 조회

```bash
curl -X GET http://localhost:3001/api/messages/conversations \
  -H "Authorization: Bearer {token}"
```

**응답** (200 OK):

```json
[
  {
    "id": "conv-001",
    "type": "group",
    "name": "민준과의 협업",
    "childId": 1,
    "lastMessage": {
      "id": "msg-001",
      "content": "이번주 좋은 진전이 있었어요",
      "createdAt": "2026-04-27T10:30:00Z"
    },
    "unreadCount": 2
  }
]
```

---

#### `POST /api/messages`

메시지 전송

```bash
curl -X POST http://localhost:3001/api/messages \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv-001",
    "content": "민준이가 한글을 잘 배우고 있어요",
    "type": "feedback",
    "metadata": {
      "ltoId": "lto-001",
      "category": "reading"
    }
  }'
```

**응답** (201 Created):

```json
{
  "id": "msg-002",
  "conversationId": "conv-001",
  "content": "민준이가 한글을 잘 배우고 있어요",
  "type": "feedback",
  "createdAt": "2026-04-27T10:35:00Z"
}
```

---

### 분석 (Analysis)

#### `GET /api/analysis/abc`

ABC 분석 조회

```bash
curl -X GET "http://localhost:3001/api/analysis/abc?childId=1&startDate=2026-04-20&endDate=2026-04-27" \
  -H "Authorization: Bearer {token}"
```

**응답** (200 OK):

```json
{
  "patterns": [
    {
      "id": "pattern-001",
      "antecedent": "새로운 과제 제시",
      "behavior": "침착할 수 없음",
      "consequence": "격리",
      "frequency": 3,
      "severity": "high",
      "effectiveIntervention": "감각 장난감 제공"
    }
  ],
  "trends": [
    {
      "childId": 1,
      "period": "weekly",
      "mostCommonPattern": "새로운 과제 제시 → 침착할 수 없음",
      "frequencyTrend": "stable",
      "avgScore": 82
    }
  ]
}
```

---

#### `GET /api/analysis/learning-velocity`

학습 속도 조회

```bash
curl -X GET "http://localhost:3001/api/analysis/learning-velocity?childId=1&domain=reading&days=30" \
  -H "Authorization: Bearer {token}"
```

**응답** (200 OK):

```json
{
  "childId": 1,
  "domainId": "reading",
  "initialScore": 45,
  "currentScore": 85,
  "scoreChange": 40,
  "daysElapsed": 30,
  "scorePerDay": 1.33,
  "projectedCompletionDate": "2026-05-15"
}
```

---

## 에러 처리

### 표준 에러 응답

모든 에러는 다음 형식을 따릅니다:

```typescript
interface ErrorResponse {
  error: string;              // 사용자 친화적 메시지
  code: string;               // 에러 코드
  details?: Record<string, any>;  // 추가 정보
}
```

### HTTP 상태 코드

| 상태 | 의미 | 예시 |
|------|------|------|
| 400 | Bad Request | 필수 필드 누락 |
| 401 | Unauthorized | 인증 없음 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 중복 데이터 |
| 500 | Server Error | 내부 오류 |

### 에러 처리 예시

```typescript
try {
  const response = await fetch('/api/children', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`[${error.code}] ${error.error}`);
    
    switch (response.status) {
      case 401:
        // 로그인 페이지로 리다이렉트
        window.location.href = '/login';
        break;
      case 403:
        // 권한 없음 알림
        alert('이 작업을 수행할 권한이 없습니다');
        break;
      case 404:
        // 항목 없음
        alert('요청한 항목을 찾을 수 없습니다');
        break;
    }
    return;
  }

  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error('네트워크 오류:', error);
}
```

---

## 인증 & 권한

### JWT 토큰

모든 API 요청에 토큰 포함:

```bash
curl -X GET http://localhost:3001/api/protected \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 역할별 권한 (RBAC)

```typescript
const permissions = {
  admin: [
    'read:all-children',
    'write:children',
    'delete:children',
    'read:all-session-logs',
    'write:session-logs',
    'delete:session-logs',
    'manage:users',
    'manage:curriculum'
  ],
  therapist: [
    'read:assigned-children',
    'write:session-logs',
    'read:own-session-logs',
    'send:messages',
    'read:messages'
  ],
  parent: [
    'read:own-child',
    'send:messages',
    'read:messages',
    'read:own-session-logs'
  ]
};
```

---

## Rate Limiting

API 호출 제한:

```
- 일반 엔드포인트: 100 요청/15분
- 분석 엔드포인트: 10 요청/분
- 파일 업로드: 5 요청/분
- 인증: 5 실패/15분 (계정 잠금)
```

**헤더**:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1619793600
```

**제한 초과 응답** (429 Too Many Requests):

```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 300
}
```

---

**마지막 업데이트**: 2026-04-27  
**문서 버전**: 2.0 (Phase 5 P3)

더 자세한 정보:
- 📖 [README.md](README.md) — 프로젝트 개요
- 💻 [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) — 개발자 가이드
- 👥 [USER_GUIDE.md](USER_GUIDE.md) — 사용자 가이드
- 🚀 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — 배포 가이드
