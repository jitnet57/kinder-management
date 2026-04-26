# Phase 5 P1 - Production Deployment Checklist
## 실제 배포 실행 가이드

**프로젝트**: Kinder Management System (AKMS v2.0)  
**작성 일시**: 2026-04-27  
**배포 대상**: Vercel  
**예상 라이브 URL**: https://kinder-management.vercel.app

---

## 🔧 사전 준비 (Prerequisites)

### 필수 계정
- [ ] GitHub 계정 (이미 활성화됨: maibauntourph)
- [ ] Vercel 계정 (https://vercel.com 에서 생성)
- [ ] GitHub 와 Vercel 연동

### 로컬 환경 확인
- [x] Node.js v18+ 설치됨
- [x] npm 설치됨
- [x] Git 설정됨

---

## 단계별 배포 절차

### STEP 1: 로컬 코드 최종화 및 푸시

#### 1.1 변경사항 스테이징
```bash
cd /e/kinder-management
git add vercel.json frontend/.env.production
git status  # 확인
```

**확인 항목**:
- [x] vercel.json 파일 생성됨
- [x] frontend/.env.production 수정됨
- [x] 기타 불필요한 파일은 포함 안 함

#### 1.2 최종 커밋
```bash
git commit -m "Phase 5 P1: Production Deployment Setup

- Add vercel.json for Vercel deployment configuration
- Update .env.production for Vercel environment

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

**예상 결과**:
- [x] 커밋 메시지 작성됨
- [x] 커밋 완료

#### 1.3 GitHub에 푸시
```bash
git push origin main
```

**확인 사항**:
- [ ] GitHub 웹사이트에서 최신 커밋 확인
- [ ] vercel.json 파일이 저장소에 표시됨

---

### STEP 2: Vercel 계정 설정 및 연동

#### 2.1 Vercel 웹사이트 접속
```
https://vercel.com
```

**작업**:
- [ ] Vercel 계정이 없으면 회원가입
- [ ] GitHub로 로그인
- [ ] GitHub 저장소 접근 권한 허용

#### 2.2 새 프로젝트 생성
```
1. Vercel 대시보드 → "New Project" 클릭
2. GitHub 저장소 선택: "kinder-management"
3. "Import" 클릭
```

**확인 항목**:
- [ ] 저장소 이름 확인: `kinder-management`
- [ ] 저장소 소유자 확인: `maibauntourph`

---

### STEP 3: Vercel 배포 설정

#### 3.1 프로젝트 설정 페이지에서
```
Project Settings 확인 (자동 감지)
```

**빌드 설정**:
- [x] Framework: Vite (자동 감지)
- [x] Build Command: `cd frontend && npm run build`
- [x] Output Directory: `frontend/dist`
- [x] Install Command: `npm install`
- [x] Development Command: `npm run dev` (자동)

#### 3.2 환경 변수 설정

**Vercel 콘솔**:
```
Settings → Environment Variables
```

**다음 변수들 추가**:
```
이름: VITE_API_URL
값: https://kinder-management.vercel.app/api
환경: Production, Preview, Development

이름: VITE_API_TIMEOUT
값: 30000
환경: Production, Preview, Development

이름: VITE_ENABLE_BACKUP
값: true
환경: Production, Preview, Development

이름: VITE_ENABLE_REPORTS
값: true
환경: Production, Preview, Development

이름: VITE_ENABLE_ENCRYPTION
값: true
환경: Production, Preview, Development

이름: VITE_BUILD_TIME
값: production
환경: Production
```

**환경 변수 추가 확인 체크리스트**:
- [ ] VITE_API_URL 추가됨
- [ ] VITE_API_TIMEOUT 추가됨
- [ ] VITE_ENABLE_BACKUP 추가됨
- [ ] VITE_ENABLE_REPORTS 추가됨
- [ ] VITE_ENABLE_ENCRYPTION 추가됨
- [ ] VITE_BUILD_TIME 추가됨

---

### STEP 4: 배포 실행

#### 4.1 배포 시작
```
Vercel 콘솔: "Deploy" 버튼 클릭
```

또는 자동 배포 (GitHub main 브랜치 푸시 시):
- 자동으로 배포 시작

#### 4.2 배포 진행 상황 모니터링
```
Deployments 탭에서 실시간 진행 상황 확인
```

**배포 단계**:
1. ⏳ Build: 빌드 진행 중 (약 1-2분)
2. ⏳ Check: 품질 검사 진행 중
3. ✅ Publish: 배포 완료

**예상 시간**: 3-5분

#### 4.3 배포 완료 확인
```
Deployment Successful ✅
```

**라이브 URL 확인**:
- [ ] https://kinder-management.vercel.app 에 접속 가능
- [ ] "Build" 로그 확인
- [ ] 배포 시간 기록

---

### STEP 5: 배포 후 검증

#### 5.1 웹사이트 기본 접속 확인

```bash
# 브라우저에서
https://kinder-management.vercel.app
```

**확인 항목**:
- [ ] 홈 페이지가 로드됨
- [ ] 404 에러 없음
- [ ] 콘솔에 심각한 에러 없음 (F12 개발자 도구)

#### 5.2 역할별 로그인 테스트

**Admin 로그인**:
```
이메일: admin@akms.local
암호: (관리자 비밀번호)
```
- [ ] 로그인 성공
- [ ] 대시보드 로드됨
- [ ] 메뉴 접근 가능

**Teacher 로그인**:
```
이메일: teacher@akms.local
암호: (교사 비밀번호)
```
- [ ] 로그인 성공
- [ ] 교사 대시보드 표시
- [ ] 학생 목록 표시

**Parent 로그인**:
```
이메일: parent@akms.local
암호: (보호자 비밀번호)
```
- [ ] 로그인 성공
- [ ] 자녀 정보 표시
- [ ] 보고서 접근 가능

#### 5.3 주요 기능 테스트

**페이지 네비게이션**:
- [ ] Children 페이지 로드 성공
- [ ] Schedule 페이지 로드 성공
- [ ] ABCAnalysis 페이지 로드 성공
- [ ] Dashboard 페이지 로드 성공

**데이터 기능**:
- [ ] 데이터 표시됨
- [ ] 정렬 기능 작동
- [ ] 필터 기능 작동
- [ ] 검색 기능 작동

**파일 다운로드**:
- [ ] PDF 다운로드 성공
- [ ] Excel 다운로드 성공
- [ ] 다운로드 파일이 올바른 형식

**API 연결**:
- [ ] API 요청이 백엔드로 전달됨
- [ ] 데이터가 정상적으로 반환됨
- [ ] 에러 응답이 올바르게 처리됨

#### 5.4 성능 메트릭 확인

**Vercel Analytics** (Vercel 콘솔):
```
Settings → Analytics
```

**확인 항목**:
- [ ] Page Load Time 확인
- [ ] Core Web Vitals 확인 (24시간 후)
- [ ] 에러율 확인

**브라우저 개발자 도구** (F12):
```
Performance 탭에서 측정
```

**메트릭**:
- [ ] First Contentful Paint (FCP): < 1.8s
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] Cumulative Layout Shift (CLS): < 0.1
- [ ] Time to Interactive (TTI): < 3.8s

#### 5.5 보안 헤더 검증

**온라인 도구 사용**:
```
https://securityheaders.com
https://kinder-management.vercel.app
```

**확인 항목**:
- [ ] X-Content-Type-Options 설정됨
- [ ] X-Frame-Options 설정됨
- [ ] X-XSS-Protection 설정됨

**브라우저 개발자 도구**:
```
응답 헤더 확인
```

---

## 🔍 배포 검증 테스트 매트릭스

### 환경별 테스트
| 환경 | 브라우저 | 기기 | 상태 |
|------|---------|------|------|
| Production | Chrome | Desktop | [ ] 테스트 예정 |
| Production | Safari | macOS | [ ] 테스트 예정 |
| Production | Firefox | Desktop | [ ] 테스트 예정 |
| Production | Chrome | Mobile | [ ] 테스트 예정 |
| Production | Safari | iPad | [ ] 테스트 예정 |

### 기능별 테스트
| 기능 | 상태 | 노트 |
|------|------|------|
| 로그인 | [ ] | |
| Admin 대시보드 | [ ] | |
| Teacher 대시보드 | [ ] | |
| Parent 대시보드 | [ ] | |
| Children 관리 | [ ] | |
| Schedule 관리 | [ ] | |
| ABC 분석 | [ ] | |
| PDF 리포트 | [ ] | |
| Excel 내보내기 | [ ] | |
| 데이터 백업 | [ ] | |
| 데이터 복구 | [ ] | |

---

## 📊 배포 결과 기록

### 배포 정보
```
배포 일시: _______________
배포 환경: Vercel
배포 계정: maibauntourph
배포 상태: ☐ 진행 중  ☐ 성공  ☐ 실패
```

### 라이브 URL
```
Primary: https://kinder-management.vercel.app
Preview: https://[branch-name].kinder-management.vercel.app
```

### 빌드 정보
```
빌드 시간: _______________
빌드 기간: _____ 분 _____ 초
빌드 크기: _____ MB
Gzip 크기: _____ KB
```

### 성능 메트릭
```
Initial Page Load: _____ ms
Time to Interactive: _____ ms
Lighthouse Score: _____ / 100
Core Web Vitals: _______________
```

### 테스트 결과
```
로그인 테스트: ☐ 통과  ☐ 실패
기능 테스트: ☐ 통과  ☐ 실패
성능 테스트: ☐ 통과  ☐ 실패
보안 헤더: ☐ 통과  ☐ 실패
```

---

## 🆘 트러블슈팅

### 문제: 빌드 실패 (Build Failed)

**증상**: Vercel 콘솔에 "Build Failed" 표시

**해결 방법**:
1. Vercel 빌드 로그 확인
2. 다음 명령어로 로컬에서 재현:
   ```bash
   cd /e/kinder-management
   cd frontend
   npm install
   npm run build
   ```
3. 에러 메시지 분석
4. 필요시 의존성 업데이트:
   ```bash
   npm update
   npm install
   ```

---

### 문제: 페이지 로드 안 됨 (404 또는 Blank Page)

**증상**: https://kinder-management.vercel.app 접속 시 404 또는 빈 페이지

**해결 방법**:
1. vercel.json의 rewrite 규칙 확인
2. frontend/dist 폴더가 제대로 생성되었는지 확인
3. Output Directory 설정 확인 (`frontend/dist`)
4. 로컬에서 preview 테스트:
   ```bash
   cd frontend
   npm run preview
   ```

---

### 문제: API 연결 실패

**증상**: 페이지는 로드되지만 데이터가 표시 안 됨

**해결 방법**:
1. 브라우저 DevTools → Network 탭 확인
2. API 요청의 상태 코드 확인
3. CORS 에러 확인
4. vercel.json의 redirects 규칙 확인
5. 백엔드 API 상태 확인:
   ```bash
   curl https://api.aba-child.pages.dev/health
   ```

---

### 문제: 환경 변수 적용 안 됨

**증상**: 환경 변수 값이 undefined

**해결 방법**:
1. Vercel 환경 변수 설정 확인
2. 환경 변수 이름이 정확한지 확인 (VITE_ 접두사 포함)
3. 빌드 후 배포:
   ```
   Vercel 콘솔: Deployments → 재배포 (Redeploy)
   ```
4. 캐시 초기화:
   - Vercel 콘솔: Settings → Clear Cache

---

### 문제: 느린 로드 시간

**증상**: 초기 페이지 로드에 10초 이상 소요

**해결 방법**:
1. Vercel 분석 확인 (어느 부분이 느린지)
2. 네트워크 연결 확인
3. 브라우저 캐시 초기화
4. CDN 캐시 초기화:
   - Vercel 콘솔: Settings → Clear Cache
5. 청크 분할 최적화

---

## 📞 지원 및 문의

**Vercel 지원**:
- 공식 문서: https://vercel.com/docs
- 커뮤니티 포럼: https://github.com/vercel/vercel/discussions
- 지원 센터: https://vercel.com/support

**GitHub 이슈**:
- 저장소: https://github.com/maibauntourph/kinder-management
- 새 이슈: Issues → New Issue

---

## 📝 배포 후 체크리스트

### 배포 직후 (0-1시간)
- [ ] 라이브 URL 접속 확인
- [ ] 홈페이지 로드 확인
- [ ] 콘솔 에러 확인
- [ ] 기본 기능 동작 확인

### 배포 후 1일
- [ ] 전체 기능 테스트
- [ ] 성능 메트릭 확인
- [ ] 에러 모니터링 확인
- [ ] 사용자 피드백 수집

### 배포 후 1주
- [ ] Core Web Vitals 수집 (최소 실제 데이터 필요)
- [ ] 보안 감사
- [ ] 모니터링 설정 확인
- [ ] 백업 및 복구 계획 수립

---

## ✅ 최종 확인 사항

배포 완료 전 마지막 확인:
- [ ] GitHub 저장소에 모든 변경사항 푸시됨
- [ ] Vercel 프로젝트 생성됨
- [ ] 환경 변수 설정됨
- [ ] 배포 성공 확인됨
- [ ] 라이브 URL에서 접속 가능
- [ ] 주요 기능 동작 확인됨
- [ ] 보안 헤더 설정됨
- [ ] 모니터링 활성화됨

---

**문서 작성**: Claude Haiku 4.5  
**최종 수정**: 2026-04-27  
**배포 상태**: 🟡 준비 완료, 배포 대기 중
