/**
 * 보고서 생성 API 엔드포인트
 * 다양한 그래프와 데이터 시각화 지원
 *
 * Routes:
 * - POST /api/reports/generate  - 그래프 데이터 생성
 * - POST /api/reports/export    - 보고서 내보내기 (PNG/PDF)
 * - GET  /api/reports/options   - 차트 옵션 조회
 */

import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { logger } from '../utils/logger';
import {
  ChartType,
  TimeRange,
  GroupBy,
  ReportOptions,
  generateTrendChart,
  generateBarChart,
  generatePieChart,
  generateHeatmap,
  generateHistogram,
  generateStackedBar,
  generateScatter,
  generateArea,
  generateReport,
} from '../services/ReportService';

const app = new Hono();

// ============================================================================
// POST /api/reports/generate - 그래프 데이터 생성
// ============================================================================

/**
 * 선택된 옵션으로 그래프 데이터 생성
 *
 * Request Body:
 * {
 *   "chartType": "line",        // line, bar, pie, heatmap, histogram, stacked_bar, scatter, area
 *   "timeRange": "7d",          // 7d, 30d, 90d, 365d, custom
 *   "groupBy": "daily",         // daily, weekly, monthly, child, domain, curriculum
 *   "childId": 1,               // 선택사항
 *   "domainId": "motor",        // 선택사항
 *   "curriculumId": 5,          // 선택사항
 *   "startDate": "2026-04-20",  // CUSTOM timeRange용
 *   "endDate": "2026-04-26",    // CUSTOM timeRange용
 *   "includeStats": true        // 통계 포함 여부
 * }
 */
