# 아동관리 ABA 데이터 시스템 | 프로젝트 분석서

**작성자**: Mary (Analyst) | **날짜**: 2026-04-26  
**Status**: Phase 1 분석 완료 ✓

---

## 1. 프로젝트 개요

### 1.1 핵심 목표
ABA(응용행동분석) 기반 아동 교육/치료 기관에서 **주간 스케줄링, 아동 정보 관리, 일일 세션 데이터 기록, 커리큘럼 연동**을 통합 관리하는 웹앱

### 1.2 주요 사용자
- **실무자(세션 담당자)**: 스케줄 입력, 데이터 기록, 그래프 확인
- **관리자**: 아동정보 관리, 커리큘럼 편집, 리포팅

### 1.3 핵심 가치 제안
- 📅 **한 화면에 주간 전체 스케줄** → 시각적 충돌 해결, 효율성 ↑
- 🎨 **아동별 색상 코딩** → 직관적 구분
- 📊 **일일 데이터 기록 + 실시간 그래프** → 세션 진행도 추적
- 🔗 **커리큘럼과 세션의 양방향 연동** → 학습 목표 관리 자동화

---

## 2. 주요 기능 분석

### 2.1 **스케줄 관리 (Schedule Module)**

#### 2.1.1 특징
- **UI**: 월-토 시간표 (월~토 열, 오전/오후 행)
- **입력**: 한 아동을 여러 요일/시간대에 중복 배정 가능
- **속성**: 아동명, 세션명, 시작시간, 종료시간, 색상 자동 할당
- **액션**: 개별 수정/삭제/저장, **다중 선택 후 일괄 수정**

#### 2.1.2 데이터 모델
```
Schedule {
  id: UUID
  childId: UUID (외부키 → Child.id)
  childName: string
  sessionName: string
  dayOfWeek: enum [MON, TUE, WED, THU, FRI, SAT]
  startTime: HH:MM
  endTime: HH:MM
  color: hex (Child의 color 상속)
  createdAt: datetime
  updatedAt: datetime
}
```

#### 2.1.3 핵심 상호작용
- 아동 선택 → 요일 선택 (중복 O) → 시간 입력 → 저장
- 시간표 상의 항목 클릭 → 수정 모달 → 저장/삭제
- 중복 선택 후 일괄 편집 (ex. 3개 아동을 동시에 특정 요일에서 삭제)

---

### 2.2 **아동정보 관리 (Child Profile Module)**

#### 2.2.1 특징
- **UI**: 카드형 레이아웃 (그리드)
- **필드**: 
  - 기본: 이름, 생년월일, 전화번호, 주소
  - 파일: 첨부파일 (프로필 사진, 보호자 정보 등)
  - 메모: 기타정보 (textarea, 여러 줄)
  - 색상: 자동 할당 (RGB 또는 pastel palette)
- **액션**: 카드별 수정/저장/삭제

#### 2.2.2 데이터 모델
```
Child {
  id: UUID
  name: string
  dateOfBirth: date
  phone: string
  address: string
  notes: text
  attachments: JSON (array of {fileId, fileName, uploadedAt})
  color: hex
  status: enum [ACTIVE, INACTIVE, ARCHIVED]
  createdAt: datetime
  updatedAt: datetime
}
```

#### 2.2.3 관계도
- 1 Child : N Schedules
- 1 Child : N DataRecords
- 1 Child : N CurriculumAssignments

---

### 2.3 **데이터 기록지 (Daily Session Log)**

#### 2.3.1 특징
- **진입**: 아동정보 탭에서 아동명 클릭 → 해당 아동의 기록지 열림
- **기본 UI**: 아동별로 격리된 뷰, 과제 카드형 나열
- **필드**:
  - 과제명 (Curriculum의 목표명)
  - 시작/종료 시간
  - 성과 점수 (0~100, 또는 Pass/Fail)
  - 비고 (textarea)
- **그래프**: 각 과제별 "그래프" 버튼 → 모달에서 7일 추세 그래프 표시
- **입력 주기**: **매일 (Daily)** - 동일 과제를 여러 날 반복 가능
- **액션**: 과제별 수정/삭제/저장

#### 2.3.2 데이터 모델
```
SessionLog {
  id: UUID
  childId: UUID → Child.id
  curriculumId: UUID → Curriculum.id
  date: date
  score: number (0-100) | enum [PASS, FAIL]
  notes: text
  sessionStartTime: HH:MM
  sessionEndTime: HH:MM
  createdAt: datetime
  updatedAt: datetime
}
```

#### 2.3.3 그래프 로직
- **Y축**: 점수 (0-100)
- **X축**: 날짜 (최근 7일)
- **표시**: 라인 그래프 + 평균값
- **목표**: 과제별 진행도 시각화

---

### 2.4 **완료목록 (Completion List)**

#### 2.4.1 특징
- **소스**: SessionLog 데이터 자동 집계
- **필터**: 아동별, 날짜별, 과제별
- **표시**: 완료된 항목만 리스트 (또는 완료율)
- **액션**: 아카이빙, 필터링

#### 2.4.2 데이터 모델
```
CompletionLog {
  id: UUID
  sessionLogId: UUID → SessionLog.id
  status: enum [COMPLETED, IN_PROGRESS, PENDING]
  completedAt: datetime
  completedBy: string (담당자 이름)
}
```

---

### 2.5 **커리큘럼 관리 (Curriculum)**

