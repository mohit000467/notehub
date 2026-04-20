// src/components/notes/NoteCard.jsx
// ============================================================
// Reusable card component for displaying a note
// ============================================================

import React, { useState } from "react";
import { Download, Star, Calendar, User, Tag, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { incrementDownload } from "../../services/notesService";
import { updateUserDownloads } from "../../services/userService";
import { rateNote } from "../../services/notesService";
import { formatDate, getFileTypeLabel, truncate } from "../../utils/helpers";
import toast from "react-hot-toast";

const NoteCard = ({ note, onRatingUpdate }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [localDownloads, setLocalDownloads] = useState(note.downloadCount || 0);
  const [localRating, setLocalRating] = useState(note.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated] = useState(
    note.ratedBy?.includes(currentUser?.uid) || false
  );

  const fileType = getFileTypeLabel(note.fileType);

  // ── DOWNLOAD ─────────────────────────────────────────────
  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Fetch file as blob and force download — works for ALL formats
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
      setLocalDownloads((prev) => prev + 1);
      toast.success("Downloaded! ✅");
    } catch (err) {
      // CORS fallback — open in new tab
      window.open(note.fileURL, "_blank");
      await incrementDownload(note.id);
      await updateUserDownloads(note.userId);
      setLocalDownloads((prev) => prev + 1);
    } finally {
      setDownloading(false);
    }
  };

  // ── RATING ───────────────────────────────────────────────
  const handleRate = async (rating) => {
    if (!isAuthenticated) {
      toast.error("Sign in to rate notes");
      return;
    }
    if (hasRated) {
      toast("You've already rated this note", { icon: "ℹ️" });
      return;
    }
    if (currentUser.uid === note.userId) {
      toast.error("You can't rate your own note");
      return;
    }

    const result = await rateNote(note.id, currentUser.uid, rating);
    if (result.success) {
      setLocalRating(result.newRating);
      toast.success("Rating submitted! ⭐");
      if (onRatingUpdate) onRatingUpdate(note.id, result.newRating);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5 hover:border-ink-700 hover:shadow-glow transition-all duration-200 group animate-fade-in">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* File type badge */}
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${fileType.color}`}>
              {fileType.label}
            </span>
            {/* Tags */}
            {note.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs text-ink-400 bg-ink-500/10 px-2 py-0.5 rounded flex items-center gap-1"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
          <h3 className="font-display font-semibold text-white text-base leading-snug group-hover:text-ink-300 transition-colors truncate">
            {note.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      {note.description && (
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          {truncate(note.description, 120)}
        </p>
      )}

      {/* Meta Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <User size={12} />
          {note.uploaderName || note.username || "Anonymous"}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {formatDate(note.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <Download size={12} />
          {localDownloads} downloads
        </span>
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => !hasRated && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              size={15}
              className={
                star <= (hoverRating || Math.round(localRating))
                  ? "star-active"
                  : "star-inactive"
              }
            />
          </button>
        ))}
        <span className="text-xs text-gray-500 ml-1">
          {localRating > 0
            ? `${localRating} (${note.ratingCount || 0})`
            : "No ratings"}
        </span>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-ink-500/15 hover:bg-ink-500/30 border border-ink-500/30 hover:border-ink-400/50 text-ink-300 hover:text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={15} className={downloading ? "animate-bounce" : ""} />
        {downloading ? "Opening..." : "Download"}
      </button>
    </div>
  );
};

export default NoteCard;
