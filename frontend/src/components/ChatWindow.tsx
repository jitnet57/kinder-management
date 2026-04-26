import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Paperclip, Smile } from 'lucide-react';
import { Message } from '../types';
import { useMessages } from '../context/MessageContext';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  conversationId: string;
  childId: number;
  childName: string;
}

export function ChatWindow({ conversationId, childId, childName }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getMessages, sendMessage } = useMessages();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const loaded = await getMessages(conversationId, 50, 0);
      setMessages(loaded);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      const newMessage = await sendMessage(
        conversationId,
        inputValue,
        'text',
        { childId }
      );
      setMessages([...messages, newMessage]);
      setInputValue('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newMessage = await sendMessage(
        conversationId,
        `📎 ${file.name}`,
        file.type.startsWith('image/') ? 'image' : 'file',
        { childId, filename: file.name }
      );
      setMessages([...messages, newMessage]);
    } catch (error) {
      console.error('파일 전송 실패:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pastel-purple to-pastel-pink">
        <h3 className="text-lg font-semibold text-white">{childName} 진행상황</h3>
        <p className="text-sm text-white/80">대화 ID: {conversationId}</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin">⏳ 메시지를 로드하는 중입니다...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">아직 메시지가 없습니다</p>
              <p className="text-sm">첫 메시지를 작성해 보세요!</p>
            </div>
          </div>
        ) : (
          messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-lg border border-gray-300 px-4 py-3 focus-within:ring-2 focus-within:ring-pastel-purple focus-within:border-transparent">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 bg-transparent outline-none"
            />
            <label className="cursor-pointer text-gray-500 hover:text-pastel-purple transition">
              <Paperclip size={18} />
              <input
                type="file"
                onChange={handleAttachFile}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
            </label>
            <button
              type="button"
              className="text-gray-500 hover:text-pastel-purple transition"
            >
              <Smile size={18} />
            </button>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-pastel-purple hover:bg-pastel-purple/90 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Send size={18} />
            <span className="hidden sm:inline">전송</span>
          </button>
        </form>
      </div>
    </div>
  );
}
