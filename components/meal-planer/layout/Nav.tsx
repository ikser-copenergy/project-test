"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, List, UtensilsCrossed, ShoppingCart, Menu, X } from "lucide-react";

const links = [
  { href: "/meal-planer/today", label: "Today menu", icon: List },
  { href: "/meal-planer/plan", label: "Weekly plan", icon: Calendar },
  { href: "/meal-planer/dishes", label: "Dishes", icon: UtensilsCrossed },
  { href: "/meal-planer/shopping", label: "Shopping list", icon: ShoppingCart },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="relative border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div
          className={`absolute left-0 right-0 top-full z-50 flex flex-col gap-1 border-b border-gray-200 bg-white p-4 shadow-lg md:static md:top-auto md:flex-row md:gap-4 md:border-0 md:p-0 md:shadow-none ${
            open ? "flex" : "hidden md:flex"
          }`}
        >
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
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
        <div className="w-10 md:hidden" aria-hidden />
      </div>
    </nav>
  );
}
