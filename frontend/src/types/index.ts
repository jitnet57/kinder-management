/**
 * AKMS 공유 TypeScript 인터페이스
 * 모든 페이지와 컨텍스트가 이 타입을 사용하여 데이터 일관성 보장
 */

// 아동 정보 (number ID 기준 확정)
export interface Child {
  id: number;        // 1, 2, 3, 4 - 절대 string name 아님
  name: string;      // '민준', '소영', '지호', '연서'
  age: number;       // 아동 나이
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
    age: 3,
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
    age: 3,
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
    age: 4,
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
    age: 3,
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
  senderName: string;
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

// ============================================
// PHASE 4 STREAM D3: 고급 분석 기능
// ============================================

// ============= 1️⃣ 중재 효과 분석 (Intervention Analysis) =============

export interface InterventionEffect {
  interventionId: string;
  interventionName: string;
  strategy: 'reinforcement' | 'extinction' | 'prompt' | 'prompt_fading';
  reinforcerType?: 'tangible' | 'social' | 'activity' | 'token';
  effectiveness: number;        // 0-100, 효과도
  applicationsCount: number;    // 적용 횟수
  successRate: number;          // 0-100, 성공률
  trend: 'improving' | 'stable' | 'declining';
  averageLatency?: number;      // 평균 응답 시간 (초)
  confidenceScore: number;      // 0-100, 신뢰도
}

export interface InterventionAnalysisResult {
  id: string;
  childId: number;
  childName: string;
  ltoId: string;
  ltoName: string;
  periodStart: string;
  periodEnd: string;
  daysAnalyzed: number;

  interventions: InterventionEffect[];

  mostEffective: {
    interventionId: string;
    interventionName: string;
    effectiveness: number;
  };

  leastEffective: {
    interventionId: string;
    interventionName: string;
    effectiveness: number;
  };

  recommendations: string[];
  totalTrials: number;
  overallProgress: number;      // 0-100
  analyzedAt: string;
}

// ============= 2️⃣ 행동 예측 (Behavior Prediction) =============

export interface PredictionPoint {
  week: number;
  predictedAccuracy: number;    // 0-100
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  trend: 'improving' | 'stable' | 'declining';
}

export interface BehaviorPredictionResult {
  id: string;
  childId: number;
  childName: string;
  ltoId: string;
  ltoName: string;

  baselineAccuracy: number;     // 과거 5주 평균
  historicalData: {
    week: number;
    accuracy: number;
    date: string;
  }[];

  predictions: PredictionPoint[];

  predictedOutcome: {
    week: number;
    expectedAccuracy: number;
    likelihood: number;         // 0-100
  };

  modelAccuracy: number;        // 과거 예측 정확도
  trend: 'improving' | 'stable' | 'declining';
  nextMilestoneEstimate: string; // 예상 도달 날짜

  createdAt: string;
}

// ============= 3️⃣ 학습 속도 분석 (Learning Velocity) =============

export interface VelocityMetrics {
  childId: number;
  childName: string;
  weeklyImprovement: number;    // % per week
  accelerationRate: number;     // 가속도 (0-100)
  consistencyScore: number;     // 0-100, 일관성
  averageScore: number;         // 0-100
  peakScore: number;
  lowestScore: number;
}

export interface LearningVelocityComparison {
  id: string;
  period: 'week' | 'month';
  periodLabel: string;
  childrenMetrics: VelocityMetrics[];

  fastestLearner: {
    childId: number;
    childName: string;
    velocity: number;
  };

  needsSupportChild: {
    childId: number;
    childName: string;
    velocity: number;
    reason: string;
  };

  averageVelocity: number;
  analysisDate: string;
}

// ============= 4️⃣ 자동 인사이트 (AI Insights) =============

export interface InsightRecommendation {
  id: string;
  category: 'strength' | 'improvement_area' | 'intervention' | 'next_focus';
  title: string;
  description: string;
  evidence: {
    data_point: string;
    value: string | number;
    date: string;
  }[];
  priority: 'high' | 'normal' | 'low';
  actionItems?: string[];
  estimatedImpact: 'high' | 'medium' | 'low';
}

export interface AutoInsightResult {
  id: string;
  childId: number;
  childName: string;
  weekNumber: number;
  dateRange: {
    start: string;
    end: string;
  };

  insights: InsightRecommendation[];

  summary: {
    overallProgress: string;    // "좋은 진행 중입니다"
    keyStrengths: string[];
    areasToFocus: string[];
    nextWeekFocus: string;
  };

  generatedAt: string;
  modelVersion: string;
}

// ============================================
// PHASE 5 STREAM P2: 5가지 고급 기능
// ============================================

// ============= 1️⃣ 실시간 AI 코칭 (Real-time AI Coaching) =============

export interface LiveCoachingAdvice {
  id: string;
  timestamp: string;
  type: 'immediate_feedback' | 'prompt_suggestion' | 'behavior_observation' | 'reinforcement_idea';
  content: string;
  priority: 'urgent' | 'high' | 'normal';
  relatedBehavior?: string;
  suggestedAction?: string;
  confidence: number;  // 0-100
}

export interface LiveSessionContext {
  id: string;
  childId: number;
  childName: string;
  sessionStartTime: string;
  sessionEndTime?: string;
  ltoId: string;
  ltoName: string;
  therapistId: string;
  isLive: boolean;

  currentActivity: string;
  currentScore: number;
  trials: number;
  correctTrials: number;

  coachingAdvice: LiveCoachingAdvice[];

