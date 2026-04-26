import React, { useState, useEffect } from 'react';
import { MessageCircle, Filter, Search, Plus, MessageSquare, AlertCircle, Lightbulb, Zap } from 'lucide-react';
import { useMessages } from '../context/MessageContext';
import { Conversation, Feedback } from '../types';
import { getSavedUser } from '../utils/deviceManager';
import { ChatWindow } from '../components/ChatWindow';
import FeedbackCard from '../components/FeedbackCard';

export function Messages() {
  const user = getSavedUser();
  const { conversations, getConversations, createConversation, getFeedbackByChild } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [userConversations, setUserConversations] = useState<Conversation[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'messages' | 'feedback'>('messages');
  const [filterChild, setFilterChild] = useState<number | 'all'>('all');
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | Feedback['type']>('all');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [newConvName, setNewConvName] = useState('');
  const [newConvChildId, setNewConvChildId] = useState<number>(1);

  const children = [
    { id: 1, name: '민준' },
    { id: 2, name: '소영' },
    { id: 3, name: '지호' },
    { id: 4, name: '연서' },
  ];

  useEffect(() => {
    if (user) {
      const filtered = getConversations(user.id, filterChild === 'all' ? undefined : filterChild);
      setUserConversations(filtered);
      if (filtered.length > 0 && !selectedConversation) {
        setSelectedConversation(filtered[0]);
      }
    }
  }, [conversations, filterChild, user]);

  useEffect(() => {
    if (activeTab === 'feedback' && filterChild !== 'all') {
      loadFeedback(filterChild);
    }
  }, [activeTab, filterChild]);

  const loadFeedback = async (childId: number) => {
    const feedback = await getFeedbackByChild(childId);
    setFeedbacks(feedback);
  };

  const handleCreateConversation = async () => {
    if (!newConvName.trim() || !user) return;

    const conv = await createConversation(
      'group',
      newConvName,
      newConvChildId,
      [user.id]
    );

    setSelectedConversation(conv);
    setIsCreatingConversation(false);
    setNewConvName('');
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesType = feedbackFilter === 'all' || f.type === feedbackFilter;
    const matchesSearch = f.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filteredConversations = userConversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUnreadCount = () => {
    return userConversations.reduce((sum, conv) => {
      return sum + (conv.unreadCount[user?.id || ''] || 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            <MessageCircle className="inline mr-2" size={32} />
            부모-치료사 메시징
          </h1>
          <p className="text-gray-600">아동의 진행상황, 피드백, 마일스톤을 실시간으로 공유합니다</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">미읽음</p>
          <p className="text-3xl font-bold text-pastel-purple">{getUnreadCount()}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-3 font-semibold transition ${
            activeTab === 'messages'
              ? 'text-pastel-purple border-b-2 border-pastel-purple'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MessageSquare className="inline mr-2" size={18} />
          메시지 ({userConversations.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-3 font-semibold transition ${
            activeTab === 'feedback'
              ? 'text-pastel-purple border-b-2 border-pastel-purple'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Lightbulb className="inline mr-2" size={18} />
          피드백 ({feedbacks.length})
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pastel-purple focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {/* Child filter */}
          <select
            value={filterChild}
            onChange={(e) => setFilterChild(e.target.value === 'all' ? 'all' : Number(e.target.value) as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pastel-purple focus:border-transparent"
          >
            <option value="all">모든 아동</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>

          {/* Feedback type filter (when on feedback tab) */}
          {activeTab === 'feedback' && (
            <select
              value={feedbackFilter}
              onChange={(e) => setFeedbackFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pastel-purple focus:border-transparent"
            >
              <option value="all">모든 피드백</option>
              <option value="progress">진행상황</option>
              <option value="concern">우려사항</option>
              <option value="suggestion">제안</option>
              <option value="celebration">축하</option>
            </select>
          )}

          {/* Create conversation button */}
          {activeTab === 'messages' && (
            <button
              onClick={() => setIsCreatingConversation(true)}
              className="px-4 py-2 bg-pastel-purple text-white rounded-lg hover:bg-pastel-purple/90 transition flex items-center gap-2"
            >
              <Plus size={18} />
              새 대화
            </button>
          )}
        </div>
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md">
              <div className="px-4 py-4 bg-gradient-to-r from-pastel-purple to-pastel-pink">
                <h3 className="text-lg font-bold text-white">대화 목록</h3>
              </div>

              {isCreatingConversation && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <input
                    type="text"
                    value={newConvName}
                    onChange={(e) => setNewConvName(e.target.value)}
                    placeholder="대화 제목..."
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                  />
                  <select
                    value={newConvChildId}
                    onChange={(e) => setNewConvChildId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-3 text-sm"
                  >
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateConversation}
                      className="flex-1 px-3 py-2 bg-pastel-purple text-white rounded text-sm font-semibold hover:bg-pastel-purple/90 transition"
                    >
                      생성
                    </button>
                    <button
                      onClick={() => setIsCreatingConversation(false)}
                      className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm font-semibold hover:bg-gray-300 transition"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              <div className="divide-y max-h-96 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    대화가 없습니다
                  </div>
                ) : (
                  filteredConversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full text-left px-4 py-3 transition ${
                        selectedConversation?.id === conv.id
                          ? 'bg-pastel-purple/10 border-l-4 border-pastel-purple'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 truncate">
                            {conv.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {conv.lastMessage?.senderName || '아직 메시지 없음'}
                          </p>
                        </div>
                        {conv.unreadCount[user?.id || ''] ? (
                          <span className="ml-2 px-2 py-1 bg-pastel-purple text-white text-xs font-bold rounded-full">
                            {conv.unreadCount[user?.id || '']}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation.id}
                childId={selectedConversation.childId}
                childName={children.find(c => c.id === selectedConversation.childId)?.name || '아동'}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle size={48} className="mx-auto mb-2 opacity-30" />
                  <p>대화를 선택해주세요</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 gap-4">
          {filterChild === 'all' ? (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="flex items-center gap-2 text-blue-700">
                <AlertCircle size={20} />
                피드백을 보려면 아동을 선택해주세요
              </p>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
              <Lightbulb size={48} className="mx-auto mb-2 opacity-30" />
              <p>피드백이 없습니다</p>
            </div>
          ) : (
            filteredFeedbacks.map(feedback => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                onDelete={(id) => {
                  setFeedbacks(feedbacks.filter(f => f.id !== id));
                }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
