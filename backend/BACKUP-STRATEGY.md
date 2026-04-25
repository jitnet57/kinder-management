# 데이터 백업 전략 | 로컬 컴퓨터 자동 백업

**작성**: 2026-04-26  
**Status**: 구현 계획 수립  
**관련 ADR**: ADR-009  
**백업 위치**: 로컬 파일시스템 (관리자 컴퓨터)

---

## 1. 백업 목표

| 항목 | 목표 | 설명 |
|------|------|------|
| **RPO** (복구 시점 목표) | < 24시간 | 최대 1일 데이터 손실 허용 |
| **RTO** (복구 시간 목표) | < 1시간 | 복구까지 최대 1시간 |
| **보관 기간** | 30일 | 최근 30일 백업 보관 |
| **가용성** | 99.9% | 자동 백업 실패 시 알림 |
| **준법성** | GDPR + 한국 개인정보 | 암호화 + 접근 제어 |

---

## 2. 로컬 백업 전략

### 계층 1: PostgreSQL 전체 덤프 (매일 자동)
**담당**: Hono 백엔드 cron 작업  
**빈도**: 매일 자정 (UTC+9)  
**저장소**: 로컬 파일시스템 (관리자 컴퓨터)  
**보관**: 30일 (자동 삭제)  

```
장점:
✅ 클라우드 비용 0원
✅ 데이터 주권 유지 (로컬 보관)
✅ 빠른 복구 (로컬 접근)
✅ 오프라인 백업 가능

백업 위치:
Windows: C:\kinder-backups\daily\
macOS:   ~/kinder-backups/daily/
Linux:   /var/kinder-backups/daily/
```  

**구현:**
```bash
#!/bin/bash
# backup.sh - PostgreSQL 덤프 (로컬 저장)

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="${BACKUP_BASE_DIR}/daily"  # C:\kinder-backups\daily 등
BACKUP_FILE="kinder-backup-${DATE}.tar.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# 1. 백업 디렉토리 생성
mkdir -p "${BACKUP_DIR}"

# 2. PostgreSQL 덤프
pg_dump \
  --host=$DB_HOST \
  --username=$DB_USER \
  --password=$DB_PASSWORD \
  --format=plain \
  --file="/tmp/kinder-${DATE}.sql" \
  kinder_db

# 3. 메타데이터 추가 (백업 정보)
cat > "/tmp/kinder-${DATE}.meta.json" << EOF
{
  "backup_date": "$(date -Iseconds)",
  "database": "kinder_db",
  "size_bytes": $(stat -f%z "/tmp/kinder-${DATE}.sql" 2>/dev/null || stat -c%s "/tmp/kinder-${DATE}.sql"),
  "type": "postgresql_dump",
  "retention_days": 30,
  "backed_up_by": "kinder-backend"
}
EOF

# 4. tar 압축
tar -czf "${BACKUP_PATH}" \
  -C /tmp \
  "kinder-${DATE}.sql" \
  "kinder-${DATE}.meta.json"

# 5. 임시 파일 삭제
rm "/tmp/kinder-${DATE}.sql" \
   "/tmp/kinder-${DATE}.meta.json"

# 6. 결과 로깅
echo "Backup completed: ${BACKUP_PATH} ($(ls -lh "${BACKUP_PATH}" | awk '{print $5}'))" >> "${BACKUP_DIR}/backup.log"

# 7. 30일 이상 된 백업 자동 삭제
find "${BACKUP_DIR}" -name "kinder-backup-*.tar.gz" -mtime +30 -exec rm {} \;
```

