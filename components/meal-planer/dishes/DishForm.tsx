"use client";

import { useState } from "react";
import { Dish, IngredientItem } from "@/lib/types";
import { Plus, X } from "lucide-react";

interface DishFormProps {
  initial?: Dish;
  onSave: (data: Omit<Dish, "id">) => void;
  onCancel: () => void;
}

export function DishForm({ initial, onSave, onCancel }: DishFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<"main" | "snack">(initial?.type ?? "main");
  const [ingredients, setIngredients] = useState<IngredientItem[]>(
    initial?.ingredients?.length ? initial.ingredients : [{ name: "", quantity: 0 }]
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedIngredients = ingredients
      .map((item) => ({ name: item.name.trim(), quantity: Number(item.quantity) || 0 }))
      .filter((item) => item.name || item.quantity > 0);
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      type,
      ingredients: cleanedIngredients,
      notes: notes.trim() || undefined,
    });
  };

  const updateIngredient = (index: number, patch: Partial<IngredientItem>) => {
    setIngredients((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
      <div>
        <label htmlFor="dish-name" className="mb-1 block text-sm font-medium text-gray-700">
          Dish name
        </label>
        <input
          id="dish-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="e.g. Tomato pasta"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Type
        </label>
        <div className="flex gap-4 rounded-lg border border-gray-300 bg-white px-3 py-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
            <input
              type="radio"
              name="dish-type"
              value="main"
              checked={type === "main"}
              onChange={() => setType("main")}
              className="h-4 w-4 border-gray-300 text-accent focus:ring-accent"
            />
            Main dish
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
            <input
              type="radio"
              name="dish-type"
              value="snack"
              checked={type === "snack"}
              onChange={() => setType("snack")}
              className="h-4 w-4 border-gray-300 text-accent focus:ring-accent"
            />
            Snack
          </label>
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Ingredients</label>
          <button
            type="button"
              onClick={() => setIngredients((prev) => [...prev, { name: "", quantity: 0 }])}
            className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add ingredient
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((item, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_120px_auto] gap-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateIngredient(idx, { name: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Ingredient name"
              />
              <input
                type="number"
                min={0}
                step="any"
                value={item.quantity}
                onChange={(e) => updateIngredient(idx, { quantity: Number(e.target.value) || 0 })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Qty"
              />
              <button
                type="button"
                onClick={() =>
                  setIngredients((prev) => {
                    const next = prev.filter((_, i) => i !== idx);
                    return next.length > 0 ? next : [{ name: "", quantity: 0 }];
                  })
                }
                className="rounded-lg border border-gray-200 px-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                title="Remove ingredient"
                aria-label="Remove ingredient"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="dish-notes" className="mb-1 block text-sm font-medium text-gray-700">
          Notes (optional)
        </label>
        <input
          id="dish-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="e.g. Gluten-free"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
        >
          {initial ? "Save changes" : "Add dish"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
