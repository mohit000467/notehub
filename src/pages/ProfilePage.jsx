// src/pages/ProfilePage.jsx — Pure Gen Z Aesthetic + Deep Glassmorphism
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Globe, Copy, ArrowLeft, FileText, Download, Star, Calendar, CheckCheck, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getUserById, updateProfileVisibility, updateUserBio, uploadProfilePhoto, updateAvatarColor } from "../services/userService";
import { getNotesByUser } from "../services/notesService";
import NoteCard from "../components/notes/NoteCard";
import { ProfileSkeleton, NoteCardSkeleton } from "../components/ui/LoadingSkeleton";
import { formatDate } from "../utils/helpers";
import toast from "react-hot-toast";

const AVATAR_COLORS = [
  "#3a5aff","#10b981","#f59e0b","#ef4444","#8b5cf6",
  "#06b6d4","#ec4899","#f97316","#14b8a6","#6366f1",
];

// 3D Tilt Stat Card component - Ultra Glassy
const TiltStatCard = ({ icon: Icon, label, value, color, delay = 0 }) => {
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
    const rotateYVal = ((x - centerX) / centerX) * 10;
    const rotateXVal = ((centerY - y) / centerY) * 10;
    setRotateY(rotateYVal);
    setRotateX(rotateXVal);
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
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`,
        transition: "transform 0.15s ease-out",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(40px) saturate(200%)",
        WebkitBackdropFilter: "blur(40px) saturate(200%)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: `0 30px 60px -15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
        willChange: "transform",
        animation: `floatStat 6s ease-in-out infinite ${delay}`,
      }}
      className="text-center p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group cursor-pointer"
    >
      {/* Internal Neon Glow Blob */}
      <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full opacity-30 pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:opacity-50"
        style={{ background: `radial-gradient(circle, ${color}90, transparent 70%)`, filter: "blur(15px)" }} />
        
      <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
        style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))`, border: `1px solid ${color}50`, boxShadow: `0 0 15px ${color}20` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="text-xl md:text-2xl font-display font-extrabold text-white drop-shadow-md relative z-10">{value}</div>
      <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 relative z-10" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</div>
    </div>
  );
};

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
    toast.success("Unique ID copied! 💅");
  };

  const handleVisibilityToggle = async () => {
    const newV = profile.profileVisibility === "public" ? "private" : "public";
    const result = await updateProfileVisibility(userId, newV);
    if (result.success) { setProfile((p) => ({ ...p, profileVisibility: newV })); await refreshProfile(); toast.success(`Profile set to ${newV} ⚡`); }
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    const result = await updateUserBio(userId, bioText);
    if (result.success) { setProfile((p) => ({ ...p, bio: bioText })); setEditingBio(false); toast.success("Bio updated! ✨"); }
    setSavingBio(false);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image too large! Max 5MB"); return; }
    setUploadingPhoto(true);
    const result = await uploadProfilePhoto(userId, file);
    setUploadingPhoto(false);
    if (result.success) { setProfile((p) => ({ ...p, photoURL: result.photoURL, avatarColor: null })); await refreshProfile(); toast.success("Photo updated! 📸"); }
    else toast.error("Upload failed. Try again.");
  };

  const handleColorChange = async (color) => {
    const result = await updateAvatarColor(userId, color);
    if (result.success) { setProfile((p) => ({ ...p, avatarColor: color, photoURL: null })); await refreshProfile(); setShowColorPicker(false); toast.success("Avatar color updated! 🎨"); }
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

  // Glass panel style
  const glassPanel = {
    background: "rgba(20, 20, 25, 0.4)",
    backdropFilter: "blur(40px) saturate(250%)",
    WebkitBackdropFilter: "blur(40px) saturate(250%)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10"><ProfileSkeleton /></div>;

  if (!isOwner && profile?.isPrivate) {
    return (
      <div className="relative min-h-screen text-white overflow-hidden pb-16 pt-10 px-4">
        {/* Background Neon Aura Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] mix-blend-screen animate-pulse-slow"></div>
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white mb-10 transition-all hover:-translate-x-1 mx-auto font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Retreat
          </button>
          <div className="rounded-[3rem] p-16 transform-gpu border border-white/5 shadow-2xl relative overflow-hidden" style={glassPanel}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="w-24 h-24 mx-auto bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <Lock size={40} className="text-gray-500" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-3">Ghost Mode</h2>
            <p className="text-gray-400 font-medium">This user's profile is strictly private. 🚷</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden pb-16">
      {/* Background Neon Aura Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/20 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-600/10 blur-[150px] mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-[100px] mix-blend-screen"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter" style={{ perspective: "1200px" }}>
        
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-8 transition-all duration-300 hover:-translate-x-1 group text-gray-400 hover:text-white relative z-10">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        {/* Profile Header — Holographic GenZ look */}
        <div className="rounded-[2.5rem] p-8 md:p-10 mb-10 transform-gpu transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.2)] group relative overflow-hidden"
          style={{
            background: "linear-gradient(120deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(40px) saturate(250%)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)",
          }}>
          
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 mix-blend-overlay pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group/avatar mt-2 md:mt-0">
              <div
                className="w-28 h-28 rounded-3xl flex items-center justify-center text-white text-4xl font-extrabold font-display overflow-hidden transition-all duration-500 group-hover/avatar:scale-105 group-hover/avatar:-rotate-3"
                style={{
                  backgroundColor: profile?.avatarColor || "#8b5cf6",
                  boxShadow: `0 0 40px ${profile?.avatarColor || "#8b5cf6"}60`,
                  animation: "floatAvatar 5s ease-in-out infinite",
                  border: "2px solid rgba(255,255,255,0.2)"
                }}>
                {profile?.photoURL
                  ? <img src={profile.photoURL} alt="avatar" className="w-full h-full object-cover" />
                  : profile?.username?.[0]?.toUpperCase()}
              </div>
              
              {isOwner && (
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
                  }}
                  title="Change photo">
                  {uploadingPhoto
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Camera size={18} className="text-white drop-shadow-md" />}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              
              {isOwner && showColorPicker && (
                <div className="absolute top-32 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 rounded-2xl p-4 z-50 animate-fade-in"
                  style={{
                    background: "rgba(20,20,25,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
                    backdropFilter: "blur(40px)",
                  }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-400 text-center md:text-left">Pick Aura</p>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_COLORS.map((color) => (
                      <button key={color} onClick={() => handleColorChange(color)}
                        className="w-8 h-8 rounded-xl border-2 transition-all hover:scale-125 hover:rotate-6"
                        style={{ backgroundColor: color, borderColor: profile?.avatarColor === color ? "white" : "transparent" }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-3">
                <h1 className="text-3xl md:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{profile?.username}</h1>
                <span className="flex items-center gap-1.5 text-[10px] md:text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-widest mt-1 md:mt-2"
                  style={{
                    background: profile?.profileVisibility === "public" ? "rgba(74,222,128,0.1)" : "rgba(156,163,175,0.1)",
                    border: `1px solid ${profile?.profileVisibility === "public" ? "rgba(74,222,128,0.3)" : "rgba(156,163,175,0.3)"}`,
                    color: profile?.profileVisibility === "public" ? "#4ade80" : "#9ca3af",
                  }}>
                  {profile?.profileVisibility === "public" ? <Globe size={12} /> : <Lock size={12} />}
                  {profile?.profileVisibility}
                </span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 mb-5">
                <span className="text-xs md:text-sm font-mono font-bold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
                  {profile?.uniqueId}
                </span>
                <button onClick={handleCopyId} className="p-2 rounded-xl transition-all duration-300 hover:bg-white/10 active:scale-95 border border-transparent hover:border-white/20 text-gray-400 hover:text-white">
                  {idCopied ? <CheckCheck size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>

              {/* Bio Section */}
              {isOwner && editingBio ? (
                <div className="flex flex-col sm:flex-row gap-2 mt-2 max-w-lg mx-auto md:mx-0">
                  <input value={bioText} onChange={(e) => setBioText(e.target.value)} maxLength={150}
                    placeholder="Set your vibe... (150 chars max)"
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-violet-500/50 bg-white/5 border border-white/10" />
                  <div className="flex gap-2">
                    <button onClick={handleSaveBio} disabled={savingBio}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-violet-600 to-fuchsia-600 border border-white/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                      {savingBio ? "..." : "Save ✨"}
                    </button>
                    <button onClick={() => { setEditingBio(false); setBioText(profile?.bio || ""); }}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold transition-colors bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm md:text-base transition-colors group/bio max-w-xl mx-auto md:mx-0 leading-relaxed text-gray-300 relative"
                  style={{ cursor: isOwner ? "pointer" : "default" }}
                  onClick={() => isOwner && setEditingBio(true)}>
                  {profile?.bio || (isOwner ? "Tap here to set your vibe... ✨" : "No bio yet.")}
                  {isOwner && !profile?.bio && <span className="absolute -right-6 top-0 opacity-0 group-hover/bio:opacity-100 transition-opacity text-xl">✏️</span>}
                </p>
              )}

              {isOwner && (
                <button onClick={() => setShowColorPicker(!showColorPicker)}
                  className="mt-4 text-xs font-bold uppercase tracking-widest transition-all hover:text-white text-gray-500 border-b border-gray-600 hover:border-white pb-0.5">
                  Customize Aura
                </button>
              )}

              <p className="text-xs md:text-sm mt-6 flex items-center justify-center md:justify-start gap-2 text-gray-500 font-medium">
                <Calendar size={14} className="text-violet-400" />
                Joined {formatDate(profile?.createdAt)}
              </p>
            </div>

            {/* Owner controls */}
            {isOwner && (
              <button onClick={handleVisibilityToggle}
                className="mt-4 md:mt-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                {profile?.profileVisibility === "public" ? <><Lock size={16} className="text-rose-400"/> Go Private</> : <><Globe size={16} className="text-green-400"/> Go Public</>}
              </button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 mt-8 pt-8 border-t border-white/10">
            <TiltStatCard icon={FileText} label="Drops" value={notes.length} color="#c084fc" delay="0s" />
            <TiltStatCard icon={Download} label="Hits" value={totalDownloads} color="#22d3ee" delay="0.1s" />
            <TiltStatCard icon={Star} label="Vibe" value={avgRating} color="#fbbf24" delay="0.2s" />
          </div>
        </div>

        {/* Notes Collection Section */}
        <div className="relative z-10">
          <h2 className="text-2xl font-display font-extrabold text-white mb-6 flex items-center gap-3">
            Archive <span className="text-lg text-violet-400">📂</span>
          </h2>

          {/* Subject Filter — Glassy pill buttons */}
          {allSubjects.length > 2 && (
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mr-2 hidden sm:block">Subject:</span>
              {allSubjects.map((s) => (
                <button key={s} onClick={() => handleSubjectChange(s)}
                  className="px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: subjectFilter === s ? "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.3))" : "rgba(255,255,255,0.03)",
                    border: subjectFilter === s ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                    color: subjectFilter === s ? "white" : "#9ca3af",
                    boxShadow: subjectFilter === s ? "0 10px 20px -5px rgba(139,92,246,0.4)" : "none",
                    backdropFilter: "blur(20px)",
                  }}>
                  {s === "all" ? "All Subjects" : s}
                </button>
              ))}
            </div>
          )}

          {/* Unit Filter — Sleek glassy pills */}
          {allUnits.length > 2 && (
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mr-2 hidden sm:block">Unit:</span>
              {allUnits.map((u) => (
                <button key={u} onClick={() => setUnitFilter(u)}
                  className="px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 capitalize"
                  style={{
                    background: unitFilter === u ? "rgba(45,212,191,0.15)" : "transparent",
                    border: unitFilter === u ? "1px solid rgba(45,212,191,0.5)" : "1px solid rgba(255,255,255,0.1)",
                    color: unitFilter === u ? "#2dd4bf" : "#6b7280",
                    boxShadow: unitFilter === u ? "0 0 15px rgba(45,212,191,0.2)" : "none",
                  }}>
                  {u === "all" ? "All Units" : u.replace("unit ", "Unit ")}
                </button>
              ))}
            </div>
          )}

          {notesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => <NoteCardSkeleton key={i} />)}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-20 rounded-[2.5rem] transform-gpu transition-all duration-500 border border-white/5 relative overflow-hidden"
              style={glassPanel}>
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
              <FileText size={48} className="mx-auto mb-6 text-gray-600 opacity-50" />
              <p className="text-xl font-bold text-gray-400 mb-2">Vault is empty.</p>
              {isOwner && (
                <button onClick={() => navigate("/upload")}
                  className="mt-6 px-8 py-3.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  Drop your first note 🚀
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNotes.map((note) => <NoteCard key={note.id} note={note} />)}
            </div>
          )}
        </div>

      </div>

      <style jsx>{`
        @keyframes floatAvatar {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes floatStat {
          0%, 100% { transform: perspective(1000px) translateY(0px); }
          50% { transform: perspective(1000px) translateY(-5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;