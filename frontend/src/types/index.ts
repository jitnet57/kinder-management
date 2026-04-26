/**
 * AKMS 공유 TypeScript 인터페이스
 * 모든 페이지와 컨텍스트가 이 타입을 사용하여 데이터 일관성 보장
 */

// 아동 정보 (number ID 기준 확정)
export interface Child {
  id: number;        // 1, 2, 3, 4 - 절대 string name 아님
  name: string;      // '민준', '소영', '지호', '연서'
  birthDate: string;
  phone: string;
  address: string;
  notes: string;
  color: string;
  photo: string | null;
}

// 세션 과제 (childId를 number로 확정)
export interface SessionTask {
  id: string;
  childId: number;    // 변경: string → number (1, 2, 3, 4)
  domainId: string;
  ltoId: string;
  stoId: string;
  date: string;       // ISO 8601 형식
  startTime: string;
  endTime: string;
  score: number;      // 0-100
  notes: string;
  completed: boolean;
  completedAt?: string;
}

// 완료된 과제
export interface CompletionTask extends SessionTask {
  completedAt: string;
}

// 발달 영역 (도메인)
export interface DevelopmentDomain {
  id: string;
  name: string;
  description?: string;
  color?: string;
  ltos: LTO[];
}

// 장기 목표 (Long-Term Objective)
export interface LTO {
  id: string;
  name: string;
  order?: number;
  goal?: string;
  stos: STO[];
  teachingTips?: Record<string, string>;
}

// 단기 목표 (Short-Term Objective)
export interface STO {
  id: string;
  name: string;
  description?: string;
  order?: number;
}

// 스케줄 세션
export interface ScheduleSession {
  id: string;
  dayOfWeek: number;       // 0=월 ~ 5=토
  timeSlotIndex: number;   // 0-3 (4개 시간대: 8시, 10시, 14시, 16시)
  childId: number;         // 변경: 'c1' → number (1, 2, 3, 4)
  childName: string;
  sessionName: string;
  startTime: number;
  endTime: number;
  color: string;
}

// 공식 아동 데이터 (CANONICAL_CHILDREN)
export const CANONICAL_CHILDREN: Child[] = [
  {
    id: 1,
    name: '민준',
    birthDate: '2021-01-15',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123, 푸른숲아파트 101동',
    notes: '언어발달 우수, 집중력이 매우 좋음.',
    color: '#FFB6D9',
    photo: null,
  },
  {
    id: 2,
    name: '소영',
    birthDate: '2021-06-10',
    phone: '010-2345-6789',
    address: '서울시 서초구 강남대로 45, 현대빌라 3층',
    notes: '활발하고 사교적인 성격.',
    color: '#B4D7FF',
    photo: null,
  },
  {
    id: 3,
    name: '지호',
    birthDate: '2020-03-22',
    phone: '010-3456-7890',
    address: '서울시 강동구 구천면로 789, 삼성아파트 205동',
    notes: '차분하고 침착함.',
    color: '#C1FFD7',
    photo: null,
  },
  {
    id: 4,
    name: '연서',
    birthDate: '2021-09-05',
    phone: '010-4567-8901',
    address: '경기도 성남시 분당구 정자동 456번지',
    notes: '긍정적이고 밝은 성격.',
    color: '#FFE4B5',
    photo: null,
  },
];

export type ChildId = 1 | 2 | 3 | 4;

// ===== NOTIFICATION SYSTEM (Phase 3 Stream C2) =====

// Notification Event Types
export type NotificationEventType =
  | 'lto_completed'
  | 'score_improved'
  | 'message_received'
  | 'feedback_received'
  | 'milestone_achieved'
  | 'approval_required'
  | 'session_scheduled'
  | 'reminder';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'urgent';
export type NotificationPriority = 'normal' | 'high' | 'urgent';
export type DeliveryChannel = 'inApp' | 'push' | 'email';
export type DeliveryStatus = 'delivered' | 'pending' | 'failed';
export type InteractionStatus = 'viewed' | 'clicked' | 'dismissed' | 'unread';

// 알림 대상 사용자
export interface NotificationTargetUser {
  role: 'admin' | 'therapist' | 'parent' | 'all';
  childId?: number;
  userId?: string;
}

// 알림 메타데이터
export interface NotificationMetadata {
  childId: number;
  ltoId?: string;
  ltoName?: string;
  domainId?: string;
  domainName?: string;
  score?: number;
  previousScore?: number;
  improvementPercent?: number;
  messageId?: string;
  conversationId?: string;
  senderName?: string;
  senderRole?: string;
  messagePreview?: string;
  milestoneId?: string;
  milestoneType?: string;
  celebrationMessage?: string;
  completedAt?: string;
}

