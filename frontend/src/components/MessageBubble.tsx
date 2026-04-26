import React from 'react';
import { Message } from '../types';
import { getSavedUser } from '../utils/deviceManager';
import { Heart, MessageCircle, Download } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onReact?: (emoji: string) => void;
  onReply?: (messageId: string) => void;
}

export default function MessageBubble({
  message,
  onReact,
  onReply,
}: MessageBubbleProps) {
  const user = getSavedUser();
  const isOwn = message.senderId === user?.id;

  const getMessageTypeIcon = () => {
    switch (message.type) {
      case 'feedback':
        return '💬';
      case 'milestone':
        return '🎉';
      case 'image':
        return '🖼️';
      case 'file':
        return '📎';
      default:
        return '';
    }
  };

  const getBackgroundColor = () => {
    if (isOwn) return 'bg-pastel-purple text-white';
    if (message.senderRole === 'therapist') return 'bg-pastel-pink text-white';
    return 'bg-gray-100 text-gray-900';
  };

  const getPriorityBorder = () => {
    if (message.priority === 'urgent') return 'border-l-4 border-red-500';
    if (message.priority === 'high') return 'border-l-4 border-orange-500';
    return '';
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-xs md:max-w-md lg:max-w-lg
          rounded-2xl
          px-4 py-3
          ${getBackgroundColor()}
          ${getPriorityBorder()}
          shadow-md
          transition-all
          hover:shadow-lg
        `}
      >
        {/* Sender info (if not own) */}
        {!isOwn && (
          <p className="text-xs font-semibold mb-1 opacity-75">
            {message.senderName} ({message.senderRole})
          </p>
        )}

        {/* Message content */}
        <div className="break-words">
          {getMessageTypeIcon() && (
            <span className="mr-2">{getMessageTypeIcon()}</span>
          )}
          <span>{message.content}</span>
        </div>

        {/* Tags */}
        {message.tags && message.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.tags.map(tag => (
              <span
                key={tag}
                className={`text-xs px-2 py-1 rounded-full ${
                  isOwn
                    ? 'bg-white/20 text-white'
                    : 'bg-white/20 text-gray-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map(attachment => (
              <a
                key={attachment.id}
                href={attachment.url}
                download={attachment.filename}
                className="flex items-center gap-2 text-xs underline hover:opacity-75 transition"
              >
                <Download size={14} />
                {attachment.filename}
              </a>
            ))}
          </div>
        )}

        {/* Metadata */}
        <p className="text-xs mt-2 opacity-60">
          {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {message.readAt && ' ✓'}
        </p>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map(reaction => (
              <button
                key={reaction.emoji}
                onClick={() => onReact?.(reaction.emoji)}
                className="text-sm bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition"
              >
                {reaction.emoji} {reaction.count > 1 && reaction.count}
              </button>
            ))}
          </div>
        )}

        {/* Action buttons (hover) */}
        <div className="flex gap-2 mt-2 opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={() => onReact?.('👍')}
            className="text-sm hover:scale-125 transition"
          >
            👍
          </button>
          <button
            onClick={() => onReact?.('❤️')}
            className="text-sm hover:scale-125 transition"
          >
            ❤️
          </button>
          {onReply && (
            <button
              onClick={() => onReply(message.id)}
              className="text-sm hover:scale-125 transition"
            >
              💬
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
