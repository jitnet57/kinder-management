import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CacheProvider } from './context/CacheContext';
import { CurriculumProvider } from './context/CurriculumContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Schedule } from './pages/Schedule';
import { Children } from './pages/Children';
import { SessionLog } from './pages/SessionLog';
import { Completion } from './pages/Completion';
import { Curriculum } from './pages/Curriculum';
import { Reports } from './pages/Reports';

function App() {
  return (
    <CurriculumProvider>
      <ScheduleProvider>
        <CacheProvider>
          <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/schedule"
            element={
              <Layout>
                <Schedule />
              </Layout>
            }
          />
          <Route
            path="/children"
            element={
              <Layout>
                <Children />
              </Layout>
            }
          />
          <Route
            path="/session-log"
            element={
              <Layout>
                <SessionLog />
              </Layout>
            }
          />
          <Route
            path="/completion"
            element={
              <Layout>
                <Completion />
              </Layout>
            }
          />
          <Route
            path="/curriculum"
            element={
              <Layout>
                <Curriculum />
              </Layout>
            }
          />
          <Route
            path="/reports"
            element={
              <Layout>
                <Reports />
              </Layout>
            }
          />
        </Routes>
        </BrowserRouter>
      </CacheProvider>
      </ScheduleProvider>
    </CurriculumProvider>
  );
}

export default App;
