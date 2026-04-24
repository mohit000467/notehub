// src/pages/AdminDashboard.jsx — Ultra Aesthetic Glassmorphic + 3D Animations
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, FileText, Download, Star, Trash2, AlertTriangle,
  Search, Shield, X, Eye, EyeOff,
  Lock, Settings, CheckCircle, Ban, UserCheck, UserX, ExternalLink, Clock, Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getAllUsers, getAllNotes, adminDeleteNote, adminDeleteUser,
  adminBlockUser, adminUnblockUser,
  getPlatformStats, isAdminUser, ADMIN_EMAIL,
  getAdminPassword, setAdminPassword,
  getLockedUsers, adminUnlockLoginUser,
} from "../services/adminService";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import { formatDate, getFileTypeLabel } from "../utils/helpers";
import toast from "react-hot-toast";

// ------------------------------------------------------------------
// Helper: Format lock time remaining
// ------------------------------------------------------------------
const formatTimeLeft = (ms) => {
  if (ms <= 0) return "0s";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

// ------------------------------------------------------------------
// 3D Tilt Stat Card (replaces old StatCard with glass + 3D)
// ------------------------------------------------------------------
const TiltStatCard = ({ icon: Icon, label, value, gradientFrom, gradientTo }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateY(((x - centerX) / centerX) * 6);
    setRotateX(((centerY - y) / centerY) * 6);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-2xl p-5 flex items-center gap-4 overflow-hidden transition-all duration-200 group"
      style={{
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`,
        background: `linear-gradient(135deg, rgba(15,25,45,0.85), rgba(10,15,30,0.75))`,
        backdropFilter: "blur(16px) saturate(180%)",
        border: "1px solid rgba(108,138,255,0.2)",
        boxShadow: "0 12px 28px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        willChange: "transform",
      }}
    >
      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 30% 40%, ${gradientFrom}40, transparent 70%)`,
        }}
      />
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg`}
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          boxShadow: `0 4px 12px ${gradientFrom}40`,
        }}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div className="relative z-10">
        <p className="text-2xl font-display font-bold text-white tracking-tight">{value}</p>
        <p className="text-xs text-gray-300 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// SetPasswordScreen (glassy version)
// ------------------------------------------------------------------
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-black/60 to-purple-950/40 animate-pulse-slow" />
      <div className="w-full max-w-sm bg-black/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Shield size={28} className="text-blue-400" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white text-center mb-1">Set Admin Password</h1>
        <p className="text-xs text-gray-300 text-center mb-2 font-mono">{ADMIN_EMAIL}</p>
        <p className="text-xs text-gray-400 text-center mb-6">First time setup — separate from your Firebase login.</p>
        <form onSubmit={handleSet} className="space-y-5">
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={show ? "text" : "password"}
              value={newPass}
              onChange={(e) => { setNewPass(e.target.value); setError(""); }}
              placeholder="New admin password"
              autoFocus
              className="w-full bg-white/5 border border-white/20 rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={show ? "text" : "password"}
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Confirm password"
              className="w-full bg-white/5 border border-white/20 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-all"
            />
          </div>
          {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle size={12} />{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-60 shadow-lg"
          >
            {loading ? "Saving..." : "Set Password & Enter"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// AdminLoginGate (glassy + animated)
// ------------------------------------------------------------------
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
      toast.success("Firebase reset link sent! 📧");
    } catch {
      toast.error("Failed to send reset email.");
    }
    setForgotLoading(false);
  };

  const handleChangeAdminPass = async (e) => {
    e.preventDefault();
    if (newPass.length < 6) { setChangeError("Min 6 characters"); return; }
    if (newPass !== confirmNewPass) { setChangeError("Passwords don't match"); return; }
    setChangeLoading(true);
    const result = await setAdminPassword(newPass);
    setChangeLoading(false);
    if (result.success) {
      toast.success("Password updated! 🔐");
      setShowChangePass(false);
      setNewPass("");
      setConfirmNewPass("");
      setChangeError("");
      window.location.reload();
    } else setChangeError("Failed. Try again.");
  };

  if (showChangePass) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-black/60 to-purple-950/40" />
        <div className="w-full max-w-sm bg-black/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-8">
          <button onClick={() => setShowChangePass(false)} className="text-xs text-gray-300 hover:text-white mb-6 flex items-center gap-1 transition-colors">← Back</button>
          <h1 className="text-xl font-bold text-white mb-4">Change Admin Password</h1>
          <form onSubmit={handleChangeAdminPass} className="space-y-4">
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={show ? "text" : "password"}
                value={newPass}
                onChange={(e) => { setNewPass(e.target.value); setChangeError(""); }}
                placeholder="New password"
                autoFocus
                className="w-full bg-white/5 border border-white/20 rounded-xl pl-9 pr-10 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={show ? "text" : "password"}
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-white/5 border border-white/20 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
            {changeError && <p className="text-xs text-red-400">{changeError}</p>}
            <button type="submit" disabled={changeLoading} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-semibold transition-all hover:scale-105">
              {changeLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-black/60 to-purple-950/40 animate-pulse-slow" />
      <div className="w-full max-w-sm bg-black/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Shield size={28} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-1">Admin Access</h1>
        <p className="text-xs text-gray-300 text-center mb-6 font-mono">{ADMIN_EMAIL}</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter admin panel password"
              autoFocus
              className="w-full bg-white/5 border border-white/20 rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-all"
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg">
            Access Admin Panel
          </button>
        </form>
        <div className="mt-6 pt-4 border-t border-white/20 flex flex-col gap-2">
          <button onClick={() => setShowChangePass(true)} className="flex items-center justify-center gap-2 text-xs text-gray-300 hover:text-blue-400 transition-colors">
            <Settings size={12} /> Change admin panel password
          </button>
          {forgotSent ? (
            <p className="text-xs text-green-400 text-center flex items-center justify-center gap-1"><CheckCircle size={12} /> Reset link sent!</p>
          ) : (
            <button onClick={handleForgotPassword} disabled={forgotLoading} className="text-xs text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50 text-center">
              {forgotLoading ? "Sending..." : "Forgot Firebase login password?"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// LockedUserRow (animated countdown, glassy row)
// ------------------------------------------------------------------
const LockedUserRow = ({ lockedUser, onUnlock }) => {
  const [remaining, setRemaining] = useState(lockedUser.remaining);
  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => setRemaining((prev) => Math.max(prev - 1000, 0)), 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  return (
    <div className="grid grid-cols-12 px-4 py-3.5 items-center transition-all hover:bg-white/5 border-b border-white/10 last:border-0">
      <div className="col-span-5"><p className="text-sm text-white font-mono">{lockedUser.email}</p></div>
      <div className="col-span-2 text-center"><span className="text-xs font-bold text-red-400">{lockedUser.attempts}</span><p className="text-xs text-gray-400">attempts</p></div>
      <div className="col-span-3">
        <div className="flex items-center gap-1.5"><Clock size={12} className="text-amber-400" /><span className="text-sm font-mono text-amber-400 font-bold">{remaining > 0 ? formatTimeLeft(remaining) : "Expired"}</span></div>
        <p className="text-xs text-gray-500 mt-0.5">remaining</p>
      </div>
      <div className="col-span-2 flex justify-end">
        <button onClick={() => onUnlock(lockedUser)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium transition-all hover:scale-105">
          <UserCheck size={12} /> Unlock Now
        </button>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// UserProfileModal (glassmorphic modal)
// ------------------------------------------------------------------
const UserProfileModal = ({ user, userNotes, onClose, onBlock, onUnblock, onDeleteNote, onDeleteUser }) => {
  const totalDL = userNotes.reduce((s, n) => s + (n.downloadCount || 0), 0);
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold overflow-hidden" style={{ backgroundColor: user.avatarColor || "#3a5aff" }}>
              {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : user.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white">{user.username}</h2>
                {user.isBlocked && <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/20 rounded-full">🔨 Blocked</span>}
              </div>
              <p className="text-sm text-gray-300">{user.email}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{user.uniqueId}</p>
              <div className="flex items-center gap-1.5 mt-2"><Calendar size={12} className="text-blue-400" /><span className="text-xs text-gray-400">Joined: {user.createdAt ? formatDate(user.createdAt) : "—"}</span></div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/10">
          <div className="bg-white/5 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-white">{userNotes.length}</p><p className="text-xs text-gray-400">Notes Uploaded</p></div>
          <div className="bg-white/5 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-cyan-400">{totalDL}</p><p className="text-xs text-gray-400">Total Downloads</p></div>
          <div className="bg-white/5 rounded-xl p-4 text-center"><span className={`text-sm px-3 py-1 rounded-full ${user.profileVisibility === "public" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>{user.profileVisibility || "public"}</span><p className="text-xs text-gray-400 mt-2">Profile Status</p></div>
        </div>
        {/* Bio */}
        {user.bio && <div className="px-6 pt-4"><p className="text-xs text-gray-400 uppercase">Bio</p><p className="text-sm text-gray-300">{user.bio}</p></div>}
        {/* Notes list */}
        <div className="p-6">
          <p className="text-xs text-gray-400 mb-3 uppercase">Uploaded Notes ({userNotes.length})</p>
          {userNotes.length === 0 ? <p className="text-sm text-gray-500 italic">No notes uploaded.</p> : (
            <div className="space-y-2">
              {userNotes.map((note) => {
                const ft = getFileTypeLabel(note.fileType);
                return (
                  <div key={note.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${ft.color}`}>{ft.label}</span>
                      <div><p className="text-sm text-white truncate">{note.title}</p><p className="text-xs text-gray-500">{note.subjectDisplay || note.subject} · {formatDate(note.createdAt)}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-cyan-400">{note.downloadCount || 0} DL</span>
                      <a href={note.fileURL} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-blue-400 rounded-lg"><ExternalLink size={13} /></a>
                      <button onClick={() => onDeleteNote(note)} className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg"><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Actions */}
        <div className="px-6 pb-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
          {user.isBlocked ? (
            <button onClick={() => onUnblock(user)} className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-sm font-medium transition-all hover:scale-105">
              <UserCheck size={15} /> Unblock User
            </button>
          ) : (
            <button onClick={() => onBlock(user)} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-medium transition-all hover:scale-105">
              <Ban size={15} /> Block User
            </button>
          )}
          <button onClick={() => onDeleteUser(user)} className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition-all hover:scale-105">
            <UserX size={15} /> Delete User & Notes
          </button>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// Main AdminDashboard (fully aesthetic)
// ------------------------------------------------------------------
const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState("loading");
  const [correctPassword, setCorrectPassword] = useState("");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [lockedUsers, setLockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [noteSearch, setNoteSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [blockTarget, setBlockTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);

  // All original logic (unchanged)
  useEffect(() => {
    if (!currentUser) { navigate("/login"); return; }
    if (!isAdminUser(currentUser.email)) { toast.error("Access denied"); navigate("/"); return; }
    checkPassword();
  }, [currentUser]);

  const checkPassword = async () => {
    const result = await getAdminPassword();
    if (result.notSet) setAuthState("setup");
    else if (result.success) {
      setCorrectPassword(result.password);
      const alreadyAuthed = sessionStorage.getItem("admin_auth") === "true";
      setAuthState(alreadyAuthed ? "authed" : "gate");
      if (alreadyAuthed) loadData();
    } else setAuthState("gate");
  };

  const loadData = async () => {
    setLoading(true);
    const [statsRes, usersRes, notesRes, lockedRes] = await Promise.all([
      getPlatformStats(), getAllUsers(), getAllNotes(), getLockedUsers(),
    ]);
    if (statsRes.success) setStats(statsRes.data);
    if (usersRes.success) setUsers(usersRes.data);
    if (notesRes.success) setNotes(notesRes.data);
    if (lockedRes.success) setLockedUsers(lockedRes.data);
    setLoading(false);
  };

  const handleDeleteNote = async () => {
    if (!deleteTarget || deleteTarget.type !== "note") return;
    setActionLoading(true);
    const result = await adminDeleteNote(deleteTarget.data.id);
    setActionLoading(false);
    if (result.success) { setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.data.id)); toast.success("Note deleted ✅"); }
    else toast.error(result.error || "Delete failed");
    setDeleteTarget(null); setDeleteConfirmText("");
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget || deleteTarget.type !== "user" || deleteConfirmText !== "DELETE") return;
    setActionLoading(true);
    const result = await adminDeleteUser(deleteTarget.data.id);
    setActionLoading(false);
    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.data.id));
      setNotes((prev) => prev.filter((n) => n.userId !== deleteTarget.data.id));
      setProfileUser(null);
      toast.success(`User "${deleteTarget.data.username}" deleted ✅`);
    } else toast.error(result.error || "Delete failed");
    setDeleteTarget(null); setDeleteConfirmText("");
  };

  const confirmBlock = async () => {
    if (!blockTarget) return;
    setActionLoading(true);
    const result = await adminBlockUser(blockTarget.user.id);
    setActionLoading(false);
    if (result.success) {
      setUsers((prev) => prev.map((u) => u.id === blockTarget.user.id ? { ...u, isBlocked: true } : u));
      if (profileUser?.id === blockTarget.user.id) setProfileUser((p) => ({ ...p, isBlocked: true }));
      setStats((prev) => ({ ...prev, blockedUsers: (prev?.blockedUsers || 0) + 1 }));
      toast.success(`"${blockTarget.user.username}" blocked 🚫`);
    } else toast.error("Block failed");
    setBlockTarget(null);
  };

  const confirmUnblock = async () => {
    if (!blockTarget) return;
    setActionLoading(true);
    const result = await adminUnblockUser(blockTarget.user.id);
    setActionLoading(false);
    if (result.success) {
      setUsers((prev) => prev.map((u) => u.id === blockTarget.user.id ? { ...u, isBlocked: false } : u));
      if (profileUser?.id === blockTarget.user.id) setProfileUser((p) => ({ ...p, isBlocked: false }));
      setStats((prev) => ({ ...prev, blockedUsers: Math.max((prev?.blockedUsers || 0) - 1, 0) }));
      toast.success(`"${blockTarget.user.username}" unblocked ✅`);
    } else toast.error("Unblock failed");
    setBlockTarget(null);
  };

  const handleUnlockLoginUser = async (lockedUser) => {
    setActionLoading(true);
    const result = await adminUnlockLoginUser(lockedUser.id);
    setActionLoading(false);
    if (result.success) {
      setLockedUsers((prev) => prev.filter((u) => u.id !== lockedUser.id));
      setStats((prev) => ({ ...prev, loginLockedUsers: Math.max((prev?.loginLockedUsers || 0) - 1, 0) }));
      toast.success(`Login lock removed ✅`);
    } else toast.error("Unlock failed");
  };

  const handleBlock = (user) => setBlockTarget({ action: "block", user });
  const handleUnblock = (user) => setBlockTarget({ action: "unblock", user });
  const handleLockPanel = () => { sessionStorage.removeItem("admin_auth"); setAuthState("gate"); };

  if (authState === "loading") return <div className="min-h-screen flex items-center justify-center"><Shield size={48} className="text-blue-500 animate-pulse" /></div>;
  if (authState === "setup") return <SetPasswordScreen onDone={(pass) => { setCorrectPassword(pass); sessionStorage.setItem("admin_auth", "true"); setAuthState("authed"); loadData(); }} />;
  if (authState === "gate") return <AdminLoginGate correctPassword={correctPassword} onSuccess={() => { setAuthState("authed"); loadData(); }} />;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><Shield size={48} className="text-blue-500 mx-auto mb-4 animate-pulse" /><p className="text-gray-400">Loading admin panel...</p></div></div>;

  const allSubjects = ["all", ...Array.from(new Set(notes.map((n) => n.subjectDisplay || n.subject).filter(Boolean)))];
  const filteredNotes = notes.filter((n) => {
    const matchSearch = !noteSearch || n.title?.toLowerCase().includes(noteSearch.toLowerCase()) || n.uploaderName?.toLowerCase().includes(noteSearch.toLowerCase()) || (n.subjectDisplay || n.subject)?.toLowerCase().includes(noteSearch.toLowerCase());
    const matchSubject = subjectFilter === "all" || (n.subjectDisplay || n.subject) === subjectFilter;
    return matchSearch && matchSubject;
  });
  const filteredUsers = users.filter((u) => !userSearch || u.username?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.uniqueId?.toLowerCase().includes(userSearch.toLowerCase()));
  const getUserNotes = (userId) => notes.filter((n) => n.userId === userId);
  const getUserDownloads = (userId) => getUserNotes(userId).reduce((s, n) => s + (n.downloadCount || 0), 0);

  const tabs = [
    { key: "overview", label: "All Notes" },
    { key: "users", label: "All Users" },
    { key: "locked", label: `Login Locked${lockedUsers.length > 0 ? ` (${lockedUsers.length})` : ""}` },
  ];

  // Main render with immersive glass background
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-blue-950" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-500/20 blur-xl"
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticle ${Math.random() * 20 + 15}s infinite ease-in-out`,
              opacity: 0.1 + Math.random() * 0.2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header with glassmorphism */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg animate-float">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">Admin Panel</h1>
              <p className="text-xs text-gray-300">{currentUser?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-full backdrop-blur-sm">ADMIN ACCESS</span>
            <button onClick={handleLockPanel} className="flex items-center gap-1 text-xs text-gray-300 hover:text-white border border-white/20 px-3 py-1.5 rounded-lg transition-all hover:scale-105">
              <Lock size={12} /> Lock Panel
            </button>
          </div>
        </div>

        {/* 3D Tilt Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <TiltStatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} gradientFrom="#3b82f6" gradientTo="#8b5cf6" />
          <TiltStatCard icon={FileText} label="Total Notes" value={stats?.totalNotes || 0} gradientFrom="#14b8a6" gradientTo="#06b6d4" />
          <TiltStatCard icon={Download} label="Downloads" value={stats?.totalDownloads || 0} gradientFrom="#a855f7" gradientTo="#d946ef" />
          <TiltStatCard icon={Star} label="Rated Notes" value={stats?.totalRatings || 0} gradientFrom="#f59e0b" gradientTo="#f97316" />
          <TiltStatCard icon={Ban} label="Blocked Users" value={stats?.blockedUsers || 0} gradientFrom="#ef4444" gradientTo="#dc2626" />
          <TiltStatCard icon={Clock} label="Login Locked" value={stats?.loginLockedUsers || 0} gradientFrom="#f97316" gradientTo="#ea580c" />
        </div>

        {/* Glassy Tabs with sliding underline */}
        <div className="relative flex gap-2 bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-1 mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 z-10 ${
                activeTab === tab.key ? "text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg -z-0 shadow-lg animate-fadeIn" />
              )}
            </button>
          ))}
        </div>

        {/* NOTES TAB (glassy table) */}
        {activeTab === "overview" && (
          <div className="bg-black/30 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              >
                {allSubjects.map((s) => <option key={s} value={s}>{s === "all" ? "All Subjects" : s}</option>)}
              </select>
            </div>
            <p className="text-xs text-gray-400 mb-3">{filteredNotes.length} notes</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10">
                  <tr className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    <th className="px-3 py-3">Note</th><th>Subject</th><th>By</th><th className="text-center">DL</th><th>Date</th><th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotes.map((note, idx) => {
                    const ft = getFileTypeLabel(note.fileType);
                    return (
                      <tr key={note.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-200 ${idx % 2 === 0 ? "bg-white/5" : ""}`}>
                        <td className="px-3 py-3 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${ft.color}`}>{ft.label}</span>
                          <span className="text-sm text-white">{note.title}</span>
                        </td>
                        <td className="text-xs text-gray-300">{note.subjectDisplay || note.subject}</td>
                        <td className="text-xs text-gray-300">{note.uploaderName || note.username || "—"}</td>
                        <td className="text-center text-teal-400 text-sm">{note.downloadCount || 0}</td>
                        <td className="text-xs text-gray-400">{formatDate(note.createdAt)}</td>
                        <td className="flex justify-center gap-2">
                          <a href={note.fileURL} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"><ExternalLink size={14} /></a>
                          <button onClick={() => setDeleteTarget({ type: "note", data: note })} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS TAB (glassy table with joined column) */}
        {activeTab === "users" && (
          <div className="bg-black/30 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl">
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by username, email or ID..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-400 mb-3">{filteredUsers.length} users</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10">
                  <tr className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    <th className="px-3 py-3">User</th><th>Email</th><th>Unique ID</th><th className="text-center">Notes</th><th className="text-center">DL</th><th>Joined</th><th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => (
                    <tr key={user.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-200 ${idx % 2 === 0 ? "bg-white/5" : ""}`}>
                      <td className="px-3 py-3 flex items-center gap-2 cursor-pointer" onClick={() => setProfileUser(user)}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold overflow-hidden" style={{ backgroundColor: user.avatarColor || "#3a5aff" }}>
                          {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" alt="" /> : user.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm text-white">{user.username}</span>
                        {user.isBlocked && <span className="text-xs text-red-400 ml-1">🚫</span>}
                      </td>
                      <td className="text-xs text-gray-300">{user.email}</td>
                      <td className="font-mono text-gray-400 text-xs">{user.uniqueId}</td>
                      <td className="text-center text-blue-400">{getUserNotes(user.id).length}</td>
                      <td className="text-center text-teal-400">{getUserDownloads(user.id)}</td>
                      <td className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={11} />{user.createdAt ? formatDate(user.createdAt) : "—"}</td>
                      <td className="flex justify-center gap-2">
                        <button onClick={() => setProfileUser(user)} className="text-gray-400 hover:text-white"><Eye size={14} /></button>
                        {user.isBlocked ? (
                          <button onClick={() => handleUnblock(user)} className="text-gray-400 hover:text-green-400"><UserCheck size={14} /></button>
                        ) : (
                          <button onClick={() => handleBlock(user)} className="text-gray-400 hover:text-amber-400"><Ban size={14} /></button>
                        )}
                        <button onClick={() => { setDeleteTarget({ type: "user", data: user }); setDeleteConfirmText(""); }} className="text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LOCKED TAB */}
        {activeTab === "locked" && (
          <div className="bg-black/30 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl">
            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-xs text-amber-300">These accounts are locked due to 5+ failed login attempts. You can unlock them before the 36-hour timer expires.</p>
            </div>
            <p className="text-xs text-gray-400 mb-3">{lockedUsers.length} locked account{lockedUsers.length !== 1 ? "s" : ""}</p>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-12 px-4 py-3 border-b border-white/10 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  <div className="col-span-5">Email</div><div className="col-span-2 text-center">Attempts</div><div className="col-span-3">Time Remaining</div><div className="col-span-2 text-right">Action</div>
                </div>
                {lockedUsers.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">No login-locked accounts 🎉</div>
                ) : (
                  lockedUsers.map((lu) => <LockedUserRow key={lu.id} lockedUser={lu} onUnlock={handleUnlockLoginUser} />)
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals (profile, block, delete) - all glassy versions */}
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

      {blockTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${blockTarget.action === "block" ? "bg-amber-500/20" : "bg-green-500/20"}`}>
                {blockTarget.action === "block" ? <Ban size={20} className="text-amber-400" /> : <UserCheck size={20} className="text-green-400" />}
              </div>
              <button onClick={() => setBlockTarget(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{blockTarget.action === "block" ? "Block User?" : "Unblock User?"}</h3>
            <p className="text-sm text-gray-300 mb-1">"{blockTarget.user.username}"</p>
            <p className="text-xs text-gray-400 mb-1">{blockTarget.user.email}</p>
            {blockTarget.action === "block" ? (
              <p className="text-xs text-amber-400 mb-6 flex items-center gap-1 mt-2"><AlertTriangle size={11} /> Blocked user won't be able to login or access their account.</p>
            ) : (
              <p className="text-xs text-green-400 mb-6 flex items-center gap-1 mt-2"><UserCheck size={11} /> User will regain full access.</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setBlockTarget(null)} className="flex-1 py-2.5 border border-white/20 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-colors">Cancel</button>
              <button onClick={blockTarget.action === "block" ? confirmBlock : confirmUnblock} disabled={actionLoading}
                className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${blockTarget.action === "block" ? "bg-amber-500 hover:bg-amber-400" : "bg-green-600 hover:bg-green-500"}`}>
                {actionLoading ? "..." : blockTarget.action === "block" ? "Yes, Block" : "Yes, Unblock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center"><AlertTriangle size={20} className="text-red-400" /></div>
              <button onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            {deleteTarget.type === "note" ? (
              <>
                <h3 className="text-lg font-bold text-white mb-1">Delete Note?</h3>
                <p className="text-sm text-gray-300 mb-1">"{deleteTarget.data.title}"</p>
                <p className="text-xs text-gray-400 mb-6">By {deleteTarget.data.uploaderName || deleteTarget.data.username}</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-white mb-1">Delete User?</h3>
                <p className="text-sm text-gray-300 mb-1">"{deleteTarget.data.username}"</p>
                <p className="text-xs text-red-400 mb-2 flex items-center gap-1"><AlertTriangle size={11} /> Permanently deletes ALL their notes too!</p>
                <p className="text-xs text-gray-400 mb-3">{deleteTarget.data.email}</p>
                <p className="text-xs text-gray-400 mb-2">Type <span className="text-red-400 font-bold">DELETE</span> to confirm:</p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500 transition-all mb-4"
                />
              </>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }} className="flex-1 py-2.5 border border-white/20 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-colors">Cancel</button>
              <button onClick={deleteTarget.type === "note" ? handleDeleteNote : handleDeleteUser}
                disabled={actionLoading || (deleteTarget.type === "user" && deleteConfirmText !== "DELETE")}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40">
                {actionLoading ? "Deleting..." : deleteTarget.type === "note" ? "Delete Note" : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom keyframes */}
      <style jsx>{`
        @keyframes floatParticle {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-pulse-slow { animation: pulse 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;