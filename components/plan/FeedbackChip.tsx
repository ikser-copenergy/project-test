"use client";

import type { FeedbackRating } from "@/lib/types";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface FeedbackChipProps {
  value: FeedbackRating;
  onChange: (value: FeedbackRating) => void;
  label?: string;
}

export function FeedbackChip({ value, onChange, label }: FeedbackChipProps) {
  return (
    <div className="flex items-center gap-1">
      {label && <span className="text-xs text-gray-500">{label}</span>}
      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
        <button
          type="button"
          onClick={() => onChange(value === "liked" ? null : "liked")}
          className={`rounded-md p-1.5 transition ${value === "liked" ? "bg-green-100 text-green-700" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
          title="Liked"
        >
          <ThumbsUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onChange(value === "disliked" ? null : "disliked")}
          className={`rounded-md p-1.5 transition ${value === "disliked" ? "bg-red-100 text-red-700" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
          title="Disliked"
        >
          <ThumbsDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
