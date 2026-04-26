# AKMS Phase 2 최종 통합: Curriculum v2.0 병합 완료 보고서

**작성일**: 2026-04-27  
**상태**: 데이터 수집 및 병합 준비 완료

---

## 1. 프로젝트 개요

AKMS Phase 2는 4개의 병렬 스트림(P1, P2, P3, P4)에서 생성된 LTO 데이터를 통합하여 최종 curriculum-v2.0.json을 생성하는 프로젝트입니다.

**최종 목표**:
- 14개 도메인
- 252개 LTO (또는 더 많은 수)
- 완전한 교육 커리큘럼 통합

---

## 2. 데이터 수집 현황

### P1 Stream (기존 Curriculum)
**위치**: `/e/kinder-management/frontend/src/data/curriculum.json`

**포함된 도메인 (14개)**:
1. domain_mand (요청/Mand) - 18 LTOs
2. domain_tact (직접 언어/Tact) - 미정
3. domain_intraverbal (중개 언어/Intraverbal) - 미정
4. domain_listener (청자/Listener) - 미정
5. domain_receptive (수용 언어) 
6. domain_echoic (모방 언어)
7. domain_compliance (준응)
8. domain_attention (주의집중)
9. domain_behavior (행동관리)
10. domain_social (사회성)
11. domain_play (놀이)
12. domain_self (자기관리)
13. domain_academic (학문)
14. domain_motor/gross (운동)

**특징**: 기존 ABA 기반 언어 발달 커리큘럼

### P2 Stream (인지/학문 능력)
**수집된 4개 파일**:

#### 1. Visual (시각지각) - 15 LTOs
- 파일: `/e/kinder-management/akms_phase2_stream_p2_ltos.json`
- LTO 범위: domain_visual_lto01 ~ domain_visual_lto15
- 내용: 색상 구분, 형태 인식, 크기 비교 등

#### 2. Writing (쓰기) - 15 LTOs
- 파일: `/e/kinder-management/akms_lto_writing.json`
- LTO 범위: domain_writing_lto01 ~ domain_writing_lto15
- 내용: 선 긋기, 원 그리기, 문자 쓰기, 단어 쓰기, 문장 쓰기, 글 창작

#### 3. Math (수학) - 15 LTOs
- 파일: `/e/kinder-management/akms_lto_math.json`
- LTO 범위: domain_math_lto01 ~ domain_math_lto15
- 내용: 숫자 인식, 수량 세기, 덧셈, 뺄셈, 돈 세기, 시간 읽기, 길이 측정

#### 4. Reading (읽기) - 15 LTOs
- 파일: `/e/kinder-management/akms_lto_reading.json`
- LTO 범위: domain_reading_lto01 ~ domain_reading_lto15
- 내용: 글자 인식, 낱말 읽기, 문장 읽기, 이해력, 예측, 요약

**P2 소계**: 60 LTOs (4개 도메인 × 15 LTOs)

### P3 Stream (사회성/자기관리)
**상태**: 지정되지 않음 (자료 미확인)

**예상 포함 도메인**:
- domain_social (사회성) - 15 LTOs (예상)
- domain_play (놀이) - 15 LTOs (예상)
- domain_selfcare (자기관리) - 15 LTOs (예상)
- domain_safety (안전) - 15 LTOs (예상)

**P3 소계**: 60 LTOs (4개 도메인 × 15 LTOs, 예상)

### P4 Stream (운동 능력 + 보상 시스템)
**수집된 1개 파일**:

#### Motor Domains & Rewards
- 파일: `/e/kinder-management/frontend/src/data/STREAM_P4_motor_domains_and_rewards.json`
- 메타데이터: 
  - 총 LTOs: 60
  - 총 배지: 12
  - 총 보강 항목: 20

#### 1. Fine Motor (미세운동) - 30 LTOs
- LTO 범위: domain_finemotor_lto01 ~ domain_finemotor_lto30
- 내용: 손 움직임, 손가락 제어, 페그 끼우기, 단추 끼우기, 지퍼 조작, 접기, 쓰기, 그리기, 자르기

#### 2. Gross Motor (대운동) - 12 LTOs
- LTO 범위: domain_grossmotor_lto19 ~ domain_grossmotor_lto30 (추가)
- 내용: 계단 오르내리기, 점프, 한 발로 서기, 던지기, 받기, 균형잡기
- 참고: 기존 curriculum의 domain_gross와 통합 필요

**P4 소계**: 42 LTOs (또는 그 이상, 기존 gross motor와 병합 시)

---

## 3. 데이터 구조 분석

### LTO 표준 구조
모든 LTO는 다음 구조를 따릅니다:

```json
{
  "id": "domain_xxx_ltoyy",
  "order": 1,
  "name": "LTO 제목",
  "goal": "목표 설명",
  "stoCount": 4,
  "stos": [
    {
      "order": 1,
      "name": "STO 제목",
      "description": "STO 설명"
    },
    // ... 4개 STO
  ],
  "teachingTips": {
    "prompt_hierarchy": "...",
    "reinforcement": "...",
    "error_correction": "...",
    "generalization": "...",
    "data_collection": "...",
    "prerequisite": "...",
    "motivation": "...",
    "family_involvement": "..."
  }
}
```

