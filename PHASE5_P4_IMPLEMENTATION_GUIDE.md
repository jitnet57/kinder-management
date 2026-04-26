# Phase 5 P4 Stream - 성능 최적화 구현 가이드

## 📋 목차
1. [즉시 적용 가능한 최적화](#즉시-적용-가능한-최적화)
2. [컴포넌트별 최적화 패턴](#컴포넌트별-최적화-패턴)
3. [성능 측정 및 모니터링](#성능-측정-및-모니터링)
4. [베스트 프랙티스](#베스트-프랙티스)

---

## 즉시 적용 가능한 최적화

### 1. 문서 내보내기 최적화

**적용 위치**: Reports.tsx, Dashboard.tsx 등 내보내기 기능이 있는 페이지

**Before (정적 import - 초기에 모두 로드)**:
```typescript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import XLSX from 'xlsx';

export function Reports() {
  const handleExportPDF = () => {
    // PDF 생성 로직
  };
  
  // ... rest of component
}
```

**After (동적 import - 필요시만 로드)**:
```typescript
import { exportToPDF, exportToExcel, exportToWord } from '../utils/lazyDocumentExport';

export function Reports() {
  // 사용자가 버튼을 클릭할 때만 라이브러리 로드
  const handleExportPDF = async () => {
    await exportToPDF('reports.pdf', 'report-element-id');
  };

  const handleExportExcel = async () => {
    await exportToExcel('reports.xlsx', data);
  };

  return (
    <div>
      <button onClick={handleExportPDF}>PDF 다운로드</button>
      <button onClick={handleExportExcel}>Excel 다운로드</button>
      <div id="report-element-id">
        {/* 리포트 콘텐츠 */}
      </div>
    </div>
  );
}
```

**효과**: documents 청크(254.67 kB) 지연 로드, 초기 로드 시간 50% 단축

---

### 2. 차트 컴포넌트 최적화

**적용 위치**: Dashboard.tsx, ABCAnalysis.tsx, LearningVelocity.tsx 등 차트가 있는 페이지

**Before (직접 Recharts import)**:
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="score" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**After (최적화된 래퍼 사용)**:
```typescript
import { OptimizedChartWrapper } from '../components/OptimizedChartWrapper';

export function Dashboard() {
  const chartData = [
    { date: '2026-04-20', score: 85 },
    { date: '2026-04-21', score: 90 },
    { date: '2026-04-22', score: 88 },
  ];

  return (
    <OptimizedChartWrapper
      type="line"
      data={chartData}
      dataKey="score"
      xAxisKey="date"
      title="학습 진도 추이"
      width={600}
      height={300}
    />
  );
}
```

**효과**: 
- charts 청크(113 kB) 지연 로드
- React.memo로 불필요한 리렌더링 방지
- useMemo로 데이터 메모이제이션

---

### 3. 이미지 최적화

**적용 위치**: 모든 이미지 사용 위치 (인물 사진, 배경 이미지 등)

**Before (일반 img 태그)**:
```typescript
export function ChildCard({ child }) {
  return (
    <div className="card">
      <img src={child.profileImage} alt={child.name} />
      <h3>{child.name}</h3>
    </div>
  );
}
```

**After (최적화된 이미지 컴포넌트)**:
```typescript
import { OptimizedImage, ResponsiveImage } from '../components/OptimizedImage';

export function ChildCard({ child }) {
  return (
    <div className="card">
      <ResponsiveImage
        src={child.profileImage}
        webpSrc={child.profileImageWebP}
        alt={child.name}
        width={200}
        height={200}
        loading="lazy"
        srcSet={`${child.profileImage} 1x, ${child.profileImageRetina} 2x`}
        sizes="(max-width: 768px) 100px, (max-width: 1024px) 150px, 200px"
        className="rounded-full"
      />
      <h3>{child.name}</h3>
    </div>
  );
}
```

**효과**:
- Lazy loading: 뷰포트에 보일 때만 로드
- WebP 지원: 최대 30% 크기 감소
- 반응형: 기기별 최적 크기 제공

---

## 컴포넌트별 최적화 패턴

### Context 최적화 패턴

**문제**: Context 값이 변경될 때마다 모든 구독자가 리렌더링됨

**해결책**:

```typescript
import { useMemo, useCallback } from 'react';
import { useRenderTime } from '../utils/contextOptimization';

export function CurriculumProvider({ children }) {
  const [domains, setDomains] = useState([]);
  const [sessionTasks, setSessionTasks] = useState([]);

  // 성능 모니터링
  useRenderTime('CurriculumProvider');

  // useMemo로 Context 값 메모이제이션
  // domains나 sessionTasks가 변경될 때만 새로운 객체 생성
  const value = useMemo(
    () => ({
      domains,
      sessionTasks,
      updateDomains: setDomains,
      updateSessionTasks: setSessionTasks,
    }),
    [domains, sessionTasks]
  );

  return (
    <CurriculumContext.Provider value={value}>
      {children}
    </CurriculumContext.Provider>
  );
}
```

---

### 메모리 누수 방지 패턴

**타이머 정리**:
```typescript
import { useTimeout, useInterval } from '../utils/contextOptimization';

export function RealTimeChart() {
  const [data, setData] = useState([]);

  // 5초마다 데이터 업데이트, 컴포넌트 언마운트 시 자동 정리
  useInterval(() => {
    fetchChartData().then(setData);
  }, 5000);

  return <Chart data={data} />;
}
```

**이벤트 리스너 정리**:
```typescript
import { useEventListener } from '../utils/contextOptimization';

export function ResponsiveLayout() {
  const [isMobile, setIsMobile] = useState(false);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // 리스너 자동 등록/제거
  useEventListener('resize', handleResize);

  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {/* content */}
    </div>
  );
}
```

---

### LRU 캐시 사용 패턴

```typescript
import { LRUCache } from '../utils/contextOptimization';

// 최대 100개의 캐시 항목 유지
const apiCache = new LRUCache<string, any>(100);

export function ChildDetail({ childId }) {
  const [child, setChild] = useState(null);

  useEffect(() => {
    // 1. 캐시에서 확인
    const cached = apiCache.get(`child-${childId}`);
    if (cached) {
      setChild(cached);
      return;
    }

    // 2. API에서 가져오기
    fetchChild(childId).then((data) => {
      // 3. 캐시에 저장
      apiCache.set(`child-${childId}`, data);
      setChild(data);
    });
  }, [childId]);

  return <div>{child?.name}</div>;
}
```

---

## 성능 측정 및 모니터링

### 1. Lighthouse 측정

**자동화된 성능 측정 스크립트**:
```bash
# 프로덕션 빌드
npm run build

# Lighthouse CLI 설치 (선택)
npm install -g @lhci/cli@*

# Lighthouse 분석
lighthouse https://your-app.com --view
```

**주요 지표**:
- **Performance**: 페이지 로드 속도 (목표: 90점 이상)
- **Accessibility**: 접근성 (목표: 90점 이상)
- **Best Practices**: 웹 기술 모범 사례 (목표: 90점 이상)
- **SEO**: 검색 엔진 최적화 (목표: 90점 이상)

---

### 2. 개발자 도구로 성능 분석

**Chrome DevTools Performance 탭**:
1. DevTools 열기 (F12 또는 우클릭 > 검사)
2. Performance 탭 클릭
3. 녹음 시작 버튼 (●) 클릭
4. 앱과 상호작용
5. 녹음 중지
6. 결과 분석

**주의 깊게 봐야 할 지표**:
- **FCP (First Contentful Paint)**: 첫 콘텐츠 그리기 (< 1.8초)
- **LCP (Largest Contentful Paint)**: 가장 큰 콘텐츠 렌더링 (< 2.5초)
- **CLS (Cumulative Layout Shift)**: 레이아웃 이동 (< 0.1)

---

### 3. 메모리 프로파일 분석

```typescript
// Chrome DevTools Memory 탭으로 분석
export function MemoryTest() {
  // 1. 메모리 스냅샷 생성
  const takeSnapshot = () => {
    console.log('Memory snapshot taken');
  };

  // 2. 성능 추적
  const tracePerformance = () => {
    performance.mark('operation-start');
    // ... 어떤 작업
    performance.mark('operation-end');
    performance.measure('operation', 'operation-start', 'operation-end');
    const measure = performance.getEntriesByName('operation')[0];
    console.log(`작업 소요 시간: ${measure.duration}ms`);
  };

  return (
    <button onClick={tracePerformance}>
      성능 측정
    </button>
  );
}
```

---

## 베스트 프랙티스

### 1. 코드 스플리팅 체크리스트

- [ ] 모든 페이지가 lazy() 및 Suspense로 감싸져 있는가?
- [ ] 로딩 상태(PageLoader)가 표시되는가?
- [ ] 라우트 변경 시 이전 페이지 청크가 캐시되는가?

### 2. 렌더링 성능 체크리스트

- [ ] 대형 리스트는 Virtual List를 사용하는가?
- [ ] useCallback으로 콜백 함수를 메모이제이션했는가?
- [ ] useMemo로 복잡한 계산을 메모이제이션했는가?
- [ ] React.memo로 컴포넌트를 메모이제이션했는가?

### 3. 네트워크 성능 체크리스트

- [ ] gzip 압축이 활성화되어 있는가?
- [ ] 불필요한 API 호출이 없는가?
- [ ] 캐싱 정책이 설정되어 있는가?
- [ ] CDN을 사용하는가?

### 4. 번들 크기 체크리스트

- [ ] 번들 분석 도구(webpack-bundle-analyzer)로 확인했는가?
- [ ] Tree-shaking이 활성화되어 있는가?
- [ ] 불필요한 의존성이 없는가?
- [ ] 큰 라이브러리는 동적으로 로드되는가?

---

## 🎓 교육 자료: 학생들을 위한 설명

### Q1: 번들이 크면 무엇이 문제인가?

**A**: 번들이 크면 처음 페이지를 열었을 때 다운로드 시간이 오래 걸립니다.
특히 모바일에서는 인터넷 속도가 느려서 15초, 20초 이상 기다려야 할 수도 있습니다.
사람들은 3초 이상 기다리지 않으므로, 많은 사용자들이 페이지를 떠나갑니다.

### Q2: 동적 import는 어떻게 다른가?

**A**: 정적 import는 모든 페이지 코드를 한 번에 다운로드합니다.
동적 import는 사용자가 필요한 페이지로 이동할 때만 그 코드를 다운로드합니다.
예: "사용자가 ABC분석 페이지로 이동했다" → "그때 ABC분석 코드 다운로드"

### Q3: WebP 형식이 뭔가요?

**A**: WebP는 구글이 개발한 새로운 이미지 형식입니다.
같은 품질의 이미지를 JPG보다 30% 작게 만들 수 있습니다.
모든 브라우저가 지원하지는 않아서, 지원하는 브라우저에는 WebP를, 지원하지 않는 브라우저에는 JPG를 보냅니다.

### Q4: React.memo는 정말 필요한가?

**A**: 네, 특히 리스트가 많을 때 중요합니다.
예를 들어, 100개의 아이들 목록을 보여줄 때, 한 아이의 정보가 변경되면 React는 100개 모두를 다시 그립니다.
하지만 React.memo를 사용하면, 변경된 아이만 다시 그리므로 훨씬 빠릅니다.

---

## 📊 성능 개선 예상 효과

| 최적화 기법 | 로드 시간 개선 | 메모리 효율 |
|------------|--------------|-----------|
| 코드 스플리팅 | **40% ↓** | 초기: 30% ↓ |
| 이미지 최적화 | **30% ↓** | 30% ↓ |
| React.memo | **20% ↓** | 가비지 콜렉션 효율 증가 |
| 동적 라이브러리 | **50% ↓** | 필요시에만 로드 |
| **총합** | **~70% ↓** | **~50% ↓** |

---

## 🔗 참고 링크

- [React 성능 최적화](https://react.dev/learn/render-and-commit)
- [Vite 최적화 가이드](https://vite.dev/guide/ssr.html)
- [웹 성능 측정](https://web.dev/performance/)
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

**작성일**: 2026-04-27  
**버전**: 1.0  
**상태**: Phase 5 P4 진행 중
