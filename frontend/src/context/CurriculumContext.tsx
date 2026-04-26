import React, { createContext, useContext, useState, useCallback } from 'react';

export interface STO {
  id: string;
  name: string;
}

export interface LTO {
  id: string;
  name: string;
  stos: STO[];
}

export interface DevelopmentDomain {
  id: string;
  name: string;
  ltos: LTO[];
}

export interface SessionTask {
  id: string;
  childId: string;
  domainId: string;
  ltoId: string;
  stoId: string;
  date: string;
  startTime: string;
  endTime: string;
  score: number;
  notes: string;
  completed: boolean;
  completedAt?: string;
}

interface CurriculumContextType {
  domains: DevelopmentDomain[];
  sessionTasks: SessionTask[];
  completionTasks: SessionTask[];

  // Curriculum operations
  addDomain: (name: string) => void;
  editDomain: (domainId: string, name: string) => void;
  deleteDomain: (domainId: string) => void;

  // LTO operations
  addLTO: (domainId: string, name: string) => void;
  editLTO: (domainId: string, ltoId: string, name: string) => void;
  deleteLTO: (domainId: string, ltoId: string) => void;

  // STO operations
  addSTO: (domainId: string, ltoId: string, name: string) => void;
  editSTO: (domainId: string, ltoId: string, stoId: string, name: string) => void;
  deleteSTO: (domainId: string, ltoId: string, stoId: string) => void;

  // Session task operations
  addSessionTask: (childId: string, domainId: string, ltoId: string, stoId: string, date: string) => void;
  updateSessionTask: (taskId: string, updates: Partial<SessionTask>) => void;
  deleteSessionTask: (taskId: string) => void;
  completeSessionTask: (taskId: string) => void;
  getTasksByChild: (childId: string, date: string) => SessionTask[];
}

const CurriculumContext = createContext<CurriculumContextType | undefined>(undefined);

const INITIAL_CURRICULUM: DevelopmentDomain[] = [
  {
    id: 'd1',
    name: '언어발달',
    ltos: [
      {
        id: 'l1',
        name: '발음 능력 개발',
        stos: [
          { id: 's1', name: '기본 자음 발음' },
          { id: 's2', name: '기본 모음 발음' },
          { id: 's3', name: '어휘 확장' },
        ],
      },
      {
        id: 'l2',
        name: '이해 능력 증진',
        stos: [
          { id: 's4', name: '지시 이해' },
          { id: 's5', name: '질문 이해' },
        ],
      },
    ],
  },
  {
    id: 'd2',
    name: '인지발달',
    ltos: [
      {
        id: 'l3',
        name: '색상 인식',
        stos: [
          { id: 's6', name: '기본색 구분' },
          { id: 's7', name: '색상 이름 말하기' },
        ],
      },
      {
        id: 'l4',
        name: '숫자 이해',
        stos: [
          { id: 's8', name: '1-10 숫자 인식' },
          { id: 's9', name: '숫자 세기' },
        ],
      },
    ],
  },
];

// 샘플 세션 과제 생성
const generateMockSessionTasks = (): SessionTask[] => {
  const children = ['민준', '소영', '지호', '연서'];
  const tasks: SessionTask[] = [];
  const today = new Date();

  children.forEach((childId, childIdx) => {
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      tasks.push({
        id: `task-${childIdx}-${i}`,
        childId,
        domainId: i % 2 === 0 ? 'd1' : 'd2',
        ltoId: i % 2 === 0 ? 'l1' : 'l3',
        stoId: i % 3 === 0 ? 's1' : (i % 3 === 1 ? 's2' : 's3'),
        date: dateStr,
        startTime: `${9 + (i % 3)}:00`,
        endTime: `${10 + (i % 3)}:00`,
        score: 70 + Math.random() * 30,
        notes: `세션 관찰 노트 ${i + 1}. 긍정적인 진행을 보임.`,
        completed: false,
      });
    }
  });

  return tasks;
};

// 샘플 완료 과제 생성
const generateMockCompletionTasks = (): SessionTask[] => {
  const children = ['민준', '소영', '지호', '연서'];
  const tasks: SessionTask[] = [];
  const today = new Date();

  children.forEach((childId, childIdx) => {
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (15 + i));
      const dateStr = date.toISOString().split('T')[0];

      tasks.push({
        id: `completion-${childIdx}-${i}`,
        childId,
        domainId: i % 2 === 0 ? 'd1' : 'd2',
        ltoId: i % 2 === 0 ? 'l2' : 'l4',
        stoId: i % 3 === 0 ? 's4' : (i % 3 === 1 ? 's5' : 's6'),
        date: dateStr,
        startTime: `${9 + (i % 3)}:00`,
        endTime: `${10 + (i % 3)}:00`,
        score: 75 + Math.random() * 25,
        notes: `완료 기록 ${i + 1}. 목표 달성 완료.`,
        completed: true,
        completedAt: date.toISOString(),
      });
    }
  });

  return tasks;
};

