/**
 * 빠른 보고서 위젯
 * Dashboard 우측에 표시되는 미니 리포트
 */

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface QuickReport {
  title: string;
  description: string;
  chart: any;
  stats: {
    label: string;
    value: string;
    trend: string;
  }[];
}

export function QuickReportWidget() {
  const [report, setReport] = useState<QuickReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickReport();
  }, []);

  const fetchQuickReport = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/reports/quick', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        // 샘플 데이터
        setSampleReport();
        return;
      }

      // const data = await response.json();
      // API 응답 처리
      setSampleReport();
    } catch (err) {
      setSampleReport();
    } finally {
      setLoading(false);
    }
  };

  const setSampleReport = () => {
    setReport({
      title: '이번주 성과 분석',
      description: '전체 아동 평균 성과',
      chart: {
        data: [
          { day: '월', score: 78 },
          { day: '화', score: 81 },
          { day: '수', score: 84 },
          { day: '목', score: 80 },
          { day: '금', score: 87 },
          { day: '토', score: 90 },
        ],
      },
      stats: [
        { label: '평균', value: '83.3', trend: '↗️' },
        { label: '최고', value: '90', trend: '⭐' },
        { label: '향상도', value: '+15%', trend: '📈' },
      ],
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-white border-opacity-20">
        <p className="text-gray-500 text-center">⏳ 보고서 로딩 중...</p>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-white border-opacity-20">
      {/* 헤더 */}
      <div className="mb-4 pb-4 border-b">
        <h3 className="text-lg font-bold text-gray-900">{report.title}</h3>
        <p className="text-sm text-gray-600">{report.description}</p>
      </div>

      {/* 미니 차트 */}
      <div className="mb-6 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={report.chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 통계 배지 */}
      <div className="grid grid-cols-3 gap-2">
        {report.stats.map(stat => (
          <div
            key={stat.label}
            className="bg-white rounded-lg p-3 text-center shadow-sm hover:shadow-md transition"
          >
            <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
            <p className="text-lg font-bold text-blue-600">{stat.value}</p>
            <p className="text-sm">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* CTA 버튼 */}
      <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
        📊 상세 보고서 보기
      </button>
    </div>
  );
}
