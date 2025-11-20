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
import Chatbot from './pages/Chatbot';
import Assignments from './pages/Assignments';
import CreateAssignment from './pages/CreateAssignment';
import AssignmentDetail from './pages/AssignmentDetail';
import AssignmentSubmissions from './pages/AssignmentSubmissions';
import ViewSubmission from './pages/ViewSubmission';
import MySubmission from './pages/MySubmission';

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
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments"
              element={
                <ProtectedRoute>
                  <Assignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/create"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <CreateAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/:assignmentId"
              element={
                <ProtectedRoute>
                  <AssignmentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/:assignmentId/submissions"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <AssignmentSubmissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/:assignmentId/submissions/:submissionId"
              element={
                <ProtectedRoute>
                  <ViewSubmission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/:assignmentId/my-submission/:submissionId"
              element={
                <ProtectedRoute requiredRole="student">
                  <MySubmission />
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