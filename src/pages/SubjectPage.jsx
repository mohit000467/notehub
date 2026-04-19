// src/pages/SubjectPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, Tag, FileText } from "lucide-react";
import { getNotesBySubject } from "../services/notesService";
import NoteCard from "../components/notes/NoteCard";
import SortFilter from "../components/notes/SortFilter";
import { NoteCardSkeleton } from "../components/ui/LoadingSkeleton";

const SubjectPage = () => {
  // ✅ FIX: subjectName — original param name
  const { subjectName } = useParams();
  const navigate = useNavigate();

  // ✅ FIX: case-insensitive decode
  const decoded = decodeURIComponent(subjectName || "");

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt");
  const [activeTag, setActiveTag] = useState(null);

  const allTags = [...new Set(notes.flatMap((n) => n.tags || []))];

  useEffect(() => {
    if (decoded) fetchNotes(sortBy);
  }, [subjectName, sortBy]);

  const fetchNotes = async (sort) => {
    setLoading(true);
    // ✅ FIX: pass lowercase so Firestore query is consistent
    const result = await getNotesBySubject(decoded.toLowerCase(), sort);
    if (result.success) setNotes(result.data);
    setLoading(false);
  };

  const filtered = activeTag
    ? notes.filter((n) => n.tags?.includes(activeTag))
    : notes;

  // ✅ FIX: display nicely capitalized
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
        </div>
        <SortFilter sortBy={sortBy} onChange={setSortBy} />
      </div>

      {/* Tags filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
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

      {/* Notes grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <NoteCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-surface-border rounded-2xl bg-surface-card">
          <FileText size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No notes found for "{displayName}"</p>
          <p className="text-sm text-gray-600 mb-4">Be the first to contribute!</p>
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