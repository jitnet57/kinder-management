# AKMS Phase 3 Stream C2: 실시간 알림 & 푸시 시스템 (Real-time Notifications & Push System)

## 구현 완료 현황

### 1. 이벤트 인터페이스 & 타입 정의

#### 위치: `/frontend/src/types/index.ts`

**완성된 인터페이스:**

```typescript
// 알림 이벤트 타입 (8가지)
export type NotificationEventType =
  | 'lto_completed'        // LTO 완성
  | 'score_improved'       // 점수 향상
  | 'message_received'     // 메시지 수신
  | 'feedback_received'    // 피드백 도착
  | 'milestone_achieved'   // 마일스톤 달성
  | 'approval_required'    // 승인 필요
  | 'session_scheduled'    // 세션 예약
  | 'reminder';            // 리마인더

// 심각도 & 우선순위
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'urgent';
export type NotificationPriority = 'normal' | 'high' | 'urgent';
export type DeliveryChannel = 'inApp' | 'push' | 'email';
export type DeliveryStatus = 'delivered' | 'pending' | 'failed';
export type InteractionStatus = 'viewed' | 'clicked' | 'dismissed' | 'unread';

// 핵심 인터페이스들
- NotificationEvent: 기본 알림 이벤트
- LTOCompletedEvent: LTO 완성 이벤트
- ScoreImprovedEvent: 점수 향상 이벤트
- MessageReceivedEvent: 메시지 수신 이벤트
- MilestoneAchievedEvent: 마일스톤 달성 이벤트
- PushSubscription: 푸시 구독 정보
- NotificationHistory: 알림 전송 이력
- NotificationMetadata: 알림 메타데이터
- NotificationTargetUser: 대상 사용자
```

### 2. NotificationContext (알림 컨텍스트)

#### 위치: `/frontend/src/context/NotificationContext.tsx`

**주요 함수 시그니처:**

```typescript
interface NotificationContextType {
  // 알림 조회
  notifications: NotificationHistory[];
  getNotifications(userId: string, filter?: NotificationFilter): NotificationHistory[];
  getUnreadCount(userId: string): number;

  // 알림 생성 및 발송
  createEvent(eventData: Omit<NotificationEvent, 'id' | 'createdAt'>): Promise<NotificationEvent>;
  emitEvent(eventType: NotificationEventType, metadata: NotificationMetadata): Promise<void>;

  // 알림 관리
  markAsRead(notificationId: string, userId: string): void;
  markAllAsRead(userId: string): void;
  deleteNotification(notificationId: string): void;
  markAsClicked(notificationId: string, userId: string): void;

  // 푸시 구독
  registerPushSubscription(subscription: Omit<PushSubscription, 'id' | 'createdAt'>): Promise<PushSubscription>;
  getPushSubscriptions(userId: string): PushSubscription[];
  updatePushPreferences(subscriptionId: string, preferences: PushSubscription['preferences']): void;

  // 이벤트 리스너
  onNotificationReceived(callback: (notification: NotificationHistory) => void): () => void;
}
```

**핵심 기능:**

1. **이벤트 템플릿 시스템**: 8가지 이벤트 타입별 자동 메시지 생성
2. **조용한 시간(Quiet Hours)**: 설정된 시간대에 푸시 알림 억제
3. **필터링**: 타입, 심각도, 우선순위, 아동별 필터링
4. **로컬 스토리지**: IndexedDB 대신 localStorage로 데이터 지속성 보장

**이벤트 발생 흐름:**
```
emitEvent(eventType, metadata)
  ↓
EVENT_TEMPLATES에서 템플릿 선택
  ↓
createEvent()로 NotificationEvent 생성
  ↓
각 pushSubscription 확인 (음소거, 조용한 시간)
  ↓
NotificationHistory 생성 및 저장
  ↓
리스너들에게 알림 전파
```

### 3. UI 컴포넌트

#### 3.1 NotificationBell (알림 벨)
**위치:** `/frontend/src/components/NotificationBell.tsx`

- 헤더에 추가할 알림 아이콘
- 미읽음 개수 배지 표시
- 클릭 시 NotificationCenter 열기

```typescript
<NotificationBell userId={userId} onOpenNotifications={handleOpenNotifications} />
```

#### 3.2 NotificationCenter (알림 센터)
**위치:** `/frontend/src/components/NotificationCenter.tsx`

- 사이드 슬라이드 패널 형식 (우측에서 열림)
- 실시간 필터링 & 정렬
- 필터 옵션:
  - 타입 (8가지)
  - 심각도 (info/success/warning/urgent)
  - 우선순위 (normal/high/urgent)
  - 아동별 필터
  - 읽음 상태 (all/read/unread)
  - 정렬 (최신순/우선순위)

#### 3.3 NotificationItem (알림 아이템)
**위치:** `/frontend/src/components/NotificationItem.tsx`

