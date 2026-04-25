# 양방향 백업/복원 가이드

**목표**: 집과 회사에서 같은 데이터로 작업 가능  
**방식**: 백업 파일(tar.gz)을 USB로 이동 → 복원  
**시간**: 약 5-10분

---

## 📋 개요

### 시나리오 1: 집에서 작업한 데이터 → 회사에서 복원

```
집 컴퓨터
├─ Kinder ABA 실행
├─ 데이터 입력 (아동 정보, 세션 기록 등)
└─ 22:00 자동 백업
   └─ kinder-backup-2026-04-26.tar.gz (50MB)

                ↓ USB에 복사

회사 컴퓨터
├─ USB에서 백업 파일 받기
└─ API 엔드포인트로 복원
   └─ 회사 DB = 집의 최신 데이터
```

### 시나리오 2: 회사 데이터 → 집에서 복원

```
회사 컴퓨터
├─ 오전 업무 (스케줄, 세션 기록)
└─ 수동 백업 트리거
   └─ kinder-backup-backup-2026-04-26.tar.gz

                ↓ USB에 복사

집 컴퓨터
├─ USB 삽입
└─ 복원 API 호출
   └─ 집 DB = 회사의 최신 데이터
```

---

## 🚀 빠른 시작 (5분)

### Step 1: 현재 컴퓨터에서 백업 생성

**방법 A: 자동 백업** (매일 자정)
```
결과: C:\kinder-backups\daily\kinder-backup-YYYY-MM-DD.tar.gz
```

**방법 B: 수동 백업** (지금 바로)
```bash
curl -X POST http://localhost:3000/api/admin/backup/trigger \
  -H "Authorization: Bearer YOUR_API_KEY"

결과: C:\kinder-backups\daily\kinder-backup-YYYY-MM-DD.tar.gz
```

### Step 2: 백업 파일을 USB에 복사

```
C:\kinder-backups\daily\kinder-backup-2026-04-26.tar.gz
              ↓ (복사)
E:\(USB)\kinder-backup-2026-04-26.tar.gz
```

**참고**: 가장 최신 파일 선택 (날짜 확인)

### Step 3: 다른 컴퓨터에서 복원

#### 방법 1: API로 직접 복원 (권장)

```bash
# 1. 백업 파일을 다른 컴퓨터의 임시 폴더에 복사
cp E:/backup/kinder-backup-2026-04-26.tar.gz C:/temp/

# 2. REST API로 복원 (curl 또는 Postman)
curl -X POST http://localhost:3000/api/sync/restore \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "backup=@C:/temp/kinder-backup-2026-04-26.tar.gz"

# 3. 응답 확인
{
  "status": "success",
  "message": "✅ 복원이 완료되었습니다",
  "duration": "12.34초",
  "stats": {
    "userCount": 2,
    "childCount": 12,
    "scheduleCount": 48,
    "sessionLogCount": 240
  }
}
```

#### 방법 2: 명령어로 복원 (고급)

```bash
# 1. 파일 압축 해제
tar -xzf kinder-backup-2026-04-26.tar.gz -C ./temp/

# 2. PostgreSQL에 복원
psql -h localhost -U kinder_user -d kinder_db \
  -f ./temp/kinder-dump-2026-04-26.sql
```

### Step 4: 확인

```bash
# 복원 상태 확인
curl http://localhost:3000/api/sync/status \
  -H "Authorization: Bearer YOUR_API_KEY"

# 응답 예시:
{
  "currentData": {
    "children": 12,
    "sessionLogs": 240,
    "schedules": 48
  },
  "lastRestore": {
    "date": "2026-04-26T10:15:00Z",
    "notes": "복원 원본: kinder-backup-2026-04-26.tar.gz"
  }
}
```

---

## 📊 정기 동기화 전략

### 패턴 A: 일일 자동 + 주간 USB 복사

