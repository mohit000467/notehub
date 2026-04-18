// src/components/notes/UploadForm.jsx
// ============================================================
// Drag & Drop file upload form with progress tracking
// ============================================================

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload, X, FileText, Tag, AlertCircle, CheckCircle
} from "lucide-react";
import { uploadNote } from "../../services/notesService";
import { useAuth } from "../../context/AuthContext";
import { AVAILABLE_TAGS, POPULAR_SUBJECTS } from "../../utils/helpers";
import toast from "react-hot-toast";

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const UploadForm = ({ onSuccess }) => {
  const { currentUser, userProfile } = useAuth();
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    title: "",
    description: "",
    tags: [],
  });
  const [errors, setErrors] = useState({});

  // ── DROPZONE ────────────────────────────────────────────
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === "file-too-large") toast.error("File too large! Max 25MB.");
      else toast.error("File type not supported.");
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  // ── FORM CHANGE ─────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : prev.tags.length < 5
        ? [...prev.tags, tag]
        : prev.tags,
    }));
  };

  // ── VALIDATION ──────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (formData.title.trim().length < 5)
      newErrors.title = "Title must be at least 5 characters";
    if (!file) newErrors.file = "Please select a file";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── SUBMIT ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setUploading(true);
    setProgress(0);

    const result = await uploadNote(
      formData,
      file,
      currentUser.uid,
      userProfile?.username || "Anonymous",
      (prog) => setProgress(prog)
    );

    setUploading(false);

    if (result.success) {
      setUploaded(true);
      toast.success("Notes uploaded successfully! 🎉");
      if (onSuccess) onSuccess();
    } else {
      toast.error(result.error || "Upload failed. Try again.");
    }
  };

  // ── RESET FORM ───────────────────────────────────────────
  const resetForm = () => {
    setFile(null);
    setProgress(0);
    setUploaded(false);
    setFormData({ subject: "", title: "", description: "", tags: [] });
    setErrors({});
  };

  // Success State
  if (uploaded) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <CheckCircle size={56} className="text-accent-green mx-auto mb-4" />
        <h3 className="text-xl font-display font-bold text-white mb-2">
          Upload Successful!
        </h3>
        <p className="text-gray-500 mb-6">Your notes are now live for everyone to discover.</p>
        <button
          onClick={resetForm}
          className="px-6 py-2.5 bg-ink-500 hover:bg-ink-400 text-white rounded-lg font-medium transition-colors"
        >
          Upload Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Drop Zone */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Note File <span className="text-red-400">*</span>
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-ink-400 bg-ink-500/10 dropzone-active"
              : "border-surface-border hover:border-ink-600 hover:bg-surface-hover"
          } ${errors.file ? "border-red-400/50" : ""}`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText size={24} className="text-ink-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="ml-auto p-1 hover:bg-red-400/10 rounded text-gray-500 hover:text-red-400"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                {isDragActive
                  ? "Drop it here!"
                  : "Drag & drop your file, or click to browse"}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                PDF, DOC, DOCX, PPT, JPG, PNG • Max 25MB
              </p>
            </>
          )}
        </div>
        {errors.file && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.file}
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Subject <span className="text-red-400">*</span>
        </label>
        <input
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          list="subjects-list"
          placeholder="e.g. Data Structures, Operating Systems"
          className={`w-full bg-surface-elevated border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500/30 transition-all ${
            errors.subject ? "border-red-400/50" : "border-surface-border"
          }`}
        />
        <datalist id="subjects-list">
          {POPULAR_SUBJECTS.map((s) => <option key={s} value={s} />)}
        </datalist>
        {errors.subject && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.subject}
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Note Title <span className="text-red-400">*</span>
        </label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Complete DSA Notes - Unit 4 Trees"
          className={`w-full bg-surface-elevated border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500/30 transition-all ${
            errors.title ? "border-red-400/50" : "border-surface-border"
          }`}
        />
        {errors.title && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Description <span className="text-gray-600">(optional)</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Briefly describe what's covered in these notes..."
          rows={3}
          className="w-full bg-surface-elevated border border-surface-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500/30 transition-all resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Tags <span className="text-gray-600">(up to 5)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all ${
                formData.tags.includes(tag)
                  ? "bg-ink-500/20 border-ink-500/50 text-ink-300"
                  : "border-surface-border text-gray-500 hover:border-ink-600 hover:text-gray-300"
              }`}
            >
              <Tag size={10} />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
            <div
              className="h-full bg-ink-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-ink-500 hover:bg-ink-400 text-white rounded-lg font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Upload size={18} />
        {uploading ? `Uploading ${progress}%...` : "Upload Notes"}
      </button>
    </form>
  );
};

export default UploadForm;
