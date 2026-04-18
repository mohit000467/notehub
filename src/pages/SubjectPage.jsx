// src/pages/SubjectPage.jsx
// ============================================================
// Shows all notes for a specific subject with sorting/filtering
// ============================================================

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, Tag, FileText } from "lucide-react";
import { getNotesBySubject } from "../services/notesService";
import NoteCard from "../components/notes/NoteCard";
import SortFilter from "../components/notes/SortFilter";
import { NoteCardSkeleton } from "../components/ui/LoadingSkeleton";

const SubjectPage = () => {
  const { subjectName } = useParams();
  const navigate = useNavigate();
  const decoded = decodeURIComponent(subjectName);

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt");
  const [activeTag, setActiveTag] = useState(null);

  // All unique tags from notes
  const allTags = [...new Set(notes.flatMap((n) => n.tags || []))];

  useEffect(() => {
    fetchNotes(sortBy);
  }, [subjectName, sortBy]);

  const fetchNotes = async (sort) => {
    setLoading(true);
    const result = await getNotesBySubject(decoded, sort);
    if (result.success) setNotes(result.data);
    setLoading(false);
  };

  // Filter by tag client-side
  const displayedNotes = activeTag
    ? notes.filter((n) => n.tags?.includes(activeTag))
    : notes;

  const displayName =
    notes.length > 0 ? notes[0].subjectDisplay : decoded;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ink-500/20 flex items-center justify-center">
            <BookOpen size={20} className="text-ink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white capitalize">
              {displayName}
            </h1>
            <p className="text-sm text-gray-500">
              {loading ? "Loading..." : `${displayedNotes.length} note${displayedNotes.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
        </div>
        <SortFilter value={sortBy} onChange={setSortBy} />
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTag(null)}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all ${
              !activeTag
                ? "bg-ink-500/20 border-ink-500/50 text-ink-300"
                : "border-surface-border text-gray-500 hover:border-gray-600"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeTag === tag
                  ? "bg-ink-500/20 border-ink-500/50 text-ink-300"
                  : "border-surface-border text-gray-500 hover:border-gray-600"
              }`}
            >
              <Tag size={10} />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <NoteCardSkeleton key={i} />)}
        </div>
      ) : displayedNotes.length === 0 ? (
        <div className="text-center py-24 border border-surface-border rounded-2xl bg-surface-card">
          <FileText size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium mb-1">No notes found</p>
          <p className="text-sm text-gray-600">
            Be the first to upload notes for{" "}
            <span className="text-ink-400">{displayName}</span>!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onRatingUpdate={(id, newRating) => {
                setNotes((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, rating: newRating } : n))
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectPage;
