import { useState } from 'react';
import { CANONICAL_CHILDREN } from '../types';
import { useABC } from '../context/ABCContext';
import { ABCRecorder } from '../components/ABCRecorder';
import { ABCAnalytics } from '../components/ABCAnalytics';
import { ABCDataList } from '../components/ABCDataList';

export function ABCAnalysis() {
  const [selectedChildId, setSelectedChildId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'record' | 'analyze' | 'history'>('record');
  const { abcRecords } = useABC();

  const childRecords = abcRecords.filter(record => record.childId === selectedChildId);
  const selectedChild = CANONICAL_CHILDREN.find(c => c.id === selectedChildId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📊 ABC 분석 시스템</h1>
            <p className="text-gray-600 mt-2">선행사-행동-결과 분석으로 아동 행동 이해</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">아동 선택</p>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(Number(e.target.value))}
              className="mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pastel-purple focus:border-transparent"
            >
              {CANONICAL_CHILDREN.map(child => (
                <option key={child.id} value={child.id}>
                  {child.name} ({child.age}세)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('record')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            activeTab === 'record'
              ? 'bg-pastel-purple text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          📝 기록하기
        </button>
        <button
          onClick={() => setActiveTab('analyze')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            activeTab === 'analyze'
              ? 'bg-pastel-purple text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          📈 분석
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            activeTab === 'history'
              ? 'bg-pastel-purple text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          📋 기록 목록 ({childRecords.length})
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'record' && (
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">새 ABC 기록</h2>
            <ABCRecorder
              childId={selectedChildId}
              sessionTaskId="new-session"
              ltoId="domain_mand_lto01"
              stoId="domain_mand_lto01_sto1"
              onClose={() => setActiveTab('history')}
            />
          </div>
        )}

        {activeTab === 'analyze' && (
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedChild?.name} - 행동 분석
            </h2>
            {childRecords.length > 0 ? (
              <ABCAnalytics childId={selectedChildId} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>분석할 데이터가 없습니다.</p>
                <p className="text-sm mt-2">기록하기 탭에서 ABC 데이터를 기록해주세요.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">기록 목록</h2>
            {childRecords.length > 0 ? (
              <ABCDataList childId={selectedChildId} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>기록된 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
