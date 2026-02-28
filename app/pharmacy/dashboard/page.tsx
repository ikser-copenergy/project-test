"use client";

import { useMemo } from "react";
import { usePharmacy } from "@/lib/pharmacy-store";
import { format, parseISO, isBefore, addDays } from "date-fns";
import { Package, AlertTriangle, CalendarClock, Thermometer } from "lucide-react";
import Link from "next/link";

export default function PharmacyDashboardPage() {
  const { products, batches, getProductTotalQuantity } = usePharmacy();
  const today = useMemo(() => new Date(), []);
  const in30Days = useMemo(() => addDays(today, 30), [today]);

  const batchRows = useMemo(() => {
    return batches.map((batch) => {
      const product = products.find((p) => p.id === batch.productId);
      return product ? { batch, product } : null;
    }).filter(Boolean) as { batch: { id: string; productId: string; batchNumber: string; quantity: number; expiryDate?: string }; product: { id: string; name: string; reorderLevel: number } }[];
  }, [batches, products]);

  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (p) => getProductTotalQuantity(p.id) <= p.reorderLevel
      ),
    [products, getProductTotalQuantity]
  );

  const expiredBatches = useMemo(
    () =>
      batchRows.filter(
        (r) =>
          r.batch.expiryDate && isBefore(parseISO(r.batch.expiryDate), today)
      ),
    [batchRows, today]
  );

  const expiringSoonBatches = useMemo(
    () =>
      batchRows.filter(
        (r) =>
          r.batch.expiryDate &&
          !isBefore(parseISO(r.batch.expiryDate), today) &&
          isBefore(parseISO(r.batch.expiryDate), in30Days)
      ),
    [batchRows, today, in30Days]
  );

  const coldChainProducts = useMemo(
    () => products.filter((p) => p.requiresColdChain),
    [products]
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Package className="h-5 w-5" />
            <span className="text-sm font-medium">Total products</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {products.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Low stock</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {lowStockProducts.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-orange-600">
            <CalendarClock className="h-5 w-5" />
            <span className="text-sm font-medium">Expiring in 30 days</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {expiringSoonBatches.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600">
            <Thermometer className="h-5 w-5" />
            <span className="text-sm font-medium">Cold chain items</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {coldChainProducts.length}
          </p>
        </div>
      </div>

      {expiredBatches.length > 0 && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h2 className="text-sm font-semibold text-red-800">
            Expired batches
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-red-700">
            {expiredBatches.map((r) => (
              <li key={r.batch.id}>
                {r.product.name} — Batch {r.batch.batchNumber}, expired{" "}
                {r.batch.expiryDate &&
                  format(parseISO(r.batch.expiryDate), "MMM d, yyyy")}{" "}
                ({r.batch.quantity} units)
              </li>
            ))}
          </ul>
          <Link
            href="/pharmacy/inventory?filter=expired"
            className="mt-3 inline-block text-sm font-medium text-red-700 underline hover:no-underline"
          >
            View in inventory
          </Link>
        </section>
      )}

      {expiringSoonBatches.length > 0 && (
        <section className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <h2 className="text-sm font-semibold text-orange-800">
            Expiring within 30 days (ver productos que ya van a expirar)
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-orange-800">
            {expiringSoonBatches.map((r) => (
              <li key={r.batch.id}>
                {r.product.name} — Batch {r.batch.batchNumber},{" "}
                {r.batch.expiryDate &&
                  format(parseISO(r.batch.expiryDate), "MMM d, yyyy")}{" "}
                ({r.batch.quantity} units)
              </li>
            ))}
          </ul>
          <Link
            href="/pharmacy/inventory?filter=expiring"
            className="mt-3 inline-block text-sm font-medium text-orange-700 underline hover:no-underline"
          >
            View in inventory
          </Link>
          <Link
            href="/pharmacy/reports"
            className="ml-4 mt-3 inline-block text-sm font-medium text-orange-700 underline hover:no-underline"
          >
            View expiry report
          </Link>
        </section>
      )}

      {lowStockProducts.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-800">
            Low stock alert
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            {lowStockProducts.map((p) => (
              <li key={p.id}>
                {p.name} — {getProductTotalQuantity(p.id)} left (reorder at{" "}
                {p.reorderLevel})
              </li>
            ))}
          </ul>
          <Link
            href="/pharmacy/inventory?filter=low"
            className="mt-3 inline-block text-sm font-medium text-amber-700 underline hover:no-underline"
          >
            View in inventory
          </Link>
        </section>
      )}

      {coldChainProducts.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Cold chain (compliance)
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {coldChainProducts.length} product(s) require temperature-controlled
            storage.
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {coldChainProducts.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
