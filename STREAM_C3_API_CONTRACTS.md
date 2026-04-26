# AKMS Phase 3 Stream C3: ABC 분석 시스템 API 계약서

## 1. 기본 정보

**Base URL**: `/api/v1/abc`  
**인증**: JWT Token (Authorization: Bearer {token})  
**응답 형식**: JSON  
**API 버전**: v1

---

## 2. ABC 기록 관리

### 2.1 기록 생성
**Endpoint**: `POST /records`

**Request Body**:
```json
{
  "sessionTaskId": "task-123",
  "childId": 1,
  "ltoId": "domain_mand_lto01",
  "stoId": "domain_mand_lto01_sto1",
  "antecedent": {
    "type": "instruction",
    "description": "치료사가 '앉으세요'라고 지시",
    "context": "교실 내",
    "triggeredBy": "음성 신호",
    "details": {
      "location": "교실",
      "timeOfDay": "morning",
      "otherPresent": ["치료사"],
      "environmentalFactors": ["일반 소음"]
    }
  },
  "behavior": {
    "targetBehavior": "앉기",
    "responseType": "correct",
    "latency": 2,
    "intensity": "normal",
    "quality": "independent",
    "dataPoints": {
      "trials": 5,
      "correctTrials": 5,
      "accuracy": 100,
      "independenceLevel": "independent"
    },
    "notes": "긍정적인 반응"
  },
  "consequence": {
    "type": "reinforcement",
    "reinforcementType": "social",
    "reinforcer": "칭찬, 스티커",
    "timing": "immediate",
    "effectOnBehavior": "increased",
    "description": "칭찬과 스티커 제공"
  },
  "sessionDate": "2026-04-27",
  "timeRecorded": "10:30:00",
  "recordedBy": {
    "userId": "therapist-001",
    "name": "김치료사",
    "role": "therapist"
  },
  "reliability": {
    "secondObserver": {
      "userId": "therapist-002",
      "name": "이치료사",
      "agreement": true
    }
  }
}
```

**Response** (201 Created):
```json
{
  "id": "abc-rec-20260427-001",
  "sessionTaskId": "task-123",
  "childId": 1,
  "ltoId": "domain_mand_lto01",
  "stoId": "domain_mand_lto01_sto1",
  "antecedent": { ... },
  "behavior": { ... },
  "consequence": { ... },
  "sessionDate": "2026-04-27",
  "timeRecorded": "10:30:00",
  "recordedBy": { ... },
  "reliability": {
    "secondObserver": { ... },
    "interraterReliability": 95
  },
  "trends": {
    "trendDirection": "improving",
    "accelerationPoints": 2,
    "baselineComparison": 110
  },
  "createdAt": "2026-04-27T10:30:15.000Z",
  "updatedAt": "2026-04-27T10:30:15.000Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "INVALID_INPUT",
  "message": "behavior.targetBehavior is required",
  "fields": ["behavior.targetBehavior"]
}
```

---

### 2.2 기록 조회
**Endpoint**: `GET /records`

**Query Parameters**:
```
?childId=1
&ltoId=domain_mand_lto01
&startDate=2026-04-01
&endDate=2026-04-30
&sortBy=date|accuracy
&limit=50
&offset=0
```

**Response** (200 OK):
```json
{
  "total": 25,
  "limit": 50,
  "offset": 0,
  "data": [
    {
      "id": "abc-rec-20260427-001",
      "childId": 1,
      "ltoId": "domain_mand_lto01",
      "behavior": { ... },
      "accuracy": 100,
      "sessionDate": "2026-04-27",
      "createdAt": "2026-04-27T10:30:15.000Z"
    },
    ...
  ]
}
```

---

### 2.3 특정 기록 조회
**Endpoint**: `GET /records/:recordId`

**Response** (200 OK):
```json
{
  "id": "abc-rec-20260427-001",
  "sessionTaskId": "task-123",
  "childId": 1,
  "ltoId": "domain_mand_lto01",
  "stoId": "domain_mand_lto01_sto1",
  "antecedent": { ... },
  "behavior": { ... },
  "consequence": { ... },
  ... 전체 레코드
}
```

---

### 2.4 기록 수정
**Endpoint**: `PUT /records/:recordId`

**Request Body** (부분 업데이트 가능):
```json
{
  "behavior": {
    "notes": "수정된 관찰 노트",
    "dataPoints": {
      "trials": 6,
      "correctTrials": 5,
      "accuracy": 83
    }
  },
  "consequence": {
    "reinforcer": "칭찬만"
  }
}
```

**Response** (200 OK):
```json
{
  "id": "abc-rec-20260427-001",
  ... 수정된 전체 레코드
}
```

---

### 2.5 기록 삭제
**Endpoint**: `DELETE /records/:recordId`

**Response** (204 No Content)

**Error Response** (404 Not Found):
```json
{
  "error": "NOT_FOUND",
  "message": "Record not found"
}
```

