// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Globe, Copy, ArrowLeft, FileText, Download, Star, Calendar, CheckCheck, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getUserById } from "../services/userService";
import { getNotesByUser } from "../services/notesService";
import { updateProfileVisibility, updateUserBio, uploadProfilePhoto, updateAvatarColor } from "../services/userService";
import NoteCard from "../components/notes/NoteCard";
import { ProfileSkeleton, NoteCardSkeleton } from "../components/ui/LoadingSkeleton";
import { formatDate } from "../utils/helpers";
import toast from "react-hot-toast";

const AVATAR_COLORS = [
  "#3a5aff","#10b981","#f59e0b","#ef4444","#8b5cf6",
  "#06b6d4","#ec4899","#f97316","#14b8a6","#6366f1",
];

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile: myProfile, refreshProfile } = useAuth();
  const isOwner = currentUser?.uid === userId;
  const fileInputRef = useRef(null);

  const [profile, setProfile]             = useState(null);
  const [notes, setNotes]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [notesLoading, setNotesLoading]   = useState(true);
  const [idCopied, setIdCopied]           = useState(false);
  const [editingBio, setEditingBio]       = useState(false);
  const [bioText, setBioText]             = useState("");
  const [savingBio, setSavingBio]         = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [unitFilter, setUnitFilter]       = useState("all");

  useEffect(() => { loadProfile(); }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    const result = await getUserById(userId);
    if (!result.success) { toast.error("User not found"); navigate("/"); return; }
    const data = result.data;
    if (!isOwner && data.profileVisibility === "private") {
      setProfile({ ...data, isPrivate: true }); setLoading(false); return;
    }
    setProfile(data); setBioText(data.bio || ""); setLoading(false);
    setNotesLoading(true);
    const notesResult = await getNotesByUser(userId);
    if (notesResult.success) setNotes(notesResult.data);
    setNotesLoading(false);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(profile.uniqueId);
    setIdCopied(true); setTimeout(() => setIdCopied(false), 2000);
    toast.success("Unique ID copied!");
  };

  const handleVisibilityToggle = async () => {
    const newV = profile.profileVisibility === "public" ? "private" : "public";
    const result = await updateProfileVisibility(userId, newV);
    if (result.success) { setProfile((p) => ({ ...p, profileVisibility: newV })); await refreshProfile(); toast.success(`Profile set to ${newV}`); }
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    const result = await updateUserBio(userId, bioText);
    if (result.success) { setProfile((p) => ({ ...p, bio: bioText })); setEditingBio(false); toast.success("Bio updated!"); }
    setSavingBio(false);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image too large! Max 5MB"); return; }
    setUploadingPhoto(true);
    const result = await uploadProfilePhoto(userId, file);
    setUploadingPhoto(false);
    if (result.success) { setProfile((p) => ({ ...p, photoURL: result.photoURL, avatarColor: null })); await refreshProfile(); toast.success("Profile photo updated! ✅"); }
    else toast.error("Upload failed. Try again.");
  };

  const handleColorChange = async (color) => {
    const result = await updateAvatarColor(userId, color);
    if (result.success) { setProfile((p) => ({ ...p, avatarColor: color, photoURL: null })); await refreshProfile(); setShowColorPicker(false); toast.success("Avatar color updated!"); }
  };

  const totalDownloads = notes.reduce((sum, n) => sum + (n.downloadCount || 0), 0);
  const avgRating = notes.filter((n) => n.ratingCount > 0).length > 0
    ? (notes.reduce((sum, n) => sum + (n.rating || 0), 0) / notes.filter((n) => n.ratingCount > 0).length).toFixed(1)
    : "—";

  const allSubjects = ["all", ...Array.from(new Set(notes.map((n) => n.subjectDisplay || n.subject).filter(Boolean)))];
  const subjectFiltered = notes.filter((n) => subjectFilter === "all" || (n.subjectDisplay || n.subject) === subjectFilter);
  const allUnits = ["all", ...Array.from(new Set(
    subjectFiltered.map((n) => { const m = n.title?.toLowerCase().match(/unit\s*(\d+)/); return m ? `unit ${m[1]}` : null; }).filter(Boolean)
  )).sort()];
  const filteredNotes = subjectFiltered.filter((n) => {
    if (unitFilter === "all") return true;
    const m = n.title?.toLowerCase().match(/unit\s*(\d+)/);
    return m ? `unit ${m[1]}` === unitFilter : false;
  });
  const handleSubjectChange = (s) => { setSubjectFilter(s); setUnitFilter("all"); };

  if (loading) return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10"><ProfileSkeleton /></div>;

  if (!isOwner && profile?.isPrivate) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-8 transition-colors"><ArrowLeft size={16} /> Back</button>
        <div className="bg-surface-card border border-surface-border rounded-2xl p-12">
          <Lock size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Anonymous</h2>
          <p className="text-gray-500 text-sm">This profile is private.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={e => e.currentTarget.style.color = "white"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile Header */}
      <div className="rounded-2xl p-6 mb-8"
        style={{ background: "linear-gradient(145deg, rgba(15,18,32,0.8), rgba(10,12,20,0.7))", border: "1px solid rgba(108,138,255,0.12)", backdropFilter: "blur(24px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
        <div className="flex flex-col sm:flex-row items-start gap-5">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold font-display overflow-hidden"
              style={{ backgroundColor: profile?.avatarColor || "#3a5aff", boxShadow: `0 0 24px ${profile?.avatarColor || "#3a5aff"}40` }}>
              {profile?.photoURL
                ? <img src={profile.photoURL} alt="avatar" className="w-full h-full object-cover" />
                : profile?.username?.[0]?.toUpperCase()}
            </div>
            {isOwner && (
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "linear-gradient(135deg, #6c8aff, #a78bfa)", boxShadow: "0 2px 8px rgba(108,138,255,0.4)" }}
                title="Change photo">
                {uploadingPhoto
                  ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  : <Camera size={13} className="text-white" />}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            {isOwner && showColorPicker && (
              <div className="absolute top-24 left-0 rounded-2xl p-3 z-50"
                style={{ background: "rgba(10,12,20,0.95)", border: "1px solid rgba(108,138,255,0.2)", boxShadow: "0 16px 48px rgba(0,0,0,0.6)", backdropFilter: "blur(20px)" }}>
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Pick avatar color</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {AVATAR_COLORS.map((color) => (
                    <button key={color} onClick={() => handleColorChange(color)}
                      className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                      style={{ backgroundColor: color, borderColor: profile?.avatarColor === color ? "white" : "transparent" }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-display font-bold text-white">{profile?.username}</h1>
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl font-semibold"
                style={{
                  background: profile?.profileVisibility === "public" ? "rgba(74,222,128,0.1)" : "rgba(107,114,128,0.1)",
                  border: `1px solid ${profile?.profileVisibility === "public" ? "rgba(74,222,128,0.25)" : "rgba(107,114,128,0.2)"}`,
                  color: profile?.profileVisibility === "public" ? "#4ade80" : "#9ca3af",
                }}>
                {profile?.profileVisibility === "public" ? <Globe size={11} /> : <Lock size={11} />}
                {profile?.profileVisibility}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono px-2.5 py-1 rounded-xl"
                style={{ background: "rgba(108,138,255,0.08)", border: "1px solid rgba(108,138,255,0.15)", color: "rgba(108,138,255,0.8)" }}>
                {profile?.uniqueId}
              </span>
              <button onClick={handleCopyId} className="p-1 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(108,138,255,0.9)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                {idCopied ? <CheckCheck size={14} style={{ color: "#4ade80" }} /> : <Copy size={14} />}
              </button>
            </div>

            {/* Bio */}
            {isOwner && editingBio ? (
              <div className="flex gap-2 mt-2">
                <input value={bioText} onChange={(e) => setBioText(e.target.value)} maxLength={150}
                  placeholder="Write a short bio..."
                  className="flex-1 rounded-xl px-3 py-1.5 text-sm text-white placeholder-gray-600 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(108,138,255,0.2)" }} />
                <button onClick={handleSaveBio} disabled={savingBio}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #6c8aff, #a78bfa)" }}>
                  {savingBio ? "Saving..." : "Save"}
                </button>
                <button onClick={() => { setEditingBio(false); setBioText(profile?.bio || ""); }}
                  className="px-3 py-1.5 rounded-xl text-xs transition-colors"
                  style={{ color: "var(--text-muted)" }}>Cancel</button>
              </div>
            ) : (
              <p className="text-sm transition-colors"
                style={{ color: "var(--text-secondary)", cursor: isOwner ? "pointer" : "default" }}
                onClick={() => isOwner && setEditingBio(true)}>
                {profile?.bio || (isOwner ? "Click to add a bio..." : "No bio yet.")}
              </p>
            )}

            {isOwner && (
              <button onClick={() => setShowColorPicker(!showColorPicker)}
                className="mt-2 text-xs underline transition-colors"
                style={{ color: "var(--text-muted)" }}>
                Change avatar color
              </button>
            )}

            <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <Calendar size={11} style={{ color: "rgba(108,138,255,0.6)" }} />
              Joined {formatDate(profile?.createdAt)}
            </p>
          </div>

          {/* Owner controls */}
          {isOwner && (
            <button onClick={handleVisibilityToggle}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(108,138,255,0.3)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
              {profile?.profileVisibility === "public" ? <><Lock size={14} /> Make Private</> : <><Globe size={14} /> Make Public</>}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5"
          style={{ borderTop: "1px solid rgba(108,138,255,0.08)" }}>
          {[
            { icon: FileText, label: "Notes",     value: notes.length,    color: "#6c8aff" },
            { icon: Download, label: "Downloads", value: totalDownloads,  color: "#2dd4bf" },
            { icon: Star,     label: "Avg Rating",value: avgRating,       color: "#fbbf24" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="text-center p-3 rounded-xl transition-all"
              style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
              <Icon size={16} className="mx-auto mb-1.5" style={{ color }} />
              <div className="text-lg font-display font-bold text-white">{value}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <h2 className="text-lg font-display font-semibold text-white mb-5">Uploaded Notes</h2>

        {/* ── Subject Filter — NEW UI ── */}
        {allSubjects.length > 2 && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-mono mr-1" style={{ color: "var(--text-muted)" }}>Subject:</span>
            {allSubjects.map((s) => (
              <button key={s} onClick={() => handleSubjectChange(s)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{
                  background: subjectFilter === s ? "linear-gradient(135deg, rgba(108,138,255,0.25), rgba(167,139,250,0.15))" : "rgba(255,255,255,0.04)",
                  border: subjectFilter === s ? "1px solid rgba(108,138,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
                  color: subjectFilter === s ? "white" : "var(--text-muted)",
                  boxShadow: subjectFilter === s ? "0 2px 8px rgba(108,138,255,0.15)" : "none",
                }}>
                {s === "all" ? "All Subjects" : s}
              </button>
            ))}
          </div>
        )}

        {/* ── Unit Filter — NEW UI ── */}
        {allUnits.length > 2 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-xs font-mono mr-1" style={{ color: "var(--text-muted)" }}>Unit:</span>
            {allUnits.map((u) => (
              <button key={u} onClick={() => setUnitFilter(u)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 capitalize"
                style={{
                  background: unitFilter === u ? "linear-gradient(135deg, rgba(45,212,191,0.2), rgba(45,212,191,0.1))" : "rgba(255,255,255,0.04)",
                  border: unitFilter === u ? "1px solid rgba(45,212,191,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  color: unitFilter === u ? "rgba(45,212,191,0.95)" : "var(--text-muted)",
                  boxShadow: unitFilter === u ? "0 2px 8px rgba(45,212,191,0.15)" : "none",
                }}>
                {u === "all" ? "All Units" : u.replace("unit ", "Unit ")}
              </button>
            ))}
          </div>
        )}

        {notesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <NoteCardSkeleton key={i} />)}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16 rounded-2xl"
            style={{ background: "rgba(15,18,32,0.6)", border: "1px solid rgba(108,138,255,0.08)", backdropFilter: "blur(16px)" }}>
            <FileText size={36} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-secondary)" }}>No notes found.</p>
            {isOwner && (
              <button onClick={() => navigate("/upload")}
                className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "rgba(108,138,255,0.15)", border: "1px solid rgba(108,138,255,0.3)", color: "rgba(108,138,255,0.9)" }}>
                Upload your first note →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredNotes.map((note) => <NoteCard key={note.id} note={note} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
