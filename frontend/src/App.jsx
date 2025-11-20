import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notices from './pages/Notices';
import Slots from './pages/Slots';
import ManageSlots from './pages/ManageSlots';
import FacultyProfile from './pages/FacultyProfile';
import VerifyEmail from './pages/VerifyEmail';
import Resources from './pages/Resources';
import UploadResource from './pages/UploadResource';
import SummarizeFile from './pages/SummarizeFile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notices"
              element={
                <ProtectedRoute>
                  <Notices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/slots"
              element={
                <ProtectedRoute requiredRole="student">
                  <Slots />
                </ProtectedRoute>
              }
            />
            <Route
              path="/slots/manage"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <ManageSlots />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <FacultyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <Resources />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources/upload"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <UploadResource />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources/summarize"
              element={
                <ProtectedRoute requiredRole="student">
                  <SummarizeFile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
