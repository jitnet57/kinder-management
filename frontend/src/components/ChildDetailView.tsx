import React, { useState } from 'react';
import { ArrowLeft, Edit2, Trash2, Save, X, BarChart3 } from 'lucide-react';
import { useCurriculum, SessionTask } from '../context/CurriculumContext';
import { TaskGraphModal } from './TaskGraphModal';

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
  const { sessionTasks, updateSessionTask, deleteSessionTask, domains } = useCurriculum();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SessionTask> | null>(null);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [selectedTaskForGraph, setSelectedTaskForGraph] = useState<SessionTask | null>(null);

  // 아동의 과제 필터링
  const childTasks = sessionTasks.filter(task => task.childId === child.name);

  // 도메인명 찾기
  const getDomainName = (domainId: string) => {
    return domains.find(d => d.id === domainId)?.name || '선택안함';
  };

  // LTO명 찾기
  const getLTOName = (domainId: string, ltoId: string) => {
    const domain = domains.find(d => d.id === domainId);
    return domain?.ltos.find(l => l.id === ltoId)?.name || '선택안함';
  };

  // STO명 찾기
  const getSTOName = (domainId: string, ltoId: string, stoId: string) => {
    const domain = domains.find(d => d.id === domainId);
    const lto = domain?.ltos.find(l => l.id === ltoId);
    return lto?.stos.find(s => s.id === stoId)?.name || '선택안함';
  };

  const handleEditTask = (task: SessionTask) => {
    setEditingTaskId(task.id);
    setEditForm({ ...task });
  };

  const handleSaveTask = () => {
    if (!editingTaskId || !editForm) return;
    updateSessionTask(editingTaskId, {
      score: editForm.score || 0,
      notes: editForm.notes || '',
      date: editForm.date || '',
    });
    setEditingTaskId(null);
    setEditForm(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('이 과제를 삭제하시겠습니까?')) {
      deleteSessionTask(taskId);
    }
  };

  const handleShowGraph = (task: SessionTask) => {
    setSelectedTaskForGraph(task);
    setShowGraphModal(true);
  };

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

      {/* 과제 카드 목록 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">📝 과제 기록</h2>

        {childTasks.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-gray-500">
            <p>기록된 과제가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {childTasks.map(task => {
              const isEditing = editingTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className={`glass rounded-2xl p-6 border-l-4 transition-all ${
                    isEditing ? 'border-pastel-purple' : 'border-gray-300'
                  }`}
                  style={{
                    borderLeftColor: isEditing ? child.color : '#ccc',
                  }}
                >
                  {isEditing ? (
                    // 편집 모드
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            점수
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editForm?.score || 0}
                            onChange={(e) =>
                              setEditForm(prev => prev ? { ...prev, score: parseInt(e.target.value) } : null)
                            }
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            날짜
                          </label>
                          <input
                            type="date"
                            value={editForm?.date || ''}
                            onChange={(e) =>
                              setEditForm(prev => prev ? { ...prev, date: e.target.value } : null)
                            }
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          비고
                        </label>
                        <textarea
                          value={editForm?.notes || ''}
                          onChange={(e) =>
                            setEditForm(prev => prev ? { ...prev, notes: e.target.value } : null)
                          }
                          placeholder="관찰 내용, 특이사항 등을 입력하세요..."
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple resize-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveTask}
                          className="flex items-center gap-2 flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition"
                        >
                          <Save size={18} />
                          저장
                        </button>
                        <button
                          onClick={() => {
                            setEditingTaskId(null);
                            setEditForm(null);
                          }}
                          className="flex items-center gap-2 flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition"
                        >
                          <X size={18} />
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 보기 모드
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-800">
                              {getDomainName(task.domainId)} {'>'} {getLTOName(task.domainId, task.ltoId)} {'>'} {getSTOName(task.domainId, task.ltoId, task.stoId)}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="font-semibold">점수: <span className="text-lg text-pastel-purple">{task.score}점</span></span>
                            <span>날짜: {new Date(task.date).toLocaleDateString('ko-KR')}</span>
                          </div>
                          {task.notes && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowGraph(task)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition text-sm group/graph"
                        >
                          <BarChart3 size={16} className="group-hover/graph:scale-110 group-hover/graph:rotate-12 transition" />
                          그래프
                        </button>
                        <button
                          onClick={() => handleEditTask(task)}
                          className="flex items-center gap-2 px-4 py-2 bg-pastel-purple text-white rounded-lg hover:bg-opacity-90 font-semibold transition text-sm group/edit"
                        >
                          <Edit2 size={16} className="group-hover/edit:scale-110 group-hover/edit:-rotate-12 transition" />
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition text-sm group/delete"
                        >
                          <Trash2 size={16} className="group-hover/delete:scale-110 group-hover/delete:rotate-12 transition" />
                          삭제
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 그래프 모달 */}
      {selectedTaskForGraph && (
        <TaskGraphModal
          isOpen={showGraphModal}
          taskId={selectedTaskForGraph.id}
          childId={selectedTaskForGraph.childId}
          onClose={() => setShowGraphModal(false)}
        />
      )}
    </div>
  );
}