---

### 2.6 SessionTask로 기록 조회
**Endpoint**: `GET /records/session/:sessionTaskId`

**Response** (200 OK):
```json
{
  "id": "abc-rec-20260427-001",
  "sessionTaskId": "task-123",
  ... 레코드 데이터
}
```

---

## 3. 패턴 분석

### 3.1 패턴 분석 조회 또는 생성
**Endpoint**: `GET /patterns`

**Query Parameters**:
```
?childId=1 (필수)
&ltoId=domain_mand_lto01 (필수)
&period=week|month|all (기본값: month)
```

**Response** (200 OK):
```json
{
  "id": "pattern-abc-20260427-001",
  "childId": 1,
  "ltoId": "domain_mand_lto01",
  "startDate": "2026-04-01",
  "endDate": "2026-04-27",
  "antecedentPatterns": {
    "mostEffective": [
      {
        "type": "instruction",
        "description": "치료사의 명확한 지시",
        "successRate": 95,
        "occurrences": 20
      }
    ],
    "leastEffective": [
      {
        "type": "environmental",
        "description": "소음이 많은 환경",
        "successRate": 45,
        "occurrences": 11
      }
    ]
  },
  "behaviorPatterns": {
    "averageAccuracy": 85,
    "independenceImprovement": 15,
    "latencyTrend": "decreasing",
    "consistencyScore": 82
  },
  "consequenceEffectiveness": {
    "mostEffective": [
      {
        "type": "reinforcement",
        "reinforcer": "칭찬",
        "effectiveness": 90
      }
    ],
    "leastEffective": [
      {
        "type": "reinforcement",
        "reinforcer": "스티커만",
        "effectiveness": 50
      }
    ]
  },
  "recommendations": [
    "우수한 성과입니다! 난이도를 점진적으로 높여보세요.",
    "명확한 지시와 칭찬의 조합이 가장 효과적입니다."
  ],
  "totalRecords": 25,
  "lastUpdated": "2026-04-27T10:30:15.000Z"
}
```

---

### 3.2 패턴 목록 조회
**Endpoint**: `GET /patterns/list`

**Query Parameters**:
```
?childId=1 (선택사항)
&limit=50
&offset=0
```

**Response** (200 OK):
```json
{
  "total": 5,
  "limit": 50,
  "offset": 0,
  "data": [
    {
      "id": "pattern-abc-20260427-001",
      "childId": 1,
      "ltoId": "domain_mand_lto01",
      "averageAccuracy": 85,
      "totalRecords": 25,
      "lastUpdated": "2026-04-27T10:30:15.000Z"
    },
    ...
  ]
}
```

---

### 3.3 패턴 분석 강제 실행
**Endpoint**: `POST /patterns/analyze`

**Request Body**:
```json
{
  "childId": 1,
  "ltoId": "domain_mand_lto01",
  "period": "month"
}
```

**Response** (200 OK):
```json
{
  "id": "pattern-abc-20260427-001",
  "childId": 1,
  "ltoId": "domain_mand_lto01",
  ... 패턴 분석 결과
}
```

---

## 4. 기능 분석

### 4.1 기능 분석 조회
**Endpoint**: `GET /analysis/function/:patternId`

**Response** (200 OK):
```json
{
  "id": "func-analysis-20260427-001",
  "abcPatternId": "pattern-abc-20260427-001",
  "childId": 1,
  "maintainingConsequence": {
    "type": "attention",
    "description": "사회적 주의가 행동을 유지하는 주요 요소",
    "evidence": [
      "주의 받을 때 행동 빈도 증가",
      "무시할 때 행동 빈도 감소"
    ],
    "confidence": 85
  },
  "surrogate": {
    "behavior": "손 들기",
    "description": "주의 끌기 대신 손을 들어서 요청",
    "implementationNotes": "명확한 지시와 일관된 강화 필요"
  },
  "behaviorChain": {
    "antecedent": "기다려야 함",
    "behaviors": ["소리 지르기", "물건 던지기", "옷 잡아당기기"],
    "consequence": "주의 획득"
  },
  "seasonality": {
    "pattern": "오전 시간대 더 높은 정확도",
    "occurrenceRate": 85
  }
}
```

---

### 4.2 기능 분석 생성
**Endpoint**: `POST /analysis/function`

**Request Body**:
```json
{
  "patternId": "pattern-abc-20260427-001",
  "childId": 1,
  "maintainingConsequence": {
    "type": "access|escape|attention|sensory",
    "description": "설명",
    "evidence": ["증거1", "증거2"],
    "confidence": 85
  }
}
```

**Response** (201 Created):
```json
{
  "id": "func-analysis-20260427-001",
  ... 생성된 분석
}
```

---

## 5. 인사이트 및 권장사항

### 5.1 인사이트 조회
**Endpoint**: `GET /insights/:patternId`

