# AKMS Phase 3 Stream C1: 부모-치료사 메시징 시스템

## 1. 개요

부모와 치료사가 실시간으로 아동의 진행 상황, 가정 활동, 전문가 피드백을 공유하는 메시징 시스템 구현. 아동별 별도 대화방, 피드백 특화 UI, 마일스톤 축하 시스템을 포함합니다.

## 2. 구현 완료 항목

### 2.1 TypeScript 인터페이스 & 타입 정의

**파일**: `/frontend/src/types/index.ts`

#### 기본 메시지 타입
```typescript
interface Message {
  id: string;                    // 메시지 고유 ID
  conversationId: string;        // 대화 그룹 ID
  senderId: string;              // 발신자 사용자 ID
  senderName: string;            // 발신자 이름
  senderRole: 'therapist' | 'parent' | 'admin';
  recipientId?: string;          // 특정 수신자 ID (1:1일 경우)
  childId: number;               // 아동 ID (1-4)
  type: 'text' | 'image' | 'file' | 'feedback' | 'milestone';
  content: string;               // 메시지 본문
  attachments?: MessageAttachment[];  // 첨부파일
  tags?: string[];               // '#진행상황', '#가정활동' 등
  priority?: 'normal' | 'high' | 'urgent';
  createdAt: string;             // ISO 8601 형식
  readAt?: string;               // 읽음 시간 (null=미읽)
  reactions?: MessageReaction[];  // 반응 (좋아요, 응원)
  metadata?: MessageMetadata;    // 관련 LTO, 세션 정보
}
```

#### 대화(Conversation) 타입
```typescript
interface Conversation {
  id: string;
  type: 'group' | 'direct';
  name: string;
  childId: number;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}
```

#### 피드백(Feedback) 타입
```typescript
interface Feedback {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'therapist' | 'parent';
  childId: number;
  type: 'progress' | 'concern' | 'suggestion' | 'celebration';
  category?: FeedbackCategory;   // 관련 LTO 도메인
  content: string;
  evidence?: FeedbackEvidence[]; // 근거 (날짜, 관찰, 사진)
  actionItems?: FeedbackActionItem[]; // 실행 항목 (담당자, 마감일)
  sentiment?: 'positive' | 'neutral' | 'concerning';
  urgency?: 'low' | 'medium' | 'high';
  responses?: Message[];
  createdAt: string;
}
```

#### 마일스톤(Milestone) 타입
```typescript
interface Milestone {
  id: string;
  childId: number;
  achievementDate: string;
  type: 'lto_completed' | 'domain_mastered' | 'behavior_improvement' | 'social_achievement';
  title: string;
  description: string;
  relatedLtoId?: string;
  photo?: string;
  celebrationMessage: string;
  witnesses: MilestoneWitness[];
}
```

### 2.2 React Context & Hooks

**파일**: `/frontend/src/context/MessageContext.tsx`

#### MessageContext 함수 시그니처

```typescript
interface MessageContextType {
  // 대화(Conversation) 작업
  conversations: Conversation[];
  getConversations(userId: string, childId?: number): Conversation[];
  createConversation(type: 'group' | 'direct', name: string, childId: number, participantIds: string[]): Promise<Conversation>;
  updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<void>;
  pinConversation(conversationId: string, isPinned: boolean): Promise<void>;

  // 메시지(Message) 작업
  getMessages(conversationId: string, limit?: number, offset?: number): Promise<Message[]>;
  sendMessage(conversationId: string, content: string, type: Message['type'], metadata?: any): Promise<Message>;
  markAsRead(conversationId: string, userId: string): Promise<void>;
  addReaction(messageId: string, emoji: string, userId: string): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;

  // 피드백(Feedback) 작업
  sendFeedback(childId: number, feedbackData: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback>;
  getFeedbackByChild(childId: number): Promise<Feedback[]>;
  getFeedbackByType(childId: number, type: Feedback['type']): Promise<Feedback[]>;
  updateFeedback(feedbackId: string, updates: Partial<Feedback>): Promise<void>;
  completeFeedbackAction(feedbackId: string, actionItemId: string): Promise<void>;

  // 마일스톤(Milestone) 작업
  createMilestone(milestone: Omit<Milestone, 'id'>): Promise<Milestone>;
  getMilestonesByChild(childId: number): Promise<Milestone[]>;
  deleteMilestone(milestoneId: string): Promise<void>;

  // 검색 & 필터링
  searchMessages(query: string, childId?: number): Promise<Message[]>;
  searchFeedback(query: string, childId?: number): Promise<Feedback[]>;
  getMessagesByTag(tag: string, childId?: number): Promise<Message[]>;

  // 파일 처리
  uploadFile(file: File): Promise<{ id: string; url: string; filename: string }>;

  // 통계
  getUnreadCount(userId: string): number;
  getFeedbackStats(childId: number): { progress: number; concern: number; suggestion: number; celebration: number };
}
```

