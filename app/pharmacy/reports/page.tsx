"use client";

import { useMemo, useState, useEffect } from "react";
import { usePharmacy } from "@/lib/pharmacy-store";
import type { PharmacyBatch, PharmacyProduct } from "@/lib/pharmacy-types";
import { format, parseISO, isBefore, addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PAGE_SIZE = 10;

type ExpiryFilter = "all" | "expired" | "in30" | "in90" | "noExpiry";
type AdjustmentFilter = "all" | "received" | "damaged" | "expired" | "correction" | "sold" | "other";

const EXPIRY_FILTERS: { value: ExpiryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "expired", label: "Expired" },
  { value: "in30", label: "In 30 days" },
  { value: "in90", label: "In 90 days" },
  { value: "noExpiry", label: "No expiry" },
];

const ADJUSTMENT_FILTERS: { value: AdjustmentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "received", label: "Received" },
  { value: "damaged", label: "Damaged" },
  { value: "expired", label: "Expired" },
  { value: "correction", label: "Correction" },
  { value: "sold", label: "Sold" },
  { value: "other", label: "Other" },
];

const CHART_COLORS = ["#0d9488", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function PharmacyReportsPage() {
  const { products, batches, adjustments } = usePharmacy();
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("all");
  const [adjustmentFilter, setAdjustmentFilter] =
    useState<AdjustmentFilter>("all");
  const [expiryPage, setExpiryPage] = useState(1);
  const [adjPage, setAdjPage] = useState(1);

  const today = useMemo(() => new Date(), []);
  const in30Days = useMemo(() => addDays(today, 30), [today]);
  const in90Days = useMemo(() => addDays(today, 90), [today]);

  const batchRows = useMemo(() => {
    return batches.map((batch) => {
      const product = products.find((p) => p.id === batch.productId);
      return product ? { batch, product } : null;
    }).filter(Boolean) as { batch: PharmacyBatch; product: PharmacyProduct }[];
  }, [batches, products]);

  const byCategory = useMemo(() => {
    const map = new Map<string, { count: number; totalQty: number }>();
    for (const r of batchRows) {
      const cat = r.product.category || "Uncategorized";
      const existing = map.get(cat) ?? { count: 0, totalQty: 0 };
      existing.count += 1;
      existing.totalQty += r.batch.quantity;
      map.set(cat, existing);
    }
    return Array.from(map.entries()).map(([category, data]) => ({
      category,
      ...data,
      totalQty: data.totalQty,
    }));
  }, [batchRows]);

  const filteredExpiryRows = useMemo(() => {
    return batchRows.filter((r) => {
      if (!r.batch.expiryDate) return expiryFilter === "noExpiry" || expiryFilter === "all";
      const d = parseISO(r.batch.expiryDate);
      if (expiryFilter === "all") return true;
      if (expiryFilter === "expired") return isBefore(d, today);
      if (expiryFilter === "in30") return !isBefore(d, today) && isBefore(d, in30Days);
      if (expiryFilter === "in90") return !isBefore(d, today) && isBefore(d, in90Days);
      if (expiryFilter === "noExpiry") return false;
      return true;
    });
  }, [batchRows, expiryFilter, today, in30Days, in90Days]);

  const filteredAdjustments = useMemo(() => {
    if (adjustmentFilter === "all") return adjustments;
    return adjustments.filter((a) => a.reason === adjustmentFilter);
  }, [adjustments, adjustmentFilter]);

  const adjustmentsByReason = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of adjustments) {
      const count = (map.get(a.reason) ?? 0) + 1;
      map.set(a.reason, count);
    }
    return Array.from(map.entries()).map(([reason, count]) => ({
      name: reason,
      value: count,
    }));
  }, [adjustments]);

  const adjustmentsByReasonQuantity = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of adjustments) {
      const sum = (map.get(a.reason) ?? 0) + a.quantityDelta;
      map.set(a.reason, sum);
    }
    return Array.from(map.entries()).map(([reason, total]) => ({
      reason,
      total,
    }));
  }, [adjustments]);

  const expiryTotalPages = Math.max(
    1,
    Math.ceil(filteredExpiryRows.length / PAGE_SIZE)
  );
  const adjTotalPages = Math.max(
    1,
    Math.ceil(filteredAdjustments.length / PAGE_SIZE)
  );
  const paginatedExpiry = useMemo(
    () =>
      filteredExpiryRows.slice(
        (expiryPage - 1) * PAGE_SIZE,
        expiryPage * PAGE_SIZE
      ),
    [filteredExpiryRows, expiryPage]
  );
  const paginatedAdjustments = useMemo(
    () =>
      filteredAdjustments.slice(
        (adjPage - 1) * PAGE_SIZE,
        adjPage * PAGE_SIZE
      ),
    [filteredAdjustments, adjPage]
  );

  useEffect(() => {
    if (expiryPage > expiryTotalPages) setExpiryPage(1);
  }, [expiryPage, expiryTotalPages]);
  useEffect(() => {
    if (adjPage > adjTotalPages) setAdjPage(1);
  }, [adjPage, adjTotalPages]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-xl font-semibold text-gray-900">Reports</h1>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">
          Inventory by category
        </h2>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="totalQty" fill="#0d9488" name="Total quantity" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-600">
              <tr>
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 pr-4 font-medium">Batches</th>
                <th className="pb-2 font-medium">Total quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {byCategory.map((row) => (
                <tr key={row.category}>
                  <td className="py-2 pr-4 font-medium text-gray-900">
                    {row.category}
                  </td>
                  <td className="py-2 pr-4 text-gray-600">{row.count}</td>
                  <td className="py-2 text-gray-600">{row.totalQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Expiry report</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXPIRY_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setExpiryFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                expiryFilter === f.value
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-600">
              <tr>
                <th className="pb-2 pr-4 font-medium">Product</th>
                <th className="pb-2 pr-4 font-medium">Batch</th>
                <th className="pb-2 pr-4 font-medium">Qty</th>
                <th className="pb-2 font-medium">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedExpiry.map((r) => {
                const expiryDate = r.batch.expiryDate
                  ? parseISO(r.batch.expiryDate)
                  : null;
                const isExpired = expiryDate && isBefore(expiryDate, today);
                const isExpiringIn30Days =
                  expiryDate &&
                  !isBefore(expiryDate, today) &&
                  isBefore(expiryDate, in30Days);
                return (
                  <tr key={r.batch.id}>
                    <td className="py-2 pr-4 text-gray-900">
                      {r.product.name}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {r.batch.batchNumber}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {r.batch.quantity}
                    </td>
                    <td className="py-2">
                      {r.batch.expiryDate ? (
                        isExpired ? (
                          <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            Expired — {format(parseISO(r.batch.expiryDate), "MMM d, yyyy")}
                          </span>
                        ) : isExpiringIn30Days ? (
                          <span className="font-medium text-yellow-600">
                            {format(parseISO(r.batch.expiryDate), "MMM d, yyyy")}
                          </span>
                        ) : (
                          <span className="text-gray-600">
                            {format(parseISO(r.batch.expiryDate), "MMM d, yyyy")}
                          </span>
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredExpiryRows.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">
            No batches match this filter.
          </p>
        )}
        {filteredExpiryRows.length > 0 && expiryTotalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-600">
              Showing {(expiryPage - 1) * PAGE_SIZE + 1}–
              {Math.min(expiryPage * PAGE_SIZE, filteredExpiryRows.length)} of{" "}
              {filteredExpiryRows.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setExpiryPage((p) => Math.max(1, p - 1))}
                disabled={expiryPage === 1}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: expiryTotalPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setExpiryPage(p)}
                    className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm ${
                      expiryPage === p ? "bg-accent text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() =>
                  setExpiryPage((p) => Math.min(expiryTotalPages, p + 1))
                }
                disabled={expiryPage === expiryTotalPages}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">
          Adjustments by reason (gráficas)
        </h2>
        {adjustmentsByReason.length > 0 ? (
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={adjustmentsByReason}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {adjustmentsByReason.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No adjustment data yet.</p>
        )}
        {adjustmentsByReasonQuantity.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Net quantity by reason (in/out)
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={adjustmentsByReasonQuantity}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="reason" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="total"
                    fill="#0d9488"
                    name="Net quantity"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">
          Adjustments history
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ADJUSTMENT_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setAdjustmentFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                adjustmentFilter === f.value
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-600">
              <tr>
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Product</th>
                <th className="pb-2 pr-4 font-medium">Batch</th>
                <th className="pb-2 pr-4 font-medium">Change</th>
                <th className="pb-2 pr-4 font-medium">Reason</th>
                <th className="pb-2 font-medium">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedAdjustments.map((adj) => (
                <tr key={adj.id}>
                  <td className="py-2 pr-4 text-gray-600">
                    {format(parseISO(adj.performedAt), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="py-2 pr-4 text-gray-900">{adj.productName}</td>
                  <td className="py-2 pr-4 text-gray-600">{adj.batchNumber}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={
                        adj.quantityDelta >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {adj.quantityDelta >= 0 ? "+" : ""}
                      {adj.quantityDelta}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-600 capitalize">
                    {adj.reason}
                  </td>
                  <td className="py-2 text-gray-600 capitalize">
                    {adj.performedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAdjustments.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">
            No adjustments recorded.
          </p>
        )}
        {filteredAdjustments.length > 0 && adjTotalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-600">
              Showing {(adjPage - 1) * PAGE_SIZE + 1}–
              {Math.min(adjPage * PAGE_SIZE, filteredAdjustments.length)} of{" "}
              {filteredAdjustments.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAdjPage((p) => Math.max(1, p - 1))}
                disabled={adjPage === 1}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: adjTotalPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAdjPage(p)}
                    className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm ${
                      adjPage === p ? "bg-accent text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => setAdjPage((p) => Math.min(adjTotalPages, p + 1))}
                disabled={adjPage === adjTotalPages}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