// 기본 알림 이벤트
export interface NotificationEvent {
  id: string;
  type: NotificationEventType;
  severity: NotificationSeverity;
  title: string;
  description: string;
  icon: string;

  targetUsers: NotificationTargetUser[];
  actionUrl?: string;
  actionLabel?: string;

  metadata: NotificationMetadata;
  priority: NotificationPriority;

  channels: {
    inApp: boolean;
    push?: boolean;
    email?: boolean;
  };

  createdAt: string;
  expiresAt?: string;
  read?: boolean;
  readAt?: string;
}

// Specific Event Types
export interface LTOCompletedEvent extends NotificationEvent {
  type: 'lto_completed';
}

export interface ScoreImprovedEvent extends NotificationEvent {
  type: 'score_improved';
}

export interface MessageReceivedEvent extends NotificationEvent {
  type: 'message_received';
}

export interface MilestoneAchievedEvent extends NotificationEvent {
  type: 'milestone_achieved';
}

// 푸시 구독
export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  auth: string;
  p256dh: string;
  role: 'admin' | 'therapist' | 'parent';
  childIds?: number[];
  enabledChannels: {
    inApp: boolean;
    push: boolean;
    email: boolean;
  };
  preferences: {
    quietHours?: {
      start: string;
      end: string;
    };
    mutedCategories?: NotificationEventType[];
  };
  createdAt: string;
  updatedAt?: string;
}

// 알림 전송 이력
export interface NotificationHistory {
  id: string;
  userId: string;
  eventId: string;
  notificationEvent: NotificationEvent;

  deliveryStatus: {
    inApp: DeliveryStatus;
    push?: DeliveryStatus;
    email?: DeliveryStatus;
  };

  deliveredAt: {
    inApp?: string;
    push?: string;
    email?: string;
  };

  interactionStatus: InteractionStatus;
  interactedAt?: string;
  createdAt: string;
}

// 레거시 호환성
export interface Notification {
  id: string;
  type: 'new_session' | 'completion' | 'approval_request';
  message: string;
  createdAt: string;
  read: boolean;
  targetRole: 'admin' | 'therapist' | 'parent' | 'all';
}

// ============================================
// PHASE 3 STREAM C1: 부모-치료사 메시징 시스템
// ============================================

// 메시지 첨부파일
export interface MessageAttachment {
  id: string;
  filename: string;
  type: string;
  url: string;
  uploadedAt: string;
}

// 메시지 반응 (좋아요, 응원 등)
export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

// 메시지 메타데이터
export interface MessageMetadata {
  relatedLtoId?: string;
  sessionDate?: string;
  scoreImprovement?: number;
}

// 메시지 인터페이스
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'therapist' | 'parent' | 'admin';
  recipientId?: string;
  childId: number;
  type: 'text' | 'image' | 'file' | 'feedback' | 'milestone';
  content: string;
  attachments?: MessageAttachment[];
  tags?: string[];
  priority?: 'normal' | 'high' | 'urgent';
  createdAt: string;
  readAt?: string;
  reactions?: MessageReaction[];
  metadata?: MessageMetadata;
}

// 대화 참여자
export interface ConversationParticipant {
  userId: string;
  name: string;
  role: 'therapist' | 'parent' | 'admin';
  joinedAt: string;
}

