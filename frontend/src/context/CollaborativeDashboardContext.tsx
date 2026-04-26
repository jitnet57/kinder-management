import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  CollaborativeDashboard,
  ParentDashboard,
  CollaborationSession,
  CollaborativeNote,
  SessionTask,
  DashboardGoal,
  WeeklyStats,
  MonthlyTrend,
  CANONICAL_CHILDREN,
  ChildId,
} from '../types';
import { storageManager } from '../utils/storage';
import { getSavedUser, User } from '../utils/deviceManager';

interface CollaborativeDashboardContextType {
  // Collaborative Dashboard operations
  collaborativeDashboards: CollaborativeDashboard[];
  getCollaborativeDashboard: (childId: number) => CollaborativeDashboard | null;
  getCollaborativeDashboards: (therapistId: string) => CollaborativeDashboard[];
  updateGoalProgress: (childId: number, ltoId: string, progress: number) => Promise<void>;

  // Parent Dashboard operations
  getParentDashboard: (childId: number, parentId: string) => Promise<ParentDashboard | null>;

  // Weekly highlights
  getWeeklyHighlights: (childId: number) => WeeklyStats;

  // Collaborative Notes
  collaborativeNotes: CollaborativeNote[];
  getCollaborativeNotes: (childId: number) => CollaborativeNote[];
  createCollaborativeNote: (note: Omit<CollaborativeNote, 'id' | 'createdAt'>) => Promise<CollaborativeNote>;
  updateCollaborativeNote: (noteId: string, updates: Partial<CollaborativeNote>) => Promise<void>;
  deleteCollaborativeNote: (noteId: string) => Promise<void>;
  addNoteResponse: (noteId: string, userId: string, name: string, content: string) => Promise<void>;
  pinNote: (noteId: string, isPinned: boolean) => Promise<void>;

  // Collaboration Sessions
  collaborationSessions: CollaborationSession[];
  startLiveSession: (childId: number, therapistId: string, therapistName: string, parentIds: string[], parentNames: string[]) => Promise<CollaborationSession>;
  endLiveSession: (sessionId: string) => Promise<void>;
  recordTherapistNotes: (sessionId: string, notes: string[]) => Promise<void>;
  recordParentObservation: (sessionId: string, observation: string) => Promise<void>;
  shareSessionVideo: (sessionId: string, videoUrl: string, analysis: string) => Promise<void>;

  // Utilities
  calculateChildAge: (childId: number) => number;
  getDaysUntilTargetDate: (targetDate: string) => number;
}

const CollaborativeDashboardContext = createContext<CollaborativeDashboardContextType | undefined>(undefined);

