// src/pages/DashboardPage.jsx — Pure Gen Z Aesthetic + Deep Glassmorphism
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Download, Star, Trash2, AlertTriangle, BookOpen, Copy, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getNotesByUser, deleteNote } from "../services/notesService";
import { NoteCardSkeleton } from "../components/ui/LoadingSkeleton";
import { formatDate, getFileTypeLabel } from "../utils/helpers";
import AdvancedSearch from "../components/search/AdvancedSearch";
import toast from "react-hot-toast";

// 3D Tilt Card component - Ultra Glassy
const TiltCard = ({ icon: Icon, label, value, color, glowColor, delay = 0 }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateYVal = ((x - centerX) / centerX) * 12; 
    const rotateXVal = ((centerY - y) / centerY) * 12;
    setRotateY(rotateYVal);
    setRotateX(rotateXVal);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`,
        transition: "transform 0.15s ease-out",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(40px) saturate(200%)",
        WebkitBackdropFilter: "blur(40px) saturate(200%)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: `0 30px 60px -15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
        willChange: "transform",
        animation: `floatGlow 6s ease-in-out infinite ${delay}s`,
      }}
      className="rounded-[2rem] p-6 flex items-center gap-5 relative overflow-hidden group cursor-pointer"
    >
      {/* Neon Glow Blob inside card */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30 pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:opacity-50"
        style={{ background: `radial-gradient(circle, ${glowColor}80, transparent 70%)`, filter: "blur(20px)" }} />
      
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
        style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))`, border: `1px solid ${glowColor}50`, boxShadow: `0 0 20px ${glowColor}20` }}>
        <Icon size={26} style={{ color }} />
      </div>
      <div className="relative z-10">
        <p className="text-3xl font-display font-extrabold tracking-tight text-white drop-shadow-md">{value}</p>
        <p className="text-sm font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (currentUser) fetchNotes(); }, [currentUser]);

  const fetchNotes = async () => {
    setLoading(true);
    const result = await getNotesByUser(currentUser.uid);
    if (result.success) setNotes(result.data);
    setLoading(false);
  };

  const totalDownloads = notes.reduce((sum, n) => sum + (n.downloadCount || 0), 0);
  const ratedNotes = notes.filter((n) => n.ratingCount > 0);
  const avgRating = ratedNotes.length
    ? (ratedNotes.reduce((s, n) => s + n.rating, 0) / ratedNotes.length).toFixed(1)
    : "—";

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteNote(deleteTarget.id, deleteTarget, currentUser.uid);
    setDeleting(false);
    if (result.success) {
      setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      toast.success("Note deleted");
    } else toast.error(result.error);
    setDeleteTarget(null);
  };

  // Pure GenZ Glass Panel styling
  const glassPanel = {
    background: "rgba(20, 20, 25, 0.4)",
    backdropFilter: "blur(40px) saturate(250%)",
    WebkitBackdropFilter: "blur(40px) saturate(250%)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden pb-16">
      {/* Background Neon Aura Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[150px] mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-fuchsia-600/10 blur-[100px] mix-blend-screen"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter" style={{ perspective: "1200px" }}>
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 transform-gpu z-10 relative">
          <div className="animate-float-subtle">
            <h1 className="text-4xl md:text-5xl font-display font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/50 drop-shadow-sm mb-2">
              Dashboard
            </h1>
            <p className="text-base text-gray-400 font-medium">
              Welcome back,{" "}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                {userProfile?.username}
              </span> 🚀
            </p>
          </div>
          
          <button onClick={() => navigate("/upload")}
            className="group relative flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(6,182,212,0.8))",
              backdropFilter: "blur(20px)",
              boxShadow: "0 10px 30px -10px rgba(139,92,246,0.6), inset 0 1px 1px rgba(255,255,255,0.3)",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer" />
            <Upload size={18} className="group-hover:-translate-y-1 group-hover:rotate-12 transition-transform duration-300 relative z-10" /> 
            <span className="relative z-10">Upload Notes</span>
          </button>
        </div>

        {/* Unique ID Card — Holographic GenZ look */}
        <div
          className="rounded-[2rem] p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden transform-gpu transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.3)] group"
          style={{
            background: "linear-gradient(120deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(30px)",
          }}
        >
          {/* Holographic animated background */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-1000 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" style={{ mixBlendMode: "overlay" }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-gray-400">Shareable Identity</p>
            </div>
            <p className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{userProfile?.uniqueId}</p>
          </div>
          
          <div className="flex gap-3 relative z-10 w-full sm:w-auto">
            <button onClick={() => { navigator.clipboard.writeText(userProfile?.uniqueId || ""); toast.success("ID Copied! 💅"); }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:bg-white/10 active:scale-95"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Copy size={16} /> Copy
            </button>
            <button onClick={() => navigate(`/profile/${currentUser?.uid}`)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:bg-white/10 active:scale-95"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Profile ⚡
            </button>
          </div>
        </div>

        {/* Stats Cards Grid */}      
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <TiltCard icon={FileText} label="Total Uploads"   value={notes.length}      color="#c084fc" glowColor="#c084fc" delay="0s" />
          <TiltCard icon={Download} label="Total Downloads" value={totalDownloads}    color="#22d3ee" glowColor="#22d3ee" delay="0.15s" />
          <TiltCard icon={Star}     label="Avg Rating"      value={avgRating}         color="#fbbf24" glowColor="#fbbf24" delay="0.3s" />
          <TiltCard icon={BookOpen} label="Rated Notes"     value={ratedNotes.length} color="#4ade80" glowColor="#4ade80" delay="0.45s" />
        </div>

        {/* ── Advanced Search Section (ULTRA GLASSY CURVY AESTHETIC) ── */}
        <div className="relative group z-20 mb-12 transform-gpu hover:scale-[1.01] transition-all duration-500">
          
          {/* Animated Neon Glow Behind the Curvy Search Panel */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600/40 via-cyan-600/40 to-fuchsia-600/40 rounded-[3.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition duration-1000 animate-gradient-xy pointer-events-none"></div>

          {/* Super Curvy Glass Container */}
          <div className="relative rounded-[3rem] p-6 sm:p-10 overflow-hidden"
            style={{
              background: "rgba(15, 15, 20, 0.55)",
              backdropFilter: "blur(50px) saturate(250%)",
              WebkitBackdropFilter: "blur(50px) saturate(250%)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.8), inset 0 2px 5px rgba(255, 255, 255, 0.05)",
            }}>
            
            {/* Inner Glare Effects */}
            <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            <div className="absolute bottom-0 right-1/4 w-1/3 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
            
            <p className="text-sm font-bold uppercase tracking-widest mb-8 flex items-center justify-center sm:justify-start gap-3 text-gray-300 relative z-10">
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-white/10 to-white/0 border border-white/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Search size={18} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 drop-shadow-sm">
                Explore The Vault
              </span>
            </p>
            
            <div className="relative z-10">
              {/* Ye aapke internal Search Component ko render karega */}
              <AdvancedSearch />
            </div>
          </div>
        </div>
        {/* ───────────────────────────────────────────────────────── */}

        {/* My Uploads Section */}
        <div className="relative z-10">
          <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
            My Drops <span className="text-lg">🔥</span>
          </h2>
          
          {loading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <NoteCardSkeleton key={i} />)}</div>
          ) : notes.length === 0 ? (
            <div className="rounded-[2rem] text-center py-20 px-4 transform-gpu hover:scale-[1.01] transition-all duration-500 border border-white/10"
                 style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }}>
              <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <BookOpen size={32} className="text-gray-500" />
              </div>
              <p className="text-xl font-bold text-white mb-2">It's quiet here...</p>
              <p className="text-gray-400 mb-8 max-w-sm mx-auto">Drop your first piece of knowledge and start building your legacy.</p>
              <button onClick={() => navigate("/upload")}
                className="px-8 py-3.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #d946ef)", border: "1px solid rgba(255,255,255,0.2)" }}>
                Drop First Note 🚀
              </button>
            </div>
          ) : (
            <div className="rounded-[2rem] overflow-hidden transform-gpu border border-white/5 shadow-2xl" style={glassPanel}>
              <div className="grid grid-cols-12 px-6 py-4 border-b border-white/10 text-xs font-mono font-bold uppercase tracking-widest text-gray-400 bg-white/5">
                <div className="col-span-5">File Data</div>
                <div className="col-span-2 hidden sm:block">Subject</div>
                <div className="col-span-2 text-center">Hits</div>
                <div className="col-span-2 text-center">Vibe Check</div>
                <div className="col-span-1 text-center">Nuke</div>
              </div>
              
              <div className="divide-y divide-white/5">
                {notes.map((note, idx) => {
                  const ft = getFileTypeLabel(note.fileType);
                  const ftColors = {
                    PDF:  { bg: "rgba(251,113,133,0.1)", border: "rgba(251,113,133,0.3)", text: "#fb7185", glow: "rgba(251,113,133,0.2)" },
                    DOC:  { bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.3)", text: "#60a5fa", glow: "rgba(96,165,250,0.2)" },
                    DOCX: { bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.3)", text: "#60a5fa", glow: "rgba(96,165,250,0.2)" },
                    IMG:  { bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.3)",  text: "#4ade80", glow: "rgba(74,222,128,0.2)" },
                    PPT:  { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  text: "#fbbf24", glow: "rgba(251,191,36,0.2)" },
                    PPTX: { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  text: "#fbbf24", glow: "rgba(251,191,36,0.2)" },
                    FILE: { bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.3)", text: "#9ca3af", glow: "rgba(156,163,175,0.2)" },
                  };
                  const ftS = ftColors[ft.label] || ftColors.FILE;
                  
                  return (
                    <div key={note.id} className="grid grid-cols-12 px-6 py-5 items-center transition-all duration-300 hover:bg-white/[0.03] group">
                      <div className="col-span-5 flex items-center gap-4 min-w-0">
                        <span className="text-[10px] sm:text-xs font-mono font-bold px-3 py-1.5 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_var(--glow)]"
                          style={{ background: ftS.bg, border: `1px solid ${ftS.border}`, color: ftS.text, "--glow": ftS.glow }}>
                          {ft.label}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm md:text-base font-bold text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">{note.title}</p>
                          <p className="text-[11px] font-mono text-gray-500 mt-0.5">{formatDate(note.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="col-span-2 hidden sm:block">
                        <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)", color: "#e2e8f0" }}>
                          {note.subjectDisplay}
                        </span>
                      </div>
                      
                      <div className="col-span-2 text-center">
                        <span className="text-sm font-bold font-mono text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-lg border border-cyan-400/20">{note.downloadCount || 0}</span>
                      </div>
                      
                      <div className="col-span-2 text-center">
                        <span className="text-sm font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20 flex items-center justify-center gap-1 w-fit mx-auto">
                          {note.rating > 0 ? <><Star size={12} fill="currentColor"/> {note.rating}</> : "—"}
                        </span>
                      </div>
                      
                      <div className="col-span-1 flex justify-center">
                        <button onClick={() => setDeleteTarget(note)}
                          className="p-2.5 rounded-xl transition-all duration-300 hover:bg-red-500/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] text-gray-500 hover:text-red-400 border border-transparent hover:border-red-500/30">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Cyberpunk Glass Delete Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-xl">
            <div className="animate-slide-up rounded-[2rem] p-8 max-w-sm w-full transform-gpu border border-white/10 relative overflow-hidden"
              style={{ background: "rgba(20,20,25,0.8)", boxShadow: "0 40px 80px -20px rgba(0,0,0,1), inset 0 1px 1px rgba(255,255,255,0.1)" }}>
              
              {/* Modal red glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/20 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-[0_0_30px_rgba(244,63,94,0.2)]"
                style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)" }}>
                <AlertTriangle size={28} className="text-rose-500" />
              </div>
              <h3 className="text-2xl font-display font-extrabold text-white mb-2 relative z-10">Delete Note?</h3>
              <p className="text-sm text-gray-400 mb-8 relative z-10 leading-relaxed">
                You are about to nuke "<span className="text-white font-bold">{deleteTarget.title}</span>". This action is permanent.
              </p>
              
              <div className="flex gap-3 relative z-10">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all hover:bg-white/10 active:scale-95 text-gray-300"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95 overflow-hidden relative group"
                  style={{ background: "linear-gradient(135deg, #ef4444, #be123c)", boxShadow: "0 10px 25px -5px rgba(225,29,72,0.5)" }}>
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer" />
                  <span className="relative z-10">{deleting ? "Nuking..." : "Confirm"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Required Animations */}
        <style jsx>{`
          @keyframes floatGlow {
            0%, 100% { transform: perspective(1000px) translateY(0px) rotateX(0deg) rotateY(0deg); }
            50% { transform: perspective(1000px) translateY(-8px) rotateX(1deg) rotateY(1deg); }
          }
          @keyframes floatSubtle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
          @keyframes gradientXY {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-float-subtle {
            animation: floatSubtle 6s ease-in-out infinite;
          }
          .animate-shimmer {
            animation: shimmer 1.5s infinite;
          }
          .animate-pulse-slow {
            animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .animate-gradient-xy {
            background-size: 200% 200%;
            animation: gradientXY 8s ease infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default DashboardPage;