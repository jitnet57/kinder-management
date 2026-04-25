# 아동관리 ABA 웹앱 | 에픽 & 스토리 분할

**작성자**: Bob (Scrum Master) | **날짜**: 2026-04-26  
**Status**: Phase 3 구조화 완료 ✓

---

## 📌 에픽 & 스토리 매핑

### Epic 1: 사용자 인증 & 기초 셋업

**설명**: 사용자 로그인, 권한 관리, 기본 레이아웃 구성  
**예상 기간**: 1주  
**우선순위**: P0 (Blocker)

#### Story 1.1: 회원가입 & 로그인 UI
```
As a user
I want to register and login
So that I can access the system securely

Acceptance Criteria:
- [ ] Register form (email, password, confirm)
- [ ] Login form (email, password)
- [ ] Validation (email format, password strength)
- [ ] Error messages (clear)
- [ ] Redirect to dashboard after login

Subtasks:
  - Design login/register page (UX)
  - Build form components
  - Connect to /auth endpoints
  - Test with invalid inputs

Estimate: 5pts
Owner: FE Lead
```

#### Story 1.2: JWT 토큰 관리 & API 클라이언트
```
As a developer
I want JWT authentication with httpOnly cookies
So that sessions are secure

Acceptance Criteria:
- [ ] Login endpoint returns JWT token
- [ ] Token stored in httpOnly cookie
- [ ] API client auto-includes token
- [ ] Token refresh logic (if expired)
- [ ] Logout clears session

Subtasks:
  - Create /api/auth endpoints (BE)
  - Setup JWT middleware
  - Test with Postman
  - Document auth flow

Estimate: 8pts
Owner: BE Lead
```

#### Story 1.3: 대시보드 레이아웃 & 네비게이션
```
As a user
I want to see main dashboard with navigation
So that I can access all modules easily

Acceptance Criteria:
- [ ] Top header with logo + user menu
- [ ] Left sidebar with nav items (6 items)
- [ ] Responsive on mobile (hamburger)
- [ ] Active nav highlight
- [ ] Logout button works

Subtasks:
  - Design layout in Figma
  - Create Layout component
  - Add routing setup
  - Style with Tailwind + glassmorphism

Estimate: 5pts
Owner: FE Lead
```

---

### Epic 2: 아동정보 관리

**설명**: CRUD 아동정보, 파일 업로드, 검색  
**예상 기간**: 1.5주  
**우선순위**: P0 (Core)

#### Story 2.1: 아동정보 카드 그리드 & 검색
```
As an admin
I want to view all children in a card grid
So that I can manage them easily

Acceptance Criteria:
- [ ] Display children as 4-col grid (desktop)
- [ ] Responsive: 2-col (tablet), 1-col (mobile)
- [ ] Search by child name (live filter)
- [ ] Sort by name/created date
- [ ] Empty state message

Subtasks:
  - GET /children endpoint (BE)
  - ChildCard component (FE)
  - Search input + filter logic
  - Skeleton loaders
  - Mobile responsive test

Estimate: 8pts
Owner: FE + BE
```

#### Story 2.2: 아동정보 추가/수정 모달
```
As an admin
I want to add/edit child info
So that I can manage child profiles

Acceptance Criteria:
- [ ] Form fields: name, DOB, phone, address, notes
- [ ] Save button (validation before save)
- [ ] Cancel button (discard changes)
- [ ] Auto-assign color (from palette)
- [ ] Success toast after save

Subtasks:
  - POST /children endpoint (BE)
  - PUT /children/:id endpoint (BE)
  - Modal form component (FE)
  - Form validation (Zod schema)
  - Test CRUD flow

Estimate: 8pts
Owner: FE + BE
```

#### Story 2.3: 파일 업로드 (아동 프로필 사진)
```
As an admin
I want to upload child profile photo
So that I can store visual reference

Acceptance Criteria:
- [ ] File input (accept jpg/png)
- [ ] Max file size: 5MB
- [ ] Preview before upload
- [ ] Upload to S3 (R2)
- [ ] Store fileId in child.attachments

Subtasks:
  - S3 client setup (AWS SDK)
  - POST /children/:id/upload endpoint (BE)
  - File input component (FE)
  - Error handling (too large, format)
  - Delete file option

Estimate: 8pts
Owner: FE + BE
```

#### Story 2.4: 아동정보 삭제
```
As an admin
I want to delete a child record
So that I can remove inactive children

Acceptance Criteria:
- [ ] Delete button on card
- [ ] Confirm modal before delete
- [ ] DELETE /children/:id endpoint
- [ ] Success message after delete
- [ ] Cascade delete: schedules, logs

Subtasks:
  - Confirm modal component
  - DELETE endpoint with cascade
  - Update card grid after delete
  - Test cascade delete

Estimate: 3pts
Owner: FE + BE
```

---

### Epic 3: 스케줄 관리 (주간 시간표)

**설명**: 월-토 시간표 UI, 일정 추가/수정/삭제, 색상 코딩  
**예상 기간**: 2주  
**우선순위**: P0 (Core)