- 개별 알림 카드
- 심각도별 색상 구분
- 호버 시 삭제 버튼 표시
- 클릭 시 자동으로 읽음 표시
- 상대 시간 표시 (방금 전, 5분 전 등)

#### 3.4 ToastNotification (토스트 알림)
**위치:** `/frontend/src/components/ToastNotification.tsx`

- 화면 우하단에 슬라이드인 애니메이션
- 자동 소멸 (기본 5초)
- 액션 링크 포함 가능
- 진행 바 애니메이션

#### 3.5 NotificationPreferences (알림 설정)
**위치:** `/frontend/src/components/NotificationPreferences.tsx`

- 푸시 구독 장치 선택
- 채널 활성화/비활성화 (inApp/push/email)
- 조용한 시간 설정 (시작/종료)
- 알림 타입별 음소거 설정

### 4. 푸시 알림 통합

#### 4.1 Push Notification Manager
**위치:** `/frontend/src/utils/pushNotificationManager.ts`

**핵심 함수:**

```typescript
// Service Worker 등록
registerServiceWorker(scriptPath?: string): Promise<ServiceWorkerRegistration | null>

// 푸시 알림 구독
subscribeToPushNotifications(config: PushNotificationConfig): Promise<PushSubscription | null>

// 현재 구독 정보 조회
getPushSubscription(): Promise<PushSubscription | null>

// 푸시 알림 구독 해제
unsubscribeFromPushNotifications(): Promise<boolean>

// 로컬 알림 표시
showLocalNotification(title: string, options?: NotificationOptions): Promise<void>

// 전체 초기화
initializePushNotifications(config: PushNotificationConfig): Promise<boolean>

// 배치 처리
batchNotificationsByTime(notifications: any[], timeWindowMinutes?: number): BatchedNotification[]
```

**Web Push API 활용:**
- VAPID 키를 이용한 안전한 구독
- Service Worker 등록 및 관리
- 브라우저 알림 권한 처리

#### 4.2 Service Worker
**위치:** `/frontend/public/service-worker.js`

**기능:**
- Push 이벤트 리스닝
- 알림 표시 (showNotification)
- 알림 클릭 처리 (notificationclick)
- 알림 닫기 이벤트 (notificationclose)
- 오프라인 캐싱 (Fetch API)
- 백그라운드 동기화 (Background Sync)

### 5. 이벤트 발생 트리거

#### 5.1 CurriculumContext 통합점

```typescript
// SessionTask 완료 → LTOCompletedEvent
completeSessionTask(taskId: string) {
  // ... 기존 로직
  emitEvent('lto_completed', {
    childId: task.childId,
    ltoId: task.ltoId,
    ltoName: getLTOName(task.ltoId),
    domainName: getDomainName(task.domainId),
    score: task.score,
    completedAt: completedTime.toISOString(),
  });
}
```

#### 5.2 SessionLog 통합점

```typescript
// 점수 변경 감지 → ScoreImprovedEvent
updateSessionTask(taskId: string, updates: Partial<SessionTask>) {
  const oldTask = sessionTasks.find(t => t.id === taskId);
  const newScore = updates.score;

  if (oldTask && newScore && newScore > oldTask.score) {
    emitEvent('score_improved', {
      childId: oldTask.childId,
      ltoId: oldTask.ltoId,
      previousScore: oldTask.score,
      score: newScore,
      improvementPercent: ((newScore - oldTask.score) / oldTask.score) * 100,
    });
  }
}
```

#### 5.3 MessageContext 통합점

```typescript
// 메시지 발송 → MessageReceivedEvent
sendMessage(content: string, conversationId: string, senderId: string) {
  // ... 메시지 저장
  emitEvent('message_received', {
    childId: conversation.childId,
    messageId: newMessage.id,
    conversationId,
    senderName: sender.name,
    senderRole: sender.role,
    messagePreview: content.substring(0, 100),
  });
}
```

#### 5.4 Milestone 추적

```typescript
// LTO 완료 수 추적 → MilestoneAchievedEvent
trackMilestones(childId: number, completedLTOs: number) {
  if (completedLTOs === 10) {
    emitEvent('milestone_achieved', {
      childId,
      milestoneId: 'milestone_10_ltos',
      milestoneType: 'lto_count_milestone',
      celebrationMessage: '축하합니다! 10개의 LTO를 완성했습니다! 🎉',
    });
  }
}
```

### 6. 커스텀 Hook

#### 위치: `/frontend/src/hooks/useNotificationSystem.ts`

```typescript
export function useNotificationSystem(userId: string) {
  return {
    emitScoreImprovement(childId, ltoId, previousScore, currentScore),
    emitMessageReceived(childId, messageId, conversationId, senderName, senderRole, messagePreview),
    emitFeedbackReceived(childId, conversationId, senderName, senderRole),
    emitMilestoneAchieved(childId, milestoneId, milestoneType, celebrationMessage),
    emitApprovalRequired(childId, ltoId, ltoName),
    emitSessionScheduled(childId),
    emitReminder(childId, message),
  };
}
```

