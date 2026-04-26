import { useState } from 'react';
import { Edit, Trash2, Plus, Search, Upload, X, Save } from 'lucide-react';
import { ChildDetailView } from '../components/ChildDetailView';
// import { exportChildrenToExcel, exportChildrenToWord } from '../utils/exportUtils';

interface Child {
  id: number;
  name: string;
  birthDate: string;
  phone: string;
  address: string;
  notes: string;
  color: string;
  photo: string | null;
}

const MOCK_CHILDREN: Child[] = [
  {
    id: 1,
    name: '민준',
    birthDate: '2021-01-15',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123, 푸른숲아파트 101동',
    notes: '언어발달 우수, 집중력이 매우 좋음. 한글 인식 수준 높음. 발음이 명확함.',
    color: '#FFB6D9',
    photo: null,
  },
  {
    id: 2,
    name: '소영',
    birthDate: '2021-06-10',
    phone: '010-2345-6789',
    address: '서울시 서초구 강남대로 45, 현대빌라 3층',
    notes: '활발하고 사교적인 성격. 또래 아이들과의 상호작용 능력 우수. 음악에 관심 많음.',
    color: '#B4D7FF',
    photo: null,
  },
  {
    id: 3,
    name: '지호',
    birthDate: '2020-03-22',
    phone: '010-3456-7890',
    address: '서울시 강동구 구천면로 789, 삼성아파트 205동',
    notes: '차분하고 침착함. 미세한 운동능력 발달 진행 중. 색상 구분 능력 우수. 집중 시간이 길음.',
    color: '#C1FFD7',
    photo: null,
  },
  {
    id: 4,
    name: '연서',
    birthDate: '2021-09-05',
    phone: '010-4567-8901',
    address: '경기도 성남시 분당구 정자동 456번지',
    notes: '긍정적이고 밝은 성격. 새로운 것을 배우려는 의욕이 높음. 또래보다 발달 상황 빠름.',
    color: '#FFE4B5',
    photo: null,
  },
];

const COLORS = ['#FFB6D9', '#B4D7FF', '#C1FFD7', '#FFE4B5', '#D7C1FF', '#FFD7E4'];

