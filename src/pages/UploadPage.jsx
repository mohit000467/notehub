// src/pages/UploadPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Info } from "lucide-react";
import UploadForm from "../components/notes/UploadForm";

const UploadPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-ink-500/20 flex items-center justify-center">
          <Upload size={20} className="text-ink-400" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            Upload Notes
          </h1>
          <p className="text-sm text-gray-500">
            Share your knowledge with thousands of students
          </p>
        </div>
      </div>

      {/* Guidelines */}
      <div className="flex items-start gap-2 bg-ink-500/5 border border-ink-500/20 rounded-xl p-4 my-6 text-sm text-gray-500">
        <Info size={15} className="text-ink-400 flex-shrink-0 mt-0.5" />
        <p>
          Upload clear, organized notes. Supported formats: PDF, DOC, DOCX, PPT, PPTX,
          JPG, PNG. Max file size: 25MB. Notes are immediately visible to everyone.
        </p>
      </div>

      {/* Form */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
        <UploadForm onSuccess={() => setTimeout(() => navigate("/dashboard"), 2000)} />
      </div>
    </div>
  );
};

export default UploadPage;
