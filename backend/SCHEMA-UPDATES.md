# Prisma 스키마 업데이트
## 백업/복원 기능 추가

**적용 시기**: Phase 4 구현  
**관련 파일**: `prisma/schema.prisma`

---

## 추가될 테이블

### 1. BackupLog (기존 수정)

```prisma
model BackupLog {
  id            Int       @id @default(autoincrement())
  backupDate    DateTime  @default(now())
  filename      String    // "kinder-backup-2026-04-26.tar.gz"
  sizeBytes     BigInt?   
  localPath     String?   // ✅ NEW: 로컬 파일 경로 추가
                          // "C:\kinder-backups\daily\..."
  s3Url         String?   // (deprecated - 로컬만 사용)
  status        String    @default("SUCCESS") // SUCCESS, FAILED
  notes         String?   
  createdAt     DateTime  @default(now())

  @@index([backupDate])
  @@index([status])
}
```

### 2. RestoreLog (기존 수정)

```prisma
model RestoreLog {
  id            Int       @id @default(autoincrement())
  backupId      Int?      // 복원 원본 백업 ID (NULL 가능)
  restoreDate   DateTime  @default(now())
  status        String    // SUCCESS, FAILED, IN_PROGRESS
  durationMs    Int?      // 복원 소요 시간 (밀리초)
  notes         String?   // 복원 파일명, 에러 메시지 등
  restoredBy    String?   // "api-restore", "admin-manual" 등
  createdAt     DateTime  @default(now())

  @@index([restoreDate])
  @@index([status])
}
```

### 3. SyncHistory (신규)

```prisma
model SyncHistory {
  id            Int       @id @default(autoincrement())
  syncDate      DateTime  @default(now())
  sourceSystem  String    // "home", "office", "other"
  direction     String    // "backup-to-usb", "restore-from-usb"
  filename      String    // 사용된 백업 파일
  recordsCount  Int?      // 동기화된 레코드 수
  status        String    @default("SUCCESS") // SUCCESS, FAILED
  notes         String?   
  createdAt     DateTime  @default(now())

  @@index([syncDate])
  @@index([sourceSystem])
}
```

---

## 마이그레이션 명령

```bash
# 1. 스키마 변경 사항 작성
npx prisma migrate dev --name add-backup-restore-fields

# 2. 프로덕션에 적용
npx prisma migrate deploy
```

---

## SQL 마이그레이션 (수동 생성 시)

```sql
-- 기존 BackupLog 테이블에 로컬 경로 추가
ALTER TABLE "BackupLog"
ADD COLUMN "localPath" TEXT;

-- 기존 RestoreLog 테이블 확인/생성
CREATE TABLE IF NOT EXISTS "RestoreLog" (
  "id" SERIAL PRIMARY KEY,
  "backupId" INTEGER,
  "restoreDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'SUCCESS',
  "durationMs" INTEGER,
  "notes" TEXT,
  "restoredBy" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 신규 SyncHistory 테이블 생성
CREATE TABLE IF NOT EXISTS "SyncHistory" (
  "id" SERIAL PRIMARY KEY,
  "syncDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sourceSystem" TEXT NOT NULL,
  "direction" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "recordsCount" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'SUCCESS',
  "notes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 추가
CREATE INDEX "RestoreLog_restoreDate_idx" ON "RestoreLog"("restoreDate");
CREATE INDEX "RestoreLog_status_idx" ON "RestoreLog"("status");
CREATE INDEX "SyncHistory_syncDate_idx" ON "SyncHistory"("syncDate");
CREATE INDEX "SyncHistory_sourceSystem_idx" ON "SyncHistory"("sourceSystem");
```

---

## 기존 데이터 마이그레이션

```typescript
// scripts/migrate-backup-logs.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 기존 BackupLog에 localPath 채우기
  const backups = await prisma.backupLog.findMany();
  
  for (const backup of backups) {
    // S3 URL이 있으면 로컬 경로로 변환
    if (backup.s3Url) {
      const filename = backup.filename;
      const localPath = `C:\\kinder-backups\\daily\\${filename}`; // Windows 예시
      
      await prisma.backupLog.update({
        where: { id: backup.id },
        data: { localPath },
      });
    }
  }
  
  console.log('✅ 마이그레이션 완료');
}

main();
```

