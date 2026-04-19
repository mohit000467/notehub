// src/services/searchService.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Predefined common subjects list
const PREDEFINED_SUBJECTS = [
  "Computer Networks",
  "Computer Organization",
  "Computer Architecture",
  "Data Structures and Algorithms",
  "DSA",
  "Database Management System",
  "DBMS",
  "Operating Systems",
  "OS",
  "Machine Learning",
  "Artificial Intelligence",
  "AI",
  "Web Development",
  "Software Engineering",
  "Object Oriented Programming",
  "OOP",
  "Theory of Computation",
  "TOC",
  "Compiler Design",
  "Digital Electronics",
  "Discrete Mathematics",
  "Linear Algebra",
  "Probability and Statistics",
  "Engineering Mathematics",
  "Physics",
  "Chemistry",
  "Data Science",
  "Deep Learning",
  "Cloud Computing",
  "Cyber Security",
  "Information Security",
  "Mobile Application Development",
  "Android Development",
  "Python Programming",
  "C Programming",
  "Java Programming",
  "System Design",
  "Microprocessor",
  "Computer Graphics",
  "Image Processing",
  "Natural Language Processing",
  "NLP",
  "Big Data",
  "Blockchain",
  "Internet of Things",
  "IOT",
];

// Get subjects — uploaded ones + predefined list (merged, no duplicates)
export const getAllSubjects = async () => {
  try {
    const snapshot = await getDocs(collection(db, "notes"));
    const subjectsSet = new Set(PREDEFINED_SUBJECTS);

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
    return PREDEFINED_SUBJECTS.sort();
  }
};

export const filterSubjects = (subjects, query) => {
  if (!query || query.trim() === "") return [];
  const q = query.toLowerCase().trim();
  return subjects.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
};