### 7. 전체 알림 페이지

#### 위치: `/frontend/src/pages/Notifications.tsx`

- 모든 알림 조회 페이지
- 고급 필터링 & 정렬
- 일괄 작업 (모두 읽음, 모두 삭제)
- 알림 설정 모달 연동

## 통합 가이드

### 단계 1: Provider 등록
```typescript
// App.tsx
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <CurriculumProvider>
        <ScheduleProvider>
          {/* Your app */}
        </ScheduleProvider>
      </CurriculumProvider>
    </NotificationProvider>
  );
}
```

### 단계 2: 헤더에 알림 벨 추가
```typescript
// Header.tsx
import { NotificationBell } from './components/NotificationBell';
import { NotificationCenter } from './components/NotificationCenter';

function Header() {
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

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

### 단계 3: 알림 발송
```typescript
// 컴포넌트 내에서
import { useNotificationSystem } from './hooks/useNotificationSystem';

function MyComponent() {
  const { emitScoreImprovement } = useNotificationSystem(userId);

  const handleScoreUpdate = (oldScore, newScore) => {
    emitScoreImprovement(childId, ltoId, oldScore, newScore);
  };
}
```

## 설정 옵션

### 환경변수 (.env)
```
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

### 조용한 시간 기본값
- 시작: 22:00
- 종료: 08:00

### 알림 자동 만료
- 기본값: 7일 후 자동 삭제

## 데이터 구조

### localStorage 키
- `notification_histories`: 알림 전송 이력
- `push_subscriptions`: 푸시 구독 정보
- `notification_preferences`: 알림 설정

### 타임스탬프 형식
- ISO 8601 형식 (UTC): `2024-04-27T10:30:00.000Z`

## 추후 개선 계획

1. **백엔드 연동**
   - REST API 또는 WebSocket으로 서버와 실시간 동기화
   - 멀티 디바이스 지원
   - 영구 저장소 (DB)

2. **고급 기능**
   - 이메일 발송 (nodemailer, SendGrid)
   - SMS 알림 (Twilio)
   - 슬랙 통합
   - 배치 처리 최적화

3. **분석**
   - 알림 클릭 추적
   - 읽음률 분석
   - A/B 테스트

4. **사용자 경험**
   - 알림 시간대 학습 (ML)
   - 중복 알림 통합
   - 우선순위 학습

## 테스트 시나리오

### 시나리오 1: LTO 완성 알림
```
1. SessionTask 완료 표시
2. → LTOCompletedEvent 발행
3. → 해당 아동의 치료사, 부모에게 알림 발송
4. → NotificationCenter에서 조회 가능
5. → 클릭 시 Dashboard의 해당 아동 페이지로 이동
```

### 시나리오 2: 점수 향상 알림
```
1. SessionLog에서 점수 업데이트
2. → 이전 점수보다 높으면 ScoreImprovedEvent 발행
3. → 향상율 계산 및 표시
4. → Reports 페이지로 링크
```

### 시나리오 3: 조용한 시간 테스트
```
1. 조용한 시간 설정: 22:00 ~ 08:00
2. 22:30에 이벤트 발생
3. → inApp 알림: 표시됨 ✓
4. → push 알림: 억제됨 ✗
5. → 08:30에 다시 발생
6. → push 알림: 표시됨 ✓
```

## 파일 구조

```
frontend/
├── src/
│   ├── types/
│   │   └── index.ts                 # 알림 타입 정의
│   ├── context/
│   │   └── NotificationContext.tsx  # 알림 컨텍스트
│   ├── components/
│   │   ├── NotificationBell.tsx     # 알림 벨
│   │   ├── NotificationCenter.tsx   # 알림 센터
│   │   ├── NotificationItem.tsx     # 알림 아이템
│   │   ├── ToastNotification.tsx    # 토스트
│   │   └── NotificationPreferences.tsx
│   ├── hooks/
│   │   └── useNotificationSystem.ts # 알림 통합 훅
│   ├── utils/
│   │   └── pushNotificationManager.ts # 푸시 알림 유틸
│   └── pages/
│       └── Notifications.tsx        # 알림 페이지
└── public/
    └── service-worker.js            # Service Worker
```

## 성능 고려사항

- **메모리**: localStorage 크기 제한 (일반적 5-10MB)
- **배치 처리**: 같은 시간대 알림 통합으로 푸시 수 감소
- **필터링**: 클라이언트 사이드 필터로 빠른 응답
- **캐싱**: 알림 데이터 로컬 캐싱으로 오프라인 지원

---

**마지막 업데이트:** 2026년 4월 27일  
**상태:** 완성 (Phase 3 Stream C2)
