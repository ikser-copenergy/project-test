"use client";

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import { format, subDays } from "date-fns";
import { Dish, DayPlan, PlanState, FeedbackRating } from "@/lib/types";
import { defaultDishes, defaultChildren, ADULTS_COUNT } from "@/lib/mock-dishes";

type PlanAction =
  | { type: "SET_DAY"; date: string; payload: Partial<DayPlan> }
  | { type: "SET_MAIN_DISH"; date: string; dish: Dish | null }
  | { type: "SET_SNACK"; date: string; index: number; dish: Dish | null }
  | { type: "ADD_SNACK_SLOT"; date: string }
  | { type: "REMOVE_SNACK_SLOT"; date: string; index: number }
  | { type: "SET_CHILDREN_COUNT"; value: number }
  | { type: "SET_ADULTS_COUNT"; value: number }
  | { type: "SET_FEEDBACK"; date: string; feedback: { mainDish?: FeedbackRating; snacks?: FeedbackRating[] } }
  | { type: "ADD_DISH"; dish: Dish }
  | { type: "UPDATE_DISH"; id: string; dish: Partial<Dish> }
  | { type: "REMOVE_DISH"; id: string };

interface PlanContextValue {
  plan: PlanState;
  dishes: Dish[];
  childrenCount: number;
  adultsCount: number;
  setMainDish: (date: string, dish: Dish | null) => void;
  setSnack: (date: string, index: number, dish: Dish | null) => void;
  addSnackSlot: (date: string) => void;
  removeSnackSlot: (date: string, index: number) => void;
  setChildrenCount: (value: number) => void;
  setAdultsCount: (value: number) => void;
  setFeedback: (date: string, feedback: { mainDish?: FeedbackRating; snacks?: FeedbackRating[] }) => void;
  addDish: (dish: Omit<Dish, "id">) => void;
  updateDish: (id: string, dish: Partial<Dish>) => void;
  removeDish: (id: string) => void;
  getDayPlan: (date: string) => DayPlan;
}

interface PlannerState {
  plan: PlanState;
  dishes: Dish[];
  childrenCount: number;
  adultsCount: number;
}

function planReducer(state: PlannerState, action: PlanAction): PlannerState {
  switch (action.type) {
    case "SET_DAY": {
      const next = { ...state.plan };
      const existing = next[action.date] || { date: action.date, mainDish: null, snacks: [null] };
      next[action.date] = { ...existing, ...action.payload };
      return { ...state, plan: next };
    }
    case "SET_MAIN_DISH": {
      const next = { ...state.plan };
      const existing = next[action.date] || { date: action.date, mainDish: null, snacks: [null] };
      next[action.date] = { ...existing, mainDish: action.dish };
      return { ...state, plan: next };
    }
    case "SET_SNACK": {
      const next = { ...state.plan };
      const existing = next[action.date] || { date: action.date, mainDish: null, snacks: [null] };
      const snacks = [...(existing.snacks || [null])];
      while (snacks.length <= action.index) snacks.push(null);
      snacks[action.index] = action.dish;
      next[action.date] = { ...existing, snacks };
      return { ...state, plan: next };
    }
    case "ADD_SNACK_SLOT": {
      const next = { ...state.plan };
      const existing = next[action.date] || { date: action.date, mainDish: null, snacks: [null] };
      const snacks = [...(existing.snacks || [null]), null];
      next[action.date] = { ...existing, snacks };
      return { ...state, plan: next };
    }
    case "REMOVE_SNACK_SLOT": {
      const next = { ...state.plan };
      const existing = next[action.date] || { date: action.date, mainDish: null, snacks: [null] };
      const current = existing.snacks || [null];
      const snacks = current.filter((_, idx) => idx !== action.index);
      next[action.date] = { ...existing, snacks: snacks.length > 0 ? snacks : [null] };
      return { ...state, plan: next };
    }
    case "SET_CHILDREN_COUNT":
      return { ...state, childrenCount: Math.max(0, action.value) };
    case "SET_ADULTS_COUNT":
      return { ...state, adultsCount: Math.max(0, action.value) };
    case "SET_FEEDBACK": {
      const next = { ...state.plan };
      const existing = next[action.date] || { date: action.date, mainDish: null, snacks: [null] };
      next[action.date] = { ...existing, feedback: { ...existing.feedback, ...action.feedback } };
      return { ...state, plan: next };
    }
    case "ADD_DISH": {
      const id = "d-" + Date.now();
      return { ...state, dishes: [...state.dishes, { ...action.dish, id }] };
    }
    case "UPDATE_DISH": {
      return {
        ...state,
        dishes: state.dishes.map((d) => (d.id === action.id ? { ...d, ...action.dish } : d)),
      };
    }
    case "REMOVE_DISH":
      return { ...state, dishes: state.dishes.filter((d) => d.id !== action.id) };
    default:
      return state;
  }
}

