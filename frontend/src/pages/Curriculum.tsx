import { useState } from 'react';
import { ChevronDown, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';

export function Curriculum() {
  const { domains, addDomain, editDomain, deleteDomain, addLTO, editLTO, deleteLTO, addSTO, editSTO, deleteSTO } = useCurriculum();
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);

  // 입력 상태
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [editingDomain, setEditingDomain] = useState<string | null>(null);
  const [editingDomainName, setEditingDomainName] = useState('');
  const [editingLTO, setEditingLTO] = useState<string | null>(null);
  const [editingLTOName, setEditingLTOName] = useState('');
  const [editingSTO, setEditingSTO] = useState<string | null>(null);
  const [editingSTOName, setEditingSTOName] = useState('');
  const [addingLTO, setAddingLTO] = useState<string | null>(null);
  const [newLTOName, setNewLTOName] = useState('');
  const [addingSTO, setAddingSTO] = useState<string | null>(null);
  const [newSTOName, setNewSTOName] = useState('');

  // 처음 로드 시 모든 도메인 확장
  if (expandedDomains.length === 0 && domains.length > 0) {
    setExpandedDomains(domains.map(d => d.id));
  }

  const toggleDomain = (id: string) => {
    setExpandedDomains(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleAddDomain = () => {
    if (newDomainName.trim()) {
      addDomain(newDomainName);
      setNewDomainName('');
      setShowAddDomain(false);
    }
  };

  const handleEditDomain = (id: string, name: string) => {
    editDomain(id, name);
    setEditingDomain(null);
  };

  const handleAddLTO = (domainId: string) => {
    if (newLTOName.trim()) {
      addLTO(domainId, newLTOName);
      setNewLTOName('');
      setAddingLTO(null);
    }
  };

  const handleEditLTO = (domainId: string, ltoId: string, name: string) => {
    editLTO(domainId, ltoId, name);
    setEditingLTO(null);
  };

  const handleAddSTO = (domainId: string, ltoId: string) => {
    if (newSTOName.trim()) {
      addSTO(domainId, ltoId, newSTOName);
      setNewSTOName('');
      setAddingSTO(null);
    }
  };

  const handleEditSTO = (domainId: string, ltoId: string, stoId: string, name: string) => {
    editSTO(domainId, ltoId, stoId, name);
    setEditingSTO(null);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">📚 커리큘럼 관리</h2>

      {/* 발달영역 추가 폼 */}
      {showAddDomain ? (
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newDomainName}
              onChange={(e) => setNewDomainName(e.target.value)}
              placeholder="새 발달영역 이름..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
              autoFocus
            />
            <button
              onClick={handleAddDomain}
              className="px-6 py-2 bg-pastel-purple text-white rounded-lg font-semibold hover:bg-opacity-90"
            >
              추가
            </button>
            <button
              onClick={() => setShowAddDomain(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddDomain(true)}
          className="mb-8 flex items-center gap-2 bg-pastel-purple text-white px-6 py-3 rounded-lg hover:bg-opacity-90 font-semibold transition"
        >
          <Plus size={20} />
          발달영역 추가
        </button>
      )}

      {/* 커리큘럼 트리 */}
      <div className="space-y-4">
        {domains.map(domain => (
          <div key={domain.id} className="glass rounded-2xl overflow-hidden border-none">
            {/* 발달영역 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pastel-purple to-pastel-pink text-white font-bold hover:opacity-90 transition">
              <button
                onClick={() => toggleDomain(domain.id)}
                className="flex-1 flex items-center justify-start gap-2"
              >
                <ChevronDown
                  size={20}
                  className={`transition ${expandedDomains.includes(domain.id) ? 'rotate-0' : '-rotate-90'}`}
                />
                {editingDomain === domain.id ? (
                  <input
                    type="text"
                    value={editingDomainName}
                    onChange={(e) => setEditingDomainName(e.target.value)}
                    className="bg-white bg-opacity-30 text-white px-2 py-1 rounded"
                    autoFocus
                  />
                ) : (
                  <span>{domain.name}</span>
                )}
              </button>
              <div className="flex gap-2">
                {editingDomain === domain.id ? (
                  <>
                    <button
                      onClick={() => handleEditDomain(domain.id, editingDomainName)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={() => setEditingDomain(null)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingDomain(domain.id);
                        setEditingDomainName(domain.name);
                      }}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteDomain(domain.id)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* LTO 리스트 */}
            {expandedDomains.includes(domain.id) && (
              <div className="bg-white">
                {domain.ltos.map((lto, idx) => (
                  <div key={lto.id} className={`${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                    {/* LTO */}
                    <div className="px-6 py-4 bg-white bg-opacity-20 flex items-center justify-between border-b border-white border-opacity-20">
                      <div className="flex-1">
                        {editingLTO === lto.id ? (
                          <input
                            type="text"
                            value={editingLTOName}
                            onChange={(e) => setEditingLTOName(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded"
                            autoFocus
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 ml-4">└ LTO: {lto.name}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {editingLTO === lto.id ? (
                          <>
                            <button
                              onClick={() => handleEditLTO(domain.id, lto.id, editingLTOName)}
                              className="p-2 hover:bg-gray-200 rounded transition"
                            >
                              <Save size={16} className="text-green-600" />
                            </button>
                            <button
                              onClick={() => setEditingLTO(null)}
                              className="p-2 hover:bg-gray-200 rounded transition"
                            >
                              <X size={16} className="text-red-600" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingLTO(lto.id);
                                setEditingLTOName(lto.name);
                              }}
                              className="p-2 hover:bg-gray-200 rounded"
                            >
                              <Edit size={16} className="text-gray-600" />
                            </button>
                            <button
                              onClick={() => deleteLTO(domain.id, lto.id)}
                              className="p-2 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* STO 리스트 */}
                    <div className="bg-white bg-opacity-10">
                      {lto.stos.map((sto, stoIdx) => (
                        <div
                          key={sto.id}
                          className={`px-6 py-3 flex items-center justify-between border-l-4 border-white border-opacity-40 ${
                            stoIdx === lto.stos.length - 1 ? '' : 'border-b border-white border-opacity-20'
                          }`}
                        >
                          {editingSTO === sto.id ? (
                            <input
                              type="text"
                              value={editingSTOName}
                              onChange={(e) => setEditingSTOName(e.target.value)}
                              className="flex-1 ml-6 px-2 py-1 border border-gray-300 rounded"
                              autoFocus
                            />
                          ) : (
                            <p className="text-gray-700 ml-6">├ STO: {sto.name}</p>
                          )}
                          <div className="flex gap-2">
                            {editingSTO === sto.id ? (
                              <>
                                <button
                                  onClick={() => handleEditSTO(domain.id, lto.id, sto.id, editingSTOName)}
                                  className="p-1 hover:bg-gray-100 rounded transition"
                                >
                                  <Save size={14} className="text-green-600" />
                                </button>
                                <button
                                  onClick={() => setEditingSTO(null)}
                                  className="p-1 hover:bg-gray-100 rounded transition"
                                >
                                  <X size={14} className="text-red-600" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingSTO(sto.id);
                                    setEditingSTOName(sto.name);
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <Edit size={14} className="text-gray-400" />
                                </button>
                                <button
                                  onClick={() => deleteSTO(domain.id, lto.id, sto.id)}
                                  className="p-1 hover:bg-red-50 rounded"
                                >
                                  <Trash2 size={14} className="text-red-400" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* STO 추가 */}
                    <div className="px-6 py-3 bg-blue-200 bg-opacity-20 border-l-4 border-blue-300 border-opacity-50">
                      {addingSTO === lto.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSTOName}
                            onChange={(e) => setNewSTOName(e.target.value)}
                            placeholder="STO 이름..."
                            className="flex-1 ml-6 px-2 py-1 text-sm border border-blue-300 rounded"
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddSTO(domain.id, lto.id)}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                          >
                            추가
                          </button>
                          <button
                            onClick={() => setAddingSTO(null)}
                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-sm"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingSTO(lto.id)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold ml-6"
                        >
                          <Plus size={16} />
                          STO 추가
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* LTO 추가 */}
                <div className="px-6 py-3 bg-green-200 bg-opacity-20 border-t border-white border-opacity-20">
                  {addingLTO === domain.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newLTOName}
                        onChange={(e) => setNewLTOName(e.target.value)}
                        placeholder="LTO 이름..."
                        className="flex-1 ml-4 px-2 py-1 text-sm border border-green-300 rounded"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddLTO(domain.id)}
                        className="px-2 py-1 bg-green-600 text-white rounded text-sm"
                      >
                        추가
                      </button>
                      <button
                        onClick={() => setAddingLTO(null)}
                        className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-sm"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingLTO(domain.id)}
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-semibold ml-4"
                    >
                      <Plus size={16} />
                      LTO 추가
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
