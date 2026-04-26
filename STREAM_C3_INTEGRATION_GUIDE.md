# AKMS Phase 3 Stream C3 통합 가이드

## 1. Provider 통합 (App.tsx)

### 현재 상태
```typescript
// 예상 구조
<CurriculumProvider>
  <ScheduleProvider>
    {/* Routes */}
  </ScheduleProvider>
</CurriculumProvider>
```

### 수정 필요 항목
```typescript
// App.tsx
import { ABCProvider } from './context/ABCContext';

function App() {
  return (
    <CurriculumProvider>
      <ScheduleProvider>
        <ABCProvider>
          {/* Routes and other providers */}
        </ABCProvider>
      </ScheduleProvider>
    </CurriculumProvider>
  );
}
```

**Priority: HIGH** - 모든 ABC 기능의 기초

---

## 2. SessionLog 통합

### 목표
SessionTask 완료 시 자동으로 ABC 기록 폼 팝업

### 현재 코드 위치
`/frontend/src/pages/SessionLog.tsx` (lines 35-47 수정 필요)

### 구현 방법

#### Step 1: Import 추가
```typescript
import { ABCRecorder } from '../components/ABCRecorder';
import { useABC } from '../context/ABCContext';
```

#### Step 2: State 추가
```typescript
const { recordABC } = useABC();
const [showABCRecorder, setShowABCRecorder] = useState(false);
const [selectedTaskForABC, setSelectedTaskForABC] = useState<{
  id: string;
  childId: number;
  ltoId: string;
  stoId: string;
} | null>(null);
```

#### Step 3: 기존 완료 핸들러 수정
```typescript
const handleCompleteTask = (taskId: string) => {
  const task = sessionTasks.find(t => t.id === taskId);
  if (task) {
    // 기존 로직
    completeSessionTask(taskId);
    
    // ABC 기록 팝업 표시
    setSelectedTaskForABC({
      id: taskId,
      childId: task.childId,
      ltoId: task.ltoId,
      stoId: task.stoId,
    });
    setShowABCRecorder(true);
  }
};
```

#### Step 4: JSX에 컴포넌트 추가
```typescript
{showABCRecorder && selectedTaskForABC && (
  <ABCRecorder
    sessionTaskId={selectedTaskForABC.id}
    childId={selectedTaskForABC.childId}
    ltoId={selectedTaskForABC.ltoId}
    stoId={selectedTaskForABC.stoId}
    onClose={() => {
      setShowABCRecorder(false);
      setSelectedTaskForABC(null);
    }}
    onSave={() => {
      // Optional: 성공 토스트 표시
      setShowABCRecorder(false);
      setSelectedTaskForABC(null);
    }}
  />
)}
```

**Priority: HIGH** - 핵심 기록 흐름

---

## 3. Dashboard 통합

### 목표
ABC 분석 요약 위젯 추가

### 현재 코드 위치
`/frontend/src/pages/Dashboard.tsx`

### 구현 방법

#### Option A: 새로운 섹션으로 추가
```typescript
import { ABCAnalytics } from '../components/ABCAnalytics';

// Dashboard 컴포넌트 내
<div className="mt-8">
  <h3 className="text-2xl font-bold text-gray-800 mb-4">ABC 분석</h3>
  <ABCAnalytics childId={selectedChild} />
</div>
```

#### Option B: 탭으로 추가
```typescript
const [dashboardTab, setDashboardTab] = useState<'overview' | 'abc'>('overview');

// JSX
<div className="flex gap-2 mb-4">
  <button
    onClick={() => setDashboardTab('overview')}
    className={`px-4 py-2 rounded-lg ${
      dashboardTab === 'overview' ? 'bg-pastel-purple text-white' : 'bg-gray-200'
    }`}
  >
    개요
  </button>
  <button
    onClick={() => setDashboardTab('abc')}
    className={`px-4 py-2 rounded-lg ${
      dashboardTab === 'abc' ? 'bg-pastel-purple text-white' : 'bg-gray-200'
    }`}
  >
    ABC 분석
  </button>
</div>

{dashboardTab === 'abc' && <ABCAnalytics childId={selectedChild} />}
```

**Priority: MEDIUM** - 시각화 및 인사이트

---

## 4. Reports 통합

### 목표
ABC 분석 결과를 아동별 리포트에 포함

