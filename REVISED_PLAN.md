# 🚀 AKMS 변경/추가 개발 계획

**작성일**: 2026-04-27  
**상태**: 🔄 진행 중 (배포 단계)  
**계획 방식**: 실용적 단계별 배포 중심  
**우선순위**: 프로덕션 배포 → 기능 검증 → 고도화

---

## 📌 변경 사유

초기 계획(BMAD × LangGraph 4개 병렬 스트림)에서 **실용적 배포 중심 접근**으로 전환:

| 항목 | 초기 계획 | 변경 계획 | 이유 |
|------|---------|---------|------|
| **방식** | 4개 병렬 스트림 | 단계별 순차 | 빠른 배포 필요 |
| **우선순위** | 완벽한 구조 | 배포 가능한 상태 | MVP 전달 시간 단축 |
| **데이터** | 240개 LTO 생성 | 기본 구조만 | 배포 후 확대 |
| **협력** | 완전한 RBAC | 기본 역할 구분 | 배포 후 고도화 |
| **배포** | 로컬 + 로컬 서버 | Cloudflare Pages | 프로덕션 환경 제공 |

---

## 🎯 현재 단계별 목표

### Phase 1: 테스트 모드 구성 ✅ 완료
**목표**: 빠른 개발/검증을 위한 환경 준비

- ✅ auto-login 구현 (admin@akms.com)
- ✅ 승인 프로세스 스킵
- ✅ Phase 5 P2 페이지 활성화
- ✅ ABC Recorder 취소 기능 수정

**커밋**: 5948dc4, f7496c8, cb2e5d3, a6ddb19

---

### Phase 2: 빌드 최적화 ✅ 완료
**목표**: Cloudflare Pages 배포 환경 구성

| 단계 | 문제 | 해결책 | 커밋 |
|------|------|--------|------|
| 2-1 | TypeScript 컴파일러 없음 | tsc -b 제거 | 18be045 |
| 2-2 | npm 의존성 미설치 | npm install 추가 | bf3df35 |
| 2-3 | MIME 타입 에러 | _headers 규칙 추가 | 2214832 |
| 2-4 | Workers 잘못 배포됨 | Pages로 전환 | 진행 중 |

**상태**: 🔄 진행 중 (Pages 빌드 설정 수정)

---

### Phase 3: 프로덕션 배포 🔄 진행 중
**목표**: `aba-child.pages.dev` 정상 배포

**필요 조치**:
1. Cloudflare Pages 빌드 설정 수정
   ```
   Build command: cd frontend && npm install && npm run build
   Build output directory: frontend/dist
   ```
2. 배포 재시도
3. MIME 타입 확인
4. 기능 테스트

**예상 완료**: 2026-04-27 (오늘)

---

### Phase 4: 기능 검증 ⏳ 대기 중
**목표**: 모든 기능이 프로덕션에서 정상 작동하는지 확인

**검증 항목**:
```
✅ 1. 페이지 로드
   - https://aba-child.pages.dev 접속 가능
   - MIME 타입 에러 없음

✅ 2. 자동 로그인
   - 페이지 진입 → 즉시 admin 로그인
   - 대시보드 진입

✅ 3. Phase 5 P2 페이지
   - 📹 Live Session 로드
   - 📊 Video Analyzer 로드
   - ⚙️ Smart Notification Settings 로드
   - 📈 Statistical Analysis 로드
   - 🌐 Language Settings 로드

✅ 4. ABC 분석
   - 새 기록 입력
   - 분석 데이터 표시
   - 히스토리 조회

✅ 5. 커리큘럼
   - 도메인 선택
   - LTO 표시
   - STO 표시
   - 교수팁 조회

✅ 6. 대시보드
   - 아동별 통계 표시
   - 진행률 차트
   - 최근 활동 로그

✅ 7. 콘솔
   - 에러 메시지 없음
   - 경고 최소화
```

---

### Phase 5: 초기 기능 개선 📅 향후 계획
**목표**: 배포 후 사용자 피드백을 바탕으로 개선

**우선순위**:

#### 높음 (1주 내)
```
1. 데이터 영속성 개선
   - localStorage 검증
   - 데이터 백업 기능
   
2. 성능 최적화
   - 번들 크기 감소
   - 이미지 최적화
   - 캐싱 전략 수립

3. 버그 수정
   - 테스트 환경에서 발견된 모든 버그
```

#### 중간 (1-2주)
```
1. 초기 데이터 통합
   - 실제 커리큘럼 데이터 입력
   - 아동 정보 통합

2. 알림 시스템
   - 기본 알림 기능 구현
   - 부모 알림 설정

3. 보고서 강화
   - PDF 다운로드
   - 이메일 발송
```

#### 낮음 (2-4주)
```
1. 협력 기능
   - 부모-치료사 메시지
   - 실시간 알림
   
2. 고급 분석
   - 중재 효과 분석
   - 트렌드 분석
   
3. 모바일 최적화
   - 반응형 디자인 개선
   - 터치 인터페이스 최적화
```

---

## 🔄 초기 계획과의 비교

### 초기 계획에서 **제외된 항목** (향후로 연기)

