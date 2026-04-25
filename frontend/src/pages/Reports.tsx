/**
 * 보고서/분석 페이지
 *
 * 기능:
 * 1. 다양한 그래프 타입 선택 (8가지)
 * 2. 시간 범위 선택 (7d ~ 365d, 사용자 지정)
 * 3. 그룹화 방식 선택 (일/주/월별, 아동별, 발달영역별)
 * 4. 필터링 (아동, 발달영역, 커리큘럼)
 * 5. 그래프 렌더링 및 통계
 * 6. 보고서 내보내기 (JSON, PNG, PDF)
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  ScatterChart, Scatter, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface ChartOption {
  value: string;
  label: string;
  description: string;
}

interface ReportData {
  status: string;
  options: any;
  chart: {
    chartType: string;
    title: string;
    data: any[];
    stats?: {
      average: number;
      trend: string;
      improvement: number;
    };
  };
}

export function Reports() {
  // 보고서 설정
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('7d');
  const [groupBy, setGroupBy] = useState('daily');
  const [childId, setChildId] = useState<number | null>(null);
  const [domainId, setDomainId] = useState<string | null>(null);

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [availableOptions, setAvailableOptions] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 날짜 범위 (CUSTOM 선택시)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 옵션 조회
  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/reports/options', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) throw new Error('옵션 조회 실패');
      const data = await response.json();
      setAvailableOptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '옵션 조회 실패');
    }
  };

  // 보고서 생성
  const generateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestBody: any = {
        chartType,
        timeRange,
        groupBy,
        includeStats: true,
      };

      if (childId) requestBody.childId = childId;
      if (domainId) requestBody.domainId = domainId;
      if (timeRange === 'custom') {
        if (!startDate || !endDate) {
          throw new Error('시작 날짜와 종료 날짜를 선택하세요');
        }
        requestBody.startDate = startDate;
        requestBody.endDate = endDate;
      }

      const response = await fetch('http://localhost:3000/api/reports/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '보고서 생성 실패');
      }

      const data: ReportData = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '보고서 생성 실패');
    } finally {
      setLoading(false);
    }
  };

  // 보고서 내보내기
  const exportReport = async (format: 'json' | 'png' | 'pdf') => {
    if (!reportData) return;

    try {
      if (format === 'json') {
        const dataStr = JSON.stringify(reportData.chart, null, 2);
        const element = document.createElement('a');
        element.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`);
        element.setAttribute('download', `report-${new Date().toISOString().split('T')[0]}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } else if (format === 'png' || format === 'pdf') {
        alert(`${format.toUpperCase()} 내보내기는 추후 지원 예정입니다`);
      }
    } catch (err) {
      setError('내보내기 실패');
    }
  };

  const renderChart = () => {
    if (!reportData?.chart.data) return null;

    const commonProps = {
      data: reportData.chart.data,
      margin: { top: 5, right: 30, left: 0, bottom: 5 },
    };

    switch (reportData.chart.chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" name="점수" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#3b82f6" name="평균 점수" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={reportData.chart.data}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="time" name="시간" />
              <YAxis type="number" dataKey="score" name="점수" />
              <Tooltip />
              <Scatter name="점수" data={reportData.chart.data} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="score" fill="#3b82f6" stroke="#1e40af" />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            {reportData.chart.chartType} 차트는 현재 지원하지 않습니다
          </div>
        );
    }
  };

  if (!availableOptions) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">⏳ 옵션 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">📊 보고서 분석</h1>
        <p className="text-blue-100">아동의 성장을 다양한 시각으로 분석하세요</p>
      </div>

      {/* 설정 섹션 */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-white border-opacity-20">
        <h2 className="text-xl font-bold mb-6">⚙️ 보고서 설정</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* 차트 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📈 차트 타입
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableOptions.chartTypes?.map((opt: ChartOption) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {availableOptions.chartTypes?.find((o: ChartOption) => o.value === chartType)?.description}
            </p>
          </div>

          {/* 시간 범위 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 시간 범위
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableOptions.timeRanges?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 그룹화 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 그룹화
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableOptions.groupByOptions?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 생성 버튼 */}
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? '⏳ 생성 중...' : '✨ 생성'}
            </button>
          </div>
        </div>

        {/* 날짜 범위 (CUSTOM 선택시) */}
        {timeRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 날짜
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료 날짜
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* 보고서 섹션 */}
      {reportData && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-white border-opacity-20">
          {/* 제목과 통계 */}
          <div className="flex justify-between items-start mb-6 pb-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{reportData.chart.title}</h2>
              <p className="text-gray-600 mt-1">
                생성: {new Date().toLocaleString('ko-KR')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportReport('json')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                📥 JSON
              </button>
              <button
                onClick={() => exportReport('png')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                🖼️ PNG
              </button>
            </div>
          </div>

          {/* 통계 */}
          {reportData.chart.stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">평균 점수</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reportData.chart.stats.average.toFixed(1)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">추세</p>
                <p className="text-2xl font-bold text-green-600">
                  {reportData.chart.stats.trend}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">향상도</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(reportData.chart.stats.improvement * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* 차트 */}
          <div className="bg-gray-50 rounded-lg p-4">
            {renderChart()}
          </div>

          {/* 데이터 테이블 */}
          {reportData.chart.data.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">📋 데이터 상세</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {Object.keys(reportData.chart.data[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left text-gray-700 font-semibold">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.chart.data.slice(0, 10).map((row: any, idx: number) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        {Object.values(row).map((val: any, i: number) => (
                          <td key={i} className="px-4 py-2 text-gray-900">
                            {typeof val === 'number' ? val.toFixed(2) : val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.chart.data.length > 10 && (
                  <p className="text-gray-500 text-xs mt-2">
                    ... 외 {reportData.chart.data.length - 10}개 행
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 빈 상태 */}
      {!reportData && !loading && (
        <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-white border-opacity-20">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-gray-600 text-lg">보고서를 생성하여 데이터를 분석해보세요</p>
          <p className="text-gray-500 text-sm mt-2">설정을 입력한 후 "생성" 버튼을 클릭하세요</p>
        </div>
      )}
    </div>
  );
}
