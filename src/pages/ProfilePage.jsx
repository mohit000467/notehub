// src/pages/ProfilePage.jsx
// ============================================================
// User profile page - respects public/private visibility
// ============================================================

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Lock, Globe, Copy, ArrowLeft, FileText,
  Download, Star, Calendar, CheckCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getUserById } from "../services/userService";
import { getNotesByUser } from "../services/notesService";
import { updateProfileVisibility, updateUserBio } from "../services/userService";
import NoteCard from "../components/notes/NoteCard";
import { ProfileSkeleton, NoteCardSkeleton } from "../components/ui/LoadingSkeleton";
import { formatDate } from "../utils/helpers";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile: myProfile, refreshProfile } = useAuth();

  const isOwner = currentUser?.uid === userId;

  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(true);
  const [idCopied, setIdCopied] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    const result = await getUserById(userId);
    if (!result.success) {
      toast.error("User not found");
      navigate("/");
      return;
    }

    const data = result.data;

    // Check visibility for non-owners
    if (!isOwner && data.profileVisibility === "private") {
      setProfile({ ...data, isPrivate: true });
      setLoading(false);
      return;
    }

    setProfile(data);
    setBioText(data.bio || "");
    setLoading(false);

    // Load notes
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
    const newVisibility =
      profile.profileVisibility === "public" ? "private" : "public";
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

  // ── Stats ─────────────────────────────────────────────────
  const totalDownloads = notes.reduce((sum, n) => sum + (n.downloadCount || 0), 0);
  const avgRating =
    notes.filter((n) => n.ratingCount > 0).length > 0
      ? (
          notes.reduce((sum, n) => sum + (n.rating || 0), 0) /
          notes.filter((n) => n.ratingCount > 0).length
        ).toFixed(1)
      : "—";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <ProfileSkeleton />
      </div>
    );
  }

  // Private profile (non-owner view)
  if (!isOwner && profile?.isPrivate) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <Lock size={48} className="text-gray-700 mx-auto mb-4" />
        <h2 className="text-xl font-display font-bold text-white mb-2">Private Profile</h2>
        <p className="text-gray-500">This user has set their profile to private.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile Header */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold font-display flex-shrink-0"
            style={{ backgroundColor: profile?.avatarColor || "#3a5aff" }}
          >
            {profile?.username?.[0]?.toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-display font-bold text-white">
                {profile?.username}
              </h1>
              {/* Visibility badge */}
              <span
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                  profile?.profileVisibility === "public"
                    ? "bg-accent-green/10 text-accent-green border border-accent-green/20"
                    : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                }`}
              >
                {profile?.profileVisibility === "public" ? (
                  <Globe size={10} />
                ) : (
                  <Lock size={10} />
                )}
                {profile?.profileVisibility}
              </span>
            </div>

            {/* Unique ID */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-gray-500 bg-surface-elevated border border-surface-border px-2 py-1 rounded">
                {profile?.uniqueId}
              </span>
              <button
                onClick={handleCopyId}
                className="text-gray-600 hover:text-ink-400 transition-colors"
                title="Copy ID"
              >
                {idCopied ? <CheckCheck size={14} className="text-accent-green" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Bio */}
            {isOwner && editingBio ? (
              <div className="flex gap-2 mt-2">
                <input
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  maxLength={150}
                  placeholder="Write a short bio..."
                  className="flex-1 bg-surface-elevated border border-surface-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500"
                />
                <button
                  onClick={handleSaveBio}
                  disabled={savingBio}
                  className="px-3 py-1.5 bg-ink-500 hover:bg-ink-400 text-white text-xs font-medium rounded-lg"
                >
                  {savingBio ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => { setEditingBio(false); setBioText(profile?.bio || ""); }}
                  className="px-3 py-1.5 text-gray-500 hover:text-white text-xs rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p
                className={`text-sm text-gray-500 ${isOwner ? "cursor-pointer hover:text-gray-300" : ""} transition-colors`}
                onClick={() => isOwner && setEditingBio(true)}
                title={isOwner ? "Click to edit bio" : ""}
              >
                {profile?.bio || (isOwner ? "Click to add a bio..." : "No bio yet.")}
              </p>
            )}

            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
              <Calendar size={11} />
              Joined {formatDate(profile?.createdAt)}
            </p>
          </div>

          {/* Owner controls */}
          {isOwner && (
            <button
              onClick={handleVisibilityToggle}
              className="flex items-center gap-2 px-3 py-2 bg-surface-elevated border border-surface-border hover:border-ink-600 text-sm text-gray-400 hover:text-white rounded-lg transition-all"
            >
              {profile?.profileVisibility === "public" ? (
                <><Lock size={14} /> Make Private</>
              ) : (
                <><Globe size={14} /> Make Public</>
              )}
            </button>
          )}
        </div>

        {/* Stats Row */}
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
        <h2 className="text-lg font-display font-semibold text-white mb-4">
          Uploaded Notes
        </h2>

        {notesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <NoteCardSkeleton key={i} />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 border border-surface-border rounded-2xl bg-surface-card">
            <FileText size={36} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No notes uploaded yet.</p>
            {isOwner && (
              <button
                onClick={() => navigate("/upload")}
                className="mt-4 px-4 py-2 bg-ink-500/20 text-ink-400 hover:text-ink-300 text-sm rounded-lg border border-ink-500/30 transition-colors"
              >
                Upload your first note →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
