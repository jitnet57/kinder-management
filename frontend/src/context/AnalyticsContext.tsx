import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  InterventionAnalysisResult,
  InterventionEffect,
  BehaviorPredictionResult,
  LearningVelocityComparison,
  VelocityMetrics,
  AutoInsightResult,
  InsightRecommendation,
  ChildId,
  CANONICAL_CHILDREN,
  ABCRecord,
  SessionTask,
} from '../types';
import { storageManager } from '../utils/storage';

interface AnalyticsContextType {
  // 중재 효과 분석 (Intervention Analysis)
  analyzeInterventionEffectiveness: (
    childId: number,
    ltoId: string,
    period: { start: string; end: string }
  ) => InterventionAnalysisResult;
  getInterventionHistory: () => InterventionAnalysisResult[];

  // 행동 예측 (Behavior Prediction)
  predictBehavior: (
    childId: number,
    ltoId: string,
    daysAhead: number
  ) => BehaviorPredictionResult;
  getPredictionHistory: () => BehaviorPredictionResult[];

  // 학습 속도 분석 (Learning Velocity)
  calculateLearningVelocity: (
    period: 'week' | 'month'
  ) => LearningVelocityComparison;

  // 자동 인사이트 (AI Insights)
  generateInsights: (childId: number) => AutoInsightResult;
  getInsightHistory: () => AutoInsightResult[];

  // 유틸리티
  exportAnalytics: (format: 'json' | 'csv') => string;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// ============= 마크 ABC 기록 및 세션 과제 생성 =============
const generateMockABCRecords = (): ABCRecord[] => {
  const childIds: ChildId[] = [1, 2, 3, 4];
  const records: ABCRecord[] = [];
  const today = new Date();

  const interventions = [
    { id: 'int-reinforce', name: '사회적 강화', strategy: 'reinforcement' as const },
    { id: 'int-tangible', name: '실물 강화', strategy: 'reinforcement' as const },
    { id: 'int-prompt', name: '프롬프트', strategy: 'prompt' as const },
    { id: 'int-fade', name: '프롬프트 감소', strategy: 'prompt_fading' as const },
    { id: 'int-extinction', name: '소거', strategy: 'extinction' as const },
  ];

  const ltoIds = ['domain_mand_lto01', 'domain_tact_lto01', 'domain_mand_lto02'];

  childIds.forEach((childId, childIdx) => {
    for (let i = 0; i < 35; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const intIdx = i % interventions.length;
      const ltoIdx = Math.floor(Math.random() * ltoIds.length);
      const baseAccuracy = 60 + Math.random() * 30;
      const accuracy = Math.min(100, baseAccuracy + (35 - i) * 2 + Math.random() * 10);

      records.push({
        id: `abc-${childIdx}-${i}`,
        sessionTaskId: `task-${childIdx}-${i}`,
        childId,
        ltoId: ltoIds[ltoIdx],
        stoId: `${ltoIds[ltoIdx]}_sto1`,
        antecedent: {
          type: 'instruction' as const,
          description: `지시 ${interventions[intIdx].name}`,
          context: '교실 내',
        },
        behavior: {
          targetBehavior: '행동 목표',
          responseType: accuracy > 70 ? 'correct' : accuracy > 40 ? 'partial' : 'incorrect',
          latency: Math.floor(Math.random() * 5) + 1,
          dataPoints: {
            trials: 5,
            correctTrials: Math.floor((accuracy / 100) * 5),
            accuracy: Math.round(accuracy),
            independenceLevel: accuracy > 80 ? 'independent' : accuracy > 50 ? 'partial' : 'assisted',
          },
        },
        consequence: {
          type: interventions[intIdx].strategy === 'reinforcement' ? 'reinforcement' : interventions[intIdx].strategy === 'extinction' ? 'extinction' : 'none',
          reinforcementType: interventions[intIdx].strategy === 'reinforcement' ? (intIdx % 2 === 0 ? 'social' : 'tangible') : undefined,
          effectOnBehavior: accuracy > 75 ? 'increased' : accuracy > 50 ? 'unchanged' : 'decreased',
        },
        sessionDate: dateStr,
        timeRecorded: `${10 + Math.floor(i / 7)}:${Math.floor(Math.random() * 60)}`,
        recordedBy: {
          userId: `user-therapist-${(childIdx % 2) + 1}`,
          name: (childIdx % 2) === 0 ? '김치료사' : '이치료사',
          role: 'therapist',
        },
        createdAt: new Date(date).toISOString(),
        updatedAt: new Date(date).toISOString(),
      });
    }
  });

  return records;
};

const generateMockSessionTasks = (): SessionTask[] => {
  const childIds: ChildId[] = [1, 2, 3, 4];
  const tasks: SessionTask[] = [];
  const today = new Date();

  const domainIds = ['domain_mand', 'domain_tact'];
  const ltoIds = ['domain_mand_lto01', 'domain_tact_lto01', 'domain_mand_lto02'];
  const stoIds = ['domain_mand_lto01_sto1', 'domain_tact_lto01_sto1', 'domain_mand_lto02_sto1'];

  childIds.forEach((childId, childIdx) => {
    for (let i = 0; i < 35; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const domainIdx = i % domainIds.length;
      const ltoIdx = i % ltoIds.length;

      const baseScore = 60 + Math.random() * 30;
      const score = Math.min(100, baseScore + (35 - i) * 2);

      tasks.push({
        id: `task-${childIdx}-${i}`,
        childId,
        domainId: domainIds[domainIdx],
        ltoId: ltoIds[ltoIdx],
        stoId: stoIds[ltoIdx],
        date: dateStr,
        startTime: `10:${Math.floor(Math.random() * 60)}`,
        endTime: `10:${30 + Math.floor(Math.random() * 30)}`,
        score: Math.round(score),
        notes: `세션 기록 ${i + 1}`,
        completed: true,
        completedAt: new Date(date).toISOString(),
      });
    }
  });

  return tasks;
};

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [interventionHistory, setInterventionHistory] = useState<InterventionAnalysisResult[]>([]);
  const [predictionHistory, setPredictionHistory] = useState<BehaviorPredictionResult[]>([]);
  const [insightHistory, setInsightHistory] = useState<AutoInsightResult[]>([]);

