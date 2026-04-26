# AKMS Phase 3 Stream C4: 협업 대시보드 & 부모 전용 뷰 - 구현 완료

## 목표
치료사와 부모가 함께 아동의 진행 상황을 모니터링하는 협업 대시보드와, 부모 전용 간단한 대시보드를 구축합니다.

---

## 1. 데이터 모델 (타입 정의)

### 1.1 협업 대시보드 인터페이스
`/frontend/src/types/index.ts`에 다음 인터페이스 추가됨:

```typescript
// 협업 대시보드 - 목표 진행도
interface DashboardGoal {
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

// 협업 대시보드 - 메인 데이터 모델
interface CollaborativeDashboard {
  id: string;
  childId: number;
  viewers: { therapistId: string; parentIds: string[] };
  overview: { childName: string; age: number; photo: string | null; ... };
  goals: { activeGoals: DashboardGoal[]; completedGoals: CompletedGoal[] };
  thisWeek: WeeklyStats;
  monthlyTrend: MonthlyTrend;
  parentUpdates: { unreadMessages: number; unreadFeedback: number; ... };
  updatedAt: string;
}

// 부모 대시보드 메인 데이터 모델
interface ParentDashboard {
  childId: number;
  overview: { childName: string; photo: string | null; currentFocus: string; ... };
  actionItems: ActionItem[];           // 가정에서 할 일
  recentAchievements: RecentAchievement[];
  latestMessages: DashboardMessage[];
  monthlySummary: MonthlySummary;
}

// 협업 세션 (라이브 & 비동기)
interface CollaborationSession {
  id: string;
  childId: number;
  type: 'live_session' | 'async_review';
  participants: { therapistId: string; parentIds: string[] };
  liveData?: { isLive: boolean; sessionStartTime: string; ... };
  asyncReview?: { videoUrl: string; therapistAnalysis: string; ... };
  createdAt: string;
}

// 협업 노트 (Thread 형태)
interface CollaborativeNote {
  id: string;
  childId: number;
  type: 'observation' | 'insight' | 'concern' | 'celebration';
  author: { userId: string; name: string; role: 'therapist' | 'parent' };
  content: string;
  responses: { userId: string; name: string; content: string; createdAt: string }[];
  isPinned: boolean;
  createdAt: string;
}
```

---

## 2. Context 레이어 (상태 관리)

### 2.1 CollaborativeDashboardContext
위치: `/frontend/src/context/CollaborativeDashboardContext.tsx`

**핵심 기능:**

```typescript
interface CollaborativeDashboardContextType {
  // Collaborative Dashboard operations
  collaborativeDashboards: CollaborativeDashboard[];
  getCollaborativeDashboard(childId: number): CollaborativeDashboard | null;
  getCollaborativeDashboards(therapistId: string): CollaborativeDashboard[];
  updateGoalProgress(childId: number, ltoId: string, progress: number): Promise<void>;

  // Parent Dashboard operations
  getParentDashboard(childId: number, parentId: string): Promise<ParentDashboard | null>;

  // Weekly highlights
  getWeeklyHighlights(childId: number): WeeklyStats;

  // Collaborative Notes management
  collaborativeNotes: CollaborativeNote[];
  getCollaborativeNotes(childId: number): CollaborativeNote[];
  createCollaborativeNote(note: Omit<CollaborativeNote, 'id' | 'createdAt'>): Promise<CollaborativeNote>;
  updateCollaborativeNote(noteId: string, updates: Partial<CollaborativeNote>): Promise<void>;
  deleteCollaborativeNote(noteId: string): Promise<void>;
  addNoteResponse(noteId: string, userId: string, name: string, content: string): Promise<void>;
  pinNote(noteId: string, isPinned: boolean): Promise<void>;

  // Collaboration Sessions
  collaborationSessions: CollaborationSession[];
  startLiveSession(...): Promise<CollaborationSession>;
  endLiveSession(sessionId: string): Promise<void>;
  recordTherapistNotes(sessionId: string, notes: string[]): Promise<void>;
  recordParentObservation(sessionId: string, observation: string): Promise<void>;
  shareSessionVideo(sessionId: string, videoUrl: string, analysis: string): Promise<void>;

  // Utilities
  calculateChildAge(childId: number): number;
  getDaysUntilTargetDate(targetDate: string): number;
}
```

