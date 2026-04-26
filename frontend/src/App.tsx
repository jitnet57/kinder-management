import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CacheProvider } from './context/CacheContext';
import { CurriculumProvider } from './context/CurriculumContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { MessageProvider } from './context/MessageContext';
import { NotificationProvider } from './context/NotificationContext';
import { ABCProvider } from './context/ABCContext';
import { CollaborativeDashboardProvider } from './context/CollaborativeDashboardContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { AdminApprovals } from './pages/AdminApprovals';
import { Dashboard } from './pages/Dashboard';
import { CollaborativeDashboard } from './pages/CollaborativeDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { Schedule } from './pages/Schedule';
import { Children } from './pages/Children';
import { SessionLog } from './pages/SessionLog';
import { Completion } from './pages/Completion';
import { Curriculum } from './pages/Curriculum';
import { Reports } from './pages/Reports';
import { Help } from './pages/Help';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { ABCAnalysis } from './pages/ABCAnalysis';

function App() {
  return (
    <CacheProvider>
      <CurriculumProvider>
        <ScheduleProvider>
          <MessageProvider>
            <NotificationProvider>
              <ABCProvider>
                <CollaborativeDashboardProvider>
                  <BrowserRouter>
                    <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />

              <Route
                path="/admin/approvals"
                element={<AdminApprovals />}
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/collaborative-dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CollaborativeDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent-dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ParentDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schedule"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Schedule />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/children"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Children />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/session-log"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SessionLog />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/completion"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Completion />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/curriculum"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Curriculum />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Reports />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Help />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Messages />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Notifications />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/abc-analysis"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ABCAnalysis />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
                    </BrowserRouter>
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
