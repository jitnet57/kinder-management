import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
// import { exportScheduleToExcel, exportScheduleToWord } from '../utils/exportUtils';

const DAYS = ['월', '화', '수', '목', '금', '토'];
const TIME_SLOTS = [
  { label: '오전 8-10', start: 8, end: 10 },
  { label: '오전 10-12', start: 10, end: 12 },
  { label: '오후 2-4', start: 14, end: 16 },
  { label: '오후 4-6', start: 16, end: 18 },
];

const CHILDREN_LIST = [
  { id: 'c1', name: '민준', color: '#FFB6D9', initials: 'M' },
  { id: 'c2', name: '소영', color: '#B4D7FF', initials: 'S' },
  { id: 'c3', name: '지호', color: '#C1FFD7', initials: 'J' },
  { id: 'c4', name: '연서', color: '#FFE4B5', initials: 'Y' },
];

const getChildById = (id: string) => CHILDREN_LIST.find(c => c.id === id);

export function Schedule() {
  const { sessions, addSession, updateSession, deleteSession, getSessionsByDayAndSlot } = useSchedule();
  const [selectedCount] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; slot: number } | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // 추가 폼 상태
  const [formData, setFormData] = useState({
    childId: 'c1',
    sessionName: '',
  });

  const handleAddSession = (dayOfWeek: number, timeSlotIndex: number) => {
    setSelectedSlot({ day: dayOfWeek, slot: timeSlotIndex });
    setFormData({ childId: 'c1', sessionName: '' });
    setShowAddForm(true);
  };

  const handleSubmitSession = () => {
    if (!selectedSlot || !formData.sessionName.trim()) return;

    const child = getChildById(formData.childId);
    if (!child) return;

    const timeSlot = TIME_SLOTS[selectedSlot.slot];

    addSession({
      dayOfWeek: selectedSlot.day,
      timeSlotIndex: selectedSlot.slot,
      childId: formData.childId,
      childName: child.name,
      sessionName: formData.sessionName,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      color: child.color,
    });

    setShowAddForm(false);
    setSelectedSlot(null);
    setFormData({ childId: 'c1', sessionName: '' });
  };

  const mockSchedules = sessions.map(session => ({
    dayOfWeek: DAYS[session.dayOfWeek],
    startTime: session.startTime,
    endTime: session.endTime,
    childId: session.childId,
    childName: session.childName,
    sessionName: session.sessionName,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">📅 주간 스케줄</h2>
        {/* Export functionality coming soon */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-200 rounded">
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-600 w-40 text-center">
            2026년 4월 26일 (이번주)
          </span>
          <button className="p-2 hover:bg-gray-200 rounded">
            <ChevronRight size={24} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* 범례 */}
      <div className="mb-6 flex flex-wrap gap-4">
        {CHILDREN_LIST.map(child => (
          <div key={child.id} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded text-white text-xs flex items-center justify-center font-bold"
              style={{ backgroundColor: child.color }}
            >
              {child.initials}
            </div>
            <span className="text-sm text-gray-600">{child.name}</span>
          </div>
        ))}
      </div>

      {/* 추가 폼 */}
      {showAddForm && selectedSlot && (
        <div className="glass rounded-2xl p-6 mb-8 border border-pastel-purple border-opacity-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {DAYS[selectedSlot.day]}요일 {TIME_SLOTS[selectedSlot.slot].label} - 스케줄 추가
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">아동 선택</label>
              <select
                value={formData.childId}
                onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
              >
                {CHILDREN_LIST.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">세션명</label>
              <input
                type="text"
                value={formData.sessionName}
                onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                placeholder="예: 발음, 인지, 색상..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmitSession}
              disabled={!formData.sessionName.trim()}
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

      {/* 시간표 */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white border-opacity-30 bg-white bg-opacity-30">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-24">시간</th>
                {DAYS.map((day, idx) => (
                  <th key={day} className="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-36">
                    {day}요일
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot, slotIdx) => (
                <tr key={slot.label} className="border-b border-white border-opacity-20 last:border-0">
                  <td className="px-6 py-4 text-xs font-semibold text-gray-600 bg-white bg-opacity-20">
                    {slot.label}
                  </td>
                  {DAYS.map((_, dayIdx) => {
                    const daySessions = getSessionsByDayAndSlot(dayIdx, slotIdx);
                    return (
                      <td
                        key={`${dayIdx}-${slotIdx}`}
                        className="px-6 py-4 text-center min-h-28 bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
                      >
                        <div className="flex flex-col gap-2">
                          {daySessions.map((session) => {
                            const child = getChildById(session.childId);
                            const isEditing = editingSessionId === session.id;
                            return (
                              <div
                                key={session.id}
                                className="px-2 py-2 rounded-lg text-white text-xs font-semibold group"
                                style={{ backgroundColor: session.color }}
                              >
                                {isEditing ? (
                                  <div className="space-y-1">
                                    <input
                                      type="text"
                                      value={session.sessionName}
                                      onChange={(e) => updateSession(session.id, { sessionName: e.target.value })}
                                      className="w-full px-2 py-1 text-xs rounded bg-white bg-opacity-30 text-white"
                                    />
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => setEditingSessionId(null)}
                                        className="flex-1 px-1 py-1 bg-white bg-opacity-30 rounded text-xs hover:bg-opacity-50"
                                      >
                                        저장
                                      </button>
                                      <button
                                        onClick={() => setEditingSessionId(null)}
                                        className="flex-1 px-1 py-1 bg-white bg-opacity-30 rounded text-xs hover:bg-opacity-50"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col justify-between h-full">
                                    <div>
                                      <div className="text-xs font-bold">[{child?.initials}]</div>
                                      <div className="text-xs">{session.sessionName}</div>
                                      <div className="text-xs opacity-80">{session.startTime}시-{session.endTime}시</div>
                                    </div>
                                    <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition">
                                      <button
                                        onClick={() => setEditingSessionId(session.id)}
                                        className="flex-1 px-1 py-0.5 bg-white bg-opacity-30 rounded text-xs hover:bg-opacity-50"
                                        title="수정"
                                      >
                                        <Edit size={12} className="mx-auto" />
                                      </button>
                                      <button
                                        onClick={() => deleteSession(session.id)}
                                        className="flex-1 px-1 py-0.5 bg-white bg-opacity-30 rounded text-xs hover:bg-opacity-50"
                                        title="삭제"
                                      >
                                        <Trash2 size={12} className="mx-auto" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {daySessions.length === 0 && !showAddForm && (
                            <button
                              onClick={() => handleAddSession(dayIdx, slotIdx)}
                              className="px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 text-xs hover:border-gray-400 hover:text-gray-600 transition"
                            >
                              <Plus size={16} className="mx-auto" />
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 선택 정보 */}
      {selectedCount > 0 && (
        <div className="mt-6 glass rounded-2xl p-4 flex items-center justify-between bg-gradient-to-r from-pastel-pink to-pastel-purple bg-opacity-40">
          <span className="text-sm font-semibold text-gray-700">{selectedCount}개 항목 선택됨</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
              일괄 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
