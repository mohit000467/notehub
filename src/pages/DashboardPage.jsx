// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Download, Star, Trash2, AlertTriangle, BookOpen, Users, Copy, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getNotesByUser, deleteNote } from "../services/notesService";
import { getUserByUniqueId } from "../services/userService";
import { NoteCardSkeleton } from "../components/ui/LoadingSkeleton";
import { formatDate, getFileTypeLabel } from "../utils/helpers";
import SubjectSearchBar from "../components/search/SubjectSearchBar";
import toast from "react-hot-toast";

const StatCard = ({ icon: Icon, label, value, color, glowColor }) => (
  <div className="card-lift rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden"
    style={{
      background: "linear-gradient(145deg, rgba(15,18,32,0.75), rgba(10,12,20,0.65))",
      backdropFilter: "blur(24px)",
      border: `1px solid ${glowColor}22`,
      boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`,
    }}>
  <div className="absolute inset-0 opacity-20 pointer-events-none"
    style={{ background: `radial-gradient(circle at 20% 50%, ${glowColor}30, transparent 70%)` }} />
  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10"
    style={{ background: `${glowColor}15`, border: `1px solid ${glowColor}30` }}>
    <Icon size={22} style={{ color }} />
  </div>
  <div className="relative z-10">
    <p className="text-2xl font-display font-bold text-white">{value}</p>
    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
  </div>
</div>
);

const DashboardPage = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [userQuery, setUserQuery]       = useState("");
  const [userSearching, setUserSearching] = useState(false);

  useEffect(() => { if (currentUser) fetchNotes(); }, [currentUser]);

  const fetchNotes = async () => {
    setLoading(true);
    const result = await getNotesByUser(currentUser.uid);
    if (result.success) setNotes(result.data);
    setLoading(false);
  };

  const totalDownloads = notes.reduce((sum, n) => sum + (n.downloadCount || 0), 0);
  const ratedNotes     = notes.filter((n) => n.ratingCount > 0);
  const avgRating      = ratedNotes.length
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

  // ── User ID search — sahi messages ────────────────────────
  const handleUserSearch = async (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    setUserSearching(true);
    const result = await getUserByUniqueId(userQuery.trim());
    setUserSearching(false);

    if (result.success) {
      navigate(`/profile/${result.data.userId}`);
    } else if (result.isBlocked) {
      toast.error("This user has been blocked by the admin 🚫");
    } else if (result.isPrivate) {
      toast.error("This profile is set to private 🔒");
    } else {
      toast.error("No user found with this ID");
    }
  };

  const glassPanel = {
    background: "linear-gradient(145deg, rgba(15,18,32,0.7), rgba(10,12,20,0.6))",
    backdropFilter: "blur(28px) saturate(160%)",
    WebkitBackdropFilter: "blur(28px) saturate(160%)",
    border: "1px solid rgba(108,138,255,0.1)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Welcome back,{" "}
            <span className="font-semibold" style={{ color: "rgba(108,138,255,0.9)" }}>
              {userProfile?.username}
            </span>{" "}👋
          </p>
        </div>
        <button onClick={() => navigate("/upload")}
          className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm text-white transition-all"
          style={{ background: "linear-gradient(135deg, #6c8aff, #a78bfa)", boxShadow: "0 4px 16px rgba(108,138,255,0.3)" }}>
          <Upload size={16} /> Upload Notes
        </button>
      </div>

      {/* Unique ID Card */}
      <div className="rounded-2xl px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(108,138,255,0.08) 0%, rgba(167,139,250,0.05) 100%)", border: "1px solid rgba(108,138,255,0.18)", backdropFilter: "blur(20px)" }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(108,138,255,0.5), transparent)" }} />
        <div>
          <p className="text-xs mb-1 font-mono" style={{ color: "var(--text-muted)" }}>Your Unique ID (share to be found)</p>
          <p className="text-xl font-mono font-bold" style={{ color: "rgba(108,138,255,0.95)" }}>{userProfile?.uniqueId}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(userProfile?.uniqueId || ""); toast.success("Copied!"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)" }}>
            <Copy size={14} /> Copy ID
          </button>
          <button onClick={() => navigate(`/profile/${currentUser?.uid}`)}
            className="px-4 py-2 rounded-xl text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)" }}>
            View Profile →
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="rounded-2xl p-5 mb-6"
        style={{ ...glassPanel, overflow: "visible", position: "relative", zIndex: 100 }}>
        <p className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
          <Search size={14} style={{ color: "var(--accent)" }} /> Search
        </p>
        <div className="grid sm:grid-cols-2 gap-3" style={{ position: "relative", zIndex: 100 }}>
          <div style={{ position: "relative", zIndex: 200 }}>
            <SubjectSearchBar />
          </div>
          <form onSubmit={handleUserSearch} className="relative">
            <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value.toUpperCase())}
              placeholder="Find user by ID (USR-XXXXXX)"
              className="w-full rounded-xl pl-9 pr-16 py-2.5 text-sm font-mono outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(108,138,255,0.15)", color: "var(--text-primary)" }}
            />
            <button type="submit" disabled={userSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.25)", color: "rgba(45,212,191,0.9)" }}>
              {userSearching ? "..." : "Find"}
            </button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Total Uploads"   value={notes.length}      color="#6c8aff" glowColor="#6c8aff" />
        <StatCard icon={Download} label="Total Downloads" value={totalDownloads}    color="#2dd4bf" glowColor="#2dd4bf" />
        <StatCard icon={Star}     label="Avg Rating"      value={avgRating}         color="#fbbf24" glowColor="#fbbf24" />
        <StatCard icon={BookOpen} label="Rated Notes"     value={ratedNotes.length} color="#4ade80" glowColor="#4ade80" />
      </div>

      {/* My Uploads */}
      <div>
        <h2 className="text-lg font-display font-semibold text-white mb-4">My Uploads</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <NoteCardSkeleton key={i} />)}</div>
        ) : notes.length === 0 ? (
          <div className="glass-card text-center py-16 rounded-2xl">
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
          <div className="rounded-2xl overflow-hidden" style={glassPanel}>
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
                  className="grid grid-cols-12 px-5 py-4 items-center transition-all"
                  style={{ borderBottom: idx !== notes.length - 1 ? "1px solid rgba(108,138,255,0.06)" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(108,138,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg flex-shrink-0"
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
                      className="p-1.5 rounded-lg transition-all"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(251,113,133,0.1)"; e.currentTarget.style.color = "#fb7185"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="animate-slide-up glass-card rounded-3xl p-6 max-w-sm w-full">
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
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 16px rgba(239,68,68,0.3)" }}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
