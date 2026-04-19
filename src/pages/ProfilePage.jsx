// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Lock, Globe, Copy, ArrowLeft, FileText,
  Download, Star, Calendar, CheckCheck, Camera,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getUserById } from "../services/userService";
import { getNotesByUser } from "../services/notesService";
import { updateProfileVisibility, updateUserBio, uploadProfilePhoto, updateAvatarColor } from "../services/userService";
import NoteCard from "../components/notes/NoteCard";
import { ProfileSkeleton, NoteCardSkeleton } from "../components/ui/LoadingSkeleton";
import { formatDate } from "../utils/helpers";
import toast from "react-hot-toast";

// Avatar color options
const AVATAR_COLORS = [
  "#3a5aff", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#f97316", "#14b8a6", "#6366f1",
];

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile: myProfile, refreshProfile } = useAuth();
  const isOwner = currentUser?.uid === userId;
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(true);
  const [idCopied, setIdCopied] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Filters
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");

  useEffect(() => { loadProfile(); }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    const result = await getUserById(userId);
    if (!result.success) { toast.error("User not found"); navigate("/"); return; }
    const data = result.data;
    if (!isOwner && data.profileVisibility === "private") {
      setProfile({ ...data, isPrivate: true });
      setLoading(false);
      return;
    }
    setProfile(data);
    setBioText(data.bio || "");
    setLoading(false);
    setNotesLoading(true);
    const notesResult = await getNotesByUser(userId);
    if (notesResult.success) setNotes(notesResult.data);
    setNotesLoading(false);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(profile.uniqueId);
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
    toast.success("Unique ID copied!");
  };

  const handleVisibilityToggle = async () => {
    const newVisibility = profile.profileVisibility === "public" ? "private" : "public";
    const result = await updateProfileVisibility(userId, newVisibility);
    if (result.success) {
      setProfile((prev) => ({ ...prev, profileVisibility: newVisibility }));
      await refreshProfile();
      toast.success(`Profile set to ${newVisibility}`);
    }
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    const result = await updateUserBio(userId, bioText);
    if (result.success) {
      setProfile((prev) => ({ ...prev, bio: bioText }));
      setEditingBio(false);
      toast.success("Bio updated!");
    }
    setSavingBio(false);
  };

  // ── PROFILE PHOTO UPLOAD ──────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image too large! Max 5MB"); return; }
    setUploadingPhoto(true);
    const result = await uploadProfilePhoto(userId, file);
    setUploadingPhoto(false);
    if (result.success) {
      setProfile((prev) => ({ ...prev, photoURL: result.photoURL, avatarColor: null }));
      await refreshProfile();
      toast.success("Profile photo updated! ✅");
    } else {
      toast.error("Upload failed. Try again.");
    }
  };

  // ── AVATAR COLOR CHANGE ───────────────────────────────────
  const handleColorChange = async (color) => {
    const result = await updateAvatarColor(userId, color);
    if (result.success) {
      setProfile((prev) => ({ ...prev, avatarColor: color, photoURL: null }));
      await refreshProfile();
      setShowColorPicker(false);
      toast.success("Avatar color updated!");
    }
  };

  // Stats
  const totalDownloads = notes.reduce((sum, n) => sum + (n.downloadCount || 0), 0);
  const avgRating = notes.filter((n) => n.ratingCount > 0).length > 0
    ? (notes.reduce((sum, n) => sum + (n.rating || 0), 0) / notes.filter((n) => n.ratingCount > 0).length).toFixed(1)
    : "—";

  // Filters
  const allSubjects = ["all", ...Array.from(new Set(notes.map((n) => n.subjectDisplay || n.subject).filter(Boolean)))];
  const subjectFiltered = notes.filter((n) => subjectFilter === "all" || (n.subjectDisplay || n.subject) === subjectFilter);
  const allUnits = ["all", ...Array.from(new Set(
    subjectFiltered.map((n) => {
      const match = n.title?.toLowerCase().match(/unit\s*(\d+)/);
      return match ? `unit ${match[1]}` : null;
    }).filter(Boolean)
  )).sort()];
  const filteredNotes = subjectFiltered.filter((n) => {
    if (unitFilter === "all") return true;
    const match = n.title?.toLowerCase().match(/unit\s*(\d+)/);
    return match ? `unit ${match[1]}` === unitFilter : false;
  });
  const handleSubjectChange = (s) => { setSubjectFilter(s); setUnitFilter("all"); };

  if (loading) return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10"><ProfileSkeleton /></div>;

  // ── PRIVATE PROFILE (non-owner) ───────────────────────────
  if (!isOwner && profile?.isPrivate) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
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
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile Header */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">

          {/* Avatar — clickable for owner */}
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold font-display overflow-hidden"
              style={{ backgroundColor: profile?.avatarColor || "#3a5aff" }}
            >
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.username?.[0]?.toUpperCase()
              )}
            </div>

            {/* Camera button — only for owner */}
            {isOwner && (
              <div className="absolute -bottom-1 -right-1 flex gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="w-7 h-7 bg-ink-500 hover:bg-ink-400 rounded-lg flex items-center justify-center transition-colors"
                  title="Change photo"
                >
                  {uploadingPhoto ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={13} className="text-white" />
                  )}
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

            {/* Color picker */}
            {isOwner && showColorPicker && (
              <div className="absolute top-24 left-0 bg-surface-card border border-surface-border rounded-xl p-3 z-50 shadow-xl">
                <p className="text-xs text-gray-500 mb-2">Pick avatar color</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                      style={{ backgroundColor: color, borderColor: profile?.avatarColor === color ? "white" : "transparent" }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-display font-bold text-white">{profile?.username}</h1>
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                profile?.profileVisibility === "public"
                  ? "bg-accent-green/10 text-accent-green border border-accent-green/20"
                  : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
              }`}>
                {profile?.profileVisibility === "public" ? <Globe size={10} /> : <Lock size={10} />}
                {profile?.profileVisibility}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-gray-500 bg-surface-elevated border border-surface-border px-2 py-1 rounded-lg">
                {profile?.uniqueId}
              </span>
              <button onClick={handleCopyId} className="text-gray-600 hover:text-ink-400 transition-colors">
                {idCopied ? <CheckCheck size={14} className="text-accent-green" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Bio */}
            {isOwner && editingBio ? (
              <div className="flex gap-2 mt-2">
                <input value={bioText} onChange={(e) => setBioText(e.target.value)} maxLength={150}
                  placeholder="Write a short bio..."
                  className="flex-1 bg-surface-elevated border border-surface-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500" />
                <button onClick={handleSaveBio} disabled={savingBio}
                  className="px-3 py-1.5 bg-ink-500 hover:bg-ink-400 text-white text-xs font-medium rounded-lg">
                  {savingBio ? "Saving..." : "Save"}
                </button>
                <button onClick={() => { setEditingBio(false); setBioText(profile?.bio || ""); }}
                  className="px-3 py-1.5 text-gray-500 hover:text-white text-xs rounded-lg">Cancel</button>
              </div>
            ) : (
              <p className={`text-sm text-gray-500 ${isOwner ? "cursor-pointer hover:text-gray-300" : ""} transition-colors`}
                onClick={() => isOwner && setEditingBio(true)}>
                {profile?.bio || (isOwner ? "Click to add a bio..." : "No bio yet.")}
              </p>
            )}

            {/* Color picker toggle — owner only */}
            {isOwner && (
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="mt-2 text-xs text-gray-600 hover:text-gray-400 transition-colors underline"
              >
                Change avatar color
              </button>
            )}

            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
              <Calendar size={11} /> Joined {formatDate(profile?.createdAt)}
            </p>
          </div>

          {/* Owner controls */}
          {isOwner && (
            <button onClick={handleVisibilityToggle}
              className="flex items-center gap-2 px-3 py-2 bg-surface-elevated border border-surface-border hover:border-ink-600 text-sm text-gray-400 hover:text-white rounded-xl transition-all">
              {profile?.profileVisibility === "public" ? <><Lock size={14} /> Make Private</> : <><Globe size={14} /> Make Public</>}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-surface-border">
          {[
            { icon: FileText, label: "Notes", value: notes.length },
            { icon: Download, label: "Downloads", value: totalDownloads },
            { icon: Star, label: "Avg Rating", value: avgRating },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon size={16} className="text-ink-400 mx-auto mb-1" />
              <div className="text-lg font-display font-bold text-white">{value}</div>
              <div className="text-xs text-gray-600">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <h2 className="text-lg font-display font-semibold text-white mb-4">Uploaded Notes</h2>

        {/* Subject Filter */}
        {allSubjects.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs text-gray-600 self-center">Subject:</span>
            {allSubjects.map((s) => (
              <button key={s} onClick={() => handleSubjectChange(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  subjectFilter === s ? "bg-ink-500 border-ink-500 text-white" : "border-surface-border text-gray-500 hover:text-white"
                }`}>
                {s === "all" ? "All Subjects" : s}
              </button>
            ))}
          </div>
        )}

        {/* Unit Filter */}
        {allUnits.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-gray-600 self-center">Unit:</span>
            {allUnits.map((u) => (
              <button key={u} onClick={() => setUnitFilter(u)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
                  unitFilter === u ? "bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan" : "border-surface-border text-gray-500 hover:text-white"
                }`}>
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
          <div className="text-center py-16 border border-surface-border rounded-2xl bg-surface-card">
            <FileText size={36} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No notes found.</p>
            {isOwner && (
              <button onClick={() => navigate("/upload")}
                className="mt-4 px-4 py-2 bg-ink-500/20 text-ink-400 hover:text-ink-300 text-sm rounded-lg border border-ink-500/30 transition-colors">
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