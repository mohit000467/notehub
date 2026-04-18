// src/components/ui/LoadingSkeleton.jsx
// Shimmer placeholder cards during data fetch

import React from "react";

export const NoteCardSkeleton = () => (
  <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-3">
    <div className="flex gap-2">
      <div className="h-5 w-12 rounded shimmer" />
      <div className="h-5 w-16 rounded shimmer" />
    </div>
    <div className="h-5 w-3/4 rounded shimmer" />
    <div className="h-4 w-full rounded shimmer" />
    <div className="h-4 w-2/3 rounded shimmer" />
    <div className="flex gap-4 mt-2">
      <div className="h-3 w-20 rounded shimmer" />
      <div className="h-3 w-24 rounded shimmer" />
    </div>
    <div className="h-9 w-full rounded-lg shimmer mt-2" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-full bg-surface-border" />
      <div className="space-y-2 flex-1">
        <div className="h-6 w-40 rounded bg-surface-border" />
        <div className="h-4 w-32 rounded bg-surface-border" />
        <div className="h-4 w-24 rounded bg-surface-border" />
      </div>
    </div>
  </div>
);

export const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  </div>
);
