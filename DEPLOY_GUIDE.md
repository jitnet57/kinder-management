# AKMS Cloudflare Pages 배포 가이드

## 🚀 배포 완료 상태

```
✅ 빌드: 성공
✅ 파일: dist/ 폴더 생성됨
✅ 준비: 배포 가능
```

---

## 배포 옵션

### 옵션 1: GitHub + Cloudflare Pages (권장) ⭐

**장점**: 자동 배포, CI/CD 통합

#### Step 1: GitHub에 푸시

```bash
cd /e/kinder-management

# 1. Git 상태 확인
git status

# 2. 파일 추가
git add .

# 3. 커밋
git commit -m "feat: Complete 2-stage approval system and 252 LTO curriculum"

# 4. 푸시
git push origin main
```

#### Step 2: Cloudflare Pages 연동

1. **Cloudflare 대시보드 열기**
   - https://dash.cloudflare.com

2. **Pages 선택**
   - 왼쪽 메뉴 → Pages

3. **프로젝트 생성**
   - "Create a project" 클릭
   - "Connect to Git" 선택
   - GitHub 승인

4. **저장소 선택**
   - Repository: `maibauntourph/kinder-management`
   - Branch: `main`

5. **빌드 설정**
   ```
   Build command: npm run build
   Build output directory: frontend/dist
   Root directory: (leave blank)
   ```

6. **배포**
   - "Save and Deploy" 클릭
   - 빌드 시작 (2-5분)
   - 배포 완료 ✅

**결과**: 자동으로 모든 커밋이 배포됨

---

### 옵션 2: Wrangler CLI 직접 배포

#### 준비

```bash
# 1. Cloudflare 로그인
wrangler login

# 2. 계정 정보 입력 (브라우저에서)
```

#### 배포

```bash
cd /e/kinder-management/frontend

# dist/ 폴더를 Cloudflare Pages에 배포
wrangler pages deploy dist/
```

**결과**: URL 제공됨 (예: `https://akms-xxx.pages.dev`)

---

### 옵션 3: Cloudflare UI Drag & Drop

1. **Cloudflare 대시보드** → Pages
2. "Upload assets" 클릭
3. `frontend/dist/` 폴더의 모든 파일 선택
4. 드래그 & 드롭
5. 배포 완료

---

## 📝 배포 후 확인

### 1. 배포 URL 확인

GitHub 연동 시:
```
https://<branch>.<project-name>.pages.dev
```

예시:
```
https://main.akms-kinder-management.pages.dev
```

### 2. 기능 테스트

```
1. 로그인 페이지 로드
2. admin@akms.com / admin123 로그인
3. 2단계 승인 프로세스 확인
4. 커리큘럼 페이지 로드 (252 LTO 확인)
5. 대시보드 기능 확인
```

### 3. 배포 URL 설정

**커스텀 도메인 (선택사항)**

1. Cloudflare Pages 프로젝트 설정
2. "Custom domains" 탭
3. 도메인 추가
   - `akms.yourdomain.com`
   - 또는 `app.yourdomain.com`

---

## 🔧 배포 후 설정

### 환경 변수 추가 (필요시)

```bash
# Cloudflare Pages에서 환경 변수 설정
# 프로젝트 설정 → Environment variables
```

예시:
```
VITE_API_URL=https://api.yourdomain.com
VITE_ENV=production
```

### 캐시 설정

```
Static assets (CSS, JS): 1년
HTML: 1시간
```

---

## ✅ 배포 체크리스트

- [ ] GitHub에 푸시 (`git push`)
- [ ] Cloudflare 계정 생성/로그인
- [ ] Pages 프로젝트 생성
- [ ] GitHub 저장소 연동
- [ ] 빌드 설정 확인
  - Build command: `npm run build`
  - Output: `frontend/dist`
- [ ] 첫 배포 완료
- [ ] 배포 URL 로드 확인
- [ ] 로그인 페이지 작동 확인
- [ ] 2단계 승인 테스트
- [ ] 커리큘럼 로드 확인
- [ ] 커스텀 도메인 설정 (선택)

---

## 🚨 문제 해결

### 빌드 실패

```
확인:
1. Build command: npm run build
2. Output directory: frontend/dist
3. Node.js 버전: 18+
```

### 배포 후 404 에러

```
확인:
1. Routes 설정 추가:
   [[routes]]
   pattern = "/*"
   status = 200
   path = "/index.html"

2. _redirects 파일 생성 (SPA용):
   /* /index.html 200
```

### 환경 변수 미적용

```
1. Cloudflare Pages 프로젝트 설정
2. Environment variables 추가
3. Redeploy 필요
```

---

## 📊 배포 후 모니터링

### Cloudflare Analytics

```
1. Pages 대시보드
2. "Analytics" 탭
3. 트래픽, 오류율, 성능 확인
```

### 실시간 로그

```bash
# 배포 로그 확인
wrangler pages deployment list
wrangler pages deployment info <id>
```

---

## 🔐 배포 후 보안

### 권장 설정

1. **HTTPS 강제**
   ```
   Cloudflare 대시보드 → SSL/TLS
   → "Always use HTTPS" 활성화
   ```

2. **DDoS 보호**
   ```
   Cloudflare 대시보드 → Security
   → DDoS 수준 조정
   ```

3. **접근 제한**
   ```
   Cloudflare Pages 설정
   → Basic authentication 활성화 (선택)
   ```

---

## 📈 배포 후 성능 최적화

### 현재 상태
```
✓ Vite 번들 최적화됨
✓ Gzip 압축 활성화
✓ React 프로덕션 빌드
```

### 추가 최적화 (선택)

1. **Code Splitting**
   - 라우트별 동적 import

2. **Image Optimization**
   - WebP 형식 사용

3. **CDN 캐시**
   - Cloudflare의 자동 캐싱 활용

---

## 📞 배포 지원

**Cloudflare Pages 문서**
- https://developers.cloudflare.com/pages/

**문제 해결**
- https://developers.cloudflare.com/pages/troubleshooting/

**커뮤니티**
- https://discord.com/invite/cloudflaredev

---

## 🎉 배포 후 다음 단계

### 즉시
1. ✅ 배포 URL 테스트
2. ✅ 로그인 / 승인 프로세스 확인
3. ✅ 커리큘럼 데이터 로드 확인

### 1주일 내
1. 실사용자 테스트
2. 성능 모니터링
3. 버그 피드백 수집

### 2주일 내
1. 백엔드 API 연동 (향후)
2. 실제 데이터베이스 연동
3. 사용자 계정 시스템 개선

### 1개월 내
1. 실시간 협업 기능
2. 부모/치료사 대시보드
3. 고급 분석 기능

---

## 📋 최종 배포 정보

```
프로젝트명: AKMS (ABA Child Management System)
배포 플랫폼: Cloudflare Pages
빌드 도구: Vite
프레임워크: React 19 + TypeScript
상태: 🟢 준비 완료

배포 예상 시간: 2-5분
라이브 URL: https://<project>.pages.dev
```

---

**배포 상태**: 🟢 **완료 준비됨**

언제든지 GitHub에 푸시하면 자동으로 Cloudflare Pages에 배포됩니다!

생성일: 2024년 4월 26일
