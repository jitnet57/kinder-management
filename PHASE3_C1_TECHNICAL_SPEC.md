# AKMS Phase 3 Stream C1: 기술 명세서

## 목차

1. [인터페이스 정의](#인터페이스-정의)
2. [컴포넌트 명세](#컴포넌트-명세)
3. [컨텍스트 함수](#컨텍스트-함수)
4. [통합 계획](#통합-계획)
5. [API 시뮬레이션](#api-시뮬레이션)

---

## 인터페이스 정의

### Message 인터페이스

**위치**: `/frontend/src/types/index.ts`

```typescript
export interface MessageAttachment {
  id: string;
  filename: string;
  type: string;                    // 'image/png', 'application/pdf' 등
  url: string;                     // blob URL 또는 서버 URL
  uploadedAt: string;              // ISO 8601
}

export interface MessageReaction {
  emoji: string;                   // '👍', '❤️', '🎉' 등
  count: number;                   // 반응 개수
  userIds: string[];               // 반응한 사용자 ID 목록
}

export interface MessageMetadata {
  relatedLtoId?: string;           // 관련 LTO ID
  sessionDate?: string;            // 세션 날짜
  scoreImprovement?: number;       // 점수 개선도 (0-100)
}

export interface Message {
  id: string;                      // 고유 ID (msg_${timestamp})
  conversationId: string;          // 속한 대화 ID
  senderId: string;                // 발신자 ID
  senderName: string;              // 발신자 이름
  senderRole: 'therapist' | 'parent' | 'admin';
  recipientId?: string;            // 1:1 메시지 수신자 ID
  childId: number;                 // 아동 ID (1-4)
  
  type: 'text' | 'image' | 'file' | 'feedback' | 'milestone';
  content: string;                 // 메시지 본문
  
  attachments?: MessageAttachment[];
  tags?: string[];                 // '#진행상황', '#가정활동' 등
  priority?: 'normal' | 'high' | 'urgent';
  
  createdAt: string;               // ISO 8601 (예: "2026-04-27T10:30:00Z")
  readAt?: string;                 // 읽은 시간 (없으면 미읽)
  reactions?: MessageReaction[];
  metadata?: MessageMetadata;
}
```

**예시**:
```json
{
  "id": "msg_1714212600000",
  "conversationId": "conv_1714212500000",
  "senderId": "user_therapist_001",
  "senderName": "김치료사",
  "senderRole": "therapist",
  "childId": 1,
  "type": "text",
  "content": "민준이가 오늘 요청 기술에서 85점을 받았어요!",
  "tags": ["#진행상황", "#요청"],
  "priority": "normal",
  "createdAt": "2026-04-27T10:30:00Z",
  "reactions": [
    {"emoji": "👍", "count": 1, "userIds": ["user_parent_001"]}
  ],
  "metadata": {
    "relatedLtoId": "domain_mand_lto01",
    "sessionDate": "2026-04-27",
    "scoreImprovement": 5
  }
}
```

### Conversation 인터페이스

```typescript
export interface ConversationParticipant {
  userId: string;
  name: string;
  role: 'therapist' | 'parent' | 'admin';
  joinedAt: string;               // ISO 8601
}

export interface Conversation {
  id: string;                      // 고유 ID (conv_${timestamp})
  type: 'group' | 'direct';
  name: string;                    // 예: "민준 진행상황", "민준-김치료사 1:1"
  childId: number;                 // 관련 아동 ID (1-4)
  
  participants: ConversationParticipant[];
  lastMessage?: Message;           // 마지막 메시지 (미리보기용)
  
  unreadCount: Record<string, number>;  // { "user_123": 5, ... }
  
  createdAt: string;               // ISO 8601
  updatedAt: string;               // 마지막 활동 시간
  isPinned?: boolean;              // 고정 여부
}
```

**예시**:
```json
{
  "id": "conv_1714212500000",
  "type": "group",
  "name": "민준 진행상황",
  "childId": 1,
  "participants": [
    {
      "userId": "user_therapist_001",
      "name": "김치료사",
      "role": "therapist",
      "joinedAt": "2026-04-01T09:00:00Z"
    },
    {
      "userId": "user_parent_001",
      "name": "민준 엄마",
      "role": "parent",
      "joinedAt": "2026-04-01T09:00:00Z"
    }
  ],
  "lastMessage": { /* Message 객체 */ },
  "unreadCount": {
    "user_therapist_001": 0,
    "user_parent_001": 2
  },
  "createdAt": "2026-04-01T09:00:00Z",
  "updatedAt": "2026-04-27T10:30:00Z",
  "isPinned": true
}
```

### Feedback 인터페이스

```typescript
export interface FeedbackEvidence {
  date: string;                    // ISO 8601
  observation: string;             // 관찰 내용
  photoUrl?: string;               // 증거 사진 URL
}

export interface FeedbackActionItem {
  id: string;                      // 고유 ID (action_${timestamp})
  title: string;                   // 예: "집에서 요청 연습하기"
  dueDate: string;                 // ISO 8601
  assignedTo: string;              // 담당자 (부모/치료사 이름)
  status: 'pending' | 'in_progress' | 'completed';
}

export interface FeedbackCategory {
  domain: string;                  // 도메인명 (예: "의무/요청")
  ltoId: string;                   // LTO ID
  skill: string;                   // 스킬명
}

export interface Feedback {
  id: string;                      // 고유 ID (feedback_${timestamp})
  conversationId: string;
  senderId: string;
  senderRole: 'therapist' | 'parent';
  childId: number;                 // 아동 ID (1-4)
  
  type: 'progress' | 'concern' | 'suggestion' | 'celebration';
  category?: FeedbackCategory;
  
  content: string;                 // 피드백 본문
  evidence?: FeedbackEvidence[];   // 근거 (최대 5개)
  actionItems?: FeedbackActionItem[];  // 실행 항목 (최대 10개)
  
  sentiment?: 'positive' | 'neutral' | 'concerning';
  urgency?: 'low' | 'medium' | 'high';
  
  responses?: Message[];           // 해당 피드백에 대한 응답들
  createdAt: string;               // ISO 8601
}
```

**예시 (진행상황 피드백)**:
```json
{
  "id": "feedback_1714212600001",
  "conversationId": "conv_1714212500000",
  "senderId": "user_therapist_001",
  "senderRole": "therapist",
  "childId": 1,
  "type": "progress",
  "category": {
    "domain": "의무/요청",
    "ltoId": "domain_mand_lto01",
    "skill": "구두 요청에 반응하기"
  },
  "content": "이번주 요청에 대한 반응율이 80%에서 85%로 향상되었어요. 특히 음식 관련 요청에 더 빠르게 반응합니다.",
  "evidence": [
    {
      "date": "2026-04-25",
      "observation": "간식을 달라는 요청에 즉시 반응",
      "photoUrl": "blob:http://..."
    },
    {
      "date": "2026-04-26",
      "observation": "인사 신호에 따라 인사하기 시연"
    }
  ],
  "actionItems": [
    {
      "id": "action_1",
      "title": "집에서 요청 기술 연습하기",
      "dueDate": "2026-05-04",
      "assignedTo": "민준 엄마",
      "status": "in_progress"
    }
  ],
  "sentiment": "positive",
  "urgency": "low",
  "createdAt": "2026-04-27T10:00:00Z"
}
```

### Milestone 인터페이스

```typescript
export interface MilestoneWitness {
  name: string;                    // 증인 이름
  role: string;                    // 역할 (치료사, 부모, 교사 등)
}

export interface Milestone {
  id: string;                      // 고유 ID (milestone_${timestamp})
  childId: number;                 // 아동 ID (1-4)
  
  achievementDate: string;         // ISO 8601
  
  type: 'lto_completed' | 'domain_mastered' | 'behavior_improvement' | 'social_achievement';
  
  title: string;                   // 예: "의무/요청 도메인 완성!"
  description: string;             // 설명
  relatedLtoId?: string;           // 관련 LTO
  photo?: string;                  // 기념 사진 URL
  
  celebrationMessage: string;      // 축하 메시지 (크게 표시)
  witnesses: MilestoneWitness[];   // 증인 목록
}
```

**예시**:
```json
{
  "id": "milestone_1714212700000",
  "childId": 1,
  "achievementDate": "2026-04-27",
  "type": "lto_completed",
  "title": "의무/요청 도메인 완성!",
  "description": "민준이가 의무/요청 도메인의 모든 단기 목표를 달성했어요.",
  "relatedLtoId": "domain_mand_lto01",
  "photo": "https://example.com/photos/milestone_123.jpg",
  "celebrationMessage": "축하합니다! 민준이가 의무/요청 도메인을 완성했어요! 🎉",
  "witnesses": [
    {
      "name": "김치료사",
      "role": "therapist"
    },
    {
      "name": "민준 엄마",
      "role": "parent"
    }
  ]
}
```

---

## 컴포넌트 명세

### ChatWindow

**파일**: `/frontend/src/components/ChatWindow.tsx`

```typescript
interface ChatWindowProps {
  conversationId: string;          // 대화 ID
  childId: number;                 // 아동 ID (1-4)
  childName: string;               // 아동 이름 (표시용)
}

function ChatWindow({ conversationId, childId, childName }: ChatWindowProps) {
  // 내부 상태
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 메시지 로드 (마운트 시)
  useEffect(() => { loadMessages(); }, [conversationId]);
  
  // 자동 스크롤 (메시지 수신 시)
  useEffect(() => { scrollToBottom(); }, [messages]);
  
  // 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => { ... };
  
  // 파일 첨부
  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => { ... };
}
```

**렌더 구조**:
```
<div className="flex flex-col h-full">
  ┌─────────────────────────────────────┐
  │ 헤더 (그래디언트 배경)               │
  │ "민준 진행상황"                      │
  ├─────────────────────────────────────┤
  │ 메시지 영역 (스크롤 가능)            │
  │ ┌─────────┐     ┌──────────┐       │
  │ │ 수신    │     │  발신    │       │
  │ │ 메시지  │     │  메시지  │       │
  │ └─────────┘     └──────────┘       │
  ├─────────────────────────────────────┤
  │ 입력 필드 + 버튼                    │
  └─────────────────────────────────────┘
```

**기능**:
- `loadMessages()`: 대화 메시지 로드 (limit=50)
- `handleSendMessage()`: 메시지 생성 및 저장
- `handleAttachFile()`: 파일 업로드 및 전송
- `scrollToBottom()`: 자동 스크롤

### MessageBubble

**파일**: `/frontend/src/components/MessageBubble.tsx`

```typescript
interface MessageBubbleProps {
  message: Message;
  onReact?: (emoji: string) => void;
  onReply?: (messageId: string) => void;
}
```

**렌더 구조**:
```
┌────────────────────────────────────┐
│ 발신자 정보 (수신 메시지만)        │
├────────────────────────────────────┤
│ [아이콘] 메시지 내용              │
├────────────────────────────────────┤
│ 태그들: #진행상황 #요청           │
├────────────────────────────────────┤
│ 첨부파일 링크들                    │
├────────────────────────────────────┤
│ 시간 | ✓ (읽음)                   │
├────────────────────────────────────┤
│ 반응 이모지들                      │
└────────────────────────────────────┘
```

**메시지 타입별 아이콘**:
- `text`: (없음)
- `image`: 🖼️
- `file`: 📎
- `feedback`: 💬
- `milestone`: 🎉

**우선순위 시각화**:
- `urgent`: 왼쪽 빨간 선 (border-l-4)
- `high`: 왼쪽 주황 선
- `normal`: (없음)

### FeedbackCard

**파일**: `/frontend/src/components/FeedbackCard.tsx`

```typescript
interface FeedbackCardProps {
  feedback: Feedback;
  onStatusChange?: (actionId: string, status: 'pending' | 'in_progress' | 'completed') => void;
  onDelete?: (feedbackId: string) => void;
}
```

**렌더 구조**:
```
┌──────────────────────────────────────────┐
│ [아이콘] 진행상황 | [긴급] [중요]       │
├──────────────────────────────────────────┤
│ 피드백 내용                              │
│ 영역: 의무/요청 > 구두 요청에 반응하기  │
├──────────────────────────────────────────┤
│ 근거 [펼치기/접기]                      │
│ ├─ 2026-04-25: 간식을 달라는 요청 즉시 반응
│ │  📸 사진 보기                          │
│ └─ 2026-04-26: 인사 신호에 따라 인사    │
├──────────────────────────────────────────┤
│ 실행 항목 (3/3) [펼치기/접기]           │
│ ☑ 집에서 요청 연습 | 담당: 엄마 | ~05-04
├──────────────────────────────────────────┤
│ 2026-04-27 10:00                        │
└──────────────────────────────────────────┘
```

**타입별 색상**:
| 타입 | 배경 | 아이콘 | 글꼴색 |
|------|------|--------|--------|
| progress | bg-green-50 | ⚡ | text-green-600 |
| concern | bg-red-50 | ⚠️ | text-red-600 |
| suggestion | bg-yellow-50 | 💡 | text-yellow-600 |
| celebration | bg-purple-50 | 🎉 | text-purple-600 |

### MilestoneCard

**파일**: `/frontend/src/components/MilestoneCard.tsx`

```typescript
interface MilestoneCardProps {
  milestone: Milestone;
  onDelete?: (milestoneId: string) => void;
}
```

**렌더 구조**:
```
┌──────────────────────────────────────┐
│  [큰 아이콘] "의무/요청 완성!"      │
│  마일스톤 타입                       │
├──────────────────────────────────────┤
│  ┌──────────────────────────────────┐│
│  │   축하합니다!                    ││
│  │   민준이가 완성했어요! 🎉       ││
│  └──────────────────────────────────┘│
├──────────────────────────────────────┤
│  설명: 민준이가 의무/요청 도메인의  │
│  모든 단기 목표를 달성했어요.        │
├──────────────────────────────────────┤
│  [기념 사진 - 최대 높이: 192px]    │
├──────────────────────────────────────┤
│  달성일: 2026년 4월 27일           │
│  관련 LTO: domain_mand_lto01        │
├──────────────────────────────────────┤
│  증인:                              │
│  [김치료사 (therapist)] [엄마 (parent)]
└──────────────────────────────────────┘
```

**타입별 색상**:
| 타입 | 배경 | 아이콘 | 색상 |
|------|------|--------|------|
| lto_completed | blue | 🎯 | blue-500 |
| domain_mastered | yellow | 🏆 | gold-500 |
| behavior_improvement | green | 📈 | green-500 |
| social_achievement | purple | 👥 | purple-500 |

---

## 컨텍스트 함수

### MessageContext 함수 정의

**파일**: `/frontend/src/context/MessageContext.tsx`

#### 대화(Conversation) 함수

```typescript
// 1. 사용자의 대화 목록 조회 (필터링)
getConversations(userId: string, childId?: number): Conversation[]
// 설명: 사용자가 참여한 대화만 반환, childId 지정하면 해당 아동만 필터
// 반환: Conversation[] (정렬: 최근순)
// 예시:
const convs = getConversations('user_therapist_001', 1);
// → 치료사가 민준과 나눈 모든 대화

// 2. 새 대화 생성
createConversation(
  type: 'group' | 'direct',
  name: string,
  childId: number,
  participantIds: string[]
): Promise<Conversation>
// 설명: 새 대화 채널 생성
// 반환: 생성된 Conversation 객체
// 예시:
const conv = await createConversation(
  'group',
  '민준 진행상황',
  1,
  ['user_therapist_001', 'user_parent_001']
);

// 3. 대화 정보 업데이트
updateConversation(
  conversationId: string,
  updates: Partial<Conversation>
): Promise<void>
// 설명: 대화명, isPinned 등 업데이트
// 예시:
await updateConversation('conv_123', { isPinned: true });

// 4. 대화 고정/해제
pinConversation(conversationId: string, isPinned: boolean): Promise<void>
// 설명: updateConversation의 편의 함수
// 예시:
await pinConversation('conv_123', true);  // 고정
```

#### 메시지(Message) 함수

```typescript
// 1. 메시지 조회 (페이지네이션)
getMessages(
  conversationId: string,
  limit?: number,     // 기본값: 50
  offset?: number     // 기본값: 0
): Promise<Message[]>
// 설명: 대화의 메시지 로드 (offset부터 limit개)
// 반환: Message[] (역순 정렬: 최신→과거)
// 예시:
const messages = await getMessages('conv_123', 50, 0);
// → 첫 50개 메시지

// 2. 메시지 전송
sendMessage(
  conversationId: string,
  content: string,
  type: 'text' | 'image' | 'file' | 'feedback' | 'milestone',
  metadata?: any
): Promise<Message>
// 설명: 메시지 생성, 저장, 반환
// 반환: 생성된 Message 객체
// 예시:
const msg = await sendMessage(
  'conv_123',
  '좋은 진행입니다!',
  'text',
  { childId: 1 }
);

// 3. 메시지 읽음 표시
markAsRead(conversationId: string, userId: string): Promise<void>
// 설명: 대화의 미읽음 수 초기화
// 예시:
await markAsRead('conv_123', 'user_parent_001');

// 4. 반응 추가
addReaction(
  messageId: string,
  emoji: string,       // '👍', '❤️', '🎉' 등
  userId: string
): Promise<void>
// 설명: 메시지에 이모지 반응 추가
// 예시:
await addReaction('msg_123', '👍', 'user_parent_001');

// 5. 메시지 삭제
deleteMessage(messageId: string): Promise<void>
// 설명: 메시지 삭제 (하드 삭제)
// 예시:
await deleteMessage('msg_123');
```

#### 피드백(Feedback) 함수

```typescript
// 1. 피드백 전송
sendFeedback(
  childId: number,
  feedbackData: Omit<Feedback, 'id' | 'createdAt'>
): Promise<Feedback>
// 설명: 새 피드백 생성 및 저장
// 예시:
const feedback = await sendFeedback(1, {
  conversationId: 'conv_123',
  senderId: 'user_therapist_001',
  senderRole: 'therapist',
  type: 'progress',
  content: '85점 달성!',
  // ...
});

// 2. 아동별 피드백 조회
getFeedbackByChild(childId: number): Promise<Feedback[]>
// 설명: 특정 아동의 모든 피드백 로드
// 예시:
const feedbacks = await getFeedbackByChild(1);
// → 민준의 모든 피드백

// 3. 타입별 피드백 조회
getFeedbackByType(
  childId: number,
  type: 'progress' | 'concern' | 'suggestion' | 'celebration'
): Promise<Feedback[]>
// 설명: 아동의 특정 타입 피드백만 조회
// 예시:
const concerns = await getFeedbackByType(1, 'concern');

// 4. 피드백 업데이트
updateFeedback(
  feedbackId: string,
  updates: Partial<Feedback>
): Promise<void>
// 설명: 피드백 내용, urgency 등 업데이트
// 예시:
await updateFeedback('feedback_123', { urgency: 'high' });

// 5. 실행 항목 완료
completeFeedbackAction(
  feedbackId: string,
  actionItemId: string
): Promise<void>
// 설명: 피드백의 실행 항목 status를 'completed'로 변경
// 예시:
await completeFeedbackAction('feedback_123', 'action_456');
```

#### 마일스톤(Milestone) 함수

```typescript
// 1. 마일스톤 생성
createMilestone(
  milestone: Omit<Milestone, 'id'>
): Promise<Milestone>
// 설명: 새 마일스톤 생성 및 저장
// 예시:
const ms = await createMilestone({
  childId: 1,
  achievementDate: '2026-04-27',
  type: 'lto_completed',
  title: '의무/요청 완성!',
  description: '...',
  celebrationMessage: '축하합니다!',
  witnesses: [{ name: '김치료사', role: 'therapist' }],
});

// 2. 아동별 마일스톤 조회
getMilestonesByChild(childId: number): Promise<Milestone[]>
// 설명: 아동의 모든 마일스톤 로드
// 예시:
const milestones = await getMilestonesByChild(1);

// 3. 마일스톤 삭제
deleteMilestone(milestoneId: string): Promise<void>
// 예시:
await deleteMilestone('milestone_123');
```

#### 검색 & 필터링 함수

```typescript
// 1. 메시지 검색
searchMessages(
  query: string,
  childId?: number
): Promise<Message[]>
// 설명: 메시지 content에서 쿼리 검색 (대소문자 무시)
// 예시:
const results = await searchMessages('요청 기술', 1);

// 2. 피드백 검색
searchFeedback(
  query: string,
  childId?: number
): Promise<Feedback[]>
// 설명: 피드백 content에서 쿼리 검색
// 예시:
const results = await searchFeedback('개선', 1);

// 3. 태그로 메시지 조회
getMessagesByTag(
  tag: string,        // '#진행상황', '#가정활동' 등
  childId?: number
): Promise<Message[]>
// 설명: 특정 태그를 포함한 메시지만 필터
// 예시:
const msgs = await getMessagesByTag('#진행상황', 1);
```

#### 파일 처리 함수

```typescript
// 1. 파일 업로드
uploadFile(file: File): Promise<{ id: string; url: string; filename: string }>
// 설명: 파일 업로드 (현재는 blob URL, 나중에 서버로)
// 반환: 업로드된 파일 정보
// 예시:
const fileInfo = await uploadFile(fileInputElement.files[0]);
// → { id: 'file_123', url: 'blob:http://...', filename: 'photo.jpg' }
```

#### 통계 함수

```typescript
// 1. 미읽음 수 조회
getUnreadCount(userId: string): number
// 설명: 사용자의 모든 대화에서 미읽음 수 합계
// 예시:
const unread = getUnreadCount('user_parent_001');
// → 5

// 2. 피드백 통계
getFeedbackStats(childId: number): {
  progress: number;
  concern: number;
  suggestion: number;
  celebration: number;
}
// 설명: 아동별 피드백 타입별 개수
// 예시:
const stats = getFeedbackStats(1);
// → { progress: 15, concern: 2, suggestion: 8, celebration: 3 }
```

---

## 통합 계획

### 3.1 기존 페이지에 메시징 통합

#### Layout.tsx (네비게이션 추가)

```typescript
// 모든 역할에 공통으로 추가
const common = [
  { label: '대시보드', path: '/dashboard' },
  { label: '스케줄', path: '/schedule' },
  { label: '💬 메시징', path: '/messages' },  // ← 새로 추가
];
```

#### App.tsx (라우트 추가)

```typescript
// MessageProvider 감싸기
<CacheProvider>
  <CurriculumProvider>
    <ScheduleProvider>
      <MessageProvider>  {/* ← 새로 추가 */}
        <BrowserRouter>
          <Routes>
            {/* 기존 라우트 */}
            <Route path="/messages" element={...} />  {/* ← 새로 추가 */}
          </Routes>
        </BrowserRouter>
      </MessageProvider>
    </ScheduleProvider>
  </CurriculumProvider>
</CacheProvider>
```

### 3.2 types/index.ts 확장

```typescript
// 기존 Notification 인터페이스는 유지 (legacy)
// 새로운 메시지 타입들 추가:

export interface Message { /* ... */ }
export interface Conversation { /* ... */ }
export interface Feedback { /* ... */ }
export interface Milestone { /* ... */ }
// ... 기타 인터페이스
```

### 3.3 저장소(storage.ts) 확장

**추가 저장 키**:
```typescript
// 대화 목록
'conversations' → Conversation[]

// 각 대화의 메시지
'messages_${conversationId}' → Message[]

// 아동별 피드백
'feedback_${childId}' → Feedback[]

// 아동별 마일스톤
'milestones_${childId}' → Milestone[]

// 검색용 (전체 메시지)
'all_messages' → Message[]
```

**사용 방식** (변경 없음):
```typescript
// 저장
await storageManager.set('conversations', conversationArray);

// 조회
const convs = await storageManager.get<Conversation[]>('conversations');

// 삭제
await storageManager.remove('conversations');
```

### 3.4 다른 페이지와의 연동 (미래)

#### Dashboard.tsx와의 연동
- 최근 메시지 위젯 추가
- 미읽음 수 배지 표시
- 메시징 페이지로의 링크

#### Children.tsx와의 연동
- 아동 정보 클릭 → 메시징 페이지로 이동
- 아동별 메시징 다이렉트 링크

#### Reports.tsx와의 연동
- 피드백 기반 보고서 생성
- 부모 피드백과 치료사 피드백 비교 분석

---

## API 시뮬레이션

### 시뮬레이션 함수들 (MessageContext 내부)

```typescript
// storageManager를 통한 localStorage/IndexedDB 사용
// 실제 백엔드 연결은 Phase 3 Stream B1에서 진행

// 예시: sendMessage 구현
const sendMessage = async (
  conversationId: string,
  content: string,
  type: Message['type'],
  metadata?: any
): Promise<Message> => {
  if (!user) throw new Error('사용자 정보 없음');
  
  const message: Message = {
    id: `msg_${Date.now()}`,
    conversationId,
    senderId: user.id,
    senderName: user.name,
    senderRole: (user.role as any) || 'parent',
    childId: 1,  // 대화에서 추출하도록 개선 필요
    type,
    content,
    createdAt: new Date().toISOString(),
    metadata,
    reactions: [],
  };
  
  // 메시지 저장
  const messages = await storageManager.get<Message[]>(
    `messages_${conversationId}`
  ) || [];
  const updated = [...messages, message];
  await storageManager.set(`messages_${conversationId}`, updated);
  
  // 대화 업데이트
  await updateConversation(conversationId, { lastMessage: message });
  
  return message;
};
```

### 백엔드 API 엔드포인트 설계 (예상)

```
POST   /api/messages/conversations       # 대화 생성
GET    /api/messages/conversations       # 대화 목록
PATCH  /api/messages/conversations/:id   # 대화 업데이트

POST   /api/messages/:conversationId     # 메시지 전송
GET    /api/messages/:conversationId     # 메시지 조회
DELETE /api/messages/:messageId          # 메시지 삭제

POST   /api/feedbacks                    # 피드백 전송
GET    /api/feedbacks/children/:childId  # 아동별 피드백
PATCH  /api/feedbacks/:feedbackId        # 피드백 업데이트

POST   /api/milestones                   # 마일스톤 생성
GET    /api/milestones/children/:childId # 아동별 마일스톤

GET    /api/messages/search              # 메시지 검색
POST   /api/files/upload                 # 파일 업로드

WebSocket: /ws/conversations/:conversationId  # 실시간 메시징
```

---

**작성일**: 2026-04-27  
**버전**: 1.0  
**상태**: 완료
