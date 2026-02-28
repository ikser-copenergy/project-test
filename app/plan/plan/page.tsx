"use client";

import { useState } from "react";
import { startOfWeek, addDays, addWeeks, format } from "date-fns";
import { SingleDayView } from "@/components/meal-planer/plan/WeekView";

const DAYS_TOTAL = 14;

export default function WeeklyPlanPage() {
  const today = new Date();
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const nextWeekStart = addWeeks(thisWeekStart, 1);
  const allDays = [
    ...Array.from({ length: 7 }, (_, i) => addDays(thisWeekStart, i)),
    ...Array.from({ length: 7 }, (_, i) => addDays(nextWeekStart, i)),
  ];

  const [dayIndex, setDayIndex] = useState(() => {
    const todayStr = format(today, "yyyy-MM-dd");
    const idx = allDays.findIndex((d) => format(d, "yyyy-MM-dd") === todayStr);
    return idx >= 0 ? idx : 0;
  });

  const currentDate = allDays[dayIndex];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          {dayIndex < 7 ? "This week" : "Next week"}
        </h1>
      </div>
      <SingleDayView
        currentDate={currentDate}
        onPrev={() => setDayIndex((i) => Math.max(0, i - 1))}
        onNext={() => setDayIndex((i) => Math.min(DAYS_TOTAL - 1, i + 1))}
        canGoPrev={dayIndex > 0}
        canGoNext={dayIndex < DAYS_TOTAL - 1}
      />
    </div>
  );
}
