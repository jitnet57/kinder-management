# AKMS Phase 3 Stream C3: ABC 분석 데이터 자동 기록 시스템

## 구현 완료 현황

### 1. 데이터 타입 정의 (types/index.ts)
완료된 타입 인터페이스:
- **Antecedent**: 선행사건 (지시, 환경적, 내부적, 전환)
- **Behavior**: 행동 (목표행동, 반응유형, 지연시간, 정확도, 독립성)
- **Consequence**: 결과 (강화, 처벌, 소거, 없음)
- **ABCReliability**: 신뢰성 (2명 기록 일치도, IOA%)
- **ABCTrends**: 추세 (개선/감소/안정, 기초선 대비)
- **ABCRecord**: ABC 기록 (세션별, 메타데이터)
- **ABCPattern**: ABC 패턴 분석 (선행사건/행동/결과 효과성)
- **FunctionAnalysis**: 행동 기능 분석 (행동 유지 결과, 대체행동)
- **ABCFormInput**: 폼 입력 인터페이스 (빠른/상세 모드)

### 2. ABCContext (context/ABCContext.tsx)
ABC 데이터 관리의 중앙 허브:

#### 상태 관리
- `abcRecords`: ABC 기록 배열
- `abcPatterns`: 패턴 분석 결과
- `functionAnalyses`: 기능 분석 결과

#### 핵심 함수
1. **ABC 기록 관리**
   ```typescript
   recordABC(abcData): void
   getABCRecords(childId, ltoId?, dateRange?): ABCRecord[]
   updateABCRecord(recordId, updates): void
   deleteABCRecord(recordId): void
   getABCRecordBySessionTask(sessionTaskId): ABCRecord | undefined
   ```

2. **패턴 분석 (데이터 기반)**
   ```typescript
   analyzePatterns(childId, ltoId, period?): ABCPattern
   ```
   - 선행사건별 성공률 계산: `(successTrials / totalTrials) * 100`
   - 행동 독립성 향상: `((last5 - first5) / first5) * 100`
   - 결과 효과성: `(positiveOutcomes / totalOutcomes) * 100`
   - 일관성 점수 계산

3. **기능 분석**
   ```typescript
   analyzeFunctionality(abcPatternId): FunctionAnalysis
   ```
   - 행동 유지 결과 파악 (접근/회피/주의/감각)
   - 대체 행동 제안
   - 행동 연쇄 분석
   - 계절성/시간대별 패턴

4. **인사이트 생성**
   ```typescript
   getInsights(abcPatternId): string[]
   generateRecommendations(childId, ltoId): string[]
   ```

#### 저장소 통합
- localStorage에 ABC 기록 자동 저장
- 아동당 최대 15개의 모의 데이터 생성 (데모용)

### 3. UI 컴포넌트

#### ABCRecorder (components/ABCRecorder.tsx)
세션 중 ABC 데이터 기록 컴포넌트

**기능:**
- 빠른 기록 모드 (2-3초): A-B-C 텍스트 + 정확도
- 상세 기록 모드: 완전한 ABC 폼
- 모드 토글 버튼

**입력 필드:**
- 선행사건: 유형, 설명, 맥락, 자극
- 행동: 목표행동, 반응유형, 시도/정확도, 독립성, 지연시간
- 결과: 유형, 강화자, 효과

**저장:**
- 클릭 시 ABCContext의 recordABC() 호출
- 자동 타임스탬프 생성
- 기록자 메타데이터 저장

#### ABCAnalytics (components/ABCAnalytics.tsx)
ABC 데이터 분석 대시보드

**요약 카드:**
- 평균 정확도: 0-100%
- 독립성 향상: % 증감
- 일관성 점수: 0-100
- 총 기록 수

**시각화 차트:**
1. **정확도 추세** (라인 차트)
   - X축: 날짜
   - Y축: 정확도 %
   - 개선 방향 추적

2. **반응 유형 분포** (원형 차트)
   - 정확/부정확/부분/무반응 비율

3. **선행사건 효과성** (막대 차트)
   - 각 선행사건별 성공률
   - 상단: 효과적인 것
   - 하단: 비효과적인 것

4. **독립성 수준** (원형 차트)
   - 독립적/부분적/지원 필요

5. **결과(강화자) 효과성** (막대 차트)
   - 각 강화자의 효과도

**인사이트 섹션:**
- AI 기반 권장사항 표시
- 색상 구분 (성공/주의/정보)

#### ABCDataList (components/ABCDataList.tsx)
ABC 기록 데이터 목록

**필터:**
- 아동 선택
- LTO 선택
- 정렬 (최신순/정확도순)

**각 기록:**
- 헤더: 행동명, 날짜, 정확도%, 반응유형
- 전개 가능: ABC 상세정보
  - 선행사건 상세
  - 행동 시도/정확도
  - 결과 및 효과
- 액션: 보기, 수정, 삭제

### 4. 데이터 분석 로직