실행:
```bash
npx ts-node scripts/migrate-backup-logs.ts
```

---

## 주요 변경사항

| 필드 | 추가/수정 | 설명 |
|------|---------|------|
| `BackupLog.localPath` | ✅ NEW | 로컬 백업 파일 경로 |
| `BackupLog.s3Url` | 🗑️ deprecated | S3 업로드 제거 (로컬만 사용) |
| `RestoreLog` | ✅ NEW | 복원 이력 추적 |
| `SyncHistory` | ✅ NEW | 양방향 동기화 이력 |

---

## 쿼리 예시

### 최근 백업 조회 (로컬)

```typescript
const lastBackup = await prisma.backupLog.findFirst({
  where: { status: 'SUCCESS' },
  orderBy: { backupDate: 'desc' },
});

console.log(`최근 백업: ${lastBackup.filename}`);
console.log(`저장 위치: ${lastBackup.localPath}`);
```

### 복원 이력 조회

```typescript
const restores = await prisma.restoreLog.findMany({
  where: { status: 'SUCCESS' },
  orderBy: { restoreDate: 'desc' },
  take: 10,
});

restores.forEach(r => {
  console.log(`${r.restoreDate}: ${r.notes} (${r.durationMs}ms)`);
});
```

### 동기화 상태 확인

```typescript
const lastSync = await prisma.syncHistory.findFirst({
  orderBy: { syncDate: 'desc' },
});

console.log(`마지막 동기화: ${lastSync.syncDate}`);
console.log(`동기화 대상: ${lastSync.sourceSystem}`);
console.log(`방향: ${lastSync.direction}`);
```

---

## 백업 정책 (자동)

```typescript
// 스키마에 추가되는 생명주기 규칙

// 1. BackupLog 자동 정리 (30일 이상 된 로그)
// - 로그는 유지하되, 실제 파일은 OS에서 정리

// 2. RestoreLog 완구
// - 모든 복원 기록 영구 보관 (감시 목적)

// 3. SyncHistory 축적
// - 동기화 이력 기록 (향후 자동 동기화 기능에 활용)
```

---

## 테스트 데이터 추가 (seed.ts)

```typescript
// prisma/seed.ts
async function seedBackupData() {
  // 과거 백업 레코드 추가
  await prisma.backupLog.createMany({
    data: [
      {
        backupDate: new Date('2026-04-25'),
        filename: 'kinder-backup-2026-04-25.tar.gz',
        sizeBytes: 52428800,
        localPath: 'C:\\kinder-backups\\daily\\kinder-backup-2026-04-25.tar.gz',
        status: 'SUCCESS',
      },
      {
        backupDate: new Date('2026-04-26'),
        filename: 'kinder-backup-2026-04-26.tar.gz',
        sizeBytes: 52428800,
        localPath: 'C:\\kinder-backups\\daily\\kinder-backup-2026-04-26.tar.gz',
        status: 'SUCCESS',
      },
    ],
  });

  // 복원 이력 추가
  await prisma.restoreLog.create({
    data: {
      backupId: 1,
      restoreDate: new Date('2026-04-26T10:00:00Z'),
      status: 'SUCCESS',
      durationMs: 12340,
      notes: '집에서 회사로 복원',
      restoredBy: 'api-restore',
    },
  });
}
```

실행:
```bash
npx prisma db seed
```

---

## 주의사항

1. **마이그레이션 순서**
   - 개발 환경: 자동 마이그레이션
   - 프로덕션: 수동 검증 후 `prisma migrate deploy`

2. **로컬 경로 형식**
   ```
   Windows: C:\kinder-backups\daily\kinder-backup-YYYY-MM-DD.tar.gz
   macOS:   /Users/username/kinder-backups/daily/...
   Linux:   /var/kinder-backups/daily/...
   ```

3. **S3Url 필드 처리**
   - 기존 코드와 호환 유지
   - 새 백업은 localPath만 채움
   - 마이그레이션: S3 URL → localPath 변환

---

## 롤백 계획

```bash
# 마이그레이션 되돌리기 (필요시)
npx prisma migrate resolve --rolled-back "migration-name"
```

---

**다음 단계**: Phase 4 구현 시 이 스키마 업데이트 적용 → 백업/복원 기능 활성화
