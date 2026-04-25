import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { X } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';

interface TaskGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  childId: string;
}

export function TaskGraphModal({ isOpen, onClose, taskId, childId }: TaskGraphModalProps) {
  const { sessionTasks, completionTasks, domains } = useCurriculum();

  if (!isOpen) return null;

  // 현재 과제 찾기
  const allTasks = [...sessionTasks, ...completionTasks];
  const currentTask = allTasks.find(t => t.id === taskId);

  if (!currentTask) return null;

  // 같은 STO의 모든 완료된 과제 찾기 (7일분)
  const relatedTasks = allTasks
    .filter(t =>
      t.stoId === currentTask.stoId &&
      t.childId === childId &&
      t.completed
    )
    .sort((a, b) => new Date(a.completedAt || '').getTime() - new Date(b.completedAt || '').getTime())
    .slice(-7); // 최근 7개

  // 도메인, LTO, STO 이름 찾기
  const domain = domains.find(d => d.id === currentTask.domainId);
  const lto = domain?.ltos.find(l => l.id === currentTask.ltoId);
  const sto = lto?.stos.find(s => s.id === currentTask.stoId);

  // 차트 데이터 준비
  const chartData = relatedTasks.map((task) => ({
    date: new Date(task.completedAt || '').toLocaleDateString('ko-KR', {
      month: 'numeric',
      day: 'numeric'
    }),
    점수: task.score,
    시간: parseInt(task.endTime.split(':')[0]) - parseInt(task.startTime.split(':')[0]),
  }));

  // 통계 계산
  const avgScore = chartData.length > 0
    ? Math.round(chartData.reduce((sum, d) => sum + d.점수, 0) / chartData.length)
    : 0;
  const maxScore = chartData.length > 0 ? Math.max(...chartData.map(d => d.점수)) : 0;
  const minScore = chartData.length > 0 ? Math.min(...chartData.map(d => d.점수)) : 0;
  const trend = chartData.length > 1
    ? chartData[chartData.length - 1].점수 - chartData[0].점수
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{sto?.name}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {domain?.name} → {lto?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* 통계 박스 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-lg p-4 bg-gradient-to-br from-pastel-purple to-pastel-pink">
            <p className="text-xs text-white opacity-90 mb-1">평균 점수</p>
            <p className="text-2xl font-bold text-white">{avgScore}점</p>
          </div>
          <div className="glass rounded-lg p-4 bg-gradient-to-br from-pastel-teal to-pastel-purple">
            <p className="text-xs text-white opacity-90 mb-1">최고 점수</p>
            <p className="text-2xl font-bold text-white">{maxScore}점</p>
          </div>
          <div className="glass rounded-lg p-4 bg-gradient-to-br from-pastel-pink to-pastel-teal">
            <p className="text-xs text-white opacity-90 mb-1">최저 점수</p>
            <p className="text-2xl font-bold text-white">{minScore}점</p>
          </div>
          <div className={`glass rounded-lg p-4 ${trend >= 0 ? 'bg-gradient-to-br from-green-400 to-green-500' : 'bg-gradient-to-br from-red-400 to-red-500'}`}>
            <p className="text-xs text-white opacity-90 mb-1">추이</p>
            <p className="text-2xl font-bold text-white">{trend >= 0 ? '↗️' : '↘️'} {Math.abs(trend)}점</p>
          </div>
        </div>

        {/* 차트 */}
        {chartData.length > 0 ? (
          <div className="space-y-8">
            {/* 선형 차트 - 점수 추이 */}
            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📈 점수 추이 (7일)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="점수"
                    stroke="#a78bfa"
                    strokeWidth={3}
                    dot={{ fill: '#a78bfa', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 막대 차트 - 점수 비교 */}
            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📊 일일 점수 비교</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="점수" fill="#f472b6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 영역 차트 - 누적 성과 */}
            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🌊 성과 누적</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="점수"
                    fill="#a78bfa"
                    stroke="#a78bfa"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 상세 데이터 테이블 */}
            <div className="glass rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-white bg-opacity-30 border-b border-white border-opacity-30">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">날짜</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">점수</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">시간</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {relatedTasks.map((task) => (
                    <tr key={task.id} className="border-b border-white border-opacity-20 hover:bg-white hover:bg-opacity-30 last:border-0 transition">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(task.completedAt || '').toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-pastel-purple">{task.score}점</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {task.startTime} ~ {task.endTime}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 truncate">{task.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">아직 완료된 데이터가 없습니다.</p>
          </div>
        )}

        {/* 닫기 버튼 */}
        <div className="mt-8 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