#### Story 3.1: 주간 시간표 테이블 UI
```
As a user
I want to see a weekly schedule table
So that I can visualize all sessions at once

Acceptance Criteria:
- [ ] 7-row table (time slots: 8-10, 10-12, 2-4, 4-6 AM/PM)
- [ ] 6-col table (MON-SAT)
- [ ] Display child name + session name in cells
- [ ] Color-coded by child
- [ ] Hover effect (shadow, opacity)

Subtasks:
  - Design table structure
  - Create ScheduleTable component
  - Style cells with Tailwind
  - Glassmorphism effect
  - Responsive test

Estimate: 8pts
Owner: FE Lead
```

#### Story 3.2: 스케줄 CRUD (추가/수정/삭제)
```
As a user
I want to add/edit/delete schedules
So that I can manage weekly timetable

Acceptance Criteria:
- [ ] Click cell → Modal (new schedule)
- [ ] Click schedule → Popup menu (edit/delete)
- [ ] Form: child, session name, time range
- [ ] Prevent conflicts (same child, same time)
- [ ] Save/Cancel buttons

Subtasks:
  - POST /schedules endpoint (BE)
  - PUT /schedules/:id endpoint (BE)
  - DELETE /schedules/:id endpoint (BE)
  - Modal + popup component (FE)
  - Conflict detection logic
  - Test edge cases

Estimate: 13pts
Owner: FE + BE
```

#### Story 3.3: 다중 선택 & 일괄 편집
```
As a user
I want to select multiple schedules
So that I can delete/edit them in bulk

Acceptance Criteria:
- [ ] Ctrl+Click to select (or checkbox)
- [ ] Show "3 selected" counter
- [ ] Batch delete button (with confirm)
- [ ] Batch edit time (if needed)
- [ ] Update table after action

Subtasks:
  - Add checkbox to cells
  - Selection state management (Zustand)
  - POST /schedules/batch-delete endpoint
  - POST /schedules/batch-update endpoint
  - UI for batch actions

Estimate: 8pts
Owner: FE + BE
```

#### Story 3.4: 주간 네비게이션
```
As a user
I want to navigate between weeks
So that I can view past/future schedules

Acceptance Criteria:
- [ ] "Previous" / "This week" / "Next" buttons
- [ ] Display week range (Mon-Sat dates)
- [ ] Highlight current week
- [ ] Fetch schedules for selected week

Subtasks:
  - Add week navigation UI
  - Implement date logic (moment/date-fns)
  - GET /schedules?week=xxx endpoint (BE)
  - Update table on week change

Estimate: 5pts
Owner: FE + BE
```

---

### Epic 4: 데이터 기록지 (일일 세션 로그)

**설명**: 아동별 과제 기록, 점수 입력, 7일 그래프  
**예상 기간**: 2주  
**우선순위**: P0 (Core)

#### Story 4.1: 아동별 데이터 기록지 진입
```
As a user
I want to click a child name to view their session logs
So that I can record daily performance

Acceptance Criteria:
- [ ] Click child card → Open session log page
- [ ] Show child name + date selector
- [ ] Display all assigned curriculum (dropdowns)
- [ ] Empty state if no curriculum assigned

Subtasks:
  - Create SessionLog page component
  - Add routing: /child/:childId/logs
  - Date picker component
  - Fetch child curriculum list

Estimate: 5pts
Owner: FE
```

#### Story 4.2: 과제 카드 & 점수 입력
```
As a user
I want to enter session scores for each task
So that I can track daily performance

Acceptance Criteria:
- [ ] Card per curriculum (task name)
- [ ] Fields: score (0-100), notes, time
- [ ] Input validation (0-100)
- [ ] Save button per card
- [ ] Success toast

Subtasks:
  - SessionLogCard component
  - POST /session-logs endpoint (BE)
  - Score input validation
  - Time picker (optional)
  - Loading state while saving

Estimate: 8pts
Owner: FE + BE
```

#### Story 4.3: 과제별 7일 추세 그래프
```
As a user
I want to see a 7-day trend graph per task
So that I can track improvement

Acceptance Criteria:
- [ ] "Graph" button on each card
- [ ] Modal with line chart (Recharts)
- [ ] X-axis: last 7 days
- [ ] Y-axis: score (0-100)
- [ ] Show average + trend arrow (↑/→)

Subtasks:
  - GET /session-logs/trend?curriculumId=xxx&days=7 (BE)
  - ChartModal component (FE)
  - Recharts line chart setup
  - Date formatting
  - Test with mock data

Estimate: 8pts
Owner: FE + BE
```

#### Story 4.4: 세션로그 수정/삭제
```
As a user
I want to edit or delete a session log
So that I can correct mistakes

Acceptance Criteria:
- [ ] Edit button on card (re-open form)
- [ ] Delete button with confirm modal
- [ ] PUT /session-logs/:id endpoint
- [ ] DELETE /session-logs/:id endpoint
- [ ] Update card after edit

Subtasks:
  - Edit modal component
  - Confirm delete modal
  - PUT/DELETE endpoints (BE)
  - Optimistic update (FE)

Estimate: 5pts
Owner: FE + BE
```

---

### Epic 5: 완료목록

