import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import curriculumData from '../data/curriculum.json';
import { SessionTask, DevelopmentDomain as DevelopmentDomainType, ChildId } from '../types';
import { storageManager } from '../utils/storage';

// Re-export for backward compatibility
export { STO, LTO } from '../data/curriculum.json';

export interface STO {
  id: string;
  name: string;
  description?: string;
  order?: number;
}

export interface LTO {
  id: string;
  name: string;
  order?: number;
  goal?: string;
  stos: STO[];
  teachingTips?: Record<string, string>;
}

export interface DevelopmentDomain {
  id: string;
  name: string;
  description?: string;
  color?: string;
  ltos: LTO[];
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

  // Session task operations - childId now number (1-4)
  addSessionTask: (childId: number, domainId: string, ltoId: string, stoId: string, date: string) => void;
  updateSessionTask: (taskId: string, updates: Partial<SessionTask>) => void;
  deleteSessionTask: (taskId: string) => void;
  completeSessionTask: (taskId: string) => void;
  getTasksByChild: (childId: number, date: string) => SessionTask[];
}

const CurriculumContext = createContext<CurriculumContextType | undefined>(undefined);

// Convert imported curriculum data to DevelopmentDomain format
const convertCurriculumData = (data: any): DevelopmentDomain[] => {
  return data.domains.map((domain: any) => ({
    id: domain.id,
    name: domain.name,
    description: domain.description,
    color: domain.color,
    ltos: domain.ltos.map((lto: any) => ({
      id: lto.id,
      name: lto.name,
      order: lto.order,
      goal: lto.goal,
      teachingTips: lto.teachingTips,
      stos: lto.stos.map((sto: any) => ({
        id: sto.order ? `${lto.id}_sto${sto.order}` : `${lto.id}_${sto.name}`,
        name: sto.name,
        description: sto.description,
        order: sto.order,
      })),
    })),
  }));
};

const INITIAL_CURRICULUM: DevelopmentDomain[] = convertCurriculumData(curriculumData);

// 샘플 세션 과제 생성
const generateMockSessionTasks = (): SessionTask[] => {
  const childIds: ChildId[] = [1, 2, 3, 4];
  const domainIds = ['domain_mand', 'domain_tact']; // 실제 curriculum.json ID
  const ltoIds = ['domain_mand_lto01', 'domain_tact_lto01']; // 실제 형식
  const stoIds = ['domain_mand_lto01_sto1', 'domain_tact_lto01_sto1']; // 실제 형식

  const tasks: SessionTask[] = [];
  const today = new Date();

  childIds.forEach((childId, childIdx) => {
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      tasks.push({
        id: `task-${childIdx}-${i}`,
        childId,
        domainId: domainIds[i % 2],
        ltoId: ltoIds[i % 2],
        stoId: stoIds[i % 2],
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
  const childIds: ChildId[] = [1, 2, 3, 4];
  const domainIds = ['domain_mand', 'domain_tact']; // 실제 curriculum.json ID
  const ltoIds = ['domain_mand_lto02', 'domain_tact_lto02']; // 다른 LTO 사용
  const stoIds = ['domain_mand_lto02_sto2', 'domain_tact_lto02_sto2']; // 다른 STO 사용

  const tasks: SessionTask[] = [];
  const today = new Date();

  childIds.forEach((childId, childIdx) => {
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (15 + i));
      const dateStr = date.toISOString().split('T')[0];

      tasks.push({
        id: `completion-${childIdx}-${i}`,
        childId,
        domainId: domainIds[i % 2],
        ltoId: ltoIds[i % 2],
        stoId: stoIds[i % 2],
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
  const [domains, setDomains] = useState<DevelopmentDomain[]>(() => {
    // Try to load from storage, fallback to initial curriculum
    const stored = localStorage.getItem('kinder_curriculum_domains');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.value || INITIAL_CURRICULUM;
      } catch (error) {
        console.error('Failed to parse stored curriculum domains:', error);
        return INITIAL_CURRICULUM;
      }
    }
    return INITIAL_CURRICULUM;
  });

  const [sessionTasks, setSessionTasks] = useState<SessionTask[]>(() => {
    // Try to load from storage, fallback to generated mock tasks
    const stored = localStorage.getItem('kinder_session_tasks');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.value || generateMockSessionTasks();
      } catch (error) {
        console.error('Failed to parse stored session tasks:', error);
        return generateMockSessionTasks();
      }
    }
    return generateMockSessionTasks();
  });

  const [completionTasks, setCompletionTasks] = useState<SessionTask[]>(generateMockCompletionTasks());

  // Persist domains to storage whenever they change
  useEffect(() => {
    storageManager.set('curriculum_domains', domains);
  }, [domains]);

  // Persist session tasks to storage whenever they change
  useEffect(() => {
    storageManager.set('session_tasks', sessionTasks);
  }, [sessionTasks]);

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
    (childId: number, domainId: string, ltoId: string, stoId: string, date: string) => {
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

  const getTasksByChild = useCallback((childId: number, date: string) => {
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
