// src/pages/HomePage.jsx — Glassmorphism Edition
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Sparkles, LogIn, ArrowRight, TrendingUp } from "lucide-react";
import { getRecentNotes, getAllSubjects } from "../services/notesService";
import { getUserByUniqueId } from "../services/userService";
import NoteCard from "../components/notes/NoteCard";
import { NoteCardSkeleton } from "../components/ui/LoadingSkeleton";
import { useAuth } from "../context/AuthContext";
import SubjectSearchBar from "../components/search/SubjectSearchBar";
import toast from "react-hot-toast";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();
  const [userQuery, setUserQuery]         = useState("");
  const [recentNotes, setRecentNotes]     = useState([]);
  const [subjects, setSubjects]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [userSearching, setUserSearching] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [notesResult, subjectsResult] = await Promise.all([
      getRecentNotes(8),
      getAllSubjects(),
    ]);
    if (notesResult.success) setRecentNotes(notesResult.data);
    if (subjectsResult.success)
      setSubjects(subjectsResult.data.sort((a, b) => b.count - a.count));
    setLoading(false);
  };

  const handleUserSearch = async (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    setUserSearching(true);
    const result = await getUserByUniqueId(userQuery.trim());
    setUserSearching(false);
    if (result.success)          navigate(`/profile/${result.data.userId}`);
    else if (result.isBlocked)   toast.error("This user has been blocked by the admin 🚫");
    else if (result.isPrivate)   toast.error("This profile is set to private 🔒");
    else                         toast.error("No user found with this ID");
  };

  // ── NOT LOGGED IN ─────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen hero-bg flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none"
            style={{
              width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? "rgba(108,138,255,0.5)" : i % 3 === 1 ? "rgba(167,139,250,0.4)" : "rgba(45,212,191,0.35)",
              animation: `orbFloat ${9 + Math.random() * 8}s ease-in-out infinite alternate`,
              animationDelay: `${Math.random() * 4}s`, filter: "blur(1px)",
            }} />
        ))}
        <div className="relative z-10 stagger max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono mb-8"
            style={{ background: "rgba(108,138,255,0.08)", border: "1px solid rgba(108,138,255,0.2)", color: "rgba(108,138,255,0.9)" }}>
            <Sparkles size={12} /> Academic Notes Sharing Platform
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-bold text-white mb-6 leading-tight">
            Find, Share & <span className="gradient-text">Download</span><br />Academic Notes
          </h1>
          <p className="text-xl leading-relaxed mb-12 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            A collaborative platform for students to share subject-wise notes. Sign in to search, upload, and connect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button onClick={() => navigate("/login")}
              className="btn-primary btn-glow flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base">
              <LogIn size={18} /> Sign In
            </button>
            <button onClick={() => navigate("/signup")}
              className="glass-btn flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold">
              Create Account <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOGGED IN ─────────────────────────────────────────────
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="hero-bg relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-14 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-6"
            style={{ background: "rgba(108,138,255,0.08)", border: "1px solid rgba(108,138,255,0.18)", color: "rgba(108,138,255,0.9)" }}>
            <Sparkles size={12} /> Academic Notes Sharing Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4 leading-tight">
            Find, Share & Download <span className="gradient-text">Academic Notes</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: "var(--text-secondary)" }}>
            Search by subject or find a student by their unique ID.
          </p>
          {/* Search Bars */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <SubjectSearchBar glassy />
            <form onSubmit={handleUserSearch} className="relative">
              <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input value={userQuery} onChange={(e) => setUserQuery(e.target.value.toUpperCase())}
                placeholder="User ID (USR-XXXXXX)" className="glass-input w-full rounded-xl pl-10 pr-24 py-3.5 text-sm font-mono" />
              <button type="submit" disabled={userSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.25)", color: "rgba(45,212,191,0.9)" }}>
                {userSearching ? "..." : "Find"}
              </button>
            </form>
          </div>
          {/* User ID chip */}
          {userProfile && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-2xl px-4 py-2.5"
              style={{ background: "rgba(108,138,255,0.07)", border: "1px solid rgba(108,138,255,0.15)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: userProfile.avatarColor || "#6c8aff", boxShadow: "0 0 10px rgba(108,138,255,0.4)" }}>
                {userProfile.username?.[0]?.toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Your shareable ID</p>
                <p className="text-sm font-mono font-semibold" style={{ color: "rgba(108,138,255,0.9)" }}>{userProfile.uniqueId}</p>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(userProfile.uniqueId); toast.success("Copied!"); }}
                className="text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{ background: "rgba(108,138,255,0.1)", border: "1px solid rgba(108,138,255,0.2)", color: "rgba(108,138,255,0.8)" }}>
                Copy
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Popular Subjects — NEW ATTRACTIVE UI ── */}
      {subjects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(108,138,255,0.2), rgba(167,139,250,0.15))", border: "1px solid rgba(108,138,255,0.25)" }}>
              <TrendingUp size={15} style={{ color: "rgba(108,138,255,0.9)" }} />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">Popular Subjects</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{subjects.length} subjects available</p>
            </div>
          </div>

          {/* Subject cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {subjects.slice(0, 12).map((subject, idx) => {
              // Rotating gradient colors for each card
              const gradients = [
                { from: "rgba(108,138,255,0.15)", to: "rgba(108,138,255,0.05)", border: "rgba(108,138,255,0.25)", glow: "#6c8aff" },
                { from: "rgba(167,139,250,0.15)", to: "rgba(167,139,250,0.05)", border: "rgba(167,139,250,0.25)", glow: "#a78bfa" },
                { from: "rgba(45,212,191,0.15)",  to: "rgba(45,212,191,0.05)",  border: "rgba(45,212,191,0.25)",  glow: "#2dd4bf" },
                { from: "rgba(251,191,36,0.15)",  to: "rgba(251,191,36,0.05)",  border: "rgba(251,191,36,0.25)",  glow: "#fbbf24" },
                { from: "rgba(251,113,133,0.15)", to: "rgba(251,113,133,0.05)", border: "rgba(251,113,133,0.25)", glow: "#fb7185" },
                { from: "rgba(74,222,128,0.15)",  to: "rgba(74,222,128,0.05)",  border: "rgba(74,222,128,0.25)",  glow: "#4ade80" },
              ];
              const g = gradients[idx % gradients.length];

              return (
                <button
                  key={subject.subject}
                  onClick={() => navigate(`/subject/${encodeURIComponent(subject.subject)}`)}
                  className="group relative rounded-2xl p-4 text-left transition-all duration-300 overflow-hidden"
                  style={{
                    background: `linear-gradient(145deg, ${g.from}, ${g.to})`,
                    border: `1px solid ${g.border}`,
                    backdropFilter: "blur(16px)",
                    boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${g.glow}25`;
                    e.currentTarget.style.borderColor = g.glow + "55";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                    e.currentTarget.style.borderColor = g.border;
                  }}
                >
                  {/* Glow dot */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${g.glow}20`, border: `1px solid ${g.glow}30` }}>
                    <BookOpen size={15} style={{ color: g.glow }} />
                  </div>

                  {/* Subject name */}
                  <p className="text-sm font-semibold text-white leading-snug mb-2 line-clamp-2">
                    {subject.subjectDisplay}
                  </p>

                  {/* Note count badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: `${g.glow}20`, color: g.glow, border: `1px solid ${g.glow}30` }}>
                      {subject.count} {subject.count === 1 ? "note" : "notes"}
                    </span>
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${g.glow}08, transparent 70%)` }} />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Recently Uploaded */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-semibold text-white">Recently Uploaded</h2>
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Latest contributions</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <NoteCardSkeleton key={i} />)}
          </div>
        ) : recentNotes.length === 0 ? (
          <div className="glass-card text-center py-20 rounded-2xl">
            <BookOpen size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-secondary)" }}>No notes uploaded yet.</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Be the first to contribute! 🚀</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentNotes.map((note) => <NoteCard key={note.id} note={note} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