const PlanContext = createContext<PlanContextValue | null>(null);

function createInitialPlan(dishes: Dish[]): PlanState {
  const byId = (id: string) => dishes.find((d) => d.id === id) ?? null;
  const today = format(new Date(), "yyyy-MM-dd");
  const makeDate = (daysBack: number) => format(subDays(new Date(), daysBack), "yyyy-MM-dd");

  return {
    [today]: {
      date: today,
      mainDish: byId("d3"),
      snacks: [byId("d7"), byId("d10")],
      feedback: { mainDish: null, snacks: [null, null] },
    },
    [makeDate(1)]: {
      date: makeDate(1),
      mainDish: byId("d1"),
      snacks: [byId("d7"), byId("d8")],
      feedback: { mainDish: "liked" },
    },
    [makeDate(2)]: {
      date: makeDate(2),
      mainDish: byId("d2"),
      snacks: [byId("d11"), byId("d10")],
      feedback: { mainDish: "disliked" },
    },
    [makeDate(3)]: {
      date: makeDate(3),
      mainDish: byId("d4"),
      snacks: [byId("d9")],
      feedback: { mainDish: "liked" },
    },
  };
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(planReducer, {
    plan: createInitialPlan(defaultDishes),
    dishes: defaultDishes,
    childrenCount: defaultChildren.length,
    adultsCount: ADULTS_COUNT,
  });

  const getDayPlan = useCallback(
    (date: string): DayPlan => {
      return (
        state.plan[date] || {
          date,
          mainDish: null,
          snacks: [null],
        }
      );
    },
    [state.plan]
  );

  const setMainDish = useCallback((date: string, dish: Dish | null) => {
    dispatch({ type: "SET_MAIN_DISH", date, dish });
  }, []);

  const setSnack = useCallback((date: string, index: number, dish: Dish | null) => {
    dispatch({ type: "SET_SNACK", date, index, dish });
  }, []);

  const addSnackSlot = useCallback((date: string) => {
    dispatch({ type: "ADD_SNACK_SLOT", date });
  }, []);

  const removeSnackSlot = useCallback((date: string, index: number) => {
    dispatch({ type: "REMOVE_SNACK_SLOT", date, index });
  }, []);

  const setChildrenCount = useCallback((value: number) => {
    dispatch({ type: "SET_CHILDREN_COUNT", value });
  }, []);

  const setAdultsCount = useCallback((value: number) => {
    dispatch({ type: "SET_ADULTS_COUNT", value });
  }, []);

  const setFeedback = useCallback((date: string, feedback: { mainDish?: FeedbackRating; snacks?: FeedbackRating[] }) => {
    dispatch({ type: "SET_FEEDBACK", date, feedback });
  }, []);

  const addDish = useCallback((dish: Omit<Dish, "id">) => {
    dispatch({ type: "ADD_DISH", dish: dish as Dish });
  }, []);

  const updateDish = useCallback((id: string, dish: Partial<Dish>) => {
    dispatch({ type: "UPDATE_DISH", id, dish });
  }, []);

  const removeDish = useCallback((id: string) => {
    dispatch({ type: "REMOVE_DISH", id });
  }, []);

  const value: PlanContextValue = {
    plan: state.plan,
    dishes: state.dishes,
    childrenCount: state.childrenCount,
    adultsCount: state.adultsCount,
    setMainDish,
    setSnack,
    addSnackSlot,
    removeSnackSlot,
    setChildrenCount,
    setAdultsCount,
    setFeedback,
    addDish,
    updateDish,
    removeDish,
    getDayPlan,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within PlanProvider");
  return ctx;
}