app.post('/generate', bearerAuth({ token: process.env.ADMIN_API_KEY! }), async (c) => {
  try {
    const body = await c.req.json();
    const {
      chartType,
      timeRange,
      groupBy,
      childId,
      domainId,
      curriculumId,
      startDate,
      endDate,
      includeStats = true,
    } = body;

    // 필수 항목 검증
    if (!chartType || !timeRange || !groupBy) {
      return c.json(
        {
          error: 'Missing required fields',
          message: 'chartType, timeRange, groupBy는 필수입니다',
        },
        400
      );
    }

    // chartType 검증
    if (!Object.values(ChartType).includes(chartType)) {
      return c.json(
        {
          error: 'Invalid chartType',
          validTypes: Object.values(ChartType),
        },
        400
      );
    }

    // timeRange 검증
    if (!Object.values(TimeRange).includes(timeRange)) {
      return c.json(
        {
          error: 'Invalid timeRange',
          validRanges: Object.values(TimeRange),
        },
        400
      );
    }

    // groupBy 검증
    if (!Object.values(GroupBy).includes(groupBy)) {
      return c.json(
        {
          error: 'Invalid groupBy',
          validGroupBy: Object.values(GroupBy),
        },
        400
      );
    }

    logger.info('📊 보고서 생성 요청', {
      chartType,
      timeRange,
      groupBy,
      childId,
    });

    // 보고서 옵션 구성
    const options: ReportOptions = {
      chartType,
      timeRange,
      groupBy,
      childId,
      domainId,
      curriculumId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      includeStats,
    };

    // 그래프 데이터 생성
    const chartData = await generateReport(options);

    logger.info('✅ 보고서 생성 완료', {
      chartType,
      dataPoints: chartData.data?.length || 0,
    });

    return c.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      options,
      chart: chartData,
    });
  } catch (error) {
    logger.error('보고서 생성 실패', { error });
    return c.json(
      {
        error: 'Report generation failed',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

// ============================================================================
// GET /api/reports/options - 차트 옵션 조회
// ============================================================================

/**
 * 사용 가능한 그래프, 시간 범위, 그룹화 옵션 조회
 */
app.get('/options', bearerAuth({ token: process.env.ADMIN_API_KEY! }), async (c) => {
  try {
    return c.json({
      status: 'success',
      chartTypes: [
        {
          value: ChartType.LINE,
          label: '📈 추세 그래프',
          description: '시간대별 점수 변화',
        },
        {
          value: ChartType.BAR,
          label: '📊 막대 그래프',
          description: '아동별 또는 발달영역별 비교',
        },
        {
          value: ChartType.PIE,
          label: '🥧 원형 그래프',
          description: '커리큘럼 완료율 표시',
        },
        {
          value: ChartType.HEATMAP,
          label: '🔥 히트맵',
          description: '주간 활동 패턴 분석',
        },
        {
          value: ChartType.HISTOGRAM,
          label: '📐 히스토그램',
          description: '점수 분포 분석',
        },
        {
          value: ChartType.STACKED_BAR,
          label: '📚 스택 바',
          description: '발달영역별 누적 성과',
        },
        {
          value: ChartType.SCATTER,
          label: '💫 산점도',
          description: '시간대별 점수 분포',
        },
        {
          value: ChartType.AREA,
          label: '🌊 영역 그래프',
          description: '발달영역 추세',
        },
      ],
      timeRanges: [
        {
          value: TimeRange.WEEK,
          label: '📅 이번주 (7일)',
          days: 7,
        },
        {
          value: TimeRange.MONTH,
          label: '📅 이번달 (30일)',
          days: 30,
        },
        {
          value: TimeRange.QUARTER,
          label: '📅 분기 (90일)',
          days: 90,
        },
        {
          value: TimeRange.YEAR,
          label: '📅 연간 (365일)',
          days: 365,
        },
        {
          value: TimeRange.CUSTOM,
          label: '🎯 사용자 지정',
          requiresDateRange: true,
        },
      ],
      groupByOptions: [
        {
          value: GroupBy.DAILY,
          label: '📆 일별',
          description: '매일 집계',
        },
        {
          value: GroupBy.WEEKLY,
          label: '📅 주별',
          description: '주 단위로 집계',
        },
        {
          value: GroupBy.MONTHLY,
          label: '📋 월별',
          description: '월 단위로 집계',
        },
        {
          value: GroupBy.CHILD,
          label: '👧 아동별',
          description: '아동을 기준으로 집계',
        },
        {
          value: GroupBy.DOMAIN,
          label: '🎯 발달영역별',
          description: '발달영역을 기준으로 집계',
        },
        {
          value: GroupBy.CURRICULUM,
          label: '📚 커리큘럼별',
          description: '커리큘럼을 기준으로 집계',
        },
      ],
    });
  } catch (error) {
    logger.error('옵션 조회 실패', { error });
    return c.json(
      {
        error: 'Options fetch failed',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

// ============================================================================
// POST /api/reports/export - 보고서 내보내기
// ============================================================================

/**
 * 생성된 보고서를 파일로 내보내기
 *
 * Request Body:
 * {
 *   "format": "png",  // png, pdf, json
 *   "width": 1200,    // PNG 너비
 *   "height": 600,    // PNG 높이
 *   "chart": {...}    // generate 엔드포인트에서 받은 chart 데이터
 * }
 *
 * 참고: PNG/PDF 내보내기는 프론트엔드에서 처리 권장 (더 간단함)
 */
app.post('/export', bearerAuth({ token: process.env.ADMIN_API_KEY! }), async (c) => {
  try {
    const body = await c.req.json();
    const { format = 'json', chart, filename } = body;

    logger.info('📥 보고서 내보내기', { format });

    if (format === 'json') {
      // JSON으로 내보내기 (가장 간단)
      const fileName = filename || `kinder-report-${new Date().toISOString().split('T')[0]}.json`;

      return c.json(chart, {
        headers: {
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Type': 'application/json',
        },
      });
    } else if (format === 'png' || format === 'pdf') {
      // PNG/PDF 내보내기
      // 참고: 실제 구현은 canvas/headless-chrome 필요 (복잡함)
      // 대신 프론트엔드에서 html2canvas, jsPDF 사용 권장
      return c.json(
        {
          error: 'PNG/PDF export not implemented on backend',
          suggestion: 'Use frontend libraries (html2canvas, jsPDF) for image/PDF export',
          alternatives: [
            '1. Recharts → html2canvas → PNG',
            '2. Recharts → html2canvas + jsPDF → PDF',
            '3. Backend: 서버 렌더링 (Puppeteer, Playwright)',
          ],
        },
        501
      );
    } else {
      return c.json(
        {
          error: 'Invalid format',
          validFormats: ['json', 'png', 'pdf'],
        },
        400
      );
    }
  } catch (error) {
    logger.error('내보내기 실패', { error });
    return c.json(
      {
        error: 'Export failed',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

// ============================================================================
// GET /api/reports/quick - 빠른 보고서 (대시보드용)
// ============================================================================

/**
 * 대시보드에서 사용할 빠른 보고서
 * 모든 아동의 최근 7일 추세
 */
app.get('/quick', bearerAuth({ token: process.env.ADMIN_API_KEY! }), async (c) => {
  try {
    logger.info('📊 빠른 보고서 생성 중...');

    const trendChart = await generateTrendChart({
      chartType: ChartType.LINE,
      timeRange: TimeRange.WEEK,
      groupBy: GroupBy.DAILY,
      includeStats: true,
    });

    const barChart = await generateBarChart({
      chartType: ChartType.BAR,
      timeRange: TimeRange.WEEK,
      groupBy: GroupBy.CHILD,
      includeStats: true,
    });

    logger.info('✅ 빠른 보고서 완료');

    return c.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      reports: {
        trend: trendChart,
        comparison: barChart,
      },
    });
  } catch (error) {
    logger.error('빠른 보고서 생성 실패', { error });
    return c.json(
      {
        error: 'Quick report failed',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      500
    );
  }
});

export default app;
