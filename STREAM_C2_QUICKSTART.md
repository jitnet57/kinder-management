# AKMS Phase 3 Stream C2 - 빠른 시작 가이드

## 5분 안에 시작하기

### 1단계: Provider 추가 (1분)

`frontend/src/App.tsx` 파일을 열고:

```typescript
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      {/* 기존 코드 */}
      <CurriculumProvider>
        {/* ... */}
      </CurriculumProvider>
    </NotificationProvider>
  );
}
```

### 2단계: 헤더에 알림 벨 추가 (2분)

헤더 컴포넌트에서:

```typescript
import { NotificationBell } from './components/NotificationBell';
import { NotificationCenter } from './components/NotificationCenter';
import { useState } from 'react';

export function Header() {
  const [notifOpen, setNotifOpen] = useState(false);
  const userId = 'user-123'; // 현재 사용자 ID

  return (
    <header>
      {/* 기존 헤더 내용 */}
      
      <NotificationBell 
        userId={userId}
        onOpenNotifications={() => setNotifOpen(true)}
      />
      
      <NotificationCenter
        userId={userId}
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </header>
  );
}
```

### 3단계: 알림 발송 (2분)

이벤트 발생 시점에서 알림을 보냅니다:

```typescript
import { useNotification } from './context/NotificationContext';

function MyComponent() {
  const { emitEvent } = useNotification();

  const handleSessionComplete = async () => {
    // ... 세션 완료 로직
    
    await emitEvent('lto_completed', {
      childId: 1,
      ltoId: 'lto_001',
      ltoName: 'Listen to 2-word utterances',
      domainName: 'Mand (요청)',
      score: 92,
      completedAt: new Date().toISOString(),
    });
  };

  return <button onClick={handleSessionComplete}>세션 완료</button>;
}
```

## 주요 이벤트 타입

### 1. LTO 완성 - `lto_completed`
```typescript
emitEvent('lto_completed', {
  childId: 1,
  ltoId: 'lto_001',
  ltoName: 'Listen to 2-word utterances',
  domainName: 'Mand',
  score: 92,
  completedAt: new Date().toISOString(),
});
```

### 2. 점수 향상 - `score_improved`
```typescript
emitEvent('score_improved', {
  childId: 1,
  ltoId: 'lto_001',
  previousScore: 75,
  score: 85,
  improvementPercent: 13.3,
});
```

### 3. 메시지 수신 - `message_received`
```typescript
emitEvent('message_received', {
  childId: 1,
  messageId: 'msg_123',
  conversationId: 'conv_456',
  senderName: '김 치료사',
  senderRole: 'therapist',
  messagePreview: '오늘 세션이 좋았어요!',
});
```

### 4. 마일스톤 - `milestone_achieved`
```typescript
emitEvent('milestone_achieved', {
  childId: 1,
  milestoneId: 'milestone_10',
  milestoneType: 'lto_count_milestone',
  celebrationMessage: '축하합니다! 10개 LTO 완성! 🎉',
});
```

### 5. 승인 필요 - `approval_required`
```typescript
emitEvent('approval_required', {
  childId: 1,
  ltoId: 'lto_050',
  ltoName: 'Complex Sentence Structure',
});
```

### 6. 세션 예약 - `session_scheduled`
```typescript
emitEvent('session_scheduled', {
  childId: 2,
});
```

### 7. 피드백 - `feedback_received`
```typescript
emitEvent('feedback_received', {
  childId: 1,
  conversationId: 'conv_789',
  senderName: '박 부모님',
  senderRole: 'parent',
});
```

### 8. 리마인더 - `reminder`
```typescript
emitEvent('reminder', {
  childId: 1,
  messagePreview: 'Today\'s session starts in 30 minutes',
});
```

## 자주 사용하는 기능

### 미읽음 개수 표시
```typescript
const { getUnreadCount } = useNotification();
const unreadCount = getUnreadCount(userId);
```

### 알림 조회 및 필터링
```typescript
const { getNotifications } = useNotification();

// 모든 알림
const all = getNotifications(userId);

// 긴급 알림만
const urgent = getNotifications(userId, {
  priority: ['urgent'],
});

// 특정 아동의 미읽음 알림
const childNotifs = getNotifications(userId, {
  childId: 1,
  readStatus: 'unread',
});
```

### 알림 관리
```typescript
const { markAsRead, deleteNotification, markAllAsRead } = useNotification();

// 특정 알림 읽음 표시
markAsRead('notification_id', userId);

// 모든 알림 읽음 표시
markAllAsRead(userId);

// 알림 삭제
deleteNotification('notification_id');
```

### 실시간 리스닝
```typescript
const { onNotificationReceived } = useNotification();

useEffect(() => {
  const unsubscribe = onNotificationReceived((notification) => {
    console.log('새 알림:', notification);
    // 토스트 표시, 사운드 재생 등
  });

  return unsubscribe;
}, []);
```

## 다음 단계

### 필수 설정
- [ ] `/notifications` 페이지 라우팅 추가
- [ ] CurriculumContext에서 `completeSessionTask` 시 알림 발송
- [ ] SessionLog에서 점수 변경 감지 후 알림 발송

### 선택 사항
- [ ] ToastNotification으로 새 알림 팝업 표시
- [ ] 푸시 알림 설정 (Web Push API)
- [ ] 알림 설정 페이지 (NotificationPreferences)

## 트러블슈팅

### 알림이 나타나지 않음
1. NotificationProvider가 App 최상단에 있는지 확인
2. userId가 올바른지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 푸시 알림이 작동하지 않음
1. Service Worker가 등록되었는지 확인: `navigator.serviceWorker.getRegistrations()`
2. 브라우저 알림 권한 확인
3. VAPID 키 설정 확인

## 더 알아보기

- **상세 문서**: `/STREAM_C2_IMPLEMENTATION.md`
- **사용 가이드**: `/frontend/src/components/README_NOTIFICATIONS.md`
- **전체 요약**: `/STREAM_C2_SUMMARY.txt`

## 예제 프로젝트

### CurriculumContext에 알림 통합
```typescript
// CurriculumContext.tsx에서

const completeSessionTask = useCallback((taskId: string) => {
  const task = sessionTasks.find(t => t.id === taskId);
  if (task) {
    const completedTask: SessionTask = {
      ...task,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    
    // 기존 로직
    setSessionTasks(prev => prev.filter(t => t.id !== taskId));
    setCompletionTasks(prev => [...prev, completedTask]);
    
    // 새로운 알림 로직
    const { emitEvent } = useNotification();
    emitEvent('lto_completed', {
      childId: task.childId,
      ltoId: task.ltoId,
      score: task.score,
      completedAt: completedTask.completedAt,
    });
  }
}, [sessionTasks]);
```

## 성능 팁

1. **대량 알림 처리**
```typescript
import { batchNotificationsByTime } from './utils/pushNotificationManager';

const batched = batchNotificationsByTime(notifications, 5); // 5분 윈도우
```

2. **필터링 최적화** - 필요한 필터만 사용
```typescript
// ❌ 나쁜 예
const result = getNotifications(userId, {
  type: ['lto_completed', 'score_improved', 'message_received', ...],
});

// ✓ 좋은 예
const result = getNotifications(userId, {
  childId: 1,
  readStatus: 'unread',
});
```

## 문의사항

구현 중 문제가 발생하면:
1. `/STREAM_C2_IMPLEMENTATION.md`의 [문제 해결] 섹션 확인
2. 브라우저 개발자도구 콘솔 확인
3. Service Worker 상태 확인

---

**버전**: v1.0.0  
**생성일**: 2026년 4월 27일  
**상태**: 완성
