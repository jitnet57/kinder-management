import { useState } from 'react';
import { ChevronDown, Book, Grid3x3, Calendar, Users, CheckCircle2, Settings, HelpCircle } from 'lucide-react';

export function Help() {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  const sections = [
    {
      id: 'overview',
      title: '📖 AKMS 소개',
      icon: <Book size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">AKMS는 유아 ABA 데이터 관리 시스템으로, 아동의 발달과정을 체계적으로 기록하고 분석할 수 있습니다.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="glass rounded-lg p-4">
              <p className="font-semibold text-pastel-purple mb-2">📊 데이터 기반 관리</p>
              <p className="text-sm text-gray-600">세션마다 점수와 관찰노트를 기록하여 아동의 성장을 추적합니다.</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="font-semibold text-pastel-purple mb-2">🎯 커리큘럼 연동</p>
              <p className="text-sm text-gray-600">발달영역-LTO-STO 체계로 구조화된 목표를 관리합니다.</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="font-semibold text-pastel-purple mb-2">📅 주간 스케줄</p>
              <p className="text-sm text-gray-600">한 화면에서 모든 아동의 세션을 시각적으로 관리합니다.</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="font-semibold text-pastel-purple mb-2">📈 분석 & 보고</p>
              <p className="text-sm text-gray-600">그래프와 통계로 아동의 발달 추이를 분석합니다.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: '📊 대시보드',
      icon: <Grid3x3 size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 font-semibold">주요 기능</p>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">1.</span>
              <div>
                <p className="font-semibold text-gray-800">통계 카드</p>
                <p className="text-sm text-gray-600">등록된 아동, 이번 주 세션, 완료율, 활성 커리큘럼 정보를 한눈에 파악합니다.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">2.</span>
              <div>
                <p className="font-semibold text-gray-800">동적 그래프</p>
                <p className="text-sm text-gray-600">추세, 막대, 원형, 산점도, 히트맵 등 8가지 차트 유형을 선택할 수 있습니다.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">3.</span>
              <div>
                <p className="font-semibold text-gray-800">시간 범위 선택</p>
                <p className="text-sm text-gray-600">7일, 30일, 90일, 365일 단위로 데이터를 필터링합니다.</p>
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'schedule',
      title: '📅 주간 스케줄',
      icon: <Calendar size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 font-semibold">사용 방법</p>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <div>
                <p className="font-semibold text-gray-800">세션 추가</p>
                <p className="text-sm text-gray-600">각 시간대 셀의 + 버튼을 클릭하여 아동, 세션명을 입력하고 추가합니다.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500 font-bold">✓</span>
              <div>
                <p className="font-semibold text-gray-800">세션 수정</p>
                <p className="text-sm text-gray-600">세션 카드의 수정 버튼을 눌러 세션명을 변경할 수 있습니다.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-red-500 font-bold">✓</span>
              <div>
                <p className="font-semibold text-gray-800">세션 삭제</p>
                <p className="text-sm text-gray-600">삭제 버튼으로 세션을 제거합니다.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-500 font-bold">✓</span>
              <div>
                <p className="font-semibold text-gray-800">시각적 구분</p>
                <p className="text-sm text-gray-600">각 아동마다 다른 색상으로 표시되어 쉽게 구분됩니다.</p>
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'children',
      title: '👶 아동정보',
      icon: <Users size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 font-semibold">아동 정보 관리</p>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">•</span>
              <div>
                <p className="font-semibold text-gray-800">카드 클릭</p>
                <p className="text-sm text-gray-600">아동 카드를 클릭하면 상세 정보와 과제 기록을 확인할 수 있습니다.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">•</span>
              <div>
                <p className="font-semibold text-gray-800">정보 입력</p>
                <p className="text-sm text-gray-600">이름, 생년월일, 전화, 주소, 기타 정보를 등록합니다.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">•</span>
              <div>
                <p className="font-semibold text-gray-800">프로필 사진</p>
                <p className="text-sm text-gray-600">아바타를 클릭하여 사진을 업로드할 수 있습니다.</p>
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'session',
      title: '📝 데이터 기록',
      icon: <CheckCircle2 size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 font-semibold">세션 기록 입력</p>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">1.</span>
              <div>
                <p className="font-semibold text-gray-800">날짜 선택</p>
                <p className="text-sm text-gray-600">기록할 날짜를 선택합니다.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">2.</span>
              <div>
                <p className="font-semibold text-gray-800">아동 선택</p>
                <p className="text-sm text-gray-600">드롭다운에서 아동을 선택합니다.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">3.</span>
              <div>
                <p className="font-semibold text-gray-800">커리큘럼 선택</p>
                <p className="text-sm text-gray-600">발달영역 → LTO → STO 순서로 선택합니다.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">4.</span>
              <div>
                <p className="font-semibold text-gray-800">데이터 입력</p>
                <p className="text-sm text-gray-600">점수(0-100), 시간, 비고를 입력합니다.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">5.</span>
              <div>
                <p className="font-semibold text-gray-800">완료 표시</p>
                <p className="text-sm text-gray-600">완료 버튼을 누르면 완료목록으로 이동됩니다.</p>
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'curriculum',
      title: '🎯 커리큘럼',
      icon: <Settings size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 font-semibold">커리큘럼 구조</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="font-mono text-sm text-gray-700 space-y-2">
              <p>📚 발달영역 (Development Domain)</p>
              <p className="ml-4">└─ 📖 LTO (Long Term Objective)</p>
              <p className="ml-8">└─ ✓ STO (Short Term Objective)</p>
            </div>
          </div>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">•</span>
              <p className="text-sm text-gray-600"><span className="font-semibold">발달영역 추가:</span> 새로운 발달 영역을 생성합니다.</p>
            </li>
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">•</span>
              <p className="text-sm text-gray-600"><span className="font-semibold">LTO/STO 추가:</span> 각 레벨에서 목표를 세분화합니다.</p>
            </li>
            <li className="flex gap-3">
              <span className="text-pastel-purple font-bold">•</span>
              <p className="text-sm text-gray-600"><span className="font-semibold">수정/삭제:</span> 목표를 언제든 변경할 수 있습니다.</p>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'tips',
      title: '💡 팁 & 활용법',
      icon: <HelpCircle size={24} />,
      content: (
        <div className="space-y-4">
          <ul className="space-y-3">
            <li className="flex gap-3 bg-blue-50 rounded-lg p-3">
              <span className="text-blue-600 font-bold">1.</span>
              <p className="text-sm text-gray-700"><span className="font-semibold">색상 구분:</span> 아동별로 할당된 색상을 사용하여 시각적으로 쉽게 구분할 수 있습니다.</p>
            </li>
            <li className="flex gap-3 bg-green-50 rounded-lg p-3">
              <span className="text-green-600 font-bold">2.</span>
              <p className="text-sm text-gray-700"><span className="font-semibold">호버 효과:</span> 마우스를 올려놓으면 아이콘이 변색되어 상호작용 가능한 요소를 알 수 있습니다.</p>
            </li>
            <li className="flex gap-3 bg-purple-50 rounded-lg p-3">
              <span className="text-purple-600 font-bold">3.</span>
              <p className="text-sm text-gray-700"><span className="font-semibold">그래프 분석:</span> 각 아동의 점수 추이를 그래프로 확인하여 성장 패턴을 파악합니다.</p>
            </li>
            <li className="flex gap-3 bg-pink-50 rounded-lg p-3">
              <span className="text-pink-600 font-bold">4.</span>
              <p className="text-sm text-gray-700"><span className="font-semibold">검색 기능:</span> 아동 이름으로 빠르게 검색할 수 있습니다.</p>
            </li>
          </ul>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">📚 사용자 설명서</h1>
        <p className="text-purple-100">AKMS 시스템의 모든 기능을 배워보세요</p>
      </div>

      {/* 탭 형식의 도움말 */}
      <div className="space-y-4">
        {sections.map(section => (
          <div key={section.id} className="glass rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="text-pastel-purple">{section.icon}</div>
                <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
              </div>
              <ChevronDown
                size={24}
                className={`text-gray-600 transition-transform ${
                  expandedSection === section.id ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedSection === section.id && (
              <div className="px-6 py-4 border-t border-gray-200 bg-white bg-opacity-50">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 빠른 참조 */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ 주요 단축키 & 팁</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <span className="text-pastel-purple font-bold">+</span>
            <p className="text-sm text-gray-700">항목 추가 버튼으로 새로운 항목을 추가합니다.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600 font-bold">✎</span>
            <p className="text-sm text-gray-700">수정 버튼으로 항목을 편집합니다.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-red-500 font-bold">🗑</span>
            <p className="text-sm text-gray-700">삭제 버튼으로 항목을 제거합니다.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-green-500 font-bold">✓</span>
            <p className="text-sm text-gray-700">완료 버튼으로 작업을 표시합니다.</p>
          </div>
        </div>
      </div>

      {/* 피드백 */}
      <div className="glass rounded-2xl p-6 bg-gradient-to-r from-pastel-pink to-pastel-purple bg-opacity-20">
        <h2 className="text-xl font-bold text-gray-800 mb-2">❓ 추가 도움이 필요하신가요?</h2>
        <p className="text-gray-700">각 기능의 호버 텍스트를 확인하거나, 마우스를 올려놓으면 도움말 툴팁을 볼 수 있습니다.</p>
      </div>
    </div>
  );
}
