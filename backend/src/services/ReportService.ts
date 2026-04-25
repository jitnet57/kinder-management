/**
 * 보고서 생성 서비스
 * 다양한 그래프와 데이터 시각화 지원
 *
 * 지원 그래프:
 * 1. 추세 그래프 (Line Chart) - 시간별 점수 변화
 * 2. 막대 그래프 (Bar Chart) - 아동별, 발달영역별 비교
 * 3. 원형 그래프 (Pie Chart) - 커리큘럼 완료율
 * 4. 히트맵 (Heatmap) - 주간 활동 패턴
 * 5. 히스토그램 (Histogram) - 점수 분포
 * 6. 스택 바 (Stacked Bar) - 발달영역별 누적 성과
 * 7. 스캐터 (Scatter) - 시간대별 점수 분포
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// ============================================================================
// 타입 정의
// ============================================================================

export enum ChartType {
  LINE = 'line',           // 추세 그래프
  BAR = 'bar',             // 막대 그래프
  PIE = 'pie',             // 원형 그래프
  HEATMAP = 'heatmap',     // 히트맵
  HISTOGRAM = 'histogram', // 히스토그램
  STACKED_BAR = 'stacked_bar', // 스택 바
  SCATTER = 'scatter',     // 산점도
  AREA = 'area',           // 영역 그래프
}

export enum TimeRange {
  WEEK = '7d',     // 7일
  MONTH = '30d',   // 30일
  QUARTER = '90d', // 90일
  YEAR = '365d',   // 1년
  CUSTOM = 'custom', // 사용자 지정
}

export enum GroupBy {
  DAILY = 'daily',          // 일별
  WEEKLY = 'weekly',        // 주별
  MONTHLY = 'monthly',      // 월별
  CHILD = 'child',          // 아동별
  DOMAIN = 'domain',        // 발달영역별
  CURRICULUM = 'curriculum', // 커리큘럼별
}

export interface ReportOptions {
  chartType: ChartType;
  timeRange: TimeRange;
  groupBy: GroupBy;
  childId?: number;        // 특정 아동만 (선택)
  domainId?: string;       // 특정 발달영역만 (선택)
  curriculumId?: number;   // 특정 커리큘럼만 (선택)
  startDate?: Date;        // CUSTOM timeRange용
  endDate?: Date;
  includeStats?: boolean;  // 통계 포함 여부
}

// ============================================================================
// 1. 추세 그래프 (Line Chart)
// ============================================================================

export async function generateTrendChart(options: ReportOptions) {
  logger.info('📊 추세 그래프 생성 중...', { childId: options.childId });

  const { startDate, endDate } = getDateRange(options.timeRange, options.startDate, options.endDate);

  const sessionLogs = await prisma.sessionLog.findMany({
    where: {
      childId: options.childId,
      createdAt: { gte: startDate, lte: endDate },
    },
    orderBy: { createdAt: 'asc' },
    include: { curriculum: true },
  });

  // 날짜별 그룹화
  const data = groupByDate(sessionLogs, options.groupBy);

  return {
    chartType: ChartType.LINE,
    title: `아동 성과 추세 (${options.groupBy})`,
    data: data.map(d => ({
      date: d.date,
      score: d.avgScore,
      count: d.count,
      min: d.minScore,
      max: d.maxScore,
    })),
    stats: {
      average: calculateAverage(sessionLogs.map(s => s.score)),
      trend: calculateTrend(data.map(d => d.avgScore)),
      improvement: calculateImprovement(data),
    },
  };
}

// ============================================================================
// 2. 막대 그래프 (Bar Chart)
// ============================================================================

export async function generateBarChart(options: ReportOptions) {
  logger.info('📊 막대 그래프 생성 중...', { groupBy: options.groupBy });

  const { startDate, endDate } = getDateRange(options.timeRange, options.startDate, options.endDate);

  let data: any[] = [];

  if (options.groupBy === GroupBy.CHILD) {
    // 아동별 평균 점수
    data = await prisma.child.findMany({
      where: {
        status: 'active',
      },
      include: {
        sessionLogs: {
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
        },
      },
    });

    data = data.map(child => ({
      name: child.name,
      score: child.sessionLogs.length > 0
        ? child.sessionLogs.reduce((sum, log) => sum + log.score, 0) / child.sessionLogs.length
        : 0,
      sessions: child.sessionLogs.length,
      color: child.color,
    }));
  } else if (options.groupBy === GroupBy.DOMAIN) {
    // 발달영역별 성과
    data = await prisma.curriculum.findMany({
      distinct: ['domain'],
      where: {
        domain: { not: null },
      },
    });

    data = await Promise.all(
      data.map(async (curr) => {
        const logs = await prisma.sessionLog.findMany({
          where: {
            curriculum: { domain: curr.domain },
            createdAt: { gte: startDate, lte: endDate },
          },
        });

        return {
          name: curr.domain,
          score: logs.length > 0
            ? logs.reduce((sum, log) => sum + log.score, 0) / logs.length
            : 0,
          sessions: logs.length,
        };
      })
    );
  }

  return {
    chartType: ChartType.BAR,
    title: `${options.groupBy} 별 성과`,
    data,
    stats: {
      highest: Math.max(...data.map(d => d.score)),
      lowest: Math.min(...data.map(d => d.score)),
      average: calculateAverage(data.map(d => d.score)),
    },
  };
}

// ============================================================================
// 3. 원형 그래프 (Pie Chart)
// ============================================================================

export async function generatePieChart(options: ReportOptions) {
  logger.info('📊 원형 그래프 생성 중...');

  const { startDate, endDate } = getDateRange(options.timeRange, options.startDate, options.endDate);

  // 커리큘럼 완료율
  const assignments = await prisma.curriculumAssignment.findMany({
    where: {
      childId: options.childId,
    },
    include: { curriculum: true },
  });

  const statuses = {
    completed: 0,
    inProgress: 0,
    assigned: 0,
  };

  assignments.forEach(a => {
    if (a.status === 'completed') statuses.completed++;
    else if (a.status === 'in-progress') statuses.inProgress++;
    else statuses.assigned++;
  });

  const total = assignments.length;

  return {
    chartType: ChartType.PIE,
    title: `커리큘럼 진행 상태`,
    data: [
      { name: '완료', value: statuses.completed, percentage: (statuses.completed / total * 100).toFixed(1) },
      { name: '진행중', value: statuses.inProgress, percentage: (statuses.inProgress / total * 100).toFixed(1) },
      { name: '할당됨', value: statuses.assigned, percentage: (statuses.assigned / total * 100).toFixed(1) },
    ],
  };
}

// ============================================================================
// 4. 히트맵 (Heatmap)
// ============================================================================

export async function generateHeatmap(options: ReportOptions) {
  logger.info('📊 히트맵 생성 중...');

  const { startDate, endDate } = getDateRange(options.timeRange, options.startDate, options.endDate);

  // 요일별, 시간대별 활동 강도
  const logs = await prisma.sessionLog.findMany({
    where: {
      childId: options.childId,
      createdAt: { gte: startDate, lte: endDate },
    },
    orderBy: { createdAt: 'asc' },
  });

  // 7x24 매트릭스 생성 (요일 x 시간)
  const heatmap: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));
  const counts: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));

  logs.forEach(log => {
    const date = new Date(log.createdAt);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    heatmap[dayOfWeek][hour] += log.score;
    counts[dayOfWeek][hour]++;
  });

  // 평균값 계산
  const avgHeatmap = heatmap.map((row, day) =>
    row.map((sum, hour) => counts[day][hour] > 0 ? sum / counts[day][hour] : 0)
  );

  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const data = [];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      if (counts[day][hour] > 0) {
        data.push({
          day: days[day],
          hour: `${hour}시`,
          value: avgHeatmap[day][hour],
          count: counts[day][hour],
        });
      }
    }
  }

  return {
    chartType: ChartType.HEATMAP,
    title: `주간 활동 패턴 (요일 x 시간)`,
    data,
    scale: {
      min: Math.min(...data.map(d => d.value)),
      max: Math.max(...data.map(d => d.value)),
    },
  };
}

// ============================================================================
// 5. 히스토그램 (Histogram)
// ============================================================================

export async function generateHistogram(options: ReportOptions) {
  logger.info('📊 히스토그램 생성 중...');

  const { startDate, endDate } = getDateRange(options.timeRange, options.startDate, options.endDate);

  const logs = await prisma.sessionLog.findMany({
    where: {
      childId: options.childId,
      createdAt: { gte: startDate, lte: endDate },
    },
  });

  // 점수를 10단위로 버킷팅
  const buckets = {
    '0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0,
    '51-60': 0, '61-70': 0, '71-80': 0, '81-90': 0, '91-100': 0,
  };

  logs.forEach(log => {
    const bucket = Math.floor(log.score / 10) * 10;
    const key = `${bucket}-${bucket + 10}`;
    if (buckets[key] !== undefined) {
      buckets[key]++;
    }
  });

  const data = Object.entries(buckets).map(([range, count]) => ({
    range,
    count,
    percentage: (count / logs.length * 100).toFixed(1),
  }));

  return {
    chartType: ChartType.HISTOGRAM,
    title: `점수 분포 히스토그램`,
    data,
    stats: {
      mode: getBucketMode(buckets),
      median: calculateMedian(logs.map(l => l.score)),
      stdDev: calculateStdDev(logs.map(l => l.score)),
    },
  };
}

// ============================================================================
// 6. 스택 바 (Stacked Bar)
// ============================================================================

export async function generateStackedBar(options: ReportOptions) {
  logger.info('📊 스택 바 생성 중...');

  const { startDate, endDate } = getDateRange(options.timeRange, options.startDate, options.endDate);

  // 아동별, 발달영역별 누적 점수
  const children = await prisma.child.findMany({
    where: { status: 'active' },
    include: {
      sessionLogs: {
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { curriculum: true },
      },
    },
  });

  const domains = ['언어발달', '인지발달', '사회성발달'];
  const data = children.map(child => {
    const stackedData: any = { name: child.name, total: 0 };

    domains.forEach(domain => {
      const logs = child.sessionLogs.filter(l => l.curriculum?.domain === domain);
      const score = logs.length > 0
        ? logs.reduce((sum, l) => sum + l.score, 0) / logs.length
        : 0;
      stackedData[domain] = score;
      stackedData.total += score;
    });

    return stackedData;
  });

  return {
    chartType: ChartType.STACKED_BAR,
    title: `아동별 발달영역 성과`,
    data,
    domains,
  };
}

// ============================================================================
// 7. 산점도 (Scatter)
// ============================================================================

export async function generateScatter(options: ReportOptions) {
  logger.info('📊 산점도 생성 중...');

  const { startDate, endDate } = getDateRange(options.timeRange, options.startDate, options.endDate);

  const logs = await prisma.sessionLog.findMany({
    where: {
      childId: options.childId,
      createdAt: { gte: startDate, lte: endDate },
    },
    include: { curriculum: true },
  });

  // X축: 시간(시), Y축: 점수
  const data = logs.map((log, idx) => ({
    x: log.createdAt.getHours(),
    y: log.score,
    size: log.createdAt.getMinutes(),
    domain: log.curriculum?.domain,
    date: log.createdAt.toISOString().split('T')[0],
  }));

  return {
    chartType: ChartType.SCATTER,
    title: `시간대별 점수 분포`,
    data,
    xAxis: '시간(시)',
    yAxis: '점수',
  };
}

// ============================================================================
// 8. 영역 그래프 (Area Chart)
// ============================================================================

export async function generateArea(options: ReportOptions) {
  logger.info('📊 영역 그래프 생성 중...');

  const { startDate, endDate } = getDateRange(options.timeRange, options.startDate, options.endDate);

  // 발달영역별 누적 추세
  const domains = ['언어발달', '인지발달', '사회성발달'];
  const dateRange = getDates(startDate, endDate);

  const data = dateRange.map(date => {
    const dayData: any = { date: date.toISOString().split('T')[0] };

    domains.forEach(async (domain) => {
      const logs = await prisma.sessionLog.findMany({
        where: {
          curriculum: { domain },
          createdAt: {
            gte: new Date(date),
            lt: new Date(date.getTime() + 86400000),
          },
        },
      });

      dayData[domain] = logs.length > 0
        ? logs.reduce((sum, l) => sum + l.score, 0) / logs.length
        : 0;
    });

    return dayData;
  });

  return {
    chartType: ChartType.AREA,
    title: `발달영역별 성과 추세`,
    data,
    areas: domains,
  };
}

// ============================================================================
// 메인: 보고서 생성
// ============================================================================

export async function generateReport(options: ReportOptions) {
  try {
    let chart: any;

    switch (options.chartType) {
      case ChartType.LINE:
        chart = await generateTrendChart(options);
        break;
      case ChartType.BAR:
        chart = await generateBarChart(options);
        break;
      case ChartType.PIE:
        chart = await generatePieChart(options);
        break;
      case ChartType.HEATMAP:
        chart = await generateHeatmap(options);
        break;
      case ChartType.HISTOGRAM:
        chart = await generateHistogram(options);
        break;
      case ChartType.STACKED_BAR:
        chart = await generateStackedBar(options);
        break;
      case ChartType.SCATTER:
        chart = await generateScatter(options);
        break;
      case ChartType.AREA:
        chart = await generateArea(options);
        break;
      default:
        throw new Error(`지원하지 않는 차트 타입: ${options.chartType}`);
    }

    return {
      success: true,
      chart,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('보고서 생성 실패', { error });
    throw error;
  }
}

// ============================================================================
// 유틸 함수
// ============================================================================

function getDateRange(timeRange: TimeRange, startDate?: Date, endDate?: Date) {
  const end = endDate || new Date();
  let start = startDate;

  if (!start) {
    switch (timeRange) {
      case TimeRange.WEEK:
        start = new Date(end.getTime() - 7 * 86400000);
        break;
      case TimeRange.MONTH:
        start = new Date(end.getTime() - 30 * 86400000);
        break;
      case TimeRange.QUARTER:
        start = new Date(end.getTime() - 90 * 86400000);
        break;
      case TimeRange.YEAR:
        start = new Date(end.getTime() - 365 * 86400000);
        break;
      default:
        start = new Date(end.getTime() - 7 * 86400000);
    }
  }

  return { startDate: start, endDate: end };
}

function getDates(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function groupByDate(logs: any[], groupBy: GroupBy) {
  const grouped: { [key: string]: any } = {};

  logs.forEach(log => {
    let key: string;

    if (groupBy === GroupBy.DAILY) {
      key = log.createdAt.toISOString().split('T')[0];
    } else if (groupBy === GroupBy.WEEKLY) {
      const date = new Date(log.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (groupBy === GroupBy.MONTHLY) {
      key = log.createdAt.toISOString().substring(0, 7);
    }

    if (!grouped[key]) {
      grouped[key] = { date: key, scores: [], avgScore: 0, minScore: 0, maxScore: 0, count: 0 };
    }

    grouped[key].scores.push(log.score);
    grouped[key].count++;
  });

  Object.values(grouped).forEach((item: any) => {
    item.avgScore = item.scores.reduce((a: number, b: number) => a + b, 0) / item.count;
    item.minScore = Math.min(...item.scores);
    item.maxScore = Math.max(...item.scores);
  });

  return Object.values(grouped);
}

function calculateAverage(values: number[]): number {
  return values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;
}

function calculateTrend(values: number[]): string {
  if (values.length < 2) return '데이터 부족';
  const first = values.slice(0, Math.ceil(values.length / 2)).reduce((a, b) => a + b) / Math.ceil(values.length / 2);
  const last = values.slice(Math.ceil(values.length / 2)).reduce((a, b) => a + b) / Math.floor(values.length / 2);
  const change = last - first;
  return change > 0 ? `↑ ${change.toFixed(1)}` : `↓ ${Math.abs(change).toFixed(1)}`;
}

function calculateImprovement(data: any[]): string {
  if (data.length < 2) return '데이터 부족';
  const first = data[0].avgScore;
  const last = data[data.length - 1].avgScore;
  const improvement = ((last - first) / first * 100).toFixed(1);
  return `${improvement}%`;
}

function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function calculateStdDev(values: number[]): number {
  const avg = calculateAverage(values);
  const squareDiffs = values.map(val => Math.pow(val - avg, 2));
  return Math.sqrt(calculateAverage(squareDiffs));
}

function getBucketMode(buckets: { [key: string]: number }): string {
  let maxBucket = '0-10';
  let maxCount = 0;

  Object.entries(buckets).forEach(([bucket, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxBucket = bucket;
    }
  });

  return maxBucket;
}

export default {
  generateReport,
  generateTrendChart,
  generateBarChart,
  generatePieChart,
  generateHeatmap,
  generateHistogram,
  generateStackedBar,
  generateScatter,
  generateArea,
};
