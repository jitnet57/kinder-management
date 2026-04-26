# ABC 분석 시스템 - 빠른 참조 카드

## 🚀 5분 안에 시작하기

### 1. Provider 추가 (App.tsx)
```typescript
import { ABCProvider } from './context/ABCContext';

function App() {
  return (
    <ABCProvider>
      {/* your app */}
    </ABCProvider>
  );
}
```

### 2. Context 사용
```typescript
import { useABC } from '../context/ABCContext';

function MyComponent() {
  const { recordABC, getABCRecords, analyzePatterns } = useABC();
  
  // 기록 저장
  recordABC({ ... });
  
  // 기록 조회
  const records = getABCRecords(childId, ltoId);
  
  // 분석
  const pattern = analyzePatterns(childId, ltoId);
}
```

### 3. 컴포넌트 사용
```typescript
// 기록 폼
<ABCRecorder sessionTaskId={id} childId={1} ltoId="lto1" stoId="sto1" onClose={close} />

// 분석 대시보드
<ABCAnalytics childId={1} ltoId="lto1" />

// 데이터 목록
<ABCDataList childId={1} />
```

---

## 📊 ABC 기록 구조

```typescript
ABCRecord {
  id: "abc-123"
  sessionTaskId: "task-123"
  childId: 1
  
  // A: 선행사건
  antecedent: {
    type: "instruction" | "environmental" | "internal" | "transition"
    description: "지시 내용"
    context: "맥락"
  }
  
  // B: 행동
  behavior: {
    targetBehavior: "앉기"
    responseType: "correct" | "incorrect" | "partial" | "no_response"
    latency: 2  // 초
    dataPoints: {
      trials: 5
      correctTrials: 5
      accuracy: 100  // %
      independenceLevel: "independent" | "partial" | "assisted"
    }
  }
  
  // C: 결과
  consequence: {
    type: "reinforcement" | "punishment" | "extinction" | "none"
    reinforcer: "칭찬"
    effectOnBehavior: "increased" | "decreased" | "unchanged"
  }
}
```

---

## 🎯 주요 함수

### recordABC
새로운 ABC 기록 저장
```typescript
recordABC({
  sessionTaskId: "task-123",
  childId: 1,
  ltoId: "lto1",
  stoId: "sto1",
  antecedent: { ... },
  behavior: { ... },
  consequence: { ... },
  sessionDate: "2026-04-27",
  timeRecorded: "10:30:00",
  recordedBy: {
    userId: "user-1",
    name: "치료사명",
    role: "therapist"
  }
});
```

### getABCRecords
기록 조회 (필터링 가능)
```typescript
// 모든 기록
const all = getABCRecords(1);

// 특정 LTO
const lto = getABCRecords(1, "lto1");

// 날짜 범위
const range = getABCRecords(1, "lto1", {
  start: "2026-04-01",
  end: "2026-04-30"
});
```

### analyzePatterns
패턴 분석 (자동 실행)
```typescript
const pattern = analyzePatterns(
  1,              // childId
  "lto1",         // ltoId
  "month"         // period: "week" | "month" | "all"
);

// 반환:
// - averageAccuracy: 85
// - independenceImprovement: 15
// - recommendations: ["..."]
```

### getInsights
인사이트 생성
```typescript
const insights = getInsights(patternId);
// ["우수한 성과입니다!", "반응 속도 개선 중", ...]
```

---

## 🎨 컴포넌트 Props

### ABCRecorder
```typescript
<ABCRecorder
  sessionTaskId={string}  // 필수
  childId={number}        // 필수 (1-4)
  ltoId={string}          // 필수
  stoId={string}          // 필수
  onClose={() => void}    // 필수
  onSave={() => void}     // 선택
/>
```

### ABCAnalytics
```typescript
<ABCAnalytics
  childId={number}      // 기본값: 1
  ltoId={string}        // 선택
/>
```

### ABCDataList
```typescript
<ABCDataList
  childId={number}      // 기본값: 1
  ltoId={string}        // 선택
/>
```

---

## 📈 분석 결과 해석

### 정확도 (Accuracy)
- **90-100%**: 우수 (다음 단계 검토)
- **70-89%**: 양호 (계속 연습)
- **50-69%**: 보통 (방법 검토)
- **0-49%**: 부족 (지원 강화)

### 독립성 향상 (Independence Improvement)
- **+20% 이상**: 탁월한 진전
- **+10~20%**: 좋은 진전
- **0~10%**: 안정적 수준
- **음수**: 재교육 필요

### 반응 유형
- **정확 (Correct)**: 지시 따름
- **부분 (Partial)**: 부분적으로 따름
- **부정확 (Incorrect)**: 잘못된 반응
- **무반응 (No Response)**: 반응 없음

---

## 🔍 필터링 & 정렬

### 필터
```typescript
// ABCDataList에서 내장
- 아동 선택
- LTO 선택

// ABCContext 레벨
- 날짜 범위
- 정확도 범위
```

### 정렬
```typescript
// ABCDataList에서
- 최신순 (기본값)
- 정확도순
```

---

## 💾 데이터 저장소

