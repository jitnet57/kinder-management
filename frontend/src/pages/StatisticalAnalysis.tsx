/**
 * StatisticalAnalysis.tsx - 고급 통계 분석
 * Phase 5 Stream P2.4
 */

import { useState } from 'react';
import { BarChart3, LineChart as LineChartIcon, TrendingUp } from 'lucide-react';
import { useStatistics } from '../context/StatisticsContext';

export function StatisticalAnalysis() {
  const { analyzeStatistics, analysisResults, getAnalysisResult } = useStatistics();
  const [childId, setChildId] = useState(1);
  const [ltoId, setLtoId] = useState('lto_1');
  const [periodStart, setPeriodStart] = useState('2024-01-01');
  const [periodEnd, setPeriodEnd] = useState('2024-01-31');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeStatistics(childId, ltoId, periodStart, periodEnd);
      setSelectedResult(result.id);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const result = selectedResult ? getAnalysisResult(selectedResult) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-pastel-purple">📊 고급 통계 분석</h1>
        <p className="text-gray-600 mt-2">t-test, Chi-square, 회귀 분석 등의 통계적 분석</p>
      </div>

      {/* 분석 설정 */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">분석 설정</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">아동</label>
            <select
              value={childId}
              onChange={(e) => setChildId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value={1}>민준</option>
              <option value={2}>소영</option>
              <option value={3}>지호</option>
              <option value={4}>연서</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">목표</label>
            <select
              value={ltoId}
              onChange={(e) => setLtoId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="lto_1">요청하기</option>
              <option value="lto_2">자기관리</option>
              <option value="lto_3">사회적 상호작용</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">시작 날짜</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">종료 날짜</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full mt-4 bg-pastel-purple text-white py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition font-bold"
        >
          {isAnalyzing ? '분석 중...' : '분석 실행'}
        </button>
      </div>

      {result && (
        <>
          {/* 기초 통계 */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={24} />
              기초 통계
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">평균</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result.descriptiveStats.mean.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">표준편차</p>
                <p className="text-2xl font-bold text-green-600">
                  {result.descriptiveStats.standardDeviation.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">최소값</p>
                <p className="text-2xl font-bold text-red-600">
                  {result.descriptiveStats.range.min}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">최대값</p>
                <p className="text-2xl font-bold text-purple-600">
                  {result.descriptiveStats.range.max}
                </p>
              </div>
            </div>
          </div>

          {/* 통계적 검정 */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">통계적 검정 결과</h2>
            <div className="space-y-4">
              {result.statisticalTests.map((test, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold capitalize">{test.name.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-600">
                        Test Value: {test.testValue.toFixed(4)}, p-value: {test.pValue.toFixed(4)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      test.isSignificant ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {test.isSignificant ? '유의함 (p<0.05)' : '유의하지 않음'}
                    </span>
                  </div>
                  {test.effectSize && (
                    <p className="text-sm text-gray-600">
                      효과 크기: {test.effectSize.toFixed(3)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 신뢰도 구간 */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">신뢰도 구간 (95%)</h2>
            <div className="space-y-4">
              {result.confidenceIntervals.map((ci, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <p className="font-medium">추정값: {ci.estimate.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{ci.confidenceLevel}% CI</p>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-1 bottom-1 bg-blue-500 opacity-50"
                      style={{
                        left: `${Math.max(0, (ci.lowerBound / 100) * 90)}%`,
                        right: `${Math.max(0, (1 - ci.upperBound / 100) * 90)}%`,
                      }}
                    ></div>
                    <div className="absolute top-1 h-6 w-1 bg-blue-600"
                         style={{ left: `${(ci.estimate / 100) * 90}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    [{ci.lowerBound.toFixed(2)}, {ci.upperBound.toFixed(2)}]
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 회귀 분석 */}
          {result.regressionAnalysis && (
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <LineChartIcon size={24} />
                회귀 분석
              </h2>
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-600">모델 타입</p>
                  <p className="font-bold capitalize">{result.regressionAnalysis.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">방정식</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                    {result.regressionAnalysis.equation}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">R² (설명도)</p>
                    <p className="text-xl font-bold">{(result.regressionAnalysis.rSquared * 100).toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">다음 예측값</p>
                    <p className="text-xl font-bold">{result.regressionAnalysis.prediction?.nextValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 결론 */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={24} />
              분석 결론
            </h2>
            <div className="space-y-2">
              {result.conclusions.map((conclusion, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <p className="text-gray-700">{conclusion}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!result && analysisResults.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-gray-600 text-lg">분석을 실행하여 통계 결과를 확인하세요.</p>
        </div>
      )}
    </div>
  );
}

export default StatisticalAnalysis;
