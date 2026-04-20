// src/pages/SignupPage.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { BookOpen, Sparkles, Shield, Zap, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/auth/AuthForm";

const SignupPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const particles = Array.from({ length: 14 }, (_, i) => ({
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

  const features = [
    { icon: Zap,    text: "Upload notes instantly" },
    { icon: Shield, text: "Private or public profile" },
    { icon: Star,   text: "Rate & discover top notes" },
  ];

  return (
    <div className="min-h-screen auth-bg flex overflow-hidden relative">

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none" style={p} />
        ))}
      </div>

      {/* ── LEFT PANEL ───────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] px-14 py-12 relative z-10">

        <div className="auth-logo-enter flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ink-500 flex items-center justify-center pulse-ring">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">NoteHub</span>
        </div>

        <div className="stagger">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={14} className="text-ink-400" />
            <span className="text-xs font-mono text-ink-400 tracking-wider uppercase">Join the community</span>
          </div>
          <h1 className="text-5xl font-display font-bold text-white leading-tight mb-6">
            Start Sharing{" "}
            <span className="gradient-text">Your Notes</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">
            Create your free account and become part of a growing community of students helping each other succeed.
          </p>

          {/* Feature list */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-ink-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-ink-400" />
                </div>
                <span className="text-sm text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600 font-mono">
          © 2026 NoteHub · Free forever for students
        </p>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="auth-card-enter glass-card rounded-3xl p-8 w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-ink-500 flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">NoteHub</span>
          </div>

          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;