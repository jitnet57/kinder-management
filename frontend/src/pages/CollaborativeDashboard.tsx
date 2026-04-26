/**
 * 협업 대시보드 - 치료사와 부모가 함께 아동의 진행 상황을 모니터링
 *
 * 기능:
 * 1. 담당 아동 선택 (좌측 패널)
 * 2. 이번주 핵심 통계 (중앙)
 * 3. 메시지/피드백 패널 (우측)
 * 4. 목표 진행도 시각화
 * 5. 협업 노트 스레드
 */

import React, { useState, useEffect } from 'react';
import { useCollaborativeDashboard } from '../context/CollaborativeDashboardContext';
import { useCurriculum } from '../context/CurriculumContext';
import { getSavedUser } from '../utils/deviceManager';
import { CANONICAL_CHILDREN, CollaborativeNote } from '../types';
import {
  ChevronRight, MessageSquare, TrendingUp, AlertCircle,
  CheckCircle, Clock, Target, Users, Eye,
} from 'lucide-react';

export function CollaborativeDashboard() {
  const user = getSavedUser();
  const { getCollaborativeDashboard, getCollaborativeDashboards } = useCollaborativeDashboard();
  const { sessionTasks, completionTasks } = useCurriculum();

  // State
  const [selectedChildId, setSelectedChildId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'notes'>('overview');

  // Filter children based on user role
  const assignedChildren = user?.role === 'therapist'
    ? CANONICAL_CHILDREN // In production, filter by actual assignment
    : user?.role === 'parent'
      ? CANONICAL_CHILDREN.slice(0, 1) // In production, filter by parent relationship
      : CANONICAL_CHILDREN;

  const dashboard = getCollaborativeDashboard(selectedChildId);
  const selectedChild = CANONICAL_CHILDREN.find(c => c.id === selectedChildId);

  if (!dashboard || !selectedChild) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">대시보드 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      {/* Left Panel - Child Selection */}
      <aside className="w-64 bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">담당 아동</h3>
        <div className="space-y-2">
          {assignedChildren.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`w-full text-left p-3 rounded-lg transition ${
                selectedChildId === child.id
                  ? 'bg-pastel-purple text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: child.color }}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{child.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedChildId === child.id ? '선택됨' : '클릭하여 선택'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pastel-purple to-pastel-blue rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{selectedChild.name}</h1>
              <p className="text-white opacity-90">협업 대시보드 - 진행 상황 모니터링</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">{Math.round(dashboard.overview.overallProgress)}%</div>
              <p className="text-white opacity-90">전체 진행도</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {['overview', 'goals', 'notes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-pastel-purple text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'overview' && '📊 개요'}
              {tab === 'goals' && '🎯 목표'}
              {tab === 'notes' && '💬 협업노트'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab dashboard={dashboard} selectedChild={selectedChild} />}
        {activeTab === 'goals' && <GoalsTab dashboard={dashboard} selectedChildId={selectedChildId} />}
        {activeTab === 'notes' && <NotesTab selectedChildId={selectedChildId} />}
      </div>

      {/* Right Panel - Updates */}
      <aside className="w-80 bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">📬 부모 업데이트</h3>
        <div className="space-y-4">
          {/* Unread Messages */}
          <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">읽지 않은 메시지</p>
                <p className="text-2xl font-bold text-blue-600">{dashboard.parentUpdates.unreadMessages}</p>
              </div>
            </div>
          </div>

          {/* Unread Feedback */}
          <div className="bg-amber-50 rounded-lg p-3 border-l-4 border-amber-400">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">읽지 않은 피드백</p>
                <p className="text-2xl font-bold text-amber-600">{dashboard.parentUpdates.unreadFeedback}</p>
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="text-xs text-gray-500 mt-6 pt-4 border-t">
            마지막 업데이트: {new Date(dashboard.updatedAt).toLocaleDateString('ko-KR')}
          </div>
        </div>
      </aside>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ dashboard, selectedChild }: any) {
  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-600">이번주 세션</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {dashboard.thisWeek.sessionsCompleted} / {dashboard.thisWeek.sessionsScheduled}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-green-600" />
            <span className="text-sm font-medium text-gray-600">평균 점수</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(dashboard.thisWeek.averageScore)}점
          </p>
        </div>
      </div>

      {/* Top Domain */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">이번주 주요 영역</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {dashboard.thisWeek.topDomain.domainName}
              </span>
              <span className="text-sm font-bold text-green-600">
                {Math.round(dashboard.thisWeek.topDomain.progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${dashboard.thisWeek.topDomain.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">월간 추세</h3>
        <div className="flex items-end justify-between h-24 gap-2">
          {['week1', 'week2', 'week3', 'week4'].map((week, idx) => (
            <div key={week} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-gradient-to-t from-pastel-purple to-pastel-blue rounded-t"
                style={{ height: `${(dashboard.monthlyTrend[week as any] / 100) * 80}px` }}
              />
              <span className="text-xs text-gray-600">주 {idx + 1}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            📈 {dashboard.monthlyTrend.trend === 'improving' ? '개선 중' : '안정적'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Goals Tab Component
function GoalsTab({ dashboard, selectedChildId }: any) {
  return (
    <div className="space-y-6">
      {/* Active Goals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">진행 중인 목표</h3>
        <div className="space-y-3">
          {dashboard.goals.activeGoals.map((goal: any) => (
            <div key={goal.ltoId} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{goal.ltoName}</h4>
                  <p className="text-sm text-gray-500">{goal.domainName}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  goal.status === 'on_track' ? 'bg-green-100 text-green-800' :
                  goal.status === 'at_risk' ? 'bg-amber-100 text-amber-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {goal.status === 'on_track' ? '✓ 진행중' : goal.status === 'at_risk' ? '⚠ 주의' : '완료'}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">진행도</span>
                  <span className="text-sm font-bold text-pastel-purple">{Math.round(goal.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-pastel-purple h-2 rounded-full transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  다음 마일스톤: <strong>{goal.nextMilestone}</strong>
                </span>
                <span className="text-gray-600">
                  {goal.daysRemaining}일 남음
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Goals */}
      {dashboard.goals.completedGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">완료된 목표</h3>
          <div className="space-y-2">
            {dashboard.goals.completedGoals.map((goal: any) => (
              <div key={goal.ltoId} className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{goal.ltoName}</p>
                    <p className="text-xs text-gray-500">{new Date(goal.completedDate).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">{Math.round(goal.finalScore)}점</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Notes Tab Component
function NotesTab({ selectedChildId }: any) {
  const { getCollaborativeNotes, createCollaborativeNote } = useCollaborativeDashboard();
  const user = getSavedUser();
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<'observation' | 'insight' | 'concern' | 'celebration'>('observation');

  const notes = getCollaborativeNotes(selectedChildId);
  const pinnedNotes = notes.filter(n => n.isPinned);
  const regularNotes = notes.filter(n => !n.isPinned);

  const handleAddNote = async () => {
    if (!newNoteContent.trim() || !user) return;

    await createCollaborativeNote({
      childId: selectedChildId,
      type: newNoteType,
      author: {
        userId: user.id || 'unknown',
        name: user.name || 'Unknown',
        role: (user.role as any) || 'parent',
      },
      content: newNoteContent,
      responses: [],
      isPinned: false,
    });

    setNewNoteContent('');
    setNewNoteType('observation');
  };

  return (
    <div className="space-y-6">
      {/* Add Note */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">협업 노트 추가</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['observation', 'insight', 'concern', 'celebration'] as const).map(type => (
              <button
                key={type}
                onClick={() => setNewNoteType(type)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  newNoteType === type
                    ? 'bg-pastel-purple text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'observation' && '👀'}
                {type === 'insight' && '💡'}
                {type === 'concern' && '⚠️'}
                {type === 'celebration' && '🎉'}
                {' '}{type}
              </button>
            ))}
          </div>
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="노트를 작성하세요..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-purple"
            rows={3}
          />
          <button
            onClick={handleAddNote}
            disabled={!newNoteContent.trim()}
            className="w-full bg-pastel-purple text-white py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            추가하기
          </button>
        </div>
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">📌 고정된 노트</h3>
          <div className="space-y-2">
            {pinnedNotes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">💬 협업 노트</h3>
        <div className="space-y-2">
          {regularNotes.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NoteCard({ note }: { note: CollaborativeNote }) {
  const typeEmoji: Record<'observation' | 'insight' | 'concern' | 'celebration', string> = {
    observation: '👀',
    insight: '💡',
    concern: '⚠️',
    celebration: '🎉',
  };
  const emoji = typeEmoji[note.type];

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-pastel-purple">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {emoji} {note.type}
          </p>
          <p className="text-xs text-gray-500">{note.author.name} • {new Date(note.createdAt).toLocaleDateString('ko-KR')}</p>
        </div>
      </div>
      <p className="text-sm text-gray-700 mb-2">{note.content}</p>
      {note.responses.length > 0 && (
        <div className="mt-2 pt-2 border-t space-y-1">
          {note.responses.map((res: any) => (
            <div key={res.userId} className="text-xs">
              <span className="font-medium">{res.name}:</span>
              <span className="text-gray-600 ml-1">{res.content}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
