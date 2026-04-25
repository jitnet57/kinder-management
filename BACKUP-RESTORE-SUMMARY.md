# 백업/복원/동기화 전체 구현 요약

**작성**: 2026-04-26  
**상태**: 구현 준비 완료 (Phase 4)  
**목표**: 집과 회사에서 같은 데이터로 작업 가능

---

## 🎯 핵심 기능

### 1️⃣ 자동 백업 (매일)
```
매일 자정 → PostgreSQL 덤프 → tar.gz 압축 → 로컬 저장
C:\kinder-backups\daily\kinder-backup-YYYY-MM-DD.tar.gz
```
✅ 인터넷 불필요  
✅ 무료 (클라우드 비용 0)  
✅ 빠른 복구 (로컬 접근)

### 2️⃣ 수동 백업 (필요할 때)
```
API: POST /api/admin/backup/trigger
→ 즉시 백업 파일 생성
```
✅ 언제든지 트리거 가능  
✅ USB로 쉽게 이동 가능  
✅ 한 번의 클릭으로 완료

### 3️⃣ 양방향 복원 (USB 통해)
```
집 컴퓨터 백업 → USB → 회사 컴퓨터 복원
또는
회사 컴퓨터 백업 → USB → 집 컴퓨터 복원
```
✅ 5분 안에 완료  
✅ 안전 장치 포함 (복원 전 자동 백업)  
✅ 검증 + 통계 표시

---

## 📁 파일 구조

```
backend/
├─ src/
│  ├─ jobs/
│  │  ├─ backup.ts          ← 백업 작업 (자동, 매일 자정)
│  │  └─ restore.ts         ← 복원 작업 (수동, API 호출)
│  └─ routes/
│     ├─ admin-backup.ts    ← 관리자 백업 API
│     │  ├─ GET /api/admin/backup/status    (상태 조회)
│     │  ├─ GET /api/admin/backup/history   (이력 조회)
│     │  ├─ POST /api/admin/backup/trigger  (수동 백업)
│     │  └─ POST /api/admin/backup/restore  (복원 - 테스트용)
│     └─ data-sync.ts       ← 양방향 동기화 API
│        ├─ POST /api/sync/restore   (파일 업로드 + 복원) ⭐ 핵심
│        ├─ POST /api/sync/export    (JSON 내보내기)
│        ├─ GET /api/sync/status     (현재 상태)
│        └─ POST /api/sync/compare   (변경사항 비교)
│
├─ BACKUP-STRATEGY.md       ← 백업 전략 (로컬 저장)
├─ OFFLINE-MODE.md          ← 오프라인 운영 가이드
├─ SCHEMA-UPDATES.md        ← 데이터베이스 스키마 변경
└─ README.md                ← 구현 가이드

docs/
├─ code-convention.yaml     (이미 작성됨)
└─ adr.yaml                 (ADR-009 추가됨)

SYNC-GUIDE.md               ← 사용자 가이드 (집↔회사 동기화)
```

---

## 🚀 사용자 워크플로우

### 상황 1: 집에서 작업한 데이터 → 회사에서 사용

```
집 컴퓨터 (22:00)
  ├─ 자동 백업 생성
  │  └─ C:\kinder-backups\daily\kinder-backup-2026-04-26.tar.gz
  └─ USB에 복사

회사 컴퓨터 (다음날 09:00)
  ├─ USB 삽입
  ├─ API 호출: POST /api/sync/restore
  │  └─ -F "backup=@kinder-backup-2026-04-26.tar.gz"
  └─ 응답: ✅ 복원 완료 (12.34초)
     └─ 회사 DB = 집의 최신 데이터
```

### 상황 2: 회사에서 중요 스케줄 입력 → 집에서 동기화

```
회사 컴퓨터 (17:00)
  ├─ API 호출: POST /api/admin/backup/trigger
  │  └─ 즉시 백업 생성
  ├─ 생성된 파일: kinder-backup-2026-04-26.tar.gz
  └─ USB에 복사

집 컴퓨터 (저녁)
  ├─ USB 삽입
  ├─ API 호출: POST /api/sync/restore
  └─ ✅ 회사 데이터 즉시 동기화
```

### 상황 3: 백업 상태 확인

```
CLI:
curl http://localhost:3000/api/sync/status \
  -H "Authorization: Bearer YOUR_API_KEY"

응답:
{
  "currentData": {
    "children": 12,
    "sessionLogs": 240
  },
  "lastBackup": "2026-04-26T00:00:00Z",
  "lastRestore": "2026-04-26T10:15:00Z",
  "syncRecommendation": "✅ 동기화 상태 양호"
}
```

