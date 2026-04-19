// src/pages/SubjectPage.jsx
// FIXED: case-insensitive subject matching

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

const SubjectPage = () => {
  const { subject } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        // Fetch ALL notes then filter case-insensitively on client
        // This avoids Firestore case-sensitivity issue entirely
        const snapshot = await getDocs(collection(db, "notes"));
        const allNotes = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Case-insensitive subject match
          if (
            data.subject &&
            data.subject.toLowerCase().trim() === decodeURIComponent(subject).toLowerCase().trim()
          ) {
            allNotes.push({ id: doc.id, ...data });
          }
        });
        setNotes(allNotes);
      } catch (err) {
        console.error("Error fetching notes:", err);
      }
      setLoading(false);
    };
    fetchNotes();
  }, [subject]);

  // Client-side sorting
  const sortedNotes = [...notes].sort((a, b) => {
    if (sortBy === "latest") {
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    } else if (sortBy === "downloads") {
      return (b.downloadCount || 0) - (a.downloadCount || 0);
    } else if (sortBy === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  const handleDownload = async (note) => {
    // Increment download count
    try {
      const { doc, updateDoc, increment } = await import("firebase/firestore");
      await updateDoc(doc(db, "notes", note.id), {
        downloadCount: increment(1),
      });
    } catch (e) {}
    window.open(note.fileURL, "_blank");
  };

  const displaySubject = decodeURIComponent(subject).toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <Link
            to="/"
            style={{ color: "#667eea", textDecoration: "none", fontSize: "14px" }}
          >
            ← Back to Home
          </Link>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#1e293b",
              marginTop: "8px",
            }}
          >
            📚 {displaySubject}
          </h1>
          <p style={{ color: "#64748b" }}>
            {loading ? "Loading..." : `${notes.length} note${notes.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Sort Bar */}
        {!loading && notes.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            {["latest", "downloads", "rating"].map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "2px solid",
                  borderColor: sortBy === s ? "#667eea" : "#e2e8f0",
                  background: sortBy === s ? "#667eea" : "white",
                  color: sortBy === s ? "white" : "#64748b",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  textTransform: "capitalize",
                }}
              >
                {s === "latest" ? "🕐 Latest" : s === "downloads" ? "⬇️ Most Downloaded" : "⭐ Top Rated"}
              </button>
            ))}
          </div>
        )}

        {/* Notes Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              background: "white",
              borderRadius: "16px",
              color: "#64748b",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
            <h3>No notes found for "{displaySubject}"</h3>
            <p>Be the first to upload notes for this subject!</p>
            <Link
              to="/upload"
              style={{
                display: "inline-block",
                marginTop: "16px",
                padding: "10px 24px",
                background: "#667eea",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              Upload Notes
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 6px", color: "#1e293b", fontSize: "18px" }}>
                    {note.title}
                  </h3>
                  <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: "14px" }}>
                    {note.description}
                  </p>
                  <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#94a3b8", flexWrap: "wrap" }}>
                    <span>👤 {note.uploaderName || "Anonymous"}</span>
                    <span>⬇️ {note.downloadCount || 0} downloads</span>
                    <span>⭐ {note.rating ? note.rating.toFixed(1) : "N/A"}</span>
                    {note.tags && note.tags.length > 0 && (
                      <span>
                        🏷️{" "}
                        {note.tags.map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              background: "#ede9fe",
                              color: "#7c3aed",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              marginRight: "4px",
                              fontSize: "12px",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(note)}
                  style={{
                    padding: "10px 20px",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ⬇️ Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectPage;
