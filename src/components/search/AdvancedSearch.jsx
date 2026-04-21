// src/components/search/AdvancedSearch.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Hash, Users } from "lucide-react";
import { getAllSubjects, filterSubjects } from "../../services/searchService";
import { getUserByUniqueId } from "../../services/userService";
import toast from "react-hot-toast";

const AdvancedSearch = () => {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [unit, setUnit] = useState("");
  const [userId, setUserId] = useState("");
  const [searching, setSearching] = useState(false);

  // Subject autocomplete
  const [allSubjects, setAllSubjects] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    getAllSubjects().then(setAllSubjects);
  }, []);

  useEffect(() => {
    if (subject.trim() === "") { setSuggestions([]); setShowDropdown(false); return; }
    const filtered = filterSubjects(allSubjects, subject);
    setSuggestions(filtered);
    setShowDropdown(filtered.length > 0);
  }, [subject, allSubjects]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
  e.preventDefault();

  const subjectTrimmed = subject.trim();
  const unitTrimmed = unit.trim();
  const userIdTrimmed = userId.trim().toUpperCase();

  // Kuch to fill hona chahiye
  if (!subjectTrimmed && !unitTrimmed && !userIdTrimmed) {
    toast.error("Please fill at least one search field");
    return;
  }

  // ── Sirf Unit diya — subject maango ──
  if (unitTrimmed && !subjectTrimmed && !userIdTrimmed) {
    toast.error("Please enter a subject to search by unit 📚");
    return;
  }

  setSearching(true);

  // ── Sirf User ID diya — profile pe jao ──
  if (userIdTrimmed && !subjectTrimmed && !unitTrimmed) {
    const result = await getUserByUniqueId(userIdTrimmed);
    setSearching(false);
    if (!result.success) {
      if (result.isBlocked) toast.error("This user has been blocked by the admin 🚫");
      else if (result.isPrivate) toast.error("This profile is set to private 🔒");
      else toast.error("No user found with this ID");
      return;
    }
    navigate(`/profile/${result.data.userId}`);
    return;
  }

  // ── Subject + optional filters ──
  let resolvedUserId = null;
  if (userIdTrimmed) {
    const result = await getUserByUniqueId(userIdTrimmed);
    if (!result.success) {
      setSearching(false);
      if (result.isBlocked) toast.error("This user has been blocked by the admin 🚫");
      else if (result.isPrivate) toast.error("This profile is set to private 🔒");
      else toast.error("No user found with this ID");
      return;
    }
    resolvedUserId = result.data.userId;
  }

  setSearching(false);

  const params = new URLSearchParams();
  if (subjectTrimmed) params.set("subject", subjectTrimmed.toLowerCase());
  if (unitTrimmed) params.set("unit", unitTrimmed.toLowerCase());
  if (resolvedUserId) params.set("userId", resolvedUserId);

  navigate(`/subject/${encodeURIComponent(subjectTrimmed.toLowerCase())}?${params.toString()}`);
};

  const handleSuggestionClick = (s) => {
    setSubject(s);
    setShowDropdown(false);
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <strong style={{ color: "#6c8aff" }}>{text.slice(index, index + query.length)}</strong>
        {text.slice(index + query.length)}
      </>
    );
  };

  return (
    <form onSubmit={handleSearch} ref={wrapperRef}>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">

        {/* Subject field */}
        <div style={{ position: "relative", flex: 2, zIndex: 200 }}>
          <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted)", zIndex: 1 }} />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Subject (e.g. Data Structures)"
            className="w-full rounded-xl py-2.5 text-sm outline-none transition-all"
            style={{
              paddingLeft: "2rem",
              paddingRight: "1rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(108,138,255,0.15)",
              color: "var(--text-primary)",
            }}
          />
          {/* Autocomplete dropdown */}
          {showDropdown && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: "#0e1018",
              border: "1px solid rgba(108,138,255,0.2)",
              borderRadius: "12px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
              zIndex: 9999,
              overflow: "hidden",
            }}>
              <div style={{ padding: "6px 12px", fontSize: "10px", color: "#454d6a", borderBottom: "1px solid rgba(108,138,255,0.1)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Suggestions
              </div>
              {suggestions.map((s, i) => (
                <div key={i} onMouseDown={() => handleSuggestionClick(s)}
                  style={{ padding: "10px 16px", cursor: "pointer", fontSize: "14px", color: "#eef0f8", borderBottom: i < suggestions.length - 1 ? "1px solid rgba(108,138,255,0.06)" : "none", display: "flex", alignItems: "center", gap: "10px", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(108,138,255,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <span>📚</span>
                  {highlightMatch(s, subject)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unit field */}
        <div style={{ position: "relative", flex: 1 }}>
          <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Unit (e.g. Unit 2)"
            className="w-full rounded-xl py-2.5 text-sm outline-none transition-all"
            style={{
              paddingLeft: "2rem",
              paddingRight: "1rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(108,138,255,0.15)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* User ID field */}
        <div style={{ position: "relative", flex: 1 }}>
          <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value.toUpperCase())}
            placeholder="User ID (USR-XXXXXX)"
            className="w-full rounded-xl py-2.5 text-sm font-mono outline-none transition-all"
            style={{
              paddingLeft: "2rem",
              paddingRight: "1rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(108,138,255,0.15)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Search button */}
        <button type="submit" disabled={searching}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6c8aff, #a78bfa)", boxShadow: "0 4px 16px rgba(108,138,255,0.3)", minWidth: "100px" }}>
          <Search size={14} />
          {searching ? "..." : "Search"}
        </button>
      </div>

      {/* Helper text */}
      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
        Fill any combination — subject only, subject + unit, or all three for precise results.
      </p>
    </form>
  );
};

export default AdvancedSearch;