**주요 특징:**
- LocalStorage를 사용한 데이터 지속성
- Mock 데이터 생성 함수로 초기 대시보드 자동 생성
- 실시간 세션 관리 (라이브 + 비동기)
- 협업 노트 스레드 관리
- 사용자 역할 기반 필터링

---

## 3. React 컴포넌트

### 3.1 협업 대시보드 (Therapist View)
위치: `/frontend/src/pages/CollaborativeDashboard.tsx`

**주요 기능:**

1. **좌측 패널 - 아동 선택**
   - 담당 아동 목록 표시
   - 아동 선택 시 실시간 대시보드 업데이트
   - 아동별 색상 코딩

2. **중앙 - 탭 기반 콘텐츠**
   - `개요 탭` (Overview)
     - 이번주 세션 수 (완료/예정)
     - 평균 점수
     - 주요 발달 영역 진행도
     - 월간 추세 그래프
   
   - `목표 탭` (Goals)
     - 진행 중인 목표 (카드형)
       - 진행도 바
       - 상태 배지 (on_track/at_risk/completed)
       - 다음 마일스톤
       - 남은 날짜
     - 완료된 목표 (체크리스트)
   
   - `협업노트 탭` (Notes)
     - 새 노트 작성 폼
     - 노트 타입 선택 (observation/insight/concern/celebration)
     - 고정된 노트 강조 표시
     - 스레드 형태의 응답 표시

3. **우측 패널 - 부모 업데이트**
   - 읽지 않은 메시지 수
   - 읽지 않은 피드백 수
   - 마지막 업데이트 시간

**UI/UX:**
- 반응형 그리드 레이아웃
- 색상 코딩으로 상태 시각화
- 진행도 바로 한눈에 파악
- 탭 기반 정보 구성

### 3.2 부모 전용 대시보드 (Parent View)
위치: `/frontend/src/pages/ParentDashboard.tsx`

**주요 기능:**

1. **상단 - 주간 마일스톤**
   - 아동 이름 강조 표시
   - 이번주 특별 성취 표시
   - 현재 학습 중인 기술 표시

2. **왼쪽 메인 - 집에서 할 일 (Action Items)**
   - 카드형 활동 목록
   - 활동 설명 및 팁
   - 빈도 표시 (매일/주 3회 등)
   - 7일 완료 추적 바
   - 오늘 완료 표시

3. **중앙 - 최근 성취 갤러리**
   - 2열 그리드
   - 사진 또는 아이콘 표시
   - 점수 및 치료사 코멘트
   - 성취 날짜

4. **우측 사이드바**
   - 이번주 진행도 (%)
   - 치료사 최근 메시지 (3개)
   - 격려 메시지

5. **하단 - 월간 요약**
   - 발달 영역별 진행도
     - 진행도 바
     - 개선도 (%)
     - 상태 레이블
   - 이번달 하이라이트
   - 집중할 영역

**UI/UX:**
- 밝고 긍정적인 배색
- 성취 중심의 디자인
- 실행 가능한 활동 강조
- 모바일 친화적 레이아웃

---

## 4. 라우팅 및 메뉴 통합

### 4.1 새로운 라우트 추가
`/frontend/src/App.tsx`에 다음 라우트 추가:

```typescript
<Route path="/collaborative-dashboard" element={...} />  // 치료사용
<Route path="/parent-dashboard" element={...} />         // 부모용
```

### 4.2 메뉴 변경
`/frontend/src/components/Layout.tsx`의 `getNavItems()` 함수 수정:

