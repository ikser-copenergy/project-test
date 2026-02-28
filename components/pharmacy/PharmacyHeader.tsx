"use client";

import { usePharmacy } from "@/lib/pharmacy-store";
import type { UserRole } from "@/lib/pharmacy-types";

export function PharmacyHeader() {
  const { currentRole, setRole } = usePharmacy();

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Pharmacy inventory
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage drugstore stock
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View as:</span>
          <select
            value={currentRole}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="pharmacist">Pharmacist</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
    </header>
  );
}