**Response** (200 OK):
```json
{
  "patternId": "pattern-abc-20260427-001",
  "insights": [
    "우수한 숙달도! 다음 단계의 기술 학습을 고려해보세요.",
    "독립적 행동이 크게 향상되었습니다!",
    "반응 속도가 개선되고 있습니다."
  ],
  "recommendations": [
    "현재 강화 방식을 계속 유지하세요.",
    "난이도를 점진적으로 증가시켜보세요.",
    "환경 소음을 감소시키는 것을 고려하세요."
  ],
  "actionItems": [
    {
      "priority": "high",
      "action": "다음 단계 기술 도입",
      "timeline": "1주일 내"
    }
  ]
}
```

---

## 6. 대시보드 데이터

### 6.1 아동별 ABC 요약
**Endpoint**: `GET /dashboard/child/:childId`

**Response** (200 OK):
```json
{
  "childId": 1,
  "childName": "민준",
  "totalRecords": 150,
  "averageAccuracy": 82,
  "improvementRate": 12,
  "ltosWithData": [
    {
      "ltoId": "domain_mand_lto01",
      "ltoName": "만드기 - LTO 1",
      "accuracy": 85,
      "records": 25,
      "trend": "improving"
    }
  ],
  "recentRecords": [
    {
      "id": "abc-rec-20260427-001",
      "behavior": "앉기",
      "accuracy": 100,
      "date": "2026-04-27"
    }
  ]
}
```

---

### 6.2 전체 아동 ABC 통계
**Endpoint**: `GET /dashboard/overall`

**Response** (200 OK):
```json
{
  "totalRecords": 500,
  "averageAccuracy": 78,
  "childStats": [
    {
      "childId": 1,
      "childName": "민준",
      "records": 150,
      "accuracy": 82
    }
  ],
  "ltoStats": [
    {
      "ltoId": "domain_mand_lto01",
      "ltoName": "만드기 - LTO 1",
      "records": 200,
      "accuracy": 80
    }
  ],
  "accuracyDistribution": {
    "excellent": 45,  // 90-100%
    "good": 30,       // 70-89%
    "fair": 20,       // 50-69%
    "poor": 5         // 0-49%
  }
}
```

---

## 7. 오류 처리

### 7.1 표준 오류 응답
```json
{
  "error": "ERROR_CODE",
  "message": "사람이 읽을 수 있는 메시지",
  "details": {
    "field": "추가 정보"
  },
  "timestamp": "2026-04-27T10:30:15.000Z"
}
```

### 7.2 오류 코드
| 상태 | 코드 | 설명 |
|------|------|------|
| 400 | INVALID_INPUT | 입력값 검증 실패 |
| 400 | MISSING_REQUIRED | 필수 필드 누락 |
| 401 | UNAUTHORIZED | 인증 실패 |
| 403 | FORBIDDEN | 권한 부족 |
| 404 | NOT_FOUND | 리소스 없음 |
| 409 | CONFLICT | 중복 데이터 |
| 500 | INTERNAL_SERVER_ERROR | 서버 오류 |

---

## 8. 인증 및 권한

### 8.1 요청 헤더
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### 8.2 권한 체계
```
therapist: 자신의 아동 ABC 데이터 읽기/쓰기
parent: 자신의 아동 ABC 데이터 읽기만
admin: 모든 ABC 데이터 읽기/쓰기/삭제
```

---

## 9. 레이트 제한

```
일일 요청 한도:
- therapist: 1,000 요청/일
- parent: 100 요청/일
- admin: 10,000 요청/일

분당 요청 한도: 60 요청/분
```

**응답 헤더**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2026-04-28T00:00:00.000Z
```

---

## 10. 배치 작업 (선택사항)

### 10.1 여러 기록 생성
**Endpoint**: `POST /records/batch`

**Request Body**:
```json
{
  "records": [
    { ... 레코드 1 },
    { ... 레코드 2 },
    ...
  ]
}
```

**Response** (201 Created):
```json
{
  "created": 3,
  "failed": 0,
  "records": [
    { "id": "abc-rec-20260427-001", ... },
    ...
  ]
}
```

---

## 11. 웹훅 (선택사항)

### 11.1 패턴 업데이트 웹훅
```json
{
  "event": "pattern.updated",
  "data": {
    "patternId": "pattern-abc-20260427-001",
    "childId": 1,
    "accuracy": 85,
    "improvement": 12
  },
  "timestamp": "2026-04-27T10:30:15.000Z"
}
```

---

## 12. 마이그레이션 경로

### Frontend → Backend 전환
1. localStorage에서 IndexedDB로 마이그레이션
2. IndexedDB에서 API로 동기화 (동기화 큐)
3. API 우선 모드로 전환
4. 로컬 캐시는 읽기 캐시로만 사용

---

**API 버전**: 1.0  
**마지막 업데이트**: 2026-04-27  
**상태**: 초안 (구현 대기 중)