```
집 컴퓨터:
└─ 매일 자정 자동 백업
   └─ C:\kinder-backups\daily\kinder-backup-YYYY-MM-DD.tar.gz

매주 월요일 오전:
└─ 최신 백업 파일 USB에 복사
   └─ E:\kinder-backups-archive\kinder-backup-YYYY-MM-DD.tar.gz

회사 컴퓨터:
└─ 월요일 오전 회사 도착 시
   └─ USB에서 파일 가져오기
   └─ API로 복원
```

**장점**: 자동화 + 간편  
**단점**: 주 1회만 동기화

### 패턴 B: 필요시 수동 백업 + 복원

```
집에서 중요한 작업 후:
├─ API /api/admin/backup/trigger 호출
├─ 생성된 파일 USB에 복사
└─ 회사에서 복원

회사에서 중요한 스케줄 작업 후:
├─ API /api/admin/backup/trigger 호출
├─ 생성된 파일 USB에 복사
└─ 집에서 복원
```

**장점**: 유연함, 원할 때마다 동기화  
**단점**: 수동 작업 필요

### 패턴 C: 자동 비교 + 조건부 복원

```
매주 월요일:
├─ API /api/sync/compare 호출
│  └─ 마지막 동기화 이후 변경사항 확인
├─ 변경사항이 많으면 → 복원 권장
└─ 변경사항이 적으면 → 복원 스킵
```

**장점**: 지능형, 불필요한 복원 방지  
**단점**: 약간의 기술 필요

---

## 🔄 복원 API 상세 사용법

### POST /api/sync/restore - 파일 업로드 및 복원

```bash
# cURL 예시
curl -X POST http://localhost:3000/api/sync/restore \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "backup=@/path/to/kinder-backup-2026-04-26.tar.gz"

# Python 예시
import requests

with open('kinder-backup-2026-04-26.tar.gz', 'rb') as f:
    files = {'backup': f}
    headers = {'Authorization': 'Bearer YOUR_API_KEY'}
    response = requests.post(
        'http://localhost:3000/api/sync/restore',
        files=files,
        headers=headers
    )
    print(response.json())

# PowerShell 예시
$file = 'C:\backup\kinder-backup-2026-04-26.tar.gz'
$uri = 'http://localhost:3000/api/sync/restore'
$headers = @{ Authorization = 'Bearer YOUR_API_KEY' }

$form = @{
    backup = Get-Item $file
}

Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Form $form
```

### GET /api/sync/status - 현재 상태 확인

```bash
curl http://localhost:3000/api/sync/status \
  -H "Authorization: Bearer YOUR_API_KEY"

# 응답:
{
  "status": "success",
  "timestamp": "2026-04-26T14:30:00Z",
  "currentData": {
    "users": 2,
    "children": 12,
    "schedules": 48,
    "sessionLogs": 240
  },
  "lastBackup": {
    "date": "2026-04-26T00:00:00Z",
    "filename": "kinder-backup-2026-04-26.tar.gz"
  },
  "lastRestore": {
    "date": "2026-04-26T10:15:00Z",
    "notes": "복원 원본: kinder-backup-2026-04-26.tar.gz"
  },
  "syncRecommendation": "✅ 동기화 상태 양호"
}
```

### POST /api/sync/compare - 변경사항 비교

```bash
curl -X POST http://localhost:3000/api/sync/compare \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "lastSyncDate": "2026-04-20T00:00:00Z"
  }'

# 응답:
{
  "status": "success",
  "lastSyncDate": "2026-04-20T00:00:00Z",
  "changesSinceSync": {
    "newChildren": 2,
    "updatedChildren": 5,
    "newSessionLogs": 15,
    "totalChanges": 22
  },
  "recommendation": "💾 백업을 추천합니다"
}
```

---

## 🛡️ 주의사항 & 안전장치

### ⚠️ 복원 시 기존 데이터 덮어씌워짐

```
복원 전:
회사 컴퓨터 DB
├─ Child A (생성: 2026-04-25)
├─ Child B (생성: 2026-04-25)
└─ Child C (생성: 2026-04-26) ← 이 데이터 사라짐

복원 후 (집 백업 적용):
회사 컴퓨터 DB
├─ Child A
└─ Child B
```