**설명**: 세션 로그의 완료 추적, 필터링, 리포팅  
**예상 기간**: 1주  
**우선순위**: P1 (Nice to have)

#### Story 5.1: 완료목록 테이블 & 필터
```
As an admin
I want to see a list of completed sessions
So that I can track weekly progress

Acceptance Criteria:
- [ ] Table: child, task, completion time
- [ ] Filter by: child, date range, task
- [ ] Completion rate badge (87%)
- [ ] Sort by date (newest)

Subtasks:
  - GET /completions endpoint (BE)
  - CompletionTable component (FE)
  - Filter UI + state management
  - Aggregate completion_log data

Estimate: 8pts
Owner: FE + BE
```

---

### Epic 6: 커리큘럼 관리

**설명**: 트리형 커리큘럼(도메인-LTO-STO), CRUD  
**예상 기간**: 1.5주  
**우선순위**: P1 (Core)

#### Story 6.1: 커리큘럼 트리 뷰
```
As an admin
I want to manage curriculum as a tree (Domain > LTO > STO)
So that I can structure learning goals

Acceptance Criteria:
- [ ] Collapsible tree view (expand/collapse)
- [ ] Add domain / LTO / STO buttons
- [ ] Edit button per node
- [ ] Delete button with confirm

Subtasks:
  - CurriculumTree component
  - GET /curriculum endpoint (BE)
  - Tree data structure logic
  - Expand/collapse state
  - Styling (indentation, icons)

Estimate: 10pts
Owner: FE + BE
```

#### Story 6.2: 커리큘럼 CRUD
```
As an admin
I want to add/edit/delete curriculum items
So that I can customize learning goals

Acceptance Criteria:
- [ ] POST /curriculum endpoint (create)
- [ ] PUT /curriculum/:id endpoint (edit)
- [ ] DELETE /curriculum/:id endpoint
- [ ] Modal form: domain, LTO, STO, notes
- [ ] Validation (required fields)

Subtasks:
  - Form component with modal
  - API endpoints (BE)
  - Cascading delete (optional)
  - Success messages

Estimate: 8pts
Owner: FE + BE
```

#### Story 6.3: 커리큘럼과 세션로그 연동
```
As a user
I want to select curriculum from a dropdown in session logs
So that I can quickly assign tasks

Acceptance Criteria:
- [ ] Dropdown in SessionLogCard
- [ ] Shows child's assigned curriculum
- [ ] On selection, score field appears
- [ ] Can add new curriculum on-the-fly (optional)

Subtasks:
  - Dropdown component
  - Fetch assigned curriculum per child
  - Connect to session log form
  - Test assignment flow

Estimate: 5pts
Owner: FE
```

---

## 📊 스토리 포인트 요약 & 일정

| Epic | 스토리 수 | 예상 포인트 | 기간 | 담당 |
|------|----------|----------|------|-----|
| Epic 1: Auth | 3 | 18 | 1주 | FE + BE |
| Epic 2: Child | 4 | 27 | 1.5주 | FE + BE |
| Epic 3: Schedule | 4 | 34 | 2주 | FE + BE |
| Epic 4: SessionLog | 4 | 29 | 2주 | FE + BE |
| Epic 5: Completion | 1 | 8 | 1주 | FE + BE |
| Epic 6: Curriculum | 3 | 23 | 1.5주 | FE + BE |
| **총합** | **19** | **139** | **9주** | |

**참고**: 2주당 ~40pts 처리 가능 기준 → 약 7주 소요

---

## 🎯 Sprint 계획 (시뮬레이션)

```
Sprint 1 (1주)
├─ Epic 1: Auth (18pts)
└─ Epic 2.1-2.2: Child CRUD (16pts)
  Velocity: 34pts

Sprint 2 (1주)
├─ Epic 2.3-2.4: Child file + delete (11pts)
└─ Epic 3.1-3.2: Schedule table + CRUD (21pts)
  Velocity: 32pts

Sprint 3 (1주)
├─ Epic 3.3-3.4: Schedule batch + nav (13pts)
├─ Epic 4.1-4.2: SessionLog entry (13pts)
  Velocity: 26pts

Sprint 4 (1주)
├─ Epic 4.3-4.4: SessionLog graph + edit (13pts)
├─ Epic 5.1: Completion list (8pts)
└─ Epic 6.1: Curriculum tree (10pts)
  Velocity: 31pts

Sprint 5 (1주)
├─ Epic 6.2-6.3: Curriculum CRUD + linkage (13pts)
└─ Buffer: Testing, Fixes (remaining pts)
  Velocity: TBD (QA phase)

Total: ~5주 개발 + 2주 테스트 = 7주
```

---

## 📋 Definition of Done (DoD)

각 스토리가 완료되려면:

- [x] 코드 작성 (feature branch)
- [x] 유닛 테스트 (80% 커버리지)
- [x] 코드 리뷰 (최소 1명)
- [x] 스테이징에서 수동 테스트
- [x] Acceptance Criteria 모두 충족
- [x] PR 머지 & 메인 배포
- [x] 릴리스 노트 작성

---

**다음 단계**: Phase 4 개발 시작 → Dev (Amelia) 리드