#### 정확도 계산
```
accuracy = (correctTrials / totalTrials) * 100
```

#### 독립성 향상
```
independenceImprovement = ((independentLast5 - independentFirst5) / (independentFirst5 || 1)) * 100
```

#### 선행사건 효과성
```
successRate = (successfulResponses / totalOccurrences) * 100
```

#### 강화자 효과성
```
effectiveness = (positiveOutcomes / totalUsages) * 100
```

#### 신뢰성 (IOA)
```
interraterReliability = (agreements / totalTrials) * 100
```

### 5. SessionLog 통합 포인트

**자동 트리거:**
```
SessionTask 저장 → ABCRecorder 팝업 표시
옵션: "빠른 기록" / "상세 기록" / "나중에"
```

**구현 예시:**
```typescript
// SessionLog.tsx에서
const handleCompleteTask = (taskId: string) => {
  completeSessionTask(taskId);
  // ABC Recorder 팝업 자동 표시
  showABCRecorder(taskId);
};
```

### 6. Dashboard 통합 예시

**ABC 분석 요약 위젯:**
```typescript
<ABCAnalytics childId={selectedChild} ltoId={selectedLTO} />
```

**이번주 ABC 기록 현황:**
- 총 기록 수
- 평균 정확도
- 개선도 트렌드

### 7. Reports 통합 예시

**ABC 분석 섹션 추가:**
```
1. 아동별 ABC 정확도 비교
2. LTO별 행동 분석
3. 선행사건 효과성 분석
4. 강화자 효과도 분석
5. 기능 분석 리포트
```

## 파일 위치 정리

| 파일 | 경로 | 설명 |
|------|------|------|
| 타입 정의 | `/frontend/src/types/index.ts` | ABC 관련 모든 인터페이스 |
| ABCContext | `/frontend/src/context/ABCContext.tsx` | ABC 데이터 관리 및 분석 엔진 |
| ABCRecorder | `/frontend/src/components/ABCRecorder.tsx` | 기록 폼 컴포넌트 |
| ABCAnalytics | `/frontend/src/components/ABCAnalytics.tsx` | 분석 대시보드 |
| ABCDataList | `/frontend/src/components/ABCDataList.tsx` | 기록 데이터 목록 |

## 다음 단계 (구현 예정)

### Phase 1: 통합
- [ ] App.tsx에 ABCProvider 추가
- [ ] SessionLog에 ABCRecorder 팝업 통합
- [ ] Dashboard에 ABC 요약 위젯 추가
- [ ] Reports에 ABC 분석 섹션 추가

### Phase 2: 고급 기능
- [ ] 사진/비디오 업로드 기능
- [ ] 2명 기록 신뢰성 체크 기능
- [ ] 행동 기능 분석 리포트
- [ ] 대체 행동 제안 시스템
- [ ] 자동 패턴 감지 (ML)

### Phase 3: 데이터 마이그레이션
- [ ] IndexedDB 구현 (대용량 데이터)
- [ ] 백엔드 API 연동
- [ ] 데이터 검색 최적화
- [ ] 실시간 동기화

## 사용 예시

### 1. ABC 기록하기
```typescript
// ABCRecorder에서
const handleQuickSave = () => {
  recordABC({
    sessionTaskId: 'task-123',
    childId: 1,
    ltoId: 'domain_mand_lto01',
    stoId: 'domain_mand_lto01_sto1',
    antecedent: { ... },
    behavior: { ... },
    consequence: { ... },
    // ... 기타 메타데이터
  });
};
```

### 2. 패턴 분석하기
```typescript
const pattern = analyzePatterns(1, 'domain_mand_lto01', 'month');
// 반환: ABCPattern {
//   averageAccuracy: 85,
//   independenceImprovement: 15,
//   mostEffectiveAntecedent: { ... },
//   recommendations: [ ... ]
// }
```

### 3. 대시보드에서 분석 보기
```typescript
<ABCAnalytics childId={1} ltoId="domain_mand_lto01" />
```

## 주요 특징

1. **빠른 기록 모드**: 세션 중 2-3초 안에 ABC 데이터 입력
2. **상세 기록 모드**: 완전한 데이터 수집 (선행사건 세부정보, 강화자 종류 등)
3. **자동 분석**: 기록 저장 시 자동으로 패턴 분석
4. **시각화**: Recharts를 활용한 다양한 차트
5. **신뢰성**: 2명 기록 IOA% 계산
6. **기능 분석**: 행동 유지 결과 파악 및 대체행동 제안
7. **권장사항**: AI 기반 인사이트 제공
8. **모바일 친화**: 반응형 디자인

## 참고사항

- 모의 데이터는 demo용으로, 실제 사용 시 제거 필요
- localStorage는 테스트용, 프로덕션에서는 IndexedDB/API 사용
- 모든 타임스탐프는 ISO 8601 형식
- 아동 ID는 number (1, 2, 3, 4)로 고정