  const mockABCRecords = generateMockABCRecords();
  const mockSessionTasks = generateMockSessionTasks();

  // ============= 1️⃣ 중재 효과 분석 (Intervention Analysis) =============

  const analyzeInterventionEffectiveness = useCallback(
    (
      childId: number,
      ltoId: string,
      period: { start: string; end: string }
    ): InterventionAnalysisResult => {
      // 해당 기간의 ABC 기록 필터링
      const periodRecords = mockABCRecords.filter(
        record =>
          record.childId === childId &&
          record.ltoId === ltoId &&
          record.sessionDate >= period.start &&
          record.sessionDate <= period.end
      );

      // 중재별 효과도 계산
      const interventionMap = new Map<string, InterventionEffect>();

      const interventionTypes = [
        { id: 'int-reinforce', name: '사회적 강화', strategy: 'reinforcement' as const },
        { id: 'int-tangible', name: '실물 강화', strategy: 'reinforcement' as const },
        { id: 'int-prompt', name: '프롬프트', strategy: 'prompt' as const },
        { id: 'int-fade', name: '프롬프트 감소', strategy: 'prompt_fading' as const },
        { id: 'int-extinction', name: '소거', strategy: 'extinction' as const },
      ];

      interventionTypes.forEach(intervention => {
        const relatedRecords = periodRecords.filter((_, idx) => idx % 5 === interventionTypes.indexOf(intervention));

        if (relatedRecords.length > 0) {
          const accuracies = relatedRecords.map(r => r.behavior.dataPoints.accuracy);
          const avgAccuracy = Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length);
          const successCount = accuracies.filter(a => a >= 70).length;

          const trend =
            accuracies[0] > accuracies[Math.max(0, accuracies.length - 1)]
              ? ('declining' as const)
              : accuracies[0] < accuracies[Math.max(0, accuracies.length - 1)]
              ? ('improving' as const)
              : ('stable' as const);

          interventionMap.set(intervention.id, {
            interventionId: intervention.id,
            interventionName: intervention.name,
            strategy: intervention.strategy,
            reinforcerType: intervention.strategy === 'reinforcement' ? 'social' : undefined,
            effectiveness: avgAccuracy,
            applicationsCount: relatedRecords.length,
            successRate: Math.round((successCount / relatedRecords.length) * 100),
            trend,
            averageLatency: 2.5,
            confidenceScore: Math.min(100, relatedRecords.length * 10),
          });
        }
      });

      const interventions = Array.from(interventionMap.values());
      const mostEffective = interventions.reduce((prev, current) =>
        prev.effectiveness > current.effectiveness ? prev : current
      );
      const leastEffective = interventions.reduce((prev, current) =>
        prev.effectiveness < current.effectiveness ? prev : current
      );

      const childName = CANONICAL_CHILDREN.find(c => c.id === childId)?.name || '아동';
      const ltoName = `LTO-${ltoId.split('_').pop()}`;

      const result: InterventionAnalysisResult = {
        id: `intervention-${childId}-${ltoId}-${Date.now()}`,
        childId,
        childName,
        ltoId,
        ltoName,
        periodStart: period.start,
        periodEnd: period.end,
        daysAnalyzed: periodRecords.length,
        interventions,
        mostEffective: {
          interventionId: mostEffective.interventionId,
          interventionName: mostEffective.interventionName,
          effectiveness: mostEffective.effectiveness,
        },
        leastEffective: {
          interventionId: leastEffective.interventionId,
          interventionName: leastEffective.interventionName,
          effectiveness: leastEffective.effectiveness,
        },
        recommendations: [
          `${mostEffective.interventionName}(${mostEffective.effectiveness}점)가 가장 효과적입니다.`,
          `${leastEffective.interventionName}의 효과도는 ${leastEffective.effectiveness}점입니다. 다른 전략 검토가 필요합니다.`,
          `${childName}에게는 사회적 강화와 실물 강화의 조합이 권장됩니다.`,
          `정기적인 프롬프트 감소 연습이 독립성 향상에 도움이 될 것입니다.`,
        ],
        totalTrials: periodRecords.length * 5,
        overallProgress: Math.round(interventions.reduce((a, b) => a + b.effectiveness, 0) / interventions.length),
        analyzedAt: new Date().toISOString(),
      };

      setInterventionHistory(prev => [...prev, result]);
      storageManager.set(`intervention-analysis-${childId}`, result);

      return result;
    },
    [mockABCRecords]
  );

  const getInterventionHistory = useCallback(() => {
    return interventionHistory;
  }, [interventionHistory]);

  // ============= 2️⃣ 행동 예측 (Behavior Prediction) =============

  const predictBehavior = useCallback(
    (childId: number, ltoId: string, daysAhead: number): BehaviorPredictionResult => {
      // 과거 5주 데이터 추출
      const now = new Date();
      const fiveWeeksAgo = new Date(now);
      fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);

      const historicalTasks = mockSessionTasks.filter(
        task =>
          task.childId === childId &&
          task.ltoId === ltoId &&
          task.date >= fiveWeeksAgo.toISOString().split('T')[0] &&
          task.date <= now.toISOString().split('T')[0]
      );

      // 주간 데이터 정리
      const weeklyData: { week: number; accuracy: number; date: string }[] = [];
      for (let week = 0; week < 5; week++) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (week + 1) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekTasks = historicalTasks.filter(
          t => t.date >= weekStart.toISOString().split('T')[0] && t.date <= weekEnd.toISOString().split('T')[0]
        );

        if (weekTasks.length > 0) {
          const avgAccuracy = Math.round(weekTasks.reduce((a, b) => a + b.score, 0) / weekTasks.length);
          weeklyData.push({
            week: 5 - week,
            accuracy: avgAccuracy,
            date: weekStart.toISOString().split('T')[0],
          });
        }
      }

      const baselineAccuracy =
        weeklyData.length > 0
          ? Math.round(weeklyData.reduce((a, b) => a + b.accuracy, 0) / weeklyData.length)
          : 70;

      // 선형 회귀로 추세 계산
      let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumX2 = 0;
      const n = weeklyData.length;

      weeklyData.forEach((data, idx) => {
        sumX += idx;
        sumY += data.accuracy;
        sumXY += idx * data.accuracy;
        sumX2 += idx * idx;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // 미래 예측
      const predictions = [];
      for (let i = 1; i <= Math.ceil(daysAhead / 7); i++) {
        const predictedAccuracy = Math.min(100, Math.max(0, intercept + slope * (n - 1 + i)));
        predictions.push({
          week: i,
          predictedAccuracy: Math.round(predictedAccuracy),
          confidenceInterval: {
            lower: Math.max(0, Math.round(predictedAccuracy - 10)),
            upper: Math.min(100, Math.round(predictedAccuracy + 10)),
          },
          trend: slope > 2 ? ('improving' as const) : slope < -2 ? ('declining' as const) : ('stable' as const),
        });
      }

      const childName = CANONICAL_CHILDREN.find(c => c.id === childId)?.name || '아동';
      const ltoName = `LTO-${ltoId.split('_').pop()}`;

      const predictedOutcomeWeek = predictions[predictions.length - 1];
      const nextMilestoneDate = new Date(now);
      nextMilestoneDate.setDate(nextMilestoneDate.getDate() + daysAhead);

      const result: BehaviorPredictionResult = {
        id: `prediction-${childId}-${ltoId}-${Date.now()}`,
        childId,
        childName,
        ltoId,
        ltoName,
        baselineAccuracy,
        historicalData: weeklyData,
        predictions,
        predictedOutcome: {
          week: predictions.length,
          expectedAccuracy: predictedOutcomeWeek.predictedAccuracy,
          likelihood: Math.min(95, 50 + weeklyData.length * 10),
        },
        modelAccuracy: Math.min(100, 65 + weeklyData.length * 7),
        trend: slope > 2 ? 'improving' : slope < -2 ? 'declining' : 'stable',
        nextMilestoneEstimate: nextMilestoneDate.toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };

      setPredictionHistory(prev => [...prev, result]);
      storageManager.set(`behavior-prediction-${childId}`, result);

      return result;
    },
    [mockSessionTasks]
  );

  const getPredictionHistory = useCallback(() => {
    return predictionHistory;
  }, [predictionHistory]);

  // ============= 3️⃣ 학습 속도 분석 (Learning Velocity) =============

  const calculateLearningVelocity = useCallback(
    (period: 'week' | 'month'): LearningVelocityComparison => {
      const childIds: ChildId[] = [1, 2, 3, 4];
      const now = new Date();
      const daysBack = period === 'week' ? 7 : 30;
      const periodStart = new Date(now);
      periodStart.setDate(periodStart.getDate() - daysBack);

      const childrenMetrics: VelocityMetrics[] = childIds.map(childId => {
        const childTasks = mockSessionTasks.filter(
          task =>
            task.childId === childId &&
            task.date >= periodStart.toISOString().split('T')[0] &&
            task.date <= now.toISOString().split('T')[0]
        );

        const scores = childTasks.map(t => t.score);
        const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 70;

        const firstScore = scores[scores.length - 1] || 60;
        const lastScore = scores[0] || 70;
        const improvement = lastScore - firstScore;
        const weeksAnalyzed = period === 'week' ? 1 : 4;

        return {
          childId,
          childName: CANONICAL_CHILDREN.find(c => c.id === childId)?.name || '아동',
          weeklyImprovement: Math.round((improvement / weeksAnalyzed) * 10) / 10,
          accelerationRate: Math.max(0, Math.min(100, 50 + improvement * 5)),
          consistencyScore: Math.round(100 - Math.sqrt(scores.reduce((a, v) => a + Math.pow(v - averageScore, 2), 0) / scores.length) * 0.5),
          averageScore,
          peakScore: Math.max(...scores, 70),
          lowestScore: Math.min(...scores, 60),
        };
      });

      const fastestLearner = childrenMetrics.reduce((prev, current) =>
        prev.weeklyImprovement > current.weeklyImprovement ? prev : current
      );

      const needsSupportChild = childrenMetrics.reduce((prev, current) =>
        prev.weeklyImprovement < current.weeklyImprovement ? prev : current
      );

      const averageVelocity =
        Math.round((childrenMetrics.reduce((a, b) => a + b.weeklyImprovement, 0) / childrenMetrics.length) * 10) / 10;

      const periodLabel = period === 'week' ? '이번 주' : '이번 달';

      const result: LearningVelocityComparison = {
        id: `velocity-${Date.now()}`,
        period,
        periodLabel,
        childrenMetrics,
        fastestLearner: {
          childId: fastestLearner.childId,
          childName: fastestLearner.childName,
          velocity: fastestLearner.weeklyImprovement,
        },
        needsSupportChild: {
          childId: needsSupportChild.childId,
          childName: needsSupportChild.childName,
          velocity: needsSupportChild.weeklyImprovement,
          reason:
            needsSupportChild.weeklyImprovement < 0
              ? '진도가 감소하고 있습니다. 중재 전략 검토가 필요합니다.'
              : '학습 속도가 느립니다. 추가 지원이 권장됩니다.',
        },
        averageVelocity,
        analysisDate: new Date().toISOString(),
      };

      storageManager.set('learning-velocity', result);
      return result;
    },
    [mockSessionTasks]
  );

  // ============= 4️⃣ 자동 인사이트 (AI Insights) =============

  const generateInsights = useCallback(
    (childId: number): AutoInsightResult => {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - now.getDay());

      const weekTasks = mockSessionTasks.filter(
        task =>
          task.childId === childId &&
          task.date >= weekStart.toISOString().split('T')[0] &&
          task.date <= now.toISOString().split('T')[0]
      );

      const scores = weekTasks.map(t => t.score);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 70;
      const weekNumber = Math.ceil((now.getDate()) / 7);

      const childName = CANONICAL_CHILDREN.find(c => c.id === childId)?.name || '아동';

      // 인사이트 생성
      const insights: InsightRecommendation[] = [];

      // 강점
      if (avgScore >= 80) {
        insights.push({
          id: 'insight-strength-1',
          category: 'strength',
          title: '우수한 진도',
          description: `${childName}는 이번 주에 평균 ${avgScore}점으로 우수한 성과를 보였습니다.`,
          evidence: [
            { data_point: '주간 평균 점수', value: avgScore, date: now.toISOString().split('T')[0] },
            { data_point: '완료한 과제', value: weekTasks.length, date: now.toISOString().split('T')[0] },
          ],
          priority: 'high',
          estimatedImpact: 'high',
        });
      }

      // 개선 필요 영역
      if (avgScore < 70) {
        insights.push({
          id: 'insight-improvement-1',
          category: 'improvement_area',
          title: '집중력 향상 필요',
          description: `평균 점수가 ${avgScore}점으로 목표보다 낮습니다. 집중력 향상을 위한 중재가 필요합니다.`,
          evidence: [
            { data_point: '주간 평균 점수', value: avgScore, date: now.toISOString().split('T')[0] },
            { data_point: '목표 점수', value: 75, date: now.toISOString().split('T')[0] },
          ],
          priority: 'high',
          actionItems: [
            '세션 길이를 15분으로 단축',
            '보강 자극 빈도 증가',
            '가정에서 연습 시간 늘리기',
          ],
          estimatedImpact: 'high',
        });
      }

      // 신체 부위 지시 개선
      if (Math.random() > 0.3) {
        insights.push({
          id: 'insight-intervention-1',
          category: 'intervention',
          title: '신체 부위 지시 개선',
          description: '지난주 대비 신체 부위 지시 정확도가 15% 향상되었습니다.',
          evidence: [
            { data_point: '지난주 정확도', value: '65%', date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { data_point: '이번주 정확도', value: '80%', date: now.toISOString().split('T')[0] },
          ],
          priority: 'normal',
          estimatedImpact: 'medium',
        });
      }

      // 다음주 초점
      insights.push({
        id: 'insight-next-focus-1',
        category: 'next_focus',
        title: '다음주 초점 영역',
        description: `${childName}의 다음주 학습은 수학 개념 이해에 중점을 두기를 권장합니다.`,
        evidence: [
          { data_point: '현재 진도', value: '중간 단계', date: now.toISOString().split('T')[0] },
          { data_point: '예상 도달점', value: '고급 단계', date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        ],
        priority: 'normal',
        actionItems: [
          '수학 관련 자료 준비',
          '구체적 학습 활동 설계',
          '부모 피드백 수집',
        ],
        estimatedImpact: 'medium',
      });

      const keyStrengths =
        avgScore >= 75
          ? ['우수한 집중력', '빠른 학습 속도', '지시 따르기 능력']
          : ['성장 의욕', '꾸준한 참여'];

      const areasToFocus =
        avgScore < 70
          ? ['집중력 강화', '독립성 증대', '자신감 개발']
          : ['상위 수준 기술', '일반화 능력'];

      const result: AutoInsightResult = {
        id: `insight-${childId}-${weekNumber}-${Date.now()}`,
        childId,
        childName,
        weekNumber,
        dateRange: {
          start: weekStart.toISOString().split('T')[0],
          end: now.toISOString().split('T')[0],
        },
        insights,
        summary: {
          overallProgress:
            avgScore >= 80
              ? `${childName}는 우수한 진도를 보이고 있습니다. 현재의 중재 방식을 계속 유지하세요.`
              : avgScore >= 70
              ? `${childName}는 좋은 진행 중입니다. 약간의 추가 지원이 도움이 될 것 같습니다.`
              : `${childName}는 추가 지원이 필요합니다. 중재 전략 검토를 권장합니다.`,
          keyStrengths,
          areasToFocus,
          nextWeekFocus:
            avgScore >= 75
              ? '상위 수준 기술 학습으로 진행'
              : avgScore >= 70
              ? '현재 단계 강화 후 진행'
              : '기초 개념 재학습 및 강화',
        },
        generatedAt: new Date().toISOString(),
        modelVersion: 'v1.0-akms-insights',
      };

      setInsightHistory(prev => [...prev, result]);
      storageManager.set(`auto-insights-${childId}`, result);

      return result;
    },
    [mockSessionTasks]
  );

  const getInsightHistory = useCallback(() => {
    return insightHistory;
  }, [insightHistory]);

  // ============= 데이터 내보내기 =============

  const exportAnalytics = useCallback(
    (format: 'json' | 'csv'): string => {
      const data = {
        interventionHistory,
        predictionHistory,
        insightHistory,
        exportedAt: new Date().toISOString(),
      };

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else {
        // CSV 형식으로 변환
        let csv = 'Analytics Export Report\n';
        csv += `Exported: ${new Date().toISOString()}\n\n`;

        csv += '=== Intervention Analysis ===\n';
        interventionHistory.forEach(analysis => {
          csv += `Child: ${analysis.childName}, LTO: ${analysis.ltoName}\n`;
          csv += `Overall Progress: ${analysis.overallProgress}%\n`;
          csv += `Total Trials: ${analysis.totalTrials}\n\n`;
        });

        csv += '=== Behavior Predictions ===\n';
        predictionHistory.forEach(pred => {
          csv += `Child: ${pred.childName}, LTO: ${pred.ltoName}\n`;
          csv += `Baseline Accuracy: ${pred.baselineAccuracy}%\n`;
          csv += `Predicted Outcome: ${pred.predictedOutcome.expectedAccuracy}%\n`;
          csv += `Model Accuracy: ${pred.modelAccuracy}%\n\n`;
        });

        csv += '=== AI Insights ===\n';
        insightHistory.forEach(insight => {
          csv += `Child: ${insight.childName}, Week: ${insight.weekNumber}\n`;
          csv += `Insights Generated: ${insight.insights.length}\n`;
          csv += `Summary: ${insight.summary.overallProgress}\n\n`;
        });

        return csv;
      }
    },
    [interventionHistory, predictionHistory, insightHistory]
  );

  const value: AnalyticsContextType = {
    analyzeInterventionEffectiveness,
    getInterventionHistory,
    predictBehavior,
    getPredictionHistory,
    calculateLearningVelocity,
    generateInsights,
    getInsightHistory,
    exportAnalytics,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
};
