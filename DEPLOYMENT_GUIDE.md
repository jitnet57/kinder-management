# 🚀 AKMS 배포 가이드

> **Vercel + Railway 배포 설정, 환경변수, CI/CD, 모니터링, 트러블슈팅**

---

## 📋 목차

1. [배포 아키텍처](#배포-아키텍처)
2. [프론트엔드 배포 (Vercel)](#프론트엔드-배포-vercel)
3. [백엔드 배포 (Railway)](#백엔드-배포-railway)
4. [환경변수 설정](#환경변수-설정)
5. [CI/CD 파이프라인](#cicd-파이프라인)
6. [데이터베이스 배포](#데이터베이스-배포)
7. [모니터링 & 로깅](#모니터링--로깅)
8. [성능 최적화](#성능-최적화)
9. [보안 설정](#보안-설정)
10. [트러블슈팅](#트러블슈팅)

---

## 배포 아키텍처

```
┌──────────────────────────────────────────────────────────────┐
│                     사용자                                    │
├──────────────────────────────────────────────────────────────┤
│                          ↓                                    │
│        ┌─────────────────────────────────┐                  │
│        │    Vercel (프론트엔드)           │ https://akms.vercel.app
│        │  ├─ React SPA                   │                  │
│        │  ├─ CDN (Edge)                  │                  │
│        │  └─ Auto Scaling                │                  │
│        └─────────────────────────────────┘                  │
│                          ↓ API 호출                         │
│        ┌─────────────────────────────────┐                  │
│        │   Railway (백엔드 API)          │ https://api.akms.railway.app
│        │  ├─ Node.js + Hono              │                  │
│        │  ├─ Docker 컨테이너             │                  │
│        │  └─ Auto Scaling                │                  │
│        └─────────────────────────────────┘                  │
│                          ↓                                    │
│        ┌─────────────────────────────────┐                  │
│        │    PostgreSQL 데이터베이스       │ Supabase/Railway
│        │  ├─ 백업 (일일)                 │                  │
│        │  ├─ 복제 (지역 이중화)          │                  │
│        │  └─ 모니터링                    │                  │
│        └─────────────────────────────────┘                  │
│                          ↓                                  │
│        ┌─────────────────────────────────┐                  │
│        │    Redis (캐시/세션)            │ Railway            │
│        │  ├─ 세션 저장소                 │                  │
│        │  ├─ API 응답 캐시               │                  │
│        │  └─ Rate limiting               │                  │
│        └─────────────────────────────────┘                  │
│                          ↓                                    │
│        ┌─────────────────────────────────┐                  │
│        │    S3 호환 스토리지 (R2)         │ Cloudflare R2     │
│        │  ├─ 아동 사진                   │                  │
│        │  ├─ 문서/파일                   │                  │
│        │  └─ CDN 캐싱                    │                  │
│        └─────────────────────────────────┘                  │
│                          ↓                                    │
│        ┌─────────────────────────────────┐                  │
│        │    모니터링 & 로깅               │                  │
│        │  ├─ Sentry (에러)               │                  │
│        │  ├─ Vercel Analytics            │                  │
│        │  └─ CloudFlare Analytics        │                  │
│        └─────────────────────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 프론트엔드 배포 (Vercel)

### 1️⃣ Vercel 프로젝트 생성

```bash
# Vercel CLI 설치
npm i -g vercel

# Vercel에 로그인
vercel login
# → 브라우저에서 계정 선택

# 프로젝트 연결
cd frontend
vercel --prod
# → 프로젝트명: kinder-management
# → Framework: Vite
# → 빌드 명령: npm run build
# → 출력 디렉토리: dist
```

### 2️⃣ 환경변수 설정 (Vercel Dashboard)

```
Vercel Dashboard → Settings → Environment Variables

추가할 변수:
┌────────────────────────────────────────┐
│ VITE_API_URL                           │
│ https://api.akms.railway.app           │
│ (모든 환경: Production, Preview, Dev)  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ VITE_APP_NAME                          │
│ AKMS                                   │
│ (모든 환경)                            │
└────────────────────────────────────────┘
```

### 3️⃣ 자동 배포 설정 (GitHub)

```
Vercel Dashboard → Deployments → Git Integration

자동 배포 규칙:
├─ Production: main 브랜치 푸시 시 자동 배포
├─ Preview: PR 생성 시 미리보기 배포
└─ Development: 수동 배포 (vercel --prod)
```

### 4️⃣ 배포 확인

```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build
npm run preview

# 또는 Vercel에서 직접 확인
# https://kinder-management.vercel.app
```

### 5️⃣ 도메인 설정 (선택사항)

```
Vercel Dashboard → Settings → Domains

커스텀 도메인 추가:
├─ akms.example.com (구매한 도메인)
├─ DNS 레코드 추가 (자동 또는 수동)
└─ SSL 인증서 자동 발급
```

---

## 백엔드 배포 (Railway)

### 1️⃣ Railway 프로젝트 생성

```bash
# Railway CLI 설치
npm i -g @railway/cli

# Railway에 로그인
railway login
# → 브라우저에서 계정 선택

# 프로젝트 초기화
cd backend
railway init
# → 프로젝트명 선택: kinder-management

# 서비스 추가
railway service add
# → Dockerfile로부터 생성 (또는 기존 템플릿)
```

### 2️⃣ Dockerfile 생성

**파일**: `/backend/Dockerfile`

```dockerfile
# 빌드 단계
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# 실행 단계
FROM node:18-alpine

WORKDIR /app

# 의존성 설치 (프로덕션만)
COPY package*.json ./
RUN npm ci --only=production

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist

# 포트 노출
EXPOSE 3001

# 서버 시작
CMD ["node", "dist/index.js"]
```

### 3️⃣ Railway 환경변수 설정

```
Railway Dashboard → Environment Variables

추가할 변수:
┌─────────────────────────────────────┐
│ DATABASE_URL                        │
│ postgresql://user:pass@host/dbname  │
│ (Railway PostgreSQL 플러그인에서)   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ JWT_SECRET                          │
│ your-secret-key-min-32-chars        │
│ (강력한 무작위 문자열)              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ NODE_ENV                            │
│ production                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ CORS_ORIGIN                         │
│ https://kinder-management.vercel.app│
│ (프론트엔드 URL)                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ API_PORT                            │
│ 3001                                │
└─────────────────────────────────────┘
```

### 4️⃣ 데이터베이스 초기화

```bash
# Railway에서 PostgreSQL 추가
Railway Dashboard → [+ 추가] → PostgreSQL

# 로컬에서 마이그레이션 실행
DATABASE_URL="postgresql://..." npm run prisma:migrate

# 또는 Railway CLI로 원격 실행
railway run npm run prisma:migrate
```

### 5️⃣ 배포 실행

```bash
# Railway에 배포
railway up

# 배포 상태 확인
railway status

# 로그 확인
railway logs

# 배포된 서비스 URL
# https://api.akms.railway.app
```

---

## 환경변수 설정

### 개발 환경 (`.env.local`)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/akms_dev

# JWT
JWT_SECRET=dev-secret-key-change-in-production

# Server
NODE_ENV=development
API_PORT=3001
LOG_LEVEL=debug

# Frontend
VITE_API_URL=http://localhost:3001
VITE_DEBUG=true

# CORS
CORS_ORIGIN=http://localhost:3000

# 선택사항
REDIS_URL=redis://localhost:6379
S3_ENDPOINT=http://localhost:9000
```

### 스테이징 환경

```bash
DATABASE_URL=postgresql://staging-user:pass@staging-db.railway.app/staging
JWT_SECRET=staging-secret-key-min-32-chars
NODE_ENV=staging
API_PORT=3001
LOG_LEVEL=info
VITE_API_URL=https://api-staging.akms.railway.app
CORS_ORIGIN=https://staging.akms.vercel.app
```

### 프로덕션 환경

```bash
DATABASE_URL=postgresql://prod-user:pass@prod-db.railway.app/production
JWT_SECRET=production-secret-key-min-32-chars-very-secure
NODE_ENV=production
API_PORT=3001
LOG_LEVEL=warn
VITE_API_URL=https://api.akms.railway.app
CORS_ORIGIN=https://kinder-management.vercel.app

# 모니터링
SENTRY_DSN=https://key@sentry.io/projectid
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=v1.0.0

# CDN & 스토리지
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=akms-prod
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
```

### 환경변수 보안 규칙

```
❌ Git에 커밋하면 안됨:
   - JWT_SECRET
   - DATABASE_PASSWORD
   - API_KEYS
   - AWS 자격증명

✅ 안전한 관리:
   1. .env.local: .gitignore에 추가
   2. .env.example: 더미 값으로 예시만 제공
   3. CI/CD: Vercel/Railway 대시보드에서 관리
   4. 로컬: 팀원에게 개별 공유
```

**파일**: `.env.example`

```bash
# 예시 (실제 값 없음)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=change-me
VITE_API_URL=http://localhost:3001
```

---

## CI/CD 파이프라인

### GitHub Actions 설정

**파일**: `/.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # 린팅
      - run: npm run lint
      
      # 빌드
      - run: npm run build
      
      # 테스트
      - run: npm run test -- --coverage
      
      # 타입 체크
      - run: npm run type-check
  
  deploy-frontend:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - run: npm i -g vercel
      
      - run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  
  deploy-backend:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - run: npm i -g @railway/cli
      
      - run: railway up --detach
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### 배포 프로세스

```
Developer Push
    ↓
GitHub Webhook
    ↓
[린팅] → [빌드] → [테스트] → [타입 체크]
    ↓
테스트 통과?
├─ No: 배포 중단, Slack 알림
└─ Yes:
    ├─ [Vercel] 프론트엔드 배포
    └─ [Railway] 백엔드 배포
    ↓
배포 완료
    └─ Slack 알림: "배포 완료! https://..."
```

---

## 데이터베이스 배포

### PostgreSQL 초기화

#### Option 1: Railway PostgreSQL 플러그인 (권장)

```
Railway Dashboard → [+ 추가] → PostgreSQL

자동으로:
├─ 데이터베이스 생성
├─ 사용자 계정 생성
├─ 연결 문자열 제공
└─ 백업 설정
```

#### Option 2: Supabase (대안)

```
Supabase Dashboard → Create Project

설정:
├─ 프로젝트명: kinder-management
├─ Region: Asia-Pacific (도쿄 또는 싱가포르)
├─ 비밀번호: 강력한 비밀번호
└─ 생성

DATABASE_URL을 환경변수에 추가
```

### 마이그레이션 실행

```bash
# 프로덕션 마이그레이션
DATABASE_URL="production-url" npm run prisma:migrate -- --name initial

# 샘플 데이터 추가 (선택)
DATABASE_URL="production-url" npm run prisma:seed

# 스키마 확인
DATABASE_URL="production-url" npm run prisma:studio
```

### 백업 전략

```
자동 백업:
├─ Railway: 일일 자동 백업 (7일 보관)
├─ Supabase: 일일 자동 백업 (무제한)
└─ 수동 백업: 배포 전 전체 백업

백업 복구:
1. Railway/Supabase 대시보드에서 백업 선택
2. "복구" 버튼 클릭
3. 확인 (기존 데이터 덮어쓰기)
4. 마이그레이션 재실행 (필요시)
```

---

## 모니터링 & 로깅

### 1️⃣ Sentry (에러 추적)

```bash
# 1. Sentry 계정 생성
# https://sentry.io

# 2. 프로젝트 생성 (Node.js)

# 3. 백엔드에 통합
npm install @sentry/node @sentry/tracing

# 4. 초기화 (src/index.ts)
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  tracesSampleRate: 0.1,
});

// 에러 처리 미들웨어
app.onError((err, c) => {
  Sentry.captureException(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

# 5. 환경변수 설정
SENTRY_DSN=https://key@sentry.io/projectid
SENTRY_ENVIRONMENT=production
```

### 2️⃣ Vercel Analytics

```
Vercel Dashboard → Analytics

자동으로 수집:
├─ 페이지 로드 시간
├─ TTFB (첫 바이트까지의 시간)
├─ CLS (누적 레이아웃 변경)
├─ 사용자 수
└─ 지역별 분석
```

### 3️⃣ CloudFlare Analytics (CDN)

```
CloudFlare Dashboard → Analytics

모니터링 항목:
├─ 캐시 히트율
├─ 요청 수
├─ 대역폭 사용량
├─ 보안 위협 감지
└─ 지역별 트래픽
```

### 4️⃣ 애플리케이션 로깅

```typescript
// 구조화된 로깅
const logger = {
  info: (msg: string, data?: any) => {
    console.log(JSON.stringify({ level: 'info', msg, data, timestamp: new Date() }));
  },
  error: (msg: string, error: Error) => {
    console.error(JSON.stringify({ 
      level: 'error', 
      msg, 
      error: error.message, 
      stack: error.stack,
      timestamp: new Date() 
    }));
  }
};

// 사용
logger.info('사용자 로그인', { userId: 123 });
logger.error('DB 연결 실패', error);
```

---

## 성능 최적화

### 1️⃣ 프론트엔드 최적화

```javascript
// Vercel 설정 (vercel.json)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=60, stale-while-revalidate=120" }
      ]
    }
  ],
  
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

**최적화 항목**:
- ✅ 이미지 최적화 (WebP, Responsive)
- ✅ 코드 스플리팅 (Route-based)
- ✅ 번들 크기 축소 (Tree shaking)
- ✅ 캐싱 전략 (Long-term caching)

### 2️⃣ 백엔드 최적화

```typescript
// 캐싱 미들웨어
app.use(async (c, next) => {
  const cacheKey = c.req.url;
  
  // Redis 캐시 확인
  const cached = await redis.get(cacheKey);
  if (cached) {
    return c.json(JSON.parse(cached));
  }
  
  await next();
  
  // 응답 캐싱 (GET만)
  if (c.req.method === 'GET') {
    await redis.setex(cacheKey, 300, JSON.stringify(c.res.body));
  }
});

// 데이터베이스 쿼리 최적화
// ✅ Index 활용
// ✅ N+1 쿼리 방지 (JOIN 사용)
// ✅ 페이지네이션 (LIMIT OFFSET)

// 요청 압축
app.use(compress());
```

### 3️⃣ 데이터베이스 최적화

```sql
-- 인덱스 추가
CREATE INDEX idx_children_therapist ON children(therapist_id);
CREATE INDEX idx_session_logs_child_date ON session_logs(child_id, log_date);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- 쿼리 분석
EXPLAIN ANALYZE
SELECT * FROM session_logs
WHERE child_id = 1 AND log_date > NOW() - INTERVAL '7 days';
```

---

## 보안 설정

### 1️⃣ HTTPS & TLS

```
자동 설정:
├─ Vercel: 기본 제공 (*.vercel.app)
├─ Railway: 기본 제공 (*.railway.app)
└─ 커스텀 도메인: Let's Encrypt (자동)
```

### 2️⃣ CORS 설정

```typescript
// 백엔드 (src/index.ts)
import { cors } from 'hono/cors';

app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
    credentials: true
  })
);
```

### 3️⃣ 환경변수 암호화

```bash
# 기본: 클라우드 제공자 암호화 자동 사용
# Vercel: 내장 암호화
# Railway: 내장 암호화

# 추가 보안: 환경변수 로컬 암호화
npm install dotenv-vault
dotenv-vault new
dotenv-vault keys
```

### 4️⃣ API 인증

```typescript
// JWT 검증 미들웨어
const auth = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET!);
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

app.get('/api/protected', auth, (c) => {
  const user = c.get('user');
  return c.json({ user });
});
```

### 5️⃣ Rate Limiting

```typescript
import { rateLimit } from 'hono-rate-limiter';

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100, // 100요청
    skip: (c) => c.req.path.startsWith('/health') // 헬스 체크 제외
  })
);
```

---

## 트러블슈팅

### 🔴 배포 실패

**증상**: "Build failed" 에러

```
진단:
1. 빌드 로그 확인
   └─ Vercel/Railway 대시보드 → Deployments → 로그 보기

2. 로컬에서 재현
   └─ npm run build (동일한 환경에서)

3. 의존성 확인
   └─ npm install (package-lock.json 삭제하고 재설치)

해결:
Step 1: 로컬에서 빌드 성공 확인
Step 2: 환경변수 확인 (빌드 시 필요한 변수)
Step 3: Git push (다시 배포)
Step 4: 여전히 실패 시 배포 로그와 함께 문의
```

### 🟠 환경변수 에러

**증상**: "DATABASE_URL is not defined"

```
진단:
1. 환경변수 설정 확인
   └─ Vercel/Railway 대시보드 → Environment Variables

2. 변수명 정확성 확인
   └─ 공백, 대소문자 확인

3. 배포 후 적용 확인
   └─ 변수 추가 후 재배포 필요

해결:
Step 1: Vercel/Railway 대시보드에서 변수 추가
Step 2: "Save" 또는 확인 버튼 클릭
Step 3: 프로젝트 다시 배포 (수동 또는 git push)
Step 4: 배포 로그에서 변수 확인
```

### 🟡 데이터베이스 연결 오류

**증상**: "Cannot connect to database" at startup

```
진단:
1. 연결 문자열 확인
   └─ DATABASE_URL 형식: postgresql://user:password@host:port/database

2. 방화벽/네트워크 확인
   └─ Railway IP 화이트리스트 추가 (필요시)

3. 데이터베이스 상태 확인
   └─ Railway/Supabase 대시보드 → Database → Status

해결:
Step 1: DATABASE_URL 재복사 (특수문자 확인)
Step 2: 로컬에서 연결 테스트
   └─ psql "postgresql://..." -c "SELECT 1;"
Step 3: 백엔드 로그 확인
   └─ railway logs
Step 4: 데이터베이스 재시작 (극단적 경우)
```

### 🟢 성능 저하

**증상**: "응답이 느려요" (> 3초)

```
진단:
1. 성능 메트릭 확인
   └─ Vercel Analytics / CloudFlare Analytics

2. 어느 부분이 느린지 확인
   ├─ FCP (First Contentful Paint): < 1.8s
   ├─ LCP (Largest Contentful Paint): < 2.5s
   └─ TTFB (Time to First Byte): < 600ms

해결:
Step 1: 캐싱 개선
   └─ Redis 활용, HTTP 캐싱 헤더 설정

Step 2: 데이터베이스 최적화
   └─ 느린 쿼리 로그 확인, Index 추가

Step 3: 번들 크기 감소
   └─ npm run build -- --analyze

Step 4: CDN 설정
   └─ CloudFlare 통합 (이미 Vercel에서 사용 중)
```

### 실패한 배포 롤백

```bash
# Vercel 롤백
vercel rollback
# → 이전 성공한 배포로 복원

# Railway 롤백
railway rollback
# 또는 대시보드에서 이전 릴리스 선택

# 수동 롤백 (극단적)
git log --oneline | head -10
git revert <commit-hash>
git push origin main
# → CI/CD가 이전 버전 배포
```

---

## 배포 체크리스트

배포 전 확인 사항:

- [ ] 모든 테스트 통과 (`npm run test`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] 타입 에러 없음 (`npm run type-check`)
- [ ] 린팅 통과 (`npm run lint`)
- [ ] 환경변수 설정 완료 (Vercel/Railway)
- [ ] 데이터베이스 마이그레이션 실행
- [ ] API 엔드포인트 테스트 (Postman)
- [ ] 프론트엔드 기본 기능 테스트
- [ ] 역할별 접근 제어 테스트 (Admin/Therapist/Parent)
- [ ] 모바일 반응형 확인
- [ ] 브라우저 호환성 확인
- [ ] 에러 추적 설정 (Sentry)
- [ ] 모니터링 활성화 (Analytics)
- [ ] 백업 확인
- [ ] 롤백 계획 수립

---

**마지막 업데이트**: 2026-04-27  
**문서 버전**: 2.0 (Phase 5 P3)

더 자세한 정보:
- 📖 [README.md](README.md) — 프로젝트 개요
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) — 시스템 구조
- 💻 [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) — 개발자 가이드
- 👥 [USER_GUIDE.md](USER_GUIDE.md) — 사용자 가이드
- 📚 [API_REFERENCE.md](API_REFERENCE.md) — API 명세
