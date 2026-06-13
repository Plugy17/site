import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './i18n';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateCoursePage from './pages/CreateCoursePage';
import SchedulePage from './pages/SchedulePage';
import VideoCallPage from './pages/VideoCallPage';
import ProfilePage from './pages/ProfilePage';
import InstructorSchedulePage from './pages/InstructorSchedulePage';
import AIAssistant from './pages/AIAssistantPage';
import CreateInstructorPage from './pages/CreateInstructorPage';
import SeedDataPage from './pages/SeedDataPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:id" element={<CourseDetailPage />} />
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/instructor" element={<InstructorDashboard />} />
                <Route path="/instructor/create" element={<CreateCoursePage />} />
                <Route path="/instructor/schedule" element={<InstructorSchedulePage />} />
                <Route path="/instructor/edit/:id" element={<CreateCoursePage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/video" element={<VideoCallPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/instructor/create-instructor" element={<CreateInstructorPage />} />
                <Route path="/seed" element={<SeedDataPage />} />
              </Route>
            </Routes>
            <AIAssistant />
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
