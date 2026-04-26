import React, { useState } from 'react';
import { Feedback, FeedbackActionItem } from '../types';
import { CheckCircle2, AlertCircle, Lightbulb, Zap, ChevronDown } from 'lucide-react';

interface FeedbackCardProps {
  feedback: Feedback;
  onStatusChange?: (actionId: string, status: FeedbackActionItem['status']) => void;
  onDelete?: (feedbackId: string) => void;
}

export default function FeedbackCard({
  feedback,
  onStatusChange,
  onDelete,
}: FeedbackCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeIcon = () => {
    switch (feedback.type) {
      case 'progress':
        return <Zap className="w-5 h-5 text-green-500" />;
      case 'concern':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'suggestion':
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'celebration':
        return <span className="text-2xl">🎉</span>;
      default:
        return <CheckCircle2 className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeBgColor = () => {
    switch (feedback.type) {
      case 'progress':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'concern':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'suggestion':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'celebration':
        return 'bg-purple-50 border-l-4 border-purple-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-300';
    }
  };

  const getTypeLabel = () => {
    switch (feedback.type) {
      case 'progress':
        return '진행상황';
      case 'concern':
        return '우려사항';
      case 'suggestion':
        return '제안';
      case 'celebration':
        return '축하';
      default:
        return 'feedback';
    }
  };

  const getSentimentColor = () => {
    switch (feedback.sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'concerning':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={`
        rounded-lg border border-gray-200 shadow-md
        transition-all hover:shadow-lg
        ${getTypeBgColor()}
      `}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            {getTypeIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-1 bg-white/50 text-xs font-semibold rounded">
                  {getTypeLabel()}
                </span>
                {feedback.urgency === 'high' && (
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                    긴급
                  </span>
                )}
                {feedback.urgency === 'medium' && (
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                    중요
                  </span>
                )}
              </div>
              <p className={`text-sm font-medium ${getSentimentColor()} mt-1`}>
                {feedback.senderName} ({feedback.senderRole})
              </p>
            </div>
          </div>
          <button
            onClick={() => onDelete?.(feedback.id)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <p className="text-gray-700 text-sm mb-3">{feedback.content}</p>

        {/* Category */}
        {feedback.category && (
          <div className="text-xs text-gray-600 mb-3 p-2 bg-white/40 rounded">
            <strong>영역:</strong> {feedback.category.domain} &gt;{' '}
            {feedback.category.skill}
          </div>
        )}

        {/* Evidence */}
        {feedback.evidence && feedback.evidence.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">근거:</p>
            {feedback.evidence.map((ev, idx) => (
              <div
                key={idx}
                className="text-xs text-gray-600 bg-white/40 p-2 rounded mb-1"
              >
                <p className="font-semibold">{ev.date}</p>
                <p>{ev.observation}</p>
                {ev.photoUrl && (
                  <a
                    href={ev.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pastel-purple hover:underline block mt-1"
                  >
                    📸 사진 보기
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Items */}
      {feedback.actionItems && feedback.actionItems.length > 0 && (
        <div className="border-t border-gray-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/30 transition"
          >
            <span className="text-sm font-semibold">
              실행 항목 ({feedback.actionItems.filter(a => a.status === 'completed').length}/
              {feedback.actionItems.length})
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {isExpanded && (
            <div className="px-4 py-3 space-y-2 border-t border-gray-200">
              {feedback.actionItems.map(action => (
                <div
                  key={action.id}
                  className="flex items-center gap-3 p-2 bg-white/50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={action.status === 'completed'}
                    onChange={(e) => {
                      const newStatus = e.target.checked ? 'completed' : 'pending';
                      onStatusChange?.(action.id, newStatus);
                    }}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        action.status === 'completed'
                          ? 'line-through text-gray-500'
                          : 'text-gray-700'
                      }`}
                    >
                      {action.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      담당: {action.assignedTo} | 마감: {action.dueDate}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {action.status === 'completed'
                      ? '완료'
                      : action.status === 'in_progress'
                      ? '진행중'
                      : '대기'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div className="px-4 py-2 border-t border-gray-200 text-xs text-gray-500 bg-white/20">
        {new Date(feedback.createdAt).toLocaleString('ko-KR')}
      </div>
    </div>
  );
}
