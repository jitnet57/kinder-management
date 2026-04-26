/**
 * 부모 전용 대시보드 - 간단하고 격려적인 아동 진행 보기
 *
 * 기능:
 * 1. 이번주 마일스톤 강조
 * 2. 집에서 할 수 있는 활동 (Action Items)
 * 3. 최근 성취 사진 + 점수
 * 4. 치료사의 최근 메시지
 * 5. 월간 요약
 */

import React, { useState, useEffect } from 'react';
import { useCollaborativeDashboard } from '../context/CollaborativeDashboardContext';
import { getSavedUser, CANONICAL_CHILDREN } from '../utils/deviceManager';
import { CANONICAL_CHILDREN as ALL_CHILDREN } from '../types';
import {
  CheckCircle, Star, MessageCircle, TrendingUp, Calendar,
  Home, Award, Heart, Zap,
} from 'lucide-react';

export function ParentDashboard() {
  const user = getSavedUser();
  const { getParentDashboard } = useCollaborativeDashboard();

  // In production, determine the childId from parent relationship
  const childId = ALL_CHILDREN[0]?.id || 1;
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (user) {
        const data = await getParentDashboard(childId, user.id || 'parent_001');
        setDashboard(data);
      }
      setLoading(false);
    };
    loadDashboard();
  }, [childId, user, getParentDashboard]);

  if (loading) {
    return <div className="p-6 text-center">로드 중...</div>;
  }

  if (!dashboard) {
    return <div className="p-6 text-center text-gray-500">대시보드를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header - Weekly Milestone */}
      <div className="bg-gradient-to-r from-pastel-pink to-pastel-purple rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Star size={28} fill="currentColor" />
          <h1 className="text-3xl font-bold">우리 {dashboard.overview.childName}</h1>
        </div>
        {dashboard.overview.thisWeekMilestone && (
          <p className="text-lg font-medium opacity-90">
            ✨ {dashboard.overview.thisWeekMilestone}
          </p>
        )}
        <p className="text-sm opacity-75 mt-2">
          지금 {dashboard.overview.currentFocus}를 배우고 있어요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left & Center */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Items - What to do at home */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Home size={24} className="text-amber-600" />
              집에서 할 일
            </h2>
            <div className="space-y-3">
              {dashboard.actionItems.map((item: any) => (
                <ActionItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          {/* Recent Achievements - Photo Gallery */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award size={24} className="text-green-600" />
              최근 성취
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboard.recentAchievements.map((achievement: any) => (
                <AchievementCard key={achievement.date} achievement={achievement} />
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-900">이번주 진행</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
                <span className="text-sm font-bold">75%</span>
              </div>
              <p className="text-xs text-gray-600">좋은 진행 중입니다!</p>
            </div>
          </div>

          {/* Latest Messages from Therapist */}
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MessageCircle size={18} className="text-blue-600" />
              치료사 메시지
            </h3>
            <div className="space-y-2">
              {dashboard.latestMessages.length === 0 ? (
                <p className="text-sm text-gray-600">메시지가 없습니다.</p>
              ) : (
                dashboard.latestMessages.map((msg: any) => (
                  <div key={msg.id} className="bg-white rounded p-2 text-xs">
                    <p className="font-medium text-gray-900">{msg.senderName}</p>
                    <p className="text-gray-600 line-clamp-2">{msg.content}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(msg.date).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Encouragement */}
          <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border-l-4 border-yellow-400">
            <div className="flex items-start gap-2">
              <Heart size={20} className="text-red-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900">따뜻한 말씀</p>
                <p className="text-sm text-gray-700 mt-1">
                  아이의 작은 진전도 소중합니다. 함께 응원하겠습니다!
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Monthly Summary */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={24} className="text-blue-600" />
          월간 요약
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Domain Progress */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">발달 영역별 진행</h3>
            <div className="space-y-3">
              {dashboard.monthlySummary.domainProgress.map((domain: any) => (
                <div key={domain.domainName}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{domain.domainName}</span>
                    <span className={`text-sm font-bold ${domain.improvement > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {domain.improvement > 0 ? '+' : ''}{domain.improvement}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full" style={{ width: '70%' }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{domain.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights & Focus Areas */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Zap size={18} className="text-yellow-600" />
                이번달 하이라이트
              </h3>
              <ul className="space-y-1">
                {dashboard.monthlySummary.highlights.map((highlight: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">집중할 영역</h3>
              <ul className="space-y-1">
                {dashboard.monthlySummary.areasToFocus.map((area: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 font-bold">→</span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Action Item Card Component
function ActionItemCard({ item }: any) {
  const completedToday = item.completedDates.includes(new Date().toISOString().split('T')[0]);

  return (
    <div className={`rounded-lg p-4 border-l-4 ${
      completedToday
        ? 'bg-green-50 border-green-400'
        : 'bg-white border-amber-400 shadow-sm'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{item.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
        </div>
        {completedToday && (
          <CheckCircle size={24} className="text-green-600 flex-shrink-0 ml-2" />
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
        <span className="flex items-center gap-1">
          <Calendar size={16} />
          {item.frequency}
        </span>
        <span>마감: {new Date(item.dueDate).toLocaleDateString('ko-KR')}</span>
      </div>

      {item.tips && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-gray-700">
          <strong>💡 팁:</strong> {item.tips}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <div className="flex-1 flex gap-1">
          {[...Array(7)].map((_, idx) => {
            const date = new Date();
            date.setDate(date.getDate() - 6 + idx);
            const dateStr = date.toISOString().split('T')[0];
            const completed = item.completedDates.includes(dateStr);
            return (
              <div
                key={idx}
                className={`flex-1 h-6 rounded ${
                  completed ? 'bg-green-400' : 'bg-gray-200'
                }`}
                title={new Date(dateStr).toLocaleDateString('ko-KR')}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Achievement Card Component
function AchievementCard({ achievement }: any) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="bg-gradient-to-r from-yellow-300 to-orange-300 h-32 flex items-center justify-center">
        {achievement.photo ? (
          <img src={achievement.photo} alt="성취" className="w-full h-full object-cover" />
        ) : (
          <Award size={48} className="text-yellow-600 opacity-50" />
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold text-gray-900">{achievement.description}</p>
        <p className="text-2xl font-bold text-amber-600 mt-2">{Math.round(achievement.score)}점</p>
        {achievement.therapistComment && (
          <p className="text-sm text-gray-600 mt-2 italic">"{achievement.therapistComment}"</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          {new Date(achievement.date).toLocaleDateString('ko-KR')}
        </p>
      </div>
    </div>
  );
}