**Hono에서 구현:**
```typescript
// src/jobs/backup.ts
import cron from 'node-cron';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 백업 디렉토리 (환경 변수에서 읽기)
const BACKUP_DIR = process.env.BACKUP_DIR || 
  (process.platform === 'win32' 
    ? 'C:\\kinder-backups\\daily' 
    : '/var/kinder-backups/daily');

// 매일 자정(UTC+9) 실행
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('🔄 데이터 백업 시작...');
    
    // 1. 백업 디렉토리 생성
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    // 2. PostgreSQL 덤프 실행
    const backup = await executeLocalBackup();
    
    // 3. 백업 기록 저장
    await prisma.backupLog.create({
      data: {
        backupDate: new Date(),
        filename: backup.filename,
        sizeBytes: backup.sizeBytes,
        localPath: backup.filepath,  // 로컬 경로 저장
        status: 'SUCCESS',
        notes: null,
      },
    });
    
    // 4. 성공 알림
    await sendBackupNotification(
      'success',
      `✅ 백업 완료: ${backup.filename}\\n저장 위치: ${backup.filepath}`
    );
    
    console.log('✅ 백업 성공:', backup.filepath);
  } catch (error) {
    console.error('❌ 백업 실패:', error);
    
    // 실패 알림
    await sendBackupNotification(
      'error',
      `❌ 백업 실패: ${error.message}`
    );
    
    // 백업 기록에 실패 로깅
    await prisma.backupLog.create({
      data: {
        backupDate: new Date(),
        filename: 'FAILED',
        status: 'FAILED',
        notes: error.message,
      },
    });
  }
});
```

---

### 계층 2: JSON 스냅샷 (선택적, 수동)
**담당**: Hono 백엔드  
**형식**: JSON (모든 테이블)  
**저장소**: 로컬 파일시스템  

**용도**: 가벼운 백업, 데이터 검사, 테스트 데이터 복제

```typescript
// src/jobs/snapshot.ts
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const SNAPSHOT_DIR = process.env.BACKUP_DIR || 'C:\\kinder-backups\\snapshots';

// 수동으로 호출 가능한 함수
export async function createSnapshot() {
  try {
    console.log('📸 JSON 스냅샷 생성...');
    
    // 디렉토리 생성
    await fs.mkdir(SNAPSHOT_DIR, { recursive: true });
    
    // 모든 테이블 데이터 추출
    const snapshot = {
      timestamp: new Date().toISOString(),
      users: await prisma.user.findMany(),
      children: await prisma.child.findMany(),
      schedules: await prisma.schedule.findMany(),
      curriculum: await prisma.curriculum.findMany(),
      sessionLogs: await prisma.sessionLog.findMany(),
      completionLogs: await prisma.completionLog.findMany(),
    };
    
    // JSON 파일로 저장
    const filename = `snapshot-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(SNAPSHOT_DIR, filename);
    const jsonContent = JSON.stringify(snapshot, null, 2);
    
    await fs.writeFile(filepath, jsonContent, 'utf-8');
    
    console.log('✅ 스냅샷 생성 완료:', filepath);
    return { filename, filepath };
  } catch (error) {
    console.error('❌ 스냅샷 실패:', error);
    throw error;
  }
}
```

---

## 3. 백업 저장소 전략

| 저장소 | 비용 | 복구 속도 | 보안 | 용도 |
|--------|------|----------|------|------|
| **로컬 파일시스템** ⭐ | 무료 | 가장 빠름 | 중 | 일일 덤프 (30일) |
| **로컬 JSON 스냅샷** | 무료 | 빠름 | 중 | 가벼운 백업 (수동) |

**저장 위치 (OS별):**
```
Windows: C:\kinder-backups\daily\         ← 일일 백업
         C:\kinder-backups\snapshots\     ← JSON 스냅샷

macOS:   ~/kinder-backups/daily/
         ~/kinder-backups/snapshots/

Linux:   /var/kinder-backups/daily/
         /var/kinder-backups/snapshots/
```

**선택사항 (추가 보안):**
- USB 드라이브에 주간 수동 복사
- 외장 HDD에 월간 아카이브
- 네트워크 드라이브 (NAS) 동기화

---

## 4. 데이터베이스 스키마 | 백업 추적

```prisma
// prisma/schema.prisma

