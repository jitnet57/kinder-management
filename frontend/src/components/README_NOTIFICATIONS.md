# 알림 시스템 (Notification System) 사용 가이드

## 빠른 시작

### 1. Provider 설정 (App.tsx)
```typescript
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      {/* 나머지 앱 */}
    </NotificationProvider>
  );
}
```

### 2. 헤더에 알림 벨 추가
```typescript
import { NotificationBell } from './components/NotificationBell';
import { NotificationCenter } from './components/NotificationCenter';
import { useState } from 'react';

function Header() {
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const userId = 'user-123'; // 실제 사용자 ID

  return (
    <header>
      <NotificationBell 
        userId={userId}
        onOpenNotifications={() => setNotificationCenterOpen(true)}
      />
      <NotificationCenter
        userId={userId}
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />
    </header>
  );
}
```

### 3. 컴포넌트에서 알림 발송
```typescript
import { useNotification } from './context/NotificationContext';

function MyComponent() {
  const { emitEvent } = useNotification();

  const handleComplete = async () => {
    // ... 작업 완료 로직
    
    // 알림 발송
    await emitEvent('lto_completed', {
      childId: 1,
      ltoId: 'lto_001',
      ltoName: 'Language Development LTO 1',
      domainId: 'domain_language',
      domainName: '언어발달',
      score: 85,
      completedAt: new Date().toISOString(),
    });
  };

  return <button onClick={handleComplete}>완료</button>;
}
```

## 알림 발송 예제

### LTO 완성 알림
```typescript
const { emitEvent } = useNotification();

emitEvent('lto_completed', {
  childId: 1,           // 필수
  ltoId: 'lto_001',     // 필수
  ltoName: 'Listen to 2-word utterances',
  domainId: 'domain_mand',
  domainName: 'Mand (요청)',
  score: 92,
  completedAt: new Date().toISOString(),
});
```

### 점수 향상 알림
```typescript
emitEvent('score_improved', {
  childId: 2,
  ltoId: 'lto_002',
  previousScore: 75,
  score: 85,
  improvementPercent: 13.3,  // 계산 필요 없음 (자동 계산 가능)
});
```

### 메시지 수신 알림
```typescript
emitEvent('message_received', {
  childId: 1,
  messageId: 'msg_123',
  conversationId: 'conv_456',
  senderName: '김 치료사',
  senderRole: 'therapist',
  messagePreview: '오늘 세션이 아주 좋았어요!',
});
```

### 마일스톤 달성 알림
```typescript
emitEvent('milestone_achieved', {
  childId: 3,
  milestoneId: 'milestone_10',
  milestoneType: 'lto_count_milestone',
  celebrationMessage: '축하합니다! 10개의 LTO를 완성했습니다! 🎉',
});
```

### 승인 필요 알림
```typescript
emitEvent('approval_required', {
  childId: 1,
  ltoId: 'lto_050',
  ltoName: 'Complex Sentence Structure',
});
```

### 세션 예약 알림
```typescript
emitEvent('session_scheduled', {
  childId: 2,
});
```

### 리마인더
```typescript
emitEvent('reminder', {
  childId: 1,
  messagePreview: 'Today\'s session with 민준 starts in 30 minutes',
});
```

## 고급 사용법

### 필터링된 알림 조회
```typescript
const { getNotifications } = useNotification();

// 모든 알림 조회
const allNotifications = getNotifications(userId);

// 필터링된 조회
const urgentNotifications = getNotifications(userId, {
  priority: ['urgent'],
  readStatus: 'unread',
  childId: 1,
});

// 특정 기간의 알림
const recentNotifications = getNotifications(userId, {
  startDate: new Date(Date.now() - 24*60*60*1000).toISOString(),
  endDate: new Date().toISOString(),
});
```

### 미읽음 개수 확인
```typescript
const { getUnreadCount } = useNotification();

const unreadCount = getUnreadCount(userId);
console.log(`${unreadCount} 개의 미읽음 알림`);
```

### 알림 관리
```typescript
const { markAsRead, markAllAsRead, deleteNotification } = useNotification();

// 특정 알림 읽음 표시
markAsRead('notification_id', userId);

// 모든 알림 읽음 표시
markAllAsRead(userId);

// 알림 삭제
deleteNotification('notification_id');
```

### 알림 실시간 리스닝
```typescript
const { onNotificationReceived } = useNotification();

useEffect(() => {
  // 새 알림 수신 시 콜백
  const unsubscribe = onNotificationReceived((notification) => {
    console.log('새 알림:', notification);
    // 토스트 표시, 사운드 재생 등
  });

  return unsubscribe; // 언마운트 시 구독 해제
}, []);
```

