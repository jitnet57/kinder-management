import React, { useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { CANONICAL_CHILDREN } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

export function BehaviorPrediction() {
  const { predictBehavior } = useAnalytics();
  const [selectedChildId, setSelectedChildId] = useState<number>(1);
  const [selectedLtoId, setSelectedLtoId] = useState<string>('domain_mand_lto01');
  const [daysAhead, setDaysAhead] = useState<number>(7);
  const [prediction, setPrediction] = useState(
    predictBehavior(1, 'domain_mand_lto01', 7)
  );

  const handlePredict = () => {
    const result = predictBehavior(selectedChildId, selectedLtoId, daysAhead);
    setPrediction(result);
  };

  // 과거 + 미래 데이터 통합
  const combinedData = [
    ...prediction.historicalData.map(data => ({
      ...data,
      type: 'historical',
      isPrediction: false,
    })),
    ...prediction.predictions.map((pred, idx) => ({
      week: prediction.historicalData.length + idx + 1,
      accuracy: pred.predictedAccuracy,
      confidenceHigh: pred.confidenceInterval.upper,
      confidenceLow: pred.confidenceInterval.lower,
      type: 'prediction',
      isPrediction: true,
    })),
  ];

  const getOutlookIcon = (trend: string) => {
    return trend === 'improving' ? '📈' : trend === 'declining' ? '📉' : '➡️';
  };

  const getTrendColor = (trend: string) => {
    return trend === 'improving' ? 'text-green-600' : trend === 'declining' ? 'text-red-600' : 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">2️⃣ 행동 예측</h1>
          <p className="text-gray-600 mt-1">다음 주 진행 예상 (정확도 기반 머신러닝)</p>
        </div>
        <button
          onClick={handlePredict}
          className="flex items-center gap-2 bg-pastel-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          <TrendingUp size={20} />
          예측 실행
        </button>
      </div>

      {/* 선택 패널 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">아동 선택</label>
            <select
              value={selectedChildId}
              onChange={e => setSelectedChildId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              {CANONICAL_CHILDREN.map(child => (
                <option key={child.id} value={child.id}>
                  {child.name} ({child.age}세)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">LTO 선택</label>
            <select
              value={selectedLtoId}
              onChange={e => setSelectedLtoId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="domain_mand_lto01">지시 따르기 - 기본</option>
              <option value="domain_tact_lto01">타키 - 기본</option>
              <option value="domain_mand_lto02">지시 따르기 - 고급</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">예측 기간 (일)</label>
            <select
              value={daysAhead}
              onChange={e => setDaysAhead(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value={7}>1주일</option>
              <option value={14}>2주일</option>
              <option value={21}>3주일</option>
              <option value={30}>1개월</option>
            </select>
          </div>
        </div>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass glass-dark p-6 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">과거 5주 평균</p>
          <p className="text-3xl font-bold text-blue-600">{prediction.baselineAccuracy}%</p>
          <p className="text-xs text-gray-500 mt-2">baseline</p>
        </div>

        <div className="glass glass-dark p-6 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">예상 달성도</p>
          <p className="text-3xl font-bold text-pastel-purple">{prediction.predictedOutcome.expectedAccuracy}%</p>
          <p className="text-xs text-gray-500 mt-2">week {prediction.predictedOutcome.week}</p>
        </div>

        <div className={`glass glass-dark p-6 rounded-lg ${prediction.modelAccuracy >= 70 ? 'border-2 border-green-300' : 'border-2 border-yellow-300'}`}>
          <p className="text-sm text-gray-600 mb-2">모델 정확도</p>
          <p className={`text-3xl font-bold ${prediction.modelAccuracy >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
            {prediction.modelAccuracy}%
          </p>
          <p className="text-xs text-gray-500 mt-2">신뢰성</p>
        </div>

        <div className={`glass glass-dark p-6 rounded-lg ${prediction.trend === 'improving' ? 'border-l-4 border-green-400' : prediction.trend === 'declining' ? 'border-l-4 border-red-400' : 'border-l-4 border-gray-400'}`}>
          <p className="text-sm text-gray-600 mb-2">예상 추세</p>
          <p className={`text-2xl font-bold ${getTrendColor(prediction.trend)}`}>
            {getOutlookIcon(prediction.trend)} {prediction.trend === 'improving' ? '상승' : prediction.trend === 'declining' ? '하강' : '유지'}
          </p>
          <p className="text-xs text-gray-500 mt-2">{prediction.nextMilestoneEstimate}까지</p>
        </div>
      </div>

      {/* 예측 차트 - 과거 + 미래 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">정확도 추이 및 예측</h2>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              label={{ value: '주(week)', position: 'insideBottomRight', offset: -10 }}
            />
            <YAxis
              label={{ value: '정확도 (%)', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded border border-gray-300 shadow-lg">
                      <p className="font-semibold">Week {data.week}</p>
                      <p className="text-blue-600">정확도: {data.accuracy}%</p>
                      {data.isPrediction && (
                        <p className="text-xs text-gray-500">
                          신뢰도: {data.confidenceLow}% ~ {data.confidenceHigh}%
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />

            {/* 과거 데이터 */}
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#3B82F6"
              strokeWidth={2}
              name="과거 정확도"
              connectNulls
              dot={{ fill: '#3B82F6', r: 5 }}
            />

            {/* 예측 신뢰 구간 */}
            <Bar
              dataKey="confidenceHigh"
              fill="transparent"
              shape={<div />}
              name="신뢰 구간"
            />

            {/* 예측 영역 */}
            <Area
              type="monotone"
              dataKey="accuracy"
              fill="#D4A5FF"
              stroke="#D4A5FF"
              strokeWidth={2}
              fillOpacity={0.3}
              name="예측 범위"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 주별 예측 상세 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">주별 예측 상세</h2>
        <div className="space-y-3">
          {prediction.predictions.map((pred, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-pastel-purple" />
                  <span className="font-semibold text-gray-800">Week {pred.week} 예측</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-pastel-purple">{pred.predictedAccuracy}%</p>
                  <p className="text-xs text-gray-500">예상 정확도</p>
                </div>
              </div>

              {/* 신뢰도 범위 */}
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-1">
                  신뢰 구간: {pred.confidenceInterval.lower}% ~ {pred.confidenceInterval.upper}%
                </p>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-pastel-purple rounded-full h-2 transition-all"
                    style={{
                      width: `${pred.predictedAccuracy}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* 추세 표시 */}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${getTrendColor(pred.trend)}`}>
                  {getOutlookIcon(pred.trend)}{' '}
                  {pred.trend === 'improving' ? '상승 추세' : pred.trend === 'declining' ? '하강 추세' : '안정적'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 이정표 도달 예상 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 마일스톤 */}
        <div className="glass glass-dark p-6 rounded-lg border-2 border-green-300">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-gray-800 mb-2">예상 마일스톤</h3>
              <p className="text-green-600 font-semibold">
                {prediction.nextMilestoneEstimate}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                목표 달성 예상 날짜
              </p>
            </div>
          </div>
        </div>

        {/* 권장사항 */}
        <div className="glass glass-dark p-6 rounded-lg border-2 border-blue-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-gray-800 mb-2">전략적 권장</h3>
              <p className="text-blue-600 font-semibold">
                {prediction.trend === 'improving'
                  ? '현재 중재 계속 유지'
                  : prediction.trend === 'declining'
                  ? '중재 전략 검토 필요'
                  : '진도 유지 중'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {prediction.trend === 'improving'
                  ? '좋은 진행이 예상됩니다.'
                  : prediction.trend === 'declining'
                  ? '지원 강화를 권장합니다.'
                  : '현 상태를 모니터링하세요.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 모델 신뢰도 설명 */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">모델 정확도 {prediction.modelAccuracy}%:</span> 이 모델은 과거 {prediction.historicalData.length}주간의 데이터를 기반으로
          만들어졌습니다. 정확도가 높을수록 예측 신뢰도가 높습니다. 정기적인 검토를 통해 예측 모델을 개선할 수 있습니다.
        </p>
      </div>

      {/* 비교 분석 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">현황 분석</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">현재 평균</p>
            <p className="text-2xl font-bold text-blue-600">{prediction.baselineAccuracy}%</p>
            <p className="text-xs text-gray-500 mt-2">지난 5주 평균 정확도</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">향상도</p>
            <p className={`text-2xl font-bold ${prediction.predictedOutcome.expectedAccuracy > prediction.baselineAccuracy ? 'text-green-600' : 'text-red-600'}`}>
              {prediction.predictedOutcome.expectedAccuracy - prediction.baselineAccuracy > 0 ? '+' : ''}
              {prediction.predictedOutcome.expectedAccuracy - prediction.baselineAccuracy}%
            </p>
            <p className="text-xs text-gray-500 mt-2">예상 변화량</p>
          </div>
        </div>
      </div>
    </div>
  );
}
