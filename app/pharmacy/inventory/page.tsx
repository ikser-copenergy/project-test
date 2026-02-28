"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePharmacy } from "@/lib/pharmacy-store";
import type { PharmacyProduct, PharmacyBatch } from "@/lib/pharmacy-types";
import { Plus, Pencil, Trash2, Search, Thermometer, Lock, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;
import { format, parseISO, isBefore, addDays } from "date-fns";

type ProductFormState = Omit<PharmacyProduct, "id"> & { id?: string };
type BatchFormState = Omit<PharmacyBatch, "id" | "productId"> & {
  productId?: string;
};

const defaultProductForm: ProductFormState = {
  name: "",
  sku: "",
  barcode: "",
  category: "",
  reorderLevel: 10,
  requiresColdChain: false,
};

const defaultBatchForm: BatchFormState = {
  batchNumber: "",
  quantity: 0,
  expiryDate: "",
};

function PharmacyInventoryContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter") ?? "";
  const {
    products,
    batches,
    currentRole,
    addProductAndBatch,
    updateProduct,
    updateBatch,
    removeProduct,
    removeBatch,
    getProductTotalQuantity,
  } = usePharmacy();
  const [search, setSearch] = useState("");
  const [editingBatch, setEditingBatch] = useState<{
    batch: PharmacyBatch;
    product: PharmacyProduct;
  } | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormState>(defaultProductForm);
  const [batchForm, setBatchForm] = useState<BatchFormState>(defaultBatchForm);
  const [currentPage, setCurrentPage] = useState(1);

  const isAdmin = currentRole === "admin";
  const today = useMemo(() => new Date(), []);
  const in30Days = useMemo(() => addDays(today, 30), [today]);

  const rows = useMemo(() => {
    return batches.map((batch) => {
      const product = products.find((p) => p.id === batch.productId);
      return product ? { batch, product } : null;
    }).filter(Boolean) as { batch: PharmacyBatch; product: PharmacyProduct }[];
  }, [batches, products]);

  const filtered = useMemo(() => {
    let list = rows.filter(
      (r) =>
        r.product.name.toLowerCase().includes(search.toLowerCase()) ||
        r.product.sku.toLowerCase().includes(search.toLowerCase()) ||
        (r.product.barcode && r.product.barcode.includes(search)) ||
        r.product.category.toLowerCase().includes(search.toLowerCase()) ||
        r.batch.batchNumber.toLowerCase().includes(search.toLowerCase())
    );
    if (filterParam === "low") {
      list = list.filter(
        (r) => getProductTotalQuantity(r.product.id) <= r.product.reorderLevel
      );
    } else if (filterParam === "expired") {
      list = list.filter(
        (r) =>
          r.batch.expiryDate && isBefore(parseISO(r.batch.expiryDate), today)
      );
    } else if (filterParam === "expiring") {
      list = list.filter(
        (r) =>
          r.batch.expiryDate &&
          !isBefore(parseISO(r.batch.expiryDate), today) &&
          isBefore(parseISO(r.batch.expiryDate), in30Days)
      );
    }
    return list;
  }, [rows, search, filterParam, today, in30Days, getProductTotalQuantity]);

  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (p) => getProductTotalQuantity(p.id) <= p.reorderLevel
      ),
    [products, getProductTotalQuantity]
  );

  const handleAddProductAndBatch = (e: React.FormEvent) => {
    e.preventDefault();
    addProductAndBatch(
      {
        name: productForm.name,
        sku: productForm.sku,
        barcode: productForm.barcode || undefined,
        category: productForm.category,
        reorderLevel: productForm.reorderLevel,
        requiresColdChain: productForm.requiresColdChain,
      },
      {
        batchNumber: batchForm.batchNumber || "BATCH-1",
        quantity: Number(batchForm.quantity) || 0,
        expiryDate: batchForm.expiryDate || undefined,
      }
    );
    setProductForm(defaultProductForm);
    setBatchForm(defaultBatchForm);
    setAddingProduct(false);
  };

  const handleUpdateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    updateBatch(editingBatch.batch.id, {
      batchNumber: batchForm.batchNumber,
      quantity: Number(batchForm.quantity) || 0,
      expiryDate: batchForm.expiryDate || undefined,
    });
    setEditingBatch(null);
    setBatchForm(defaultBatchForm);
  };

  const openEditBatch = (r: { batch: PharmacyBatch; product: PharmacyProduct }) => {
    setEditingBatch(r);
    setBatchForm({
      batchNumber: r.batch.batchNumber,
      quantity: r.batch.quantity,
      expiryDate: r.batch.expiryDate ?? "",
    });
  };

  const maskSensitive = (value: string | undefined) =>
    isAdmin ? value : (value ? "***" : "—");

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(
    () =>
      filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
      ),
    [filtered, currentPage]
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, SKU, barcode, batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:w-64"
          />
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setAddingProduct(true);
              setProductForm(defaultProductForm);
              setBatchForm(defaultBatchForm);
            }}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
          >
            <Plus className="h-4 w-4" />
            Add product
          </button>
        )}
      </div>

      {filterParam && (
        <p className="text-sm text-gray-600">
          Filter:{" "}
          {filterParam === "low"
            ? "Low stock"
            : filterParam === "expired"
              ? "Expired"
              : filterParam === "expiring"
                ? "Expiring soon"
                : filterParam}
        </p>
      )}

      {lowStockProducts.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>{lowStockProducts.length}</strong> product(s) at or below
          reorder level.
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-900">Product</th>
                <th className="px-4 py-3 font-medium text-gray-900">SKU</th>
                <th className="px-4 py-3 font-medium text-gray-900">Barcode</th>
                <th className="px-4 py-3 font-medium text-gray-900">Category</th>
                <th className="px-4 py-3 font-medium text-gray-900">Batch</th>
                <th className="px-4 py-3 font-medium text-gray-900">Qty</th>
                <th className="px-4 py-3 font-medium text-gray-900">Reorder</th>
                <th className="px-4 py-3 font-medium text-gray-900">Expiry</th>
                <th className="px-4 py-3 font-medium text-gray-900">Cold</th>
                {isAdmin && (
                  <th className="w-20 px-4 py-3" aria-label="Actions" />
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRows.map((r) => {
                const totalQty = getProductTotalQuantity(r.product.id);
                const isLow = totalQty <= r.product.reorderLevel;
                const expiryDate = r.batch.expiryDate
                  ? parseISO(r.batch.expiryDate)
                  : null;
                const isExpired = expiryDate && isBefore(expiryDate, today);
                const isExpiringIn30Days =
                  expiryDate &&
                  !isBefore(expiryDate, today) &&
                  isBefore(expiryDate, in30Days);
                return (
                  <tr key={r.batch.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.product.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.product.sku}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.product.barcode ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.product.category}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {maskSensitive(r.batch.batchNumber)}
                      {!isAdmin && r.batch.batchNumber && (
                        <Lock className="ml-1 inline h-3 w-3 text-gray-400" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          isLow
                            ? "font-medium text-amber-600"
                            : "text-gray-900"
                        }
                      >
                        {r.batch.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.product.reorderLevel}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
                      {r.product.requiresColdChain ? (
                        <span title="Cold chain">
                          <Thermometer className="h-4 w-4 text-blue-600" />
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEditBatch(r)}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Edit batch"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBatch(r.batch.id)}
                            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete batch"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-gray-500">
            No batches match your search.
          </p>
        )}
        {filtered.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium ${
                    currentPage === p ? "bg-accent text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {addingProduct && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Add product and batch
            </h2>
            <form
              onSubmit={handleAddProductAndBatch}
              className="mt-4 space-y-4"
            >
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Name</span>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">SKU</span>
                <input
                  type="text"
                  value={productForm.sku}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, sku: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Barcode</span>
                <input
                  type="text"
                  value={productForm.barcode}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, barcode: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Optional"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Category
                </span>
                <input
                  type="text"
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Reorder level
                </span>
                <input
                  type="number"
                  min={0}
                  value={productForm.reorderLevel}
                  onChange={(e) =>
                    setProductForm((f) => ({
                      ...f,
                      reorderLevel: Number(e.target.value) || 0,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
              <hr className="border-gray-200" />
              <p className="text-sm font-medium text-gray-700">First batch</p>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Batch number
                </span>
                <input
                  type="text"
                  value={batchForm.batchNumber}
                  onChange={(e) =>
                    setBatchForm((f) => ({ ...f, batchNumber: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="e.g. B2024-001"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Quantity
                </span>
                <input
                  type="number"
                  min={0}
                  value={batchForm.quantity}
                  onChange={(e) =>
                    setBatchForm((f) => ({
                      ...f,
                      quantity: Number(e.target.value) || 0,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Expiry date
                </span>
                <input
                  type="date"
                  value={batchForm.expiryDate}
                  onChange={(e) =>
                    setBatchForm((f) => ({ ...f, expiryDate: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={productForm.requiresColdChain}
                  onChange={(e) =>
                    setProductForm((f) => ({
                      ...f,
                      requiresColdChain: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
                <span className="text-sm font-medium text-gray-700">
                  Requires cold chain
                </span>
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setAddingProduct(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingBatch && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Edit batch — {editingBatch.product.name}
            </h2>
            <form onSubmit={handleUpdateBatch} className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Batch number
                </span>
                <input
                  type="text"
                  value={batchForm.batchNumber}
                  onChange={(e) =>
                    setBatchForm((f) => ({ ...f, batchNumber: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Quantity
                </span>
                <input
                  type="number"
                  min={0}
                  value={batchForm.quantity}
                  onChange={(e) =>
                    setBatchForm((f) => ({
                      ...f,
                      quantity: Number(e.target.value) || 0,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Expiry date
                </span>
                <input
                  type="date"
                  value={batchForm.expiryDate}
                  onChange={(e) =>
                    setBatchForm((f) => ({ ...f, expiryDate: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBatch(null);
                    setBatchForm(defaultBatchForm);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PharmacyInventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl p-4 text-gray-500">Loading...</div>
      }
    >
      <PharmacyInventoryContent />
    </Suspense>
  );
}
