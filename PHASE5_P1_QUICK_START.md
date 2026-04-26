# Phase 5 P1 - Quick Start Guide
## 배포 빠른 시작 가이드 (5분 만에 배포하기)

**소요 시간**: 약 30-40분 (git 푸시 포함)  
**대상**: 개발팀, DevOps 엔지니어  
**최종 URL**: https://kinder-management.vercel.app

---

## 🚀 1단계: 로컬 환경 (5분)

### 1.1 변경사항 확인
```bash
cd /e/kinder-management
git status
```

**보아야 할 것**:
```
Changes not staged for commit:
  modified:   frontend/.env.production

Untracked files:
  vercel.json
```

### 1.2 빌드 최종 확인
```bash
cd frontend
npm run build
# Build successful ✅
```

### 1.3 커밋 및 푸시
```bash
cd /e/kinder-management
git add vercel.json frontend/.env.production
git commit -m "Phase 5 P1: Production Deployment Setup"
git push origin main
```

**확인**:
```
GitHub 웹사이트 → Commits → 최신 커밋 확인
```

---

## 🎯 2단계: Vercel 배포 (10분)

### 2.1 Vercel 사이트 접속
```
https://vercel.com
```

### 2.2 로그인 또는 가입
- GitHub로 로그인 (권장)
- 또는 이메일로 가입

### 2.3 새 프로젝트 임포트
```
Dashboard → Add New → Project
```

### 2.4 GitHub 저장소 선택
```
Repository: kinder-management
Owner: maibauntourph
Import
```

### 2.5 설정 확인 (자동으로 감지됨)
```
Framework: Vite
Build Command: cd frontend && npm run build
Output Directory: frontend/dist
```

확인 후 **Deploy** 클릭

---

## ⚙️ 3단계: 환경 변수 설정 (5분)

### 3.1 Vercel 콘솔 접속
```
배포 후: Vercel 콘솔 → Settings → Environment Variables
```

### 3.2 다음 변수 추가 (6개)

각 항목마다 "Add" 클릭:

**1번째**:
```
Name: VITE_API_URL
Value: https://kinder-management.vercel.app/api
Environment: Production, Preview, Development
Save
```

**2번째**:
```
Name: VITE_API_TIMEOUT
Value: 30000
Environment: Production, Preview, Development
Save
```

**3번째**:
```
Name: VITE_ENABLE_BACKUP
Value: true
Environment: Production, Preview, Development
Save
```

**4번째**:
```
Name: VITE_ENABLE_REPORTS
Value: true
Environment: Production, Preview, Development
Save
```

**5번째**:
```
Name: VITE_ENABLE_ENCRYPTION
Value: true
Environment: Production, Preview, Development
Save
```

**6번째**:
```
Name: VITE_BUILD_TIME
Value: production
Environment: Production
Save
```

### 3.3 재배포 (환경 변수 적용)
```
Deployments → 최신 배포 선택 → Redeploy
```

**대기**: 약 2-5분

---

## ✅ 4단계: 검증 (5-10분)

### 4.1 라이브 URL 접속
```
https://kinder-management.vercel.app
```

**확인 체크리스트**:
- [ ] 페이지가 로드됨
- [ ] 로고 및 레이아웃 표시됨
- [ ] 콘솔에 에러 없음 (F12 → Console)

### 4.2 로그인 테스트

**Admin 계정로 로그인**:
```
Email: admin@akms.local
Password: (admin password)
```

**확인**:
- [ ] 로그인 성공
- [ ] 대시보드 로드됨
- [ ] 메뉴 표시됨

### 4.3 기능 테스트

**페이지 네비게이션**:
- [ ] Children 페이지 클릭 → 데이터 표시됨
- [ ] Schedule 페이지 클릭 → 일정 표시됨
- [ ] ABCAnalysis 페이지 클릭 → 분석 데이터 표시됨

**파일 다운로드**:
- [ ] 리포트 생성 → PDF 다운로드 테스트
- [ ] 데이터 내보내기 → Excel 다운로드 테스트

### 4.4 성능 확인

**Vercel Analytics** (선택사항):
```
Vercel 콘솔 → Analytics
```

**로컬 테스트**:
```
F12 → Lighthouse
Performance 탭에서 측정
```

---

## 🎉 완료!

### 라이브 배포 완료

```
✅ URL: https://kinder-management.vercel.app
✅ 모든 기능 동작
✅ 보안 헤더 설정됨
✅ 글로벌 CDN으로 배포됨
```

---

## 📱 배포 후 접근 방법

### 사용자용 접근 가이드

