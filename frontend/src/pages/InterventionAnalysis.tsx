import React, { useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { CANONICAL_CHILDREN } from '../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Info, Download, RefreshCw } from 'lucide-react';

export function InterventionAnalysis() {
  const { analyzeInterventionEffectiveness } = useAnalytics();
  const [selectedChildId, setSelectedChildId] = useState<number>(1);
  const [selectedLtoId, setSelectedLtoId] = useState<string>('domain_mand_lto01');
  const [analysisResult, setAnalysisResult] = useState(
    analyzeInterventionEffectiveness(1, 'domain_mand_lto01', {
      start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    })
  );

  const handleAnalyze = () => {
    const result = analyzeInterventionEffectiveness(selectedChildId, selectedLtoId, {
      start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    });
    setAnalysisResult(result);
  };

  const chartData = analysisResult.interventions.map(int => ({
    name: int.interventionName,
    effectiveness: int.effectiveness,
    successRate: int.successRate,
    confidence: int.confidenceScore,
  }));

  const trendData = [
    { strategy: '사회적 강화', effectiveness: 85 },
    { strategy: '실물 강화', effectiveness: 78 },
    { strategy: '프롬프트', effectiveness: 82 },
    { strategy: '프롬프트 감소', effectiveness: 90 },
    { strategy: '소거', effectiveness: 65 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">1️⃣ 중재 효과 분석</h1>
          <p className="text-gray-600 mt-1">어떤 전략이 가장 효과적인가? (강화 방식 비교)</p>
        </div>
        <button
          onClick={handleAnalyze}
          className="flex items-center gap-2 bg-pastel-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          <RefreshCw size={20} />
          분석 실행
        </button>
      </div>

      {/* 선택 패널 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass glass-dark p-6 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">전체 진도</p>
          <p className="text-3xl font-bold text-pastel-purple">{analysisResult.overallProgress}%</p>
          <p className="text-xs text-gray-500 mt-2">{analysisResult.daysAnalyzed}일간 분석</p>
        </div>

        <div className="glass glass-dark p-6 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">총 시행 횟수</p>
          <p className="text-3xl font-bold text-green-600">{analysisResult.totalTrials}</p>
          <p className="text-xs text-gray-500 mt-2">trials</p>
        </div>

        <div className="glass glass-dark p-6 rounded-lg border-2 border-green-300">
          <p className="text-sm text-gray-600 mb-2">가장 효과적</p>
          <p className="text-lg font-bold text-green-600">{analysisResult.mostEffective.interventionName}</p>
          <p className="text-2xl font-bold text-green-600">{analysisResult.mostEffective.effectiveness}점</p>
        </div>

        <div className="glass glass-dark p-6 rounded-lg border-2 border-red-300">
          <p className="text-sm text-gray-600 mb-2">개선 필요</p>
          <p className="text-lg font-bold text-red-600">{analysisResult.leastEffective.interventionName}</p>
          <p className="text-2xl font-bold text-red-600">{analysisResult.leastEffective.effectiveness}점</p>
        </div>
      </div>

      {/* 중재 효과도 비교 차트 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">중재별 효과도 비교</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="effectiveness" fill="#D4A5FF" name="효과도" />
            <Bar dataKey="successRate" fill="#B4D7FF" name="성공률" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 레이더 차트 - 중재 전략 비교 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">중재 전략 효과도 분석</h2>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={trendData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="strategy" />
            <PolarRadiusAxis />
            <Radar name="효과도" dataKey="effectiveness" stroke="#D4A5FF" fill="#D4A5FF" fillOpacity={0.6} />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 상세 중재 정보 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">중재별 상세 분석</h2>
        <div className="space-y-4">
          {analysisResult.interventions.map(intervention => (
            <div
              key={intervention.interventionId}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{intervention.interventionName}</h3>
                  <p className="text-sm text-gray-600">전략: {intervention.strategy}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-pastel-purple">{intervention.effectiveness}점</p>
                  <p className="text-xs text-gray-500">효과도</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs text-gray-600">적용 횟수</p>
                  <p className="text-lg font-bold text-blue-600">{intervention.applicationsCount}</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs text-gray-600">성공률</p>
                  <p className="text-lg font-bold text-green-600">{intervention.successRate}%</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-xs text-gray-600">신뢰도</p>
                  <p className="text-lg font-bold text-purple-600">{intervention.confidenceScore}%</p>
                </div>
                <div className={`p-3 rounded ${intervention.trend === 'improving' ? 'bg-green-50' : intervention.trend === 'declining' ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-600">추세</p>
                  <p className={`text-lg font-bold ${intervention.trend === 'improving' ? 'text-green-600' : intervention.trend === 'declining' ? 'text-red-600' : 'text-gray-600'}`}>
                    {intervention.trend === 'improving' ? '📈 상승' : intervention.trend === 'declining' ? '📉 하강' : '➡️ 유지'}
                  </p>
                </div>
              </div>

              {/* 진행률 바 */}
              <div className="bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-pastel-purple rounded-full h-2 transition-all"
                  style={{ width: `${intervention.effectiveness}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 권장사항 */}
      <div className="glass glass-dark p-6 rounded-lg border-l-4 border-pastel-purple">
        <div className="flex gap-3">
          <Info className="flex-shrink-0 text-pastel-purple mt-1" size={24} />
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">전문가 권장사항</h2>
            <ul className="space-y-2">
              {analysisResult.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-2 text-gray-700">
                  <span className="text-pastel-purple font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 내보내기 */}
      <div className="flex gap-2">
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Download size={20} />
          PDF 다운로드
        </button>
        <button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
          <Download size={20} />
          Excel 다운로드
        </button>
      </div>
    </div>
  );
}