export function Children() {
  const [children, setChildren] = useState<Child[]>(MOCK_CHILDREN);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [editForm, setEditForm] = useState<Child | null>(null);
  const [newChildForm, setNewChildForm] = useState({
    name: '',
    birthDate: '',
    phone: '',
    address: '',
    notes: '',
    color: COLORS[0],
  });

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePhotoUpload = (childId: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const photoData = e.target?.result as string;
      setChildren(prev =>
        prev.map(child =>
          child.id === childId ? { ...child, photo: photoData } : child
        )
      );
      setUploadingId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (childId: number) => {
    setChildren(prev =>
      prev.map(child =>
        child.id === childId ? { ...child, photo: null } : child
      )
    );
  };

  const handleStartEdit = (child: Child) => {
    setEditingId(child.id);
    setEditForm({ ...child });
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    setChildren(prev =>
      prev.map(child =>
        child.id === editForm.id ? editForm : child
      )
    );
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDeleteChild = (childId: number) => {
    if (confirm('이 아동의 정보를 삭제하시겠습니까?')) {
      setChildren(prev => prev.filter(child => child.id !== childId));
    }
  };

  const handleAddChild = () => {
    if (!newChildForm.name.trim()) {
      alert('아동 이름을 입력해주세요.');
      return;
    }
    const newChild: Child = {
      id: Math.max(...children.map(c => c.id), 0) + 1,
      ...newChildForm,
      photo: null,
    };
    setChildren(prev => [...prev, newChild]);
    setShowAddForm(false);
    setNewChildForm({
      name: '',
      birthDate: '',
      phone: '',
      address: '',
      notes: '',
      color: COLORS[0],
    });
  };

  // 선택된 아동 상세 정보 표시
  if (selectedChild) {
    return <ChildDetailView child={selectedChild} onBack={() => setSelectedChild(null)} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">👶 아동정보</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-pastel-purple text-white px-6 py-3 rounded-lg hover:bg-opacity-90 font-semibold transition"
          >
            <Plus size={20} />
            새 아동
          </button>
        </div>
      </div>

      {/* 새 아동 추가 폼 */}
      {showAddForm && (
        <div className="glass rounded-2xl p-6 mb-8 border border-pastel-purple border-opacity-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">새 아동 추가</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">아동 이름 *</label>
              <input
                type="text"
                value={newChildForm.name}
                onChange={(e) => setNewChildForm({ ...newChildForm, name: e.target.value })}
                placeholder="예: 민준"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">생년월일</label>
              <input
                type="date"
                value={newChildForm.birthDate}
                onChange={(e) => setNewChildForm({ ...newChildForm, birthDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">전화번호</label>
              <input
                type="tel"
                value={newChildForm.phone}
                onChange={(e) => setNewChildForm({ ...newChildForm, phone: e.target.value })}
                placeholder="예: 010-1234-5678"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">색상</label>
              <select
                value={newChildForm.color}
                onChange={(e) => setNewChildForm({ ...newChildForm, color: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
              >
                {COLORS.map(color => (
                  <option key={color} value={color}>
                    색상 선택
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">주소</label>
              <input
                type="text"
                value={newChildForm.address}
                onChange={(e) => setNewChildForm({ ...newChildForm, address: e.target.value })}
                placeholder="예: 서울시 강남구"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">기타정보</label>
              <textarea
                value={newChildForm.notes}
                onChange={(e) => setNewChildForm({ ...newChildForm, notes: e.target.value })}
                placeholder="아동의 특징, 주의사항 등을 기록해주세요..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddChild}
              className="flex-1 px-4 py-2 bg-pastel-purple text-white rounded-lg font-semibold hover:bg-opacity-90"
            >
              추가
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 검색 */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="아동 이름으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple focus:ring-2 focus:ring-pastel-purple focus:ring-opacity-20"
          />
        </div>
      </div>

      {/* 아동 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChildren.map(child => {
          const isEditing = editingId === child.id;
          const currentData = isEditing && editForm ? editForm : child;

          return (
            <div
              key={child.id}
              onClick={() => !isEditing && setSelectedChild(child)}
              className="glass rounded-2xl overflow-hidden hover:opacity-80 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              {/* 헤더 색상 바 */}
              <div
                className="h-2"
                style={{ backgroundColor: currentData.color }}
              />

              {/* 카드 내용 */}
              <div className="p-6">
                {/* 프로필 영역 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative group">
                    {/* 숨겨진 파일 입력 */}
                    <input
                      type="file"
                      id={`photo-upload-${child.id}`}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handlePhotoUpload(child.id, file);
                        }
                      }}
                    />

                    {/* 프로필 사진 또는 아이콘 */}
                    <label
                      htmlFor={`photo-upload-${child.id}`}
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl cursor-pointer relative overflow-hidden transition-all duration-200 hover:opacity-80"
                      style={{ backgroundColor: currentData.color }}
                    >
                      {currentData.photo ? (
                        <img
                          src={currentData.photo}
                          alt={currentData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{currentData.name[0]}</span>
                      )}
                      {/* 호버 시 업로드 아이콘 */}
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={20} className="text-white" />
                      </div>
                    </label>

                    {/* 사진 제거 버튼 */}
                    {currentData.photo && (
                      <button
                        onClick={() => handleRemovePhoto(child.id)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <>
                        <button
                          onClick={() => handleStartEdit(child)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit size={18} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteChild(child.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* 아동 정보 */}
                {isEditing ? (
                  <div className="space-y-3 mb-4">
                    <input
                      type="text"
                      value={editForm?.name || ''}
                      onChange={(e) => setEditForm(editForm ? { ...editForm, name: e.target.value } : null)}
                      className="w-full px-3 py-2 text-xl font-bold border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">생년월일</label>
                        <input
                          type="date"
                          value={editForm?.birthDate || ''}
                          onChange={(e) => setEditForm(editForm ? { ...editForm, birthDate: e.target.value } : null)}
                          className="w-full px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">전화번호</label>
                        <input
                          type="tel"
                          value={editForm?.phone || ''}
                          onChange={(e) => setEditForm(editForm ? { ...editForm, phone: e.target.value } : null)}
                          className="w-full px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">주소</label>
                      <input
                        type="text"
                        value={editForm?.address || ''}
                        onChange={(e) => setEditForm(editForm ? { ...editForm, address: e.target.value } : null)}
                        className="w-full px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{child.name}</h3>

                    <div className="space-y-3 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">생년월일</span>
                        <span className="font-semibold text-gray-800">{child.birthDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">전화번호</span>
                        <span className="font-semibold text-gray-800">{child.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">주소</span>
                        <span className="font-semibold text-gray-800 text-right text-xs">{child.address}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* 비고 */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">기타정보</p>
                  {isEditing ? (
                    <textarea
                      value={editForm?.notes || ''}
                      onChange={(e) => setEditForm(editForm ? { ...editForm, notes: e.target.value } : null)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pastel-purple resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{child.notes}</p>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 mt-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-pastel-purple text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 transition"
                      >
                        <Save size={16} />
                        저장
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(child)}
                      className="w-full px-3 py-2 bg-pastel-purple text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 transition"
                    >
                      수정
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredChildren.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