### 현재 코드 위치
`/frontend/src/pages/Reports.tsx`

### 구현 방법

#### Step 1: Import 추가
```typescript
import { ABCDataList } from '../components/ABCDataList';
import { useABC } from '../context/ABCContext';
```

#### Step 2: 리포트 타입에 ABC 옵션 추가
```typescript
// reportType state에 'abc' 추가
const [reportType, setReportType] = useState<'individual' | 'overall' | 'abc'>('individual');

// 탭 버튼
<button
  onClick={() => setReportType('abc')}
  className={`px-4 py-2 rounded-lg ${
    reportType === 'abc' ? 'bg-pastel-purple text-white' : 'bg-gray-200'
  }`}
>
  ABC 분석 리포트
</button>
```

#### Step 3: ABC 리포트 섹션 추가
```typescript
{reportType === 'abc' && (
  <div className="space-y-6">
    <ABCDataList childId={selectedChildId} />
    <ABCAnalytics childId={selectedChildId} />
  </div>
)}
```

**Priority: MEDIUM** - 리포트 완성도

---

## 5. 새 페이지: ABC Analysis (옵션)

### 목표
ABC 분석 전용 페이지 생성

### 구현 단계

#### Step 1: 새 페이지 생성
```typescript
// /frontend/src/pages/ABCAnalysis.tsx
import { useState } from 'react';
import { ABCDataList } from '../components/ABCDataList';
import { ABCAnalytics } from '../components/ABCAnalytics';

export function ABCAnalysis() {
  const [view, setView] = useState<'data' | 'analytics'>('analytics');

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">ABC 분석</h2>
      
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('analytics')}
          className={`px-4 py-2 rounded-lg ${
            view === 'analytics' ? 'bg-pastel-purple text-white' : 'bg-gray-200'
          }`}
        >
          분석 대시보드
        </button>
        <button
          onClick={() => setView('data')}
          className={`px-4 py-2 rounded-lg ${
            view === 'data' ? 'bg-pastel-purple text-white' : 'bg-gray-200'
          }`}
        >
          데이터 기록
        </button>
      </div>

      {view === 'analytics' && <ABCAnalytics />}
      {view === 'data' && <ABCDataList />}
    </div>
  );
}
```

#### Step 2: Route 추가
```typescript
// App.tsx의 라우트
<Route path="/abc-analysis" element={<ABCAnalysis />} />
```

#### Step 3: Navigation 추가
```typescript
// Layout.tsx 또는 네비게이션 컴포넌트
<a href="/abc-analysis" className="nav-link">ABC 분석</a>
```

**Priority: LOW** - 향후 고도화

---

## 6. 데이터 흐름도

```
SessionLog (세션 기록)
    ↓
    ├→ SessionTask 완료
    ↓
ABCRecorder (팝업)
    ├→ 빠른 기록 (A-B-C 텍스트)
    └→ 상세 기록 (완전한 ABC 폼)
    ↓
ABCContext.recordABC()
    ├→ ABCRecord 저장
    ├→ localStorage에 저장
    ↓
Dashboard / Reports / ABCAnalysis
    ├→ ABCAnalytics (시각화)
    ├→ ABCDataList (데이터 목록)
    ├→ 패턴 분석 및 인사이트
    ↓
기능 분석 (FunctionAnalysis)
    ├→ 행동 유지 결과 파악
    └→ 대체 행동 제안
```

---

## 7. 테스트 체크리스트

### Basic Functionality
- [ ] ABCProvider 추가 후 앱 실행 확인
- [ ] SessionLog에서 Task 완료 시 ABCRecorder 팝업 표시
- [ ] 빠른 기록 모드 동작 확인
- [ ] 상세 기록 모드 동작 확인
- [ ] ABC 데이터 저장 확인 (localStorage)

### Analytics
- [ ] Dashboard에서 ABC 분석 표시
- [ ] 정확도 추세 차트 표시
- [ ] 반응 유형 분포 표시
- [ ] 선행사건 효과성 표시
- [ ] 권장사항 표시

### Reports
- [ ] Reports 페이지에서 ABC 탭 표시
- [ ] ABC 데이터 목록 필터링 동작
- [ ] 데이터 정렬 동작 (최신순/정확도순)
- [ ] 확장/축소 기능

