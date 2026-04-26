import React, { useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { CANONICAL_CHILDREN } from '../types';
import { Lightbulb, AlertCircle, CheckCircle, Target, Sparkles, TrendingUp } from 'lucide-react';

export function AutoInsights() {
  const { generateInsights } = useAnalytics();
  const [selectedChildId, setSelectedChildId] = useState<number>(1);
  const [insights, setInsights] = useState(generateInsights(1));

  const handleGenerateInsights = () => {
    const result = generateInsights(selectedChildId);
    setInsights(result);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'improvement_area':
        return <AlertCircle className="text-orange-600" size={20} />;
      case 'intervention':
        return <TrendingUp className="text-blue-600" size={20} />;
      case 'next_focus':
        return <Target className="text-purple-600" size={20} />;
      default:
        return <Lightbulb className="text-yellow-600" size={20} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength':
        return 'bg-green-50 border-l-4 border-green-600';
      case 'improvement_area':
        return 'bg-orange-50 border-l-4 border-orange-600';
      case 'intervention':
        return 'bg-blue-50 border-l-4 border-blue-600';
      case 'next_focus':
        return 'bg-purple-50 border-l-4 border-purple-600';
      default:
        return 'bg-yellow-50 border-l-4 border-yellow-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'strength':
        return '💪 강점';
      case 'improvement_area':
        return '📈 개선 필요';
      case 'intervention':
        return '🎯 중재 효과';
      case 'next_focus':
        return '🎓 다음주 초점';
      default:
        return '💡 인사이트';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">4️⃣ 자동 인사이트 (AI)</h1>
          <p className="text-gray-600 mt-1">조언 자동 생성: "이 주에 특히 개선됨", "다음주 집중 추천"</p>
        </div>
        <button
          onClick={handleGenerateInsights}
          className="flex items-center gap-2 bg-pastel-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          <Sparkles size={20} />
          인사이트 생성
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">분석 기간</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 cursor-not-allowed">
              <option>Week {insights.weekNumber} ({insights.dateRange.start} ~ {insights.dateRange.end})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 종합 요약 */}
      <div className="glass glass-dark p-6 rounded-lg border-2 border-pastel-purple">
        <div className="flex items-start gap-4">
          <Lightbulb className="text-pastel-purple flex-shrink-0 mt-1" size={32} />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-2">주간 종합 평가</h2>
            <p className="text-gray-700 leading-relaxed">{insights.summary.overallProgress}</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-blue-800 mb-2">📌 주요 강점</p>
                <ul className="space-y-1">
                  {insights.summary.keyStrengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-blue-700 flex items-center gap-2">
                      <span className="text-blue-600">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-orange-800 mb-2">🎯 집중 영역</p>
                <ul className="space-y-1">
                  {insights.summary.areasToFocus.map((area, idx) => (
                    <li key={idx} className="text-sm text-orange-700 flex items-center gap-2">
                      <span className="text-orange-600">•</span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
              <p className="text-sm font-semibold text-purple-800 mb-1">📚 다음주 초점</p>
              <p className="text-sm text-purple-700">{insights.summary.nextWeekFocus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 개별 인사이트 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">상세 인사이트</h2>

        {insights.insights.map(insight => (
          <div
            key={insight.id}
            className={`${getCategoryColor(insight.category)} p-6 rounded-lg`}
          >
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                {getCategoryIcon(insight.category)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-800">{insight.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityColor(insight.priority)}`}>
                      {insight.priority === 'high' ? '긴급' : insight.priority === 'normal' ? '일반' : '낮음'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{insight.description}</p>
                </div>
              </div>

              {/* 영향도 배지 */}
              <div className="ml-4 flex-shrink-0">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getImpactColor(insight.estimatedImpact)}`}>
                  {insight.estimatedImpact === 'high' ? '높음' : insight.estimatedImpact === 'medium' ? '중간' : '낮음'}
                </span>
              </div>
            </div>

            {/* 근거 데이터 */}
            {insight.evidence.length > 0 && (
              <div className="mb-4 p-3 bg-white bg-opacity-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-2">📊 근거 데이터</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {insight.evidence.map((evidence, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="text-gray-600 text-xs">{evidence.data_point}</p>
                      <p className="font-bold text-gray-800">{evidence.value}</p>
                      <p className="text-xs text-gray-500">{evidence.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 실행 항목 */}
            {insight.actionItems && insight.actionItems.length > 0 && (
              <div className="p-3 bg-white bg-opacity-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-2">✅ 권장 조치</p>
                <ul className="space-y-1">
                  {insight.actionItems.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-pastel-purple cursor-pointer"
                        defaultChecked={false}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 분석 메타데이터 */}
      <div className="glass glass-dark p-6 rounded-lg">
        <h2 className="text-lg font-bold text-gray-800 mb-4">분석 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">생성 시간</p>
            <p className="font-semibold text-gray-800 text-sm">
              {new Date(insights.generatedAt).toLocaleString('ko-KR')}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">인사이트 수</p>
            <p className="font-semibold text-gray-800 text-2xl">{insights.insights.length}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">모델 버전</p>
            <p className="font-semibold text-gray-800 text-sm">{insights.modelVersion}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">분석 기간</p>
            <p className="font-semibold text-gray-800 text-sm">
              {insights.dateRange.start} ~ {insights.dateRange.end}
            </p>
          </div>
        </div>
      </div>

      {/* 사용 가이드 */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
        <p className="font-semibold text-blue-800 mb-2">💡 AI 인사이트 사용 가이드</p>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>
            <span className="font-semibold">강점 (💪):</span> 아동이 잘하는 부분입니다. 이를 강화하세요.
          </li>
          <li>
            <span className="font-semibold">개선 필요 (📈):</span> 추가 지원이 필요한 영역입니다. 권장 조치를 참고하세요.
          </li>
          <li>
            <span className="font-semibold">중재 효과 (🎯):</span> 현재 중재의 효과를 분석합니다. 계속 모니터링하세요.
          </li>
          <li>
            <span className="font-semibold">다음주 초점 (🎓):</span> 예측된 다음 학습 방향입니다. 교육 계획에 반영하세요.
          </li>
        </ul>
      </div>

      {/* 내보내기 */}
      <div className="flex gap-2">
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
          <Sparkles size={20} />
          부모에게 공유
        </button>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          📄 보고서 생성
        </button>
        <button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
          💾 저장
        </button>
      </div>
    </div>
  );
}
