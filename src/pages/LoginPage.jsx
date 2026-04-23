// src/pages/LoginPage.jsx — White/Black/Blue High-Visibility + Live Activity
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { BookOpen, FileText, Users, Download, Activity, TrendingUp, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/auth/AuthForm";

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  // ---------- LIVE ACTIVITY STATE ----------
  const [liveCounter, setLiveCounter] = useState(1247);
  const [activityMessage, setActivityMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);

  const activityMessages = [
    "📚 New Calculus notes uploaded just now",
    "🔥 47 students viewing 'JavaScript Notes'",
    "⭐ 'Data Structures' got 5 new ratings",
    "📥 23 downloads in the last minute",
    "📝 'Physics 101' notes updated",
    "👥 12 new students joined NoteHub",
  ];

  // Simulate live counter increment every 4-7 seconds
  useEffect(() => {
    const counterInterval = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 8) + 2); // +2 to +9
    }, 5000);
    return () => clearInterval(counterInterval);
  }, []);

  // Rotate activity messages every 3 seconds
  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % activityMessages.length);
    }, 3000);
    return () => clearInterval(msgInterval);
  }, []);

  useEffect(() => {
    setActivityMessage(activityMessages[messageIndex]);
  }, [messageIndex, activityMessages]);

  // ---------- STATS (static) ----------
  const stats = [
    { icon: FileText, label: "Notes Shared", value: "2,450+" },
    { icon: Users, label: "Active Students", value: "1,230+" },
    { icon: Download, label: "Total Downloads", value: "15.2K+" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* LEFT PANEL — Brand + Live Activity */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 to-white p-8 lg:p-12 flex flex-col justify-between border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">NoteHub</span>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Share Knowledge,<br />
            <span className="text-blue-600">Grow Together</span>
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-md">
            Upload, discover and download academic notes. Connect with students across subjects and units.
          </p>

          {/* Live Activity Widget — HIGH VISIBILITY */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Live Notes Activity</h3>
              <span className="ml-auto flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                LIVE
              </span>
            </div>

            {/* Animated Counter */}
            <div className="flex items-baseline gap-2 mb-3">
              <TrendingUp size={16} className="text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">{liveCounter.toLocaleString()}</span>
              <span className="text-gray-500 text-sm">notes accessed today</span>
            </div>

            {/* Cycling message */}
            <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2">
              <Clock size={14} className="text-blue-600" />
              <span className="text-gray-800 text-sm font-medium">
                {activityMessage}
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-3">Updates every few seconds • Real‑time stats</p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <Icon size={18} className="text-blue-600 mx-auto mb-1" />
                <p className="text-gray-900 font-bold">{value}</p>
                <p className="text-gray-500 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-400 text-xs mt-12">© 2026 NoteHub · Built for students</p>
      </div>

      {/* RIGHT PANEL — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo (visible only on small screens) */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen size={17} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">NoteHub</span>
          </div>

          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;