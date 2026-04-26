import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  ABCRecord,
  ABCPattern,
  FunctionAnalysis,
  Antecedent,
  Behavior,
  Consequence,
  ChildId,
} from '../types';
import { storageManager } from '../utils/storage';

interface ABCContextType {
  // Data storage
  abcRecords: ABCRecord[];
  abcPatterns: ABCPattern[];
  functionAnalyses: FunctionAnalysis[];

  // ABC record operations
  recordABC: (abcData: Omit<ABCRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getABCRecords: (childId: number, ltoId?: string, dateRange?: { start: string; end: string }) => ABCRecord[];
  updateABCRecord: (recordId: string, updates: Partial<ABCRecord>) => void;
  deleteABCRecord: (recordId: string) => void;
  getABCRecordBySessionTask: (sessionTaskId: string) => ABCRecord | undefined;

  // Pattern analysis operations
  analyzePatterns: (childId: number, ltoId: string, period?: 'week' | 'month' | 'all') => ABCPattern;
  getAllPatterns: (childId?: number) => ABCPattern[];
  updatePattern: (patternId: string, updates: Partial<ABCPattern>) => void;

  // Functionality analysis operations
  analyzeFunctionality: (abcPatternId: string) => FunctionAnalysis;
  getFunctionAnalysis: (childId: number, ltoId: string) => FunctionAnalysis | undefined;
  updateFunctionAnalysis: (id: string, updates: Partial<FunctionAnalysis>) => void;

  // Insights and recommendations
  getInsights: (abcPatternId: string) => string[];
  generateRecommendations: (childId: number, ltoId: string) => string[];
}

const ABCContext = createContext<ABCContextType | undefined>(undefined);

// Generate mock ABC records for demo purposes
const generateMockABCRecords = (): ABCRecord[] => {
  const childIds: ChildId[] = [1, 2, 3, 4];
  const records: ABCRecord[] = [];
  const today = new Date();

  const antecedents = [
    { type: 'instruction', description: '치료사가 "앉으세요"라고 지시' },
    { type: 'instruction', description: '부모가 "손 씻으세요"라고 지시' },
    { type: 'environmental', description: '교실 소음이 증가함' },
    { type: 'transition', description: '활동이 바뀔 예정' },
  ];

  const behaviors = [
    { target: '앉기', trials: 5, correct: 5, accuracy: 100 },
    { target: '손 씻기', trials: 5, correct: 4, accuracy: 80 },
    { target: '주의 기울이기', trials: 3, correct: 2, accuracy: 67 },
    { target: '지시 따르기', trials: 5, correct: 3, accuracy: 60 },
  ];

  const consequences = [
    { type: 'reinforcement', reinforcer: '칭찬, 스티커' },
    { type: 'reinforcement', reinforcer: '좋아요 손가락' },
    { type: 'extinction', reinforcer: '무반응' },
    { type: 'punishment', reinforcer: '재지도' },
  ];

  const ltoIds = ['domain_mand_lto01', 'domain_tact_lto01', 'domain_mand_lto02'];

  childIds.forEach((childId, childIdx) => {
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const antIdx = Math.floor(Math.random() * antecedents.length);
      const behIdx = Math.floor(Math.random() * behaviors.length);
      const conIdx = Math.floor(Math.random() * consequences.length);
      const ltoIdx = Math.floor(Math.random() * ltoIds.length);

      const behavior = behaviors[behIdx];

      records.push({
        id: `abc-${childIdx}-${i}`,
        sessionTaskId: `task-${childIdx}-${i}`,
        childId,
        ltoId: ltoIds[ltoIdx],
        stoId: `${ltoIds[ltoIdx]}_sto1`,
        antecedent: {
          type: antecedents[antIdx].type as any,
          description: antecedents[antIdx].description,
          context: '교실 내',
          triggeredBy: '시각적 신호',
          details: {
            location: '교실',
            timeOfDay: new Date(date).getHours() < 12 ? 'morning' : 'afternoon',
            otherPresent: ['치료사'],
            environmentalFactors: ['일반 소음'],
          },
        },
        behavior: {
          targetBehavior: behavior.target,
          responseType: behavior.accuracy >= 80 ? 'correct' : 'partial',
          latency: Math.floor(Math.random() * 10) + 1,
          intensity: 'normal',
          quality: behavior.accuracy >= 80 ? 'independent' : 'prompted',
          dataPoints: {
            trials: behavior.trials,
            correctTrials: behavior.correct,
            accuracy: behavior.accuracy,
            independenceLevel: behavior.accuracy >= 80 ? 'independent' : 'partial',
          },
          notes: '긍정적인 반응 보임',
        },
        consequence: {
          type: consequences[conIdx].type as any,
          reinforcementType: 'social',
          reinforcer: consequences[conIdx].reinforcer,
          timing: 'immediate',
          effectOnBehavior: behavior.accuracy >= 80 ? 'increased' : 'unchanged',
          description: consequences[conIdx].reinforcer,
        },
        sessionDate: dateStr,
        timeRecorded: `${9 + Math.floor(Math.random() * 8)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        recordedBy: {
          userId: 'therapist-001',
          name: '김치료사',
          role: 'therapist',
        },
        reliability: {
          secondObserver: {
            userId: 'therapist-002',
            name: '이치료사',
            agreement: Math.random() > 0.3,
          },
          interraterReliability: 85 + Math.random() * 15,
        },
        trends: {
          trendDirection: behavior.accuracy >= 80 ? 'improving' : 'stable',
          accelerationPoints: 2,
          baselineComparison: 110,
        },
        createdAt: new Date(date).toISOString(),
        updatedAt: new Date(date).toISOString(),
      });
    }
  });

  return records;
};

export function ABCProvider({ children }: { children: React.ReactNode }) {
  const [abcRecords, setABCRecords] = useState<ABCRecord[]>(() => {
    const stored = localStorage.getItem('kinder_abc_records');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.value || generateMockABCRecords();
      } catch (error) {
        console.error('Failed to parse stored ABC records:', error);
        return generateMockABCRecords();
      }
    }
    return generateMockABCRecords();
  });

  const [abcPatterns, setABCPatterns] = useState<ABCPattern[]>([]);
  const [functionAnalyses, setFunctionAnalyses] = useState<FunctionAnalysis[]>([]);

  // Persist ABC records to storage whenever they change
  useEffect(() => {
    storageManager.set('abc_records', abcRecords);
  }, [abcRecords]);

  // Record ABC data
  const recordABC = useCallback(
    (abcData: Omit<ABCRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newRecord: ABCRecord = {
        ...abcData,
        id: `abc-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setABCRecords(prev => [...prev, newRecord]);
    },
    []
  );

  // Get ABC records with filtering
  const getABCRecords = useCallback(
    (childId: number, ltoId?: string, dateRange?: { start: string; end: string }) => {
      return abcRecords.filter(record => {
        if (record.childId !== childId) return false;
        if (ltoId && record.ltoId !== ltoId) return false;
        if (dateRange) {
          const recordDate = new Date(record.sessionDate);
          const start = new Date(dateRange.start);
          const end = new Date(dateRange.end);
          if (recordDate < start || recordDate > end) return false;
        }
        return true;
      });
    },
    [abcRecords]
  );

  // Update ABC record
  const updateABCRecord = useCallback((recordId: string, updates: Partial<ABCRecord>) => {
    setABCRecords(prev =>
      prev.map(record =>
        record.id === recordId
          ? { ...record, ...updates, updatedAt: new Date().toISOString() }
          : record
      )
    );
  }, []);

  // Delete ABC record
  const deleteABCRecord = useCallback((recordId: string) => {
    setABCRecords(prev => prev.filter(record => record.id !== recordId));
  }, []);

  // Get ABC record by session task
  const getABCRecordBySessionTask = useCallback(
    (sessionTaskId: string) => {
      return abcRecords.find(record => record.sessionTaskId === sessionTaskId);
    },
    [abcRecords]
  );

  // Analyze patterns
  const analyzePatterns = (childId: number, ltoId: string, period: 'week' | 'month' | 'all' = 'month'): ABCPattern => {
      const records = getABCRecords(childId, ltoId);

      if (records.length === 0) {
        return {
          id: `pattern-${childId}-${ltoId}`,
          childId,
          ltoId,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          antecedentPatterns: { mostEffective: [], leastEffective: [] },
          behaviorPatterns: {
            averageAccuracy: 0,
            independenceImprovement: 0,
            latencyTrend: 'stable',
            consistencyScore: 0,
          },
          consequenceEffectiveness: { mostEffective: [], leastEffective: [] },
          recommendations: [],
          totalRecords: 0,
          lastUpdated: new Date().toISOString(),
        };
      }

      // Calculate average accuracy
      const averageAccuracy = Math.round(
        records.reduce((sum, r) => sum + r.behavior.dataPoints.accuracy, 0) / records.length
      );

      // Calculate independence improvement
      const first5Avg = records
        .slice(0, 5)
        .reduce((sum, r) => sum + (r.behavior.quality === 'independent' ? 1 : 0), 0) / Math.min(5, records.length);
      const last5Avg = records
        .slice(-5)
        .reduce((sum, r) => sum + (r.behavior.quality === 'independent' ? 1 : 0), 0) / Math.min(5, records.length);
      const independenceImprovement = Math.round(((last5Avg - first5Avg) / (first5Avg || 1)) * 100);

      // Analyze antecedents
      const antecedentMap: { [key: string]: { success: number; total: number } } = {};
      records.forEach(r => {
        const key = r.antecedent.description;
        if (!antecedentMap[key]) antecedentMap[key] = { success: 0, total: 0 };
        antecedentMap[key].total++;
        if (r.behavior.responseType === 'correct') antecedentMap[key].success++;
      });

      const antecedentDetails = Object.entries(antecedentMap).map(([desc, data]) => ({
        type: 'instruction',
        description: desc,
        successRate: Math.round((data.success / data.total) * 100),
        occurrences: data.total,
      }));

      // Analyze consequences
      const consequenceMap: { [key: string]: { success: number; total: number } } = {};
      records.forEach(r => {
        const key = r.consequence.reinforcer || 'none';
        if (!consequenceMap[key]) consequenceMap[key] = { success: 0, total: 0 };
        consequenceMap[key].total++;
        if (r.consequence.effectOnBehavior === 'increased') consequenceMap[key].success++;
      });

      const consequenceDetails = Object.entries(consequenceMap).map(([reinforcer, data]) => ({
        type: 'reinforcement',
        reinforcer,
        effectiveness: Math.round((data.success / data.total) * 100),
      }));

      // Generate recommendations
      const recommendations: string[] = [];
      if (averageAccuracy < 60) {
        recommendations.push('정확도 향상을 위해 더 명확한 지시와 추가 연습이 필요합니다.');
      } else if (averageAccuracy >= 80) {
        recommendations.push('우수한 성과입니다! 난이도를 점진적으로 높여보세요.');
      }

      if (independenceImprovement > 10) {
        recommendations.push('독립성 향상이 두드러집니다. 긍정적인 강화 방식을 계속 유지하세요.');
      }

      const pattern: ABCPattern = {
        id: `pattern-${childId}-${ltoId}-${Date.now()}`,
        childId,
        ltoId,
        startDate: records[records.length - 1].sessionDate,
        endDate: records[0].sessionDate,
        antecedentPatterns: {
          mostEffective: antecedentDetails.sort((a, b) => b.successRate - a.successRate).slice(0, 3),
          leastEffective: antecedentDetails.sort((a, b) => a.successRate - b.successRate).slice(0, 3),
        },
        behaviorPatterns: {
          averageAccuracy,
          independenceImprovement,
          latencyTrend: 'decreasing',
          consistencyScore: Math.min(100, 50 + Math.random() * 50),
        },
        consequenceEffectiveness: {
          mostEffective: consequenceDetails.sort((a, b) => b.effectiveness - a.effectiveness).slice(0, 3),
          leastEffective: consequenceDetails.sort((a, b) => a.effectiveness - b.effectiveness).slice(0, 3),
        },
        recommendations,
        totalRecords: records.length,
        lastUpdated: new Date().toISOString(),
      };

    setABCPatterns(prev => {
      const existing = prev.find(p => p.childId === childId && p.ltoId === ltoId);
      if (existing) {
        return prev.map(p => (p.childId === childId && p.ltoId === ltoId ? pattern : p));
      }
      return [...prev, pattern];
    });

    return pattern;
  };

  // Get all patterns
  const getAllPatterns = useCallback((childId?: number) => {
    if (childId) {
      return abcPatterns.filter(p => p.childId === childId);
    }
    return abcPatterns;
  }, [abcPatterns]);

  // Update pattern
  const updatePattern = useCallback((patternId: string, updates: Partial<ABCPattern>) => {
    setABCPatterns(prev =>
      prev.map(pattern =>
        pattern.id === patternId ? { ...pattern, ...updates } : pattern
      )
    );
  }, []);

  // Analyze functionality
  const analyzeFunctionality = useCallback(
    (abcPatternId: string) => {
      const pattern = abcPatterns.find(p => p.id === abcPatternId);
      if (!pattern) {
        return {
          id: `func-${Date.now()}`,
          abcPatternId,
          childId: 0,
        };
      }

      // Determine maintaining consequence
      const reinforcementRecords = abcRecords.filter(
        r => r.childId === pattern.childId && r.ltoId === pattern.ltoId && r.consequence.type === 'reinforcement'
      );

      const maintainingConsequence = {
        type: 'access' as const,
        description: '사회적 강화(칭찬, 주의)가 행동을 유지하는 주요 요소입니다.',
        evidence: [
          `사회적 강화 후 행동이 ${Math.round((reinforcementRecords.length / abcRecords.filter(r => r.childId === pattern.childId && r.ltoId === pattern.ltoId).length) * 100)}% 증가`,
          '독립적 행동 시 지속적인 강화 제공',
        ],
        confidence: 80,
      };

      const surrogate = {
        behavior: '손 들기',
        description: '주의 끌기 대신 손을 들어서 요청하는 것으로 대체',
        implementationNotes: '명확한 지시와 일관된 강화를 통해 교육',
      };

      const analysis: FunctionAnalysis = {
        id: `func-${pattern.childId}-${pattern.ltoId}`,
        abcPatternId,
        childId: pattern.childId,
        maintainingConsequence,
        surrogate,
        seasonality: {
          pattern: '오전 시간대에 더 높은 정확도 보임',
          occurrenceRate: 85,
        },
      };

      setFunctionAnalyses(prev => {
        const existing = prev.find(f => f.abcPatternId === abcPatternId);
        if (existing) {
          return prev.map(f => (f.abcPatternId === abcPatternId ? analysis : f));
        }
        return [...prev, analysis];
      });

      return analysis;
    },
    [abcPatterns, abcRecords]
  );

  // Get function analysis
  const getFunctionAnalysis = useCallback(
    (childId: number, ltoId: string) => {
      const pattern = abcPatterns.find(p => p.childId === childId && p.ltoId === ltoId);
      if (pattern) {
        return functionAnalyses.find(f => f.abcPatternId === pattern.id);
      }
      return undefined;
    },
    [abcPatterns, functionAnalyses]
  );

  // Update function analysis
  const updateFunctionAnalysis = useCallback((id: string, updates: Partial<FunctionAnalysis>) => {
    setFunctionAnalyses(prev =>
      prev.map(analysis =>
        analysis.id === id ? { ...analysis, ...updates } : analysis
      )
    );
  }, []);

  // Get insights
  const getInsights = useCallback((abcPatternId: string) => {
    const pattern = abcPatterns.find(p => p.id === abcPatternId);
    if (!pattern) return [];

    const insights: string[] = [];

    // Accuracy insights
    if (pattern.behaviorPatterns.averageAccuracy >= 90) {
      insights.push('우수한 숙달도! 다음 단계의 기술 학습을 고려해보세요.');
    } else if (pattern.behaviorPatterns.averageAccuracy >= 70) {
      insights.push('좋은 진전입니다. 꾸준한 연습을 계속 유지하세요.');
    } else {
      insights.push('추가 지원이 필요해 보입니다. 지시 방식이나 강화 방법을 재검토하세요.');
    }

    // Independence insights
    if (pattern.behaviorPatterns.independenceImprovement > 20) {
      insights.push('독립적 행동이 크게 향상되었습니다!');
    }

    // Latency insights
    if (pattern.behaviorPatterns.latencyTrend === 'decreasing') {
      insights.push('반응 속도가 개선되고 있습니다.');
    }

    return insights;
  }, [abcPatterns]);

  // Generate recommendations
  const generateRecommendations = useCallback(
    (childId: number, ltoId: string) => {
      const pattern = analyzePatterns(childId, ltoId);
      return pattern.recommendations;
    },
    [analyzePatterns]
  );

  const value: ABCContextType = {
    abcRecords,
    abcPatterns,
    functionAnalyses,
    recordABC,
    getABCRecords,
    updateABCRecord,
    deleteABCRecord,
    getABCRecordBySessionTask,
    analyzePatterns,
    getAllPatterns,
    updatePattern,
    analyzeFunctionality,
    getFunctionAnalysis,
    updateFunctionAnalysis,
    getInsights,
    generateRecommendations,
  };

  return <ABCContext.Provider value={value}>{children}</ABCContext.Provider>;
}

export function useABC() {
  const context = useContext(ABCContext);
  if (!context) {
    throw new Error('useABC must be used within ABCProvider');
  }
  return context;
}