model BackupLog {
  id            Int       @id @default(autoincrement())
  backupDate    DateTime  @default(now())
  filename      String    // "kinder-backup-2026-04-26.tar.gz"
  sizeBytes     BigInt?   // 백업 파일 크기
  s3Url         String?   // S3 저장 위치
  status        String    @default("SUCCESS") // SUCCESS, FAILED
  notes         String?   // 에러 메시지 등
  createdAt     DateTime  @default(now())

  @@index([backupDate])
  @@index([status])
}

model RestoreLog {
  id            Int       @id @default(autoincrement())
  backupId      Int       // 복구 대상 BackupLog ID
  restoreDate   DateTime  @default(now())
  status        String    // SUCCESS, IN_PROGRESS, FAILED
  durationMs    Int?      // 복구 소요 시간 (ms)
  notes         String?
  restoredBy    String?   // 관리자 이름
  createdAt     DateTime  @default(now())

  @@index([backupId])
  @@index([restoreDate])
}
```

---

## 5. 복구 절차 (RTO: < 1시간)

### 5.1 상황별 복구 전략

#### 경우 1: 최근 데이터 손실 (< 24시간)
```
1단계: Supabase PITR 사용 (가장 빠름)
  → Supabase Dashboard → Backups → Point-in-Time Restore
  → 손실 시간 이전 시점 선택
  → 복구 시간: 5-10분

2단계: 실패 시 S3 덤프 사용
  → S3에서 최신 백업 다운로드
  → pg_restore 실행
  → 복구 시간: 15-30분
```

#### 경우 2: 데이터 손상 / 버그로 인한 손실
```
1단계: 스냅샷 검토 (JSON 형식)
  → Supabase Storage에서 이전 주 스냅샷 다운로드
  → 손상된 레코드 식별

2단계: 부분 복구
  → 문제된 테이블만 복구
  → 영향 범위 최소화
  → Prisma seed.ts 스크립트 사용
```

#### 경우 3: 전체 시스템 장애
```
1단계: S3 덤프 복구
  → 다운로드: kinder-backup-YYYY-MM-DD.tar.gz
  → 압축 해제: tar -xzf kinder-backup-YYYY-MM-DD.tar.gz
  → 로컬 복원: pg_restore --create kinder-YYYY-MM-DD.dump

2단계: Supabase 재연결
  → 새 PostgreSQL 인스턴스 생성
  → 복구된 데이터 import
  → 애플리케이션 재시작

복구 시간: 30-60분
```

---

## 6. 모니터링 & 알림

### 6.1 백업 상태 대시보드 (관리자용)

```
GET /api/admin/backups
응답:
{
  "lastBackup": {
    "date": "2026-04-26T00:00:00Z",
    "status": "SUCCESS",
    "filename": "kinder-backup-2026-04-26.tar.gz",
    "sizeBytes": 52428800
  },
  "backupHistory": [
    { "date": "2026-04-25", "status": "SUCCESS", ... },
    { "date": "2026-04-24", "status": "SUCCESS", ... },
    { "date": "2026-04-23", "status": "FAILED", "notes": "..." }
  ],
  "storageUsed": {
    "s3Bytes": 1572864000,  // 30일 데이터
    "supabaseStorageBytes": 104857600,
    "totalGbUsed": 1.6
  },
  "nextBackup": "2026-04-27T00:00:00Z"
}
```

### 6.2 알림 (SES / SendGrid)

**성공 알림:**
```
제목: ✅ Kinder ABA 백업 완료 (2026-04-26)
본문:
- 백업 파일: kinder-backup-2026-04-26.tar.gz
- 크기: 50MB
- 완료 시간: 2026-04-26 00:15:00
- 다음 백업: 2026-04-27 00:00:00
```

**실패 알림 (즉시 발송):**
```
제목: ⚠️ Kinder ABA 백업 실패 (2026-04-26)
본문:
- 에러: "S3 업로드 시간 초과"
- 재시도: 1시간 뒤 자동 재시도
- 문의: admin@kinder.local
```

---

## 7. 구현 체크리스트

### Phase 4 Backend Stories에 추가

```markdown
### Story: 백업 자동화 구현 (8 points)

