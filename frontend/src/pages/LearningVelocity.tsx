import React, { useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Zap, TrendingUp, Award, AlertTriangle } from 'lucide-react';

export function LearningVelocity() {
  const { calculateLearningVelocity } = useAnalytics();
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [velocityData, setVelocityData] = useState(calculateLearningVelocity('month'));

  const handlePeriodChange = (newPeriod: 'week' | 'month') => {
    setPeriod(newPeriod);
    setVelocityData(calculateLearningVelocity(newPeriod));
  };

  // 차트 데이터
  const velocityChartData = velocityData.childrenMetrics.map(metric => ({
    name: metric.childName,
    velocity: metric.weeklyImprovement,
    acceleration: metric.accelerationRate,
    consistency: metric.consistencyScore,
    average: metric.averageScore,
  }));

  const childComparisonData = velocityData.childrenMetrics.map(metric => ({
    name: metric.childName,
    peak: metric.peakScore,
    lowest: metric.lowestScore,
    average: metric.averageScore,
  }));

  const scatterData = velocityData.childrenMetrics.map((metric, idx) => ({
    x: metric.averageScore,
    y: metric.weeklyImprovement,
    name: metric.childName,
    fill: ['#FFB6D9', '#B4D7FF', '#C1FFD7', '#FFE4B5'][idx],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">3️⃣ 학습 속도 분석</h1>
          <p className="text-gray-600 mt-1">아동별 진도 비교 (주간 평균 개선도)</p>
        </div>

        {/* 기간 선택 */}
        <div className="flex gap-2">
          <button
            onClick={() => handlePeriodChange('week')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              period === 'week'
                ? 'bg-pastel-purple text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => handlePeriodChange('month')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              period === 'month'
                ? 'bg-pastel-purple text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            월간
          </button>
        </div>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 평균 속도 */}
        <div className="glass glass-dark p-6 rounded-lg border-2 border-blue-300">
          <div className="flex items-start gap-3">
            <Zap className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm text-gray-600 mb-2">평균 학습 속도</p>
              <p className="text-3xl font-bold text-blue-600">{velocityData.averageVelocity}</p>
              <p className="text-xs text-gray-500 mt-1">% per week</p>
            </div>
          </div>
        </div>

        {/* 최고 속도 */}
        <div className="glass glass-dark p-6 rounded-lg border-2 border-green-300">
          <div className="flex items-start gap-3">
            <Award className="text-green-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm text-gray-600 mb-2">최고 학습자</p>
              <p className="text-lg font-bold text-green-600">{velocityData.fastestLearner.childName}</p>
              <p className="text-2xl font-bold text-green-600">{velocityData.fastestLearner.velocity}</p>
              <p className="text-xs text-gray-500 mt-1">% per week</p>
            </div>
          </div>
        </div>

        {/* 지원 필요 */}
        <div className="glass glass-dark p-6 rounded-lg border-2 border-orange-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm text-gray-600 mb-2">지원 필요</p>
              <p className="text-lg font-bold text-orange-600">{velocityData.needsSupportChild.childName}</p>
              <p className="text-xs text-orange-600 mt-1">{velocityData.needsSupportChild.reason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 학습 속도 비교 - 막대 차트 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">아동별 학습 속도 비교</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={velocityChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" label={{ value: '% per week', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: '점수', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="velocity"
              fill="#D4A5FF"
              name="주간 개선도 (%)"
            />
            <Bar
              yAxisId="right"
              dataKey="average"
              fill="#B4D7FF"
              name="평균 점수"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 가속도 및 일관성 분석 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">학습 특성 분석</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={velocityChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="acceleration"
              stroke="#FF6B9D"
              strokeWidth={2}
              name="가속도 (0-100)"
              dot={{ fill: '#FF6B9D', r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="consistency"
              stroke="#4ECDC4"
              strokeWidth={2}
              name="일관성 (0-100)"
              dot={{ fill: '#4ECDC4', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 점수 범위 비교 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">점수 범위 분포</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={childComparisonData}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="peak" fill="#FFB6D9" name="최고 점수" />
            <Bar dataKey="average" fill="#B4D7FF" name="평균" />
            <Bar dataKey="lowest" fill="#C1FFD7" name="최저 점수" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 개별 아동 속도 상세 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">아동별 상세 분석</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {velocityData.childrenMetrics.map((metric, idx) => (
            <div
              key={metric.childId}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
            >
              {/* 아동 정보 */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">{metric.childName}</h3>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: ['#FFB6D9', '#B4D7FF', '#C1FFD7', '#FFE4B5'][idx],
                  }}
                ></div>
              </div>

              {/* 메트릭 */}
              <div className="space-y-3">
                {/* 주간 개선도 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-semibold text-gray-700">주간 개선도</p>
                    <p className={`text-sm font-bold ${metric.weeklyImprovement > 0 ? 'text-green-600' : metric.weeklyImprovement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {metric.weeklyImprovement > 0 ? '+' : ''}{metric.weeklyImprovement}%
                    </p>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className={`rounded-full h-2 transition-all ${metric.weeklyImprovement > 0 ? 'bg-green-500' : metric.weeklyImprovement < 0 ? 'bg-red-500' : 'bg-gray-500'}`}
                      style={{
                        width: `${Math.min(100, Math.abs(metric.weeklyImprovement) * 10)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* 가속도 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-semibold text-gray-700">가속도</p>
                    <p className="text-sm font-bold text-pastel-purple">{metric.accelerationRate}/100</p>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-pastel-purple rounded-full h-2 transition-all"
                      style={{ width: `${metric.accelerationRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* 일관성 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-semibold text-gray-700">일관성</p>
                    <p className="text-sm font-bold text-blue-600">{metric.consistencyScore}/100</p>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2 transition-all"
                      style={{ width: `${metric.consistencyScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* 점수 범위 */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">점수 범위</p>
                  <div className="flex justify-between text-sm">
                    <span>최저: <span className="font-bold text-red-600">{metric.lowestScore}</span></span>
                    <span>평균: <span className="font-bold text-blue-600">{metric.averageScore}</span></span>
                    <span>최고: <span className="font-bold text-green-600">{metric.peakScore}</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 산점도 - 점수 vs 개선도 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">성과 vs 개선도 분석</h2>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              name="평균 점수"
              label={{ value: '평균 점수', position: 'insideBottomRight', offset: -10 }}
            />
            <YAxis
              dataKey="y"
              name="주간 개선도"
              label={{ value: '주간 개선도 (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload?.[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 rounded border border-gray-300 shadow-lg">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm">평균 점수: {data.x}</p>
                      <p className="text-sm">개선도: {data.y}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter
              name="아동"
              data={scatterData}
              fill="#8884d8"
            />
          </ScatterChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-600 mt-2">
          (우측 상단: 높은 점수 + 빠른 개선 | 좌측 하단: 낮은 점수 + 느린 개선)
        </p>
      </div>

      {/* 분석 및 권장사항 */}
      <div className="glass glass-dark p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">종합 분석</h2>

        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
          <p className="font-semibold text-green-800 mb-1">최고 성과</p>
          <p className="text-sm text-green-700">
            {velocityData.fastestLearner.childName}이(가) 주간 {velocityData.fastestLearner.velocity}%의 개선도를 보이고 있습니다. 현재의 중재 방식이 효과적입니다.
          </p>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded">
          <p className="font-semibold text-orange-800 mb-1">추가 지원 필요</p>
          <p className="text-sm text-orange-700">
            {velocityData.needsSupportChild.childName}의 경우: {velocityData.needsSupportChild.reason} 개별 상담 및 중재 전략 검토를 권장합니다.
          </p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
          <p className="font-semibold text-blue-800 mb-1">집단 분석</p>
          <p className="text-sm text-blue-700">
            전체 아동의 평균 학습 속도는 주간 {velocityData.averageVelocity}%입니다. 아동 간 개인차가 크므로 개인화된 중재 계획이 중요합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