### Edge Cases
- [ ] 데이터 없을 때 "데이터 없음" 메시지 표시
- [ ] 아동 변경 시 데이터 필터링
- [ ] LTO 변경 시 데이터 필터링
- [ ] 삭제 기능 동작 확인

---

## 8. 성능 최적화 (Phase 2)

### 현재 (로컬스토리지)
- 장점: 즉시 사용 가능
- 단점: 대용량 데이터 처리 불가 (5-10MB 제한)

### 추천 (IndexedDB)
```typescript
// IDB를 사용하려면 idb 라이브러리 설치
npm install idb

// ABCContext에 통합
import { openDB } from 'idb';

const db = await openDB('akms-abc', 1, {
  upgrade(db) {
    db.createObjectStore('abc-records', { keyPath: 'id' });
    db.createObjectStore('abc-patterns', { keyPath: 'id' });
  },
});
```

### 검색 최적화
```typescript
// 인덱싱
db.createObjectStore('abc-records', { keyPath: 'id' }, {
  indexes: [
    ['childId'],      // 아동별 검색
    ['ltoId'],        // LTO별 검색
    ['sessionDate'],  // 날짜별 검색
    ['accuracy'],     // 정확도별 검색
  ]
});
```

---

## 9. 백엔드 연동 (Phase 3)

### API Endpoints (예상)
```
POST   /api/abc/records          - 기록 저장
GET    /api/abc/records          - 기록 조회
PUT    /api/abc/records/:id      - 기록 수정
DELETE /api/abc/records/:id      - 기록 삭제

GET    /api/abc/patterns         - 패턴 분석 조회
POST   /api/abc/analyze          - 분석 트리거

GET    /api/abc/analysis/:childId/:ltoId
```

### ABCContext 수정
```typescript
// API 호출로 교체
const recordABC = useCallback(async (abcData) => {
  const response = await fetch('/api/abc/records', {
    method: 'POST',
    body: JSON.stringify(abcData),
  });
  const saved = await response.json();
  setABCRecords(prev => [...prev, saved]);
}, []);
```

---

## 10. 배포 체크리스트

### Before Deployment
- [ ] 모의 데이터 제거 또는 조건부 표시
- [ ] localStorage 데이터 마이그레이션 계획 수립
- [ ] 에러 핸들링 추가
- [ ] 로딩 상태 표시 추가
- [ ] 접근성 (a11y) 검토

### Production
- [ ] 환경 변수 설정 (.env)
- [ ] API_BASE_URL 설정
- [ ] 보안 검토 (CORS, 인증)
- [ ] 성능 모니터링 설정
- [ ] 사용자 권한 확인

---

## 11. 문제 해결 가이드

### 문제: ABCContext가 인식되지 않음
**해결**: App.tsx에 ABCProvider 추가 확인

### 문제: ABCRecorder 팝업이 나타나지 않음
**해결**: SessionLog에서 setShowABCRecorder(true) 호출 확인

### 문제: 차트가 표시되지 않음
**해결**: 
- recharts 설치 확인: `npm install recharts`
- 데이터가 있는지 확인 (필터링 조건)

### 문제: localStorage 데이터 손실
**해결**: 백업 수동 생성
```typescript
// 콘솔에서
localStorage.setItem('abc_records_backup', localStorage.getItem('kinder_abc_records'))
```

---

## 12. 추가 리소스

### 관련 파일
- `/frontend/src/types/index.ts` - 타입 정의
- `/frontend/src/context/ABCContext.tsx` - 상태 관리
- `/frontend/src/components/ABCRecorder.tsx` - 기록 폼
- `/frontend/src/components/ABCAnalytics.tsx` - 분석 대시보드
- `/frontend/src/components/ABCDataList.tsx` - 데이터 목록

### 참고 문서
- Recharts 문서: https://recharts.org/
- React Context: https://react.dev/reference/react/useContext
- TypeScript: https://www.typescriptlang.org/

---

## 빠른 체크리스트

```
[ ] 1. ABCProvider를 App.tsx에 추가
[ ] 2. SessionLog에서 ABCRecorder 통합
[ ] 3. Dashboard에 ABCAnalytics 추가
[ ] 4. Reports에 ABC 탭 추가
[ ] 5. 테스트 실행 및 검증
[ ] 6. 배포 전 데이터 마이그레이션 계획
```

---

**문서 버전**: 1.0  
**작성 일자**: 2026-04-27  
**담당자**: AKMS 개발팀