export function CurriculumProvider({ children }: { children: React.ReactNode }) {
  const [domains, setDomains] = useState<DevelopmentDomain[]>(INITIAL_CURRICULUM);
  const [sessionTasks, setSessionTasks] = useState<SessionTask[]>(generateMockSessionTasks());
  const [completionTasks, setCompletionTasks] = useState<SessionTask[]>(generateMockCompletionTasks());

  // Domain operations
  const addDomain = useCallback((name: string) => {
    const newDomain: DevelopmentDomain = {
      id: `d${Date.now()}`,
      name,
      ltos: [],
    };
    setDomains(prev => [...prev, newDomain]);
  }, []);

  const editDomain = useCallback((domainId: string, name: string) => {
    setDomains(prev =>
      prev.map(domain =>
        domain.id === domainId ? { ...domain, name } : domain
      )
    );
  }, []);

  const deleteDomain = useCallback((domainId: string) => {
    setDomains(prev => prev.filter(domain => domain.id !== domainId));
  }, []);

  // LTO operations
  const addLTO = useCallback((domainId: string, name: string) => {
    setDomains(prev =>
      prev.map(domain =>
        domain.id === domainId
          ? {
              ...domain,
              ltos: [
                ...domain.ltos,
                {
                  id: `l${Date.now()}`,
                  name,
                  stos: [],
                },
              ],
            }
          : domain
      )
    );
  }, []);

  const editLTO = useCallback((domainId: string, ltoId: string, name: string) => {
    setDomains(prev =>
      prev.map(domain =>
        domain.id === domainId
          ? {
              ...domain,
              ltos: domain.ltos.map(lto =>
                lto.id === ltoId ? { ...lto, name } : lto
              ),
            }
          : domain
      )
    );
  }, []);

  const deleteLTO = useCallback((domainId: string, ltoId: string) => {
    setDomains(prev =>
      prev.map(domain =>
        domain.id === domainId
          ? {
              ...domain,
              ltos: domain.ltos.filter(lto => lto.id !== ltoId),
            }
          : domain
      )
    );
  }, []);

  // STO operations
  const addSTO = useCallback((domainId: string, ltoId: string, name: string) => {
    setDomains(prev =>
      prev.map(domain =>
        domain.id === domainId
          ? {
              ...domain,
              ltos: domain.ltos.map(lto =>
                lto.id === ltoId
                  ? {
                      ...lto,
                      stos: [
                        ...lto.stos,
                        {
                          id: `s${Date.now()}`,
                          name,
                        },
                      ],
                    }
                  : lto
              ),
            }
          : domain
      )
    );
  }, []);

  const editSTO = useCallback((domainId: string, ltoId: string, stoId: string, name: string) => {
    setDomains(prev =>
      prev.map(domain =>
        domain.id === domainId
          ? {
              ...domain,
              ltos: domain.ltos.map(lto =>
                lto.id === ltoId
                  ? {
                      ...lto,
                      stos: lto.stos.map(sto =>
                        sto.id === stoId ? { ...sto, name } : sto
                      ),
                    }
                  : lto
              ),
            }
          : domain
      )
    );
  }, []);

  const deleteSTO = useCallback((domainId: string, ltoId: string, stoId: string) => {
    setDomains(prev =>
      prev.map(domain =>
        domain.id === domainId
          ? {
              ...domain,
              ltos: domain.ltos.map(lto =>
                lto.id === ltoId
                  ? {
                      ...lto,
                      stos: lto.stos.filter(sto => sto.id !== stoId),
                    }
                  : lto
              ),
            }
          : domain
      )
    );
  }, []);

  // Session task operations
  const addSessionTask = useCallback(
    (childId: string, domainId: string, ltoId: string, stoId: string, date: string) => {
      const newTask: SessionTask = {
        id: `t${Date.now()}`,
        childId,
        domainId,
        ltoId,
        stoId,
        date,
        startTime: '09:00',
        endTime: '10:00',
        score: 50,
        notes: '',
        completed: false,
      };
      setSessionTasks(prev => [...prev, newTask]);
    },
    []
  );

  const updateSessionTask = useCallback((taskId: string, updates: Partial<SessionTask>) => {
    setSessionTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  }, []);

  const deleteSessionTask = useCallback((taskId: string) => {
    setSessionTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const completeSessionTask = useCallback((taskId: string) => {
    const task = sessionTasks.find(t => t.id === taskId);
    if (task) {
      const completedTask: SessionTask = {
        ...task,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      setSessionTasks(prev => prev.filter(t => t.id !== taskId));
      setCompletionTasks(prev => [...prev, completedTask]);
    }
  }, [sessionTasks]);

  const getTasksByChild = useCallback((childId: string, date: string) => {
    return sessionTasks.filter(task => task.childId === childId && task.date === date);
  }, [sessionTasks]);

  const value: CurriculumContextType = {
    domains,
    sessionTasks,
    completionTasks,
    addDomain,
    editDomain,
    deleteDomain,
    addLTO,
    editLTO,
    deleteLTO,
    addSTO,
    editSTO,
    deleteSTO,
    addSessionTask,
    updateSessionTask,
    deleteSessionTask,
    completeSessionTask,
    getTasksByChild,
  };

  return (
    <CurriculumContext.Provider value={value}>
      {children}
    </CurriculumContext.Provider>
  );
}

export function useCurriculum() {
  const context = useContext(CurriculumContext);
  if (!context) {
    throw new Error('useCurriculum must be used within CurriculumProvider');
  }
  return context;
}