#### 2.5.1 특징
- **계층**: 발달영역 → LTO (장기목표) → STO (단기목표) → 기타 칸
- **UI**: 트리형 또는 계층형 입력 (추가/수정/삭제)
- **연동**: SessionLog의 드롭다운에서 선택 가능하도록 노출
- **액션**: 커리큘럼 편집 → SessionLog에 즉시 반영

#### 2.5.2 데이터 모델
```
Curriculum {
  id: UUID
  domain: string (발달영역) [Ex: 언어, 인지, 사회성]
  lto: string (LTO) [Ex: 어휘력 개발]
  sto: string (STO) [Ex: 100개 단어 습득]
  notes: text (기타 칸)
  order: integer
  status: enum [ACTIVE, ARCHIVED]
  createdAt: datetime
  updatedAt: datetime
}

# SessionLog와 연동:
SessionLog.curriculumId → Curriculum.id (외부키)
```

---

## 3. 데이터 흐름

### 3.1 일반적인 사용 흐름

```
1. [관리자] Curriculum 입력
   → 발달영역 > LTO > STO 정의

2. [관리자] Child 등록
   → 이름, 생년월일, 색상 자동 할당

3. [실무자] Schedule 입력
   → 주간 시간표에 아동/시간 배정

4. [실무자] SessionLog 기록 (매일)
   → 아동 선택 → 과제 선택 (Curriculum) → 점수 입력 → 저장

5. [실무자] Graph 확인
   → 과제별 7일 추세 시각화

6. [관리자/실무자] CompletionLog 확인
   → 주간/월간 진행도 리포팅
```

### 3.2 데이터 종속성

```
Child (기본 정보)
  ├─ Schedule (주간 스케줄)
  ├─ SessionLog (일일 기록)
  │    └─ 참조 → Curriculum
  └─ CompletionLog (완료 추적)

Curriculum (커리큘럼 템플릿)
  └─ 참조됨 ← SessionLog (via curriculumId)
```

---

## 4. 기술적 요구사항 분석

### 4.1 프론트엔드
- **기술**: React 18+ (TypeScript 권장)
- **스타일**: Tailwind CSS + 파스텔톤 글래스 모르피즘
- **반응형**: 모바일 친화 (Schedule 뷰는 최소 데스크톱 권장)
- **차트**: Chart.js 또는 Recharts (7일 추세 그래프)

### 4.2 백엔드
- **기술**: Node.js (Express 또는 Hono) 권장
- **인증**: JWT (단순), 또는 Session (협업)
- **파일 업로드**: 로컬 또는 S3-compatible 스토리지

### 4.3 데이터베이스
**추천**: **PostgreSQL** (또는 MySQL 8.0+)
- **이유**:
  - 관계형 데이터(Child↔Schedule↔SessionLog)에 최적
  - JSON 필드 지원 (attachments 저장)
  - 날짜 범위 쿼리 효율적 (SessionLog의 7일 조회)
  - 오픈소스, 확장성, 트랜잭션 안정성

**대안**: MongoDB (문서형)
- 장점: 유연한 스키마, 수평확장 용이
- 단점: Join 연산 복잡, 트랜잭션 제한

**결정**: **PostgreSQL + Prisma ORM** 권장

### 4.4 배포
- **프론트**: Vercel, Netlify, GitHub Pages
- **백엔드**: Heroku, Railway, AWS EC2/RDS
- **전체 스택**: Docker + Docker Compose (개발 편의)

---

## 5. 비기능 요구사항

| 항목 | 요구사항 | 우선순위 |
|------|---------|---------|
| **성능** | 스케줄 조회 < 300ms | HIGH |
| **동시성** | 3-5명 실무자 동시 입력 지원 | HIGH |
| **가용성** | 99% 가용성 (SLA 목표) | MEDIUM |
| **보안** | 아동 개인정보 암호화 (GDPR 고려) | HIGH |
| **감시성** | 로깅, 감사 추적 (누가/언제 수정) | MEDIUM |
| **접근성** | WCAG 2.1 AA 준수 | LOW |

---

## 6. 위험 요소 & 완화 전략

| 위험 | 영향 | 완화 전략 |
|------|------|---------|
| **데이터 손실** | 세션 기록 유실 | 일일 백업, 트랜잭션 안정성 |
| **동시 편집 충돌** | 덮어쓰기 손실 | Optimistic locking 또는 Last-Write-Wins |
| **아동 정보 노출** | 개인정보 유출 | 접근 제어, 암호화, 감사 로그 |
| **UI/UX 복잡성** | 학습 곡선 높음 | 상세 온보딩, 튜토리얼, 아이콘 명확성 |

---

## 7. 성공 기준

✅ **Phase 2(기획) 진입 조건**:
- [ ] 이 분석서가 PM, UX, Architect와 동의
- [ ] 기술 스택 최종 확정 (DB, BE, FE)
- [ ] 일정 및 리소스 할당

✅ **최종 성공 지표**:
1. 주간 스케줄을 **2분 내**에 입력 완료
2. 아동별 색상으로 시각적 오류 **0건**
3. 일일 세션 기록 + 그래프 **< 5초** 로딩
4. 사용자 만족도 **4.5/5 이상**

---

## 부록 A: 용어 정의

- **ABA**: Applied Behavior Analysis (응용행동분석)
- **LTO**: Long-Term Objective (장기 목표)
- **STO**: Short-Term Objective (단기 목표)
- **Session**: 1:1 또는 그룹 세션 (보통 30분~1시간)
- **Curriculum**: 학습/치료 목표 템플릿

---

**다음 단계**: Phase 2 기획으로 이동 → PM(John) & UX(Sally) 리드
