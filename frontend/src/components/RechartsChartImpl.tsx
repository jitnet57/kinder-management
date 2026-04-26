/**
 * ============================================================
 * 📌 Recharts 차트 구현
 * 📋 목적: 동적으로 로드되는 차트 컴포넌트
 * 🎯 효과: 필요할 때만 Recharts 라이브러리 로드
 * 📅 작성일: 2026-04-27
 * ============================================================
 */

import React from 'react';
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  Line,
  Bar,
  Pie,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface RechartsChartImplProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  width?: number;
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

/**
 * Recharts를 사용한 차트 구현
 * 동적으로만 로드되므로 초기 번들에 포함되지 않음
 */
function RechartsChartImpl({
  type,
  data,
  dataKey,
  xAxisKey = 'name',
  width = 500,
  height = 300,
}: RechartsChartImplProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-600">데이터가 없습니다</p>
      </div>
    );
  }

  // 차트 색상 할당
  const getChartColors = (index: number) => COLORS[index % COLORS.length];

  switch (type) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ fill: '#8884d8', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );

    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} fill="#8884d8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getChartColors(index)}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );

    case 'area':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey={dataKey}
              fill="#8884d8"
              stroke="#8884d8"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
}

export default RechartsChartImpl;
