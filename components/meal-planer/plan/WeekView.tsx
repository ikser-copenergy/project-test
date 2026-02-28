"use client";

import { addDays, format } from "date-fns";
import { usePlan } from "@/lib/store";
import { DayCard } from "./DayCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekViewProps {
  weekStart: Date;
  totalDays?: number;
}

export function WeekView({ weekStart, totalDays = 14 }: WeekViewProps) {
  const { getDayPlan } = usePlan();
  const days = Array.from({ length: totalDays }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {format(days[0], "d MMM")} - {format(days[days.length - 1], "d MMM yyyy")}
      </p>
      {days.map((d) => {
        const dateStr = format(d, "yyyy-MM-dd");
        const dayPlan = getDayPlan(dateStr);
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const isPast = dateStr < todayStr;
        return (
          <DayCard
            key={dateStr}
            date={dateStr}
            dayPlan={dayPlan}
            isPast={!!isPast}
          />
        );
      })}
    </div>
  );
}

interface SingleDayViewProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export function SingleDayView({ currentDate, onPrev, onNext, canGoPrev, canGoNext }: SingleDayViewProps) {
  const { getDayPlan } = usePlan();
  const dateStr = format(currentDate, "yyyy-MM-dd");
  const dayPlan = getDayPlan(dateStr);
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const isPast = dateStr < todayStr;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoPrev}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous day
        </button>
        <p className="text-center text-sm font-medium text-gray-700">
          {format(currentDate, "EEEE, MMMM d")}
        </p>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next day
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <DayCard date={dateStr} dayPlan={dayPlan} isPast={isPast} isToday={dateStr === todayStr} />
    </div>
  );
}
