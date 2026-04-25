import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';

interface Child {
  id: number;
  name: string;
  birthDate: string;
  phone: string;
  address: string;
  notes: string;
  color: string;
  photo: string | null;
}

interface ChildDetailViewProps {
  child: Child;
  onBack: () => void;
}

export function ChildDetailView({ child, onBack }: ChildDetailViewProps) {
  const { completionTasks } = useCurriculum();
  const [activeTab, setActiveTab] = useState<'progress' | 'stats' | 'overall'>('progress');

  // 아동의 완료 과제 필터링
  const childTasks = completionTasks.filter(task => task.childId === child.name);

  // 계산 데이터
  const totalSessions = childTasks.length;
  const avgScore = childTasks.length > 0
    ? Math.round(childTasks.reduce((sum, task) => sum + task.score, 0) / childTasks.length)
    : 0;

  // 진도 추적용 차트 데이터
  const progressData = childTasks.slice(-7).map((task, idx) => ({
    date: `일 ${idx + 1}`,
    score: task.score,
    completedAt: task.completedAt,
  }));

  // 발달영역별 점수
  const domainScores = completionTasks
    .filter(task => task.childId === child.name)
    .reduce((acc: Record<string, number[]>, task) => {
      const key = task.domainId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(task.score);
      return acc;
    }, {});

  const domainChartData = Object.entries(domainScores).map(([domainId, scores]) => ({
    name: domainId,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-200 rounded-lg transition"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: child.color }}
          >
            {child.name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{child.name}</h1>
            <p className="text-gray-600">{child.phone} · {child.address}</p>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'progress'
              ? 'border-pastel-purple text-pastel-purple'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          📈 진도 추적
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'stats'
              ? 'border-pastel-purple text-pastel-purple'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          📊 아이별 진도
        </button>
        <button
          onClick={() => setActiveTab('overall')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'overall'
              ? 'border-pastel-purple text-pastel-purple'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          📋 전체 통계
        </button>
      </div>

      {/* 진도 추적 탭 */}
      {activeTab === 'progress' && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">📈 진도 추적</h2>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={child.color}
                  name="점수"
                  strokeWidth={2}
                  dot={{ fill: child.color, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              완료된 과제가 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 아이별 진도 탭 */}
      {activeTab === 'stats' && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">📊 아이별 진도</h2>
          <p className="text-gray-600 mb-6">아이를 선택하여 진도를 확인하세요.</p>
          {domainChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={domainChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg" fill={child.color} name="평균 점수" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              데이터가 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 전체 통계 탭 */}
      {activeTab === 'overall' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">📋 전체 통계</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-pastel-purple to-pastel-pink rounded-lg p-6 text-white">
                <p className="text-sm font-medium opacity-90">총 세션 시간</p>
                <p className="text-3xl font-bold">{totalSessions}분</p>
              </div>
              <div className="bg-gradient-to-br from-pastel-blue to-pastel-purple rounded-lg p-6 text-white">
                <p className="text-sm font-medium opacity-90">평균 세션 길이</p>
                <p className="text-3xl font-bold">0분</p>
              </div>
              <div className="bg-gradient-to-br from-pastel-teal to-pastel-green rounded-lg p-6 text-white">
                <p className="text-sm font-medium opacity-90">이번 주 세션</p>
                <p className="text-3xl font-bold">{childTasks.filter(t => {
                  const taskDate = new Date(t.completedAt || '');
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return taskDate >= weekAgo;
                }).length}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">평균 점수: {avgScore}점</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">점수 범위</span>
                <span className="font-semibold">
                  {childTasks.length > 0
                    ? `${Math.min(...childTasks.map(t => t.score))} ~ ${Math.max(...childTasks.map(t => t.score))}`
                    : '데이터 없음'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">총 완료 과제</span>
                <span className="font-semibold">{totalSessions}개</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