// 대화 인터페이스
export interface Conversation {
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

// 피드백 근거
export interface FeedbackEvidence {
  date: string;
  observation: string;
  photoUrl?: string;
}

// 피드백 실행 항목
export interface FeedbackActionItem {
  id: string;
  title: string;
  dueDate: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// 피드백 카테고리
export interface FeedbackCategory {
  domain: string;
  ltoId: string;
  skill: string;
}

// 피드백 인터페이스 (피드백 특화)
export interface Feedback {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'therapist' | 'parent';
  childId: number;
  type: 'progress' | 'concern' | 'suggestion' | 'celebration';
  category?: FeedbackCategory;
  content: string;
  evidence?: FeedbackEvidence[];
  actionItems?: FeedbackActionItem[];
  sentiment?: 'positive' | 'neutral' | 'concerning';
  urgency?: 'low' | 'medium' | 'high';
  responses?: Message[];
  createdAt: string;
}

// 마일스톤 증인
export interface MilestoneWitness {
  name: string;
  role: string;
}

// 마일스톤 인터페이스
export interface Milestone {
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

// ============================================
// PHASE 3 STREAM C3: ABC 분석 데이터 기록 시스템
// ============================================

// ABC 선행사건(Antecedent) 인터페이스
export interface Antecedent {
  type: 'instruction' | 'environmental' | 'internal' | 'transition';
  description: string;
  context: string;
  triggeredBy?: string;
  details?: {
    location: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    otherPresent: string[];
    environmentalFactors: string[];
  };
}

// ABC 행동(Behavior) 인터페이스
export interface Behavior {
  targetBehavior: string;
  responseType: 'correct' | 'incorrect' | 'partial' | 'no_response';
  latency: number;
  intensity?: 'weak' | 'normal' | 'strong';
  quality?: 'independent' | 'prompted' | 'fully_assisted';
  dataPoints: {
    trials: number;
    correctTrials: number;
    accuracy: number;
    independenceLevel: 'independent' | 'partial' | 'assisted';
  };
  notes?: string;
}

// ABC 결과(Consequence) 인터페이스
export interface Consequence {
  type: 'reinforcement' | 'punishment' | 'extinction' | 'none';
  reinforcementType?: 'tangible' | 'social' | 'activity' | 'token';
  reinforcer?: string;
  timing?: 'immediate' | 'delayed';
  effectOnBehavior?: 'increased' | 'decreased' | 'unchanged';
  description?: string;
}

// ABC 신뢰성(Reliability) 인터페이스
export interface ABCReliability {
  secondObserver?: {
    userId: string;
    name: string;
    agreement: boolean;
    notes?: string;
  };
  interraterReliability?: number;
}

// ABC 추세(Trends) 인터페이스
export interface ABCTrends {
  trendDirection?: 'improving' | 'declining' | 'stable';
  accelerationPoints?: number;
  baselineComparison?: number;
}

// ABC 기록 인터페이스
export interface ABCRecord {
  id: string;
  sessionTaskId: string;
  childId: number;
  ltoId: string;
  stoId: string;
  antecedent: Antecedent;
  behavior: Behavior;
  consequence: Consequence;
  sessionDate: string;
  timeRecorded: string;
  recordedBy: {
    userId: string;
    name: string;
    role: 'therapist' | 'parent' | 'admin';
  };
  reliability?: ABCReliability;
  trends?: ABCTrends;
  photoUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ABC 패턴 분석 인터페이스
export interface ABCPatternDetail {
  type: string;
  description: string;
  successRate: number;
  occurrences: number;
}

export interface BehaviorPatternData {
  averageAccuracy: number;
  independenceImprovement: number;
  latencyTrend: 'decreasing' | 'increasing' | 'stable';
  consistencyScore: number;
}

export interface ConsequenceEffectiveness {
  type: string;
  reinforcer: string;
  effectiveness: number;
}

export interface ABCPattern {
  id: string;
  childId: number;
  ltoId: string;
  startDate: string;
  endDate: string;
  antecedentPatterns: {
    mostEffective: ABCPatternDetail[];
    leastEffective: ABCPatternDetail[];
  };
  behaviorPatterns: BehaviorPatternData;
  consequenceEffectiveness: {
    mostEffective: ConsequenceEffectiveness[];
    leastEffective: ConsequenceEffectiveness[];
  };
  recommendations: string[];
  totalRecords: number;
  lastUpdated: string;
}

// 행동 기능 분석 인터페이스
export interface FunctionAnalysis {
  id: string;
  abcPatternId: string;
  childId: number;
  maintainingConsequence?: {
    type: 'access' | 'escape' | 'attention' | 'sensory';
    description: string;
    evidence: string[];
    confidence: number;
  };
  surrogate?: {
    behavior: string;
    description: string;
    implementationNotes: string;
  };
  behaviorChain?: {
    antecedent: string;
    behaviors: string[];
    consequence: string;
  };
  seasonality?: {
    pattern: string;
    occurrenceRate: number;
  };
}

// ABC 폼 입력 인터페이스
export interface ABCFormInput {
  sessionTaskId: string;
  childId: number;
  ltoId: string;
  stoId: string;
  quickRecord?: {
    antecedentText: string;
    behaviorText: string;
    consequenceText: string;
    accuracy: 'correct' | 'incorrect' | 'partial';
  };
}

// ============================================
// PHASE 3 STREAM C4: 협업 대시보드
// ============================================

// 협업 대시보드 - 목표 진행도
export interface DashboardGoal {
  ltoId: string;
  ltoName: string;
  domainId: string;
  domainName: string;
  progress: number;        // %
  targetDate: string;
  status: 'on_track' | 'at_risk' | 'completed';
  nextMilestone: string;
  daysRemaining: number;
}

// 협업 대시보드 - 완료된 목표
export interface CompletedGoal {
  ltoId: string;
  ltoName: string;
  completedDate: string;
  finalScore: number;
}

// 협업 대시보드 - 이번주 통계
export interface WeeklyStats {
  sessionsCompleted: number;
  sessionsScheduled: number;
  averageScore: number;
  topDomain: {
    domainId: string;
    domainName: string;
    progress: number;
  };
  concernArea?: {
    domainId: string;
    domainName: string;
    progress: number;
    reason: string;
  };
}

// 협업 대시보드 - 월간 추세
export interface MonthlyTrend {
  week1: number;
  week2: number;
  week3: number;
  week4: number;
  trend: 'improving' | 'declining' | 'stable';
}

// 협업 대시보드 - 메인 데이터 모델
export interface CollaborativeDashboard {
  id: string;
  childId: number;
  viewers: {
    therapistId: string;
    parentIds: string[];
  };