  realTimeMetrics: {
    responseLatency: number;      // 초
    accuracyRate: number;         // 0-100
    independenceLevel: string;    // 'independent' | 'partial' | 'assisted'
    engagement: number;           // 0-100
  };

  aiModel: {
    modelVersion: string;
    processingTime: number;       // ms
    confidence: number;
  };

  createdAt: string;
  updatedAt: string;
}

// ============= 2️⃣ 비디오 기반 행동 분석 (Video-based Behavior Analysis) =============

export interface VideoFrame {
  frameNumber: number;
  timestamp: number;            // 초
  behaviorDetected: string[];
  confidence: number;
  keypoints?: {
    x: number;
    y: number;
    label: string;
  }[];
}

export interface VideoAnalysisResult {
  id: string;
  childId: number;
  videoUrl: string;
  uploadedAt: string;
  duration: number;            // 초

  frames: VideoFrame[];

  analysis: {
    behaviorSummary: {
      behavior: string;
      occurrences: number;
      totalDuration: number;   // 초
      averageConfidence: number;
    }[];

    autoGeneratedABC?: {
      antecedent: string;
      behavior: string;
      consequence: string;
      confidence: number;
    };

    overallAccuracy: number;
    independenceRating: 'independent' | 'partial' | 'assisted';
  };

  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  processedAt?: string;
  createdAt: string;
}

export interface VideoSession {
  id: string;
  childId: number;
  ltoId: string;
  videoUrl: string;
  duration: number;
  uploadedBy: string;
  uploadedAt: string;
  status: 'active' | 'archived';
}

// ============= 3️⃣ 스마트 알림 시스템 (Smart Notification Timing) =============

export interface UserActivityPattern {
  dayOfWeek: number;
  timeSlot: string;
  engagementLevel: number;     // 0-100
  responseTime: number;        // ms
  interactionCount: number;
}

export interface SmartNotificationSchedule {
  id: string;
  userId: string;
  optimalTimes: {
    day: string;
    time: string;
    score: number;             // 0-100 최적화 점수
  }[];

  patterns: UserActivityPattern[];

  quietHours: {
    start: string;
    end: string;
  };

  preferences: {
    maxNotificationsPerDay: number;
    preferredChannels: DeliveryChannel[];
    categories: {
      category: NotificationEventType;
      frequency: 'always' | 'daily' | 'weekly' | 'never';
    }[];
  };

  mlScore: number;             // ML 모델의 최적화 점수
  updatedAt: string;
}

export interface NotificationOptimization {
  id: string;
  userId: string;

  activityMetrics: {
    activeHours: string[];
    peakHours: string[];
    quietHours: string[];
    averageSessionDuration: number;
  };

  engagementMetrics: {
    clickThroughRate: number;
    dismissalRate: number;
    responseRate: number;
  };

  recommendations: {
    bestTimeToNotify: string;
    recommendedFrequency: string;
    channelPreference: DeliveryChannel;
    confidence: number;
  };

  analyzedAt: string;
}

// ============= 4️⃣ 고급 통계 분석 (Advanced Statistics) =============

export interface StatisticalTest {
  name: 'ttest' | 'chi_square' | 'anova' | 'pearson' | 'spearman';
  testValue: number;
  pValue: number;
  degreesOfFreedom: number;
  isSignificant: boolean;      // p < 0.05
  effectSize?: number;
}

export interface ConfidenceInterval {
  estimate: number;
  lowerBound: number;
  upperBound: number;
  confidenceLevel: number;     // 95 or 99
}

export interface RegressionModel {
  type: 'linear' | 'polynomial' | 'exponential';
  equation: string;
  rSquared: number;
  adjRSquared: number;
  residuals?: number[];
  prediction?: {
    nextValue: number;
    confidence: number;
  };
}

export interface CorrelationAnalysis {
  variable1: string;
  variable2: string;
  correlationCoefficient: number;  // -1 to 1
  strength: 'weak' | 'moderate' | 'strong';
  isSignificant: boolean;
  testUsed: 'pearson' | 'spearman';
}

export interface StatisticalAnalysisResult {
  id: string;
  childId: number;
  ltoId: string;
  periodStart: string;
  periodEnd: string;

  descriptiveStats: {
    mean: number;
    median: number;
    mode: number;
    standardDeviation: number;
    variance: number;
    range: { min: number; max: number };
    quartiles: { q1: number; q2: number; q3: number };
  };

  statisticalTests: StatisticalTest[];
  confidenceIntervals: ConfidenceInterval[];

  regressionAnalysis?: RegressionModel;
  correlationAnalysis?: CorrelationAnalysis[];

  outliers?: number[];
  normalityTest?: {
    isNormal: boolean;
    testName: string;
    pValue: number;
  };

  conclusions: string[];
  analyzedAt: string;
}

// ============= 5️⃣ 다국어 지원 (Internationalization - i18n) =============

export type SupportedLanguage = 'ko' | 'en' | 'zh' | 'ja';

export interface LanguageStrings {
  [key: string]: string | LanguageStrings;
}

export interface LanguageResource {
  locale: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  strings: LanguageStrings;
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currencySymbol: string;
  };
}

export interface UserLanguagePreference {
  id: string;
  userId: string;
  language: SupportedLanguage;
  dateFormat: 'gregorian' | 'lunar';
  timeFormat: '12h' | '24h';
  numberFormat: 'standard' | 'regional';
  updatedAt: string;
}

export interface i18nContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, defaultValue?: string) => string;
  formatDate: (date: string | Date) => string;
  formatNumber: (number: number) => string;
  formatCurrency: (amount: number) => string;
  availableLanguages: SupportedLanguage[];
}
