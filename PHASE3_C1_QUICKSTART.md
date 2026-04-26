# AKMS Phase 3 Stream C1: 빠른 시작 가이드

## 개요

부모-치료사 메시징 시스템이 완성되었습니다. 이 가이드는 시스템을 사용하고 확장하기 위한 빠른 참조입니다.

---

## 1. 애플리케이션 시작하기

### 1.1 의존성 설치

```bash
cd frontend
npm install
```

### 1.2 개발 서버 실행

```bash
npm run dev
```

### 1.3 접속 URL

메시징 페이지: `http://localhost:5173/messages`

---

## 2. 사용 방법

### 2.1 메시징 페이지 접속

1. 로그인 (테스트 사용자: 자동 로그인)
2. 사이드바에서 **💬 메시징** 클릭
3. 메시지 또는 피드백 탭 선택

### 2.2 메시지 보내기

**메시지 탭**:
1. 좌측 "대화 목록"에서 대화 선택
2. 우측 "ChatWindow"에 메시지 입력
3. 파일 첨부 (선택사항): 📎 아이콘 클릭
4. "전송" 버튼 클릭

**예시**:
```
입력: "민준이가 요청 기술에서 85점을 받았어요!"
전송 → 메시지 즉시 표시 (자신: 보라색, 타인: 회색)
```

### 2.3 피드백 보기

**피드백 탭**:
1. 아동 선택 (드롭다운)
2. 피드백 타입 필터 (선택사항)
3. FeedbackCard 목록 표시

**실행 항목 관리**:
1. FeedbackCard의 "실행 항목" 섹션 펼치기
2. 체크박스 클릭하여 완료 표시

### 2.4 새 대화 생성

**메시지 탭**:
1. "새 대화" 버튼 클릭
2. 대화 제목 입력 (예: "민준 진행상황")
3. 아동 선택
4. "생성" 버튼 클릭

---

## 3. 코드 예시

### 3.1 MessageContext 사용

```typescript
import { useMessages } from '../context/MessageContext';

function MyComponent() {
  const { conversations, sendMessage, getFeedbackByChild } = useMessages();
  
  // 메시지 전송
  const handleSendMessage = async () => {
    const message = await sendMessage(
      'conv_123',
      '좋은 진행입니다!',
      'text'
    );
    console.log('메시지 전송:', message.id);
  };
  
  // 피드백 조회
  const loadFeedbacks = async () => {
    const feedbacks = await getFeedbackByChild(1);  // 민준
    console.log('피드백:', feedbacks);
  };
  
  return (
    <div>
      <button onClick={handleSendMessage}>메시지 보내기</button>
      <button onClick={loadFeedbacks}>피드백 로드</button>
    </div>
  );
}
```

### 3.2 새로운 컴포넌트에서 ChatWindow 사용

```typescript
import { ChatWindow } from '../components/ChatWindow';

function MyMessageWidget() {
  return (
    <ChatWindow
      conversationId="conv_123"
      childId={1}
      childName="민준"
    />
  );
}
```

### 3.3 FeedbackCard 커스터마이징

```typescript
import FeedbackCard from '../components/FeedbackCard';
import { Feedback } from '../types';

function FeedbackList({ feedbacks }: { feedbacks: Feedback[] }) {
  const handleStatusChange = (actionId: string, status: string) => {
    console.log(`액션 ${actionId} 상태: ${status}`);
    // 상태 업데이트 로직
  };
  
  return (
    <div className="space-y-4">
      {feedbacks.map(feedback => (
        <FeedbackCard
          key={feedback.id}
          feedback={feedback}
          onStatusChange={handleStatusChange}
          onDelete={(id) => console.log('삭제:', id)}
        />
      ))}
    </div>
  );
}
```

---

## 4. 데이터 저장 및 로드

### 4.1 로컬 저장소 확인