### 푸시 알림 설정
```typescript
const { registerPushSubscription, updatePushPreferences } = useNotification();

// 푸시 구독 등록
const subscription = await registerPushSubscription({
  userId: 'user_123',
  endpoint: 'https://...',
  auth: 'auth_token',
  p256dh: 'p256dh_key',
  role: 'parent',
  enabledChannels: {
    inApp: true,
    push: true,
    email: false,
  },
  preferences: {
    quietHours: {
      start: '22:00',
      end: '08:00',
    },
    mutedCategories: ['reminder'],
  },
});

// 선호도 업데이트
updatePushPreferences(subscription.id, {
  quietHours: {
    start: '23:00',
    end: '07:00',
  },
  mutedCategories: ['reminder', 'session_scheduled'],
});
```

## CurriculumContext와 통합

SessionTask 완료 시 알림 발송:

```typescript
// CurriculumContext.tsx에서 수정 필요

const completeSessionTask = useCallback((taskId: string) => {
  const task = sessionTasks.find(t => t.id === taskId);
  if (task) {
    // ... 기존 로직
    
    // 알림 발송 추가
    const { emitEvent } = useNotification();
    emitEvent('lto_completed', {
      childId: task.childId,
      ltoId: task.ltoId,
      // ... 메타데이터
    });
  }
}, [sessionTasks, emitEvent]);
```

## 스타일링

각 컴포넌트는 Tailwind CSS를 사용하며, 다음과 같이 커스터마이징 가능:

### NotificationItem 색상 커스텀
```typescript
const SEVERITY_COLORS = {
  info: 'bg-blue-50 border-l-4 border-blue-400',
  success: 'bg-green-50 border-l-4 border-green-400',
  warning: 'bg-yellow-50 border-l-4 border-yellow-400',
  urgent: 'bg-red-50 border-l-4 border-red-400',
};
```

### ToastNotification 위치 변경
파일의 `fixed bottom-4 right-4` 클래스 수정:
```typescript
// 좌상단: fixed top-4 left-4
// 우상단: fixed top-4 right-4
// 중앙: fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
```

## 성능 팁

1. **대량 알림 처리**: 배치 처리 사용
```typescript
import { batchNotificationsByTime } from './utils/pushNotificationManager';

const batched = batchNotificationsByTime(notifications, 5); // 5분 윈도우
```

2. **메모리 최적화**: 오래된 알림 자동 정리
```typescript
// 7일 이상 된 알림은 자동으로 expiresAt에 의해 삭제됨
```

3. **필터링 최적화**: 필요한 필터만 사용
```typescript
// ❌ 나쁜 예: 모든 필터 사용
const result = getNotifications(userId, {
  type: allTypes,
  severity: allSeverities,
  priority: allPriorities,
  childId: undefined,
});

// ✓ 좋은 예: 필요한 필터만
const result = getNotifications(userId, {
  childId: 1,
  readStatus: 'unread',
});
```

## 문제 해결

### 알림이 나타나지 않음
1. NotificationProvider가 App 최상단에 있는지 확인
2. userId가 올바른지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 푸시 알림이 작동하지 않음
1. Service Worker 등록 확인: `navigator.serviceWorker.getRegistrations()`
2. VAPID 키 설정 확인
3. 브라우저 알림 권한 확인

### 조용한 시간이 작동하지 않음
1. 시간 형식이 "HH:MM" 형식인지 확인
2. 로컬 시간대와 서버 시간대 차이 확인

## API 레퍼런스

### NotificationContext 메서드
- `getNotifications(userId, filter?)` - 알림 조회
- `getUnreadCount(userId)` - 미읽음 개수
- `createEvent(eventData)` - 이벤트 생성
- `emitEvent(eventType, metadata)` - 이벤트 발행
- `markAsRead(id, userId)` - 읽음 표시
- `markAllAsRead(userId)` - 모두 읽음
- `deleteNotification(id)` - 알림 삭제
- `markAsClicked(id, userId)` - 클릭 표시
- `registerPushSubscription(subscription)` - 푸시 구독
- `getPushSubscriptions(userId)` - 구독 조회
- `updatePushPreferences(id, preferences)` - 선호도 수정
- `onNotificationReceived(callback)` - 리스너 등록

## 더 알아보기

- 전체 구현 문서: `/STREAM_C2_IMPLEMENTATION.md`
- 타입 정의: `/frontend/src/types/index.ts`
- 컨텍스트: `/frontend/src/context/NotificationContext.tsx`
