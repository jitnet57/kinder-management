import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit, Save, X, CheckCircle2 } from 'lucide-react';
// import { exportCompletionToExcel } from '../utils/exportUtils';
import { useCurriculum } from '../context/CurriculumContext';

const CHILDREN = ['민준', '소영', '지호', '연서'];

export function Completion() {
  const { completionTasks, domains } = useCurriculum();
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [selectedSort, setSelectedSort] = useState('latest');

  // 필터링된 완료 과제
  const filteredTasks = completionTasks
    .filter(task => !selectedChild || task.childId === selectedChild)
    .sort((a, b) => {
      if (selectedSort === 'latest') {
        return new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime();
      }
      return new Date(a.completedAt || '').getTime() - new Date(b.completedAt || '').getTime();
    });

  // 통계 계산
  const thisWeekTasks = filteredTasks.filter(task => {
    const taskDate = new Date(task.completedAt || '');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return taskDate >= weekAgo;
  });

  const avgScore = filteredTasks.length > 0
    ? Math.round(filteredTasks.reduce((sum, task) => sum + task.score, 0) / filteredTasks.length)
    : 0;

  // 과제명 찾기
  const getTaskName = (task: any) => {
    const domain = domains.find(d => d.id === task.domainId);
    const lto = domain?.ltos.find(l => l.id === task.ltoId);
    const sto = lto?.stos.find(s => s.id === task.stoId);
    return sto?.name || '로딩중...';
  };

  // 도메인명 찾기
  const getDomainName = (task: any) => {
    const domain = domains.find(d => d.id === task.domainId);
    return domain?.name || '로딩중...';
  };

  // Excel 내보내기 데이터 준비
  const exportData = filteredTasks.map(task => ({
    아동: task.childId,
    과제: getTaskName(task),
    영역: getDomainName(task),
    점수: task.score,
    완료시간: task.completedAt ? new Date(task.completedAt).toLocaleString('ko-KR') : '',
    비고: task.notes,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">✅ 완료목록</h2>
        {/* Export feature coming soon */}
      </div>

      {/* 필터 */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pastel-purple"
        >
          <option value="">전체 아동</option>
          {CHILDREN.map(child => (
            <option key={child} value={child}>{child}</option>
          ))}
        </select>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pastel-purple"
        >
          <option value="week">이번 주</option>
          <option value="lastweek">지난 주</option>
          <option value="month">이번 달</option>
          <option value="all">전체</option>
        </select>
        <select
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pastel-purple"
        >
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6 bg-gradient-to-br from-pastel-purple to-pastel-pink">
          <p className="text-white text-sm mb-2 font-semibold opacity-90">📊 이번 주 완료수</p>
          <p className="text-4xl font-bold text-white">{thisWeekTasks.length}</p>
        </div>
        <div className="glass rounded-2xl p-6 bg-gradient-to-br from-pastel-teal to-pastel-purple">
          <p className="text-white text-sm mb-2 font-semibold opacity-90">📋 총 완료수</p>
          <p className="text-4xl font-bold text-white">{filteredTasks.length}</p>
        </div>
        <div className="glass rounded-2xl p-6 bg-gradient-to-br from-pastel-pink to-pastel-teal">
          <p className="text-white text-sm mb-2 font-semibold opacity-90">⭐ 평균 점수</p>
          <p className="text-4xl font-bold text-white">{avgScore}점</p>
        </div>
      </div>

      {/* 완료목록 */}
      {filteredTasks.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <CheckCircle2 size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">완료된 과제가 없습니다.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white bg-opacity-30 border-b border-white border-opacity-30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">상태</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">아동</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">영역</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">과제</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">점수</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">완료 시간</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} className="border-b border-white border-opacity-20 hover:bg-white hover:bg-opacity-50 last:border-0 transition group">
                  <td className="px-6 py-4 group-hover:text-green-600">
                    <CheckCircle2 size={20} className="text-green-500 group-hover:text-green-700 transition" />
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800 group-hover:text-gray-900">{task.childId}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 group-hover:text-gray-900">{getDomainName(task)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 group-hover:text-gray-900">{getTaskName(task)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-pastel-purple group-hover:text-pastel-purple group-hover:drop-shadow-sm">{task.score}점</td>
                  <td className="px-6 py-4 text-sm text-gray-600 group-hover:text-gray-900">
                    {task.completedAt ? new Date(task.completedAt).toLocaleString('ko-KR') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
