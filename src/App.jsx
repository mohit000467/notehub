// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { isAdminUser } from "./services/adminService";

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
import AdminDashboard from "./pages/AdminDashboard";

// Layout
import Navbar from "./components/layout/Navbar";

// ── Protected Route ───────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ── Admin Route — only admin email can access ─────────────────
const AdminRoute = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdminUser(currentUser?.email)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-base">
        <Routes>
          {/* Public */}
          <Route path="/"                    element={<HomePage />} />
          <Route path="/login"               element={<LoginPage />} />
          <Route path="/signup"              element={<SignupPage />} />
          <Route path="/subject/:subjectName" element={<SubjectPage />} />
          <Route path="/profile/:userId"     element={<ProfilePage />} />
          <Route path="/search"              element={<SearchResultsPage />} />

          {/* Protected */}
          <Route path="/upload"    element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

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
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#141720",
              color: "#eef0f8",
              border: "1px solid #1f2336",
              fontFamily: "'IBM Plex Sans', sans-serif",
            },
            success: { iconTheme: { primary: "#4ade80", secondary: "#141720" } },
            error:   { iconTheme: { primary: "#fb7185", secondary: "#141720" } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;