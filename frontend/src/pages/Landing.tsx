import { ArrowRight, CheckCircle, BarChart3, Users, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Landing() {
  const navigate = useNavigate();

  const goToLogin = () => {
    console.log('🔵 로그인으로 이동 클릭됨');
    navigate('/login', { replace: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      {/* 네비게이션 */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="text-xl font-bold text-gray-800">AKMS</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">기능</a>
            <a href="#benefits" className="text-gray-600 hover:text-gray-900 font-medium">특징</a>
            <button
              onClick={() => goToLogin()}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition"
            >
              로그인
            </button>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              아동의 성장을 <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600">과학적으로</span> 추적하세요
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              ABA 데이터 기반 아동 발달 관리 시스템. 14개 영역, 252개 학습목표, 체계적인 행동 분석으로 효과적인 치료를 지원합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => goToLogin()}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transform hover:-translate-y-1 transition flex items-center justify-center gap-2"
              >
                지금 시작하기 <ArrowRight size={20} />
              </button>
              <button
                onClick={() => goToLogin()}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:border-gray-400 transition"
              >
                데모 보기
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-8 h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-700 font-semibold">ABA 데이터 분석 시스템</p>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 숫자 */}
      <section className="bg-white/50 backdrop-blur py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">14</div>
            <p className="text-gray-600">발달 영역</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">252</div>
            <p className="text-gray-600">학습 목표(LTO)</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">1,008</div>
            <p className="text-gray-600">세부 목표(STO)</p>
          </div>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">핵심 기능</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: BarChart3, title: '📊 실시간 데이터 분석', desc: '5가지 차트로 진행도를 한눈에 파악' },
            { icon: Users, title: '👥 다중 아동 관리', desc: '여러 아동의 발달을 동시에 추적' },
            { icon: Shield, title: '🔐 2단계 승인 시스템', desc: '관리자 + 개발자 승인으로 보안 강화' },
            { icon: Zap, title: '⚡ ABC 데이터 입력', desc: '선행자극-행동-결과 체계적 기록' },
            { icon: CheckCircle, title: '✅ 자동 진행도 추적', desc: 'P/+/- 상태로 즉시 피드백' },
            { icon: BarChart3, title: '📈 상세 보고서', desc: 'PDF/Excel/Word로 내보내기' },
          ].map((feature, idx) => (
            <div key={idx} className="glass rounded-2xl p-8 hover:shadow-lg transition">
              <div className="text-4xl mb-4">{feature.title.split(' ')[0]}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title.split(' ').slice(1).join(' ')}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 특징 섹션 */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">왜 AKMS인가?</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                title: '🎯 VB-MAPP 기반 커리큘럼',
                items: ['14개 발달영역', '252개 장기목표(LTO)', '4단계 진행도 추적', '8가지 교수팁 포함']
              },
              {
                title: '📊 고급 데이터 분석',
                items: ['개인별 상세 리포트', '5가지 차트 유형', '발달영역별 성과 비교', '장기 추이 분석']
              },
              {
                title: '🔐 보안 & 승인',
                items: ['2단계 승인 시스템', '디바이스 제한', '접근 로그 기록', '데이터 암호화']
              },
              {
                title: '⚡ 효율적 기록',
                items: ['빠른 ABC 입력', '실시간 진행도', '자동 분석', '즉각적인 피드백']
              },
            ].map((benefit, idx) => (
              <div key={idx} className="glass rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{benefit.title}</h3>
                <ul className="space-y-4">
                  {benefit.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 커리큘럼 프리뷰 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">체계적인 커리큘럼</h2>
        <div className="glass rounded-2xl p-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-green-200">
                <th className="text-left py-3 px-4 font-bold text-gray-700">발달영역</th>
                <th className="text-center py-3 px-4 font-bold text-gray-700">LTO 수</th>
                <th className="text-center py-3 px-4 font-bold text-gray-700">STO 수</th>
                <th className="text-center py-3 px-4 font-bold text-gray-700">교수팁</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['요청(Mand)', 18, 72, '8개'],
                ['명명(Tact)', 18, 72, '8개'],
                ['상호언어', 18, 72, '8개'],
                ['따라말하기', 18, 72, '8개'],
                ['수용언어', 18, 72, '8개'],
                ['사회성', 18, 72, '8개'],
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-green-50 transition">
                  <td className="py-3 px-4 text-gray-700 font-medium">{row[0]}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{row[1]}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{row[2]}</td>
                  <td className="py-3 px-4 text-center text-green-600 font-bold">{row[3]}</td>
                </tr>
              ))}
              <tr className="bg-green-50 font-bold">
                <td className="py-3 px-4 text-gray-900">총계</td>
                <td className="py-3 px-4 text-center text-gray-900">252</td>
                <td className="py-3 px-4 text-center text-gray-900">1,008</td>
                <td className="py-3 px-4 text-center text-green-600">2,016</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">지금 바로 시작하세요</h2>
          <p className="text-xl text-green-100 mb-8">
            AKMS로 아동의 발달을 더 정확하게, 더 효율적으로 관리하세요.
          </p>
          <button
            onClick={() => goToLogin()}
            className="px-8 py-4 bg-white text-green-600 rounded-xl font-bold text-lg hover:shadow-lg transform hover:-translate-y-1 transition inline-flex items-center gap-2"
          >
            무료로 시작하기 <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="text-white font-bold">AKMS</span>
              </div>
              <p className="text-sm">ABA 기반 아동 발달 관리 시스템</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">제품</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">기능</a></li>
                <li><a href="#benefits" className="hover:text-white transition">특징</a></li>
                <li><a href="#" className="hover:text-white transition">요금</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">지원</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">문서</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">문의</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">법적</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">개인정보</a></li>
                <li><a href="#" className="hover:text-white transition">이용약관</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 AKMS. All rights reserved. | ABA 데이터 기반 아동 발달 관리 시스템</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
