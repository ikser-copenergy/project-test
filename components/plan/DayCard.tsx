"use client";

import { format } from "date-fns";
import { DayPlan as DayPlanType } from "@/lib/types";
import { usePlan } from "@/lib/store";
import { MealSlot } from "./MealSlot";
import { Plus, X } from "lucide-react";

interface DayCardProps {
  date: string;
  dayPlan: DayPlanType;
  isPast: boolean;
  isToday?: boolean;
}

export function DayCard({ date, dayPlan, isPast, isToday: isTodayProp }: DayCardProps) {
  const {
    dishes,
    childrenCount,
    adultsCount,
    setChildrenCount,
    setAdultsCount,
    setMainDish,
    setSnack,
    removeSnackSlot,
    addSnackSlot,
  } = usePlan();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const today = isTodayProp ?? (date === todayStr);
  const d = new Date(date + "T12:00:00");
  const snacks = dayPlan.snacks?.length ? dayPlan.snacks : [null];

  return (
    <article
      className={`flex flex-col rounded-xl border bg-white p-4 shadow-sm transition ${
        today ? "border-accent ring-2 ring-accent/20" : "border-gray-200"
      } ${isPast ? "opacity-90" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{format(d, "EEEE")}</p>
          <p className="text-sm text-gray-500">{format(d, "MMM d")}</p>
        </div>
        {today && (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
            Today
          </span>
        )}
      </div>

      {isPast ? (
        <>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Main dish</p>
            <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              {dayPlan.mainDish?.name ?? "—"}
            </p>
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-gray-700">Snacks</p>
            <div className="space-y-1">
              {snacks.map((s, i) => (
                <p
                  key={i}
                  className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-sm text-gray-900"
                >
                  {s?.name ?? "—"}
                </p>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <MealSlot
            label="Main dish"
            value={dayPlan.mainDish}
            options={dishes}
            onChange={(dish) => setMainDish(date, dish)}
            placeholder="Add main dish"
          />

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Snacks</span>
              <button
                type="button"
                onClick={() => addSnackSlot(date)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add snack
              </button>
            </div>
            {snacks.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1">
                  <MealSlot
                    label=""
                    value={dayPlan.snacks?.[i] ?? null}
                    options={dishes}
                    onChange={(dish) => setSnack(date, i, dish)}
                    placeholder="Snack"
                    compact
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSnackSlot(date, i)}
                  className="rounded-md border border-gray-200 p-1.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                  title="Remove snack"
                  aria-label="Remove snack"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-gray-600">
            Children
            <input
              type="number"
              min={0}
              value={childrenCount}
              disabled={isPast}
              onChange={(e) => setChildrenCount(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
            />
          </label>
          <label className="text-xs text-gray-600">
            Adults
            <input
              type="number"
              min={0}
              value={adultsCount}
              disabled={isPast}
              onChange={(e) => setAdultsCount(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
            />
          </label>
        </div>
      </div>
    </article>
  );
}
