import { useMemo, useState } from 'react';
import { useABC } from '../context/ABCContext';
import { CANONICAL_CHILDREN } from '../types';
import { Trash2, Edit, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface ABCDataListProps {
  childId?: number;
  ltoId?: string;
}

export function ABCDataList({ childId = 1, ltoId }: ABCDataListProps) {
  const { abcRecords, deleteABCRecord, getABCRecords } = useABC();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState(childId);
  const [selectedLTO, setSelectedLTO] = useState(ltoId || 'all');
  const [sortBy, setSortBy] = useState<'date' | 'accuracy'>('date');

  const filteredAndSortedRecords = useMemo(() => {
    let records = getABCRecords(selectedChild, selectedLTO === 'all' ? undefined : selectedLTO);

    if (sortBy === 'date') {
      records.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
    } else if (sortBy === 'accuracy') {
      records.sort(
        (a, b) =>
          b.behavior.dataPoints.accuracy - a.behavior.dataPoints.accuracy
      );
    }

    return records;
  }, [selectedChild, selectedLTO, sortBy, getABCRecords]);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-100 text-green-800';
    if (accuracy >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getResponseTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      correct: '✓ 정확',
      incorrect: '✗ 부정확',
      partial: '~ 부분',
      no_response: '무반응',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ABC 데이터 기록</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">아동 선택</label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
            >
              {CANONICAL_CHILDREN.map(child => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">LTO 선택</label>
            <select
              value={selectedLTO}
              onChange={(e) => setSelectedLTO(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
            >
              <option value="all">모든 LTO</option>
              <option value="domain_mand_lto01">만드기 - LTO 1</option>
              <option value="domain_tact_lto01">접촉 - LTO 1</option>
              <option value="domain_mand_lto02">만드기 - LTO 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">정렬</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'accuracy')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
            >
              <option value="date">최신순</option>
              <option value="accuracy">정확도순</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          총 {filteredAndSortedRecords.length}개의 기록
        </p>
      </div>

      {/* Data list */}
      <div className="space-y-2">
        {filteredAndSortedRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">기록된 ABC 데이터가 없습니다.</p>
          </div>
        ) : (
          filteredAndSortedRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {/* Header row */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === record.id ? null : record.id)
                }
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {record.behavior.targetBehavior}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(record.sessionDate).toLocaleDateString('ko-KR')} ·{' '}
                        {record.timeRecorded}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getAccuracyColor(record.behavior.dataPoints.accuracy)}`}
                      >
                        {record.behavior.dataPoints.accuracy}%
                      </div>

                      <div className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                        {getResponseTypeLabel(record.behavior.responseType)}
                      </div>
                    </div>
                  </div>
                </div>

                {expandedId === record.id ? (
                  <ChevronUp size={20} className="text-gray-500" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500" />
                )}
              </button>

              {/* Expanded details */}
              {expandedId === record.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                  {/* ABC Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Antecedent */}
                    <div className="border-l-4 border-orange-400 pl-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase">
                        선행사건 (A)
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {record.antecedent.description}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        유형: {record.antecedent.type}
                      </p>
                      {record.antecedent.context && (
                        <p className="text-xs text-gray-600">
                          맥락: {record.antecedent.context}
                        </p>
                      )}
                    </div>

                    {/* Behavior */}
                    <div className="border-l-4 border-blue-400 pl-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase">
                        행동 (B)
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {record.behavior.targetBehavior}
                      </p>
                      <div className="text-xs text-gray-600 mt-2 space-y-1">
                        <p>
                          시도: {record.behavior.dataPoints.correctTrials}/
                          {record.behavior.dataPoints.trials}
                        </p>
                        <p>
                          독립성:{' '}
                          {record.behavior.dataPoints.independenceLevel}
                        </p>
                        <p>지연시간: {record.behavior.latency}초</p>
                      </div>
                    </div>

                    {/* Consequence */}
                    <div className="border-l-4 border-green-400 pl-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase">
                        결과 (C)
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {record.consequence.reinforcer || '없음'}
                      </p>
                      <div className="text-xs text-gray-600 mt-2 space-y-1">
                        <p>
                          유형:{' '}
                          {record.consequence.type === 'reinforcement'
                            ? '강화'
                            : record.consequence.type === 'punishment'
                              ? '처벌'
                              : record.consequence.type === 'extinction'
                                ? '소거'
                                : '없음'}
                        </p>
                        <p>
                          효과:{' '}
                          {record.consequence.effectOnBehavior === 'increased'
                            ? '증가'
                            : record.consequence.effectOnBehavior === 'decreased'
                              ? '감소'
                              : '변화 없음'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      기록 정보
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                      <div>
                        <p className="font-semibold">기록자</p>
                        <p>{record.recordedBy.name}</p>
                      </div>
                      <div>
                        <p className="font-semibold">역할</p>
                        <p>{record.recordedBy.role}</p>
                      </div>
                      {record.reliability?.secondObserver && (
                        <div>
                          <p className="font-semibold">제2 관찰자</p>
                          <p>{record.reliability.secondObserver.name}</p>
                        </div>
                      )}
                      {record.reliability?.interraterReliability && (
                        <div>
                          <p className="font-semibold">신뢰도(IOA)</p>
                          <p>{Math.round(record.reliability.interraterReliability)}%</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {record.behavior.notes && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        관찰 노트
                      </p>
                      <p className="text-sm text-gray-700">
                        {record.behavior.notes}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="border-t border-gray-200 pt-4 flex justify-end gap-2">
                    <button className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-2">
                      <Eye size={16} />
                      보기
                    </button>
                    <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                      <Edit size={16} />
                      수정
                    </button>
                    <button
                      onClick={() => deleteABCRecord(record.id)}
                      className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
