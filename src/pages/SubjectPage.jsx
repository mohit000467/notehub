// src/pages/SubjectPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, ArrowLeft, Tag, FileText, SlidersHorizontal } from "lucide-react";
import { getNotesBySubject } from "../services/notesService";
import NoteCard from "../components/notes/NoteCard";
import { NoteCardSkeleton } from "../components/ui/LoadingSkeleton";

const SubjectPage = () => {
  const { subjectName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const decoded = decodeURIComponent(subjectName || "");

  const [notes, setNotes]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [sortBy, setSortBy]         = useState("createdAt");
  const [activeTag, setActiveTag]   = useState(null);
  const [unitFilter, setUnitFilter] = useState("all");

  const urlUnit   = searchParams.get("unit") || "";
  const urlUserId = searchParams.get("userId") || "";

  useEffect(() => {
    if (urlUnit) {
      const normalized = urlUnit.toLowerCase().startsWith("unit")
        ? urlUnit.toLowerCase().trim()
        : `unit ${urlUnit.toLowerCase().trim()}`;
      setUnitFilter(normalized);
    }
  }, [urlUnit]);

  const allTags = [...new Set(notes.flatMap((n) => n.tags || []))];
  const allUnits = ["all", ...Array.from(new Set(
    notes.map((n) => {
      const match = n.title?.toLowerCase().match(/unit\s*(\d+)/);
      return match ? `unit ${match[1]}` : null;
    }).filter(Boolean)
  )).sort()];

  useEffect(() => { if (decoded) fetchNotes(sortBy); }, [subjectName, sortBy]);

  const fetchNotes = async (sort) => {
    setLoading(true);
    const result = await getNotesBySubject(decoded.toLowerCase(), sort);
    if (result.success) setNotes(result.data);
    setLoading(false);
  };

  const filtered = notes
    .filter((n) => !activeTag || n.tags?.includes(activeTag))
    .filter((n) => {
      if (unitFilter === "all") return true;
      const match = n.title?.toLowerCase().match(/unit\s*(\d+)/);
      return match ? `unit ${match[1]}` === unitFilter : false;
    })
    .filter((n) => (!urlUserId) ? true : n.userId === urlUserId);

  const displayName = decoded.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const sortOptions = [
    { key: "createdAt",     label: "Latest",         emoji: "🕐" },
    { key: "downloadCount", label: "Most Downloaded", emoji: "⬇️" },
    { key: "rating",        label: "Top Rated",       emoji: "⭐" },
  ];

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 transition-colors mb-6 text-sm group"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={e => e.currentTarget.style.color = "white"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(108,138,255,0.2), rgba(167,139,250,0.1))", border: "1px solid rgba(108,138,255,0.25)", boxShadow: "0 0 20px rgba(108,138,255,0.1)" }}>
            <BookOpen size={22} style={{ color: "rgba(108,138,255,0.9)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">{displayName}</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              {loading ? "Loading..." : `${filtered.length} note${filtered.length !== 1 ? "s" : ""} found`}
            </p>
            {(urlUnit || urlUserId) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {urlUnit && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-mono"
                    style={{ background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.25)", color: "rgba(45,212,191,0.9)" }}>
                    🔍 Unit: {urlUnit}
                  </span>
                )}
                {urlUserId && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-mono"
                    style={{ background: "rgba(108,138,255,0.1)", border: "1px solid rgba(108,138,255,0.25)", color: "rgba(108,138,255,0.9)" }}>
                    👤 Specific user
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Sort buttons — NEW UI ── */}
        <div className="flex items-center gap-1 p-1 rounded-2xl"
          style={{ background: "rgba(15,18,32,0.8)", border: "1px solid rgba(108,138,255,0.1)", backdropFilter: "blur(16px)" }}>
          <SlidersHorizontal size={14} className="ml-2 mr-1 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
          {sortOptions.map((s) => (
            <button key={s.key} onClick={() => setSortBy(s.key)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap"
              style={{
                background: sortBy === s.key
                  ? "linear-gradient(135deg, rgba(108,138,255,0.3), rgba(167,139,250,0.2))"
                  : "transparent",
                color: sortBy === s.key ? "white" : "var(--text-muted)",
                border: sortBy === s.key ? "1px solid rgba(108,138,255,0.3)" : "1px solid transparent",
                boxShadow: sortBy === s.key ? "0 2px 8px rgba(108,138,255,0.2)" : "none",
              }}>
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tags filter — NEW UI ── */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 mr-1">
            <Tag size={12} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Tags</span>
          </div>
          <button onClick={() => setActiveTag(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: !activeTag ? "linear-gradient(135deg, rgba(108,138,255,0.25), rgba(167,139,250,0.15))" : "rgba(255,255,255,0.04)",
              border: !activeTag ? "1px solid rgba(108,138,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
              color: !activeTag ? "white" : "var(--text-muted)",
              boxShadow: !activeTag ? "0 2px 8px rgba(108,138,255,0.15)" : "none",
            }}>
            All
          </button>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: activeTag === tag ? "linear-gradient(135deg, rgba(108,138,255,0.25), rgba(167,139,250,0.15))" : "rgba(255,255,255,0.04)",
                border: activeTag === tag ? "1px solid rgba(108,138,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
                color: activeTag === tag ? "white" : "var(--text-muted)",
                boxShadow: activeTag === tag ? "0 2px 8px rgba(108,138,255,0.15)" : "none",
              }}>
              <Tag size={10} />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* ── Unit filter — NEW UI ── */}
      {allUnits.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Unit</span>
          </div>
          {allUnits.map((unit) => (
            <button key={unit} onClick={() => setUnitFilter(unit)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 capitalize"
              style={{
                background: unitFilter === unit
                  ? "linear-gradient(135deg, rgba(45,212,191,0.2), rgba(45,212,191,0.1))"
                  : "rgba(255,255,255,0.04)",
                border: unitFilter === unit ? "1px solid rgba(45,212,191,0.4)" : "1px solid rgba(255,255,255,0.08)",
                color: unitFilter === unit ? "rgba(45,212,191,0.95)" : "var(--text-muted)",
                boxShadow: unitFilter === unit ? "0 2px 8px rgba(45,212,191,0.15)" : "none",
              }}>
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
        <div className="text-center py-20 rounded-2xl"
          style={{ background: "rgba(15,18,32,0.6)", border: "1px solid rgba(108,138,255,0.1)", backdropFilter: "blur(16px)" }}>
          <FileText size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="font-medium text-white mb-1">No notes found</p>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            {urlUnit || urlUserId ? "Try different filters" : `Be the first to contribute to "${displayName}"!`}
          </p>
          <button onClick={() => navigate("/upload")}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #6c8aff, #a78bfa)", boxShadow: "0 4px 16px rgba(108,138,255,0.3)" }}>
            Upload Notes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((note) => <NoteCard key={note.id} note={note} />)}
        </div>
      )}
    </div>
  );
};

export default SubjectPage;
