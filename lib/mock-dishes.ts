import { Dish, Child } from "@/lib/types";

export const defaultDishes: Dish[] = [
  {
    id: "d1",
    name: "Tomato pasta",
    type: "main",
    ingredients: [
      { name: "Pasta", quantity: 250 },
      { name: "Tomato", quantity: 3 },
      { name: "Garlic", quantity: 2 },
      { name: "Olive oil", quantity: 2 },
      { name: "Basil", quantity: 1 },
    ],
  },
  {
    id: "d2",
    name: "Roast chicken",
    type: "main",
    ingredients: [
      { name: "Chicken", quantity: 1 },
      { name: "Lemon", quantity: 1 },
      { name: "Rosemary", quantity: 1 },
      { name: "Olive oil", quantity: 2 },
      { name: "Salt", quantity: 1 },
    ],
  },
  {
    id: "d3",
    name: "Caesar salad",
    type: "main",
    ingredients: [
      { name: "Lettuce", quantity: 1 },
      { name: "Chicken", quantity: 1 },
      { name: "Parmesan", quantity: 1 },
      { name: "Croutons", quantity: 1 },
      { name: "Caesar dressing", quantity: 4 },
    ],
  },
  {
    id: "d4",
    name: "Rice with vegetables",
    type: "main",
    ingredients: [
      { name: "Rice", quantity: 2 },
      { name: "Carrot", quantity: 2 },
      { name: "Peas", quantity: 1 },
      { name: "Bell pepper", quantity: 1 },
      { name: "Onion", quantity: 1 },
    ],
  },
  {
    id: "d5",
    name: "Spanish omelette",
    type: "main",
    ingredients: [
      { name: "Eggs", quantity: 6 },
      { name: "Potatoes", quantity: 5 },
      { name: "Onion", quantity: 1 },
      { name: "Olive oil", quantity: 3 },
      { name: "Salt", quantity: 1 },
    ],
  },
  {
    id: "d6",
    name: "Lentils",
    type: "main",
    ingredients: [
      { name: "Lentils", quantity: 3 },
      { name: "Carrot", quantity: 2 },
      { name: "Onion", quantity: 1 },
      { name: "Garlic", quantity: 2 },
      { name: "Bell pepper", quantity: 1 },
    ],
  },
  { id: "d7", name: "Apple", type: "snack", ingredients: [{ name: "Apple", quantity: 1 }] },
  { id: "d8", name: "Natural yogurt", type: "snack", ingredients: [{ name: "Natural yogurt", quantity: 1 }] },
  {
    id: "d9",
    name: "Whole grain crackers",
    type: "snack",
    ingredients: [{ name: "Whole grain crackers", quantity: 1 }],
  },
  {
    id: "d10",
    name: "Carrots with hummus",
    type: "snack",
    ingredients: [
      { name: "Carrot", quantity: 2 },
      { name: "Hummus", quantity: 3 },
    ],
  },
  { id: "d11", name: "Banana", type: "snack", ingredients: [{ name: "Banana", quantity: 1 }] },
  {
    id: "d12",
    name: "Cheese and crackers",
    type: "snack",
    ingredients: [
      { name: "Cheese", quantity: 1 },
      { name: "Crackers", quantity: 1 },
    ],
  },
];

export const defaultChildren: Child[] = [
  { id: "c1", name: "Child 1" },
  { id: "c2", name: "Child 2" },
  { id: "c3", name: "Child 3" },
];

export const ADULTS_COUNT = 2;
