import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CacheProvider } from './context/CacheContext';
import { CurriculumProvider } from './context/CurriculumContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { AdminApprovals } from './pages/AdminApprovals';
import { Dashboard } from './pages/Dashboard';
import { Schedule } from './pages/Schedule';
import { Children } from './pages/Children';
import { SessionLog } from './pages/SessionLog';
import { Completion } from './pages/Completion';
import { Curriculum } from './pages/Curriculum';
import { Reports } from './pages/Reports';
import { Help } from './pages/Help';

function App() {
  return (
    <CacheProvider>
      <CurriculumProvider>
        <ScheduleProvider>
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
            </Routes>
          </BrowserRouter>
        </ScheduleProvider>
      </CurriculumProvider>
    </CacheProvider>
  );
}

export default App;
