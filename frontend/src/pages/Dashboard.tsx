/**
 * 대시보드 - 다양한 그래프 선택 기능
 *
 * 기능:
 * 1. 통계 카드 (아동 수, 세션 수, 완료율, 커리큘럼)
 * 2. 동적 그래프 선택 (8가지 차트 타입)
 * 3. 시간 범위 선택 (7d ~ 365d)
 * 4. 그룹화 방식 선택
 * 5. 최근 활동 및 일정
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  ScatterChart, Scatter, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  children: number;
  sessionsThisWeek: number;
  completionRate: number;
  activeCurriculum: number;
}

interface ChartData {
  chartType: string;
  data: any[];
  stats?: {
    average: number;
    trend: string;
    improvement: number;
  };
}

export function Dashboard() {
  // 상태 관리
  const [stats, setStats] = useState<DashboardStats>({
    children: 12,
    sessionsThisWeek: 48,
    completionRate: 85,
    activeCurriculum: 24,
  });

  // 그래프 선택
  const [selectedChart, setSelectedChart] = useState('trend');
  const [timeRange, setTimeRange] = useState('7d');
  const [groupBy, setGroupBy] = useState('daily');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);

  // 그래프 옵션
  const chartOptions = [
    { value: 'trend', label: '📈 추세 그래프', color: 'text-blue-600' },
    { value: 'bar', label: '📊 막대 그래프', color: 'text-green-600' },
    { value: 'pie', label: '🥧 원형 그래프', color: 'text-purple-600' },
    { value: 'heatmap', label: '🔥 히트맵', color: 'text-orange-600' },
    { value: 'histogram', label: '📐 히스토그램', color: 'text-pink-600' },
    { value: 'stacked_bar', label: '📚 스택 바', color: 'text-indigo-600' },
    { value: 'scatter', label: '💫 산점도', color: 'text-cyan-600' },
    { value: 'area', label: '🌊 영역 그래프', color: 'text-teal-600' },
  ];

  const timeRangeOptions = [
    { value: '7d', label: '이번주 (7일)' },
    { value: '30d', label: '이번달 (30일)' },
    { value: '90d', label: '분기 (90일)' },
    { value: '365d', label: '연간 (365일)' },
  ];

  const groupByOptions = [
    { value: 'daily', label: '일별' },
    { value: 'weekly', label: '주별' },
    { value: 'monthly', label: '월별' },
    { value: 'child', label: '아동별' },
    { value: 'domain', label: '발달영역별' },
  ];

  // 그래프 데이터 로드
  useEffect(() => {
    loadChartData();
  }, [selectedChart, timeRange, groupBy]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      // 실제로는 API 호출
      const response = await fetch('http://localhost:3000/api/reports/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chartType: selectedChart,
          timeRange,
          groupBy,
          includeStats: true,
        }),
      });

      if (!response.ok) {
        // API 실패시 샘플 데이터 사용
        setSampleChartData(selectedChart);
        return;
      }

      const data = await response.json();
      setChartData(data.chart);
    } catch (err) {
      // 에러시 샘플 데이터 사용
      setSampleChartData(selectedChart);
    } finally {
      setLoading(false);
    }
  };

  // 샘플 데이터
  const setSampleChartData = (type: string) => {
    const sampleData: Record<string, any> = {
      trend: {
        chartType: 'line',
        data: [
          { date: '4/20', score: 75, count: 3 },
          { date: '4/21', score: 78, count: 4 },
          { date: '4/22', score: 82, count: 3 },
          { date: '4/23', score: 80, count: 4 },
          { date: '4/24', score: 85, count: 5 },
          { date: '4/25', score: 88, count: 4 },
          { date: '4/26', score: 90, count: 4 },
        ],
        stats: { average: 83.4, trend: '↗️ 상향', improvement: 0.2 },
      },
      bar: {
        chartType: 'bar',
        data: [
          { name: '민준', score: 88, sessions: 12 },
          { name: '소영', score: 82, sessions: 10 },
          { name: '지호', score: 79, sessions: 8 },
          { name: '영희', score: 85, sessions: 11 },
        ],
        stats: { average: 83.5, trend: '→ 유지', improvement: 0.05 },
      },
      pie: {
        chartType: 'pie',
        data: [
          { name: '완료', count: 120, value: 85 },
          { name: '진행중', count: 18, value: 13 },
          { name: '대기', count: 3, value: 2 },
        ],
        stats: { average: 85, trend: '↗️ 상향', improvement: 0.15 },
      },
      heatmap: {
        chartType: 'heatmap',
        data: Array.from({ length: 7 }, (_, day) =>
          Array.from({ length: 6 }, (_, hour) => ({
            day: ['월', '화', '수', '목', '금', '토'][day],
            hour: `${8 + hour}:00`,
            intensity: Math.floor(Math.random() * 100),
          }))
        ).flat(),
      },
      histogram: {
        chartType: 'histogram',
        data: [
          { range: '60-70', count: 5 },
          { range: '70-80', count: 15 },
          { range: '80-90', count: 25 },
          { range: '90-100', count: 12 },
        ],
      },
      stacked_bar: {
        chartType: 'stacked_bar',
        data: [
          { name: '언어', motor: 75, cognitive: 82, social: 78 },
          { name: '인지', motor: 80, cognitive: 85, social: 81 },
          { name: '사회', motor: 78, cognitive: 80, social: 88 },
        ],
      },
      scatter: {
        chartType: 'scatter',
        data: Array.from({ length: 20 }, () => ({
          time: Math.random() * 24,
          score: Math.random() * 100,
        })),
      },
      area: {
        chartType: 'area',
        data: [
          { date: '4/20', motor: 70, cognitive: 75, social: 72 },
          { date: '4/21', motor: 72, cognitive: 78, social: 75 },
          { date: '4/22', motor: 75, cognitive: 82, social: 78 },
          { date: '4/23', motor: 73, cognitive: 80, social: 76 },
          { date: '4/24', motor: 78, cognitive: 85, social: 82 },
          { date: '4/25', motor: 80, cognitive: 88, social: 85 },
          { date: '4/26', motor: 82, cognitive: 90, social: 88 },
        ],
      },
    };

    setChartData(sampleData[type] || sampleData.trend);
  };

  // 그래프 렌더링
  const renderChart = () => {
    if (!chartData?.data) return null;

    const commonProps = {
      data: chartData.data,
      margin: { top: 5, right: 30, left: 0, bottom: 5 },
    };

    switch (selectedChart) {
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                name="점수"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#10b981" name="평균 점수" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.data}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8b5cf6"
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="time" name="시간" />
              <YAxis type="number" dataKey="score" name="점수" />
              <Tooltip />
              <Scatter name="점수" data={chartData.data} fill="#f59e0b" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="motor"
                stackId="1"
                stroke="#f472b6"
                fill="#f472b6"
                name="운동능력"
              />
              <Area
                type="monotone"
                dataKey="cognitive"
                stackId="1"
                stroke="#60a5fa"
                fill="#60a5fa"
                name="인지능력"
              />
              <Area
                type="monotone"
                dataKey="social"
                stackId="1"
                stroke="#34d399"
                fill="#34d399"
                name="사회성"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'stacked_bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="motor" stackId="a" fill="#f472b6" name="운동능력" />
              <Bar dataKey="cognitive" stackId="a" fill="#60a5fa" name="인지능력" />
              <Bar dataKey="social" stackId="a" fill="#34d399" name="사회성" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" name="빈도" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="h-64 flex items-center justify-center text-gray-500">
            {selectedChart} 차트는 현재 지원하지 않습니다
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">📊 대시보드</h1>
        <p className="text-blue-100">실시간 아동 성장 현황과 성과 분석</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '등록된 아동', value: stats.children, icon: '👧', color: 'from-pink-400 to-pink-500' },
          { label: '이번 주 세션', value: stats.sessionsThisWeek, icon: '📝', color: 'from-blue-400 to-blue-500' },
          { label: '완료율', value: `${stats.completionRate}%`, icon: '✅', color: 'from-green-400 to-green-500' },
          { label: '활성 커리큘럼', value: stats.activeCurriculum, icon: '📚', color: 'from-purple-400 to-purple-500' },
        ].map(stat => (
          <div
            key={stat.label}
            className={`glass rounded-2xl p-6 bg-gradient-to-br ${stat.color} text-white hover:shadow-lg transition-all transform hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium opacity-90">{stat.label}</p>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 그래프 섹션 */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-white border-opacity-20">
        {/* 제어 패널 */}
        <div className="mb-6 pb-6 border-b">
          <h2 className="text-xl font-bold mb-4">📈 성과 분석</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 차트 타입 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 차트 타입
              </label>
              <div className="grid grid-cols-2 gap-2">
                {chartOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedChart(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedChart === option.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label.split(' ')[0]} {option.label.split(' ')[1]?.substring(0, 2) || ''}
                  </button>
                ))}
              </div>
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
                {timeRangeOptions.map(opt => (
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
                {groupByOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 통계 */}
        {chartData?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">평균 점수</p>
              <p className="text-2xl font-bold text-blue-600">
                {chartData.stats.average.toFixed(1)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">추세</p>
              <p className="text-2xl font-bold text-green-600">
                {chartData.stats.trend}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">향상도</p>
              <p className="text-2xl font-bold text-purple-600">
                {(chartData.stats.improvement * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* 그래프 */}
        <div className="bg-gray-50 rounded-lg p-4 min-h-80">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              ⏳ 그래프 로딩 중...
            </div>
          ) : (
            renderChart()
          )}
        </div>
      </div>

      {/* 최근 활동 및 일정 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 활동 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white border-opacity-20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>📋 최근 활동</span>
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">오늘</span>
          </h3>
          <div className="space-y-3">
            {[
              { time: '14:30', activity: '민준 - 단어발음 (90점)', color: 'text-green-600' },
              { time: '12:15', activity: '소영 - 색상분류 (75점)', color: 'text-yellow-600' },
              { time: '10:45', activity: '지호 - 숫자읽기 (85점)', color: 'text-blue-600' },
              { time: '09:00', activity: '영희 - 사회상호작용 (88점)', color: 'text-purple-600' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <span className="text-xs text-gray-500 font-mono whitespace-nowrap">{item.time}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.color}`}>{item.activity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 이번 주 일정 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white border-opacity-20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>📅 이번 주 일정</span>
            <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full">48 세션</span>
          </h3>
          <div className="space-y-2">
            {['월', '화', '수', '목', '금', '토'].map((day, idx) => (
              <div key={day} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-blue-600 w-8 text-center">
                    {['🌙', '📝', '📚', '💡', '⭐', '🎯'][idx]}
                  </span>
                  <span className="font-semibold text-gray-700 w-12">{day}요일</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">8 세션</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">예정</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