Acceptance Criteria:
- [ ] BackupLog, RestoreLog 테이블 Prisma 스키마 추가
- [ ] Hono에서 cron 기반 백업 작업 구현
- [ ] PostgreSQL pg_dump 스크립트 작성
- [ ] AWS S3 업로드 통합 (또는 Supabase Storage)
- [ ] 백업 실패 시 이메일 알림 구현
- [ ] 관리자 대시보드 API (GET /api/admin/backups)
- [ ] 복구 테스트 (월 1회, 문서화)
- [ ] 복구 절차 문서화

정의된 완료:
- 모든 테스트 통과
- 복구 프로세스 검증
- 운영 문서 작성
- 보안 감시 (HIPAA, 데이터 접근 로깅)
```

---

## 8. 비용 추정

| 항목 | 월 비용 | 설명 |
|------|--------|------|
| **로컬 저장소** | 무료 | 컴퓨터 디스크 사용 |
| **백업 스토리지** | 무료 | 30일 보관 (자동 삭제) |
| **이메일 알림** (선택) | ~$1 | 월 60회 발송 (Gmail 무료 또는 SendGrid) |
| **─────** | | |
| **합계** | **무료~$1/월** | 매우 경제적 |

**저장소 요구사항:**
- 일일 백업: ~50MB (PostgreSQL 덤프 + 압축)
- 30일 보관: ~1.5GB
- JSON 스냅샷: ~20MB (선택)
- **총 필요 공간**: 약 2GB

**추가 보안 (선택사항):**
- USB 드라이브 (주간 복사): $10-20
- 외장 HDD (월간 아카이브): $50-100 (일회)
- NAS 장치 (지속적 동기화): $100-300 (일회)

---

## 9. 보안 고려사항

### 9.1 접근 제어

```typescript
// 관리자만 백업 조회 가능
async function getBackupList(req, res) {
  const user = req.user;
  
  // RBAC 확인
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const backups = await prisma.backupLog.findMany({
    orderBy: { backupDate: 'desc' },
    take: 30,
  });
  
  res.json(backups);
}
```

### 9.2 암호화

```typescript
// S3 업로드 시 암호화
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});

await s3.putObject({
  Bucket: 'kinder-backups',
  Key: `daily/${filename}`,
  Body: fileContent,
  ServerSideEncryption: 'AES256',  // ✅ 서버 측 암호화
  ACL: 'private',  // ✅ 공개 불가
}).promise();
```

### 9.3 감사 로깅

```typescript
// 모든 복구 작업 기록
await prisma.auditLog.create({
  data: {
    userId: adminUser.id,
    action: 'RESTORE_BACKUP',
    entity: 'database',
    entityId: backupId,
    changes: JSON.stringify({
      backupFile: filename,
      timestamp: new Date(),
      targetEnv: 'production',
    }),
    ipAddress: req.ip,
  },
});
```

---

## 10. 테스트 계획

### 월 1회 복구 테스트 (의무)

```
Schedule: 매월 첫째 주 월요일 오후 2시 (정기 유지보수)

절차:
1. 개발 환경 백업 다운로드
2. 로컬 PostgreSQL에 복구
3. 데이터 무결성 확인 (체크섬)
4. 복구 시간 기록
5. 테스트 결과 리포트

테스트 성공 기준:
✅ 복구 시간 < 30분
✅ 데이터 손실 0건
✅ 모든 테이블 일관성 확인
✅ 외래키 관계 무결함
```

---

## 요약

| 항목 | 구현 |
|------|------|
| **자동화** | ✅ 매일 자정 자동 실행 |
| **보관 기간** | ✅ 30일 |
| **복구 속도** | ✅ 5-60분 (상황별) |
| **비용** | ✅ 월 $20 (경제적) |
| **보안** | ✅ AES 암호화 + RBAC |
| **모니터링** | ✅ 이메일 알림 + 대시보드 |

**Next Step:** Phase 4에서 구현 → 월 1회 복구 테스트 → 운영 자동화
