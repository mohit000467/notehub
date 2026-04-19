// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, FileText, Download, Star, Trash2, AlertTriangle,
  Search, Shield, ChevronDown, ChevronUp, X, Eye,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getAllUsers, getAllNotes, adminDeleteNote,
  getPlatformStats, isAdminUser,
} from "../services/adminService";
import { formatDate, getFileTypeLabel } from "../utils/helpers";
import toast from "react-hot-toast";

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-surface-card border border-surface-border rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────
const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Search & filter
  const [noteSearch, setNoteSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Expanded user row
  const [expandedUser, setExpandedUser] = useState(null);

  // ── Auth check ───────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) { navigate("/login"); return; }
    if (!isAdminUser(currentUser.email)) {
      toast.error("Access denied");
      navigate("/");
      return;
    }
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    const [statsRes, usersRes, notesRes] = await Promise.all([
      getPlatformStats(),
      getAllUsers(),
      getAllNotes(),
    ]);
    if (statsRes.success) setStats(statsRes.data);
    if (usersRes.success) setUsers(usersRes.data);
    if (notesRes.success) setNotes(notesRes.data);
    setLoading(false);
  };

  // ── Delete handler ────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await adminDeleteNote(deleteTarget.id, deleteTarget.publicId);
    setDeleting(false);
    if (result.success) {
      setNotes(prev => prev.filter(n => n.id !== deleteTarget.id));
      toast.success("Note deleted successfully");
    } else {
      toast.error(result.error || "Delete failed");
    }
    setDeleteTarget(null);
  };

  // ── Filtered notes ────────────────────────────────────────
  const allSubjects = ["all", ...Array.from(new Set(notes.map(n => n.subjectDisplay || n.subject).filter(Boolean)))];
  const filteredNotes = notes.filter(n => {
    const matchSearch = !noteSearch ||
      n.title?.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.uploaderName?.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.subjectDisplay?.toLowerCase().includes(noteSearch.toLowerCase());
    const matchSubject = subjectFilter === "all" || (n.subjectDisplay || n.subject) === subjectFilter;
    return matchSearch && matchSubject;
  });

  // ── Filtered users ────────────────────────────────────────
  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.uniqueId?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const getUserNoteCount = (userId) => notes.filter(n => n.userId === userId).length;
  const getUserDownloads = (userId) => {
    return notes.filter(n => n.userId === userId).reduce((s, n) => s + (n.downloadCount || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="text-center">
          <Shield size={40} className="text-ink-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Shield size={20} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-gray-500">Logged in as {currentUser?.email}</p>
            </div>
          </div>
          <span className="text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full">
            ADMIN ACCESS
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users}    label="Total Users"     value={stats?.totalUsers || 0}     color="bg-ink-500" />
          <StatCard icon={FileText} label="Total Notes"     value={stats?.totalNotes || 0}     color="bg-accent-cyan/80" />
          <StatCard icon={Download} label="Total Downloads" value={stats?.totalDownloads || 0} color="bg-accent-violet/80" />
          <StatCard icon={Star}     label="Rated Notes"     value={stats?.totalRatings || 0}   color="bg-accent-amber/80" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-card border border-surface-border rounded-xl p-1 mb-6 w-fit">
          {[
            { key: "overview", label: "All Notes" },
            { key: "users",    label: "All Users" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-ink-500 text-white"
                  : "text-gray-500 hover:text-white"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── NOTES TAB ──────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input value={noteSearch} onChange={e => setNoteSearch(e.target.value)}
                  placeholder="Search notes, users, subjects..."
                  className="w-full bg-surface-card border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 transition-all" />
              </div>
              <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
                className="bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-ink-500">
                {allSubjects.map(s => (
                  <option key={s} value={s}>{s === "all" ? "All Subjects" : s}</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-gray-600 mb-3">{filteredNotes.length} notes</p>

            {/* Notes Table */}
            <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-3 border-b border-surface-border text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-4">Note</div>
                <div className="col-span-2">Subject</div>
                <div className="col-span-2">Uploaded By</div>
                <div className="col-span-1 text-center">DL</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1 text-center">Del</div>
              </div>

              {filteredNotes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No notes found</div>
              ) : (
                filteredNotes.map((note, idx) => {
                  const ft = getFileTypeLabel(note.fileType);
                  return (
                    <div key={note.id}
                      className={`grid grid-cols-12 px-4 py-3.5 items-center hover:bg-surface-hover transition-colors ${
                        idx !== filteredNotes.length - 1 ? "border-b border-surface-border" : ""
                      }`}>
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${ft.color}`}>
                          {ft.label}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{note.title}</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs text-gray-400 bg-surface-elevated px-2 py-0.5 rounded">
                          {note.subjectDisplay || note.subject}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400 truncate">{note.uploaderName || note.username || "—"}</p>
                      </div>
                      <div className="col-span-1 text-center">
                        <span className="text-xs text-accent-cyan">{note.downloadCount || 0}</span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-600">{formatDate(note.createdAt)}</p>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button onClick={() => setDeleteTarget(note)}
                          className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── USERS TAB ──────────────────────────────────────── */}
        {activeTab === "users" && (
          <div>
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by username, email or ID..."
                className="w-full bg-surface-card border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 transition-all" />
            </div>

            <p className="text-xs text-gray-600 mb-3">{filteredUsers.length} users</p>

            <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-3 border-b border-surface-border text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-3">User</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Unique ID</div>
                <div className="col-span-1 text-center">Notes</div>
                <div className="col-span-1 text-center">DL</div>
                <div className="col-span-1 text-center">Visibility</div>
                <div className="col-span-1 text-center">View</div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No users found</div>
              ) : (
                filteredUsers.map((user, idx) => (
                  <React.Fragment key={user.id}>
                    <div
                      className={`grid grid-cols-12 px-4 py-3.5 items-center hover:bg-surface-hover transition-colors cursor-pointer ${
                        idx !== filteredUsers.length - 1 ? "border-b border-surface-border" : ""
                      }`}
                      onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    >
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                          style={{ backgroundColor: user.avatarColor || "#3a5aff" }}>
                          {user.photoURL
                            ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                            : user.username?.[0]?.toUpperCase()}
                        </div>
                        <p className="text-sm text-white truncate">{user.username}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs font-mono text-gray-500">{user.uniqueId}</span>
                      </div>
                      <div className="col-span-1 text-center">
                        <span className="text-xs text-ink-400 font-semibold">{getUserNoteCount(user.id)}</span>
                      </div>
                      <div className="col-span-1 text-center">
                        <span className="text-xs text-accent-cyan">{getUserDownloads(user.id)}</span>
                      </div>
                      <div className="col-span-1 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          user.profileVisibility === "public"
                            ? "bg-accent-green/10 text-accent-green"
                            : "bg-gray-500/10 text-gray-500"
                        }`}>
                          {user.profileVisibility}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {expandedUser === user.id
                          ? <ChevronUp size={14} className="text-gray-500" />
                          : <ChevronDown size={14} className="text-gray-500" />}
                      </div>
                    </div>

                    {/* Expanded user notes */}
                    {expandedUser === user.id && (
                      <div className="bg-surface-elevated border-b border-surface-border px-4 py-4">
                        <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">
                          Notes by {user.username}
                        </p>
                        {notes.filter(n => n.userId === user.id).length === 0 ? (
                          <p className="text-xs text-gray-600 italic">No notes uploaded</p>
                        ) : (
                          <div className="space-y-2">
                            {notes.filter(n => n.userId === user.id).map(note => {
                              const ft = getFileTypeLabel(note.fileType);
                              return (
                                <div key={note.id} className="flex items-center justify-between bg-surface-card rounded-xl px-4 py-3 border border-surface-border">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${ft.color}`}>{ft.label}</span>
                                    <div className="min-w-0">
                                      <p className="text-sm text-white truncate">{note.title}</p>
                                      <p className="text-xs text-gray-600">{note.subjectDisplay} · {formatDate(note.createdAt)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-accent-cyan">{note.downloadCount || 0} DL</span>
                                    <a href={note.fileURL} target="_blank" rel="noreferrer"
                                      className="p-1.5 text-gray-600 hover:text-ink-400 rounded-lg transition-all">
                                      <Eye size={14} />
                                    </a>
                                    <button onClick={() => setDeleteTarget(note)}
                                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-red-400/10 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <button onClick={() => setDeleteTarget(null)} className="text-gray-600 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-1">Delete Note?</h3>
            <p className="text-sm text-gray-500 mb-1">
              "<span className="text-gray-300">{deleteTarget.title}</span>"
            </p>
            <p className="text-xs text-gray-600 mb-6">
              Uploaded by {deleteTarget.uploaderName || deleteTarget.username} · {deleteTarget.subjectDisplay}
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

export default AdminDashboard;
