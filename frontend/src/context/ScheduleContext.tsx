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
  {
    id: 's1',
    dayOfWeek: 0,
    timeSlotIndex: 0,
    childId: 'c1',
    childName: '민준',
    sessionName: '발음',
    startTime: 8,
    endTime: 10,
    color: '#FFB6D9',
  },
  {
    id: 's2',
    dayOfWeek: 0,
    timeSlotIndex: 1,
    childId: 'c2',
    childName: '소영',
    sessionName: '인지',
    startTime: 10,
    endTime: 12,
    color: '#B4D7FF',
  },
  {
    id: 's3',
    dayOfWeek: 0,
    timeSlotIndex: 2,
    childId: 'c3',
    childName: '지호',
    sessionName: '사회성',
    startTime: 14,
    endTime: 16,
    color: '#C1FFD7',
  },
  {
    id: 's4',
    dayOfWeek: 0,
    timeSlotIndex: 3,
    childId: 'c1',
    childName: '민준',
    sessionName: '색상',
    startTime: 16,
    endTime: 18,
    color: '#FFB6D9',
  },
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
