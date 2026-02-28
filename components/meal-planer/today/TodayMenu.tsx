"use client";

import { format } from "date-fns";
import { usePlan } from "@/lib/store";
import { FeedbackChip } from "@/components/meal-planer/plan/FeedbackChip";
import type { FeedbackRating } from "@/lib/types";

export function TodayMenu() {
  const { getDayPlan, setFeedback } = usePlan();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayPlan = getDayPlan(todayStr);
  const snacks = todayPlan.snacks?.length ? todayPlan.snacks : [null];
  const snackFeedback = todayPlan.feedback?.snacks ?? [];

  const setSnackFeedback = (index: number, value: FeedbackRating) => {
    const next = [...snackFeedback];
    while (next.length <= index) next.push(null);
    next[index] = value;
    setFeedback(todayStr, { snacks: next });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Today menu</h1>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-700">Main dish</p>
        <p className="mt-1 text-sm text-gray-900">{todayPlan.mainDish?.name ?? "No main dish selected for today."}</p>
        <div className="mt-3">
          <FeedbackChip
            value={todayPlan.feedback?.mainDish ?? null}
            onChange={(value) => setFeedback(todayStr, { mainDish: value })}
            label="Rate main dish"
          />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-700">Snacks</p>
        <div className="mt-2 space-y-3">
          {snacks.map((snack, index) => (
            <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-sm text-gray-900">{snack?.name ?? `Snack ${index + 1} not selected.`}</p>
              <div className="mt-2">
                <FeedbackChip
                  value={snackFeedback[index] ?? null}
                  onChange={(value) => setSnackFeedback(index, value)}
                  label={`Rate snack ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
