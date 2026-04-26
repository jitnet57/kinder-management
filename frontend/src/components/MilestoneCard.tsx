import React from 'react';
import { Milestone } from '../types';
import { Award, Target, TrendingUp, Users } from 'lucide-react';

interface MilestoneCardProps {
  milestone: Milestone;
  onDelete?: (milestoneId: string) => void;
}

export default function MilestoneCard({
  milestone,
  onDelete,
}: MilestoneCardProps) {
  const getMilestoneIcon = () => {
    switch (milestone.type) {
      case 'lto_completed':
        return <Target className="w-8 h-8 text-blue-500" />;
      case 'domain_mastered':
        return <Award className="w-8 h-8 text-gold-500" />;
      case 'behavior_improvement':
        return <TrendingUp className="w-8 h-8 text-green-500" />;
      case 'social_achievement':
        return <Users className="w-8 h-8 text-purple-500" />;
      default:
        return <Award className="w-8 h-8 text-gray-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (milestone.type) {
      case 'lto_completed':
        return 'LTO 완료';
      case 'domain_mastered':
        return '영역 완성';
      case 'behavior_improvement':
        return '행동 개선';
      case 'social_achievement':
        return '사회성 발달';
      default:
        return '마일스톤';
    }
  };

  const getBackgroundColor = () => {
    switch (milestone.type) {
      case 'lto_completed':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200';
      case 'domain_mastered':
        return 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200';
      case 'behavior_improvement':
        return 'bg-gradient-to-br from-green-50 to-green-100 border-green-200';
      case 'social_achievement':
        return 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200';
    }
  };

  return (
    <div className={`rounded-2xl border-2 shadow-lg overflow-hidden transition-all hover:shadow-xl ${getBackgroundColor()}`}>
      {/* Header with icon */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getMilestoneIcon()}
            <div>
              <h3 className="text-lg font-bold text-gray-800">{milestone.title}</h3>
              <p className="text-sm font-semibold text-gray-600">{getTypeLabel()}</p>
            </div>
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(milestone.id)}
              className="text-gray-400 hover:text-red-500 transition text-2xl leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Celebration message - prominent */}
        <div className="p-4 bg-white/60 rounded-xl mb-4 border-2 border-white/80">
          <p className="text-lg font-semibold text-gray-800 text-center">
            {milestone.celebrationMessage}
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-base leading-relaxed mb-4">
          {milestone.description}
        </p>

        {/* Photo */}
        {milestone.photo && (
          <div className="mb-4 rounded-lg overflow-hidden border-2 border-white/80">
            <img
              src={milestone.photo}
              alt={milestone.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Achievement date */}
        <div className="text-sm text-gray-600 mb-4 p-2 bg-white/40 rounded">
          <strong>달성일:</strong>{' '}
          {new Date(milestone.achievementDate).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>

        {/* Related LTO */}
        {milestone.relatedLtoId && (
          <div className="text-sm text-gray-600 mb-4 p-2 bg-white/40 rounded">
            <strong>관련 LTO:</strong> {milestone.relatedLtoId}
          </div>
        )}
      </div>

      {/* Witnesses */}
      {milestone.witnesses.length > 0 && (
        <div className="border-t-2 border-white/80 px-6 py-4 bg-white/40">
          <p className="text-sm font-semibold text-gray-700 mb-2">증인:</p>
          <div className="flex flex-wrap gap-2">
            {milestone.witnesses.map((witness, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white/70 rounded-full text-sm text-gray-700"
              >
                {witness.name}
                <span className="ml-1 text-xs text-gray-500">({witness.role})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-white/30 border-t border-white/80 text-xs text-gray-600">
        생성: {new Date(milestone.achievementDate).toLocaleString('ko-KR')}
      </div>
    </div>
  );
}
