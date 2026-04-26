import { useState } from 'react';
import { useABC } from '../context/ABCContext';
import { ABCRecord, Antecedent, Behavior, Consequence } from '../types';
import { X, Plus, Camera } from 'lucide-react';

interface ABCRecorderProps {
  sessionTaskId: string;
  childId: number;
  ltoId: string;
  stoId: string;
  onClose: () => void;
  onSave?: (record: ABCRecord) => void;
}

export function ABCRecorder({
  sessionTaskId,
  childId,
  ltoId,
  stoId,
  onClose,
  onSave,
}: ABCRecorderProps) {
  const { recordABC } = useABC();
  const [mode, setMode] = useState<'quick' | 'detailed'>('quick');

  // Quick mode state
  const [quickAntecedent, setQuickAntecedent] = useState('');
  const [quickBehavior, setQuickBehavior] = useState('');
  const [quickConsequence, setQuickConsequence] = useState('');
  const [quickAccuracy, setQuickAccuracy] = useState<'correct' | 'incorrect' | 'partial'>('correct');

  // Detailed mode state
  const [antecedent, setAntecedent] = useState<Antecedent>({
    type: 'instruction',
    description: '',
    context: '',
  });

  const [behavior, setBehavior] = useState<Behavior>({
    targetBehavior: '',
    responseType: 'correct',
    latency: 0,
    dataPoints: {
      trials: 1,
      correctTrials: 1,
      accuracy: 100,
      independenceLevel: 'independent',
    },
  });

  const [consequence, setConsequence] = useState<Consequence>({
    type: 'reinforcement',
    reinforcementType: 'social',
    reinforcer: '',
  });

  const handleQuickSave = () => {
    if (!quickAntecedent || !quickBehavior || !quickConsequence) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const newRecord: Omit<ABCRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      sessionTaskId,
      childId,
      ltoId,
      stoId,
      antecedent: {
        type: 'instruction',
        description: quickAntecedent,
        context: '',
      },
      behavior: {
        targetBehavior: quickBehavior,
        responseType: quickAccuracy,
        latency: 0,
        dataPoints: {
          trials: 1,
          correctTrials: quickAccuracy !== 'incorrect' ? 1 : 0,
          accuracy: quickAccuracy === 'correct' ? 100 : quickAccuracy === 'partial' ? 50 : 0,
          independenceLevel: quickAccuracy === 'correct' ? 'independent' : 'partial',
        },
      },
      consequence: {
        type: 'reinforcement',
        description: quickConsequence,
        reinforcer: quickConsequence,
      },
      sessionDate: new Date().toISOString().split('T')[0],
      timeRecorded: new Date().toTimeString().slice(0, 5),
      recordedBy: {
        userId: 'current-user',
        name: '치료사',
        role: 'therapist',
      },
    };

    recordABC(newRecord);
    onClose();
  };

  const handleDetailedSave = () => {
    if (!antecedent.description || !behavior.targetBehavior || !consequence.reinforcer) {
      alert('필수 필드를 입력해주세요.');
      return;
    }

    const newRecord: Omit<ABCRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      sessionTaskId,
      childId,
      ltoId,
      stoId,
      antecedent,
      behavior,
      consequence,
      sessionDate: new Date().toISOString().split('T')[0],
      timeRecorded: new Date().toTimeString().slice(0, 5),
      recordedBy: {
        userId: 'current-user',
        name: '치료사',
        role: 'therapist',
      },
    };

    recordABC(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">ABC 데이터 기록</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex gap-4 p-6 border-b border-gray-200">
          <button
            onClick={() => setMode('quick')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              mode === 'quick'
                ? 'bg-pastel-purple text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            빠른 기록 (2-3초)
          </button>
          <button
            onClick={() => setMode('detailed')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              mode === 'detailed'
                ? 'bg-pastel-purple text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            상세 기록
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'quick' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  선행사건 (A)
                </label>
                <input
                  type="text"
                  value={quickAntecedent}
                  onChange={(e) => setQuickAntecedent(e.target.value)}
                  placeholder="예: 치료사가 '앉으세요'라고 지시"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  행동 (B)
                </label>
                <input
                  type="text"
                  value={quickBehavior}
                  onChange={(e) => setQuickBehavior(e.target.value)}
                  placeholder="예: 앉기"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  결과 (C)
                </label>
                <input
                  type="text"
                  value={quickConsequence}
                  onChange={(e) => setQuickConsequence(e.target.value)}
                  placeholder="예: 칭찬, 스티커"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  정확도
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['correct', 'partial', 'incorrect'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setQuickAccuracy(type)}
                      className={`py-3 px-4 rounded-lg font-semibold transition ${
                        quickAccuracy === type
                          ? 'bg-pastel-purple text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'correct' ? '✓ 정확' : type === 'partial' ? '~ 부분' : '✗ 부정확'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Antecedent Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">선행사건 (Antecedent)</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      유형
                    </label>
                    <select
                      value={antecedent.type}
                      onChange={(e) =>
                        setAntecedent({
                          ...antecedent,
                          type: e.target.value as Antecedent['type'],
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                    >
                      <option value="instruction">지시</option>
                      <option value="environmental">환경적</option>
                      <option value="internal">내부적</option>
                      <option value="transition">전환</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      설명
                    </label>
                    <textarea
                      value={antecedent.description}
                      onChange={(e) =>
                        setAntecedent({ ...antecedent, description: e.target.value })
                      }
                      placeholder="선행사건의 구체적인 설명"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      맥락
                    </label>
                    <input
                      type="text"
                      value={antecedent.context}
                      onChange={(e) =>
                        setAntecedent({ ...antecedent, context: e.target.value })
                      }
                      placeholder="예: 교실 내, 오전 시간"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                    />
                  </div>
                </div>
              </div>

              {/* Behavior Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">행동 (Behavior)</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      목표 행동
                    </label>
                    <input
                      type="text"
                      value={behavior.targetBehavior}
                      onChange={(e) =>
                        setBehavior({ ...behavior, targetBehavior: e.target.value })
                      }
                      placeholder="예: 앉기"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      반응 유형
                    </label>
                    <select
                      value={behavior.responseType}
                      onChange={(e) =>
                        setBehavior({
                          ...behavior,
                          responseType: e.target.value as Behavior['responseType'],
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                    >
                      <option value="correct">정확함</option>
                      <option value="incorrect">부정확함</option>
                      <option value="partial">부분적</option>
                      <option value="no_response">무반응</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        시도 횟수
                      </label>
                      <input
                        type="number"
                        value={behavior.dataPoints.trials}
                        onChange={(e) =>
                          setBehavior({
                            ...behavior,
                            dataPoints: {
                              ...behavior.dataPoints,
                              trials: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        정확한 시도
                      </label>
                      <input
                        type="number"
                        value={behavior.dataPoints.correctTrials}
                        onChange={(e) => {
                          const correct = parseInt(e.target.value) || 0;
                          const accuracy = (correct / behavior.dataPoints.trials) * 100;
                          setBehavior({
                            ...behavior,
                            dataPoints: {
                              ...behavior.dataPoints,
                              correctTrials: correct,
                              accuracy: Math.round(accuracy),
                            },
                          });
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      정확도: {behavior.dataPoints.accuracy}%
                    </label>
                  </div>
                </div>
              </div>

              {/* Consequence Section */}
              <div className="pb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">결과 (Consequence)</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      유형
                    </label>
                    <select
                      value={consequence.type}
                      onChange={(e) =>
                        setConsequence({
                          ...consequence,
                          type: e.target.value as Consequence['type'],
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                    >
                      <option value="reinforcement">강화</option>
                      <option value="punishment">처벌</option>
                      <option value="extinction">소거</option>
                      <option value="none">없음</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      강화자
                    </label>
                    <input
                      type="text"
                      value={consequence.reinforcer || ''}
                      onChange={(e) =>
                        setConsequence({ ...consequence, reinforcer: e.target.value })
                      }
                      placeholder="예: 칭찬, 스티커, 장난감"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      설명
                    </label>
                    <textarea
                      value={consequence.description || ''}
                      onChange={(e) =>
                        setConsequence({ ...consequence, description: e.target.value })
                      }
                      placeholder="결과의 구체적인 설명"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            취소
          </button>
          <button
            onClick={mode === 'quick' ? handleQuickSave : handleDetailedSave}
            className="px-6 py-3 bg-pastel-purple text-white rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center gap-2"
          >
            <Plus size={20} />
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
