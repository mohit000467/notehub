// src/pages/SignupPage.jsx — Glassmorphism Edition
import React from "react";
import { Navigate } from "react-router-dom";
import { BookOpen, Sparkles, Shield, Zap, Star, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/auth/AuthForm";

const SignupPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const particles = Array.from({ length: 16 }, (_, i) => ({
    width:  `${Math.random() * 5 + 2}px`,
    height: `${Math.random() * 5 + 2}px`,
    left:   `${Math.random() * 100}%`,
    top:    `${Math.random() * 100}%`,
    background: i % 4 === 0
      ? "rgba(108,138,255,0.6)"
      : i % 4 === 1
      ? "rgba(167,139,250,0.5)"
      : i % 4 === 2
      ? "rgba(45,212,191,0.4)"
      : "rgba(251,191,36,0.3)",
    animation: `orbFloat ${8 + Math.random() * 10}s ease-in-out infinite alternate`,
    animationDelay: `${Math.random() * 5}s`,
    filter: "blur(1.5px)",
    borderRadius: "50%",
    position: "absolute",
  }));

  const features = [
    {
      icon: Zap,
      title: "Instant Upload",
      desc: "Share your notes in seconds — PDF, DOC, images all supported",
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.08)",
      border: "rgba(251,191,36,0.2)",
    },
    {
      icon: Shield,
      title: "Privacy Control",
      desc: "Set your profile public or private — you're in control",
      color: "#4ade80",
      bg: "rgba(74,222,128,0.08)",
      border: "rgba(74,222,128,0.2)",
    },
    {
      icon: Star,
      title: "Rate & Discover",
      desc: "Find top-rated notes and help others with your ratings",
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.08)",
      border: "rgba(167,139,250,0.2)",
    },
    {
      icon: Users,
      title: "Find Anyone",
      desc: "Search students by their unique ID to view their notes",
      color: "#2dd4bf",
      bg: "rgba(45,212,191,0.08)",
      border: "rgba(45,212,191,0.2)",
    },
  ];

  return (
    <div className="min-h-screen auth-bg flex overflow-hidden relative">

      {/* Particles */}
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

        {/* Content */}
        <div className="stagger">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-8"
            style={{ background: "rgba(108,138,255,0.1)", border: "1px solid rgba(108,138,255,0.2)", color: "rgba(108,138,255,0.9)" }}
          >
            <Sparkles size={12} />
            Join the community
          </div>

          <h1 className="text-5xl font-display font-bold text-white leading-tight mb-6">
            Start Sharing{" "}
            <span className="gradient-text">Your Notes</span>
          </h1>

          <p className="text-lg leading-relaxed mb-10 max-w-md" style={{ color: "var(--text-secondary)" }}>
            Create your free account and become part of a growing community of students helping each other succeed.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, title, desc, color, bg, border }) => (
              <div
                key={title}
                className="glass-card rounded-2xl p-4 card-lift"
                style={{ background: bg, borderColor: border }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${bg}`, border: `1px solid ${border}` }}
                >
                  <Icon size={16} style={{ color }} />
                </div>
                <p className="text-sm font-semibold text-white mb-1">{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          © 2026 NoteHub · Free forever for students
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

          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
