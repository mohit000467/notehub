// src/components/notes/NoteCard.jsx — Glassmorphism Edition + AI Summary
import React, { useState } from "react";
import { Download, Star, Calendar, User, Tag, BookOpen, Eye, Sparkles, X, Loader } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { incrementDownload, incrementReadCount } from "../../services/notesService";
import { updateUserDownloads } from "../../services/userService";
import { rateNote } from "../../services/notesService";
import { generateNoteSummary } from "../../services/geminiService";
import { formatDate, getFileTypeLabel, truncate } from "../../utils/helpers";
import toast from "react-hot-toast";

// ── AI Summary Modal ──────────────────────────────────────────
const SummaryModal = ({ note, onClose }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  React.useEffect(() => {
    const fetchSummary = async () => {
      const result = await generateNoteSummary(note);
      setLoading(false);
      if (result.success) setSummary(result.summary);
      else setError(result.error || "Failed to generate summary");
    };
    fetchSummary();
  }, []);

  const renderSummary = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-bold text-white mt-3 mb-1">{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("* ") || line.startsWith("- ")) {
        return (
          <div key={i} className="flex items-start gap-2 mb-1">
            <span style={{ color: "rgba(108,138,255,0.8)" }} className="mt-0.5 flex-shrink-0">•</span>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{line.slice(2)}</p>
          </div>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <div key={i} className="flex items-start gap-2 mb-1">
            <span style={{ color: "rgba(108,138,255,0.8)" }} className="mt-0.5 flex-shrink-0 font-bold text-xs">{line.split(".")[0]}.</span>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{line.slice(line.indexOf(".") + 1).trim()}</p>
          </div>
        );
      }
      if (line.includes("**")) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
            )}
          </p>
        );
      }
      if (line.trim() === "") return <div key={i} className="h-1" />;
      return <p key={i} className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>{line}</p>;
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(15,18,32,0.98), rgba(10,12,20,0.95))",
          border: "1px solid rgba(108,138,255,0.2)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: "rgba(108,138,255,0.1)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(108,138,255,0.2), rgba(167,139,250,0.15))", border: "1px solid rgba(108,138,255,0.3)" }}>
              <Sparkles size={14} style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">AI Summary</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Powered by Gemini ✨</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-all"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
            <X size={16} />
          </button>
        </div>

        {/* Note info */}
        <div className="px-5 py-3 flex items-center gap-2"
          style={{ background: "rgba(108,138,255,0.04)", borderBottom: "1px solid rgba(108,138,255,0.08)" }}>
          <p className="text-xs font-semibold text-white truncate">{note.title}</p>
          <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>·</span>
          <p className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>{note.subjectDisplay || note.subject}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                <Loader size={20} style={{ color: "#a78bfa" }} className="animate-spin" />
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Generating AI summary...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm text-red-400">Failed to generate summary</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{error}</p>
            </div>
          ) : (
            <div className="space-y-0.5">{renderSummary(summary)}</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center justify-between"
          style={{ borderColor: "rgba(108,138,255,0.08)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
            AI-generated · May not be 100% accurate
          </p>
          <button onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: "rgba(108,138,255,0.1)", border: "1px solid rgba(108,138,255,0.2)", color: "rgba(108,138,255,0.9)" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── NoteCard ──────────────────────────────────────────────────
const NoteCard = ({ note, onRatingUpdate }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [reading, setReading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [localDownloads, setLocalDownloads] = useState(note.downloadCount || 0);
  const [localReadCount, setLocalReadCount] = useState(note.readCount || 0);
  const [localRating, setLocalRating] = useState(note.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated] = useState(note.ratedBy?.includes(currentUser?.uid) || false);
  const [hasRead, setHasRead] = useState(note.readBy?.includes(currentUser?.uid) || false);

  const fileType = getFileTypeLabel(note.fileType);

  const ftGlass = {
    PDF:  { bg: "rgba(251,113,133,0.1)",  border: "rgba(251,113,133,0.25)",  text: "#fb7185" },
    DOC:  { bg: "rgba(108,138,255,0.1)",  border: "rgba(108,138,255,0.25)",  text: "#6c8aff" },
    DOCX: { bg: "rgba(108,138,255,0.1)",  border: "rgba(108,138,255,0.25)",  text: "#6c8aff" },
    IMG:  { bg: "rgba(74,222,128,0.1)",   border: "rgba(74,222,128,0.25)",   text: "#4ade80" },
    PPT:  { bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.25)",   text: "#fbbf24" },
    PPTX: { bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.25)",   text: "#fbbf24" },
    FILE: { bg: "rgba(107,114,128,0.1)",  border: "rgba(107,114,128,0.25)",  text: "#9ca3af" },
  };
  const ftStyle = ftGlass[fileType.label] || ftGlass.FILE;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch(note.fileURL, { mode: "cors" });
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = note.fileName || `${note.title}.${note.fileType || "pdf"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      await incrementDownload(note.id);
      await updateUserDownloads(note.userId);
      setLocalDownloads((p) => p + 1);
      toast.success("Downloaded! ✅");
    } catch {
      window.open(note.fileURL, "_blank");
      await incrementDownload(note.id);
      await updateUserDownloads(note.userId);
      setLocalDownloads((p) => p + 1);
    } finally {
      setDownloading(false);
    }
  };

  const handleRead = async () => {
    if (!isAuthenticated) { toast.error("Sign in to read notes"); return; }
    setReading(true);
    if (currentUser?.uid) {
      const result = await incrementReadCount(note.id, currentUser.uid);
      if (result.success && !result.alreadyRead) {
        setLocalReadCount((p) => p + 1);
        setHasRead(true);
      }
    }
    window.open(note.fileURL, "_blank");
    setReading(false);
  };

  const handleRate = async (rating) => {
    if (!isAuthenticated) { toast.error("Sign in to rate notes"); return; }
    if (hasRated) { toast("Already rated!", { icon: "ℹ️" }); return; }
    if (currentUser.uid === note.userId) { toast.error("Can't rate your own note"); return; }
    const result = await rateNote(note.id, currentUser.uid, rating);
    if (result.success) {
      setLocalRating(result.newRating);
      toast.success("Rating submitted! ⭐");
      if (onRatingUpdate) onRatingUpdate(note.id, result.newRating);
    } else toast.error(result.error);
  };

  return (
    <>
      <div className="card-lift group relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(15,18,32,0.75) 0%, rgba(10,12,20,0.65) 100%)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          border: "1px solid rgba(108,138,255,0.1)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}>
        <div className="absolute top-0 left-0 right-0 h-px opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ background: "linear-gradient(90deg, transparent, rgba(108,138,255,0.5), rgba(167,139,250,0.3), transparent)" }} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,138,255,0.06), transparent)" }} />

        <div className="relative z-10 p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg"
                  style={{ background: ftStyle.bg, border: `1px solid ${ftStyle.border}`, color: ftStyle.text }}>
                  {fileType.label}
                </span>
                {note.tags?.slice(0, 2).map((tag) => (
                  <span key={tag} className="tag-pill flex items-center gap-1"><Tag size={9} />{tag}</span>
                ))}
              </div>
              <h3 className="font-display font-semibold text-base leading-snug truncate"
                style={{ color: "var(--text-primary)" }}>{note.title}</h3>
            </div>
          </div>

          {note.description && (
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
              {truncate(note.description, 110)}
            </p>
          )}

          <div className="gradient-divider mb-3" />

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <User size={11} style={{ color: "var(--accent)" }} />
              {note.uploaderName || note.username || "Anonymous"}
            </span>
            <span className="flex items-center gap-1.5"><Calendar size={11} />{formatDate(note.createdAt)}</span>
            <span className="flex items-center gap-1.5"><Download size={11} />{localDownloads}</span>
            <span className="flex items-center gap-1.5"
              style={{ color: hasRead ? "rgba(45,212,191,0.8)" : "var(--text-muted)" }}>
              <Eye size={11} />{localReadCount}
            </span>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => handleRate(star)}
                onMouseEnter={() => !hasRated && setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-125 active:scale-95">
                <Star size={14} className={star <= (hoverRating || Math.round(localRating)) ? "star-active" : "star-inactive"} />
              </button>
            ))}
            <span className="text-xs ml-1.5" style={{ color: "var(--text-muted)" }}>
              {localRating > 0 ? `${localRating} (${note.ratingCount || 0})` : "No ratings"}
            </span>
          </div>

          {/* AI Summary Button */}
          <button onClick={() => setShowSummary(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold mb-2 transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(167,139,250,0.1), rgba(108,138,255,0.08))",
              border: "1px solid rgba(167,139,250,0.2)",
              color: "rgba(167,139,250,0.9)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(167,139,250,0.18), rgba(108,138,255,0.12))"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(167,139,250,0.1), rgba(108,138,255,0.08))"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.2)"; }}>
            <Sparkles size={13} /> ✨ AI Summary
          </button>

          {/* Read + Download */}
          <div className="flex gap-2">
            <button onClick={handleRead} disabled={reading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background: hasRead ? "rgba(45,212,191,0.08)" : "linear-gradient(135deg, rgba(45,212,191,0.12), rgba(45,212,191,0.06))",
                border: hasRead ? "1px solid rgba(45,212,191,0.4)" : "1px solid rgba(45,212,191,0.2)",
                color: hasRead ? "rgba(45,212,191,0.7)" : "rgba(45,212,191,0.9)",
              }}>
              <BookOpen size={14} className={reading ? "animate-pulse" : ""} />
              {reading ? "Opening..." : hasRead ? "Read ✓" : "Read"}
            </button>

            <button onClick={handleDownload} disabled={downloading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{
                background: downloading ? "rgba(108,138,255,0.08)" : "linear-gradient(135deg, rgba(108,138,255,0.15), rgba(167,139,250,0.1))",
                border: "1px solid rgba(108,138,255,0.25)",
                color: downloading ? "rgba(108,138,255,0.5)" : "rgba(108,138,255,0.95)",
              }}>
              <Download size={14} className={downloading ? "animate-bounce" : ""} />
              {downloading ? "..." : "Download"}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Modal */}
      {showSummary && <SummaryModal note={note} onClose={() => setShowSummary(false)} />}
    </>
  );
};

export default NoteCard;
