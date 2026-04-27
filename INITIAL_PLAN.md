# 📋 AKMS 초기 개발 계획

**작성일**: 초기 계획 수립 시점  
**계획 방식**: BMAD × LangGraph 멀티에이전트 병렬 오케스트레이션  
**상태**: 📅 계획 단계 (향후 실행 예정)

---

## 📌 핵심 전략

**BMAD (Breakthrough Method of Agile AI-Driven Development) + LangGraph 조합**
- 4개 병렬 작업 스트림 동시 진행
- 각 스트림은 독립적인 에이전트가 담당
- 단계별 게이트(승인)를 통한 품질 보증

---

## 🎯 프로젝트 목표

1. **커리큘럼 데이터 생성** (AI 자동화)
   - 14개 VB 도메인 정의
   - 240개 LTO (장기목표) 자동 생성
   - STO, 설명, 교수팁 포함

2. **시스템 아키텍처 고도화**
   - ABC 과제분석 데이터 구조 확립
   - 중재 효과 분석 시스템 구축
   - 협력 플랫폼 (부모/치료사) 설계

3. **UI/UX 재설계**
   - 3열 레이아웃 커리큘럼 뷰
   - 아동별 커스터마이징
   - 실시간 데이터 시각화

4. **협업 기능 확대**
   - 부모 대시보드
   - 메시지 시스템 (선생님↔부모)
   - 실시간 알림 시스템

---

## 📐 Phase 0: 공유 기반 (순차 진행)

### 0-1. `frontend/src/types/index.ts` 신규 생성

**목적**: 타입 일관성 확보 (childId 통일)

```typescript
// Child 인터페이스
export interface Child {
  id: number;           // 1, 2, 3, 4
  name: string;
  age: number;
  createdAt: string;
}

// SessionTask 인터페이스
export interface SessionTask {
  id: string;
  childId: number;      // ← string에서 number로 변경
  sessionTaskId: string;
  domainId: string;
  ltoId: string;
  stoId: string;
  behavior: string;
  antecedent: string;
  consequence: string;
  date: string;
}

// 상수
export const CANONICAL_CHILDREN: Child[] = [
  { id: 1, name: '아동1', age: 5, createdAt: '2026-01-01' },
  { id: 2, name: '아동2', age: 6, createdAt: '2026-01-01' },
  { id: 3, name: '아동3', age: 4, createdAt: '2026-01-01' },
  { id: 4, name: '아동4', age: 7, createdAt: '2026-01-01' },
];

// 타입
export type ChildId = 1 | 2 | 3 | 4;
```

### 0-2. `frontend/src/App.tsx` Provider 순서 수정

**이유**: CurriculumContext에서 useCache() 호출 가능하려면 CacheProvider가 외부에 있어야 함

```typescript
// 변경 전
<CurriculumProvider>
  <ScheduleProvider>
    <CacheProvider>
      {/* 내용 */}
    </CacheProvider>
  </ScheduleProvider>
</CurriculumProvider>

// 변경 후 (올바른 순서)
<CacheProvider>
  <CurriculumProvider>
    <ScheduleProvider>
      {/* 내용 */}
    </ScheduleProvider>
  </CurriculumProvider>
</CacheProvider>
```

### 0-3. `frontend/src/context/CurriculumContext.tsx` Mock 데이터 수정

**목표**: 실제 데이터 형식으로 변경

| 항목 | 이전 | 변경 후 | 예시 |
|------|------|--------|------|
| childId | string (이름) | number (1~4) | `childId: 1` |
| domainId | 'd1', 'd2' | 실제 ID | `'domain_mand'` |
| ltoId | 'l1', 'l3' | 형식화된 ID | `'domain_mand_lto01'` |
| stoId | 's1', 's2' | 형식화된 ID | `'domain_mand_lto01_sto1'` |

```typescript
function generateMockSessionTasks(): SessionTask[] {
  return [
    {
      id: 'task-1',
      childId: 1,                          // ← number
      sessionTaskId: 'session-1',
      domainId: 'domain_mand',             // ← 실제 ID
      ltoId: 'domain_mand_lto01',         // ← 형식화
      stoId: 'domain_mand_lto01_sto1',    // ← 형식화
      behavior: '요청에 따르기',
      // ...
    },
  ];
}
```

---

## 🔄 Phase 1-4: 병렬 구현 (4개 스트림)

### Stream A: 커리큘럼 & 데이터 통합
**담당**: Curriculum 시스템  
**파일**: CurriculumContext.tsx, SessionLog.tsx, ChildDetailView.tsx, Curriculum.tsx

| 작업 | 내용 |
|------|------|
| A-1 | CurriculumContext - `getTasksByChild(childId: number)` 타입 수정 |
| A-2 | SessionLog.tsx - 하드코딩 CHILDREN 제거, CANONICAL_CHILDREN 사용 |
| A-3 | SessionLog.tsx - 날짜 이전/다음 네비게이션 버튼 추가 |
| A-4 | ChildDetailView.tsx - `task.childId === child.name` → `task.childId === child.id` 수정 |
| A-5 | Curriculum.tsx - teachingTips 패널 추가 |
| A-6 | Curriculum.tsx - goal 표시 및 검색 기능 추가 |

---