**1단계**: 브라우저에서 다음 URL 입력
```
https://kinder-management.vercel.app
```

**2단계**: 로그인
```
역할에 맞는 계정으로 로그인

Admin
  Email: admin@akms.local

Teacher
  Email: teacher@akms.local

Parent
  Email: parent@akms.local

Child (Read-only)
  Email: child@akms.local
```

**3단계**: 대시보드에서 시작
```
각 역할의 대시보드에서 모든 기능 이용 가능
```

---

## 🔧 자주 묻는 질문 (FAQ)

### Q1: 배포 후 변경사항을 어떻게 반영하나요?
**A**: GitHub main 브랜치에 푸시하면 자동으로 배포됩니다.
```bash
git push origin main
# 자동으로 Vercel이 감지하고 배포 시작
```

### Q2: 라이브 URL이 아직도 작동하지 않으면?
**A**: 다음을 확인하세요.
1. Vercel 배포 완료 확인 (콘솔에서 "Deployment Successful" 확인)
2. 환경 변수 설정 확인
3. 브라우저 캐시 초기화 (Ctrl+Shift+Delete)
4. 다른 브라우저에서 시도

### Q3: API가 작동하지 않으면?
**A**: 
1. 백엔드 API 상태 확인
2. 네트워크 탭에서 API 요청 확인 (F12)
3. CORS 에러 확인
4. 환경 변수의 API URL 확인

### Q4: 이전 버전으로 돌아가려면?
**A**: Vercel 콘솔에서 이전 배포로 롤백
```
Deployments → 이전 배포 선택 → Promote to Production
```

### Q5: 커스텀 도메인을 추가하려면?
**A**: Vercel 콘솔에서 설정
```
Settings → Domains → Add
DNS 설정 후 완료
```

---

## 📞 긴급 연락처

**문제 발생 시**:
1. Vercel 콘솔에서 배포 로그 확인
2. GitHub에서 최신 커밋 확인
3. 로컬에서 `npm run build` 실행하여 재현
4. Vercel 지원 센터: https://vercel.com/support

---

## 📊 배포 완료 체크리스트

배포 완료 후 이 체크리스트를 확인하세요:

```
배포 단계
[ ] Git 커밋 및 푸시 완료
[ ] Vercel 프로젝트 생성 완료
[ ] 환경 변수 6개 모두 설정 완료
[ ] 재배포 완료

검증 단계
[ ] https://kinder-management.vercel.app 접속 가능
[ ] 로그인 성공
[ ] 기본 페이지 로드됨
[ ] 메뉴 네비게이션 작동
[ ] 데이터 표시됨

기능 테스트
[ ] Admin 로그인 테스트
[ ] Teacher 로그인 테스트
[ ] Parent 로그인 테스트
[ ] PDF 다운로드 테스트
[ ] Excel 내보내기 테스트

성능 확인
[ ] 초기 로드 시간 < 3초
[ ] 페이지 상호작용 < 100ms
[ ] Console 에러 없음

보안 확인
[ ] HTTPS 활성화 (URL 왼쪽 자물쇠 표시)
[ ] 보안 헤더 설정됨 (DevTools 확인)
[ ] 환경 변수 안전하게 관리됨

모니터링 설정
[ ] Vercel Analytics 활성화
[ ] 에러 추적 설정
[ ] 알림 설정
```

---

## 🎯 최종 확인

### 배포 성공의 신호
```
✅ https://kinder-management.vercel.app에서 사이트 접근 가능
✅ 모든 페이지가 정상 로드됨
✅ 로그인 및 모든 기능이 작동함
✅ 성능 메트릭이 양호함
✅ 보안 헤더가 설정되어 있음
```

### 배포 완료
```
프로덕션 배포가 완료되었습니다!

라이브 URL: https://kinder-management.vercel.app
배포 날짜: 2026-04-27
배포 상태: ✅ Live

이제 사용자들이 이 URL에 접속하여 AKMS 시스템을 이용할 수 있습니다.
```

---

## 📚 추가 문서

자세한 정보는 다음 문서를 참고하세요:

1. **PHASE5_P1_DEPLOYMENT_GUIDE.md** - 완전한 배포 가이드
2. **PHASE5_P1_DEPLOYMENT_CHECKLIST.md** - 상세 체크리스트
3. **PHASE5_P1_DEPLOYMENT_STATUS.md** - 현재 배포 상태 보고서

---

**작성자**: Claude Haiku 4.5  
**작성일**: 2026-04-27  
**상태**: ✅ 배포 준비 완료
