import { useState } from 'react';
import { BarChart3, Edit, Trash2, Save, Plus, CheckCircle2, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';
import { TaskGraphModal } from '../components/TaskGraphModal';
import { CANONICAL_CHILDREN } from '../types';

export function SessionLog() {
  const { domains, sessionTasks, addSessionTask, updateSessionTask, deleteSessionTask, completeSessionTask, getTasksByChild } = useCurriculum();
  const [selectedChild, setSelectedChild] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedLTO, setSelectedLTO] = useState<string>('');
  const [selectedSTO, setSelectedSTO] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);

  const childTasks = getTasksByChild(selectedChild, selectedDate);
  const currentDomain = selectedDomain ? domains.find(d => d.id === selectedDomain) : null;
  const currentLTO = currentDomain && selectedLTO ? currentDomain.ltos.find(l => l.id === selectedLTO) : null;
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [selectedGraphTaskId, setSelectedGraphTaskId] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailTaskId, setSelectedDetailTaskId] = useState<string>('');

  const handleAddTask = () => {
    if (selectedDomain && selectedLTO && selectedSTO) {
      addSessionTask(selectedChild, selectedDomain, selectedLTO, selectedSTO, selectedDate);
      setSelectedDomain('');
      setSelectedLTO('');
      setSelectedSTO('');
      setShowAddForm(false);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    completeSessionTask(taskId);
  };

  const handleOpenGraph = (taskId: string) => {
    setSelectedGraphTaskId(taskId);
    setShowGraphModal(true);
  };

  const handleOpenDetail = (taskId: string) => {
    setSelectedDetailTaskId(taskId);
    setShowDetailModal(true);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">📝 데이터 기록지</h2>

      {/* 아동 선택 & 날짜 선택 */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">아동 선택</label>
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
          >
            {CANONICAL_CHILDREN.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">날짜 선택</label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() - 1);
                setSelectedDate(date.toISOString().split('T')[0]);
              }}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
              title="이전날"
            >
              <ChevronLeft size={20} />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
            />
            <button
              onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() + 1);
                setSelectedDate(date.toISOString().split('T')[0]);
              }}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
              title="다음날"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 과제 추가 폼 */}
      {showAddForm && (
        <div className="glass rounded-2xl p-6 mb-8 border border-pastel-purple border-opacity-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📚 과제 추가</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">발달영역</label>
              <select
                value={selectedDomain}
                onChange={(e) => {
                  setSelectedDomain(e.target.value);
                  setSelectedLTO('');
                  setSelectedSTO('');
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
              >
                <option value="">선택해주세요</option>
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">LTO (장기목표)</label>
              <select
                value={selectedLTO}
                onChange={(e) => {
                  setSelectedLTO(e.target.value);
                  setSelectedSTO('');
                }}
                disabled={!selectedDomain}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple disabled:bg-gray-100"
              >
                <option value="">선택해주세요</option>
                {currentDomain?.ltos.map(lto => (
                  <option key={lto.id} value={lto.id}>{lto.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">STO (단기목표)</label>
              <select
                value={selectedSTO}
                onChange={(e) => setSelectedSTO(e.target.value)}
                disabled={!selectedLTO}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple disabled:bg-gray-100"
              >
                <option value="">선택해주세요</option>
                {currentLTO?.stos.map(sto => (
                  <option key={sto.id} value={sto.id}>{sto.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              disabled={!selectedSTO}
              className="flex-1 px-4 py-2 bg-pastel-purple text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              추가
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 과제 카드 */}
      <div className="space-y-6">
        {childTasks.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">등록된 과제가 없습니다.</p>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 px-6 py-2 bg-pastel-purple text-white rounded-lg font-semibold hover:bg-opacity-90 group/add"
              >
                <Plus size={20} className="group-hover/add:scale-110 group-hover/add:rotate-90 transition" />
                과제 추가
              </button>
            )}
          </div>
        ) : (
          childTasks.map(task => {
            const domain = domains.find(d => d.id === task.domainId);
            const lto = domain?.ltos.find(l => l.id === task.ltoId);
            const sto = lto?.stos.find(s => s.id === task.stoId);
            const isEditing = editingId === task.id;

            return (
              <div key={task.id} className="glass rounded-2xl p-6">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{sto?.name || '로딩중...'}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {domain?.name} → {lto?.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenDetail(task.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition group"
                      title="상세보기"
                    >
                      <Eye size={20} className="text-gray-600 group-hover:text-pastel-purple group-hover:scale-110 transition" />
                    </button>
                    <button
                      onClick={() => handleOpenGraph(task.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition group"
                      title="그래프 보기"
                    >
                      <BarChart3 size={20} className="text-pastel-purple group-hover:scale-110 transition" />
                    </button>
                    <button
                      onClick={() => setEditingId(isEditing ? null : task.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition group/edit"
                      title="수정"
                    >
                      <Edit size={20} className="text-gray-600 group-hover/edit:text-blue-600 transition" />
                    </button>
                    <button
                      onClick={() => deleteSessionTask(task.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition group/delete"
                      title="삭제"
                    >
                      <Trash2 size={20} className="text-red-500 group-hover/delete:text-red-700 transition" />
                    </button>
                  </div>
                </div>

                {/* 입력 필드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">시작 시간</label>
                    <input
                      type="time"
                      value={task.startTime}
                      onChange={(e) => updateSessionTask(task.id, { startTime: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pastel-purple disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">종료 시간</label>
                    <input
                      type="time"
                      value={task.endTime}
                      onChange={(e) => updateSessionTask(task.id, { endTime: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pastel-purple disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">성과 점수</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={task.score}
                        onChange={(e) => updateSessionTask(task.id, { score: parseInt(e.target.value) })}
                        disabled={!isEditing}
                        className="flex-1 disabled:opacity-50"
                      />
                      <span className="text-sm font-bold text-pastel-purple w-12 text-right">
                        {task.score}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 비고 */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">비고</label>
                  <textarea
                    value={task.notes}
                    onChange={(e) => updateSessionTask(task.id, { notes: e.target.value })}
                    disabled={!isEditing}
                    placeholder="세션 중 특이사항을 기록해주세요..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pastel-purple resize-none disabled:bg-gray-50"
                    rows={3}
                  />
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-pastel-purple text-white rounded-lg font-semibold hover:bg-opacity-90"
                      >
                        <Save size={18} />
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingId(task.id)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 group/complete"
                      >
                        <CheckCircle2 size={18} className="group-hover/complete:scale-110 group-hover/complete:rotate-12 transition" />
                        완료
                      </button>
                    </>
                  )}
                </div>

                {/* 진행도 표시 */}
                <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                  <p className="text-xs text-gray-500 mb-2">오늘 성과: {task.score}점</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pastel-pink to-pastel-purple h-2 rounded-full"
                      style={{ width: `${task.score}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 과제 추가 버튼 */}
      {!showAddForm && childTasks.length > 0 && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-8 w-full px-6 py-3 border-2 border-dashed border-pastel-purple text-pastel-purple rounded-lg font-semibold hover:bg-pastel-purple hover:text-white transition flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          과제 추가
        </button>
      )}

      {/* 그래프 모달 */}
      <TaskGraphModal
        isOpen={showGraphModal}
        onClose={() => setShowGraphModal(false)}
        taskId={selectedGraphTaskId}
        childId={selectedChild}
      />

      {/* 상세보기 모달 */}
      {showDetailModal && (() => {
        const task = childTasks.find(t => t.id === selectedDetailTaskId);
        if (!task) return null;

        const domain = domains.find(d => d.id === task.domainId);
        const lto = domain?.ltos.find(l => l.id === task.ltoId);
        const sto = lto?.stos.find(s => s.id === task.stoId);

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{sto?.name}</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    {domain?.name} → {lto?.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">시작 시간</p>
                  <p className="text-sm font-bold text-gray-800">{task.startTime}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">종료 시간</p>
                  <p className="text-sm font-bold text-gray-800">{task.endTime}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">성과 점수</p>
                  <p className="text-2xl font-bold text-pastel-purple">{task.score}%</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">기록 날짜</p>
                  <p className="text-sm font-bold text-gray-800">{task.date}</p>
                </div>
              </div>

              {task.notes && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-600 mb-2">비고</p>
                  <p className="text-sm text-gray-700 bg-white bg-opacity-40 rounded-lg p-3">
                    {task.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-white border-opacity-30">
                <button
                  onClick={() => setEditingId(task.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 group/edit"
                >
                  <Edit size={18} className="group-hover/edit:text-white" />
                  수정
                </button>
                <button
                  onClick={() => {
                    deleteSessionTask(task.id);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 group/delete"
                >
                  <Trash2 size={18} className="group-hover/delete:text-white" />
                  삭제
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
