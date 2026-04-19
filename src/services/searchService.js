// src/services/searchService.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const getAllSubjects = async () => {
  try {
    const snapshot = await getDocs(collection(db, "notes"));
    const subjectsSet = new Set();
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.subjectDisplay) subjectsSet.add(data.subjectDisplay.trim());
      else if (data.subject) subjectsSet.add(data.subject.trim());
    });
    return Array.from(subjectsSet).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }
};

export const filterSubjects = (subjects, query) => {
  if (!query || query.trim() === "") return [];
  const q = query.toLowerCase().trim();
  return subjects.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
};