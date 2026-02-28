import { DishList } from "@/components/meal-planer/dishes/DishList";

export default function DishesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Manage dishes</h1>
      <DishList />
    </div>
  );
}