```
❌ Phase 1-4 병렬 스트림 (Stream A/B/C/D)
   └─ 이유: 배포 우선순위로 인해 단순화

❌ 240개 LTO 자동 생성
   └─ 이유: 배포 후 필요한 데이터만 먼저 입력

❌ 중재 효과 분석 시스템
   └─ 이유: 기본 기능 검증 후 고도화

❌ 부모-치료사 메시지 시스템
   └─ 이유: MVP에서 제외, Phase 2에 포함

❌ BMAD × LangGraph 멀티에이전트
   └─ 이유: 배포 후 데이터 생성 자동화 단계에서 활용
```

### 초기 계획에서 **추가된 항목**

```
✅ Cloudflare Pages 배포
   └─ 프로덕션 환경 제공

✅ auto-login 테스트 모드
   └─ 빠른 개발/검증

✅ _headers MIME 타입 설정
   └─ 배포 환경 호환성

✅ Phase 5 P2 페이지 활성화
   └─ 기존 기능 완성

✅ 프로젝트 문서화
   └─ 유지보수 용이성
```

---

## 📋 변경 로드맵

```
현재 (2026-04-27)
    │
    ├─ Phase 3: 프로덕션 배포 ← 지금 여기
    │   └─ Pages 빌드 설정 수정
    │   └─ 배포 완료
    │   └─ 기능 검증
    │
    ├─ Phase 4: 초기 기능 검증 (1-2일)
    │   └─ 모든 페이지 로드 확인
    │   └─ MIME 타입 정상
    │   └─ 기본 기능 동작
    │
    ├─ Phase 5a: 초기 개선 (1주)
    │   └─ 버그 수정
    │   └─ 성능 최적화
    │   └─ 데이터 영속성
    │
    ├─ Phase 5b: 데이터 통합 (1-2주)
    │   └─ 실제 커리큘럼 데이터
    │   └─ 아동 정보
    │   └─ 초기 사용자 온보딩
    │
    ├─ Phase 6: 협력 기능 (2-4주)
    │   └─ 부모 대시보드
    │   └─ 메시지 시스템
    │   └─ 실시간 알림
    │
    └─ Phase 7: 고도화 (4주+)
        └─ BMAD × LangGraph 멀티에이전트
        └─ 자동 커리큘럼 생성
        └─ 고급 분석 시스템
```

---

## 🔧 배포 후 즉시 확인사항

### 1. DNS & 도메인
```bash
# 도메인 확인
nslookup aba-child.pages.dev

# CNAME 확인
dig aba-child.pages.dev CNAME
```

### 2. MIME 타입
```bash
# HTML
curl -I https://aba-child.pages.dev
# 응답: Content-Type: text/html

# JavaScript
curl -I https://aba-child.pages.dev/assets/index-*.js
# 응답: Content-Type: application/javascript

# CSS
curl -I https://aba-child.pages.dev/assets/style-*.css
# 응답: Content-Type: text/css
```

### 3. 기능 테스트
```
1. 페이지 로드
   → F12 개발자 도구에서 콘솔 확인
   → 에러/경고 최소화

2. 자동 로그인
   → admin@akms.com으로 자동 로그인 확인

3. 페이지 네비게이션
   → 모든 메뉴 클릭 가능 확인
   → Phase 5 P2 페이지 로드 확인

4. 기본 기능
   → ABC 데이터 입력/조회
   → 커리큘럼 조회
   → 대시보드 데이터 표시
```

---

## 📊 성공 기준

| 단계 | 기준 | 확인 방법 |
|------|------|---------|
| **Phase 3** | 배포 완료 | `aba-child.pages.dev` 접속 가능 |
| **Phase 4** | MIME 타입 정상 | `application/javascript` 확인 |
| **Phase 5a** | 기능 검증 완료 | 모든 페이지 로드, 콘솔 에러 없음 |
| **Phase 5b** | 데이터 통합 | 실제 데이터로 기능 테스트 |
| **Phase 6** | 협력 기능 | 부모/치료사 기본 기능 동작 |
| **Phase 7** | 고도화 완성 | AI 자동화 및 고급 분석 |

---

## 🎯 다음 즉시 조치

**지금 바로 해야 할 것** (우선순위순):

1. **Cloudflare Pages 빌드 설정 수정** ⚠️ 최고 우선
   ```
   Dashboard → Pages → aba-child
   → Settings → Build settings
   → Build command: cd frontend && npm install && npm run build
   → Save & Retry
   ```

2. **배포 완료 확인** (2-3분 대기)
   ```bash
   curl https://aba-child.pages.dev
   ```

3. **기능 검증** (스크린샷 확인)
   ```
   - 자동 로그인 되는가?
   - Phase 5 P2 페이지 로드되는가?
   - MIME 타입 에러 없는가?
   ```

4. **버그 수정** (발견 시)
   ```
   - 에러 스크린샷 캡처
   - 콘솔 로그 확인
   - 원인 파악 후 수정
   ```

---

**문서 상태**: 🔄 진행 중  
**최종 수정**: 2026-04-27  
**다음 검토**: 배포 완료 후 (2026-04-27 저녁)