// Mock data generator for dashboards
const generateMockCollaborativeDashboards = (sessionTasks: SessionTask[]): CollaborativeDashboard[] => {
  return CANONICAL_CHILDREN.map(child => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const tasksThisWeek = sessionTasks.filter(t =>
      t.childId === child.id &&
      new Date(t.date) >= weekAgo
    );

    const avgScore = tasksThisWeek.length > 0
      ? tasksThisWeek.reduce((sum, t) => sum + t.score, 0) / tasksThisWeek.length
      : 0;

    return {
      id: `dashboard_${child.id}`,
      childId: child.id,
      viewers: {
        therapistId: 'therapist_001',
        parentIds: ['parent_001'],
      },
      overview: {
        childName: child.name,
        age: new Date().getFullYear() - new Date(child.birthDate).getFullYear(),
        photo: child.photo,
        lastSessionDate: new Date().toISOString().split('T')[0],
        nextSessionDate: new Date(today.getTime() + 86400000).toISOString().split('T')[0],
        overallProgress: avgScore,
      },
      goals: {
        activeGoals: [
          {
            ltoId: 'domain_mand_lto01',
            ltoName: '요청하기 (Mand)',
            domainId: 'domain_mand',
            domainName: '의도적 의사소통',
            progress: Math.min(avgScore, 100),
            targetDate: new Date(today.getTime() + 30 * 86400000).toISOString().split('T')[0],
            status: avgScore >= 80 ? 'on_track' : avgScore >= 60 ? 'at_risk' : 'on_track',
            nextMilestone: '독립적으로 요청하기',
            daysRemaining: 30,
          },
        ],
        completedGoals: [],
      },
      thisWeek: {
        sessionsCompleted: tasksThisWeek.length,
        sessionsScheduled: 5,
        averageScore: avgScore,
        topDomain: {
          domainId: 'domain_mand',
          domainName: '의도적 의사소통',
          progress: avgScore,
        },
      },
      monthlyTrend: {
        week1: 60,
        week2: 65,
        week3: 72,
        week4: avgScore,
        trend: 'improving',
      },
      parentUpdates: {
        unreadMessages: 2,
        unreadFeedback: 1,
        lastUpdate: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
  });
};

export function CollaborativeDashboardProvider({
  children,
  sessionTasks = [],
}: {
  children: React.ReactNode;
  sessionTasks?: SessionTask[];
}) {
  const [collaborativeDashboards, setCollaborativeDashboards] = useState<CollaborativeDashboard[]>([]);
  const [collaborativeNotes, setCollaborativeNotes] = useState<CollaborativeNote[]>([]);
  const [collaborationSessions, setCollaborationSessions] = useState<CollaborationSession[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = getSavedUser();
    setUser(savedUser);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboards = await storageManager.get<CollaborativeDashboard[]>('collaborative_dashboards');
      const notes = await storageManager.get<CollaborativeNote[]>('collaborative_notes');
      const sessions = await storageManager.get<CollaborationSession[]>('collaboration_sessions');

      setCollaborativeDashboards(dashboards || generateMockCollaborativeDashboards(sessionTasks));
      setCollaborativeNotes(notes || []);
      setCollaborationSessions(sessions || []);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      setCollaborativeDashboards(generateMockCollaborativeDashboards(sessionTasks));
    }
  };

  const getCollaborativeDashboard = useCallback((childId: number): CollaborativeDashboard | null => {
    return collaborativeDashboards.find(d => d.childId === childId) || null;
  }, [collaborativeDashboards]);

  const getCollaborativeDashboards = useCallback((therapistId: string): CollaborativeDashboard[] => {
    return collaborativeDashboards.filter(d => d.viewers.therapistId === therapistId);
  }, [collaborativeDashboards]);

  const updateGoalProgress = useCallback(async (
    childId: number,
    ltoId: string,
    progress: number
  ): Promise<void> => {
    const updated = collaborativeDashboards.map(dashboard => {
      if (dashboard.childId === childId) {
        return {
          ...dashboard,
          goals: {
            ...dashboard.goals,
            activeGoals: dashboard.goals.activeGoals.map(goal =>
              goal.ltoId === ltoId
                ? {
                    ...goal,
                    progress: Math.min(progress, 100),
                    status: progress >= 90 ? 'completed' : progress >= 70 ? 'on_track' : 'at_risk',
                  }
                : goal
            ),
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return dashboard;
    });
    setCollaborativeDashboards(updated);
    await storageManager.set('collaborative_dashboards', updated);
  }, [collaborativeDashboards]);

  const getParentDashboard = useCallback(async (
    childId: number,
    parentId: string
  ): Promise<ParentDashboard | null> => {
    const collaborativeDb = getCollaborativeDashboard(childId);
    if (!collaborativeDb || !collaborativeDb.viewers.parentIds.includes(parentId)) {
      return null;
    }

    const child = CANONICAL_CHILDREN.find(c => c.id === childId);
    if (!child) return null;

    const notes = getCollaborativeNotes(childId);
    const recentMessages = notes
      .filter(n => n.author.role === 'therapist')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map(n => ({
        id: n.id,
        date: n.createdAt,
        senderName: n.author.name,
        content: n.content,
        priority: 'normal' as const,
      }));

    return {
      childId,
      overview: {
        childName: child.name,
        photo: child.photo,
        currentFocus: collaborativeDb.goals.activeGoals[0]?.ltoName || '학습 중',
        thisWeekMilestone: '좋은 진행을 보이고 있습니다!',
      },
      actionItems: [
        {
          id: 'action_1',
          title: '가정에서 의사표현 연습하기',
          description: '치료사와 함께 배운 기술을 집에서도 반복 연습해주세요.',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          frequency: '매일',
          completedDates: [new Date().toISOString().split('T')[0]],
          tips: '자연스러운 상황에서 다양한 표현을 격려해주세요.',
        },
      ],
      recentAchievements: [
        {
          date: new Date().toISOString().split('T')[0],
          description: `${collaborativeDb.goals.activeGoals[0]?.ltoName || '기술'} - 독립적 수행`,
          score: collaborativeDb.overview.overallProgress,
          therapistComment: '훌륭한 진행입니다!',
        },
      ],
      latestMessages: recentMessages,
      monthlySummary: {
        domainProgress: [
          {
            domainName: collaborativeDb.thisWeek.topDomain.domainName,
            improvement: 15,
            status: '좋은 진행',
          },
        ],
        highlights: ['새로운 기술 습득', '독립성 증가'],
        areasToFocus: ['지속성 유지', '다양한 상황에서의 적용'],
      },
    };
  }, [getCollaborativeDashboard, getCollaborativeNotes]);

  const getWeeklyHighlights = useCallback((childId: number): WeeklyStats => {
    const dashboard = getCollaborativeDashboard(childId);
    return dashboard?.thisWeek || {
      sessionsCompleted: 0,
      sessionsScheduled: 0,
      averageScore: 0,
      topDomain: { domainId: '', domainName: '', progress: 0 },
    };
  }, [getCollaborativeDashboard]);

  const getCollaborativeNotes = useCallback((childId: number): CollaborativeNote[] => {
    return collaborativeNotes.filter(n => n.childId === childId);
  }, [collaborativeNotes]);

  const createCollaborativeNote = useCallback(async (
    note: Omit<CollaborativeNote, 'id' | 'createdAt'>
  ): Promise<CollaborativeNote> => {
    const newNote: CollaborativeNote = {
      id: `note_${Date.now()}`,
      ...note,
      createdAt: new Date().toISOString(),
    };

    const updated = [...collaborativeNotes, newNote];
    setCollaborativeNotes(updated);
    await storageManager.set('collaborative_notes', updated);
    return newNote;
  }, [collaborativeNotes]);

  const updateCollaborativeNote = useCallback(async (
    noteId: string,
    updates: Partial<CollaborativeNote>
  ): Promise<void> => {
    const updated = collaborativeNotes.map(n =>
      n.id === noteId ? { ...n, ...updates } : n
    );
    setCollaborativeNotes(updated);
    await storageManager.set('collaborative_notes', updated);
  }, [collaborativeNotes]);

  const deleteCollaborativeNote = useCallback(async (noteId: string): Promise<void> => {
    const updated = collaborativeNotes.filter(n => n.id !== noteId);
    setCollaborativeNotes(updated);
    await storageManager.set('collaborative_notes', updated);
  }, [collaborativeNotes]);

  const addNoteResponse = useCallback(async (
    noteId: string,
    userId: string,
    name: string,
    content: string
  ): Promise<void> => {
    const updated = collaborativeNotes.map(n => {
      if (n.id === noteId) {
        return {
          ...n,
          responses: [
            ...n.responses,
            {
              userId,
              name,
              content,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return n;
    });
    setCollaborativeNotes(updated);
    await storageManager.set('collaborative_notes', updated);
  }, [collaborativeNotes]);

  const pinNote = useCallback(async (noteId: string, isPinned: boolean): Promise<void> => {
    await updateCollaborativeNote(noteId, { isPinned });
  }, [updateCollaborativeNote]);

  const startLiveSession = useCallback(async (
    childId: number,
    therapistId: string,
    therapistName: string,
    parentIds: string[],
    parentNames: string[]
  ): Promise<CollaborationSession> => {
    const newSession: CollaborationSession = {
      id: `session_${Date.now()}`,
      childId,
      type: 'live_session',
      participants: {
        therapistId,
        therapistName,
        parentIds,
        parentNames,
      },
      liveData: {
        isLive: true,
        sessionStartTime: new Date().toISOString(),
        currentActivity: '세션 시작',
        therapistNotes: [],
        parentObservations: [],
      },
      createdAt: new Date().toISOString(),
    };

    const updated = [...collaborationSessions, newSession];
    setCollaborationSessions(updated);
    await storageManager.set('collaboration_sessions', updated);
    return newSession;
  }, [collaborationSessions]);

  const endLiveSession = useCallback(async (sessionId: string): Promise<void> => {
    const updated = collaborationSessions.map(s => {
      if (s.id === sessionId && s.liveData) {
        return {
          ...s,
          liveData: { ...s.liveData, isLive: false },
        };
      }
      return s;
    });
    setCollaborationSessions(updated);
    await storageManager.set('collaboration_sessions', updated);
  }, [collaborationSessions]);

  const recordTherapistNotes = useCallback(async (
    sessionId: string,
    notes: string[]
  ): Promise<void> => {
    const updated = collaborationSessions.map(s => {
      if (s.id === sessionId && s.liveData) {
        return {
          ...s,
          liveData: { ...s.liveData, therapistNotes: notes },
        };
      }
      return s;
    });
    setCollaborationSessions(updated);
    await storageManager.set('collaboration_sessions', updated);
  }, [collaborationSessions]);

  const recordParentObservation = useCallback(async (
    sessionId: string,
    observation: string
  ): Promise<void> => {
    const updated = collaborationSessions.map(s => {
      if (s.id === sessionId && s.liveData) {
        return {
          ...s,
          liveData: {
            ...s.liveData,
            parentObservations: [...s.liveData.parentObservations, observation],
          },
        };
      }
      return s;
    });
    setCollaborationSessions(updated);
    await storageManager.set('collaboration_sessions', updated);
  }, [collaborationSessions]);

  const shareSessionVideo = useCallback(async (
    sessionId: string,
    videoUrl: string,
    analysis: string
  ): Promise<void> => {
    const updated = collaborationSessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          type: 'async_review' as const,
          asyncReview: {
            videoUrl,
            duration: 0,
            therapistAnalysis: analysis,
            sharedAt: new Date().toISOString(),
          },
        };
      }
      return s;
    });
    setCollaborationSessions(updated);
    await storageManager.set('collaboration_sessions', updated);
  }, [collaborationSessions]);

  const calculateChildAge = useCallback((childId: number): number => {
    const child = CANONICAL_CHILDREN.find(c => c.id === childId);
    if (!child) return 0;
    return new Date().getFullYear() - new Date(child.birthDate).getFullYear();
  }, []);

  const getDaysUntilTargetDate = useCallback((targetDate: string): number => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  const value: CollaborativeDashboardContextType = {
    collaborativeDashboards,
    getCollaborativeDashboard,
    getCollaborativeDashboards,
    updateGoalProgress,
    getParentDashboard,
    getWeeklyHighlights,
    collaborativeNotes,
    getCollaborativeNotes,
    createCollaborativeNote,
    updateCollaborativeNote,
    deleteCollaborativeNote,
    addNoteResponse,
    pinNote,
    collaborationSessions,
    startLiveSession,
    endLiveSession,
    recordTherapistNotes,
    recordParentObservation,
    shareSessionVideo,
    calculateChildAge,
    getDaysUntilTargetDate,
  };

  return (
    <CollaborativeDashboardContext.Provider value={value}>
      {children}
    </CollaborativeDashboardContext.Provider>
  );
}

export function useCollaborativeDashboard() {
  const context = useContext(CollaborativeDashboardContext);
  if (!context) {
    throw new Error('useCollaborativeDashboard must be used within CollaborativeDashboardProvider');
  }
  return context;
}
