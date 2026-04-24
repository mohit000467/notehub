// src/pages/LoginPage.jsx — NoteHub Premium: White · Black · Blue
import React, { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { BookOpen, FileText, Star, Users, Download, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/auth/AuthForm";

// ── Animated floating note cards ──────────────────────────
const FloatingCard = ({ style, icon: Icon, label, value, delay }) => (
  <div
    className="absolute flex items-center gap-2.5 px-4 py-2.5 rounded-2xl pointer-events-none select-none"
    style={{
      background: "rgba(12,12,20,0.85)",
      border: "1px solid rgba(26,109,255,0.2)",
      backdropFilter: "blur(16px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(26,109,255,0.08)",
      animation: `floatCard 6s ease-in-out infinite alternate`,
      animationDelay: delay,
      ...style,
    }}
  >
    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: "rgba(26,109,255,0.15)", border: "1px solid rgba(26,109,255,0.25)" }}>
      <Icon size={14} style={{ color: "#6aaeff" }} />
    </div>
    <div>
      <p className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-display)", lineHeight: 1 }}>{value}</p>
      <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>{label}</p>
    </div>
  </div>
);

// ── Animated book pages ───────────────────────────────────
const BookAnimation = () => (
  <div className="relative w-56 h-56 mx-auto mb-10">
    {/* Glow base */}
    <div className="absolute inset-0 rounded-3xl"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 70%, rgba(26,109,255,0.2), transparent 70%)" }} />

    {/* Book spine */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-40 rounded-xl"
      style={{
        background: "linear-gradient(145deg, #1a6dff 0%, #0d47d9 100%)",
        boxShadow: "0 20px 60px rgba(26,109,255,0.4), -8px 0 20px rgba(0,0,0,0.3)",
      }}>
      {/* Book cover lines */}
      <div className="absolute inset-4 flex flex-col justify-center items-center gap-2">
        <BookOpen size={28} className="text-white opacity-90" />
        <div className="w-12 h-0.5 rounded bg-white opacity-40" />
        <div className="w-8 h-0.5 rounded bg-white opacity-25" />
      </div>
      {/* Shine */}
      <div className="absolute top-0 left-0 right-0 h-1/3 rounded-xl opacity-20"
        style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)" }} />
    </div>

    {/* Pages fanning out */}
    {[...Array(5)].map((_, i) => (
      <div key={i}
        className="absolute left-1/2 top-1/2 rounded-r-lg"
        style={{
          width: "28px",
          height: "148px",
          background: i % 2 === 0
            ? "linear-gradient(to right, #e8ecff, #f4f6ff)"
            : "linear-gradient(to right, #d8ddf5, #e8ecff)",
          transformOrigin: "left center",
          transform: `translateX(-50%) translateY(-50%) translateX(16px) rotate(${(i - 2) * 4}deg)`,
          animation: `pageFan 3s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.15}s`,
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          zIndex: i,
        }}
      >
        {/* Page lines */}
        <div className="absolute inset-x-2 top-4 flex flex-col gap-1.5">
          {[...Array(6)].map((_, j) => (
            <div key={j} className="h-px rounded opacity-30"
              style={{ background: "#1a6dff", width: `${70 + j * 5}%` }} />
          ))}
        </div>
      </div>
    ))}

    {/* Orbiting dot */}
    <div className="absolute w-3 h-3 rounded-full"
      style={{
        background: "#1a6dff",
        boxShadow: "0 0 12px rgba(26,109,255,0.8)",
        top: "10%",
        left: "20%",
        animation: "orbitDot 4s linear infinite",
      }} />
    <div className="absolute w-2 h-2 rounded-full"
      style={{
        background: "#6aaeff",
        boxShadow: "0 0 8px rgba(106,174,255,0.6)",
        bottom: "15%",
        right: "15%",
        animation: "orbitDot 5s linear infinite reverse",
      }} />
  </div>
);

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const stats = [
    { icon: FileText, label: "Notes Shared",    value: "500+",  delay: "0s",    style: { top: "12%",  left: "5%" } },
    { icon: Users,    label: "Students",         value: "200+",  delay: "1.2s",  style: { top: "28%",  left: "2%" } },
    { icon: Download, label: "Downloads",        value: "2K+",   delay: "0.6s",  style: { bottom: "28%", left: "4%" } },
    { icon: Star,     label: "Avg Rating",       value: "4.8★",  delay: "1.8s",  style: { bottom: "12%", left: "6%" } },
  ];

  return (
    <>
      <style>{`
        @keyframes floatCard {
          from { transform: translateY(0px); }
          to   { transform: translateY(-12px); }
        }
        @keyframes pageFan {
          from { transform: translateX(-50%) translateY(-50%) translateX(16px) rotate(var(--r-from, -8deg)); }
          to   { transform: translateX(-50%) translateY(-50%) translateX(16px) rotate(var(--r-to, 8deg)); }
        }
        @keyframes orbitDot {
          from { transform: rotate(0deg) translateX(80px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
        }
        @keyframes scanLine {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.015; }
          50%       { opacity: 0.03; }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(26,109,255,0.1); }
          50%       { box-shadow: 0 0 40px rgba(26,109,255,0.2); }
        }
      `}</style>

      <div className="min-h-screen auth-bg flex overflow-hidden relative">

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(26,109,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(26,109,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            animation: "gridPulse 4s ease-in-out infinite",
          }} />

        {/* Scan line */}
        <div className="absolute left-0 right-0 h-px pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(26,109,255,0.4), transparent)",
            animation: "scanLine 8s linear infinite",
          }} />

        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex flex-col justify-between w-[52%] px-16 py-12 relative z-10">

          {/* Logo */}
          <div className="auth-logo-enter flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center pulse-ring"
              style={{
                background: "linear-gradient(135deg, #1a6dff, #0d47d9)",
                boxShadow: "0 8px 24px rgba(26,109,255,0.4)",
              }}>
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>NoteHub</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-mono"
                style={{ background: "rgba(26,109,255,0.12)", border: "1px solid rgba(26,109,255,0.25)", color: "#6aaeff" }}>
                BETA
              </span>
            </div>
          </div>

          {/* Center content */}
          <div className="stagger flex-1 flex flex-col justify-center py-12 relative">

            {/* Floating stat cards */}
            {stats.map((s, i) => <FloatingCard key={i} {...s} />)}

            {/* Book animation */}
            <BookAnimation />

            {/* Headline */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-6"
                style={{ background: "rgba(26,109,255,0.1)", border: "1px solid rgba(26,109,255,0.2)", color: "#6aaeff" }}>
                <Sparkles size={11} />
                Academic Notes Platform
              </div>

              <h1 className="text-5xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}>
                Share Knowledge,<br />
                <span className="gradient-text">Grow Together</span>
              </h1>

              <p className="text-base max-w-md mx-auto" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
                Upload and discover academic notes organized by subject and unit.
                Connect with students across your university.
              </p>
            </div>
          </div>

          {/* Bottom */}
          <p className="text-xs font-mono text-center" style={{ color: "var(--text-dim)" }}>
            © 2026 NoteHub · Built for students, by students
          </p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">

          {/* Subtle right panel bg */}
          <div className="absolute inset-0"
            style={{
              background: "linear-gradient(to left, rgba(6,6,8,0.8), transparent)",
              borderLeft: "1px solid rgba(26,109,255,0.08)",
            }} />

          <div className="auth-card-enter glass-card w-full max-w-md p-8 relative z-10"
            style={{ animation: "borderGlow 4s ease-in-out infinite" }}>

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1a6dff, #0d47d9)", boxShadow: "0 4px 16px rgba(26,109,255,0.35)" }}>
                <BookOpen size={17} className="text-white" />
              </div>
              <span className="font-bold text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>NoteHub</span>
            </div>

            <AuthForm mode="login" />
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
