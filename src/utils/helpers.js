// src/utils/helpers.js
// ============================================================
// Shared utility functions used across the app
// ============================================================

// ── GENERATE UNIQUE USER ID ───────────────────────────────────
// Format: USR-XXXXXX (6 alphanumeric chars)
export const generateUniqueId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "USR-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ── FORMAT FILE SIZE ──────────────────────────────────────────
export const formatFileSize = (bytes) => {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── FORMAT DATE ───────────────────────────────────────────────
export const formatDate = (timestamp) => {
  if (!timestamp) return "Unknown date";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ── TIME AGO ──────────────────────────────────────────────────
export const timeAgo = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
};

// ── FILE TYPE ICON ────────────────────────────────────────────
export const getFileTypeLabel = (fileType) => {
  const types = {
    pdf: { label: "PDF", color: "text-red-400 bg-red-400/10" },
    doc: { label: "DOC", color: "text-blue-400 bg-blue-400/10" },
    docx: { label: "DOCX", color: "text-blue-400 bg-blue-400/10" },
    jpg: { label: "IMG", color: "text-green-400 bg-green-400/10" },
    jpeg: { label: "IMG", color: "text-green-400 bg-green-400/10" },
    png: { label: "IMG", color: "text-green-400 bg-green-400/10" },
    ppt: { label: "PPT", color: "text-orange-400 bg-orange-400/10" },
    pptx: { label: "PPTX", color: "text-orange-400 bg-orange-400/10" },
  };
  return types[fileType?.toLowerCase()] || { label: "FILE", color: "text-gray-400 bg-gray-400/10" };
};

// ── TRUNCATE TEXT ─────────────────────────────────────────────
export const truncate = (text, maxLength = 100) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

// ── PREDEFINED TAGS ───────────────────────────────────────────
export const AVAILABLE_TAGS = [
  "DSA", "OS", "DBMS", "CN", "OOP",
  "Web Dev", "AI/ML", "Math", "Physics",
  "Chemistry", "Electronics", "Compiler",
  "Software Engg", "TOC", "Discrete Math",
];

// ── PREDEFINED SUBJECTS ───────────────────────────────────────
export const POPULAR_SUBJECTS = [
  "Data Structures", "Algorithms", "Operating Systems",
  "Database Management", "Computer Networks", "Web Development",
  "Machine Learning", "Software Engineering", "Theory of Computation",
  "Compiler Design", "Digital Electronics", "Mathematics",
];
