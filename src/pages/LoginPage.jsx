// src/pages/LoginPage.jsx — Pure Gen Z Aesthetic + Deep Glassmorphism
import React, { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/auth/AuthForm";

// ── Animated book pages — Neon Holographic ────────────────
const BookAnimation = () => (
  <div className="relative w-56 h-56 mx-auto mb-10 transform-gpu hover:scale-105 transition-transform duration-500">
    {/* Glow base */}
    <div className="absolute inset-0 rounded-3xl"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 70%, rgba(139,92,246,0.25), transparent 70%)" }} />

    {/* Book spine */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-40 rounded-2xl"
      style={{
        background: "linear-gradient(145deg, #8b5cf6 0%, #06b6d4 100%)",
        boxShadow: "0 20px 50px rgba(139,92,246,0.4), inset 0 2px 10px rgba(255,255,255,0.3)",
      }}>
      {/* Book cover lines */}
      <div className="absolute inset-4 flex flex-col justify-center items-center gap-3">
        <BookOpen size={32} className="text-white drop-shadow-lg" />
        <div className="w-12 h-1 rounded-full bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        <div className="w-8 h-1 rounded-full bg-white/40" />
      </div>
    </div>

    {/* Pages fanning out */}
    {[...Array(5)].map((_, i) => (
      <div key={i}
        className="absolute left-1/2 top-1/2 rounded-r-xl"
        style={{
          width: "28px",
          height: "148px",
          background: i % 2 === 0
            ? "linear-gradient(to right, rgba(255,255,255,0.9), rgba(245,243,255,1))"
            : "linear-gradient(to right, rgba(237,233,254,1), rgba(255,255,255,0.9))",
          transformOrigin: "left center",
          transform: `translateX(-50%) translateY(-50%) translateX(16px) rotate(${(i - 2) * 5}deg)`,
          animation: `pageFan 3.5s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.15}s`,
          boxShadow: "2px 0 15px rgba(0,0,0,0.2)",
          zIndex: i,
        }}
      >
        {/* Page lines */}
        <div className="absolute inset-x-2 top-4 flex flex-col gap-1.5">
          {[...Array(6)].map((_, j) => (
            <div key={j} className="h-0.5 rounded-full opacity-40"
              style={{ background: "linear-gradient(90deg, #8b5cf6, #06b6d4)", width: `${70 + j * 5}%` }} />
          ))}
        </div>
      </div>
    ))}

    {/* Orbiting dots */}
    <div className="absolute w-3 h-3 rounded-full bg-cyan-400"
      style={{
        boxShadow: "0 0 20px rgba(34,211,238,0.8)",
        top: "10%", left: "20%",
        animation: "orbitDot 4s linear infinite",
      }} />
    <div className="absolute w-2.5 h-2.5 rounded-full bg-fuchsia-400"
      style={{
        boxShadow: "0 0 15px rgba(232,121,249,0.8)",
        bottom: "15%", right: "15%",
        animation: "orbitDot 5s linear infinite reverse",
      }} />
  </div>
);

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <>
      <style>{`
        @keyframes pageFan {
          from { transform: translateX(-50%) translateY(-50%) translateX(16px) rotate(var(--r-from, -10deg)); }
          to   { transform: translateX(-50%) translateY(-50%) translateX(16px) rotate(var(--r-to, 10deg)); }
        }
        @keyframes orbitDot {
          from { transform: rotate(0deg) translateX(90px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(90px) rotate(-360deg); }
        }
        @keyframes scanLine {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.02; }
          50%       { opacity: 0.05; }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(139,92,246,0.1); }
          50%       { box-shadow: 0 0 50px rgba(6,182,212,0.2); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>

      <div className="min-h-screen flex overflow-hidden relative bg-[#0a0a0c]">

        {/* Background Neon Aura Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[150px] mix-blend-screen" style={{ animation: "pulse-slow 8s infinite" }}></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-cyan-600/10 blur-[150px] mix-blend-screen"></div>
          <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full bg-fuchsia-600/10 blur-[120px] mix-blend-screen"></div>
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            animation: "gridPulse 4s ease-in-out infinite",
          }} />

        {/* Scan line */}
        <div className="absolute left-0 right-0 h-px pointer-events-none z-0"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)",
            animation: "scanLine 8s linear infinite",
          }} />

        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex flex-col justify-between w-[52%] px-16 py-12 relative z-10">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative group"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                boxShadow: "0 10px 30px rgba(139,92,246,0.5)",
              }}>
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <BookOpen size={24} className="text-white relative z-10 drop-shadow-md" />
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">NoteHub</span>
              <span className="ml-3 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest"
                style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#22d3ee" }}>
                BETA 🚀
              </span>
            </div>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center py-12 relative">

            {/* Book animation */}
            <BookAnimation />

            {/* Headline */}
            <div className="text-center relative z-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#c084fc", backdropFilter: "blur(10px)" }}>
                <Sparkles size={14} />
                Gen Z Academic Vault
              </div>

              <h1 className="text-5xl lg:text-6xl font-display font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                Drop Knowledge,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">Become a Legend.</span>
              </h1>

              <p className="text-lg max-w-md mx-auto text-gray-400 font-medium leading-relaxed">
                Unlock the ultimate vault of academic notes. Connect, share, and level up with students worldwide. ✨
              </p>
            </div>
          </div>

          {/* Bottom */}
          <p className="text-xs font-bold uppercase tracking-widest text-gray-600 text-center">
            © 2026 NoteHub · Built for the future
          </p>
        </div>

        {/* ── RIGHT PANEL (Auth Container) ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">

          {/* Separation border line */}
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />

          {/* Deep Glass Auth Card */}
          <div className="w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] relative overflow-hidden transition-all duration-500"
            style={{ 
              background: "rgba(20, 20, 25, 0.4)",
              backdropFilter: "blur(40px) saturate(250%)",
              WebkitBackdropFilter: "blur(40px) saturate(250%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
              animation: "borderGlow 5s ease-in-out infinite" 
            }}>
            
            {/* Inner glow blobs for the card */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/20 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none" />

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-10 relative z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", boxShadow: "0 10px 25px rgba(139,92,246,0.4)" }}>
                <BookOpen size={24} className="text-white" />
              </div>
              <span className="font-display font-extrabold text-3xl text-white">NoteHub</span>
            </div>

            <div className="relative z-10">
              <AuthForm mode="login" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;