#### 사용 예시
```typescript
// useMessages hook 사용
const { conversations, sendMessage, getMessages, getFeedbackByChild } = useMessages();

// 메시지 로드
const messages = await getMessages(conversationId, 50, 0);

// 메시지 전송
const newMessage = await sendMessage(conversationId, '좋은 진행입니다!', 'text');

// 피드백 조회
const feedbacks = await getFeedbackByChild(childId);
```

### 2.3 React 컴포넌트

#### ChatWindow.tsx
**경로**: `/frontend/src/components/ChatWindow.tsx`

메시지 표시 및 입력창을 담당하는 메인 채팅 컴포넌트.

**Props**:
- `conversationId: string` - 대화 ID
- `childId: number` - 아동 ID (1-4)
- `childName: string` - 아동 이름

**기능**:
- 메시지 목록 표시 (시간 역순)
- 실시간 메시지 입력 및 전송
- 파일 첨부 (이미지, 문서)
- 자동 스크롤 (최신 메시지로)
- 로딩 상태 표시

**스타일**:
- 그래디언트 헤더 (pastel-purple → pastel-pink)
- 반응형 레이아웃
- 포커스 상태 시각화

#### MessageBubble.tsx
**경로**: `/frontend/src/components/MessageBubble.tsx`

개별 메시지를 렌더링하는 컴포넌트.

**Props**:
- `message: Message` - 메시지 객체
- `onReact?: (emoji: string) => void` - 반응 콜백
- `onReply?: (messageId: string) => void` - 답장 콜백

**기능**:
- 발신/수신 메시지 구분 (색상, 정렬)
- 메시지 타입별 아이콘 표시 (피드백, 마일스톤, 파일)
- 우선순위 시각화 (border-left 색상)
- 반응 이모지 표시 및 추가
- 읽음 상태 표시 (✓)
- 타임스탬프 표시

#### FeedbackCard.tsx
**경로**: `/frontend/src/components/FeedbackCard.tsx`

피드백을 카드 형태로 표시하는 컴포넌트.

**Props**:
- `feedback: Feedback` - 피드백 객체
- `onStatusChange?: (actionId: string, status) => void` - 실행 항목 상태 변경 콜백
- `onDelete?: (feedbackId: string) => void` - 삭제 콜백

**기능**:
- 피드백 타입별 색상 (progress=초록, concern=빨강, suggestion=노랑, celebration=보라)
- 아이콘 표시 (⚡, ⚠️, 💡, 🎉)
- 우선순위 배지 (긴급, 중요)
- 근거(Evidence) 접기/펼치기
- 실행 항목(Action Items) 체크박스
- 타임스탬프

**색상 코드**:
- progress: bg-green-50, border-green-500
- concern: bg-red-50, border-red-500
- suggestion: bg-yellow-50, border-yellow-500
- celebration: bg-purple-50, border-purple-500

#### MilestoneCard.tsx
**경로**: `/frontend/src/components/MilestoneCard.tsx`

마일스톤을 축하하는 카드 컴포넌트.

**Props**:
- `milestone: Milestone` - 마일스톤 객체
- `onDelete?: (milestoneId: string) => void` - 삭제 콜백

