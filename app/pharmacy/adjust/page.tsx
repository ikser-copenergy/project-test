"use client";

import { useState, useRef, useEffect } from "react";
import { usePharmacy } from "@/lib/pharmacy-store";
import type { AdjustmentReason, PharmacyBatch } from "@/lib/pharmacy-types";
import { ScanLine, Camera } from "lucide-react";
import { format, parseISO, addDays, isBefore } from "date-fns";

const REASON_OPTIONS: { value: AdjustmentReason; label: string }[] = [
  { value: "received", label: "Received" },
  { value: "damaged", label: "Damaged" },
  { value: "expired", label: "Expired" },
  { value: "correction", label: "Correction" },
  { value: "sold", label: "Sold" },
  { value: "other", label: "Other" },
];

export default function PharmacyAdjustPage() {
  const {
    products,
    getProductByBarcodeOrSku,
    getBatchesForProduct,
    addAdjustment,
    adjustments,
  } = usePharmacy();
  const [barcodeOrSku, setBarcodeOrSku] = useState("");
  const [scannedProductId, setScannedProductId] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<PharmacyBatch | null>(null);
  const [quantityDelta, setQuantityDelta] = useState(0);
  const [reason, setReason] = useState<AdjustmentReason>("received");
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const product = scannedProductId
    ? products.find((p) => p.id === scannedProductId) ?? null
    : null;
  const productBatches = scannedProductId
    ? getBatchesForProduct(scannedProductId)
    : [];

  const handleScan = () => {
    setMessage(null);
    setSelectedBatch(null);
    const p = getProductByBarcodeOrSku(barcodeOrSku);
    if (p) {
      setScannedProductId(p.id);
      setQuantityDelta(0);
      setReason("received");
    } else {
      setScannedProductId(null);
      setMessage({
        type: "error",
        text: "Product not found. Enter a valid barcode or SKU.",
      });
    }
  };

  const handleOpenCamera = async () => {
    setMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      setMessage({
        type: "error",
        text: "Camera not available. Use manual entry or simulate scan.",
      });
    }
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedProductId || !selectedBatch) return;
    setMessage(null);
    const delta = Number(quantityDelta);
    if (delta === 0) {
      setMessage({
        type: "error",
        text: "Enter a quantity change (positive or negative).",
      });
      return;
    }
    addAdjustment(scannedProductId, selectedBatch.id, delta, reason);
    const sign = delta > 0 ? "+" : "";
    setMessage({
      type: "success",
      text: `Adjusted ${product?.name} batch ${selectedBatch.batchNumber} by ${sign}${delta}. New quantity: ${selectedBatch.quantity + delta}.`,
    });
    setSelectedBatch(null);
    setScannedProductId(null);
    setBarcodeOrSku("");
    setQuantityDelta(0);
    setReason("received");
  };

  const recentAdjustments = adjustments.slice(0, 15);

  const content = (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-xl font-semibold text-gray-900">Stock adjustment</h1>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">
          Scan or enter barcode / SKU
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. 5901234123457 or MED-001"
              value={barcodeOrSku}
              onChange={(e) => setBarcodeOrSku(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleScan())
              }
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-gray-900 placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <button
            type="button"
            onClick={handleScan}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
          >
            Simulate scan
          </button>
          <button
            type="button"
            onClick={cameraOpen ? handleCloseCamera : handleOpenCamera}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Camera className="h-4 w-4" />
            {cameraOpen ? "Close camera" : "Open camera"}
          </button>
        </div>
      </section>

      {cameraOpen && (
        <section className="rounded-xl border border-gray-200 bg-gray-900 p-4">
          <p className="mb-2 text-sm text-gray-300">
            Point the camera at a barcode to scan (demo: camera preview).
          </p>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-48 w-full rounded-lg bg-black object-cover"
          />
        </section>
      )}

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "error"
              ? "border border-red-200 bg-red-50 text-red-800"
              : "border border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {product && productBatches.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Select batch and adjust quantity
          </h2>
          <p className="mt-1 text-sm text-gray-600">{product.name}</p>
          <div className="mt-3 space-y-2">
            {productBatches.map((batch) => {
              const today = new Date();
              const in30Days = addDays(today, 30);
              const expiryDate = batch.expiryDate
                ? parseISO(batch.expiryDate)
                : null;
              const isExpired = expiryDate && isBefore(expiryDate, today);
              const isExpiringIn30Days =
                expiryDate &&
                !isBefore(expiryDate, today) &&
                isBefore(expiryDate, in30Days);
              return (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() => setSelectedBatch(batch)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                    selectedBatch?.id === batch.id
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Batch {batch.batchNumber} - qty: {batch.quantity}
                  {batch.expiryDate && isExpired && (
                    <span className="ml-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                      Expired {format(parseISO(batch.expiryDate), "MMM d, yyyy")}
                    </span>
                  )}
                  {batch.expiryDate && !isExpired && (
                    <span className={isExpiringIn30Days ? "ml-1 font-medium text-yellow-600" : "ml-1"}>
                      - expires {format(parseISO(batch.expiryDate), "MMM d, yyyy")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedBatch && (
            <form
              onSubmit={handleSubmitAdjustment}
              className="mt-4 space-y-4 border-t border-gray-100 pt-4"
            >
              <p className="text-sm text-gray-600">
                Adjusting batch {selectedBatch.batchNumber} (current:{" "}
                {selectedBatch.quantity})
              </p>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Quantity change (+ or -)
                </span>
                <input
                  type="number"
                  value={quantityDelta || ""}
                  onChange={(e) =>
                    setQuantityDelta(Number(e.target.value) || 0)
                  }
                  placeholder="e.g. 10 or -5"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Reason
                </span>
                <select
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value as AdjustmentReason)
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {REASON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
                >
                  Apply adjustment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBatch(null);
                    setScannedProductId(null);
                    setBarcodeOrSku("");
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {product && productBatches.length === 0 && (
        <p className="text-sm text-amber-700">
          No batches for this product. Add a batch in Inventory.
        </p>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">
          Recent adjustments
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-600">
              <tr>
                <th className="pb-2 pr-4 font-medium">Product</th>
                <th className="pb-2 pr-4 font-medium">Batch</th>
                <th className="pb-2 pr-4 font-medium">Change</th>
                <th className="pb-2 pr-4 font-medium">Reason</th>
                <th className="pb-2 pr-4 font-medium">By</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentAdjustments.map((adj) => (
                <tr key={adj.id}>
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
                  <td className="py-2 pr-4 text-gray-600 capitalize">
                    {adj.performedBy}
                  </td>
                  <td className="py-2 text-gray-500">
                    {format(parseISO(adj.performedAt), "MMM d, HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentAdjustments.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">
            No adjustments yet.
          </p>
        )}
      </section>
    </div>
  );

  return content;
}
