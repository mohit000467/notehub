// src/pages/SignupPage.jsx — White/Black/Blue High-Visibility
import React from "react";
import { Navigate } from "react-router-dom";
import { BookOpen, Shield, Zap, Star, Users, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/auth/AuthForm";

const SignupPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const features = [
    {
      icon: Zap,
      title: "Instant Upload",
      desc: "Share your notes in seconds — PDF, DOC, images all supported",
    },
    {
      icon: Shield,
      title: "Privacy Control",
      desc: "Set your profile public or private — you're in control",
    },
    {
      icon: Star,
      title: "Rate & Discover",
      desc: "Find top-rated notes and help others with your ratings",
    },
    {
      icon: Users,
      title: "Find Anyone",
      desc: "Search students by their unique ID to view their notes",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* LEFT PANEL — Brand + Features */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 to-white p-8 lg:p-12 flex flex-col justify-between border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">NoteHub</span>
        </div>

        {/* Hero + Feature Grid */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium w-fit mb-6">
            <Sparkles size={14} />
            Join the community
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Start Sharing<br />
            <span className="text-blue-600">Your Notes</span>
          </h1>

          <p className="text-gray-600 text-lg mb-8 max-w-md">
            Create your free account and become part of a growing community of students helping each other succeed.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Icon size={16} className="text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-400 text-xs mt-12">© 2026 NoteHub · Free forever for students</p>
      </div>

      {/* RIGHT PANEL — Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen size={17} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">NoteHub</span>
          </div>

          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;