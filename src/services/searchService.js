// src/services/searchService.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Predefined common subjects list
const PREDEFINED_SUBJECTS = [
  "Engineering Mathematics",
  "Mathematics I",
  "Mathematics II",
  "Mathematics III",
  "Linear Algebra",
  "Probability and Statistics",
  "Discrete Mathematics",

  "Engineering Physics",
  "Physics",
  "Engineering Chemistry",
  "Chemistry",

  "Programming in C",
  "C Programming",
  "C++ Programming",
  "Java Programming",
  "Python Programming",
  "Object Oriented Programming",
  "OOP",

  "Data Structures",
  "Data Structures and Algorithms",
  "DSA",
  "Algorithms",

  "Database Management System",
  "DBMS",

  "Operating Systems",
  "OS",

  "Computer Networks",
  "Computer Organization",
  "Computer Architecture",
  "Software Engineering",
  "Theory of Computation",
  "TOC",
  "Compiler Design",
  "System Design",

  "Artificial Intelligence",
  "AI",
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "NLP",
  "Data Science",
  "Data Engineering",
  "Big Data",
  "Big Data Engineering",
  "Data Warehousing",
  "ETL Processes",

  "Cloud Computing",
  "Cyber Security",
  "Information Security",
  "Blockchain",
  "Internet of Things",
  "IOT",

  "Web Development",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Mobile Application Development",
  "Android Development",
  "iOS Development",

  "Computer Graphics",
  "Image Processing",

  "Digital Electronics",
  "Electronic Devices",
  "Analog Circuits",
  "Signals and Systems",
  "Digital Signal Processing",
  "DSP",
  "Communication Systems",
  "Wireless Communication",
  "VLSI Design",
  "Embedded Systems",
  "Microprocessor",
  "Microcontrollers",

  "Electrical Circuits",
  "Electrical Machines",
  "Power Systems",
  "Power Electronics",
  "Control Systems",
  "High Voltage Engineering",

  "Engineering Mechanics",
  "Thermodynamics",
  "Fluid Mechanics",
  "Heat Transfer",
  "Theory of Machines",
  "Machine Design",
  "Manufacturing Processes",

  "Structural Analysis",
  "Geotechnical Engineering",
  "Transportation Engineering",
  "Environmental Engineering",
  "Surveying",
  "Construction Technology",

  "Automobile Engineering",
  "Robotics",
  "Mechatronics",
  "Industrial Engineering",
  "Operations Research",

  "Biotechnology",
  "Genetic Engineering",
  "Bioinformatics",

  "Aptitude",
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",

  "Project Work",
  "Seminar",
  "Internship"
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