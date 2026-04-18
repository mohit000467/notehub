// src/pages/NotFoundPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 page-enter">
      <div className="text-8xl font-display font-bold text-surface-border mb-4">404</div>
      <BookOpen size={36} className="text-gray-700 mb-4" />
      <h2 className="text-xl font-display font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-6">This page doesn't exist or was moved.</p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-2.5 bg-ink-500 hover:bg-ink-400 text-white font-medium rounded-lg transition-colors"
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFoundPage;
