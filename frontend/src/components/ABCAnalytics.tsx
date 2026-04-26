import { useMemo, useState } from 'react';
import { useABC } from '../context/ABCContext';
import { CANONICAL_CHILDREN } from '../types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ABCAnalyticsProps {
  childId?: number;
  ltoId?: string;
}

export function ABCAnalytics({ childId = 1, ltoId }: ABCAnalyticsProps) {
  const { abcRecords, analyzePatterns, getInsights } = useABC();
  const [selectedChild, setSelectedChild] = useState(childId);
  const [selectedLTO, setSelectedLTO] = useState(ltoId || 'all');

  const pattern = useMemo(() => {
    if (!selectedLTO || selectedLTO === 'all') {
      return null;
    }
    return analyzePatterns(selectedChild, selectedLTO);
  }, [selectedChild, selectedLTO, analyzePatterns]);

  const filteredRecords = useMemo(() => {
    let records = abcRecords.filter(r => r.childId === selectedChild);
    if (selectedLTO && selectedLTO !== 'all') {
      records = records.filter(r => r.ltoId === selectedLTO);
    }
    return records;
  }, [abcRecords, selectedChild, selectedLTO]);

  const insights = useMemo(() => {
    if (pattern) {
      return getInsights(pattern.id);
    }
    return [];
  }, [pattern, getInsights]);

  // Chart data preparation
  const accuracyByDate = useMemo(() => {
    const grouped: { [key: string]: { sum: number; count: number } } = {};
    filteredRecords.forEach(r => {
      const date = new Date(r.sessionDate).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      });
      if (!grouped[date]) grouped[date] = { sum: 0, count: 0 };
      grouped[date].sum += r.behavior.dataPoints.accuracy;
      grouped[date].count += 1;
    });
    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        accuracy: Math.round(data.sum / data.count),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredRecords]);

  const antecedentEffectiveness = useMemo(() => {
    const map: {
      [key: string]: { correct: number; total: number; type: string };
    } = {};
    filteredRecords.forEach(r => {
      const desc = r.antecedent.description;
      if (!map[desc]) {
        map[desc] = { correct: 0, total: 0, type: r.antecedent.type };
      }
      map[desc].total++;
      if (r.behavior.responseType === 'correct') {
        map[desc].correct++;
      }
    });

    return Object.entries(map)
      .map(([desc, data]) => ({
        name: desc.substring(0, 20) + (desc.length > 20 ? '...' : ''),
        effectiveness: Math.round((data.correct / data.total) * 100),
        fullName: desc,
      }))
      .sort((a, b) => b.effectiveness - a.effectiveness);
  }, [filteredRecords]);

  const responseTypeDistribution = useMemo(() => {
    const counts = {
      correct: 0,
      incorrect: 0,
      partial: 0,
      no_response: 0,
    };
    filteredRecords.forEach(r => {
      counts[r.behavior.responseType]++;
    });
    return Object.entries(counts).map(([type, count]) => ({
      name: type === 'correct' ? '정확' : type === 'incorrect' ? '부정확' : type === 'partial' ? '부분' : '무반응',
      value: count,
      color: type === 'correct' ? '#7CB342' : type === 'incorrect' ? '#F44336' : type === 'partial' ? '#FF9800' : '#9E9E9E',
    }));
  }, [filteredRecords]);

  const independenceLevel = useMemo(() => {
    const levels = { independent: 0, partial: 0, assisted: 0 };
    filteredRecords.forEach(r => {
      levels[r.behavior.dataPoints.independenceLevel]++;
    });
    return [
      { name: '독립적', value: levels.independent, color: '#2196F3' },
      { name: '부분적', value: levels.partial, color: '#FFC107' },
      { name: '지원 필요', value: levels.assisted, color: '#F44336' },
    ];
  }, [filteredRecords]);

  const consequenceEffectiveness = useMemo(() => {
    const map: { [key: string]: { positive: number; total: number } } = {};
    filteredRecords.forEach(r => {
      const key = r.consequence.reinforcer || '없음';
      if (!map[key]) {
        map[key] = { positive: 0, total: 0 };
      }
      map[key].total++;
      if (r.consequence.effectOnBehavior === 'increased') {
        map[key].positive++;
      }
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name: name.substring(0, 15) + (name.length > 15 ? '...' : ''),
        effectiveness: Math.round((data.positive / data.total) * 100),
      }))
      .sort((a, b) => b.effectiveness - a.effectiveness);
  }, [filteredRecords]);

  const COLORS = ['#2196F3', '#FF9800', '#F44336', '#4CAF50', '#9C27B0', '#00BCD4'];

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ABC 분석 대시보드</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">아동 선택</label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
            >
              {CANONICAL_CHILDREN.map(child => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">LTO 선택</label>
            <select
              value={selectedLTO}
              onChange={(e) => setSelectedLTO(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
            >
              <option value="all">모든 LTO</option>
              <option value="domain_mand_lto01">만드기 - LTO 1</option>
              <option value="domain_tact_lto01">접촉 - LTO 1</option>
              <option value="domain_mand_lto02">만드기 - LTO 2</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          총 {filteredRecords.length}개의 ABC 기록 분석 중
        </p>
      </div>

      {/* Summary cards */}
      {pattern && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">평균 정확도</p>
                <p className="text-3xl font-bold text-pastel-purple">
                  {pattern.behaviorPatterns.averageAccuracy}%
                </p>
              </div>
              <CheckCircle size={40} className="text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">독립성 향상</p>
                <p className="text-3xl font-bold text-blue-500">
                  {pattern.behaviorPatterns.independenceImprovement > 0 ? '+' : ''}
                  {pattern.behaviorPatterns.independenceImprovement}%
                </p>
              </div>
              <TrendingUp size={40} className="text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">일관성 점수</p>
                <p className="text-3xl font-bold text-orange-500">
                  {Math.round(pattern.behaviorPatterns.consistencyScore)}
                </p>
              </div>
              <Info size={40} className="text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">기록 수</p>
                <p className="text-3xl font-bold text-purple-500">
                  {pattern.totalRecords}
                </p>
              </div>
              <Info size={40} className="text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">정확도 추세</h3>
          {accuracyByDate.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#2196F3"
                  strokeWidth={2}
                  dot={{ fill: '#2196F3', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="정확도"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
          )}
        </div>

        {/* Response Type Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">반응 유형 분포</h3>
          {responseTypeDistribution.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={responseTypeDistribution.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {responseTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
          )}
        </div>

        {/* Antecedent Effectiveness */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">선행사건 효과성</h3>
          {antecedentEffectiveness.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={antecedentEffectiveness}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="effectiveness" fill="#7CB342" name="효과성" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
          )}
        </div>

        {/* Independence Level */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">독립성 수준</h3>
          {independenceLevel.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={independenceLevel.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {independenceLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
          )}
        </div>

        {/* Consequence Effectiveness */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">결과(강화자) 효과성</h3>
          {consequenceEffectiveness.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consequenceEffectiveness}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="effectiveness" fill="#FF9800" name="효과성" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
          )}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">인사이트 및 권장사항</h3>
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {pattern && pattern.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">AI 기반 권장사항</h3>
          <div className="space-y-2">
            {pattern.recommendations.map((rec, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