```typescript
import { storageManager } from './utils/storage';

// 대화 목록 저장
await storageManager.set('conversations', conversationArray);

// 대화 조회
const conversations = await storageManager.get('conversations');

// 특정 아동의 피드백 조회
const feedbacks = await storageManager.get('feedback_1');  // childId=1

// 모든 데이터 조회
const allData = await storageManager.getAll();
```

### 4.2 데이터 구조

```
localStorage (Browser Storage)
├── kinder_conversations          # Conversation[]
├── kinder_messages_conv_123      # Message[]
├── kinder_feedback_1             # Feedback[] (childId=1)
├── kinder_milestones_1           # Milestone[] (childId=1)
└── kinder_all_messages           # Message[] (검색용)
```

### 4.3 오프라인 지원

```typescript
// 메시지 전송 (오프라인 자동 저장)
const message = await sendMessage(conversationId, content, 'text');
// → localStorage에 자동 저장, 온라인 복귀 시 동기화

// SyncQueue 확인
import { syncQueue } from './utils/storage';
const queue = syncQueue.getAll();
console.log('대기 중인 데이터:', queue);
```

---

## 5. 스타일 커스터마이징

### 5.1 색상 변경

**파일**: `/frontend/src/styles/globals.css` (또는 Tailwind config)

```css
/* pastel-purple 색상 변경 */
.bg-pastel-purple {
  background-color: #YOUR_COLOR;
}

.text-pastel-purple {
  color: #YOUR_COLOR;
}
```

### 5.2 피드백 카드 색상

FeedbackCard의 `getTypeBgColor()` 함수 수정:

```typescript
const getTypeBgColor = () => {
  switch (feedback.type) {
    case 'progress':
      return 'bg-green-50 border-l-4 border-green-500';  // ← 여기 수정
    // ...
  }
};
```

### 5.3 메시지 버블 크기

ChatWindow의 렌더링 부분 수정:

```typescript
<div className="
  max-w-xs md:max-w-md lg:max-w-lg  // ← 여기 수정
  rounded-2xl
  px-4 py-3
">
```

---

## 6. 성능 최적화

### 6.1 대용량 메시지 로드

```typescript
// 처음 50개만 로드
const messages = await getMessages(conversationId, 50, 0);

// 스크롤 시 다음 50개 로드
const moreMessages = await getMessages(conversationId, 50, 50);

// 전체 로드 (권장하지 않음)
const allMessages = await getMessages(conversationId, 999999, 0);
```

### 6.2 컴포넌트 메모이제이션

```typescript
import { memo } from 'react';

// MessageBubble 메모이제이션
export default memo(MessageBubble);

// 또는 FeedbackCard
const FeedbackCardMemo = memo(FeedbackCard);
```

### 6.3 useCallback으로 함수 메모이제이션

```typescript
const handleSendMessage = useCallback(async () => {
  // ...
}, [conversationId, user]);

const filteredConversations = useMemo(() => {
  return conversations.filter(c => c.childId === filterChild);
}, [conversations, filterChild]);
```

---

## 7. 테스트

### 7.1 메시지 전송 테스트

```typescript
describe('메시지 전송', () => {
  it('메시지가 저장되어야 함', async () => {
    const { result } = renderHook(() => useMessages());
    
    const message = await result.current.sendMessage(
      'conv_test',
      '테스트 메시지',
      'text'
    );
    
    expect(message.content).toBe('테스트 메시지');
    expect(message.type).toBe('text');
  });
});
```

### 7.2 피드백 조회 테스트

```typescript
it('아동별 피드백을 조회해야 함', async () => {
  const { result } = renderHook(() => useMessages());
  
  // 피드백 저장
  await result.current.sendFeedback(1, {
    conversationId: 'conv_test',
    senderId: 'user_123',
    senderRole: 'therapist',
    type: 'progress',
    content: '좋은 진행입니다',
  });
  
  // 조회
  const feedbacks = await result.current.getFeedbackByChild(1);
  expect(feedbacks.length).toBeGreaterThan(0);
});
```

### 7.3 저장소 테스트