**기능**:
- 마일스톤 타입별 아이콘 및 색상 (LTO=파랑, Domain=노랑, Behavior=초록, Social=보라)
- 축하 메시지 강조 표시
- 사진 표시 (최대 h-48)
- 증인(Witnesses) 표시
- 그래디언트 배경
- 큰 글꼴 및 여유로운 여백

### 2.4 메인 페이지: Messages.tsx

**경로**: `/frontend/src/pages/Messages.tsx`

부모-치료사 메시징 시스템의 메인 페이지.

**기능**:
1. **탭 네비게이션**
   - 메시지 탭: 대화 목록 및 채팅
   - 피드백 탭: 피드백 카드 목록

2. **좌측 패널 (메시지 탭)**
   - 대화 목록 (아동별, 검색 가능)
   - 미읽음 수 배지
   - 새 대화 생성 폼
   - 최근 메시지 미리보기

3. **우측 패널 (메시지 탭)**
   - ChatWindow 컴포넌트
   - 실시간 메시징

4. **필터 & 검색**
   - 아동 선택 (모든 아동 / 민준 / 소영 / 지호 / 연서)
   - 피드백 타입 필터 (메시지 탭에서는 비표시)
   - 텍스트 검색 (대화명, 메시지 내용)

5. **피드백 탭**
   - FeedbackCard 목록
   - 타입별 필터링
   - 우선순위 시각화

**레이아웃**:
```
┌─────────────────────────────────────────────────────────┐
│  헤더: 부모-치료사 메시징 | 미읽음 수                    │
├─────────────────────────────────────────────────────────┤
│  탭: 메시지 | 피드백                                    │
├─────────────────────────────────────────────────────────┤
│  검색 | 필터(아동) | [새 대화]                         │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│  대화 목록           │  ChatWindow / FeedbackCards     │
│ (좌: 33%, 우: 67%)  │                                  │
│                      │                                  │
└──────────────────────┴──────────────────────────────────┘
```

**반응형**:
- 모바일: 세로 스택 (탭 전환)
- 태블릿/PC: 2열 레이아웃

### 2.5 저장소 통합

**파일**: `/frontend/src/utils/storage.ts` (확장)

MessageContext에서 다음 key로 데이터 저장:
- `conversations` - Conversation[] 배열
- `messages_${conversationId}` - Message[] 배열 (대화별)
- `feedback_${childId}` - Feedback[] 배열 (아동별)
- `milestones_${childId}` - Milestone[] 배열 (아동별)
- `all_messages` - 모든 메시지 (검색용)

**특징**:
- localStorage + IndexedDB 이중 저장
- 자동 동기화
- 오프라인 지원

## 3. 라우팅 및 네비게이션

### 3.1 새로운 라우트

**파일**: `/frontend/src/App.tsx`

```typescript
<Route
  path="/messages"
  element={
    <ProtectedRoute>
      <Layout>
        <Messages />
      </Layout>
    </ProtectedRoute>
  }
/>
```

**접근 권한**: 모든 인증된 사용자 (admin, therapist, parent)

### 3.2 사이드바 메뉴 추가

**파일**: `/frontend/src/components/Layout.tsx`

모든 역할에 `💬 메시징` 메뉴 항목 추가:

```typescript
const common = [
  { label: '대시보드', path: '/dashboard' },
  { label: '스케줄', path: '/schedule' },
  { label: '💬 메시징', path: '/messages' },  // 새 추가
];
```

## 4. 상태 관리 구조

### 4.1 MessageContext 상태

```
MessageContext
├── conversations: Conversation[]
│   ├── id: string
│   ├── participants: ConversationParticipant[]
│   ├── lastMessage: Message
│   └── unreadCount: Record<userId, number>
│
├── 함수들
│   ├── getConversations() - 사용자의 대화 필터링
│   ├── sendMessage() - 메시지 생성 및 저장
│   ├── getMessages() - 대화별 메시지 조회
│   ├── getFeedbackByChild() - 아동별 피드백 조회
│   └── ...
```

### 4.2 Component 상태

