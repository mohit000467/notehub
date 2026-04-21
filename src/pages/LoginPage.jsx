// src/pages/LoginPage.jsx — Glassmorphism Edition
import React from "react";
import { Navigate } from "react-router-dom";
import { BookOpen, Sparkles, FileText, Users, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/auth/AuthForm";

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const particles = Array.from({ length: 20 }, (_, i) => ({
    width:  `${Math.random() * 5 + 2}px`,
    height: `${Math.random() * 5 + 2}px`,
    left:   `${Math.random() * 100}%`,
    top:    `${Math.random() * 100}%`,
    background: i % 3 === 0
      ? "rgba(108,138,255,0.6)"
      : i % 3 === 1
      ? "rgba(167,139,250,0.5)"
      : "rgba(45,212,191,0.4)",
    animation: `orbFloat ${9 + Math.random() * 9}s ease-in-out infinite alternate`,
    animationDelay: `${Math.random() * 5}s`,
    filter: "blur(1.5px)",
    borderRadius: "50%",
    position: "absolute",
  }));

  const stats = [
    { icon: FileText, label: "Notes Shared",    value: "500+" },
    { icon: Users,    label: "Active Students", value: "200+" },
    { icon: Download, label: "Downloads",        value: "2K+"  },
  ];

  return (
    <div className="min-h-screen auth-bg flex overflow-hidden relative">

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => <div key={i} style={p} />)}
      </div>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] px-14 py-12 relative z-10">

        {/* Logo */}
        <div className="auth-logo-enter flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center pulse-ring"
            style={{ background: "linear-gradient(135deg, #6c8aff, #5570f0)", boxShadow: "0 8px 24px rgba(108,138,255,0.4)" }}
          >
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">NoteHub</span>
        </div>

        {/* Hero content */}
        <div className="stagger">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-8"
            style={{ background: "rgba(108,138,255,0.1)", border: "1px solid rgba(108,138,255,0.2)", color: "rgba(108,138,255,0.9)" }}
          >
            <Sparkles size={12} />
            Academic Notes Platform
          </div>

          <h1 className="text-5xl font-display font-bold text-white leading-tight mb-6">
            Share Knowledge,{" "}
            <span className="gradient-text">Grow Together</span>
          </h1>

          <p className="text-lg leading-relaxed mb-12 max-w-md" style={{ color: "var(--text-secondary)" }}>
            Upload, discover and download academic notes. Connect with students across subjects and units.
          </p>


        </div>

        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          © 2026 NoteHub · Built for students
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="auth-card-enter glass-card rounded-3xl p-8 w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6c8aff, #5570f0)", boxShadow: "0 4px 16px rgba(108,138,255,0.35)" }}
            >
              <BookOpen size={17} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">NoteHub</span>
          </div>

          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;