# 🚀 배포 가이드 (Deployment Guide)

**프로젝트**: ABA 아동관리 시스템 웹앱  
**배포 플랫폼**: Cloudflare Pages  
**프로덕션 URL**: `https://aba-child.pages.dev`  
**상태**: 배포 준비 완료 ✅

---

## 📚 목차

1. [빠른 시작](#빠른-시작)
2. [배포 단계별 설명](#배포-단계별-설명)
3. [자동 배포 (GitHub Actions)](#자동-배포-github-actions)
4. [수동 배포](#수동-배포)
5. [배포 후 검증](#배포-후-검증)
6. [문제 해결](#문제-해결)
7. [롤백 절차](#롤백-절차)

---

## 🏃 빠른 시작

### 1단계: 초기 설정 (한 번만)

```bash
# 1.1 GitHub 리포지토리 설정
git add .github/workflows/deploy.yml
git commit -m "ci: add Cloudflare Pages deployment workflow"
git push origin main

# 1.2 Cloudflare 계정 설정
# 1) https://dash.cloudflare.com 로그인
# 2) Pages 생성: New project → Connect to Git
# 3) Repository 선택: kinder-management
# 4) Build settings:
#    - Framework: None
#    - Build command: npm run build --prefix frontend
#    - Build output directory: frontend/dist

# 1.3 GitHub Secrets 설정
# Settings → Secrets and variables → Actions
# CLOUDFLARE_API_TOKEN=<your-token>
# CLOUDFLARE_ACCOUNT_ID=<your-account-id>
```

### 2단계: 배포 (매번)

```bash
# 자동 배포 (권장)
git add .
git commit -m "feat: new feature description"
git push origin main
# → 자동으로 배포 시작 (GitHub Actions)

# 또는 수동 배포
./deploy.sh production
```

### 3단계: 확인

```bash
# 브라우저에서 확인
https://aba-child.pages.dev

# 또는 CLI에서
curl https://aba-child.pages.dev/
```

---

## 📋 배포 단계별 설명

### 단계 1: 코드 준비

```bash
# 최신 코드 가져오기
git pull origin main

# 로컬에서 빌드 테스트
cd frontend && npm install && npm run build && cd ..

# 빌드 결과 확인
ls -la frontend/dist/index.html
```

### 단계 2: 환경 변수 설정

**Cloudflare Pages UI**에서 설정:
```
Settings → Environment Variables

PRODUCTION 환경:
- API_URL: https://api.aba-child.pages.dev
- ENVIRONMENT: production
- BACKUP_ENCRYPTION: true
```

### 단계 3: 배포 실행

```bash
# 방법 1: GitHub Actions (자동)
git push origin main
# GitHub Actions 탭에서 진행 상황 확인

# 방법 2: Wrangler CLI (수동)
wrangler pages deploy frontend/dist --project-name aba-child

# 방법 3: 배포 스크립트 (편의)
./deploy.sh production
```

### 단계 4: 배포 후 검증

```bash
# 웹사이트 접속 가능 확인
curl -I https://aba-child.pages.dev/

# 콘솔 로그 확인
wrangler pages deployment tail --project-name aba-child
```

---

## 🤖 자동 배포 (GitHub Actions)

### 설정 완료 후 동작

```
main 브랜치에 push
    ↓
GitHub Actions 자동 실행
    ↓
1. Node.js 환경 설정
2. 의존성 설치
3. 프론트엔드 빌드
4. Cloudflare Pages 배포
    ↓
배포 완료 (약 3-5분)
```

### 배포 진행 상황 확인

```bash
# GitHub UI
GitHub → Actions 탭 → 최근 워크플로우 클릭

# CLI
gh action-run list

# 로그 확인
gh run view <run-id> --log
```

### CI/CD 파일 위치

- 워크플로우: `.github/workflows/deploy.yml`
- 설정: `wrangler.toml`
- 패키지: `frontend/package.json`, `backend/package.json`

---

## 🔧 수동 배포

### 필수 도구 설치

```bash
# Node.js (v18+)
node --version

# npm
npm --version

# Wrangler CLI
npm install -g @cloudflare/wrangler
wrangler --version

# Git
git --version
```

### 배포 스크립트 사용 (권장)

**Linux/Mac:**
```bash
# 스크립트 실행
./deploy.sh production

# 옵션
./deploy.sh staging              # Staging 배포
./deploy.sh production --dry-run # 실행 전 확인
./deploy.sh production --rollback # 이전 버전으로 복구
```

**Windows (PowerShell):**
```powershell
# 실행 정책 설정 (첫 실행만)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 스크립트 실행
.\deploy.ps1 -Environment production

# 옵션
.\deploy.ps1 -Environment staging -DryRun $true
.\deploy.ps1 -Rollback
```

### 단계별 수동 배포

```bash
# 1. 코드 준비
git pull origin main
cd frontend

# 2. 의존성 설치
npm install

# 3. 빌드
npm run build

# 4. 배포
cd ..
wrangler pages deploy frontend/dist --project-name aba-child

# 5. 확인
curl https://aba-child.pages.dev/
```

---

## ✅ 배포 후 검증

### 1. 웹사이트 접속 테스트

```bash
# 웹사이트 열기
https://aba-child.pages.dev

# 주요 기능 확인
□ 로그인 페이지 로드
□ 대시보드 표시
□ 스케줄 조회
□ 아동 정보 확인
□ 보고서 생성
```

### 2. 성능 검증

```bash
# 로딩 시간 확인
curl -w "@curl-format.txt" -o /dev/null -s https://aba-child.pages.dev/

# Lighthouse 점수 확인 (브라우저 개발자 도구)
F12 → Lighthouse → Analyze page load
```

### 3. API 엔드포인트 확인

```bash
# Health check
curl https://aba-child.pages.dev/api/health

# API 버전
curl https://aba-child.pages.dev/api/version
```

### 4. 에러 로그 확인

```bash
# Cloudflare 실시간 로그
wrangler pages deployment tail --project-name aba-child

# 또는 Cloudflare UI
Pages → aba-child → Deployments → Recent deployments
```

### 5. 보안 검증

```bash
# SSL/TLS 확인
curl -v https://aba-child.pages.dev/ 2>&1 | grep "TLS"

# Security headers 확인
curl -I https://aba-child.pages.dev/ | grep -i "security"
```

---

## 🐛 문제 해결

### 증상: 배포 실패

**원인 1: 빌드 오류**
```bash
# 로컬에서 빌드 테스트
cd frontend
npm run build 2>&1 | tail -20
```

**해결**:
- TypeScript 에러 수정
- 누락된 의존성 설치
- `npm install` 캐시 초기화: `rm -rf node_modules && npm install`

**원인 2: GitHub Secrets 누락**
```bash
# Secrets 확인
Settings → Secrets and variables → Actions
□ CLOUDFLARE_API_TOKEN 설정됨
□ CLOUDFLARE_ACCOUNT_ID 설정됨
```

### 증상: 흰 화면 (Blank Page)

**원인 1: React Router 설정**
```javascript
// frontend/src/main.tsx 확인
const router = createBrowserRouter([
  { path: "*", element: <App /> }  // 필수: SPA 라우팅
]);
```

**원인 2: API_URL 오류**
```javascript
// frontend/src/App.tsx 확인
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### 증상: API 호출 실패 (CORS)

**Cloudflare 설정**:
```
Settings → Custom domains → Advanced
CORS 규칙 추가:
Condition: API 경로
Allow Origin: *
```

또는 프론트엔드에서:
```javascript
fetch('/api/reports/quick', {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})
```

### 증상: 느린 로딩

**원인 1: 대용량 번들**
```bash
# 번들 분석
cd frontend
npm run build -- --stats
wc -c dist/*.js  # 파일 크기 확인
```

**해결**: Code splitting, 라이브러리 최적화

**원인 2: 캐시 미설정**
```bash
# Cloudflare 캐시 규칙 설정
Pages → aba-child → Settings → Caching
Browser Cache TTL: 30 minutes
Edge Cache TTL: 1 hour
```

---

## 🔄 롤백 절차

### 이전 버전으로 복구

```bash
# 자동 방법 (권장)
./deploy.sh production --rollback

# 또는 수동 방법
wrangler pages deployment rollback --project-name aba-child

# Cloudflare UI
Pages → aba-child → Deployments → 이전 배포 클릭 → Rollback
```

### 특정 커밋으로 복구

```bash
# 이전 커밋 확인
git log --oneline | head -10

# 이전 버전 배포
git checkout <commit-hash>
./deploy.sh production

# 또는 되돌리기 커밋 생성
git revert <commit-hash>
git push origin main
```

---

## 📊 모니터링

### 실시간 모니터링

```bash
# Cloudflare 실시간 로그
wrangler pages deployment tail --project-name aba-child

# 또는 Cloudflare UI
Analytics 탭 → Real-time Analytics
```

### 주요 지표

| 지표 | 목표 | 확인 방법 |
|------|------|---------|
| 응답 시간 | < 2s | Analytics → Performance |
| 가용성 | > 99.5% | Status page |
| 캐시 히트 | > 80% | Analytics → Cache |
| 에러율 | < 0.1% | Logs |
| 번들 크기 | < 500KB | Build output |

### 알림 설정

```bash
# Cloudflare Notifications
Settings → Notifications → Create notification rule

조건:
- Page deployment complete
- Page deployment failed
- High error rate

Action:
- Email notification
- Slack webhook
```

---

## 🔐 배포 보안

### 환경 변수 보안

```bash
# ❌ 위험: 코드에 직접 입력
API_KEY = "secret123"

# ✅ 안전: Cloudflare 환경 변수
Pages Settings → Environment Variables
```

### 배포 로그 보안

```bash
# 로그에 민감한 정보 확인
wrangler pages deployment tail | grep -E "password|secret|token"

# 발견 시 즉시 조치:
1. 환경 변수 변경
2. 새 배포 실행
3. 모니터링 강화
```

### 도메인 보안

```bash
# SSL/TLS 설정 (Cloudflare 자동 처리)
✅ Full (Strict) SSL/TLS encryption

# WAF (Web Application Firewall)
Security → WAF → Enable OWASP CRS

# DDoS Protection
Security → DDoS Protection → Enabled
```

---

## 📝 배포 체크리스트

### 배포 전
- [ ] 모든 기능 로컬에서 테스트 완료
- [ ] `npm run build` 성공
- [ ] 환경 변수 설정 확인
- [ ] GitHub Secrets 설정 확인
- [ ] 최신 코드 커밋

### 배포 중
- [ ] 배포 스크립트 또는 GitHub Actions 실행
- [ ] 배포 진행 상황 모니터링
- [ ] 빌드 로그 확인

### 배포 후
- [ ] 웹사이트 접속 가능 확인
- [ ] 주요 기능 수동 테스트
- [ ] 성능 지표 확인
- [ ] 에러 로그 모니터링
- [ ] 사용자 알림

---

## 📞 지원

### 자주 묻는 질문

**Q: 배포 시간은?**  
A: 약 3-5분 (빌드 포함)

**Q: 배포 중 다운타임?**  
A: 없음 (Blue-Green 배포)

**Q: 롤백은?**  
A: 1-2분 내 이전 버전으로 복구 가능

**Q: 비용은?**  
A: Cloudflare Pages 무료 (월 500배포 제한)

### 추가 리소스

- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 가이드](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions 가이드](https://docs.github.com/en/actions)

---

**마지막 업데이트**: 2026-04-26  
**버전**: 1.0.0  
**상태**: 배포 준비 완료 ✅
