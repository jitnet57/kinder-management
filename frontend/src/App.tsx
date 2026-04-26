import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CacheProvider } from './context/CacheContext';
import { CurriculumProvider } from './context/CurriculumContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { MessageProvider } from './context/MessageContext';
import { NotificationProvider } from './context/NotificationContext';
import { ABCProvider } from './context/ABCContext';
import { CollaborativeDashboardProvider } from './context/CollaborativeDashboardContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { LiveSessionProvider } from './context/LiveSessionContext';
import { VideoAnalysisProvider } from './context/VideoAnalysisContext';
import { SmartNotificationProvider } from './context/SmartNotificationContext';
import { StatisticsProvider } from './context/StatisticsContext';
import { LanguageProvider } from './context/LanguageContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// 정적 import: Landing, Login (초기 로딩에 필요함)
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';

// 동적 import로 페이지 지연 로딩 (라우트별 코드 스플리팅)
// 이렇게 하면 각 페이지는 사용자가 해당 경로로 이동할 때만 로드됩니다
// 예: /dashboard로 이동할 때만 Dashboard 컴포넌트가 다운로드됩니다
const AdminApprovals = lazy(() => import('./pages/AdminApprovals').then(m => ({ default: m.AdminApprovals })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const CollaborativeDashboard = lazy(() => import('./pages/CollaborativeDashboard').then(m => ({ default: m.CollaborativeDashboard })));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard').then(m => ({ default: m.ParentDashboard })));
const Schedule = lazy(() => import('./pages/Schedule').then(m => ({ default: m.Schedule })));
const Children = lazy(() => import('./pages/Children').then(m => ({ default: m.Children })));
const SessionLog = lazy(() => import('./pages/SessionLog').then(m => ({ default: m.SessionLog })));
const Completion = lazy(() => import('./pages/Completion').then(m => ({ default: m.Completion })));
const Curriculum = lazy(() => import('./pages/Curriculum').then(m => ({ default: m.Curriculum })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Help = lazy(() => import('./pages/Help').then(m => ({ default: m.Help })));
const Messages = lazy(() => import('./pages/Messages').then(m => ({ default: m.Messages })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const ABCAnalysis = lazy(() => import('./pages/ABCAnalysis').then(m => ({ default: m.ABCAnalysis })));
const InterventionAnalysis = lazy(() => import('./pages/InterventionAnalysis').then(m => ({ default: m.InterventionAnalysis })));
const BehaviorPrediction = lazy(() => import('./pages/BehaviorPrediction').then(m => ({ default: m.BehaviorPrediction })));
const LearningVelocity = lazy(() => import('./pages/LearningVelocity').then(m => ({ default: m.LearningVelocity })));
const AutoInsights = lazy(() => import('./pages/AutoInsights').then(m => ({ default: m.AutoInsights })));

// Phase 5 Stream P2: 5가지 고급 기능 페이지 (향후 구현)
// const LiveSession = lazy(() => import('./pages/LiveSession').then(m => ({ default: m.LiveSession })));
// const VideoAnalyzer = lazy(() => import('./pages/VideoAnalyzer').then(m => ({ default: m.VideoAnalyzer })));
// const SmartNotificationSettings = lazy(() => import('./pages/SmartNotificationSettings').then(m => ({ default: m.SmartNotificationSettings })));
// const StatisticalAnalysis = lazy(() => import('./pages/StatisticalAnalysis').then(m => ({ default: m.StatisticalAnalysis })));
// const LanguageSettings = lazy(() => import('./pages/LanguageSettings').then(m => ({ default: m.LanguageSettings })));

// 로딩 중 표시할 간단한 스피너 컴포넌트
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">로딩 중...</p>
    </div>
  </div>
);

function App() {
  return (
    <CacheProvider>
      <CurriculumProvider>
        <ScheduleProvider>
          <MessageProvider>
            <NotificationProvider>
              <ABCProvider>
                <CollaborativeDashboardProvider>
                  <AnalyticsProvider>
                    <LiveSessionProvider>
                      <VideoAnalysisProvider>
                        <SmartNotificationProvider>
                          <StatisticsProvider>
                            <LanguageProvider>
                              <BrowserRouter>
                    <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />

              <Route
                path="/admin/approvals"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminApprovals />
                  </Suspense>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <Dashboard />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/collaborative-dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <CollaborativeDashboard />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent-dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <ParentDashboard />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schedule"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <Schedule />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/children"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <Children />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/session-log"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <SessionLog />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/completion"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <Completion />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/curriculum"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <Curriculum />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <Reports />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <Help />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <Messages />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <Notifications />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/abc-analysis"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <ABCAnalysis />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/intervention-analysis"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <InterventionAnalysis />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/behavior-prediction"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <BehaviorPrediction />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learning-velocity"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <LearningVelocity />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/auto-insights"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <AutoInsights />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Phase 5 Stream P2: 5가지 고급 기능 라우트 (향후 구현) */}
              {/*
              <Route path="/live-session" element={<LiveSession />} />
              <Route path="/video-analyzer" element={<VideoAnalyzer />} />
              <Route path="/notifications/settings" element={<SmartNotificationSettings />} />
              <Route path="/statistics/analysis" element={<StatisticalAnalysis />} />
              <Route path="/settings/language" element={<LanguageSettings />} />
              */}
            </Routes>
                              </BrowserRouter>
                            </LanguageProvider>
                          </StatisticsProvider>
                        </SmartNotificationProvider>
                      </VideoAnalysisProvider>
                    </LiveSessionProvider>
                  </AnalyticsProvider>
                </CollaborativeDashboardProvider>
              </ABCProvider>
            </NotificationProvider>
          </MessageProvider>
        </ScheduleProvider>
      </CurriculumProvider>
    </CacheProvider>
  );
}

export default App;
