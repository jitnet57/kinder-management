/**
 * LanguageSettings.tsx - 다국어 지원 (i18n)
 * Phase 5 Stream P2.5
 */

import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageSettings() {
  const { currentLanguage, setLanguage, availableLanguages, formatDate, formatNumber, formatCurrency } = useLanguage();

  const languageNames = {
    ko: '한국어',
    en: 'English',
    zh: '中文',
    ja: '日本語',
  };

  const languageDescriptions = {
    ko: '한국어 (대한민국)',
    en: 'English (United States)',
    zh: '中文 (中国)',
    ja: '日本語 (日本)',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-pastel-purple">🌍 언어 및 지역화 설정</h1>
        <p className="text-gray-600 mt-2">앱의 언어와 날짜/숫자 형식을 설정합니다</p>
      </div>

      {/* 언어 선택 */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Globe size={24} />
          사용 언어
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`p-4 rounded-lg transition ${
                currentLanguage === lang
                  ? 'bg-pastel-purple text-white border-2 border-pastel-purple'
                  : 'bg-white border-2 border-gray-300 hover:border-pastel-purple'
              }`}
            >
              <p className="font-bold text-lg">{languageNames[lang as keyof typeof languageNames]}</p>
              <p className="text-sm opacity-75">
                {languageDescriptions[lang as keyof typeof languageDescriptions]}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 미리보기 */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">형식 미리보기</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">날짜</p>
            <p className="text-lg font-bold">{formatDate(new Date())}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">숫자</p>
            <p className="text-lg font-bold">{formatNumber(1234567.89)}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">통화</p>
            <p className="text-lg font-bold">{formatCurrency(100000)}</p>
          </div>
        </div>
      </div>

      {/* 언어별 주요 용어 */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">주요 용어</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="px-4 py-2 text-left font-bold">영어</th>
                <th className="px-4 py-2 text-left font-bold">한국어</th>
                <th className="px-4 py-2 text-left font-bold">중국어</th>
                <th className="px-4 py-2 text-left font-bold">일본어</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">Dashboard</td>
                <td className="px-4 py-2">대시보드</td>
                <td className="px-4 py-2">仪表板</td>
                <td className="px-4 py-2">ダッシュボード</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">Schedule</td>
                <td className="px-4 py-2">스케줄</td>
                <td className="px-4 py-2">时间表</td>
                <td className="px-4 py-2">スケジュール</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">Children</td>
                <td className="px-4 py-2">아동정보</td>
                <td className="px-4 py-2">儿童信息</td>
                <td className="px-4 py-2">お子さん情報</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">Messages</td>
                <td className="px-4 py-2">메시징</td>
                <td className="px-4 py-2">消息</td>
                <td className="px-4 py-2">メッセージ</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">Notifications</td>
                <td className="px-4 py-2">알림</td>
                <td className="px-4 py-2">通知</td>
                <td className="px-4 py-2">通知</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">Settings</td>
                <td className="px-4 py-2">설정</td>
                <td className="px-4 py-2">设置</td>
                <td className="px-4 py-2">設定</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 언어별 특징 */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">각 언어의 특징</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold text-blue-600 mb-2">한국어 (Korean)</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• 날짜 형식: YYYY년 MM월 DD일</li>
              <li>• 숫자 형식: 천 단위 쉼표 (,) 사용</li>
              <li>• 통화: ₩ (원화)</li>
              <li>• 더 많은 언어 기능 지원 예정</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold text-blue-600 mb-2">English</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Date format: MM/DD/YYYY</li>
              <li>• Number format: Comma (,) for thousands</li>
              <li>• Currency: $ (US Dollar)</li>
              <li>• Full support for international users</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold text-blue-600 mb-2">中文 (Chinese)</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• 日期格式: YYYY年MM月DD日</li>
              <li>• 数字格式: 用逗号 (,) 分隔</li>
              <li>• 货币: ¥ (人民币)</li>
              <li>• 支持简体中文和繁体中文</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold text-blue-600 mb-2">日本語 (Japanese)</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• 日付形式: YYYY年MM月DD日</li>
              <li>• 数字形式: カンマ (,) で区切る</li>
              <li>• 通貨: ¥ (日本円)</li>
              <li>• 日本語ユーザー向けサポート</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 현재 설정 정보 */}
      <div className="glass rounded-xl p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-xl font-bold mb-4">현재 설정</h2>
        <div className="space-y-2 text-sm">
          <p>현재 언어: <span className="font-bold">{languageNames[currentLanguage as keyof typeof languageNames]}</span></p>
          <p>시스템 언어: <span className="font-bold">{navigator.language}</span></p>
          <p>타임존: <span className="font-bold">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span></p>
        </div>
      </div>
    </div>
  );
}

export default LanguageSettings;
