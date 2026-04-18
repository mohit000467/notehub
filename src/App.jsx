// src/App.jsx
// ============================================================
// Root component with React Router setup
// ============================================================

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import UploadPage from "./pages/UploadPage";
import SubjectPage from "./pages/SubjectPage";
import DashboardPage from "./pages/DashboardPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import NotFoundPage from "./pages/NotFoundPage";

// Layout
import Navbar from "./components/layout/Navbar";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-base">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/subject/:subjectName" element={<SubjectPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/search" element={<SearchResultsPage />} />

          {/* Protected routes */}
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#141828",
              color: "#e0e9ff",
              border: "1px solid #1e2440",
              fontFamily: "'DM Sans', sans-serif",
            },
            success: { iconTheme: { primary: "#00ff88", secondary: "#141828" } },
            error: { iconTheme: { primary: "#ff4466", secondary: "#141828" } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