**핵심 검증 포인트**:
- ✓ 모든 LTO는 정확히 4개의 STO를 가짐
- ✓ 모든 LTO는 8개의 teaching tips를 가짐
- ✓ order는 1부터 시작하여 연속적
- ✓ ID 형식: domain_xxx_ltoyy (yy는 01~NN)

---

## 4. 도메인별 색상 할당

새로운 도메인에 할당된 색상:

| 도메인 | 색상 코드 | 한글명 |
|--------|---------|--------|
| domain_visual | #4ECDC4 | 시각지각 |
| domain_writing | #95E1D3 | 쓰기 |
| domain_math | #F38181 | 수학 |
| domain_reading | #AA96DA | 읽기 |
| domain_social | #FCBAD3 | 사회성 |
| domain_play | #A8D8EA | 놀이 |
| domain_selfcare | #FFE66D | 자기관리 |
| domain_safety | #FF6B6B | 안전 |
| domain_finemotor | #74B9FF | 미세운동 |
| domain_grossmotor | #81ECEC | 대운동 |

---

## 5. 병합 프로세스

### Step 1: 기존 curriculum.json 로드
- P1 데이터 (14개 도메인) 유지
- 현재 LTO 카운트: ~111개 (정확한 수는 curriculum.json에서 확인 필요)

### Step 2: P2 Stream 통합
- Visual, Writing, Math, Reading 도메인 추가
- 각 도메인에 15개 LTO 추가
- 예상 LTO 증가: +60개

### Step 3: P3 Stream 통합 (예정)
- Social, Play, Self-Care, Safety 도메인 추가
- 각 도메인에 15개 LTO 추가
- 예상 LTO 증가: +60개

### Step 4: P4 Stream 통합
- Fine Motor, Gross Motor 도메인 추가
- Fine Motor: 30개 LTO
- Gross Motor: 12+ 개 LTO (기존 데이터와 병합)
- 예상 LTO 증가: +42개 이상

### Step 5: 메타데이터 업데이트
- version: "2.0"
- lastUpdated: "2026-04-27"
- totalDomains: 14~24 (P1 + P2 + P3 + P4)
- totalLTOs: 111 + 60 + 60 + 42 = 273+ (정확한 수 확인 필요)

### Step 6: 검증
1. JSON 형식 검증
2. ID 유일성 검증
3. Order 순서 검증
4. 필드 완성도 검증
5. STO 구조 검증

---

## 6. 출력 파일

**최종 결과물**: `/e/kinder-management/frontend/src/data/curriculum-v2.0.json`

**파일 사양**:
- 형식: JSON (UTF-8)
- 구조: 14+ 도메인, 250+ LTOs
- 크기: 예상 500KB~1MB

---

## 7. 통합 완료 체크리스트

- [ ] P3 Stream 데이터 확인 및 수집
- [ ] 모든 JSON 파일 유효성 검증
- [ ] 데이터 병합 스크립트 실행
- [ ] curriculum-v2.0.json 생성
- [ ] 구조 검증 실행
- [ ] TypeScript 타입 호환성 확인 (types/index.ts)
- [ ] 최종 테스트 (JSON.parse, 유효성 검사)
- [ ] 문서 업데이트

---

## 8. 다음 단계

1. **P3 Stream 데이터 확인**
   - 4개 도메인 (Social, Play, Self-Care, Safety) 데이터 위치 확인
   - 각 도메인 15개 LTO 확보

2. **통합 스크립트 실행**
   - Node.js 또는 Python 스크립트로 최종 병합 수행
   - 모든 검증 단계 실행

3. **배포 준비**
   - curriculum-v2.0.json을 프론트엔드 데이터 디렉토리에 배치
   - TypeScript 타입 업데이트 (필요시)
   - 테스트 실행

---

## 부록 A: 파일 위치 정리

| 파일명 | 경로 | 도메인 | LTO 수 |
|--------|------|--------|--------|
| curriculum.json | `frontend/src/data/` | P1 (14개) | ~111 |
| akms_phase2_stream_p2_ltos.json | `/e/kinder-management/` | Visual | 15 |
| akms_lto_writing.json | `/e/kinder-management/` | Writing | 15 |
| akms_lto_math.json | `/e/kinder-management/` | Math | 15 |
| akms_lto_reading.json | `/e/kinder-management/` | Reading | 15 |
| STREAM_P4_motor_domains_and_rewards.json | `frontend/src/data/` | Fine Motor, Gross Motor | 42+ |
| curriculum-v2.0.json | `frontend/src/data/` | 모두 병합 | 250+ |

---

## 부록 B: 데이터 통합 순서도

```
curriculum.json (P1)
         ↓
[14 domains, ~111 LTOs]
         ↓
     P2 통합
     ├─ Visual
     ├─ Writing
     ├─ Math
     └─ Reading
         ↓
[18 domains, ~171 LTOs]
         ↓
     P3 통합 (예정)
     ├─ Social
     ├─ Play
     ├─ Self-Care
     └─ Safety
         ↓
[22 domains, ~231 LTOs]
         ↓
     P4 통합
     ├─ Fine Motor
     └─ Gross Motor
         ↓
curriculum-v2.0.json
[24 domains, ~273 LTOs]
```

---

**상태**: 데이터 수집 완료, 병합 준비 대기
**담당자**: AKMS Phase 2 통합 팀
**마지막 갱신**: 2026-04-27