### Stream B: 아키텍처 & 데이터 영속성
**담당**: 데이터 관리 시스템  
**파일**: CacheContext.tsx, storage.ts, ScheduleContext.tsx, Children.tsx

| 작업 | 내용 | 의존성 |
|------|------|--------|
| B-1 | CacheContext에 storageManager 구현 | A-1 완료 후 |
| B-2 | storage.ts - domains, sessionTasks localStorage 저장 | B-1 완료 후 |
| B-3 | ScheduleContext - childId: 'c1' → number(1~4) 변경 | A-1 완료 후 |
| B-4 | Children.tsx - CANONICAL_CHILDREN 연동 | 0-1 완료 |
| B-5 | Children.tsx - 데이터 영속성 (localStorage) | B-2 완료 후 |
| B-6 | storage.ts - localhost:3000 동기화 noop 처리 | B-2 완료 후 |

---

### Stream C: UI/UX 개선
**담당**: 사용자 인터페이스  
**파일**: Dashboard.tsx, Reports.tsx, Completion.tsx

| 작업 | 내용 |
|------|------|
| C-1 | Dashboard.tsx - 하드코딩 통계 제거, useCurriculum() 연동 |
| C-2 | Dashboard.tsx - fetch 호출 제거 (실제 데이터 사용) |
| C-3 | Dashboard.tsx - heatmap/histogram을 recharts로 구현 |
| C-4 | Reports.tsx - CHILDREN_DATA 제거, CANONICAL_CHILDREN 사용 |
| C-5 | Reports.tsx - childId 비교 string → number 수정 |
| C-6 | Completion.tsx - childId 비교 수정 |

---

### Stream D: 역할 & 협업 기능
**담당**: 접근 제어 및 협력 시스템  
**파일**: Login.tsx, ProtectedRoute.tsx, AdminApprovals.tsx, deviceManager.ts, Layout.tsx

| 작업 | 내용 |
|------|------|
| D-1 | Login.tsx - therapist/parent 테스트 계정 추가 |
| D-2 | ProtectedRoute.tsx - `allowedRoles?: Array<'admin'\|'therapist'\|'parent'>` 추가 |
| D-3 | ProtectedRoute.tsx - 역할 기반 접근 제어 구현 |
| D-4 | deviceManager.ts - Notification 인터페이스 추가 |
| D-5 | deviceManager.ts - addNotification/getNotifications 함수 구현 |
| D-6 | Layout.tsx - getNavItems(role) 함수로 역할별 메뉴 분기 |
| D-7 | Layout.tsx - parent 역할은 읽기 전용 메뉴만 표시 |
| D-8 | AdminApprovals.tsx - 승인 프로세스 완성 |

---

## 📊 파일 소유권 (충돌 방지)

```
types/index.ts ................ Phase 0 (생성)
App.tsx ....................... Phase 0 (수정)
CurriculumContext.tsx ......... Phase 0 (타입교체) + Stream A/B
SessionLog.tsx ................ Stream A
ChildDetailView.tsx ........... Stream A
Curriculum.tsx ................ Stream A
CacheContext.tsx .............. Stream B
storage.ts .................... Stream B
ScheduleContext.tsx ........... Stream B
Children.tsx .................. Stream B
Dashboard.tsx ................. Stream C
Reports.tsx ................... Stream C
Completion.tsx ................ Stream C
Layout.tsx .................... Stream C + Stream D
Login.tsx ..................... Stream D
ProtectedRoute.tsx ............ Stream D
deviceManager.ts .............. Stream D
AdminApprovals.tsx ............ Stream D
```

---

## ⏭️ 의존성 순서

```
Phase 0-1: types/index.ts 생성
    ↓
Phase 0-2: App.tsx Provider 순서 수정
    ↓
Phase 0-3: CurriculumContext mock 수정
    ↓ ↓ ↓ ↓
   A  B  C  D  ← 병렬 실행
  (B-1은 A-1 완료 후)
    ↓ ↓ ↓ ↓
   통합 검증
```

---

## ✅ 검증 체크리스트

### 타입 검증
```bash
npx tsc --noEmit          # 타입 에러 0개
```

### 런타임 검증
```
1. ✅ admin@akms.com 로그인 → 대시보드 접근
2. ✅ Dashboard 통계가 실제 sessionTasks 기반으로 계산
3. ✅ SessionLog → 아동 선택 드롭다운 정상, 날짜 네비게이션 동작
4. ✅ Curriculum → LTO 클릭 시 teachingTips 표시
5. ✅ Reports → 도메인 이름이 한국어로 표시 (ID 아님)
6. ✅ therapist 로그인 → '승인관리' 메뉴 미표시
7. ✅ parent 로그인 → 모든 메뉴 읽기 전용
8. ✅ 새로고침 후 Children 데이터 유지 (localStorage)
9. ✅ 콘솔에 fetch localhost:3000 에러 없음
10. ✅ 모든 childId 비교에서 number 사용
```

---

## 🎓 학습 자료

이 계획에 사용된 기술:
- **BMAD 방법론**: 역할 기반 에이전트 시스템
- **LangGraph**: 멀티에이전트 오케스트레이션
- **TypeScript**: 타입 안정성
- **React Context**: 상태 관리
- **localStorage**: 데이터 영속성

---

**문서 상태**: 📅 계획 단계 (실행 대기)  
**최종 수정**: 초기 작성 시점
