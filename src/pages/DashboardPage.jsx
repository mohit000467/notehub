// src/pages/DashboardPage.jsx — 3D Glassmorphism + Smart Animations
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Download, Star, Trash2, AlertTriangle, BookOpen, Copy } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getNotesByUser, deleteNote } from "../services/notesService";
import { NoteCardSkeleton } from "../components/ui/LoadingSkeleton";
import { formatDate, getFileTypeLabel } from "../utils/helpers";
import AdvancedSearch from "../components/search/AdvancedSearch";
import toast from "react-hot-toast";

// 3D Tilt Card component
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
    const rotateYVal = ((x - centerX) / centerX) * 8;   // max ±8deg
    const rotateXVal = ((centerY - y) / centerY) * 8;
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
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px)`,
        transition: "transform 0.1s ease-out",
        background: "linear-gradient(145deg, rgba(15,18,32,0.85), rgba(10,12,20,0.75))",
        backdropFilter: "blur(24px) saturate(180%)",
        border: `1px solid ${glowColor}33`,
        boxShadow: `0 20px 35px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
        willChange: "transform",
        animation: `floatGlow 6s ease-in-out infinite ${delay}s`,
      }}
      className="rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden card-lift"
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 40%, ${glowColor}40, transparent 70%)` }} />
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10"
        style={{ background: `${glowColor}15`, border: `1px solid ${glowColor}30`, transform: "translateZ(10px)" }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="relative z-10">
        <p className="text-2xl font-display font-bold text-white">{value}</p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
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

  const glassPanel = {
    background: "linear-gradient(145deg, rgba(15,18,32,0.75), rgba(10,12,20,0.65))",
    backdropFilter: "blur(28px) saturate(180%)",
    border: "1px solid rgba(108,138,255,0.12)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter"
      style={{ perspective: "1200px", transformStyle: "preserve-3d" }}>

      {/* Header with 3D floating effect */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 transform-gpu">
        <div className="animate-float-subtle">
          <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Welcome back,{" "}
            <span className="font-semibold" style={{ color: "rgba(108,138,255,0.9)" }}>
              {userProfile?.username}
            </span>{" "}👋
          </p>
        </div>
        <button onClick={() => navigate("/upload")}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
          style={{
            background: "linear-gradient(135deg, #6c8aff, #a78bfa)",
            boxShadow: "0 8px 20px rgba(108,138,255,0.4)",
            transform: "translateZ(5px)",
          }}>
          <Upload size={16} className="group-hover:rotate-12 transition-transform" /> Upload Notes
        </button>
      </div>

      {/* Unique ID Card — with 3D tilt on hover */}
      <div
        className="rounded-2xl px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transform-gpu transition-all duration-300 hover:shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(108,138,255,0.12) 0%, rgba(167,139,250,0.08) 100%)",
          border: "1px solid rgba(108,138,255,0.25)",
          backdropFilter: "blur(20px)",
          transform: "translateZ(8px)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(108,138,255,0.6), transparent)" }} />
        <div>
          <p className="text-xs mb-1 font-mono" style={{ color: "var(--text-muted)" }}>Your Unique ID (share to be found)</p>
          <p className="text-xl font-mono font-bold" style={{ color: "rgba(108,138,255,0.95)" }}>{userProfile?.uniqueId}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(userProfile?.uniqueId || ""); toast.success("Copied!"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/10 hover:scale-105"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)" }}>
            <Copy size={14} /> Copy ID
          </button>
          <button onClick={() => navigate(`/profile/${currentUser?.uid}`)}
            className="px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/10 hover:scale-105"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)" }}>
            View Profile →
          </button>
        </div>
      </div>

      {/* Advanced Search Section — 3D glass panel */}
      <div className="rounded-2xl p-5 mb-6 transform-gpu hover:shadow-2xl transition-all duration-300"
        style={{ ...glassPanel, overflow: "visible", position: "relative", zIndex: 100, transform: "translateZ(2px)" }}>
        <p className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
          <FileText size={14} style={{ color: "var(--accent)" }} /> Search Notes
        </p>
        <AdvancedSearch />
      </div>

      {/* Stats Cards — with 3D tilt and floating delay */}      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <TiltCard icon={FileText} label="Total Uploads"   value={notes.length}      color="#6c8aff" glowColor="#6c8aff" delay="0s" />
        <TiltCard icon={Download} label="Total Downloads" value={totalDownloads}    color="#2dd4bf" glowColor="#2dd4bf" delay="0.15s" />
        <TiltCard icon={Star}     label="Avg Rating"      value={avgRating}         color="#fbbf24" glowColor="#fbbf24" delay="0.3s" />
        <TiltCard icon={BookOpen} label="Rated Notes"     value={ratedNotes.length} color="#4ade80" glowColor="#4ade80" delay="0.45s" />
      </div>

      {/* My Uploads Section */}
      <div>
        <h2 className="text-lg font-display font-semibold text-white mb-4">My Uploads</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <NoteCardSkeleton key={i} />)}</div>
        ) : notes.length === 0 ? (
          <div className="glass-card text-center py-16 rounded-2xl transform-gpu hover:scale-[1.01] transition-all duration-300">
            <BookOpen size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="font-medium mb-1 text-white">No notes uploaded yet</p>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>Start sharing your knowledge!</p>
            <button onClick={() => navigate("/upload")}
              className="btn-glow px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #6c8aff, #a78bfa)" }}>
              Upload Your First Note
            </button>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden transform-gpu hover:shadow-xl transition-all duration-300" style={glassPanel}>
            <div className="grid grid-cols-12 px-5 py-3 border-b text-xs font-mono font-semibold uppercase tracking-widest"
              style={{ borderColor: "rgba(108,138,255,0.08)", color: "var(--text-muted)" }}>
              <div className="col-span-5">Note</div>
              <div className="col-span-2 hidden sm:block">Subject</div>
              <div className="col-span-2 text-center">DL</div>
              <div className="col-span-2 text-center">Rating</div>
              <div className="col-span-1 text-center">Del</div>
            </div>
            {notes.map((note, idx) => {
              const ft = getFileTypeLabel(note.fileType);
              const ftColors = {
                PDF:  { bg: "rgba(251,113,133,0.1)", border: "rgba(251,113,133,0.2)", text: "#fb7185" },
                DOC:  { bg: "rgba(108,138,255,0.1)", border: "rgba(108,138,255,0.2)", text: "#6c8aff" },
                DOCX: { bg: "rgba(108,138,255,0.1)", border: "rgba(108,138,255,0.2)", text: "#6c8aff" },
                IMG:  { bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.2)",  text: "#4ade80" },
                PPT:  { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.2)",  text: "#fbbf24" },
                PPTX: { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.2)",  text: "#fbbf24" },
                FILE: { bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)", text: "#9ca3af" },
              };
              const ftS = ftColors[ft.label] || ftColors.FILE;
              return (
                <div key={note.id}
                  className="grid grid-cols-12 px-5 py-4 items-center transition-all duration-300 transform-gpu hover:translate-x-1 hover:bg-white/5"
                  style={{ borderBottom: idx !== notes.length - 1 ? "1px solid rgba(108,138,255,0.06)" : "none" }}
                >
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg flex-shrink-0 transform-gpu hover:scale-110 transition-transform"
                      style={{ background: ftS.bg, border: `1px solid ${ftS.border}`, color: ftS.text }}>
                      {ft.label}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{note.title}</p>
                      <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{formatDate(note.createdAt)}</p>
                    </div>
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <span className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ background: "rgba(108,138,255,0.07)", border: "1px solid rgba(108,138,255,0.12)", color: "var(--text-secondary)" }}>
                      {note.subjectDisplay}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-bold font-mono" style={{ color: "#2dd4bf" }}>{note.downloadCount || 0}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-semibold" style={{ color: "#fbbf24" }}>
                      {note.rating > 0 ? `⭐ ${note.rating}` : "—"}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => setDeleteTarget(note)}
                      className="p-1.5 rounded-lg transition-all duration-200 hover:bg-red-500/20 hover:scale-110"
                      style={{ color: "var(--text-muted)" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Modal — remains original functionality but with 3D depth */}
      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}>
          <div className="animate-slide-up glass-card rounded-3xl p-6 max-w-sm w-full transform-gpu"
            style={{ transform: "perspective(800px) rotateX(2deg) translateZ(20px)", boxShadow: "0 25px 45px -12px black" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.2)" }}>
              <AlertTriangle size={22} style={{ color: "#fb7185" }} />
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-2">Delete Note?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              "<span className="text-white">{deleteTarget.title}</span>" will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 8px 20px rgba(239,68,68,0.4)" }}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes floatGlow {
          0% { transform: perspective(800px) translateY(0px) rotateX(0deg) rotateY(0deg); }
          50% { transform: perspective(800px) translateY(-4px) rotateX(0.5deg) rotateY(0.5deg); }
          100% { transform: perspective(800px) translateY(0px) rotateX(0deg) rotateY(0deg); }
        }
        @keyframes floatSubtle {
          0% { transform: translateY(0px) rotateZ(0deg); }
          50% { transform: translateY(-3px) rotateZ(0.3deg); }
          100% { transform: translateY(0px) rotateZ(0deg); }
        }
        .animate-float-subtle {
          animation: floatSubtle 5s ease-in-out infinite;
        }
        .card-lift {
          transition: all 0.2s ease;
        }
        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }
        .hover\\:translate-x-1:hover {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;