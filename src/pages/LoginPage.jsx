// src/pages/LoginPage.jsx
import React, { useEffect, useRef } from "react";
import { Navigate, Link } from "react-router-dom";
import { BookOpen, Sparkles, FileText, Users, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/auth/AuthForm";

// Floating particle
const Particle = ({ style }) => (
  <div className="absolute rounded-full pointer-events-none" style={style} />
);

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const particles = Array.from({ length: 18 }, (_, i) => ({
    width:  `${Math.random() * 4 + 2}px`,
    height: `${Math.random() * 4 + 2}px`,
    left:   `${Math.random() * 100}%`,
    top:    `${Math.random() * 100}%`,
    background: i % 3 === 0
      ? 'rgba(108,138,255,0.5)'
      : i % 3 === 1
      ? 'rgba(167,139,250,0.4)'
      : 'rgba(45,212,191,0.35)',
    animation: `orbFloat ${8 + Math.random() * 8}s ease-in-out infinite alternate`,
    animationDelay: `${Math.random() * 4}s`,
    filter: 'blur(1px)',
  }));

  

  return (
    <div className="min-h-screen auth-bg flex overflow-hidden relative">

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => <Particle key={i} style={p} />)}
      </div>

      {/* ── LEFT PANEL — branding ─────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] px-14 py-12 relative z-10">

        {/* Logo */}
        <div className="auth-logo-enter flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ink-500 flex items-center justify-center pulse-ring">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">NoteHub</span>
        </div>

        {/* Hero text */}
        <div className="stagger">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={14} className="text-ink-400" />
            <span className="text-xs font-mono text-ink-400 tracking-wider uppercase">Academic Notes Platform</span>
          </div>
          <h1 className="text-5xl font-display font-bold text-white leading-tight mb-6">
            Share Knowledge,{" "}
            <span className="gradient-text">Grow Together</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">
            Upload, discover and download academic notes. Connect with students across subjects and units.
          </p>

          {/* Stats */}
          
        </div>

        {/* Bottom tagline */}
        <p className="text-xs text-gray-600 font-mono">
          © 2026 NoteHub · Built for students
        </p>
      </div>

      {/* ── RIGHT PANEL — auth form ───────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">

        {/* Glass card */}
        <div className="auth-card-enter glass-card rounded-3xl p-8 w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-ink-500 flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
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