```typescript
it('메시지가 저장되어야 함', async () => {
  const testMessage = { id: 'msg_1', content: 'test' };
  
  await storageManager.set('messages_conv_123', [testMessage]);
  const loaded = await storageManager.get('messages_conv_123');
  
  expect(loaded[0].content).toBe('test');
});
```

---

## 8. 디버깅

### 8.1 콘솔 로그

```typescript
// MessageContext에서 로그 활성화
console.log('메시지 로드:', messages);
console.log('대화 목록:', conversations);
console.log('저장소 상태:', storageManager.getStatus());
```

### 8.2 브라우저 DevTools

**Application 탭**:
1. LocalStorage → kinder_* 항목 확인
2. IndexedDB → KinderABA DB → app-data 확인

**Network 탭**:
- 현재는 모든 요청이 로컬 (네트워크 요청 없음)
- 백엔드 연결 후 API 호출 확인

### 8.3 React DevTools

1. Components 탭에서 MessageContext 확인
2. state 변경 추적
3. Props 검증

---

## 9. 자주 묻는 질문 (FAQ)

### Q1: 메시지가 표시되지 않음

**원인**: 대화가 선택되지 않았거나 메시지가 저장되지 않음

**해결**:
1. 콘솔 확인: `console.log(selectedConversation)`
2. 저장소 확인: DevTools → Application → LocalStorage
3. storageManager 초기화 확인: `await storageManager.initialize()`

### Q2: 미읽음 수가 업데이트되지 않음

**원인**: `markAsRead` 호출 안 됨

**해결**:
```typescript
// ChatWindow에서 마운트 시 호출
useEffect(() => {
  markAsRead(conversationId, user?.id || '');
}, [conversationId, user]);
```

### Q3: 파일이 업로드되지 않음

**원인**: `uploadFile`이 현재 blob URL만 반환 (실제 서버 X)

**해결**: Phase 3 Stream B1에서 백엔드 API 연결 예정

### Q4: 아동별 피드백을 어떻게 필터링하나요?

```typescript
const feedbacks = await getFeedbackByChild(1);  // childId=1만
const concerns = await getFeedbackByType(1, 'concern');  // 우려사항만
```

### Q5: 대화를 어떻게 삭제하나요?

현재 UI에 삭제 버튼 없음. 추가하려면:

```typescript
// MessageContext에 함수 추가
deleteConversation = async (conversationId: string) => {
  const updated = conversations.filter(c => c.id !== conversationId);
  setConversations(updated);
  await storageManager.set('conversations', updated);
};
```

---

## 10. 다음 단계

### Phase 3 Stream B2: 상세 피드백 작성
- FeedbackComposer 컴포넌트
- 근거 추가 폼 (사진, 관찰)
- 실행 항목 관리

### Phase 3 Stream C2: 알림 시스템
- 새 메시지 알림
- 푸시 알림 (브라우저 Notification API)
- 이메일 알림

### Phase 3 Stream B1: 백엔드 API
- REST API 엔드포인트
- WebSocket 실시간 통신
- 파일 업로드 서버

---

## 11. 유용한 링크

- **타입 정의**: `/frontend/src/types/index.ts`
- **컨텍스트**: `/frontend/src/context/MessageContext.tsx`
- **메인 페이지**: `/frontend/src/pages/Messages.tsx`
- **컴포넌트**: `/frontend/src/components/` (ChatWindow, FeedbackCard 등)
- **상세 명세**: `PHASE3_C1_TECHNICAL_SPEC.md`
- **구현 문서**: `PHASE3_C1_IMPLEMENTATION.md`

---

## 12. 지원

문제가 발생하면:
1. 브라우저 콘솔 확인 (F12 → Console)
2. 로컬 저장소 확인 (F12 → Application → LocalStorage)
3. 기술 명세 검토 (`PHASE3_C1_TECHNICAL_SPEC.md`)
4. 구현 문서 확인 (`PHASE3_C1_IMPLEMENTATION.md`)

---

**마지막 업데이트**: 2026-04-27  
**버전**: 1.0  
**상태**: Phase 3 Stream C1 완성
