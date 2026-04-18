// src/pages/SignupPage.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/auth/AuthForm";

const SignupPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-enter">
      <div className="w-full max-w-md py-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-ink-500 flex items-center justify-center">
            <BookOpen size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">NoteHub</span>
        </div>
        <AuthForm mode="signup" />
      </div>
    </div>
  );
};

export default SignupPage;
