// src/services/searchService.js
// Handles subject suggestions + case-insensitive search

import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Get all unique subjects from Firestore (for autocomplete suggestions)
 */
export const getAllSubjects = async () => {
  try {
    const snapshot = await getDocs(collection(db, "notes"));
    const subjectsSet = new Set();
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.subject) {
        // Store in lowercase for deduplication, display as original
        subjectsSet.add(data.subject.trim());
      }
    });
    // Return sorted array
    return Array.from(subjectsSet).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }
};

/**
 * Filter subjects based on query (case-insensitive)
 */
export const filterSubjects = (subjects, query) => {
  if (!query || query.trim() === "") return [];
  const q = query.toLowerCase().trim();
  return subjects.filter((s) => s.toLowerCase().includes(q)).slice(0, 8); // max 8 suggestions
};