**해결책**:
1. 복원 전 수동 백업 자동 생성 (API에서 처리)
2. 정기적으로 USB에 전체 백업 아카이브 저장
3. 중요한 작업은 복원 전에 수동 기록

### ✅ 안전한 복원 절차

```
1. 현재 상태 기록
   curl http://localhost:3000/api/sync/status

2. 변경사항 확인
   curl -X POST http://localhost:3000/api/sync/compare

3. 필요시 추가 백업
   curl -X POST http://localhost:3000/api/admin/backup/trigger

4. 복원 실행
   curl -X POST http://localhost:3000/api/sync/restore \
     -F "backup=@kinder-backup-YYYY-MM-DD.tar.gz"

5. 복원 확인
   curl http://localhost:3000/api/sync/status

6. 브라우저에서 데이터 시각적 확인
   http://localhost:5173
```

---

## 💾 파일 관리

### 백업 파일 저장소

```
C:\kinder-backups\
├─ daily/
│  ├─ kinder-backup-2026-04-25.tar.gz (50MB)
│  ├─ kinder-backup-2026-04-26.tar.gz (50MB)
│  └─ ... (30일 자동 보관)
└─ archive/ (선택)
   ├─ kinder-backup-2026-04-01.tar.gz (월간 아카이브)
   └─ ...

USB:
E:\kinder-backups-weekly\
├─ kinder-backup-2026-04-21.tar.gz
├─ kinder-backup-2026-04-14.tar.gz
└─ ... (주간 사본)
```

### 정리 규칙

**로컬 daily 폴더**:
- 자동 삭제: 30일 이상 된 파일
- 저장 용량: ~1.5GB (30개 × 50MB)

**USB 보관**:
- 수동 정리: 3개월 이상 된 파일 삭제
- 저장 용량: 필요에 따라 (권장: 최소 500MB 여유)

---

## 🎯 체크리스트

### 주간 (매주 월요일)

- [ ] 집 컴퓨터 백업 확인
- [ ] 최신 백업 파일 USB에 복사
- [ ] 회사 컴퓨터에서 복원
- [ ] 데이터 시각적 확인
- [ ] 양쪽 모두 최신 데이터 보유 확인

### 월간 (1일)

- [ ] 백업 디렉토리 정리
- [ ] USB 아카이브 정리
- [ ] 외장 HDD에 전체 아카이브 저장 (선택)
- [ ] 복구 테스트 (오프라인 환경에서)

### 분기별 (3개월마다)

- [ ] 하드디스크 상태 확인
- [ ] USB 동작 확인
- [ ] 백업 파일 무작위 복구 테스트
- [ ] 데이터 무결성 검증

---

## 🆘 문제 해결

### "복원 실패: 백업 파일을 찾을 수 없습니다"

**원인**: 파일 경로 잘못 또는 파일 손상

**해결책**:
1. 파일이 실제로 존재하는지 확인
2. 파일 이름의 공백/특수문자 확인
3. USB 드라이브 인식 확인

### "복원 후 데이터가 안 보입니다"

**원인**: 브라우저 캐시

**해결책**:
1. Ctrl+Shift+R (강제 새로고침)
2. 개발자 도구 → 스토리지 → 전체 삭제
3. 브라우저 재시작

### "복원이 너무 오래 걸립니다" (5분 이상)

**원인**: 대용량 백업 또는 느린 저장소

**해결책**:
1. SSD 드라이브 사용 (USB 3.0 이상)
2. 불필요한 프로그램 종료
3. 바이러스 스캔 비활성화

---

## 📞 기술 지원

**백업 경로 확인**:
```bash
echo %BACKUP_DIR%  (Windows)
echo $BACKUP_DIR   (Mac/Linux)
```

**API 키 확인**:
```bash
# .env.local 파일에서 확인
ADMIN_API_KEY=your_secret_key_here
```

**로그 확인**:
```bash
tail -f /var/log/kinder-backup.log  (Linux/Mac)
Get-Content C:\kinder-backups\daily\backup.log  (Windows)
```

---

**마지막 업데이트**: 2026-04-26  
**다음 버전**: 자동 네트워크 동기화 (WiFi 기반)
