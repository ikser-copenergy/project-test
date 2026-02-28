import Link from "next/link";
import { UtensilsCrossed, CreditCard, Pill } from "lucide-react";

const demos = [
  { href: "/plan", label: "Meal planner", description: "Weekly meal planning for families", icon: UtensilsCrossed },
  { href: "/pharmacy", label: "Pharmacy inventory", description: "Drugstore or pharmacy stock management", icon: Pill },
  { href: "/pos", label: "POS", description: "Point of sale demo", icon: CreditCard },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-6 md:p-10">
      <h1 className="text-2xl font-semibold text-gray-900">Demos</h1>
      <p className="mt-1 text-gray-500">Select an app to try.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {demos.map(({ href, label, description, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-accent/30 hover:shadow-md"
            >
              <Icon className="h-8 w-8 text-accent" />
              <span className="mt-3 font-medium text-gray-900">{label}</span>
              <span className="mt-1 text-sm text-gray-500">{description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
