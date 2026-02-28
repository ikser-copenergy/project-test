"use client";

import { useState, useMemo } from "react";
import { startOfWeek, addDays, addWeeks, format } from "date-fns";
import { usePlan } from "@/lib/store";
import { Check } from "lucide-react";

type WeekFilter = "this" | "next" | "both";

export function ShoppingList() {
  const { plan, dishes, getDayPlan } = usePlan();
  const [weekFilter, setWeekFilter] = useState<WeekFilter>("both");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const today = new Date();
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const nextWeekStart = addWeeks(thisWeekStart, 1);

  const allIngredients = useMemo(() => {
    const set = new Set<string>();
    const dates: Date[] = [];
    if (weekFilter === "this" || weekFilter === "both") {
      for (let i = 0; i < 7; i++) dates.push(addDays(thisWeekStart, i));
    }
    if (weekFilter === "next" || weekFilter === "both") {
      for (let i = 0; i < 7; i++) dates.push(addDays(nextWeekStart, i));
    }
    for (const d of dates) {
      const dateStr = format(d, "yyyy-MM-dd");
      const dayPlan = getDayPlan(dateStr);
      if (dayPlan.mainDish) {
        dayPlan.mainDish.ingredients.forEach((ing) => set.add(`${ing.quantity} ${ing.name}`.trim()));
      }
      dayPlan.snacks?.forEach((s) =>
        s?.ingredients.forEach((ing) => set.add(`${ing.quantity} ${ing.name}`.trim()))
      );
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [plan, dishes, weekFilter, getDayPlan, thisWeekStart, nextWeekStart]);

  const toggle = (ingredient: string) => {
    setChecked((prev) => ({ ...prev, [ingredient]: !prev[ingredient] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Shopping list</h2>
        <div className="flex rounded-lg border border-gray-200 bg-white p-1">
          {(["this", "next", "both"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setWeekFilter(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                weekFilter === value ? "bg-accent text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {value === "this" ? "This week" : value === "next" ? "Next week" : "Both"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Ingredients from your weekly plan. Check off what you already have.
      </p>

      {allIngredients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-12 text-center">
          <p className="text-gray-500">No planned ingredients.</p>
          <p className="mt-1 text-sm text-gray-400">Add dishes to the weekly plan to generate the list.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {allIngredients.map((ing) => (
            <li key={ing}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 transition hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={checked[ing] ?? false}
                  onChange={() => toggle(ing)}
                  className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                />
                <span className={checked[ing] ? "text-gray-400 line-through" : "text-gray-900"}>{ing}</span>
                {checked[ing] && <Check className="h-4 w-4 text-green-600" />}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
