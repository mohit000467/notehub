// src/pages/UploadPage.jsx — Pure Gen Z Aesthetic + Deep Glassmorphism
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Info, Sparkles } from "lucide-react";
import UploadForm from "../components/notes/UploadForm";

const UploadPage = () => {
  const navigate = useNavigate();
  const iconRef = useRef(null);

  // Deep Glass Panel Style
  const glassPanel = {
    background: "rgba(20, 20, 25, 0.4)",
    backdropFilter: "blur(40px) saturate(250%)",
    WebkitBackdropFilter: "blur(40px) saturate(250%)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden pb-16 pt-8">
      {/* Background Neon Aura Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[150px] mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-fuchsia-600/10 blur-[100px] mix-blend-screen"></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 page-enter" style={{ perspective: "1200px" }}>
        
        {/* Header with floating 3D icon */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 text-center sm:text-left relative z-10">
          <div
            ref={iconRef}
            className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.4)] animate-float flex-shrink-0 border-2 border-white/20 relative group"
            style={{ 
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", 
              transformStyle: "preserve-3d" 
            }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Upload size={32} className="text-white drop-shadow-lg relative z-10 group-hover:-translate-y-1 transition-transform duration-300" />
            
            {/* Sparkle badge */}
            <div className="absolute -top-2 -right-2 bg-black/50 backdrop-blur-md border border-white/20 p-1.5 rounded-full animate-pulse">
              <Sparkles size={14} className="text-amber-400" />
            </div>
          </div>
          <div className="pt-2">
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
              Drop Knowledge
            </h1>
            <p className="text-base text-gray-400 font-medium">
              Upload your best notes and become a legend. 🚀
            </p>
          </div>
        </div>

        {/* Guidelines — Holographic GenZ Card */}
        <div className="rounded-[2rem] p-6 mb-10 transform-gpu transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.2)] group relative overflow-hidden"
          style={{
            background: "linear-gradient(120deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(30px)",
          }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 mix-blend-overlay pointer-events-none" />
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-cyan-400/10 border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] mt-1">
              <Info size={24} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white mb-1">Vibe Check 📋</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Keep it clear and organized. Supported formats: PDF, DOC(X), PPT(X), JPG, PNG. Max file size: <span className="text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">25MB</span>. Notes go live instantly for the whole community! ✨
              </p>
            </div>
          </div>
        </div>

        {/* Form Container — Deep glass effect */}
        <div className="rounded-[2.5rem] p-6 md:p-10 transform-gpu border border-white/5 shadow-2xl relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] group" 
             style={glassPanel}>
          {/* Subtle top glow line */}
          <div className="absolute inset-x-0 -top-px h-px w-2/3 mx-auto bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          
          <div className="relative z-10">
            <UploadForm onSuccess={() => setTimeout(() => navigate("/dashboard"), 2000)} />
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-float {
          animation: floatIcon 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default UploadPage;