"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Dish } from "@/lib/types";
import { usePlan } from "@/lib/store";
import { ChevronDown, Search } from "lucide-react";

interface MealSlotProps {
  label: string;
  value: Dish | null;
  options: Dish[];
  onChange: (dish: Dish | null) => void;
  placeholder?: string;
  compact?: boolean;
}

function useDishFeedbackCounts(dishId: string | null) {
  const { plan } = usePlan();
  return useMemo(() => {
    if (!dishId) return { liked: 0, disliked: 0 };
    let liked = 0;
    let disliked = 0;
    for (const day of Object.values(plan)) {
      if (day.mainDish?.id !== dishId) continue;
      const fb = day.feedback?.mainDish;
      if (fb === "liked") liked += 1;
      if (fb === "disliked") disliked += 1;
    }
    return { liked, disliked };
  }, [plan, dishId]);
}

export function MealSlot({
  label,
  value,
  options,
  onChange,
  placeholder = "Choose...",
  compact,
}: MealSlotProps) {
  const filteredByType = options.filter((d) =>
    label === "Main dish" ? d.type === "main" : d.type === "snack"
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? filteredByType.filter((d) =>
        d.name.toLowerCase().includes(query.toLowerCase())
      )
    : filteredByType;

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = value?.name ?? placeholder;

  return (
    <div className={compact ? "space-y-1" : "space-y-2"} ref={containerRef}>
      {label ? (
        <span
          className={`font-medium text-gray-700 ${compact ? "text-xs" : "text-sm"}`}
        >
          {label}
        </span>
      ) : null}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 text-left text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${
            compact ? "py-1.5 text-sm" : "py-2"
          } ${!value ? "text-gray-500" : ""}`}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-gray-400 transition ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-gray-100 p-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 border-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <ul className="max-h-48 overflow-auto py-1">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50"
                >
                  {placeholder}
                </button>
              </li>
              {filtered.map((d) => (
                <DishOption
                  key={d.id}
                  dish={d}
                  selected={value?.id === d.id}
                  onSelect={() => {
                    onChange(d);
                    setOpen(false);
                  }}
                />
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-500">No results</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function DishOption({
  dish,
  selected,
  onSelect,
}: {
  dish: Dish;
  selected: boolean;
  onSelect: () => void;
}) {
  const { liked, disliked } = useDishFeedbackCounts(dish.id);
  const hasFeedback = liked > 0 || disliked > 0;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
          selected ? "bg-accent/10 text-accent font-medium" : "text-gray-900"
        }`}
      >
        <span className="block">{dish.name}</span>
        {hasFeedback && (
          <span className="mt-0.5 block text-xs text-gray-500">
            {liked} liked, {disliked} disliked
          </span>
        )}
      </button>
    </li>
  );
}
