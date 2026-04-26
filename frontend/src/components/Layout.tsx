import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { label: '대시보드', path: '/' },
    { label: '스케줄', path: '/schedule' },
    { label: '아동정보', path: '/children' },
    { label: '데이터기록', path: '/session-log' },
    { label: '완료목록', path: '/completion' },
    { label: '커리큘럼', path: '/curriculum' },
    { label: '📊 보고서', path: '/reports' },
    { label: '📚 도움말', path: '/help' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass glass-dark px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-pastel-purple hover:bg-gray-100 p-2 rounded"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-2xl font-bold text-pastel-purple">🎓 AKMS</h1>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-600">관리자 (admin)</span>
          <button className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-2 rounded">
            <LogOut size={20} />
            <span className="text-sm">로그아웃</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } lg:block w-48 glass glass-dark border-r px-4 py-6 overflow-y-auto`}
        >
          <nav className="space-y-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-pastel-purple text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
