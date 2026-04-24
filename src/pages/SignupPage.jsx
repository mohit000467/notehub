// src/pages/SignupPage.jsx — NoteHub Premium: White · Black · Blue
import React from "react";
import { Navigate, Link } from "react-router-dom";
import { BookOpen, CheckCircle, Sparkles, Shield, Zap, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/auth/AuthForm";

const Feature = ({ icon: Icon, title, desc, delay }) => (
  <div className="flex items-start gap-3"
    style={{ animation: `staggerIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards`, animationDelay: delay, opacity: 0 }}>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: "rgba(26,109,255,0.12)", border: "1px solid rgba(26,109,255,0.2)" }}>
      <Icon size={15} style={{ color: "#6aaeff" }} />
    </div>
    <div>
      <p className="text-sm font-semibold text-white mb-0.5" style={{ fontFamily: "var(--font-display)" }}>{title}</p>
      <p className="text-xs" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{desc}</p>
    </div>
  </div>
);

const SignupPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const features = [
    { icon: Zap,      title: "Instant Access",   desc: "Upload and share notes immediately after signup.", delay: "0.1s" },
    { icon: Users,    title: "Student Community", desc: "Connect with students sharing your subjects.",      delay: "0.2s" },
    { icon: Shield,   title: "Secure Platform",   desc: "Your data is protected with Firebase security.",   delay: "0.3s" },
    { icon: CheckCircle, title: "Free Forever",   desc: "No subscription needed. Always free for students.", delay: "0.4s" },
  ];

  return (
    <>
      <style>{`
        @keyframes staggerIn {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.015; }
          50%       { opacity: 0.025; }
        }
      `}</style>

      <div className="min-h-screen auth-bg flex overflow-hidden relative">

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(26,109,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26,109,255,0.04) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            animation: "gridPulse 4s ease-in-out infinite",
          }} />

        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex flex-col justify-between w-[48%] px-16 py-12 relative z-10">

          {/* Logo */}
          <div className="auth-logo-enter flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1a6dff, #0d47d9)", boxShadow: "0 8px 24px rgba(26,109,255,0.4)" }}>
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>NoteHub</span>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-center py-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-8 w-fit"
              style={{ background: "rgba(26,109,255,0.1)", border: "1px solid rgba(26,109,255,0.2)", color: "#6aaeff" }}>
              <Sparkles size={11} />
              Join thousands of students
            </div>

            <h1 className="text-5xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}>
              Start sharing<br />
              <span className="gradient-text">knowledge today</span>
            </h1>

            <p className="text-base mb-12 max-w-sm" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
              Create your account in seconds and become part of an academic community that learns together.
            </p>

            {/* Features */}
            <div className="space-y-5">
              {features.map((f, i) => <Feature key={i} {...f} />)}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-4">
            <p className="text-xs font-mono" style={{ color: "var(--text-dim)" }}>
              Already have an account?
            </p>
            <Link to="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "rgba(26,109,255,0.1)", border: "1px solid rgba(26,109,255,0.2)", color: "#6aaeff" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,109,255,0.18)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(26,109,255,0.1)"; e.currentTarget.style.color = "#6aaeff"; }}>
              Sign In →
            </Link>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to left, rgba(6,6,8,0.85), transparent)", borderLeft: "1px solid rgba(26,109,255,0.07)" }} />

          <div className="auth-card-enter glass-card w-full max-w-md p-8 relative z-10">

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1a6dff, #0d47d9)", boxShadow: "0 4px 16px rgba(26,109,255,0.35)" }}>
                <BookOpen size={17} className="text-white" />
              </div>
              <span className="font-bold text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>NoteHub</span>
            </div>

            <AuthForm mode="signup" />
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
