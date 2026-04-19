// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Users, Download, Sparkles } from "lucide-react";
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
  const [userQuery, setUserQuery] = useState("");
  const [recentNotes, setRecentNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearching, setUserSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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
    if (result.success) {
      navigate(`/profile/${result.data.userId}`);
    } else if (result.isPrivate) {
      toast.error("This profile is set to private 🔒");
    } else {
      toast.error("No user found with this ID");
    }
  };

  const totalNotes = subjects.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="page-enter">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-ink-500/8 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-ink-400 bg-ink-500/10 border border-ink-500/20 px-3 py-1.5 rounded-full mb-6">
            <Sparkles size={12} />
            Academic Notes Sharing Platform
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4 leading-tight">
            Find, Share & Download{" "}
            <span className="gradient-text">Academic Notes</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10">
            A collaborative platform for students to share subject-wise notes.
            Search by subject or find a student by their unique ID.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-10">
            {[
              { icon: BookOpen, label: "Notes", value: totalNotes },
              { icon: Users, label: "Subjects", value: subjects.length },
              { icon: Download, label: "Downloads", value: "∞" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <Icon size={20} className="text-ink-400 mx-auto mb-1" />
                <div className="text-xl font-display font-bold text-white">{value}</div>
                <div className="text-xs text-gray-600">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Dual Search Bars ── */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">

            {/* Subject Search — with autocomplete */}
            <SubjectSearchBar />

            {/* User ID Search — unchanged */}
            <form onSubmit={handleUserSearch} className="relative">
              <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value.toUpperCase())}
                placeholder="User ID (USR-XXXXXX)"
                className="w-full bg-surface-card border border-surface-border rounded-xl pl-10 pr-24 py-3.5 text-sm text-white placeholder-gray-600 font-mono outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/20 transition-all"
              />
              <button
                type="submit"
                disabled={userSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan text-xs font-semibold rounded-lg transition-colors"
              >
                {userSearching ? "..." : "Find"}
              </button>
            </form>
          </div>

          {/* Logged in user ka quick info */}
          {isAuthenticated && userProfile && (
            <div className="mt-6 inline-flex items-center gap-3 bg-surface-card border border-surface-border rounded-xl px-4 py-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: userProfile.avatarColor || "#3a5aff" }}
              >
                {userProfile.username?.[0]?.toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500">Your shareable ID</p>
                <p className="text-sm font-mono font-semibold text-ink-300">
                  {userProfile.uniqueId}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(userProfile.uniqueId);
                  toast.success("ID copied!");
                }}
                className="text-xs text-gray-600 hover:text-gray-300 border border-surface-border rounded px-2 py-1 transition-colors"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Popular Subjects ── */}
      {subjects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Popular Subjects
          </h2>
          <div className="flex flex-wrap gap-2">
            {subjects.slice(0, 12).map((subject) => (
              <button
                key={subject.subject}
                onClick={() =>
                  navigate(`/subject/${encodeURIComponent(subject.subject)}`)
                }
                className="flex items-center gap-2 px-3 py-1.5 bg-surface-card border border-surface-border hover:border-ink-600 hover:bg-surface-hover rounded-lg text-sm text-gray-400 hover:text-white transition-all group"
              >
                <BookOpen size={13} className="text-ink-500 group-hover:text-ink-400" />
                {subject.subjectDisplay}
                <span className="text-xs text-gray-600 bg-surface-border px-1.5 py-0.5 rounded font-mono">
                  {subject.count}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Recently Uploaded ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-semibold text-white">
            Recently Uploaded
          </h2>
          <span className="text-xs text-gray-600 font-mono">Latest contributions</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid:cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <NoteCardSkeleton key={i} />)}
          </div>
        ) : recentNotes.length === 0 ? (
          <div className="text-center py-20 border border-surface-border rounded-2xl bg-surface-card">
            <BookOpen size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No notes uploaded yet.</p>
            <p className="text-sm text-gray-600">Be the first to contribute! 🚀</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;