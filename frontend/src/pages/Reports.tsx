import { useState, useMemo } from 'react';
import { useCurriculum } from '../context/CurriculumContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ScatterChart, Scatter } from 'recharts';
import { Download, TrendingUp, Users, Award, Target } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun } from 'docx';

const CHILDREN_DATA = [
  { id: 'c1', name: '민준', color: '#FFB6D9' },
  { id: 'c2', name: '소영', color: '#B4D7FF' },
  { id: 'c3', name: '지호', color: '#C1FFD7' },
  { id: 'c4', name: '연서', color: '#FFE4B5' },
];

const COLORS = ['#FFB6D9', '#B4D7FF', '#C1FFD7', '#FFE4B5', '#D7C1FF', '#FFD7E4'];

const CHART_TYPES = [
  { value: 'line', label: '📈 라인 그래프', icon: '📉' },
  { value: 'bar', label: '📊 막대 그래프', icon: '📊' },
  { value: 'pie', label: '🥧 원형 그래프', icon: '🥧' },
  { value: 'area', label: '🌊 영역 그래프', icon: '🌊' },
  { value: 'scatter', label: '💫 산점도', icon: '💫' },
];

export function Reports() {
  const { completionTasks, domains } = useCurriculum();
  const [reportType, setReportType] = useState<'individual' | 'overall'>('individual');
  const [selectedChild, setSelectedChild] = useState<string>('민준');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie' | 'area' | 'scatter'>('line');

  // 아동별 데이터 필터링
  const childReportData = useMemo(() => {
    const tasks = completionTasks.filter(task => task.childId === selectedChild);

    if (tasks.length === 0) {
      return {
        tasks: [],
        avgScore: 0,
        totalSessions: 0,
        improvementRate: 0,
        topDomains: [],
        scoresByDate: [],
        scoresByDomain: [],
      };
    }

    // 평균 점수
    const avgScore = Math.round(tasks.reduce((sum, t) => sum + t.score, 0) / tasks.length);

    // 개선도 (첫 5개 vs 마지막 5개 비교)
    const first5 = tasks.slice(0, 5).reduce((sum, t) => sum + t.score, 0) / Math.min(5, tasks.length);
    const last5 = tasks.slice(-5).reduce((sum, t) => sum + t.score, 0) / Math.min(5, tasks.length);
    const improvementRate = Math.round(((last5 - first5) / first5) * 100);

    // 날짜별 점수
    const scoresByDate = tasks
      .reduce((acc: any[], task) => {
        const date = new Date(task.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        const existing = acc.find(d => d.date === date);
        if (existing) {
          existing.score = (existing.score + task.score) / 2;
          existing.count += 1;
        } else {
          acc.push({ date, score: task.score, count: 1 });
        }
        return acc;
      }, [])
      .slice(-10);

    // 발달영역별 점수
    const domainScores: { [key: string]: { sum: number; count: number } } = {};
    tasks.forEach(task => {
      const domain = domains.find(d => d.id === task.domainId);
      if (domain) {
        if (!domainScores[domain.name]) {
          domainScores[domain.name] = { sum: 0, count: 0 };
        }
        domainScores[domain.name].sum += task.score;
        domainScores[domain.name].count += 1;
      }
    });

    const scoresByDomain = Object.entries(domainScores).map(([name, data]) => ({
      name,
      score: Math.round(data.sum / data.count),
      count: data.count,
    }));

    return {
      tasks,
      avgScore,
      totalSessions: tasks.length,
      improvementRate,
      topDomains: scoresByDomain.sort((a, b) => b.score - a.score),
      scoresByDate,
      scoresByDomain,
    };
  }, [selectedChild, completionTasks, domains]);

  // 전체 통계
  const overallStats = useMemo(() => {
    if (completionTasks.length === 0) {
      return {
        totalChildren: 0,
        totalSessions: 0,
        avgScoreOverall: 0,
        childStats: [],
        domainStats: [],
        scoreDistribution: [],
      };
    }

    // 아동별 통계
    const childStats = CHILDREN_DATA.map(child => {
      const tasks = completionTasks.filter(task => task.childId === child.name);
      return {
        name: child.name,
        color: child.color,
        sessions: tasks.length,
        avgScore: tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.score, 0) / tasks.length) : 0,
      };
    }).filter(stat => stat.sessions > 0);

    // 발달영역별 통계
    const domainScores: { [key: string]: { sum: number; count: number } } = {};
    completionTasks.forEach(task => {
      const domain = domains.find(d => d.id === task.domainId);
      if (domain) {
        if (!domainScores[domain.name]) {
          domainScores[domain.name] = { sum: 0, count: 0 };
        }
        domainScores[domain.name].sum += task.score;
        domainScores[domain.name].count += 1;
      }
    });

    const domainStats = Object.entries(domainScores).map(([name, data]) => ({
      name,
      score: Math.round(data.sum / data.count),
      count: data.count,
    }));

    // 점수 분포
    const scoreRanges = [
      { range: '80-100', min: 80, max: 100, count: 0 },
      { range: '60-79', min: 60, max: 79, count: 0 },
      { range: '40-59', min: 40, max: 59, count: 0 },
      { range: '0-39', min: 0, max: 39, count: 0 },
    ];

    completionTasks.forEach(task => {
      const found = scoreRanges.find(r => task.score >= r.min && task.score <= r.max);
      if (found) found.count += 1;
    });

    const avgScoreOverall = Math.round(
      completionTasks.reduce((sum, t) => sum + t.score, 0) / completionTasks.length
    );

    return {
      totalChildren: childStats.length,
      totalSessions: completionTasks.length,
      avgScoreOverall,
      childStats,
      domainStats,
      scoreDistribution: scoreRanges.filter(r => r.count > 0),
    };
  }, [completionTasks, domains]);

  // 아동별 보고서 그래프 렌더링
  const renderChildChart = () => {
    if (childReportData.scoresByDate.length === 0) return null;

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={childReportData.scoresByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={childReportData.scoresByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={childReportData.scoresByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="score" fill="#8b5cf6" stroke="#6d28d9" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={childReportData.scoresByDate} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" name="날짜" />
              <YAxis dataKey="score" name="점수" domain={[0, 100]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="점수" data={childReportData.scoresByDate} fill="#ec4899" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  // 전체 통계 그래프 렌더링
  const renderOverallChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overallStats.childStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overallStats.childStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="avgScore" radius={[8, 8, 0, 0]}>
                {overallStats.childStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={overallStats.childStats}
                dataKey="avgScore"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {overallStats.childStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={overallStats.childStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="avgScore" fill="#10b981" stroke="#059669" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" name="아동" />
              <YAxis dataKey="avgScore" name="평균 점수" domain={[0, 100]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="평균 점수" data={overallStats.childStats} fill="#f59e0b" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const handleExport = async (format: 'json' | 'excel' | 'word') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `report-${selectedChild || 'all'}-${timestamp}`;

    try {
      if (format === 'json') {
        const data = reportType === 'individual'
          ? { type: 'individual', child: selectedChild, data: childReportData }
          : { type: 'overall', data: overallStats };

        const dataStr = JSON.stringify(data, null, 2);
        const element = document.createElement('a');
        element.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`);
        element.setAttribute('download', `${filename}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } else if (format === 'excel') {
        if (reportType === 'individual') {
          const wb = XLSX.utils.book_new();

          // 통계 시트
          const statsData = [
            ['아동', selectedChild],
            ['총 세션', childReportData.totalSessions],
            ['평균 점수', childReportData.avgScore + '점'],
            ['개선도', childReportData.improvementRate + '%'],
          ];
          const ws1 = XLSX.utils.aoa_to_sheet(statsData);
          XLSX.utils.book_append_sheet(wb, ws1, '통계');

          // 날짜별 점수 시트
          const dateData = [['날짜', '점수']];
          childReportData.scoresByDate.forEach(d => {
            dateData.push([d.date, d.score]);
          });
          const ws2 = XLSX.utils.aoa_to_sheet(dateData);
          XLSX.utils.book_append_sheet(wb, ws2, '날짜별 점수');

          // 발달영역별 점수 시트
          const domainData = [['발달영역', '세션 수', '평균 점수']];
          childReportData.scoresByDomain.forEach(d => {
            domainData.push([d.name, d.count.toString(), d.score.toString()]);
          });
          const ws3 = XLSX.utils.aoa_to_sheet(domainData);
          XLSX.utils.book_append_sheet(wb, ws3, '발달영역');

          XLSX.writeFile(wb, `${filename}.xlsx`);
        } else {
          const wb = XLSX.utils.book_new();

          // 요약 시트
          const summaryData = [
            ['등록 아동', overallStats.totalChildren.toString()],
            ['총 세션', overallStats.totalSessions.toString()],
            ['평균 점수', overallStats.avgScoreOverall + '점'],
          ];
          const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
          XLSX.utils.book_append_sheet(wb, ws1, '요약');

          // 아동별 성과 시트
          const childData = [['아동', '세션 수', '평균 점수']];
          overallStats.childStats.forEach(c => {
            childData.push([c.name, c.sessions.toString(), c.avgScore.toString()]);
          });
          const ws2 = XLSX.utils.aoa_to_sheet(childData);
          XLSX.utils.book_append_sheet(wb, ws2, '아동별 성과');

          // 발달영역별 통계 시트
          const domainData = [['발달영역', '총 세션', '평균 점수']];
          overallStats.domainStats.forEach(d => {
            domainData.push([d.name, d.count.toString(), d.score.toString()]);
          });
          const ws3 = XLSX.utils.aoa_to_sheet(domainData);
          XLSX.utils.book_append_sheet(wb, ws3, '발달영역');

          XLSX.writeFile(wb, `${filename}.xlsx`);
        }
      } else if (format === 'word') {
        let doc;

        if (reportType === 'individual') {
          const tableRows = [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('항목')] }),
                new TableCell({ children: [new Paragraph('값')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('아동')] }),
                new TableCell({ children: [new Paragraph(selectedChild)] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(childReportData.totalSessions.toString())] }),
                new TableCell({ children: [new Paragraph('총 세션')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('평균 점수')] }),
                new TableCell({ children: [new Paragraph(childReportData.avgScore + '점')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('개선도')] }),
                new TableCell({ children: [new Paragraph(childReportData.improvementRate + '%')] }),
              ],
            }),
          ];

          doc = new Document({
            sections: [{
              children: [
                new Paragraph({
                  children: [new TextRun({
                    text: `${selectedChild} 아동 보고서`,
                    bold: true,
                    size: 64,
                  })],
                }),
                new Paragraph({ text: '' }),
                new Paragraph({
                  children: [new TextRun({
                    text: '📊 통계 요약',
                    bold: true,
                    size: 48,
                  })],
                }),
                new Table({
                  rows: tableRows,
                  width: { size: 100, type: WidthType.PERCENTAGE },
                }),
                new Paragraph({ text: '' }),
                new Paragraph({
                  children: [new TextRun({
                    text: '📅 날짜별 점수',
                    bold: true,
                    size: 48,
                  })],
                }),
                new Table({
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph('날짜')] }),
                        new TableCell({ children: [new Paragraph('점수')] }),
                      ],
                    }),
                    ...childReportData.scoresByDate.map(d =>
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph(d.date)] }),
                          new TableCell({ children: [new Paragraph(d.score.toString())] }),
                        ],
                      })
                    ),
                  ],
                  width: { size: 100, type: WidthType.PERCENTAGE },
                }),
              ],
            }],
          });
        } else {
          const tableRows = [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('항목')] }),
                new TableCell({ children: [new Paragraph('값')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('등록 아동')] }),
                new TableCell({ children: [new Paragraph(overallStats.totalChildren.toString())] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('총 세션')] }),
                new TableCell({ children: [new Paragraph(overallStats.totalSessions.toString())] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('평균 점수')] }),
                new TableCell({ children: [new Paragraph(overallStats.avgScoreOverall + '점')] }),
              ],
            }),
          ];

          doc = new Document({
            sections: [{
              children: [
                new Paragraph({
                  children: [new TextRun({
                    text: '전체 통계 보고서',
                    bold: true,
                    size: 64,
                  })],
                }),
                new Paragraph({ text: '' }),
                new Paragraph({
                  children: [new TextRun({
                    text: '📊 요약',
                    bold: true,
                    size: 48,
                  })],
                }),
                new Table({
                  rows: tableRows,
                  width: { size: 100, type: WidthType.PERCENTAGE },
                }),
                new Paragraph({ text: '' }),
                new Paragraph({
                  children: [new TextRun({
                    text: '👥 아동별 성과',
                    bold: true,
                    size: 48,
                  })],
                }),
                new Table({
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph('아동')] }),
                        new TableCell({ children: [new Paragraph('세션 수')] }),
                        new TableCell({ children: [new Paragraph('평균 점수')] }),
                      ],
                    }),
                    ...overallStats.childStats.map(c =>
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph(c.name)] }),
                          new TableCell({ children: [new Paragraph(c.sessions.toString())] }),
                          new TableCell({ children: [new Paragraph(c.avgScore.toString())] }),
                        ],
                      })
                    ),
                  ],
                  width: { size: 100, type: WidthType.PERCENTAGE },
                }),
              ],
            }],
          });
        }

        const blob = await Packer.toBlob(doc);
        const element = document.createElement('a');
        element.href = URL.createObjectURL(blob);
        element.download = `${filename}.docx`;
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(element.href);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('내보내기에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">📊 보고서 분석</h1>
        <p className="text-blue-100">아동의 성장을 다양한 시각으로 분석하세요</p>
      </div>

      {/* 보고서 타입 선택 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setReportType('individual')}
          className={`glass rounded-2xl p-6 transition-all transform hover:-translate-y-1 cursor-pointer ${
            reportType === 'individual'
              ? 'ring-2 ring-pastel-purple bg-pastel-purple bg-opacity-20'
              : 'hover:shadow-lg'
          }`}
        >
          <Users size={32} className={reportType === 'individual' ? 'text-pastel-purple mb-2' : 'text-gray-600 mb-2'} />
          <h3 className="text-lg font-bold text-gray-800">👤 아동별 보고서</h3>
          <p className="text-sm text-gray-600 mt-1">특정 아동의 상세 데이터 분석</p>
        </button>

        <button
          onClick={() => setReportType('overall')}
          className={`glass rounded-2xl p-6 transition-all transform hover:-translate-y-1 cursor-pointer ${
            reportType === 'overall'
              ? 'ring-2 ring-pastel-purple bg-pastel-purple bg-opacity-20'
              : 'hover:shadow-lg'
          }`}
        >
          <Award size={32} className={reportType === 'overall' ? 'text-pastel-purple mb-2' : 'text-gray-600 mb-2'} />
          <h3 className="text-lg font-bold text-gray-800">📈 전체 통계</h3>
          <p className="text-sm text-gray-600 mt-1">모든 아동의 종합 데이터</p>
        </button>
      </div>

      {/* 아동별 보고서 */}
      {reportType === 'individual' && (
        <div className="space-y-6">
          {/* 아동 선택 */}
          <div className="glass rounded-2xl p-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">아동 선택</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CHILDREN_DATA.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child.name)}
                  className={`p-3 rounded-lg transition border-2 ${
                    selectedChild === child.name
                      ? 'border-pastel-purple bg-pastel-purple bg-opacity-20'
                      : 'border-transparent hover:border-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedChild === child.name ? undefined : `${child.color}20`
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2"
                    style={{ backgroundColor: child.color }}
                  >
                    {child.name[0]}
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{child.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 통계 카드 */}
          {childReportData.totalSessions > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass rounded-2xl p-6 bg-gradient-to-br from-blue-400 to-blue-500 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold opacity-90">📊 총 세션</p>
                    <Target size={20} />
                  </div>
                  <p className="text-3xl font-bold">{childReportData.totalSessions}</p>
                </div>

                <div className="glass rounded-2xl p-6 bg-gradient-to-br from-green-400 to-green-500 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold opacity-90">⭐ 평균 점수</p>
                    <Award size={20} />
                  </div>
                  <p className="text-3xl font-bold">{childReportData.avgScore}점</p>
                </div>

                <div className="glass rounded-2xl p-6 bg-gradient-to-br from-purple-400 to-purple-500 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold opacity-90">📈 개선도</p>
                    <TrendingUp size={20} />
                  </div>
                  <p className={`text-3xl font-bold ${childReportData.improvementRate >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {childReportData.improvementRate >= 0 ? '+' : ''}{childReportData.improvementRate}%
                  </p>
                </div>

                <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
                  <Download size={24} className="text-pastel-purple" />
                  <div className="flex gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => handleExport('json')}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 transition"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 transition"
                    >
                      Excel
                    </button>
                    <button
                      onClick={() => handleExport('word')}
                      className="px-3 py-1 bg-orange-500 text-white rounded text-xs font-semibold hover:bg-orange-600 transition"
                    >
                      Word
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-gray-600">내보내기</p>
                </div>
              </div>

              {/* 그래프 타입 선택 */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">📊 그래프 유형 선택</h3>
                <div className="flex flex-wrap gap-2">
                  {CHART_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setChartType(type.value as 'line' | 'bar' | 'pie' | 'area' | 'scatter')}
                      className={`px-4 py-2 rounded-lg transition font-semibold ${
                        chartType === type.value
                          ? 'bg-pastel-purple text-white shadow-lg'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-pastel-purple'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 그래프 */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📅 점수 추이</h3>
                {renderChildChart()}
              </div>

              {/* 상세 데이터 */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📋 발달영역 상세</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white bg-opacity-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">발달영역</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">세션 수</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">평균 점수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {childReportData.scoresByDomain.map((domain, idx) => (
                        <tr key={idx} className="border-t border-white border-opacity-30 hover:bg-white hover:bg-opacity-20 transition">
                          <td className="px-4 py-3 text-gray-800">{domain.name}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{domain.count}회</td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                              {domain.score}점
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-gray-600 text-lg">기록된 데이터가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 전체 통계 보고서 */}
      {reportType === 'overall' && (
        <div className="space-y-6">
          {/* 통계 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-6 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold opacity-90">👶 등록 아동</p>
                <Users size={20} />
              </div>
              <p className="text-3xl font-bold">{overallStats.totalChildren}명</p>
            </div>

            <div className="glass rounded-2xl p-6 bg-gradient-to-br from-blue-400 to-blue-500 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold opacity-90">📊 총 세션</p>
                <Target size={20} />
              </div>
              <p className="text-3xl font-bold">{overallStats.totalSessions}회</p>
            </div>

            <div className="glass rounded-2xl p-6 bg-gradient-to-br from-green-400 to-green-500 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold opacity-90">⭐ 평균 점수</p>
                <Award size={20} />
              </div>
              <p className="text-3xl font-bold">{overallStats.avgScoreOverall}점</p>
            </div>

            <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
              <Download size={24} className="text-pastel-purple" />
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => handleExport('json')}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 transition"
                >
                  JSON
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 transition"
                >
                  Excel
                </button>
                <button
                  onClick={() => handleExport('word')}
                  className="px-3 py-1 bg-orange-500 text-white rounded text-xs font-semibold hover:bg-orange-600 transition"
                >
                  Word
                </button>
              </div>
              <p className="text-xs font-semibold text-gray-600">내보내기</p>
            </div>
          </div>

          {/* 그래프 타입 선택 */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3">📊 그래프 유형 선택</h3>
            <div className="flex flex-wrap gap-2">
              {CHART_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setChartType(type.value as 'line' | 'bar' | 'pie' | 'area' | 'scatter')}
                  className={`px-4 py-2 rounded-lg transition font-semibold ${
                    chartType === type.value
                      ? 'bg-pastel-purple text-white shadow-lg'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-pastel-purple'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* 아동별 성과 비교 */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">👥 아동별 성과 비교</h3>
            {renderOverallChart()}
          </div>

          {/* 발달영역별 분석 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 발달영역별 평균 점수 */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 발달영역별 평균 점수</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overallStats.domainStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 점수 분포 */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📊 점수 분포</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={overallStats.scoreDistribution}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {overallStats.scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 상세 테이블 */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📋 발달영역 통계</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white bg-opacity-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">발달영역</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">총 세션</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">평균 점수</th>
                  </tr>
                </thead>
                <tbody>
                  {overallStats.domainStats.map((domain, idx) => (
                    <tr key={idx} className="border-t border-white border-opacity-30 hover:bg-white hover:bg-opacity-20 transition">
                      <td className="px-4 py-3 text-gray-800">{domain.name}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{domain.count}회</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                          {domain.score}점
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 아동별 상세 정보 */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">👥 아동별 상세 통계</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white bg-opacity-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">아동</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">세션 수</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">평균 점수</th>
                  </tr>
                </thead>
                <tbody>
                  {overallStats.childStats.map((child, idx) => (
                    <tr key={idx} className="border-t border-white border-opacity-30 hover:bg-white hover:bg-opacity-20 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: child.color }}
                          />
                          <span className="text-gray-800 font-semibold">{child.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{child.sessions}회</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                          {child.avgScore}점
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