### 현재 (Frontend)
```
localStorage
├── kinder_abc_records
├── kinder_curriculum_domains
└── kinder_session_tasks
```

### 조회/삭제
```javascript
// 콘솔에서
localStorage.getItem('kinder_abc_records')
localStorage.removeItem('kinder_abc_records')
localStorage.clear()
```

---

## ⚙️ 설정 변수

### ABCContext에서
```typescript
// 모의 데이터 생성 (demo용)
const generateMockABCRecords = (): ABCRecord[] => {
  // childIds: [1, 2, 3, 4]
  // records: 15개 × 4명 = 60개
};

// 저장소
storageManager.set('abc_records', abcRecords);
```

---

## 🐛 디버깅 팁

### 콘솔 확인
```javascript
// 모든 ABC 레코드 확인
console.log(JSON.parse(localStorage.getItem('kinder_abc_records')))

// 특정 패턴 확인
console.log(abcPatterns[0])

// Context 확인
console.log(useABC())
```

### 흔한 오류

| 오류 | 원인 | 해결 |
|------|------|------|
| "useABC must be used within ABCProvider" | Provider 누락 | App.tsx에 ABCProvider 추가 |
| 차트 미표시 | recharts 미설치 | `npm install recharts` |
| 데이터 없음 | 필터 조건 오류 | 필터 조건 재확인 |
| 저장 안 됨 | 폼 검증 실패 | 필수 필드 확인 |

---

## 📱 모바일 대응

모든 컴포넌트가 반응형으로 구현됨:
- 태블릿 화면에서 우수한 UI
- 모바일에서도 기본 기능 사용 가능
- 터치 친화적 버튼 크기

---

## 🔗 관련 파일

| 파일 | 용도 |
|------|------|
| `/types/index.ts` | 타입 정의 |
| `/context/ABCContext.tsx` | 상태 관리 |
| `/components/ABCRecorder.tsx` | 기록 폼 |
| `/components/ABCAnalytics.tsx` | 시각화 |
| `/components/ABCDataList.tsx` | 데이터 목록 |

---

## 📚 문서

- **STREAM_C3_ABC_ANALYSIS_SYSTEM.md**: 완전한 시스템 문서
- **STREAM_C3_INTEGRATION_GUIDE.md**: 통합 가이드
- **STREAM_C3_API_CONTRACTS.md**: API 명세 (향후)
- **STREAM_C3_COMPLETION_REPORT.md**: 완료 보고서

---

## 🎓 예제

### 기본 사용
```typescript
// 1. Context 가져오기
const { recordABC, analyzePatterns } = useABC();

// 2. 기록 저장
recordABC({
  sessionTaskId: 'task-1',
  childId: 1,
  ltoId: 'lto1',
  stoId: 'sto1',
  antecedent: {
    type: 'instruction',
    description: '앉으세요',
    context: '교실'
  },
  behavior: {
    targetBehavior: '앉기',
    responseType: 'correct',
    latency: 2,
    dataPoints: {
      trials: 5,
      correctTrials: 5,
      accuracy: 100,
      independenceLevel: 'independent'
    }
  },
  consequence: {
    type: 'reinforcement',
    reinforcer: '칭찬'
  },
  sessionDate: '2026-04-27',
  timeRecorded: '10:30:00',
  recordedBy: {
    userId: 'user1',
    name: '김치료사',
    role: 'therapist'
  }
});

// 3. 분석 수행
const pattern = analyzePatterns(1, 'lto1');
console.log(pattern.behaviorPatterns.averageAccuracy); // 85

// 4. 인사이트 얻기
const insights = getInsights(pattern.id);
console.log(insights); // ["우수한 성과입니다!"]
```

---

## ✅ 체크리스트

- [ ] ABCProvider를 App.tsx에 추가
- [ ] SessionLog에 ABCRecorder 연동
- [ ] Dashboard에 ABCAnalytics 추가
- [ ] Reports에 ABC 탭 추가
- [ ] localStorage 데이터 확인
- [ ] 모든 기능 테스트 완료
- [ ] 프로덕션 배포 준비

---

## 📞 자주 묻는 질문

**Q: 빠른 기록과 상세 기록의 차이?**  
A: 빠른 기록은 2-3초 안에 A-B-C만 기록, 상세 기록은 모든 세부정보 입력

**Q: 정확도는 어떻게 계산?**  
A: (정확한시도 / 전체시도) × 100

**Q: 2명이 함께 기록할 수 있나?**  
A: 네, reliability 필드에서 신뢰도(IOA%) 계산

**Q: 모의 데이터를 제거하려면?**  
A: ABCContext의 generateMockABCRecords() 제거

**Q: 데이터는 어디에 저장?**  
A: 현재 localStorage, 향후 백엔드 API와 연동

---

## 🎯 다음 단계

1. **즉시** (1일): Provider 추가 + SessionLog 통합
2. **이번 주**: Dashboard + Reports 통합
3. **다음 주**: 고급 기능 (사진, 2명 기록, PDF)
4. **향후**: 백엔드 구축 및 배포

---

**버전**: 1.0  
**마지막 업데이트**: 2026-04-27  
**상태**: 프로덕션 준비 완료
