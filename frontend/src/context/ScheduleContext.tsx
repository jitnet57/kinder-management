import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ScheduleSession {
  id: string;
  dayOfWeek: number; // 0=월, 5=토
  timeSlotIndex: number; // 0-3
  childId: string;
  childName: string;
  sessionName: string;
  startTime: number;
  endTime: number;
  color: string;
}

interface ScheduleContextType {
  sessions: ScheduleSession[];
  addSession: (session: Omit<ScheduleSession, 'id'>) => void;
  updateSession: (id: string, updates: Partial<ScheduleSession>) => void;
  deleteSession: (id: string) => void;
  getSessionsByDayAndSlot: (dayOfWeek: number, slotIndex: number) => ScheduleSession[];
  getSessionsByChild: (childName: string) => ScheduleSession[];
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const INITIAL_SESSIONS: ScheduleSession[] = [
  // 월요일
  { id: 's1', dayOfWeek: 0, timeSlotIndex: 0, childId: 'c1', childName: '민준', sessionName: '발음 연습', startTime: 8, endTime: 10, color: '#FFB6D9' },
  { id: 's2', dayOfWeek: 0, timeSlotIndex: 1, childId: 'c2', childName: '소영', sessionName: '인지 게임', startTime: 10, endTime: 12, color: '#B4D7FF' },
  { id: 's3', dayOfWeek: 0, timeSlotIndex: 2, childId: 'c3', childName: '지호', sessionName: '색상 구분', startTime: 14, endTime: 16, color: '#C1FFD7' },
  { id: 's4', dayOfWeek: 0, timeSlotIndex: 3, childId: 'c4', childName: '연서', sessionName: '숫자 이해', startTime: 16, endTime: 18, color: '#FFE4B5' },
  // 화요일
  { id: 's5', dayOfWeek: 1, timeSlotIndex: 0, childId: 'c2', childName: '소영', sessionName: '상호작용', startTime: 8, endTime: 10, color: '#B4D7FF' },
  { id: 's6', dayOfWeek: 1, timeSlotIndex: 1, childId: 'c3', childName: '지호', sessionName: '운동능력', startTime: 10, endTime: 12, color: '#C1FFD7' },
  { id: 's7', dayOfWeek: 1, timeSlotIndex: 2, childId: 'c4', childName: '연서', sessionName: '언어 기초', startTime: 14, endTime: 16, color: '#FFE4B5' },
  { id: 's8', dayOfWeek: 1, timeSlotIndex: 3, childId: 'c1', childName: '민준', sessionName: '문장 만들기', startTime: 16, endTime: 18, color: '#FFB6D9' },
  // 수요일
  { id: 's9', dayOfWeek: 2, timeSlotIndex: 0, childId: 'c3', childName: '지호', sessionName: '집중력 훈련', startTime: 8, endTime: 10, color: '#C1FFD7' },
  { id: 's10', dayOfWeek: 2, timeSlotIndex: 1, childId: 'c4', childName: '연서', sessionName: '사회성 발달', startTime: 10, endTime: 12, color: '#FFE4B5' },
  { id: 's11', dayOfWeek: 2, timeSlotIndex: 2, childId: 'c1', childName: '민준', sessionName: '어휘 확장', startTime: 14, endTime: 16, color: '#FFB6D9' },
  { id: 's12', dayOfWeek: 2, timeSlotIndex: 3, childId: 'c2', childName: '소영', sessionName: '음악 활동', startTime: 16, endTime: 18, color: '#B4D7FF' },
  // 목요일
  { id: 's13', dayOfWeek: 3, timeSlotIndex: 0, childId: 'c4', childName: '연서', sessionName: '지시 이해', startTime: 8, endTime: 10, color: '#FFE4B5' },
  { id: 's14', dayOfWeek: 3, timeSlotIndex: 1, childId: 'c1', childName: '민준', sessionName: '질문 이해', startTime: 10, endTime: 12, color: '#FFB6D9' },
  { id: 's15', dayOfWeek: 3, timeSlotIndex: 2, childId: 'c2', childName: '소영', sessionName: '협력 게임', startTime: 14, endTime: 16, color: '#B4D7FF' },
  { id: 's16', dayOfWeek: 3, timeSlotIndex: 3, childId: 'c3', childName: '지호', sessionName: '행동 수정', startTime: 16, endTime: 18, color: '#C1FFD7' },
  // 금요일
  { id: 's17', dayOfWeek: 4, timeSlotIndex: 0, childId: 'c1', childName: '민준', sessionName: '주간 리뷰', startTime: 8, endTime: 10, color: '#FFB6D9' },
  { id: 's18', dayOfWeek: 4, timeSlotIndex: 1, childId: 'c3', childName: '지호', sessionName: '강화 학습', startTime: 10, endTime: 12, color: '#C1FFD7' },
  { id: 's19', dayOfWeek: 4, timeSlotIndex: 2, childId: 'c2', childName: '소영', sessionName: '자기표현', startTime: 14, endTime: 16, color: '#B4D7FF' },
  { id: 's20', dayOfWeek: 4, timeSlotIndex: 3, childId: 'c4', childName: '연서', sessionName: '평가 세션', startTime: 16, endTime: 18, color: '#FFE4B5' },
];

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ScheduleSession[]>(INITIAL_SESSIONS);

  const addSession = useCallback((session: Omit<ScheduleSession, 'id'>) => {
    const newSession: ScheduleSession = {
      ...session,
      id: `s${Date.now()}`,
    };
    setSessions(prev => [...prev, newSession]);
  }, []);

  const updateSession = useCallback((id: string, updates: Partial<ScheduleSession>) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === id ? { ...session, ...updates } : session
      )
    );
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id));
  }, []);

  const getSessionsByDayAndSlot = useCallback(
    (dayOfWeek: number, slotIndex: number) => {
      return sessions.filter(
        s => s.dayOfWeek === dayOfWeek && s.timeSlotIndex === slotIndex
      );
    },
    [sessions]
  );

  const getSessionsByChild = useCallback(
    (childName: string) => {
      return sessions.filter(s => s.childName === childName);
    },
    [sessions]
  );

  const value: ScheduleContextType = {
    sessions,
    addSession,
    updateSession,
    deleteSession,
    getSessionsByDayAndSlot,
    getSessionsByChild,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within ScheduleProvider');
  }
  return context;
}