  overview: {
    childName: string;
    age: number;
    photo: string | null;
    lastSessionDate: string;
    nextSessionDate: string;
    overallProgress: number;  // 0-100%
  };

  goals: {
    activeGoals: DashboardGoal[];
    completedGoals: CompletedGoal[];
  };

  thisWeek: WeeklyStats;

  monthlyTrend: MonthlyTrend;

  parentUpdates: {
    unreadMessages: number;
    unreadFeedback: number;
    lastUpdate: string;
  };

  updatedAt: string;
}

// 부모 전용 대시보드 - Action Items
export interface ActionItem {
  id: string;
  title: string;             // "가정에서 '앉으세요' 연습하기"
  description: string;
  dueDate: string;
  frequency: string;         // "매일", "주 3회"
  completedDates: string[];
  tips: string;              // 교수 팁
}

// 부모 전용 대시보드 - 최근 성취
export interface RecentAchievement {
  date: string;
  description: string;       // "'더' 요청하기 - 독립적 수행"
  score: number;
  therapistComment?: string; // "아주 좋은 진행입니다!"
  photo?: string;
}

// 부모 전용 대시보드 - 최근 메시지
export interface DashboardMessage {
  id: string;
  date: string;
  senderName: string;
  content: string;
  priority: 'normal' | 'high';
}

// 부모 전용 대시보드 - 월간 요약
export interface MonthlySummary {
  domainProgress: {
    domainName: string;
    improvement: number;     // +15%
    status: string;          // "좋은 진행"
  }[];
  highlights: string[];
  areasToFocus: string[];
}

// 부모 대시보드 메인 데이터 모델
export interface ParentDashboard {
  childId: number;

  // 간단한 개요
  overview: {
    childName: string;
    photo: string | null;
    currentFocus: string;      // "요청하기를 배우고 있어요"
    thisWeekMilestone?: string; // "3일 연속 독립적으로 앉기 성공!"
  };

  // 부모 액션 항목
  actionItems: ActionItem[];

  // 최근 성취
  recentAchievements: RecentAchievement[];

  // 치료사 메시지 (최근 3개)
  latestMessages: DashboardMessage[];

  // 월간 요약
  monthlySummary: MonthlySummary;
}

// 협업 세션
export interface CollaborationSession {
  id: string;
  childId: number;
  type: 'live_session' | 'async_review';

  participants: {
    therapistId: string;
    therapistName: string;
    parentIds: string[];
    parentNames: string[];
  };

  liveData?: {                 // 라이브 세션 중
    isLive: boolean;
    sessionStartTime: string;
    currentActivity: string;
    therapistNotes: string[];  // 실시간 메모
    parentObservations: string[];  // 부모의 관찰
    liveScore?: number;
  };

  asyncReview?: {              // 비동기 검토 (영상 기반)
    videoUrl: string;
    duration: number;          // 초
    therapistAnalysis: string;
    parentFeedback?: string;
    sharedAt: string;
  };

  createdAt: string;
}

// 협업 노트
export interface CollaborativeNote {
  id: string;
  childId: number;
  type: 'observation' | 'insight' | 'concern' | 'celebration';

  author: {
    userId: string;
    name: string;
    role: 'therapist' | 'parent';
  };

  relatedLto?: {
    ltoId: string;
    ltoName: string;
  };

  content: string;
  attachments?: {
    photoUrl?: string;
    videoUrl?: string;
    documentUrl?: string;
  };

  responses: {
    userId: string;
    name: string;
    content: string;
    createdAt: string;
  }[];

  isPinned: boolean;
  createdAt: string;
}
