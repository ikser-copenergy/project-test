import { ShoppingList } from "@/components/shopping/ShoppingList";

export default function ShoppingPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Shopping list</h1>
      <ShoppingList />
    </div>
  );
}
