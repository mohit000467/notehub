// src/components/search/SubjectSearchBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { getAllSubjects, filterSubjects } from "../../services/searchService";

const SubjectSearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    getAllSubjects().then(setAllSubjects);
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const filtered = filterSubjects(allSubjects, query);
    setSuggestions(filtered);
    setShowDropdown(filtered.length > 0);
  }, [query, allSubjects]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToSubject = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setShowDropdown(false);
    navigate(`/subject/${encodeURIComponent(trimmed.toLowerCase())}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    goToSubject(query);
  };

  const handleSuggestionClick = (subject) => {
    setQuery(subject);
    setShowDropdown(false);
    navigate(`/subject/${encodeURIComponent(subject.toLowerCase())}`);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", zIndex: 9999 }}>
      <form onSubmit={handleSubmit} className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Search by subject..."
          className="w-full bg-surface-card border border-surface-border rounded-xl pl-10 pr-24 py-3.5 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500/30 transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-ink-500 hover:bg-ink-400 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Search
        </button>
      </form>

      {showDropdown && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          background: "#0e1018",
          border: "1px solid rgba(108,138,255,0.2)",
          borderRadius: "12px",
          boxShadow: "0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,138,255,0.05)",
          zIndex: 9999,
          overflow: "hidden",
          backdropFilter: "blur(16px)",
        }}>
          <div style={{
            padding: "6px 12px",
            fontSize: "10px",
            color: "#454d6a",
            borderBottom: "1px solid rgba(108,138,255,0.1)",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            Suggestions
          </div>
          {suggestions.map((subject, i) => (
            <div
              key={i}
              onMouseDown={() => handleSuggestionClick(subject)}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#eef0f8",
                borderBottom: i < suggestions.length - 1 ? "1px solid rgba(108,138,255,0.06)" : "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(108,138,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: "15px" }}>📚</span>
              {highlightMatch(subject, query)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

export default SubjectSearchBar;