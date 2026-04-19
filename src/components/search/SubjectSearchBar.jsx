// src/components/search/SubjectSearchBar.jsx
// Search bar with live subject suggestions + case-insensitive matching

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSubjects, filterSubjects } from "../../services/searchService";

const SubjectSearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // Fetch all subjects once on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      const subjects = await getAllSubjects();
      setAllSubjects(subjects);
      setLoading(false);
    };
    fetchSubjects();
  }, []);

  // Filter suggestions as user types
  useEffect(() => {
    const filtered = filterSubjects(allSubjects, query);
    setSuggestions(filtered);
    setShowDropdown(filtered.length > 0 && query.trim() !== "");
  }, [query, allSubjects]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchQuery) => {
    const trimmed = (searchQuery || query).trim();
    if (!trimmed) return;
    setShowDropdown(false);
    // Navigate with lowercase so URL is consistent
    navigate(`/subject/${encodeURIComponent(trimmed.toLowerCase())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSuggestionClick = (subject) => {
    setQuery(subject);
    handleSearch(subject);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      {/* Search Input */}
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder="🔍 Search by subject (e.g. OS, DBMS, DSA)..."
          style={{
            flex: 1,
            padding: "12px 16px",
            fontSize: "16px",
            border: "2px solid #e2e8f0",
            borderRadius: "10px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.borderColor = "#667eea")}
          onMouseOut={(e) => (e.target.style.borderColor = "#e2e8f0")}
        />
        <button
          onClick={() => handleSearch()}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Search
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "6px 12px",
              fontSize: "11px",
              color: "#94a3b8",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Subjects found
          </div>
          {suggestions.map((subject, i) => (
            <div
              key={i}
              onClick={() => handleSuggestionClick(subject)}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                fontSize: "15px",
                color: "#1e293b",
                borderBottom:
                  i < suggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f0f4ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "white")
              }
            >
              <span style={{ color: "#667eea" }}>📚</span>
              {/* Highlight matching part */}
              {highlightMatch(subject, query)}
            </div>
          ))}
        </div>
      )}

      {/* Loading hint */}
      {loading && (
        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
          Loading subjects...
        </div>
      )}
    </div>
  );
};

// Highlight the matching part of the suggestion
const highlightMatch = (text, query) => {
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <strong style={{ color: "#667eea" }}>
        {text.slice(index, index + query.length)}
      </strong>
      {text.slice(index + query.length)}
    </>
  );
};

export default SubjectSearchBar;
