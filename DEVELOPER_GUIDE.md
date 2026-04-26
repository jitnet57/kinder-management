# 💻 AKMS 개발자 가이드

> **개발 환경 셋업, 코드 컨벤션, 기능 추가 방법, 디버깅 팁**

---

## 📋 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [프로젝트 구조](#프로젝트-구조)
3. [코드 컨벤션](#코드-컨벤션)
4. [새로운 기능 추가 방법](#새로운-기능-추가-방법)
5. [Context API 사용법](#context-api-사용법)
6. [API 호출 패턴](#api-호출-패턴)
7. [테스트 작성 가이드](#테스트-작성-가이드)
8. [디버깅 팁](#디버깅-팁)
9. [성능 최적화](#성능-최적화)
10. [배포 전 체크리스트](#배포-전-체크리스트)

---

## 개발 환경 설정

### 1️⃣ 사전 요구사항

```bash
# 필수
- Node.js 18.x 이상
- npm 9.x 이상 (또는 yarn)
- Git
- VS Code (권장) + 확장:
  ├─ ESLint
  ├─ Prettier
  ├─ Thunder Client (API 테스트)
  └─ React Developer Tools

# 선택
- Docker & Docker Compose
- PostgreSQL 14+ (로컬 DB)
- Redis (캐싱 테스트)
```

### 2️⃣ 저장소 클론 및 설정

```bash
# 저장소 클론
git clone https://github.com/jitnet57/kinder-management.git
cd kinder-management

# 모든 의존성 설치
npm install

# 프론트엔드 의존성
cd frontend
npm install
cd ..

# 백엔드 의존성
cd backend
npm install
cd ..
```

### 3️⃣ 환경 변수 설정

**파일**: `/root/.env.local` (모든 환경이 사용)

```bash
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/akms_dev
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
LOG_LEVEL=debug

# Frontend
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=AKMS
VITE_DEBUG=true
```

**파일**: `/backend/.env` (백엔드 전용)

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/akms_dev
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
API_PORT=3001
CORS_ORIGIN=http://localhost:3000
```

**파일**: `/frontend/.env` (프론트엔드 전용)

```bash
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=AKMS
VITE_DEBUG=true
```

### 4️⃣ 데이터베이스 초기화

```bash
cd backend

# Prisma Client 생성
npm run prisma:generate

# 데이터베이스 마이그레이션
npm run prisma:migrate -- --name init

# 샘플 데이터 추가 (선택)
npm run prisma:seed

cd ..
```

### 5️⃣ 개발 서버 시작

```bash
# 루트 디렉토리에서 동시 시작
npm run dev

# 또는 개별 시작
# 터미널 1: 백엔드
cd backend && npm run dev

# 터미널 2: 프론트엔드
cd frontend && npm run dev
```

**서버 접근**:
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:3001
- API 문서: http://localhost:3001/api/docs (Swagger)

---

## 프로젝트 구조

### 디렉토리 레이아웃

```
kinder-management/
│
├── frontend/
│   ├── src/
│   │   ├── pages/              # 라우트별 페이지 (15+ 파일)
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Schedule.tsx
│   │   │   ├── Children.tsx
│   │   │   ├── ABCAnalysis.tsx
│   │   │   ├── Messages.tsx
│   │   │   └─ ...
│   │   │
│   │   ├── components/         # 재사용 UI 컴포넌트 (100+ 파일)
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ChildCard.tsx
│   │   │   ├── SessionModal.tsx
│   │   │   └─ ...
│   │   │
│   │   ├── context/            # Context API (8개)
│   │   │   ├── CurriculumContext.tsx
│   │   │   ├── MessageContext.tsx
│   │   │   ├── ABCContext.tsx
│   │   │   ├── CollaborativeDashboardContext.tsx
│   │   │   ├── AnalyticsContext.tsx
│   │   │   ├── NotificationContext.tsx
│   │   │   ├── MessageContext.tsx
│   │   │   └── ScheduleContext.tsx
│   │   │
│   │   ├── hooks/              # 커스텀 React 훅
│   │   │   ├── useAuth.ts
│   │   │   ├── useFetch.ts
│   │   │   ├── useDebounce.ts
│   │   │   └─ ...
│   │   │
│   │   ├── types/              # TypeScript 인터페이스
│   │   │   └── index.ts         # 252개 LTO 정의 포함
│   │   │
│   │   ├── utils/              # 유틸리티 함수
│   │   │   ├── api.ts           # API 호출 래퍼
│   │   │   ├── storage.ts       # localStorage 관리
│   │   │   ├── validators.ts    # Zod 스키마
│   │   │   └─ ...
│   │   │
│   │   ├── data/               # 정적 데이터
│   │   │   ├── curriculum.json  # 252개 LTO 데이터
│   │   │   └─ ...
│   │   │
│   │   ├── styles/             # 전역 스타일
│   │   │   ├── index.css
│   │   │   └─ variables.css
│   │   │
│   │   ├── App.tsx             # 메인 App 컴포넌트
│   │   └── main.tsx            # Entry point
│   │
│   ├── public/                 # 정적 자산
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/             # API 엔드포인트 (30+ 파일)
│   │   │   ├── auth.ts
│   │   │   ├── children.ts
│   │   │   ├── sessions.ts
│   │   │   ├── messages.ts
│   │   │   ├── analysis.ts
│   │   │   └─ ...
│   │   │
│   │   ├── middleware/         # 인증, 검증 미들웨어
│   │   │   ├── auth.ts
│   │   │   ├── validation.ts
│   │   │   └─ ...
│   │   │
│   │   ├── services/           # 비즈니스 로직
│   │   │   ├── userService.ts
│   │   │   ├── childService.ts
│   │   │   ├── analysisService.ts
│   │   │   └─ ...
│   │   │
│   │   ├── types/              # TypeScript 인터페이스
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts            # 메인 서버 파일
│   │
│   ├── prisma/
│   │   ├── schema.prisma       # DB 스키마 정의
│   │   ├── migrations/         # DB 마이그레이션 파일
│   │   └── seed.ts             # 샘플 데이터
│   │
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                       # 문서
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── USER_GUIDE.md
│   ├── DEVELOPER_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── API_REFERENCE.md
│   ├── FEATURES_CHECKLIST.md
│   └── CHANGELOG.md
│
├── scripts/                    # 자동화 스크립트
│   ├── setup.sh
│   ├── migrate.sh
│   └─ ...
│
└── package.json                # 루트 패키지
```

---

## 코드 컨벤션

### 1️⃣ 파일 & 폴더 네이밍

```typescript
// ✅ 좋은 예시

// 컴포넌트: PascalCase
/components/ChildCard.tsx
/components/SessionModal.tsx
/pages/ABCAnalysis.tsx

// Context: PascalCase + Context
/context/CurriculumContext.tsx
/context/MessageContext.tsx

// 훅: camelCase + use 접두사
/hooks/useAuth.ts
/hooks/useFetch.ts
/hooks/useDebounce.ts

// 유틸: camelCase
/utils/api.ts
/utils/storage.ts
/utils/validators.ts

// 타입: PascalCase
/types/index.ts (내 Child, Message, etc.)

// 데이터: kebab-case
/data/curriculum.json
/data/sample-children.json

// ❌ 나쁜 예시
/components/childcard.tsx      # 소문자
/hooks/AuthHook.ts             # use 접두사 없음
/utilities/api.ts              # utils 아님
```

### 2️⃣ TypeScript 컨벤션

```typescript
// ✅ 인터페이스 정의
interface Child {
  id: number;
  name: string;
  age: number;
  birthDate: string;
  color: string;
}

// ✅ Type 사용 (간단한 경우)
type ChildStatus = 'active' | 'inactive' | 'archived';
type Score = number; // 0-100

// ✅ 함수 타입 정의
interface ChildService {
  getChild(id: number): Promise<Child>;
  updateChild(id: number, updates: Partial<Child>): Promise<void>;
  deleteChild(id: number): Promise<void>;
}

// ❌ any 사용 금지
const child: any = {}; // 절대 금지!

// ✅ unknown 또는 구체적인 타입
const child: Child | null = null;
```

### 3️⃣ React 컴포넌트 작성

```typescript
// ✅ 함수형 컴포넌트 (호크 사용)
interface ChildCardProps {
  child: Child;
  onClick?: (id: number) => void;
  onEdit?: (child: Child) => void;
}

export const ChildCard: React.FC<ChildCardProps> = ({
  child,
  onClick,
  onEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  return (
    <div className="card" onClick={() => onClick?.(child.id)}>
      <h3>{child.name}</h3>
      <button onClick={handleEdit}>편집</button>
    </div>
  );
};

// ❌ 피해야 할 것
// 1. 클래스 컴포넌트 사용
// 2. Props를 직접 뮤테이션
// 3. 부작용을 render 함수에 작성
```

### 4️⃣ Context API 사용

```typescript
// ✅ Context 정의
interface CurriculumContextType {
  children: Child[];
  fetchChildren: () => Promise<void>;
  addChild: (child: Omit<Child, 'id'>) => Promise<Child>;
}

export const CurriculumContext = createContext<CurriculumContextType | undefined>(
  undefined
);

// ✅ Provider 컴포넌트
export const CurriculumProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [childrenData, setChildrenData] = useState<Child[]>([]);

  const fetchChildren = useCallback(async () => {
    const response = await fetch('/api/children');
    setChildrenData(await response.json());
  }, []);

  const value: CurriculumContextType = {
    children: childrenData,
    fetchChildren,
    addChild: async (child) => {
      const response = await fetch('/api/children', {
        method: 'POST',
        body: JSON.stringify(child),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    }
  };

  return (
    <CurriculumContext.Provider value={value}>
      {children}
    </CurriculumContext.Provider>
  );
};

// ✅ 커스텀 훅
export const useCurriculum = (): CurriculumContextType => {
  const context = useContext(CurriculumContext);
  if (!context) {
    throw new Error('useCurriculum must be used within CurriculumProvider');
  }
  return context;
};
```

### 5️⃣ 비동기 작업

```typescript
// ✅ async/await 사용
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error('Error:', error);
    setError(error instanceof Error ? error.message : 'Unknown error');
  }
};

// ✅ useEffect에서 비동기 작업
useEffect(() => {
  const loadData = async () => {
    try {
      const result = await fetchData();
      setData(result);
    } catch (error) {
      setError(error);
    }
  };

  loadData();
}, []);

// ❌ 피해야 할 것
// useEffect(async () => { ... }) // 절대 금지!
```

### 6️⃣ 스타일링 (Tailwind CSS)

```tsx
// ✅ Tailwind 클래스 사용
export const Button = ({ children, variant = 'primary' }: Props) => {
  const variants = {
    primary: 'bg-purple-500 hover:bg-purple-600 text-white',
    secondary: 'bg-teal-500 hover:bg-teal-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };

  return (
    <button className={`px-4 py-2 rounded-lg transition ${variants[variant]}`}>
      {children}
    </button>
  );
};

// ❌ 인라인 스타일 금지
const style = { color: 'purple', fontSize: '16px' }; // 절대 금지!

// ✅ CSS 변수 활용 (colors)
// Tailwind 기본색: purple, teal, pink, orange, blue 등
```

---

## 새로운 기능 추가 방법

### 예시: 새 페이지 추가 ("학습 보고서")

#### Step 1: 타입 정의

**파일**: `/frontend/src/types/index.ts`

```typescript
// 추가할 인터페이스
export interface LearningReport {
  id: string;
  childId: number;
  period: 'weekly' | 'monthly' | 'quarterly';
  startDate: string;
  endDate: string;
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  domainBreakdown: DomainScore[];
  milestones: Milestone[];
  insights: string[];
  generatedAt: string;
}

export interface DomainScore {
  domainId: string;
  domainName: string;
  score: number;
  progress: number; // 0-100
}
```

#### Step 2: Context 생성 (필요시)

**파일**: `/frontend/src/context/ReportContext.tsx`

```typescript
interface ReportContextType {
  reports: LearningReport[];
  fetchReports: (childId: number) => Promise<void>;
  generateReport: (childId: number, period: 'weekly' | 'monthly') => Promise<LearningReport>;
  downloadReport: (reportId: string, format: 'pdf' | 'excel') => Promise<void>;
}

export const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<LearningReport[]>([]);

  const fetchReports = useCallback(async (childId: number) => {
    const data = await fetch(`/api/reports?childId=${childId}`);
    setReports(await data.json());
  }, []);

  const generateReport = useCallback(async (childId: number, period: string) => {
    const response = await fetch('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ childId, period }),
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }, []);

  const value: ReportContextType = {
    reports,
    fetchReports,
    generateReport,
    downloadReport: async (reportId, format) => {
      const url = `/api/reports/${reportId}/download?format=${format}`;
      window.location.href = url;
    }
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) throw new Error('useReport must be used within ReportProvider');
  return context;
};
```

#### Step 3: 페이지 컴포넌트 생성

**파일**: `/frontend/src/pages/LearningReport.tsx`

```typescript
export const LearningReport: React.FC = () => {
  const { reports, fetchReports, generateReport } = useReport();
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!selectedChild) return;
    setIsGenerating(true);
    try {
      await generateReport(selectedChild, period);
      await fetchReports(selectedChild);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedChild, period, generateReport, fetchReports]);

  useEffect(() => {
    if (selectedChild) {
      fetchReports(selectedChild);
    }
  }, [selectedChild, fetchReports]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">학습 보고서</h1>

      {/* 아동 선택 */}
      <select
        value={selectedChild || ''}
        onChange={(e) => setSelectedChild(Number(e.target.value))}
        className="mb-4 p-2 border rounded"
      >
        <option value="">아동 선택</option>
        {/* 아동 옵션 */}
      </select>

      {/* 기간 선택 */}
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value as 'weekly' | 'monthly')}
        className="mb-4 p-2 border rounded ml-2"
      >
        <option value="weekly">주간</option>
        <option value="monthly">월간</option>
      </select>

      {/* 생성 버튼 */}
      <button
        onClick={handleGenerate}
        disabled={!selectedChild || isGenerating}
        className="mb-6 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
      >
        {isGenerating ? '생성 중...' : '보고서 생성'}
      </button>

      {/* 보고서 목록 */}
      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
};
```

#### Step 4: 백엔드 API 추가

**파일**: `/backend/src/routes/reports.ts`

```typescript
import { Hono } from 'hono';
import { auth } from '../middleware/auth';
import { z } from 'zod';

const reportSchema = z.object({
  childId: z.number(),
  period: z.enum(['weekly', 'monthly'])
});

export const reportsRoute = new Hono();

// GET /api/reports?childId=1
reportsRoute.get('/', auth, async (c) => {
  const childId = parseInt(c.req.query('childId') || '0');
  
  // Prisma 쿼리
  const reports = await prisma.learningReport.findMany({
    where: { childId },
    orderBy: { generatedAt: 'desc' }
  });
  
  return c.json(reports);
});

// POST /api/reports (생성)
reportsRoute.post('/', auth, async (c) => {
  const body = await c.req.json();
  const { childId, period } = reportSchema.parse(body);

  // 비즈니스 로직
  const report = await generateLearningReport(childId, period);

  return c.json(report, 201);
});

// GET /api/reports/:id/download?format=pdf
reportsRoute.get('/:id/download', auth, async (c) => {
  const reportId = c.req.param('id');
  const format = c.req.query('format') || 'pdf';

  // PDF/Excel 생성 로직
  const buffer = await generatePDF(reportId);

  return c.body(buffer, 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="report-${reportId}.pdf"`
  });
});
```

#### Step 5: 라우팅 추가

**파일**: `/frontend/src/App.tsx`

```typescript
import { LearningReport } from './pages/LearningReport';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기존 라우트 */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 새 라우트 추가 */}
        <Route path="/learning-report" element={<LearningReport />} />
      </Routes>
    </BrowserRouter>
  );
};
```

#### Step 6: 메뉴에 추가

**파일**: `/frontend/src/components/Sidebar.tsx`

```typescript
<nav>
  <Link to="/dashboard">대시보드</Link>
  <Link to="/schedule">스케줄</Link>
  <Link to="/learning-report">📊 학습 보고서</Link>
  {/* ... */}
</nav>
```

---

## Context API 사용법

### 기본 패턴

```typescript
// 1. Provider를 App.tsx에서 래핑
<CurriculumProvider>
  <MessageProvider>
    <ABCProvider>
      <Routes>
        {/* ... */}
      </Routes>
    </ABCProvider>
  </MessageProvider>
</CurriculumProvider>

// 2. 컴포넌트에서 사용
const MyComponent = () => {
  const { children, addChild } = useCurriculum();
  const { messages, sendMessage } = useMessage();

  // 사용...
};
```

### 성능 최적화 팁

```typescript
// ✅ 필요한 값만 반환
const value = useMemo(
  () => ({
    children,
    fetchChildren,
    addChild
  }),
  [children, fetchChildren, addChild]
);

// ✅ useCallback으로 함수 메모이제이션
const fetchChildren = useCallback(async () => {
  // ...
}, [dependencyArray]);

// ✅ 상태 분리 (큰 Context는 여러 Context로 분리)
<ChildrenContext> {/* 아동 데이터 */}
<SessionLogContext> {/* 세션 로그 */}
<AnalyticsContext> {/* 분석 데이터 */}

// ❌ 피해야 할 것: 모든 상태를 한 Context에
```

---

## API 호출 패턴

### 표준 패턴

```typescript
// ✅ 재사용 가능한 API 래퍼
const api = {
  async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },

  get<T>(url: string) {
    return this.request<T>(url, { method: 'GET' });
  },

  post<T>(url: string, body: any) {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put<T>(url: string, body: any) {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete<T>(url: string) {
    return this.request<T>(url, { method: 'DELETE' });
  }
};

// ✅ 사용
const children = await api.get<Child[]>('/api/children');
const newChild = await api.post<Child>('/api/children', { name: '민준' });
```

### 에러 처리

```typescript
// ✅ 일관된 에러 처리
try {
  const result = await api.get('/api/data');
  setData(result);
} catch (error) {
  if (error instanceof Error) {
    setError(error.message);
  } else {
    setError('Unknown error occurred');
  }
}
```

---

## 테스트 작성 가이드

### 컴포넌트 테스트 (Jest + React Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ChildCard } from './ChildCard';

describe('ChildCard', () => {
  const mockChild = {
    id: 1,
    name: '민준',
    age: 3,
    birthDate: '2021-01-15',
    color: '#FFB6D9',
    phone: '010-1234-5678',
    address: '서울시'
  };

  it('should render child name', () => {
    render(<ChildCard child={mockChild} />);
    expect(screen.getByText('민준')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<ChildCard child={mockChild} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('민준'));
    expect(handleClick).toHaveBeenCalledWith(1);
  });

  it('should render edit button', () => {
    render(<ChildCard child={mockChild} />);
    expect(screen.getByRole('button', { name: /편집/i })).toBeInTheDocument();
  });
});
```

### Context 테스트

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { CurriculumProvider, useCurriculum } from './CurriculumContext';

describe('CurriculumContext', () => {
  it('should fetch children', async () => {
    const wrapper = ({ children }: any) => (
      <CurriculumProvider>{children}</CurriculumProvider>
    );

    const { result } = renderHook(() => useCurriculum(), { wrapper });

    act(() => {
      result.current.fetchChildren();
    });

    await waitFor(() => {
      expect(result.current.children).toHaveLength(4);
    });
  });
});
```

---

## 디버깅 팁

### 1️⃣ 브라우저 디버깅

```typescript
// ✅ 콘솔 로깅
console.log('렌더링됨:', { data, loading });

// ✅ 중단점 설정 (F12 → Sources)
debugger; // 코드에 추가

// ✅ React DevTools
// Chrome: React DevTools 확장 설치
// 주요 기능:
// - Components 탭: 컴포넌트 트리 보기
// - Profiler 탭: 성능 분석
// - Props/State 확인 및 수정
```

### 2️⃣ 백엔드 디버깅

```typescript
// ✅ 로깅
console.log('요청:', { method, url, body });

// ✅ 에러 로깅
console.error('DB 에러:', error);

// ✅ 요청/응답 검사 (VS Code Thunder Client)
// 또는 Postman/Insomnia 사용
GET http://localhost:3001/api/children
Authorization: Bearer <token>
```

### 3️⃣ 상태 추적

```typescript
// ✅ Context 상태 추적
const { children, loading } = useCurriculum();
useEffect(() => {
  console.log('상태 변경:', { children, loading });
}, [children, loading]);

// ✅ API 응답 로깅
const fetchChildren = async () => {
  console.log('요청 시작');
  try {
    const data = await api.get('/api/children');
    console.log('응답:', data);
  } catch (error) {
    console.error('에러:', error);
  }
};
```

---

## 성능 최적화

### 1️⃣ 번들 크기 최적화

```bash
# 번들 크기 분석
npm run build -- --analyze

# 불필요한 의존성 제거
npm ls
npm prune
```

### 2️⃣ 렌더링 최적화

```typescript
// ✅ React.memo로 불필요한 리렌더링 방지
export const ChildCard = React.memo(({ child }: Props) => {
  return <div>{child.name}</div>;
});

// ✅ useMemo로 계산 결과 메모이제이션
const sortedChildren = useMemo(
  () => children.sort((a, b) => a.name.localeCompare(b.name)),
  [children]
);

// ✅ useCallback으로 함수 메모이제이션
const handleClick = useCallback((id: number) => {
  // ...
}, [dependency]);
```

### 3️⃣ 이미지 최적화

```typescript
// ✅ Next Image 또는 img with srcSet
<img
  src="image.jpg"
  srcSet="image-300w.jpg 300w, image-600w.jpg 600w"
  sizes="(max-width: 600px) 300px, 600px"
  alt="Child photo"
/>
```

---

## 배포 전 체크리스트

- [ ] 모든 TypeScript 타입 검증 (`npm run type-check`)
- [ ] 린팅 통과 (`npm run lint`)
- [ ] 테스트 통과 (`npm run test`)
- [ ] 번들 크기 확인 (`npm run build`)
- [ ] 환경 변수 설정 확인 (`.env.production`)
- [ ] API 엔드포인트 테스트 (Postman/Thunder Client)
- [ ] 역할별 접근 제어 테스트 (Admin/Therapist/Parent)
- [ ] 모바일 반응형 확인
- [ ] 브라우저 호환성 확인 (Chrome, Firefox, Safari)
- [ ] 보안 헤더 검증 (HTTPS, CORS, CSP)
- [ ] 성능 메트릭 확인 (< 3초 로딩)

---

**마지막 업데이트**: 2026-04-27  
**문서 버전**: 2.0 (Phase 5 P3)

다른 문서를 참조하세요:
- 📖 [README.md](README.md) — 프로젝트 개요
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) — 시스템 구조
- 👥 [USER_GUIDE.md](USER_GUIDE.md) — 사용자 가이드
- 🚀 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — 배포
- 📚 [API_REFERENCE.md](API_REFERENCE.md) — API 명세
