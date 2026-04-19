// src/pages/DashboardPage.jsx — UI improved with rounded borders
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, FileText, Download, Star, Trash2, AlertTriangle,
  BookOpen, Users, Copy, Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getNotesByUser, deleteNote } from "../services/notesService";
import { getUserByUniqueId } from "../services/userService";
import { NoteCardSkeleton } from "../components/ui/LoadingSkeleton";
import { formatDate, getFileTypeLabel } from "../utils/helpers";
import SubjectSearchBar from "../components/search/SubjectSearchBar";
import toast from "react-hot-toast";

const StatCard = ({ icon: Icon, label, value, color = "text-ink-400", bg = "bg-ink-500/10" }) => (
  <div className="bg-surface-card border border-surface-border rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className={color} />
    </div>
    <div>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [userSearching, setUserSearching] = useState(false);

  useEffect(() => { if (currentUser) fetchNotes(); }, [currentUser]);

  const fetchNotes = async () => {
    setLoading(true);
    const result = await getNotesByUser(currentUser.uid);
    if (result.success) setNotes(result.data);
    setLoading(false);
  };

  const totalDownloads = notes.reduce((sum, n) => sum + (n.downloadCount || 0), 0);
  const ratedNotes = notes.filter((n) => n.ratingCount > 0);
  const avgRating = ratedNotes.length
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

  const handleUserSearch = async (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    setUserSearching(true);
    const result = await getUserByUniqueId(userQuery.trim());
    setUserSearching(false);
    if (result.success) navigate(`/profile/${result.data.userId}`);
    else if (result.isPrivate) toast.error("This profile is private 🔒");
    else toast.error("No user found with this ID");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, <span className="text-ink-400 font-medium">{userProfile?.username}</span> 👋
          </p>
        </div>
        <button onClick={() => navigate("/upload")}
          className="flex items-center gap-2 px-5 py-2.5 bg-ink-500 hover:bg-ink-400 text-white font-semibold rounded-2xl transition-colors">
          <Upload size={16} /> Upload Notes
        </button>
      </div>

      {/* Unique ID Card */}
      <div className="bg-ink-500/5 border border-ink-500/20 rounded-2xl px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Your Unique ID (share to be found)</p>
          <p className="text-xl font-mono font-bold text-ink-300">{userProfile?.uniqueId}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(userProfile?.uniqueId || ""); toast.success("ID copied!"); }}
            className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-surface-border hover:border-ink-600 text-gray-400 hover:text-white rounded-xl text-sm transition-all">
            <Copy size={14} /> Copy ID
          </button>
          <button onClick={() => navigate(`/profile/${currentUser?.uid}`)}
            className="px-4 py-2 border border-surface-border hover:border-ink-600 text-gray-400 hover:text-white rounded-xl text-sm transition-all">
            View Profile →
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-5 mb-6">
        <p className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
          <Search size={14} /> Search
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <SubjectSearchBar />
          <form onSubmit={handleUserSearch} className="relative">
            <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input value={userQuery} onChange={(e) => setUserQuery(e.target.value.toUpperCase())}
              placeholder="Find user by ID (USR-XXXXXX)"
              className="w-full bg-surface-elevated border border-surface-border rounded-xl pl-9 pr-16 py-2.5 text-sm text-white placeholder-gray-600 font-mono outline-none focus:border-accent-cyan transition-all" />
            <button type="submit" disabled={userSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan text-xs font-semibold rounded-lg transition-colors">
              {userSearching ? "..." : "Find"}
            </button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Total Uploads" value={notes.length} />
        <StatCard icon={Download} label="Total Downloads" value={totalDownloads} color="text-accent-cyan" bg="bg-accent-cyan/10" />
        <StatCard icon={Star} label="Avg Rating" value={avgRating} color="text-accent-amber" bg="bg-accent-amber/10" />
        <StatCard icon={BookOpen} label="Rated Notes" value={ratedNotes.length} color="text-accent-green" bg="bg-accent-green/10" />
      </div>

      {/* My Uploads Table */}
      <div>
        <h2 className="text-lg font-display font-semibold text-white mb-4">My Uploads</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <NoteCardSkeleton key={i} />)}</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 border border-surface-border rounded-2xl bg-surface-card">
            <BookOpen size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 font-medium mb-1">No notes uploaded yet</p>
            <p className="text-sm text-gray-600 mb-5">Start sharing your knowledge!</p>
            <button onClick={() => navigate("/upload")}
              className="px-5 py-2.5 bg-ink-500 hover:bg-ink-400 text-white font-semibold rounded-xl transition-colors">
              Upload Your First Note
            </button>
          </div>
        ) : (
          <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-3 border-b border-surface-border text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-5">Note</div>
              <div className="col-span-2 hidden sm:block">Subject</div>
              <div className="col-span-2 text-center">Downloads</div>
              <div className="col-span-2 text-center">Rating</div>
              <div className="col-span-1 text-center">Del</div>
            </div>
            {notes.map((note, idx) => {
              const ft = getFileTypeLabel(note.fileType);
              return (
                <div key={note.id}
                  className={`grid grid-cols-12 px-4 py-4 items-center hover:bg-surface-hover transition-colors ${idx !== notes.length - 1 ? "border-b border-surface-border" : ""}`}>
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${ft.color}`}>{ft.label}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{note.title}</p>
                      <p className="text-xs text-gray-600">{formatDate(note.createdAt)}</p>
                    </div>
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <span className="text-xs text-gray-400 bg-surface-border px-2 py-1 rounded-lg">{note.subjectDisplay}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-semibold text-accent-cyan">{note.downloadCount || 0}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-semibold text-accent-amber">{note.rating > 0 ? `⭐ ${note.rating}` : "—"}</span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => setDeleteTarget(note)}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-400/10 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-2">Delete Note?</h3>
            <p className="text-sm text-gray-500 mb-6">
              "<span className="text-gray-300">{deleteTarget.title}</span>" will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-surface-border text-gray-400 hover:text-white rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
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