**Messages.tsx**:
- `selectedConversation` - 선택된 대화
- `activeTab` - 메시지/피드백 탭
- `filterChild` - 선택된 아동
- `searchQuery` - 검색어

**ChatWindow.tsx**:
- `messages` - 메시지 목록
- `inputValue` - 입력 중인 메시지
- `isLoading` - 로드 상태

**FeedbackCard.tsx**:
- `isExpanded` - 실행 항목 펼침 상태

## 5. 데이터 흐름

### 5.1 메시지 전송 흐름

```
사용자 입력 (ChatWindow)
    ↓
handleSendMessage()
    ↓
useMessages().sendMessage()
    ↓
MessageContext.sendMessage()
    ↓
storageManager.set(`messages_${conversationId}`)
    ↓
updateConversation() (lastMessage 업데이트)
    ↓
Message 객체 반환
    ↓
UI 업데이트 (MessageBubble 추가)
```

### 5.2 피드백 조회 흐름

```
사용자가 아동 선택
    ↓
useMessages().getFeedbackByChild(childId)
    ↓
storageManager.get(`feedback_${childId}`)
    ↓
Feedback[] 반환
    ↓
FeedbackCard로 렌더링
```

## 6. 사용 시나리오

### 시나리오 1: 치료사가 부모에게 진행상황 메시지 보내기

```
1. 메시징 페이지 접속
2. 아동 선택 (예: 민준)
3. 대화 목록에서 "민준 진행상황" 선택
4. ChatWindow에서 메시지 입력
   "민준이가 요청 기술에서 85점을 받았어요!"
5. 전송 버튼 클릭
6. 메시지 저장 및 표시
7. 부모가 수신 (미읽음 배지 표시)
```

### 시나리오 2: 부모가 가정 피드백 보내기

```
1. 메시징 페이지 접속
2. 피드백 탭 클릭
3. [새 피드백] 버튼 (미구현, Phase 3 Stream B2에서)
4. 피드백 타입 선택 (진행상황)
5. 내용 입력: "집에서 좋은 행동을 많이 보여요!"
6. 근거 추가 (선택):
   - 날짜: 2026-04-27
   - 관찰: 식사 중 차분함
   - 사진 첨부
7. 저장
8. FeedbackCard로 표시
```

### 시나리오 3: 마일스톤 축하 화면

```
1. 치료사가 아동 LTO 완료 표시
2. 시스템이 마일스톤 생성
3. Milestone 저장 (storageManager)
4. 부모와 치료사 모두에게 알림 (Phase 3 Stream C2)
5. 메시징 페이지에서 MilestoneCard 표시
6. 축하 메시지 공유
```

## 7. 스타일 및 테마

### 7.1 색상 팔레트

**기본 색상**:
- pastel-purple: 주요 액션 (버튼, 선택 상태)
- pastel-pink: 보조 액션
- pastel-blue: 정보성 요소

**피드백 타입별**:
- progress (진행상황): 초록 (green-500)
- concern (우려): 빨강 (red-500)
- suggestion (제안): 노랑 (yellow-500)
- celebration (축하): 보라 (purple-500)

### 7.2 컴포넌트 스타일

**메시지 버블**:
- 발신: pastel-purple (오른쪽)
- 수신-치료사: pastel-pink (왼쪽)
- 수신-부모: gray-100 (왼쪽)

**우선순위 시각화**:
- urgent: border-red-500
- high: border-orange-500
- normal: border 없음

## 8. 확장 포인트

### 8.1 Phase 3 Stream B2: 상세 피드백 작성

FeedbackCard 컴포넌트에 생성 폼 추가:
- 피드백 타입 선택
- 카테고리 (도메인, LTO, 스킬)
- 근거 추가 (사진, 관찰)
- 실행 항목 작성
- 우선순위 설정

### 8.2 Phase 3 Stream C2: 알림 시스템

NotificationEvent 타입 확장:
- 새 메시지 알림
- 피드백 받음 알림
- 마일스톤 달성 알림
- Push Notification 통합

### 8.3 추가 기능

