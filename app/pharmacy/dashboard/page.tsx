"use client";

import { useMemo } from "react";
import { usePharmacy } from "@/lib/pharmacy-store";
import { format, parseISO, isBefore, addDays, differenceInCalendarDays } from "date-fns";
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
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-red-900">Expired batches</h2>
              <p className="mt-0.5 text-xs text-red-800">
                These batches are past their expiry date.
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="grid grid-cols-[1fr_110px_120px_70px] gap-3 px-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-red-900/80">
              <div>Product</div>
              <div>Batch</div>
              <div>Expiry</div>
              <div className="text-right">Qty</div>
            </div>
            <div className="divide-y divide-red-200/70 border-t border-red-200/70">
              {expiredBatches.map((r, idx) => (
                <div
                  key={r.batch.id}
                  className="grid grid-cols-[1fr_110px_120px_70px] gap-3 px-1 py-2 text-sm text-red-950"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.product.name}</p>
                  </div>
                  <div className="font-mono text-[11px] text-red-900/90">{r.batch.batchNumber}</div>
                  <div className="text-[11px] text-red-900/90">
                    {r.batch.expiryDate ? format(parseISO(r.batch.expiryDate), "MMM d, yyyy") : "—"}
                  </div>
                  <div className="text-right tabular-nums text-red-900/90">{r.batch.quantity}</div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/pharmacy/inventory?filter=expired"
            className="mt-3 inline-block text-sm font-medium text-red-700 underline hover:no-underline"
          >
            View in inventory
          </Link>
        </section>
      )}

      {expiringSoonBatches.length > 0 && (
        <section className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-yellow-950">
                Expiring within 30 days
              </h2>
              <p className="mt-0.5 text-xs text-yellow-900">
                Ver productos que ya van a expirar.
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="grid grid-cols-[1fr_110px_120px_70px_90px] gap-3 px-1 py-2 text-[11px] font-semibold uppercase tracking-wide text-yellow-950/80">
              <div>Product</div>
              <div>Batch</div>
              <div>Expiry</div>
              <div className="text-right">Qty</div>
              <div className="text-right">In</div>
            </div>
            <div className="max-h-56 overflow-auto divide-y divide-yellow-200/60">
              {expiringSoonBatches.map((r, idx) => {
                const daysLeft = r.batch.expiryDate
                  ? differenceInCalendarDays(parseISO(r.batch.expiryDate), today)
                  : null;
                return (
                  <div
                    key={r.batch.id}
                    className="grid grid-cols-[1fr_110px_120px_70px_90px] gap-3 px-1 py-2 text-sm text-yellow-950 hover:bg-white/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.product.name}</p>
                    </div>
                    <div className="font-mono text-[11px] text-yellow-950/90">{r.batch.batchNumber}</div>
                    <div className="text-[11px] text-yellow-950/90">
                      {r.batch.expiryDate ? format(parseISO(r.batch.expiryDate), "MMM d, yyyy") : "—"}
                    </div>
                    <div className="text-right tabular-nums text-yellow-950/90">{r.batch.quantity}</div>
                    <div className="text-right text-[11px] tabular-nums text-yellow-950/90">
                      {typeof daysLeft === "number" ? `${daysLeft}d` : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Link
            href="/pharmacy/inventory?filter=expiring"
            className="mt-3 inline-block text-sm font-medium text-yellow-900 underline hover:no-underline"
          >
            View in inventory
          </Link>
          <Link
            href="/pharmacy/reports"
            className="ml-4 mt-3 inline-block text-sm font-medium text-yellow-900 underline hover:no-underline"
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
          <div className="mt-3">
            <div className="grid grid-cols-[1fr_100px_120px] gap-3 px-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-amber-900/80">
              <div>Product</div>
              <div className="text-right">Qty</div>
              <div className="text-right">Reorder level</div>
            </div>
            <div className="divide-y divide-amber-200/70 border-t border-amber-200/70">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[1fr_100px_120px] gap-3 px-1 py-2 text-sm text-amber-900"
                >
                  <div className="min-w-0 truncate font-medium">{p.name}</div>
                  <div className="text-right tabular-nums">{getProductTotalQuantity(p.id)}</div>
                  <div className="text-right tabular-nums">{p.reorderLevel}</div>
                </div>
              ))}
            </div>
          </div>
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
          <div className="mt-3">
            <div className="grid grid-cols-[1fr_100px] gap-3 px-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
              <div>Product</div>
              <div className="text-right">Status</div>
            </div>
            <div className="divide-y divide-gray-200/80 border-t border-gray-200/80">
              {coldChainProducts.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[1fr_100px] gap-3 px-1 py-2 text-sm text-gray-700"
                >
                  <div className="min-w-0 truncate font-medium text-gray-900">{p.name}</div>
                  <div className="text-right text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Cold
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
