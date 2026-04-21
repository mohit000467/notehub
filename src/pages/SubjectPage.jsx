// src/pages/SubjectPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, ArrowLeft, Tag, FileText } from "lucide-react";
import { getNotesBySubject } from "../services/notesService";
import NoteCard from "../components/notes/NoteCard";
import { NoteCardSkeleton } from "../components/ui/LoadingSkeleton";

const SubjectPage = () => {
  const { subjectName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const decoded = decodeURIComponent(subjectName || "");

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt");
  const [activeTag, setActiveTag] = useState(null);
  const [unitFilter, setUnitFilter] = useState("all");

  // ── Read URL params from AdvancedSearch ──────────────────────
  const urlUnit   = searchParams.get("unit") || "";    // e.g. "unit 2"
  const urlUserId = searchParams.get("userId") || "";  // e.g. Firebase UID

  // Set unit filter from URL on first load
  useEffect(() => {
    if (urlUnit) {
      // Normalize: "unit 2" or "2" → "unit 2"
      const normalized = urlUnit.toLowerCase().startsWith("unit")
        ? urlUnit.toLowerCase().trim()
        : `unit ${urlUnit.toLowerCase().trim()}`;
      setUnitFilter(normalized);
    }
  }, [urlUnit]);

  const allTags = [...new Set(notes.flatMap((n) => n.tags || []))];

  // Extract unit numbers from note titles
  const allUnits = ["all", ...Array.from(
    new Set(
      notes
        .map((n) => {
          const match = n.title?.toLowerCase().match(/unit\s*(\d+)/);
          return match ? `unit ${match[1]}` : null;
        })
        .filter(Boolean)
    )
  ).sort()];

  useEffect(() => {
    if (decoded) fetchNotes(sortBy);
  }, [subjectName, sortBy]);

  const fetchNotes = async (sort) => {
    setLoading(true);
    const result = await getNotesBySubject(decoded.toLowerCase(), sort);
    if (result.success) setNotes(result.data);
    setLoading(false);
  };

  // ── Apply tag + unit + userId filter ─────────────────────────
  const filtered = notes
    .filter((n) => !activeTag || n.tags?.includes(activeTag))
    .filter((n) => {
      if (unitFilter === "all") return true;
      const match = n.title?.toLowerCase().match(/unit\s*(\d+)/);
      return match ? `unit ${match[1]}` === unitFilter : false;
    })
    .filter((n) => {
      // ── userId filter from URL (AdvancedSearch se aaya) ──
      if (!urlUserId) return true;
      return n.userId === urlUserId;
    });

  const displayName = decoded
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BookOpen size={22} className="text-ink-400" />
            <h1 className="text-2xl font-display font-bold text-white">
              {displayName}
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            {loading ? "Loading..." : `${filtered.length} note${filtered.length !== 1 ? "s" : ""} found`}
          </p>
          {/* Active filter indicators */}
          {(urlUnit || urlUserId) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {urlUnit && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan">
                  🔍 Unit: {urlUnit}
                </span>
              )}
              {urlUserId && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-ink-500/10 border border-ink-500/30 text-ink-400">
                  👤 Specific user
                </span>
              )}
            </div>
          )}
        </div>

        {/* Sort buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "createdAt", label: "🕐 Latest" },
            { key: "downloadCount", label: "⬇️ Most Downloaded" },
            { key: "rating", label: "⭐ Top Rated" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                sortBy === s.key
                  ? "bg-ink-500 border-ink-500 text-white"
                  : "border-surface-border text-gray-500 hover:text-white hover:border-ink-600"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs text-gray-600 self-center">Tags:</span>
          <button
            onClick={() => setActiveTag(null)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              !activeTag
                ? "bg-ink-500 border-ink-500 text-white"
                : "border-surface-border text-gray-500 hover:text-white"
            }`}
          >
            <Tag size={11} /> All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                activeTag === tag
                  ? "bg-ink-500 border-ink-500 text-white"
                  : "border-surface-border text-gray-500 hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Unit filter */}
      {allUnits.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-xs text-gray-600 self-center">Unit:</span>
          {allUnits.map((unit) => (
            <button
              key={unit}
              onClick={() => setUnitFilter(unit)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
                unitFilter === unit
                  ? "bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan"
                  : "border-surface-border text-gray-500 hover:text-white"
              }`}
            >
              {unit === "all" ? "All Units" : unit.replace("unit ", "Unit ")}
            </button>
          ))}
        </div>
      )}

      {/* Notes grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <NoteCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-surface-border rounded-2xl bg-surface-card">
          <FileText size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No notes found</p>
          <p className="text-sm text-gray-600 mb-4">
            {urlUnit || urlUserId ? "Try different filters" : `Be the first to contribute to "${displayName}"!`}
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="px-4 py-2 bg-ink-500 hover:bg-ink-400 text-white text-sm rounded-lg transition-colors"
          >
            Upload Notes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectPage;