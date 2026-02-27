export interface IngredientItem {
  name: string;
  quantity: number;
}

export interface Dish {
  id: string;
  name: string;
  type: "main" | "snack";
  ingredients: IngredientItem[];
  notes?: string;
}

export interface Child {
  id: string;
  name: string;
  avatarUrl?: string;
}

export type FeedbackRating = "liked" | "disliked" | null;

export interface DayFeedback {
  mainDish?: FeedbackRating;
  snacks?: FeedbackRating[];
}

export interface DayPlan {
  date: string;
  mainDish: Dish | null;
  snacks: (Dish | null)[];
  feedback?: DayFeedback;
}

export type PlanState = Record<string, DayPlan>;