**Therapist 메뉴:**
```
협업 대시보드 → /collaborative-dashboard
스케줄
💬 메시징
... (기존 항목들)
```

**Parent 메뉴:**
```
우리 아이 → /parent-dashboard
스케줄
💬 메시징
아동정보
보고서
```

**Admin 메뉴:**
```
대시보드 → /dashboard
스케줄
... (전체 메뉴)
```

---

## 5. 권한 관리 및 데이터 필터링

### 5.1 역할별 접근 제어
- **Therapist**: 협업 대시보드만 접근 (담당 아동)
- **Parent**: 부모 대시보드만 접근 (자신의 자녀)
- **Admin**: 모든 대시보드 접근 가능

### 5.2 데이터 필터링
- `getCollaborativeDashboards(therapistId)`: 치료사가 담당하는 아동만
- `getParentDashboard(childId, parentId)`: 부모가 관계된 자녀만
- 컴포넌트 내 `assignedChildren` 필터링

---

## 6. 데이터 통합 포인트

### 6.1 SessionTask → Action Items 변환
```typescript
// SessionTask에서 실행 가능한 집에서의 활동으로 변환
function convertSessionTaskToActionItem(task: SessionTask): ActionItem {
  return {
    title: `${task.notes}을(를) 집에서 연습하기`,
    description: task.notes,
    dueDate: new Date(task.date).getTime() + 7 * 86400000,
    frequency: '매일',
    completedDates: [],
    tips: '자연스러운 상황에서 반복 연습하세요.',
  };
}
```

### 6.2 SessionTask → Goal Progress 계산
```typescript
// 이번주 세션 과제로부터 목표 진행도 계산
function calculateGoalProgress(tasks: SessionTask[]): number {
  const avgScore = tasks.reduce((sum, t) => sum + t.score, 0) / tasks.length;
  return Math.min(avgScore, 100);
}
```

### 6.3 CompletedGoal 자동 생성
```typescript
// 진행도가 90% 이상일 때 목표를 완료된 목표로 이동
if (newProgress >= 90) {
  // activeGoals에서 제거
  // completedGoals에 추가
}
```

### 6.4 Message → Latest Messages
```typescript
// MessageContext의 메시지를 부모 대시보드에 표시
const recentMessages = notes
  .filter(n => n.author.role === 'therapist')
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 3);
```

---

## 7. 사용 흐름

### 7.1 Therapist 사용 흐름
1. 로그인 → 메뉴에서 "협업 대시보드" 클릭
2. 담당 아동 선택 (좌측 패널)
3. 아동의 진행 상황 확인
   - 개요 탭: 이번주 통계, 월간 추세
   - 목표 탭: 진행 중인 목표, 완료된 목표
   - 협업노트 탭: 부모와의 협업 노트 작성/확인
4. 목표 진행도 업데이트
5. 부모와 협업 노트 작성 및 응답

### 7.2 Parent 사용 흐름
1. 로그인 → 메뉴에서 "우리 아이" 클릭
2. 아동의 주간 마일스톤 확인
3. 집에서 할 일 확인 및 완료 추적
4. 최근 성취 갤러리 확인
5. 치료사 메시지 확인
6. 월간 요약으로 전체 진행도 파악

---

## 8. 파일 구조

```
frontend/src/
├── types/
│   └── index.ts                        # 협업 대시보드 인터페이스 추가
├── context/
│   └── CollaborativeDashboardContext.tsx  # NEW: 협업 대시보드 상태 관리
├── pages/
│   ├── CollaborativeDashboard.tsx      # NEW: 치료사용 협업 대시보드
│   └── ParentDashboard.tsx             # NEW: 부모용 간단한 대시보드
├── components/
│   └── Layout.tsx                      # 메뉴 수정 (협업 대시보드, 우리 아이 추가)
└── App.tsx                             # 라우트 추가, Provider 적용
```

---

## 9. 주요 특징 & 차별점

