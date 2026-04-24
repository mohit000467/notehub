// src/pages/SignupPage.jsx — Pure Gen Z Aesthetic + Deep Glassmorphism
import React from "react";
import { Navigate, Link } from "react-router-dom";
import { BookOpen, CheckCircle, Sparkles, Shield, Zap, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/auth/AuthForm";

const Feature = ({ icon: Icon, title, desc, delay }) => (
  <div className="flex items-start gap-4 group"
    style={{ animation: `staggerIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards`, animationDelay: delay, opacity: 0 }}>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
      style={{ 
        background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.15))", 
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 0 20px rgba(139,92,246,0.1)"
      }}>
      <Icon size={20} className="text-cyan-400 drop-shadow-md group-hover:text-fuchsia-400 transition-colors" />
    </div>
    <div>
      <p className="text-base font-display font-bold text-white mb-1 tracking-wide">{title}</p>
      <p className="text-sm font-medium text-gray-400 leading-relaxed max-w-[280px]">{desc}</p>
    </div>
  </div>
);

const SignupPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const features = [
    { icon: Zap,      title: "Instant Access",    desc: "Drop and share notes immediately. No waiting.", delay: "0.1s" },
    { icon: Users,    title: "Global Network",    desc: "Connect with students sharing your exact vibe.", delay: "0.2s" },
    { icon: Shield,   title: "Ironclad Security", desc: "Your data is locked down with enterprise grade security.", delay: "0.3s" },
    { icon: CheckCircle, title: "Always Free",    desc: "No paywalls. Built for students, forever free.", delay: "0.4s" },
  ];

  return (
    <>
      <style>{`
        @keyframes staggerIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
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
          <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[150px] mix-blend-screen" style={{ animation: "pulse-slow 8s infinite" }}></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[150px] mix-blend-screen"></div>
          <div className="absolute top-[-10%] right-[30%] w-[400px] h-[400px] rounded-full bg-fuchsia-600/10 blur-[120px] mix-blend-screen"></div>
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
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-center py-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8 w-fit"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#c084fc", backdropFilter: "blur(10px)" }}>
              <Sparkles size={14} />
              Join the movement
            </div>

            <h1 className="text-5xl lg:text-6xl font-display font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
              Start sharing<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">knowledge today.</span>
            </h1>

            <p className="text-lg mb-12 max-w-md text-gray-400 font-medium leading-relaxed">
              Create your account in seconds and become part of an academic community that learns together.
            </p>

            {/* Features */}
            <div className="space-y-6">
              {features.map((f, i) => <Feature key={i} {...f} />)}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-4 border-t border-white/10 pt-6 mt-4 w-fit pr-10">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Already in?
            </p>
            <Link to="/login"
              className="text-sm font-bold px-5 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.2)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
              Sign In ⚡
            </Link>
          </div>
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
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-violet-500/20 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none" />

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-10 relative z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", boxShadow: "0 10px 25px rgba(139,92,246,0.4)" }}>
                <BookOpen size={24} className="text-white" />
              </div>
              <span className="font-display font-extrabold text-3xl text-white">NoteHub</span>
            </div>

            <div className="relative z-10">
              <AuthForm mode="signup" />
            </div>
            
            {/* Mobile Login Link */}
            <div className="mt-8 text-center lg:hidden relative z-10">
              <p className="text-sm text-gray-500 font-medium">Already have an account?</p>
              <Link to="/login" className="inline-block mt-2 text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 hover:opacity-80 transition-opacity">
                Sign In ⚡
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;