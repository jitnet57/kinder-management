/**
 * ============================================================
 * 📌 최적화된 차트 래퍼 컴포넌트
 * 📋 목적: Recharts 라이브러리를 동적으로 로드하고,
 *         불필요한 리렌더링을 방지하여 성능 향상
 * 🎯 효과: charts 청크 지연 로드, 렌더링 성능 개선
 * 📅 작성일: 2026-04-27
 * ============================================================
 */

import React, { lazy, Suspense, useMemo } from 'react';

// Recharts 컴포넌트를 동적으로 import
const RechartsChart = lazy(() => import('./RechartsChartImpl'));

interface OptimizedChartWrapperProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  title?: string;
  width?: number;
  height?: number;
}

/**
 * 차트 로딩 중 표시할 스피너
 */
const ChartLoader = () => (
  <div className="flex items-center justify-center w-full h-96 bg-gray-50 rounded-lg">
    <div className="text-center">
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
        <p className="text-gray-600">차트 로딩 중...</p>
      </div>
    </div>
  </div>
);

/**
 * 최적화된 차트 래퍼 컴포넌트
 * React.memo로 감싸서 불필요한 리렌더링 방지
 */
export const OptimizedChartWrapper = React.memo(
  ({
    type,
    data,
    dataKey,
    xAxisKey = 'name',
    title = '차트',
    width = 500,
    height = 300,
  }: OptimizedChartWrapperProps) => {
    // useMemo로 데이터 메모이제이션
    // 데이터가 변경되지 않으면 메모리 재사용
    const memoizedData = useMemo(() => data, [data]);

    return (
      <div className="w-full bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <Suspense fallback={<ChartLoader />}>
          <RechartsChart
            type={type}
            data={memoizedData}
            dataKey={dataKey}
            xAxisKey={xAxisKey}
            width={width}
            height={height}
          />
        </Suspense>
      </div>
    );
  }
);

OptimizedChartWrapper.displayName = 'OptimizedChartWrapper';
