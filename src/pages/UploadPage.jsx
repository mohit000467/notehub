// src/pages/UploadPage.jsx — 3D Glassmorphism
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Info } from "lucide-react";
import UploadForm from "../components/notes/UploadForm";

const UploadPage = () => {
  const navigate = useNavigate();
  const iconRef = useRef(null);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 page-enter">
      {/* Header with floating 3D icon */}
      <div className="flex items-center gap-3 mb-2">
        <div
          ref={iconRef}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg animate-float"
          style={{ transformStyle: "preserve-3d", transform: "translateZ(10px)" }}
        >
          <Upload size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            Upload Notes
          </h1>
          <p className="text-sm text-gray-400">
            Share your knowledge with thousands of students
          </p>
        </div>
      </div>

      {/* Guidelines — glassmorphism card */}
      <div className="flex items-start gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 my-6 text-sm text-gray-300 shadow-lg">
        <Info size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p>
          Upload clear, organized notes. Supported formats: PDF, DOC, DOCX, PPT, PPTX,
          JPG, PNG. Max file size: 25MB. Notes are immediately visible to everyone.
        </p>
      </div>

      {/* Form Container — deep glass effect with hover 3D */}
      <div className="bg-black/30 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.01]">
        <UploadForm onSuccess={() => setTimeout(() => navigate("/dashboard"), 2000)} />
      </div>

      <style jsx>{`
        @keyframes floatIcon {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: floatIcon 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default UploadPage;