### 9.1 협업 대시보드의 강점
✓ 한 화면에서 모든 정보 관리
✓ 세 가지 탭으로 정보 체계화
✓ 실시간 목표 진행도 업데이트
✓ 협업 노트로 치료사-부모 커뮤니케이션
✓ 월간 추세로 장기 진행도 파악
✓ 부모 업데이트 알림 시스템

### 9.2 부모 대시보드의 강점
✓ 간단하고 직관적인 UI
✓ 집에서 할 일에 대한 명확한 지침
✓ 성취 중심의 긍정적 강화
✓ 최근 성취로 동기부여
✓ 치료사의 격려 메시지 강조
✓ 월간 요약으로 전체 방향성 제시

---

## 10. 향후 개선 사항

### Phase 3 Stream C4 확장 (선택사항)
1. **라이브 세션 모니터링**
   - `LiveSession.tsx` 컴포넌트
   - 실시간 비디오 스트리밍
   - 라이브 노트 작성

2. **비동기 협업 (비디오 리뷰)**
   - `SessionReview.tsx` 컴포넌트
   - 녹화된 세션 공유
   - 댓글 기능

3. **실시간 알림**
   - 목표 완료 시 부모에게 알림
   - 새 메시지 시 notification
   - 주간 마일스톤 달성 축하

4. **Analytics & Reporting**
   - 협업 효율성 지표
   - 부모 참여도 추적
   - 목표 달성률 분석

5. **Mobile App 지원**
   - 반응형 레이아웃 최적화
   - PWA 기능
   - 오프라인 모드

---

## 11. 테스트 가이드

### 11.1 CollaborativeDashboard 테스트
```bash
# 1. 치료사 로그인
# role: 'therapist'

# 2. 메뉴에서 "협업 대시보드" 클릭
# /collaborative-dashboard 접근

# 3. 왼쪽 패널에서 다양한 아동 선택
# 아동 변경 시 대시보드 데이터 업데이트 확인

# 4. 탭 전환 테스트
# - 개요: 이번주 통계, 월간 추세 표시
# - 목표: 진행 중/완료된 목표 표시
# - 협업노트: 노트 작성/응답 기능
```

### 11.2 ParentDashboard 테스트
```bash
# 1. 부모 로그인
# role: 'parent'

# 2. 메뉴에서 "우리 아이" 클릭
# /parent-dashboard 접근

# 3. 주간 마일스톤 표시 확인

# 4. 집에서 할 일 (Action Items) 확인
# - 완료 추적 바 확인
# - 팁 정보 표시

# 5. 월간 요약 섹션 확인
# - 발달 영역별 진행도
# - 하이라이트 및 집중 영역
```

---

## 12. 참고 자료

- TypeScript 타입 정의: `/frontend/src/types/index.ts` (Lines 406+)
- Context 구현: `/frontend/src/context/CollaborativeDashboardContext.tsx`
- 컴포넌트: `/frontend/src/pages/CollaborativeDashboard.tsx`, `ParentDashboard.tsx`
- 메뉴 설정: `/frontend/src/components/Layout.tsx`
- 라우팅: `/frontend/src/App.tsx`

---

## 요약

**AKMS Phase 3 Stream C4는 다음을 달성합니다:**

1. ✅ **협업 대시보드 데이터 모델** - 6개 새 인터페이스 추가
2. ✅ **Context 상태 관리** - CollaborativeDashboardContext 구현
3. ✅ **치료사 협업 대시보드** - 3탭 기반 전체 정보 관리 도구
4. ✅ **부모 전용 대시보드** - 간단하고 격려적인 진행 보기
5. ✅ **역할별 메뉴 통합** - 각 역할에 맞는 네비게이션
6. ✅ **권한 기반 접근 제어** - 자신의 아동/아이만 조회 가능

**핵심 가치:**
- 치료사와 부모의 원활한 협업
- 아동 진행 상황의 투명한 공유
- 부모의 적극적 참여 유도
- 데이터 기반의 진행도 추적
