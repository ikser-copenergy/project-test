export type UserRole = "pharmacist" | "admin";

/** Catalog product (same barcode can have multiple batches with different expiry) */
export interface PharmacyProduct {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  reorderLevel: number;
  requiresColdChain?: boolean;
}

/** Stock batch: one per product + expiry (same barcode, different batch/expiry) */
export interface PharmacyBatch {
  id: string;
  productId: string;
  batchNumber: string;
  quantity: number;
  expiryDate?: string;
}

export type AdjustmentReason =
  | "received"
  | "damaged"
  | "expired"
  | "correction"
  | "sold"
  | "other";

export interface StockAdjustment {
  id: string;
  productId: string;
  batchId: string;
  productName: string;
  batchNumber: string;
  quantityDelta: number;
  reason: AdjustmentReason;
  performedBy: UserRole;
  performedAt: string;
}
