# 🚀 Cloudflare Pages 배포 가이드

**프로젝트**: ABA 아동관리 시스템 웹앱  
**배포 도메인**: `aba-child.pages.dev`  
**상태**: 배포 준비 완료

---

## 📋 배포 전 체크리스트

### 1. Cloudflare 계정 설정

- [ ] Cloudflare 계정 생성 ([https://dash.cloudflare.com](https://dash.cloudflare.com))
- [ ] GitHub 연결 (Cloudflare → GitHub OAuth)
- [ ] API Token 발급
  - Security → API Tokens → Create Token
  - 권한: `Account.Cloudflare Pages – Edit`
- [ ] Account ID 확인
  - Overview → 우측 "Account ID" 영역

### 2. GitHub Secrets 설정

`Settings → Secrets and variables → Actions`에 다음 추가:

```
CLOUDFLARE_API_TOKEN = "YOUR_API_TOKEN"
CLOUDFLARE_ACCOUNT_ID = "YOUR_ACCOUNT_ID"
```

### 3. 환경 변수 설정

**Cloudflare Pages UI**에서 설정 또는 `wrangler.toml`에 추가:

| 변수 | 값 (Production) | 설명 |
|------|-----------------|------|
| `API_URL` | `https://api.aba-child.pages.dev` | 백엔드 API 엔드포인트 |
| `ENVIRONMENT` | `production` | 환경 구분 |
| `BACKUP_ENCRYPTION` | `true` | AES-256-GCM 암호화 활성화 |

---

## 📱 배포 방법

### 방법 A: 자동 배포 (GitHub Actions) - 추천

1. **설정 확인**
   ```bash
   git add .github/workflows/deploy.yml wrangler.toml
   git commit -m "feat: add Cloudflare Pages deployment configuration"
   git push origin main
   ```

2. **자동 배포 시작**
   - GitHub Actions 자동 실행 (push 시 자동 트리거)
   - Progress 확인: GitHub → Actions 탭

3. **배포 확인**
   ```
   https://aba-child.pages.dev
   ```

### 방법 B: 수동 배포 (Wrangler CLI)

1. **Wrangler 설치**
   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. **Cloudflare 로그인**
   ```bash
   wrangler login
   ```

3. **프론트엔드 빌드**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

4. **배포 실행**
   ```bash
   wrangler pages deploy frontend/dist --project-name aba-child
   ```

5. **배포 확인**
   ```
   https://aba-child.pages.dev
   ```

---

## 🔧 배포 후 설정

### 1. 사용자 정의 도메인 (선택사항)

현재: `aba-child.pages.dev`  
사용자정의: `aba.example.com` (DNS CNAME 필요)

**Cloudflare UI**에서:
- Pages → aba-child → Custom Domains → Add custom domain
- 도메인 공급자에서 CNAME 레코드 설정

### 2. 보안 설정

**Cloudflare Pages 설정**:
- [ ] SSL/TLS: Full (Strict) 설정
- [ ] Security → Firewall Rules
  - Bot Management 활성화
  - DDoS Protection: 활성화
- [ ] WAF (Web Application Firewall)
  - OWASP CRS 규칙 활성화

### 3. 성능 최적화

**Caching Rules**:
```
Path: /api/*
Cache Level: Cache Everything
TTL: 5 minutes
```

```
Path: /static/*
Cache Level: Cache Everything
TTL: 30 days
```

```
Path: /
Cache Level: Cache Everything
TTL: 5 minutes
```

### 4. 모니터링 설정

**Analytics 탭에서**:
- [ ] Page Views 모니터링
- [ ] Error Rate 추적
- [ ] Response Time 확인

**로그**:
```bash
wrangler pages deployment tail --project-name aba-child
```

---

## 🛠️ 백엔드 배포

### 옵션 1: Cloudflare Workers (추천)

백엔드를 Cloudflare Workers로 마이그레이션:

1. **Worker 설정**
   ```bash
   wrangler generate aba-child-api
   cd aba-child-api
   ```

2. **Express 서버 → Worker로 변환**
   - 현재: Node.js/Express (backend/src)
   - 필요: Hono 또는 Cloudflare Worker API

3. **배포**
   ```bash
   wrangler deploy
   ```

### 옵션 2: 외부 Node.js 호스팅

- Heroku, Railway, Render, DigitalOcean
- API URL: `https://api.aba-child.herokuapp.com` 등으로 `wrangler.toml`에 설정

### 옵션 3: Cloudflare Pages 함수 (2024 기능)

Pages 함수를 `/functions` 디렉토리에 작성:

```typescript
// frontend/functions/api/reports.ts
export async function onRequest(context) {
  if (context.request.method === 'POST') {
    return new Response('{"data": []}', {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

**권장**: 초기는 외부 Node.js 호스팅 → 시간 경과 시 Workers로 마이그레이션

---

## 📊 배포 상태 확인

### 실시간 모니터링

```bash
# 최근 배포 목록
wrangler pages deployments list --project-name aba-child

# 특정 배포 상태
wrangler pages deployments info <deployment-id> --project-name aba-child

# 스트리밍 로그
wrangler pages deployment tail --project-name aba-child
```

### 성능 지표

**Cloudflare Analytics**:
- Page Views
- Requests
- Error Rate (5xx)
- Cache Hit Rate
- Response Time

---

## 🔐 보안 설정

### 환경 변수 암호화

모든 민감한 정보는 Cloudflare 환경 변수로 설정:

```toml
# ❌ wrangler.toml에 직접 입력 금지
[env.production.vars]
BACKUP_PASSWORD = "secret"  # 위험!

# ✅ Cloudflare UI에서 설정
Settings → Environment Variables
BACKUP_PASSWORD = [Cloudflare에서 입력]
```

### 승인된 IP 화이트리스트 (선택사항)

```
Access → Applications → New Application
자신의 IP 주소만 허용
```

---

## 🚨 문제 해결

### 배포 실패

**증상**: GitHub Actions 실패

**해결**:
1. GitHub Actions 로그 확인
2. `npm install` 실패 → node_modules 캐시 삭제
3. `npm run build` 실패 → 로컬에서 빌드 테스트

### 흰 화면 (Blank Page)

**증상**: aba-child.pages.dev 접속 시 빈 페이지

**원인**: React Router 설정 문제

**해결**:
```javascript
// frontend/src/main.tsx - SPA 라우팅 처리
createBrowserRouter([
  {
    path: "*",
    element: <App />
  }
]);
```

### API 호출 실패

**증상**: `/api/reports/quick` 404 에러

**원인**: CORS, API 엔드포인트 불일치

**해결**:
```javascript
// frontend/.env.production
VITE_API_URL=https://api.aba-child.pages.dev
```

### 느린 로딩

**원인**: 대용량 번들, 캐시 미설정

**해결**:
```bash
# 1. 번들 크기 분석
npm run build -- --stats

# 2. Code splitting 확인
vite build --debug:build-tree
```

---

## 📝 배포 체크리스트

### 배포 전 (Pre-deployment)

- [ ] 모든 feature 브랜치 main에 merge
- [ ] `npm run build` 로컬 성공 확인
- [ ] 모든 환경 변수 Cloudflare에 설정
- [ ] GitHub Secrets 설정 완료
- [ ] 최신 `.env.example` 문서화

### 배포 중 (Deployment)

- [ ] GitHub Actions 통과
- [ ] Cloudflare Pages 배포 성공
- [ ] 도메인 접속 가능 확인

### 배포 후 (Post-deployment)

- [ ] 프로덕션 데이터 백업
- [ ] 기본 기능 수동 테스트
  - [ ] 로그인
  - [ ] 스케줄 조회
  - [ ] 아동정보 조회
  - [ ] 세션 기록 입력
  - [ ] 백업/복원 테스트
- [ ] 성능 모니터링 (로딩 시간 < 3s)
- [ ] 에러 로그 확인
- [ ] 사용자 알림 (배포 완료)

---

## 🔄 버전 관리

### 배포 태그

```bash
# v1.0.0 배포
git tag -a v1.0.0 -m "Phase 4 완료 - 보안, 백업, 보고서 기능"
git push origin v1.0.0

# 태그 목록
git tag -l
```

### 롤백 절차

```bash
# 이전 버전으로 되돌리기
wrangler pages deployment rollback <previous-deployment-id> --project-name aba-child

# 또는 Git에서 이전 커밋으로 푸시
git revert <commit-hash>
git push origin main
```

---

## 📞 배포 후 지원

### 모니터링

- Cloudflare Analytics 대시보드
- GitHub Actions 로그
- 사용자 피드백 수집

### 업데이트

```bash
# 새 기능 추가 후 배포
git add .
git commit -m "feat: description"
git push origin main
# → 자동 배포 시작
```

### 긴급 패치

```bash
# 버그 수정
git add .
git commit -m "fix: critical bug"
git push origin main
# → 즉시 배포
```

---

## 📊 배포 성공 지표

| 지표 | 목표 | 확인 방법 |
|------|------|---------|
| **응답 시간** | < 2s | Cloudflare Analytics |
| **가용성** | > 99.5% | Uptime monitoring |
| **캐시 히트율** | > 80% | Cloudflare Analytics |
| **에러율** | < 0.1% | 로그 모니터링 |
| **번들 크기** | < 500KB | `npm run build` 분석 |

---

## 🎯 다음 단계 (Phase 5)

- [ ] API 백엔드 마이그레이션 (Workers 또는 외부 호스팅)
- [ ] WiFi 자동 동기화 구현
- [ ] 모바일 앱 개발 (React Native)
- [ ] AI 기반 분석 기능
- [ ] 3계층 백업 이중화

---

**마지막 업데이트**: 2026-04-26  
**상태**: 배포 준비 완료 ✅  
**다음 검토**: 배포 후 1주일
