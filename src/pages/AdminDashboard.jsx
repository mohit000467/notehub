// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, FileText, Download, Star, Trash2, AlertTriangle,
  Search, Shield, ChevronDown, ChevronUp, X, Eye, EyeOff,
  Lock, Settings, CheckCircle, Ban, UserCheck, UserX, ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getAllUsers, getAllNotes, adminDeleteNote, adminDeleteUser,
  adminBlockUser, adminUnblockUser, adminDeleteAllUserNotes,
  getPlatformStats, isAdminUser, ADMIN_EMAIL,
  getAdminPassword, setAdminPassword,
} from "../services/adminService";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import { formatDate, getFileTypeLabel } from "../utils/helpers";
import toast from "react-hot-toast";

// ── Set Password Screen ───────────────────────────────────────
const SetPasswordScreen = ({ onDone }) => {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSet = async (e) => {
    e.preventDefault();
    if (newPass.length < 6) { setError("Min 6 characters"); return; }
    if (newPass !== confirmPass) { setError("Passwords don't match"); return; }
    setLoading(true);
    const result = await setAdminPassword(newPass);
    setLoading(false);
    if (result.success) { toast.success("Admin password set! 🔐"); onDone(newPass); }
    else setError("Failed to save. Try again.");
  };

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface-card border border-surface-border rounded-2xl p-8">
        <div className="w-12 h-12 bg-ink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Shield size={24} className="text-ink-400" />
        </div>
        <h1 className="text-xl font-display font-bold text-white text-center mb-1">Set Admin Password</h1>
        <p className="text-xs text-gray-500 text-center mb-2 font-mono">{ADMIN_EMAIL}</p>
        <p className="text-xs text-gray-600 text-center mb-6">First time setup — separate from your Firebase login.</p>
        <form onSubmit={handleSet} className="space-y-4">
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type={show ? "text" : "password"} value={newPass}
              onChange={(e) => { setNewPass(e.target.value); setError(""); }}
              placeholder="New admin password" autoFocus
              className="w-full bg-surface-elevated border border-surface-border rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 transition-all" />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type={show ? "text" : "password"} value={confirmPass}
              onChange={(e) => { setConfirmPass(e.target.value); setError(""); }}
              placeholder="Confirm password"
              className="w-full bg-surface-elevated border border-surface-border rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 transition-all" />
          </div>
          {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle size={12} />{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-ink-500 hover:bg-ink-400 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60">
            {loading ? "Saving..." : "Set Password & Enter"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Password Gate ─────────────────────────────────────────────
const AdminLoginGate = ({ onSuccess, correctPassword }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      sessionStorage.setItem("admin_auth", "true");
      onSuccess();
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  const handleForgotPassword = async () => {
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, ADMIN_EMAIL);
      setForgotSent(true);
      toast.success("Firebase reset link sent! Check email 📧");
    } catch (err) {
      toast.error("Failed to send reset email.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleChangeAdminPass = async (e) => {
    e.preventDefault();
    if (newPass.length < 6) { setChangeError("Min 6 characters"); return; }
    if (newPass !== confirmNewPass) { setChangeError("Passwords don't match"); return; }
    setChangeLoading(true);
    const result = await setAdminPassword(newPass);
    setChangeLoading(false);
    if (result.success) {
      toast.success("Admin panel password updated! 🔐");
      setShowChangePass(false);
      setNewPass(""); setConfirmNewPass(""); setChangeError("");
      window.location.reload();
    } else setChangeError("Failed. Try again.");
  };

  if (showChangePass) return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface-card border border-surface-border rounded-2xl p-8">
        <button onClick={() => setShowChangePass(false)}
          className="text-xs text-gray-500 hover:text-white mb-6 flex items-center gap-1 transition-colors">← Back</button>
        <h1 className="text-xl font-display font-bold text-white mb-1">Change Admin Password</h1>
        <p className="text-xs text-gray-500 mb-6">Changes admin panel password only — not Firebase login.</p>
        <form onSubmit={handleChangeAdminPass} className="space-y-4">
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type={show ? "text" : "password"} value={newPass}
              onChange={(e) => { setNewPass(e.target.value); setChangeError(""); }}
              placeholder="New admin panel password" autoFocus
              className="w-full bg-surface-elevated border border-surface-border rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 transition-all" />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type={show ? "text" : "password"} value={confirmNewPass}
              onChange={(e) => { setConfirmNewPass(e.target.value); setChangeError(""); }}
              placeholder="Confirm new password"
              className="w-full bg-surface-elevated border border-surface-border rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 transition-all" />
          </div>
          {changeError && <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle size={12} />{changeError}</p>}
          <button type="submit" disabled={changeLoading}
            className="w-full py-3 bg-ink-500 hover:bg-ink-400 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60">
            {changeLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface-card border border-surface-border rounded-2xl p-8">
        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Shield size={24} className="text-red-400" />
        </div>
        <h1 className="text-xl font-display font-bold text-white text-center mb-1">Admin Access</h1>
        <p className="text-xs text-gray-500 text-center mb-6 font-mono">{ADMIN_EMAIL}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type={show ? "text" : "password"} value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter admin panel password" autoFocus
              className="w-full bg-surface-elevated border border-surface-border rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 transition-all" />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle size={12} />{error}</p>}
          <button type="submit"
            className="w-full py-3 bg-ink-500 hover:bg-ink-400 text-white font-semibold rounded-xl transition-colors text-sm">
            Access Admin Panel
          </button>
        </form>
        <div className="mt-5 pt-4 border-t border-surface-border flex flex-col gap-2">
          <button onClick={() => setShowChangePass(true)}
            className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-ink-400 transition-colors">
            <Settings size={12} /> Change admin panel password
          </button>
          {forgotSent ? (
            <p className="text-xs text-accent-green text-center flex items-center justify-center gap-1">
              <CheckCircle size={12} /> Firebase reset link sent!
            </p>
          ) : (
            <button onClick={handleForgotPassword} disabled={forgotLoading}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors disabled:opacity-50 text-center">
              {forgotLoading ? "Sending..." : "Forgot Firebase login password?"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

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

// ── User Profile Modal ────────────────────────────────────────
const UserProfileModal = ({ user, userNotes, onClose, onBlock, onUnblock, onDeleteNote, onDeleteUser }) => {
  const totalDL = userNotes.reduce((s, n) => s + (n.downloadCount || 0), 0);
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-surface-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0"
              style={{ backgroundColor: user.avatarColor || "#3a5aff" }}>
              {user.photoURL
                ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                : user.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-bold text-white">{user.username}</h2>
                {user.isBlocked && (
                  <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center gap-1">
                    <Ban size={10} /> Blocked
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-600 font-mono mt-0.5">{user.uniqueId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors mt-1">
            <X size={20} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-surface-border">
          <div className="bg-surface-elevated rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-white">{userNotes.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Notes Uploaded</p>
          </div>
          <div className="bg-surface-elevated rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-accent-cyan">{totalDL}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Downloads</p>
          </div>
          <div className="bg-surface-elevated rounded-xl p-4 text-center">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${user.profileVisibility === "public" ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}`}>
              {user.profileVisibility || "public"}
            </span>
            <p className="text-xs text-gray-500 mt-2">Profile Status</p>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="px-6 pt-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Bio</p>
            <p className="text-sm text-gray-400">{user.bio}</p>
          </div>
        )}

        {/* Notes List */}
        <div className="p-6">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-semibold">
            Uploaded Notes ({userNotes.length})
          </p>
          {userNotes.length === 0 ? (
            <p className="text-sm text-gray-600 italic">No notes uploaded by this user.</p>
          ) : (
            <div className="space-y-2">
              {userNotes.map((note) => {
                const ft = getFileTypeLabel(note.fileType);
                return (
                  <div key={note.id} className="flex items-center justify-between bg-surface-elevated rounded-xl px-4 py-3 border border-surface-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${ft.color}`}>{ft.label}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{note.title}</p>
                        <p className="text-xs text-gray-600">{note.subjectDisplay || note.subject} · {formatDate(note.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className="text-xs text-accent-cyan">{note.downloadCount || 0} DL</span>
                      <a href={note.fileURL} target="_blank" rel="noreferrer"
                        className="p-1.5 text-gray-600 hover:text-ink-400 rounded-lg transition-all" title="View file">
                        <ExternalLink size={13} />
                      </a>
                      <button onClick={() => onDeleteNote(note)}
                        className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Delete note">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex flex-wrap gap-3 border-t border-surface-border pt-5">
          {user.isBlocked ? (
            <button onClick={() => onUnblock(user)}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-sm font-medium transition-all">
              <UserCheck size={15} /> Unblock User
            </button>
          ) : (
            <button onClick={() => onBlock(user)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-medium transition-all">
              <Ban size={15} /> Block User
            </button>
          )}
          <button onClick={() => onDeleteUser(user)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition-all">
            <UserX size={15} /> Delete User & All Notes
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Admin Dashboard ──────────────────────────────────────
const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [authState, setAuthState] = useState("loading");
  const [correctPassword, setCorrectPassword] = useState("");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [noteSearch, setNoteSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  // ── Confirm modals state ──
  const [deleteTarget, setDeleteTarget] = useState(null);   // { type: "note"|"user", data }
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [blockTarget, setBlockTarget] = useState(null);     // { action: "block"|"unblock", user }

  const [actionLoading, setActionLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    if (!currentUser) { navigate("/login"); return; }
    if (!isAdminUser(currentUser.email)) { toast.error("Access denied"); navigate("/"); return; }
    checkPassword();
  }, [currentUser]);

  const checkPassword = async () => {
    const result = await getAdminPassword();
    if (result.notSet) { setAuthState("setup"); }
    else if (result.success) {
      setCorrectPassword(result.password);
      const alreadyAuthed = sessionStorage.getItem("admin_auth") === "true";
      setAuthState(alreadyAuthed ? "authed" : "gate");
      if (alreadyAuthed) loadData();
    } else { setAuthState("gate"); }
  };

  const loadData = async () => {
    setLoading(true);
    const [statsRes, usersRes, notesRes] = await Promise.all([
      getPlatformStats(), getAllUsers(), getAllNotes(),
    ]);
    if (statsRes.success) setStats(statsRes.data);
    if (usersRes.success) setUsers(usersRes.data);
    if (notesRes.success) setNotes(notesRes.data);
    setLoading(false);
  };

  // ── Delete Note ──────────────────────────────────────────────
  const handleDeleteNote = async () => {
    if (!deleteTarget || deleteTarget.type !== "note") return;
    setActionLoading(true);
    const result = await adminDeleteNote(deleteTarget.data.id);
    setActionLoading(false);
    if (result.success) {
      setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.data.id));
      toast.success("Note deleted ✅");
    } else toast.error(result.error || "Delete failed");
    setDeleteTarget(null);
    setDeleteConfirmText("");
  };

  // ── Delete User ──────────────────────────────────────────────
  const handleDeleteUser = async () => {
    if (!deleteTarget || deleteTarget.type !== "user") return;
    if (deleteConfirmText !== "DELETE") return;
    setActionLoading(true);
    const result = await adminDeleteUser(deleteTarget.data.id);
    setActionLoading(false);
    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.data.id));
      setNotes((prev) => prev.filter((n) => n.userId !== deleteTarget.data.id));
      setProfileUser(null);
      toast.success(`User "${deleteTarget.data.username}" deleted ✅`);
    } else toast.error(result.error || "Delete failed");
    setDeleteTarget(null);
    setDeleteConfirmText("");
  };

  // ── Block confirm ────────────────────────────────────────────
  
const confirmBlock = async () => {
  if (!blockTarget) return;
  setActionLoading(true);
  const result = await adminBlockUser(blockTarget.user.id);
  setActionLoading(false);
  if (result.success) {
    setUsers((prev) => prev.map((u) => u.id === blockTarget.user.id ? { ...u, isBlocked: true } : u));
    if (profileUser?.id === blockTarget.user.id) setProfileUser((p) => ({ ...p, isBlocked: true }));
    // ✅ Stats real-time update
    setStats((prev) => ({ ...prev, blockedUsers: (prev?.blockedUsers || 0) + 1 }));
    toast.success(`User "${blockTarget.user.username}" blocked 🚫`);
  } else toast.error("Block failed");
  setBlockTarget(null);
};

  // ── Unblock confirm ──────────────────────────────────────────
  
const confirmUnblock = async () => {
  if (!blockTarget) return;
  setActionLoading(true);
  const result = await adminUnblockUser(blockTarget.user.id);
  setActionLoading(false);
  if (result.success) {
    setUsers((prev) => prev.map((u) => u.id === blockTarget.user.id ? { ...u, isBlocked: false } : u));
    if (profileUser?.id === blockTarget.user.id) setProfileUser((p) => ({ ...p, isBlocked: false }));
    // ✅ Stats real-time update
    setStats((prev) => ({ ...prev, blockedUsers: Math.max((prev?.blockedUsers || 0) - 1, 0) }));
    toast.success(`User "${blockTarget.user.username}" unblocked ✅`);
  } else toast.error("Unblock failed");
  setBlockTarget(null);
};

  // ── Trigger handlers (open modals) ───────────────────────────
  const handleBlock = (user) => setBlockTarget({ action: "block", user });
  const handleUnblock = (user) => setBlockTarget({ action: "unblock", user });

  const handleLockPanel = () => {
    sessionStorage.removeItem("admin_auth");
    setAuthState("gate");
  };

  // ── Guards ───────────────────────────────────────────────────
  if (authState === "loading") return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center">
      <Shield size={40} className="text-ink-500 animate-pulse" />
    </div>
  );
  if (authState === "setup") return (
    <SetPasswordScreen onDone={(pass) => {
      setCorrectPassword(pass);
      sessionStorage.setItem("admin_auth", "true");
      setAuthState("authed");
      loadData();
    }} />
  );
  if (authState === "gate") return (
    <AdminLoginGate correctPassword={correctPassword}
      onSuccess={() => { setAuthState("authed"); loadData(); }} />
  );
  if (loading) return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center">
      <div className="text-center">
        <Shield size={40} className="text-ink-500 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-400">Loading admin panel...</p>
      </div>
    </div>
  );

  // ── Derived Data ─────────────────────────────────────────────
  const allSubjects = ["all", ...Array.from(new Set(
    notes.map((n) => n.subjectDisplay || n.subject).filter(Boolean)
  ))];

  const filteredNotes = notes.filter((n) => {
    const matchSearch = !noteSearch ||
      n.title?.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.uploaderName?.toLowerCase().includes(noteSearch.toLowerCase()) ||
      (n.subjectDisplay || n.subject)?.toLowerCase().includes(noteSearch.toLowerCase());
    const matchSubject = subjectFilter === "all" ||
      (n.subjectDisplay || n.subject) === subjectFilter;
    return matchSearch && matchSubject;
  });

  const filteredUsers = users.filter((u) =>
    !userSearch ||
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.uniqueId?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const getUserNotes = (userId) => notes.filter((n) => n.userId === userId);
  const getUserDownloads = (userId) =>
    getUserNotes(userId).reduce((s, n) => s + (n.downloadCount || 0), 0);

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
              <p className="text-xs text-gray-500">{currentUser?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full">
              ADMIN ACCESS
            </span>
            <button onClick={handleLockPanel}
              className="text-xs text-gray-500 hover:text-white border border-surface-border px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <Lock size={12} /> Lock Panel
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={Users}    label="Total Users"     value={stats?.totalUsers || 0}     color="bg-ink-500" />
          <StatCard icon={FileText} label="Total Notes"     value={stats?.totalNotes || 0}     color="bg-teal-600" />
          <StatCard icon={Download} label="Total Downloads" value={stats?.totalDownloads || 0} color="bg-violet-600" />
          <StatCard icon={Star}     label="Rated Notes"     value={stats?.totalRatings || 0}   color="bg-amber-600" />
          <StatCard icon={Ban}      label="Blocked Users"   value={stats?.blockedUsers || 0}   color="bg-red-600" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-card border border-surface-border rounded-xl p-1 mb-6 w-fit">
          {[{ key: "overview", label: "All Notes" }, { key: "users", label: "All Users" }].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? "bg-ink-500 text-white" : "text-gray-500 hover:text-white"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── NOTES TAB ── */}
        {activeTab === "overview" && (
          <div>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)}
                  placeholder="Search notes, users, subjects..."
                  className="w-full bg-surface-card border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 transition-all" />
              </div>
              <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}
                className="bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-ink-500">
                {allSubjects.map((s) => (
                  <option key={s} value={s}>{s === "all" ? "All Subjects" : s}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-600 mb-3">{filteredNotes.length} notes</p>
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
                <div className="text-center py-12 text-gray-500 text-sm">No notes found</div>
              ) : filteredNotes.map((note, idx) => {
                const ft = getFileTypeLabel(note.fileType);
                return (
                  <div key={note.id}
                    className={`grid grid-cols-12 px-4 py-3.5 items-center hover:bg-surface-hover transition-colors ${idx !== filteredNotes.length - 1 ? "border-b border-surface-border" : ""}`}>
                    <div className="col-span-4 flex items-center gap-2 min-w-0">
                      <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${ft.color}`}>{ft.label}</span>
                      <p className="text-sm text-white truncate">{note.title}</p>
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
                      <span className="text-xs text-teal-400">{note.downloadCount || 0}</span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600">{formatDate(note.createdAt)}</p>
                    </div>
                    <div className="col-span-1 flex justify-center gap-1">
                      <a href={note.fileURL} target="_blank" rel="noreferrer"
                        className="p-1.5 text-gray-600 hover:text-ink-400 rounded-lg transition-all" title="View file">
                        <ExternalLink size={13} />
                      </a>
                      <button onClick={() => setDeleteTarget({ type: "note", data: note })}
                        className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div>
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
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
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>

              {filteredUsers.map((user, idx) => (
                <React.Fragment key={user.id}>
                  <div className={`grid grid-cols-12 px-4 py-3.5 items-center hover:bg-surface-hover transition-colors ${idx !== filteredUsers.length - 1 || expandedUser === user.id ? "border-b border-surface-border" : ""}`}>
                    <div className="col-span-3 flex items-center gap-2 cursor-pointer"
                      onClick={() => setProfileUser(user)}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: user.avatarColor || "#3a5aff" }}>
                        {user.photoURL
                          ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                          : user.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate hover:text-ink-300 transition-colors">
                          {user.username}
                        </p>
                        {user.isBlocked && (
                          <span className="text-xs text-red-400 flex items-center gap-0.5">
                            <Ban size={9} /> blocked
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-3"><p className="text-xs text-gray-500 truncate">{user.email}</p></div>
                    <div className="col-span-2"><span className="text-xs font-mono text-gray-500">{user.uniqueId}</span></div>
                    <div className="col-span-1 text-center">
                      <span className="text-xs text-ink-400 font-semibold">{getUserNotes(user.id).length}</span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-xs text-teal-400">{getUserDownloads(user.id)}</span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${user.profileVisibility === "public" ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-500"}`}>
                        {user.profileVisibility || "public"}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-center items-center gap-1">
                      <button onClick={() => setProfileUser(user)} title="View profile"
                        className="p-1.5 text-gray-600 hover:text-ink-400 hover:bg-ink-400/10 rounded-lg transition-all">
                        <Eye size={13} />
                      </button>
                      {user.isBlocked ? (
                        <button onClick={() => handleUnblock(user)} title="Unblock user"
                          className="p-1.5 text-gray-600 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-all">
                          <UserCheck size={13} />
                        </button>
                      ) : (
                        <button onClick={() => handleBlock(user)} title="Block user"
                          className="p-1.5 text-gray-600 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all">
                          <Ban size={13} />
                        </button>
                      )}
                      <button onClick={() => { setDeleteTarget({ type: "user", data: user }); setDeleteConfirmText(""); }} title="Delete user"
                        className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── User Profile Modal ── */}
      {profileUser && (
        <UserProfileModal
          user={profileUser}
          userNotes={getUserNotes(profileUser.id)}
          onClose={() => setProfileUser(null)}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onDeleteNote={(note) => setDeleteTarget({ type: "note", data: note })}
          onDeleteUser={(user) => { setDeleteTarget({ type: "user", data: user }); setDeleteConfirmText(""); }}
        />
      )}

      {/* ── Block / Unblock Confirm Modal ── */}
      {blockTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${blockTarget.action === "block" ? "bg-amber-400/10" : "bg-green-400/10"}`}>
                {blockTarget.action === "block"
                  ? <Ban size={20} className="text-amber-400" />
                  : <UserCheck size={20} className="text-green-400" />}
              </div>
              <button onClick={() => setBlockTarget(null)} className="text-gray-600 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <h3 className="text-lg font-display font-bold text-white mb-1">
              {blockTarget.action === "block" ? "Block User?" : "Unblock User?"}
            </h3>
            <p className="text-sm text-gray-400 mb-1">
              <span className="text-white font-medium">"{blockTarget.user.username}"</span>
            </p>
            <p className="text-xs text-gray-500 mb-1">{blockTarget.user.email}</p>

            {blockTarget.action === "block" ? (
              <p className="text-xs text-amber-400 mb-6 flex items-center gap-1 mt-2">
                <AlertTriangle size={11} /> Blocked user won't be able to login or access their account.
              </p>
            ) : (
              <p className="text-xs text-green-400 mb-6 flex items-center gap-1 mt-2">
                <UserCheck size={11} /> User will regain full access to their account.
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setBlockTarget(null)}
                className="flex-1 py-2.5 border border-surface-border text-gray-400 hover:text-white rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button
                onClick={blockTarget.action === "block" ? confirmBlock : confirmUnblock}
                disabled={actionLoading}
                className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${blockTarget.action === "block" ? "bg-amber-500 hover:bg-amber-400" : "bg-green-600 hover:bg-green-500"}`}>
                {actionLoading
                  ? (blockTarget.action === "block" ? "Blocking..." : "Unblocking...")
                  : (blockTarget.action === "block" ? "Yes, Block User" : "Yes, Unblock User")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-red-400/10 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <button onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }}
                className="text-gray-600 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {deleteTarget.type === "note" ? (
              <>
                <h3 className="text-lg font-display font-bold text-white mb-1">Delete Note?</h3>
                <p className="text-sm text-gray-500 mb-1">"{deleteTarget.data.title}"</p>
                <p className="text-xs text-gray-600 mb-6">
                  By {deleteTarget.data.uploaderName || deleteTarget.data.username} · {deleteTarget.data.subjectDisplay || deleteTarget.data.subject}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-display font-bold text-white mb-1">Delete User?</h3>
                <p className="text-sm text-gray-500 mb-1">"{deleteTarget.data.username}"</p>
                <p className="text-xs text-red-400 mb-2 flex items-center gap-1">
                  <AlertTriangle size={11} /> This will permanently delete ALL their notes too!
                </p>
                <p className="text-xs text-gray-600 mb-3">{deleteTarget.data.email}</p>
                <p className="text-xs text-gray-500 mb-2">
                  Type <span className="text-red-400 font-mono font-bold">DELETE</span> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-500 transition-all mb-4"
                />
              </>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }}
                className="flex-1 py-2.5 border border-surface-border text-gray-400 hover:text-white rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button
                onClick={deleteTarget.type === "note" ? handleDeleteNote : handleDeleteUser}
                disabled={actionLoading || (deleteTarget.type === "user" && deleteConfirmText !== "DELETE")}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {actionLoading ? "Deleting..." : deleteTarget.type === "note" ? "Delete Note" : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;