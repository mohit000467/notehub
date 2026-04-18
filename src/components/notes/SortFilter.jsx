// src/components/notes/SortFilter.jsx
// Controls for sorting notes list

import React from "react";
import { ArrowUpDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "createdAt", label: "Latest" },
  { value: "downloadCount", label: "Most Downloaded" },
  { value: "rating", label: "Highest Rated" },
];

const SortFilter = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    <ArrowUpDown size={14} className="text-gray-500" />
    <span className="text-sm text-gray-500 hidden sm:block">Sort:</span>
    <div className="flex bg-surface-elevated border border-surface-border rounded-lg overflow-hidden">
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-medium transition-all ${
            value === opt.value
              ? "bg-ink-500/20 text-ink-300"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export default SortFilter;
