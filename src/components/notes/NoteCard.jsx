// src/components/notes/NoteCard.jsx — 3D Glassmorphism + Smart Animations
import React, { useState, useRef } from "react";
import { Download, Star, Calendar, User, Tag, BookOpen, Eye } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { incrementDownload, incrementReadCount } from "../../services/notesService";
import { updateUserDownloads } from "../../services/userService";
import { rateNote } from "../../services/notesService";
import { formatDate, getFileTypeLabel, truncate } from "../../utils/helpers";
import toast from "react-hot-toast";

const NoteCard = ({ note, onRatingUpdate }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [downloading, setDownloading]     = useState(false);
  const [reading, setReading]             = useState(false);
  const [localDownloads, setLocalDownloads] = useState(note.downloadCount || 0);
  const [localReadCount, setLocalReadCount] = useState(note.readCount || 0);
  const [localRating, setLocalRating]     = useState(note.rating || 0);
  const [hoverRating, setHoverRating]     = useState(0);
  const [hasRated] = useState(note.ratedBy?.includes(currentUser?.uid) || false);
  const [hasRead, setHasRead]             = useState(note.readBy?.includes(currentUser?.uid) || false);
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const fileType = getFileTypeLabel(note.fileType);

  const ftGlass = {
    PDF:  { bg: "rgba(251,113,133,0.15)",  border: "rgba(251,113,133,0.3)",  text: "#fb7185" },
    DOC:  { bg: "rgba(108,138,255,0.15)",  border: "rgba(108,138,255,0.3)",  text: "#6c8aff" },
    DOCX: { bg: "rgba(108,138,255,0.15)",  border: "rgba(108,138,255,0.3)",  text: "#6c8aff" },
    IMG:  { bg: "rgba(74,222,128,0.15)",   border: "rgba(74,222,128,0.3)",   text: "#4ade80" },
    PPT:  { bg: "rgba(251,191,36,0.15)",   border: "rgba(251,191,36,0.3)",   text: "#fbbf24" },
    PPTX: { bg: "rgba(251,191,36,0.15)",   border: "rgba(251,191,36,0.3)",   text: "#fbbf24" },
    FILE: { bg: "rgba(107,114,128,0.15)",  border: "rgba(107,114,128,0.3)",  text: "#9ca3af" },
  };
  const ftStyle = ftGlass[fileType.label] || ftGlass.FILE;

  // 3D Tilt handlers
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateYVal = ((x - centerX) / centerX) * 5;
    const rotateXVal = ((centerY - y) / centerY) * 5;
    setRotateY(rotateYVal);
    setRotateX(rotateXVal);
  };
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

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
    if (!isAuthenticated)          { toast.error("Sign in to rate notes"); return; }
    if (hasRated)                  { toast("Already rated!", { icon: "ℹ️" }); return; }
    if (currentUser.uid === note.userId) { toast.error("Can't rate your own note"); return; }
    const result = await rateNote(note.id, currentUser.uid, rating);
    if (result.success) {
      setLocalRating(result.newRating);
      toast.success("Rating submitted! ⭐");
      if (onRatingUpdate) onRatingUpdate(note.id, result.newRating);
    } else toast.error(result.error);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`,
        background: "linear-gradient(145deg, rgba(15,18,32,0.85), rgba(10,12,20,0.75))",
        backdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(108,138,255,0.15)",
        boxShadow: "0 20px 35px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        willChange: "transform",
      }}
    >
      {/* Top shine line */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(90deg, transparent, rgba(108,138,255,0.7), rgba(167,139,250,0.5), transparent)" }} />

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(108,138,255,0.08), transparent)" }} />

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg transition-all group-hover:scale-105"
                style={{ background: ftStyle.bg, border: `1px solid ${ftStyle.border}`, color: ftStyle.text }}
              >
                {fileType.label}
              </span>
              {note.tags?.slice(0, 2).map((tag) => (
                <span key={tag} className="tag-pill flex items-center gap-1">
                  <Tag size={9} />{tag}
                </span>
              ))}
            </div>
            <h3
              className="font-display font-semibold text-base leading-snug truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {note.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {note.description && (
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
            {truncate(note.description, 110)}
          </p>
        )}

        <div className="gradient-divider mb-3" style={{ background: "linear-gradient(90deg, transparent, rgba(108,138,255,0.2), transparent)" }} />

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1.5 group-hover:text-white transition-colors">
            <User size={11} style={{ color: "var(--accent)" }} />
            {note.uploaderName || note.username || "Anonymous"}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={11} />{formatDate(note.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Download size={11} />{localDownloads}
          </span>
          <span className="flex items-center gap-1.5"
            style={{ color: hasRead ? "rgba(45,212,191,0.8)" : "var(--text-muted)" }}>
            <Eye size={11} />{localReadCount}
          </span>
        </div>

        {/* Stars with floating animation */}
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => !hasRated && setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-all duration-200 hover:scale-125 active:scale-95"
              style={{ animation: `floatStar ${0.3 + star * 0.1}s ease-in-out infinite alternate` }}
            >
              <Star
                size={14}
                className={star <= (hoverRating || Math.round(localRating)) ? "star-active" : "star-inactive"}
              />
            </button>
          ))}
          <span className="text-xs ml-1.5" style={{ color: "var(--text-muted)" }}>
            {localRating > 0 ? `${localRating} (${note.ratingCount || 0})` : "No ratings"}
          </span>
        </div>

        {/* Read + Download buttons with glassy 3D effect */}
        <div className="flex gap-2">
          <button
            onClick={handleRead}
            disabled={reading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 disabled:opacity-50"
            style={{
              background: hasRead
                ? "rgba(45,212,191,0.1)"
                : "linear-gradient(135deg, rgba(45,212,191,0.15), rgba(45,212,191,0.05))",
              border: hasRead
                ? "1px solid rgba(45,212,191,0.4)"
                : "1px solid rgba(45,212,191,0.25)",
              color: hasRead ? "rgba(45,212,191,0.8)" : "rgba(45,212,191,0.95)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <BookOpen size={14} className={reading ? "animate-pulse" : ""} />
            {reading ? "Opening..." : hasRead ? "Read ✓" : "Read"}
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 disabled:opacity-50"
            style={{
              background: downloading
                ? "rgba(108,138,255,0.08)"
                : "linear-gradient(135deg, rgba(108,138,255,0.2), rgba(167,139,250,0.1))",
              border: "1px solid rgba(108,138,255,0.35)",
              color: downloading ? "rgba(108,138,255,0.6)" : "rgba(108,138,255,0.95)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <Download size={14} className={downloading ? "animate-bounce" : ""} />
            {downloading ? "..." : "Download"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatStar {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-2px); }
        }
        .star-active { fill: #fbbf24; stroke: #fbbf24; color: #fbbf24; }
        .star-inactive { fill: none; stroke: #4b5563; color: #4b5563; }
      `}</style>
    </div>
  );
};

export default NoteCard;