---

## 📊 기술 스택

| 항목 | 상세 |
|------|------|
| **백업 형식** | PostgreSQL 덤프 + tar.gz 압축 |
| **저장소** | 로컬 파일시스템 (인터넷 불필요) |
| **복원 방식** | REST API (multipart/form-data) |
| **동기화** | USB 드라이브 (또는 네트워크 공유) |
| **압축률** | ~50MB/일 (tar.gz) |
| **복구 시간** | 5-15분 (로컬 저장) |
| **보안** | 파일 시스템 권한 + API 토큰 |

---

## ✅ 구현 체크리스트 (Phase 4)

### Week 1: 백업/복원 코어

- [ ] `backup.ts` 구현 (로컬 저장)
  - [ ] PostgreSQL pg_dump
  - [ ] tar.gz 압축
  - [ ] 파일 시스템 저장
  - [ ] 오래된 파일 자동 정리 (30일)

- [ ] `restore.ts` 구현
  - [ ] tar.gz 압축 해제
  - [ ] PostgreSQL 복원
  - [ ] 데이터 검증
  - [ ] 에러 처리

- [ ] Prisma 스키마 업데이트
  - [ ] BackupLog.localPath 추가
  - [ ] RestoreLog 테이블 생성
  - [ ] SyncHistory 테이블 생성
  - [ ] 마이그레이션 생성

### Week 2: API 엔드포인트

- [ ] `admin-backup.ts` 기존 API
  - [ ] GET /api/admin/backup/status
  - [ ] GET /api/admin/backup/history
  - [ ] POST /api/admin/backup/trigger

- [ ] `data-sync.ts` 새 API
  - [ ] **POST /api/sync/restore** (핵심)
  - [ ] GET /api/sync/status
  - [ ] POST /api/sync/compare
  - [ ] POST /api/sync/export (JSON)

### Week 3: 테스트 + 문서

- [ ] 로컬 백업/복원 테스트
  - [ ] 수동 백업 생성
  - [ ] USB에 복사
  - [ ] 다른 컴퓨터에서 복원
  - [ ] 데이터 검증

- [ ] API 테스트
  - [ ] Postman/cURL로 복원 테스트
  - [ ] 대용량 백업 테스트 (여러 아동, 100+ 세션)
  - [ ] 네트워크 에러 처리

- [ ] 문서 작성
  - [ ] SYNC-GUIDE.md (이미 작성됨)
  - [ ] API 문서
  - [ ] 운영 매뉴얼

### Week 4: 배포 + 운영

- [ ] 프로덕션 배포
  - [ ] .env.local 설정 (BACKUP_DIR)
  - [ ] 폴더 권한 설정
  - [ ] 첫 백업 실행

- [ ] 사용자 교육
  - [ ] 관리자 기술 이전
  - [ ] USB 동기화 절차 설명
  - [ ] 트러블슈팅 가이드

- [ ] 모니터링
  - [ ] 백업 로그 모니터링
  - [ ] 복원 실패 알림
  - [ ] 디스크 용량 모니터링

---

## 💰 비용 분석

| 항목 | 기존 | 변경됨 | 절감 |
|------|-----|--------|------|
| **월 클라우드 비용** | $21 | 무료 | $21 |
| **연간 절감** | - | - | $252 |
| **초기 투자** | - | USB/HDD | $20-100 |
| **ROI** | - | - | 1-3개월 |

---

## 🛡️ 보안 고려사항

### 접근 제어

```typescript
// API 인증 (Bearer Token)
Authorization: Bearer YOUR_ADMIN_API_KEY

// 데이터베이스 권한
- 관리자만 백업/복원 가능
- 모든 작업 감시 로깅
```

### 파일 보안

```
C:\kinder-backups\
├─ 폴더 권한: 관리자만 접근
├─ 파일 암호화: 선택사항 (OS 수준)
└─ USB: 비밀번호 보호 권장
```

### 데이터 무결성

```
복원 전:
├─ 자동 백업 생성 (현재 DB 보호)
├─ 검증 모드로 먼저 확인 가능
└─ 최종 확인 후 복원

복원 후:
├─ 데이터 검증 (테이블 확인)
├─ 로그 기록 (누가, 언제, 뭘 복원했는지)
└─ 이메일 알림 (관리자)
```

