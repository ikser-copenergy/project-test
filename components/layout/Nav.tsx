"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, List, UtensilsCrossed, ShoppingCart } from "lucide-react";

const links = [
  { href: "/today", label: "Today menu", icon: List },
  { href: "/plan", label: "Weekly plan", icon: Calendar },
  { href: "/dishes", label: "Dishes", icon: UtensilsCrossed },
  { href: "/shopping", label: "Shopping list", icon: ShoppingCart },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-4 border-b border-gray-200 bg-white px-4 py-3">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${
              isActive ? "bg-accent/15 text-accent font-medium" : "text-gray-600 hover:bg-accent/10 hover:text-accent"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
