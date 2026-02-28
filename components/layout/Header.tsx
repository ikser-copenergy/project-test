import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Meal planner</h1>
          <p className="mt-1 text-sm text-gray-500">Plan the week for the whole family</p>
        </div>
        <Link href="/" className="shrink-0 text-sm text-gray-500 hover:text-accent">
          Back to demos
        </Link>
      </div>
    </header>
  );
}
