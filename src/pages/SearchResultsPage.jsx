// src/pages/SearchResultsPage.jsx
// Used for future URL-based search: /search?subject=DSA
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { getNotesBySubject } from "../services/notesService";
import NoteCard from "../components/notes/NoteCard";
import { NoteCardSkeleton } from "../components/ui/LoadingSkeleton";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subject = searchParams.get("subject") || "";
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subject) {
      // Redirect to subject page
      navigate(`/subject/${encodeURIComponent(subject.toLowerCase())}`, { replace: true });
    }
  }, [subject]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 text-center">
      <Search size={40} className="text-gray-700 mx-auto mb-3" />
      <p className="text-gray-500">Searching...</p>
    </div>
  );
};

export default SearchResultsPage;