- **음성 메시지**: Message 타입에 'voice' 추가
- **비디오 통화**: WebRTC 통합
- **일정 공유**: 세션 정보와 연계
- **번역**: 다국어 피드백 지원
- **분석**: 피드백 트렌드 분석

## 9. 성능 최적화

### 9.1 메시지 로딩

```typescript
// 페이지네이션
const getMessages = async (conversationId, limit = 50, offset = 0)
// 처음 50개만 로드, 스크롤 시 추가 로드
```

### 9.2 컴포넌트 최적화

```typescript
// React.memo로 MessageBubble 메모이제이션
export default React.memo(MessageBubble);

// useMemo로 필터된 목록 메모이제이션
const filteredConversations = useMemo(() => {
  return userConversations.filter(...)
}, [userConversations, searchQuery]);
```

### 9.3 저장소 최적화

- IndexedDB로 대용량 메시지 저장
- localStorage로 자주 접근하는 데이터 캐싱
- SyncQueue로 오프라인 지원

## 10. 테스트 가이드

### 10.1 수동 테스트 체크리스트

- [ ] 메시지 전송 및 수신
- [ ] 파일 첨부 및 다운로드
- [ ] 피드백 카드 표시
- [ ] 우선순위 시각화
- [ ] 미읽음 수 업데이트
- [ ] 아동 필터링
- [ ] 검색 기능
- [ ] 반응 추가
- [ ] 마일스톤 표시
- [ ] 반응형 레이아웃 (모바일/태블릿/PC)

### 10.2 자동화 테스트 (예시)

```typescript
// MessageContext.test.ts
describe('MessageContext', () => {
  it('should send message', async () => {
    const { result } = renderHook(() => useMessages());
    const message = await result.current.sendMessage(
      'conv_123',
      '테스트 메시지',
      'text'
    );
    expect(message.content).toBe('테스트 메시지');
  });

  it('should filter conversations by child', () => {
    const { result } = renderHook(() => useMessages());
    const filtered = result.current.getConversations('user_123', 1);
    expect(filtered.every(c => c.childId === 1)).toBe(true);
  });
});
```

## 11. 문제 해결

### 문제: 메시지가 표시되지 않음

**원인**: storageManager 초기화 실패
**해결**: console에서 `storageManager.initialize()` 확인

### 문제: 미읽음 수가 업데이트되지 않음

**원인**: markAsRead 호출 안 됨
**해결**: ChatWindow에서 컴포넌트 마운트 시 markAsRead 호출 추가

### 문제: 파일이 업로드되지 않음

**원인**: uploadFile 함수가 mock 상태
**해결**: 백엔드 API 연결 (Phase 3 Stream B1 예정)

## 12. 파일 구조 요약

```
frontend/src/
├── types/
│   └── index.ts                 (메시지 타입 추가)
├── context/
│   └── MessageContext.tsx       (새로 생성)
├── components/
│   ├── ChatWindow.tsx           (새로 생성)
│   ├── MessageBubble.tsx        (새로 생성)
│   ├── FeedbackCard.tsx         (새로 생성)
│   ├── MilestoneCard.tsx        (새로 생성)
│   └── Layout.tsx               (메뉴 추가)
├── pages/
│   └── Messages.tsx             (새로 생성)
├── App.tsx                      (라우트 추가)
└── utils/
    └── storage.ts               (확장 가능)
```

## 13. 다음 단계 (로드맵)

### Phase 3 Stream B2: 상세 피드백 작성
- FeedbackComposer 컴포넌트
- 근거(Evidence) 추가 폼
- 실행 항목(ActionItem) 관리

### Phase 3 Stream C2: 알림 시스템
- NotificationContext 생성
- 푸시 알림 통합
- 이메일 알림 설정

### Phase 3 Stream B1: 백엔드 API 연결
- REST API 엔드포인트
- 실시간 WebSocket 통신
- 파일 업로드 API

---

**작성일**: 2026-04-27
**담당자**: Claude Code (AI)
**상태**: Phase 3 Stream C1 구현 완료
