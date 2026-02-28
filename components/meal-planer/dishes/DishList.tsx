"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { usePlan } from "@/lib/store";
import { Dish } from "@/lib/types";
import { DishForm } from "./DishForm";

export function DishList() {
  const { dishes, addDish, updateDish, removeDish } = usePlan();
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const mains = dishes.filter((d) => d.type === "main");
  const snacks = dishes.filter((d) => d.type === "snack");

  const handleSave = (data: Omit<Dish, "id">) => {
    if (modalMode === "edit" && editingId) {
      updateDish(editingId, data);
    } else {
      addDish(data);
    }
    setEditingId(null);
    setModalMode(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">My dishes</h2>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setModalMode("add");
          }}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
        >
          <Plus className="h-4 w-4" />
          Add dish
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">Main dishes</h3>
          <ul className="space-y-2">
            {mains.map((d) => (
              <DishCard
                key={d.id}
                dish={d}
                onEdit={() => {
                  setEditingId(d.id);
                  setModalMode("edit");
                }}
                onDelete={() => removeDish(d.id)}
              />
            ))}
          </ul>
          {mains.length === 0 && (
            <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 py-6 text-center text-sm text-gray-500">
              No main dishes. Add one with &quot;Add dish&quot;.
            </p>
          )}
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">Snacks</h3>
          <ul className="space-y-2">
            {snacks.map((d) => (
              <DishCard
                key={d.id}
                dish={d}
                onEdit={() => {
                  setEditingId(d.id);
                  setModalMode("edit");
                }}
                onDelete={() => removeDish(d.id)}
              />
            ))}
          </ul>
          {snacks.length === 0 && (
            <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 py-6 text-center text-sm text-gray-500">
              No snacks. Add one with &quot;Add dish&quot;.
            </p>
          )}
        </div>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl">
            <h3 className="mb-3 font-medium text-gray-900">
              {modalMode === "add" ? "Add dish" : "Edit dish"}
            </h3>
            <DishForm
              initial={modalMode === "edit" ? dishes.find((d) => d.id === editingId) ?? undefined : undefined}
              onSave={handleSave}
              onCancel={() => {
                setModalMode(null);
                setEditingId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DishCard({
  dish,
  onEdit,
  onDelete,
}: {
  dish: Dish;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div>
        <p className="font-medium text-gray-900">{dish.name}</p>
        {dish.ingredients.length > 0 && (
          <p className="text-xs text-gray-500">
            {dish.ingredients
              .slice(0, 3)
              .map((ing) => `${ing.quantity} ${ing.name}`.trim())
              .join(", ")}
            ...
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
