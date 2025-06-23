import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/authContext';
import { JobProvider } from './contexts/jobContext';
import { ApplicationProvider } from './contexts/applicationContext';
import { SocketProvider } from './contexts/chatContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import PostJobPage from './pages/PostJobPage';
import MyJobsPage from './pages/MyJobsPage';
import ViewApplicantsPage from './pages/ViewApplicantsPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import NotFoundPage from './pages/NotFoundPage';
import Navbar from './components/layouts/Navbar';
import AIChatBot from './components/AIChatBot';
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <JobProvider>
          <ApplicationProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </ApplicationProvider>
        </JobProvider>
      </AuthProvider>
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const showChatBot = isAuthenticated && !['/login', '/register'].includes(location.pathname);

  return (
    <>
      <Navbar />
      <Toaster />
      <main className="container mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/job/:id" element={<JobDetailsPage />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
          <Route path="/post-job" element={<PostJobPage />} />
          <Route path="/my-jobs" element={<MyJobsPage />} />
          <Route path="/job/applicants/:jobId" element={<ViewApplicantsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat/:applicationId" element={<ChatPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {showChatBot && <AIChatBot />}
    </>
  );
};

export default App;