---

## 🔄 정기 유지보수 계획

### 일일

```
자동 실행 (매일 자정):
├─ PostgreSQL 덤프
├─ tar.gz 압축
├─ 로컬 저장
├─ 오래된 파일 정리 (30일)
└─ 성공/실패 이메일 알림
```

### 주간

```
모든 월요일 오전:
├─ 최신 백업 USB에 복사
├─ API /api/sync/status 확인
├─ 회사 ↔ 집 동기화
└─ 데이터 시각적 검증
```

### 월간

```
매월 1일:
├─ 백업 폴더 정리
├─ USB/HDD 아카이브 정리
├─ 외장 HDD 전체 백업 (선택)
└─ 복구 테스트 (검증)
```

### 분기별

```
3개월마다:
├─ 하드디스크 상태 검사
├─ USB 동작 확인
├─ 오프라인 환경에서 복구 테스트
└─ 데이터 무결성 검증
```

---

## 🎓 사용자 교육

### 관리자용 (1시간)

```
1. 백업 자동화 이해 (10분)
   - 매일 자정에 자동 백업
   - 로컬 저장 (C:\kinder-backups\)

2. USB 동기화 절차 (30분)
   - 최신 백업 파일 복사
   - API로 복원하기 (curl 또는 UI)
   - 복원 결과 확인

3. 트러블슈팅 (20분)
   - 백업 파일 찾기
   - API 호출 방법
   - 에러 메시지 해석
```

### 임상가용 (선택사항)

```
"매주 월요일 오전에 데이터가 동기화됩니다"
└─ 기술 세부사항은 알 필요 없음
└─ 집과 회사의 데이터가 같음을 확인하기만 하면 됨
```

---

## 📞 FAQ

### Q: USB 없이 네트워크로 동기화 가능한가?

**A**: 네, 향후 버전에서 WiFi 기반 자동 동기화 추가 예정
```
현재: 수동 (USB)
향후: 자동 (같은 WiFi 네트워크)
```

### Q: 복원 후 회사 데이터를 어떻게 보호하는가?

**A**: 복원 전 자동 백업 생성
```
1. 복원 요청
2. 현재 DB → 자동 백업 생성
3. 이전 백업 파일로 복원
→ 손실된 데이터는 자동 백업에서 복구 가능
```

### Q: 백업 파일이 손상되면?

**A**: 30일 동안 이전 백업들 보관
```
C:\kinder-backups\daily\
├─ kinder-backup-2026-04-26.tar.gz (손상)
├─ kinder-backup-2026-04-25.tar.gz (이것으로 복원)
└─ kinder-backup-2026-04-24.tar.gz (대체)
```

### Q: 얼마나 자주 동기화해야 하나?

**A**: 업무 패턴에 따라
```
매주 1회: 기본 (월요일 오전)
매일: 중요한 데이터 매일 입력
수동: 긴급 상황 (대량 입력 후)
```

---

## 📝 다음 단계

### Phase 4 구현 (4-5주)

1. **Week 1-2**: 백업/복원 코드 작성
2. **Week 2-3**: API 엔드포인트 개발
3. **Week 3**: 통합 테스트
4. **Week 4**: 배포 + 운영 시작

### Phase 5 (향후)

- [ ] WiFi 기반 자동 동기화
- [ ] 모바일 앱 백업
- [ ] 클라우드 백업 선택 옵션 (선택사항)
- [ ] 스케줄 백업 (사용자 지정)

---

## 📊 요구사항 충족 검증

| 원래 요구사항 | 구현 | 상태 |
|-------------|------|------|
| ✅ 스케줄 관리 | 그대로 유지 | ✅ |
| ✅ 아동 정보 | 그대로 유지 | ✅ |
| ✅ 데이터 기록 | 그대로 유지 | ✅ |
| ✅ 완료 목록 | 그대로 유지 | ✅ |
| ✅ 커리큘럼 | 그대로 유지 | ✅ |
| ✅ 자동 백업 | **로컬 매일** | ✅ NEW |
| ✅ 양방향 복원 | **USB 통해** | ✅ NEW |
| ✅ 오프라인 | **완전 지원** | ✅ NEW |

---

**상태**: 구현 준비 완료  
**목표**: Phase 4에서 완전 구현  
**예상 완료**: 2026-05-24

마지막 버전: 1.0  
마지막 업데이트: 2026-04-26
