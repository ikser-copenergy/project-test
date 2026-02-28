"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import {
  PharmacyProduct,
  PharmacyBatch,
  StockAdjustment,
  UserRole,
  AdjustmentReason,
} from "@/lib/pharmacy-types";
import { addDays, subDays, format } from "date-fns";

const initialProducts: PharmacyProduct[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    sku: "MED-001",
    barcode: "5901234123457",
    category: "Pain relief",
    reorderLevel: 30,
    requiresColdChain: false,
  },
  {
    id: "2",
    name: "Ibuprofen 400mg",
    sku: "MED-002",
    barcode: "5901234123458",
    category: "Pain relief",
    reorderLevel: 25,
    requiresColdChain: false,
  },
  {
    id: "3",
    name: "Vitamin C 1000mg",
    sku: "VIT-001",
    barcode: "5901234123459",
    category: "Vitamins",
    reorderLevel: 20,
    requiresColdChain: false,
  },
  {
    id: "4",
    name: "Antiseptic solution",
    sku: "OTC-001",
    barcode: "5901234123460",
    category: "First aid",
    reorderLevel: 15,
    requiresColdChain: false,
  },
  {
    id: "5",
    name: "Blood pressure monitor",
    sku: "EQ-001",
    barcode: "5901234123461",
    category: "Equipment",
    reorderLevel: 5,
    requiresColdChain: false,
  },
  {
    id: "6",
    name: "Insulin vial 10ml",
    sku: "RX-001",
    barcode: "5901234123462",
    category: "Prescription",
    reorderLevel: 10,
    requiresColdChain: true,
  },
  {
    id: "7",
    name: "Omeprazole 20mg",
    sku: "MED-003",
    barcode: "5901234123463",
    category: "Digestive",
    reorderLevel: 40,
    requiresColdChain: false,
  },
  {
    id: "8",
    name: "Vitamin D3 2000 IU",
    sku: "VIT-002",
    barcode: "5901234123464",
    category: "Vitamins",
    reorderLevel: 25,
    requiresColdChain: false,
  },
  {
    id: "9",
    name: "Bandages assorted",
    sku: "OTC-002",
    barcode: "5901234123465",
    category: "First aid",
    reorderLevel: 50,
    requiresColdChain: false,
  },
  {
    id: "10",
    name: "Thermometer digital",
    sku: "EQ-002",
    barcode: "5901234123466",
    category: "Equipment",
    reorderLevel: 10,
    requiresColdChain: false,
  },
  {
    id: "11",
    name: "Amoxicillin 500mg",
    sku: "RX-002",
    barcode: "5901234123467",
    category: "Prescription",
    reorderLevel: 20,
    requiresColdChain: false,
  },
  {
    id: "12",
    name: "Aspirin 100mg",
    sku: "MED-004",
    barcode: "5901234123468",
    category: "Pain relief",
    reorderLevel: 60,
    requiresColdChain: false,
  },
];

const initialBatches: PharmacyBatch[] = [
  { id: "b1", productId: "1", batchNumber: "B2024-001", quantity: 80, expiryDate: format(addDays(new Date(), 180), "yyyy-MM-dd") },
  { id: "b2", productId: "1", batchNumber: "B2024-002", quantity: 40, expiryDate: format(addDays(new Date(), 60), "yyyy-MM-dd") },
  { id: "b3", productId: "2", batchNumber: "B2024-002", quantity: 85, expiryDate: format(addDays(new Date(), 90), "yyyy-MM-dd") },
  { id: "b4", productId: "3", batchNumber: "B2024-003", quantity: 45, expiryDate: format(addDays(new Date(), 45), "yyyy-MM-dd") },
  { id: "b5", productId: "4", batchNumber: "B2023-101", quantity: 12, expiryDate: format(subDays(new Date(), 5), "yyyy-MM-dd") },
  { id: "b6", productId: "5", batchNumber: "EQ-001", quantity: 8, expiryDate: undefined },
  { id: "b7", productId: "6", batchNumber: "B2024-010", quantity: 24, expiryDate: format(addDays(new Date(), 30), "yyyy-MM-dd") },
  { id: "b8", productId: "7", batchNumber: "B2024-101", quantity: 120, expiryDate: format(addDays(new Date(), 200), "yyyy-MM-dd") },
  { id: "b9", productId: "7", batchNumber: "B2024-102", quantity: 60, expiryDate: format(addDays(new Date(), 75), "yyyy-MM-dd") },
  { id: "b10", productId: "8", batchNumber: "B2024-201", quantity: 90, expiryDate: format(addDays(new Date(), 120), "yyyy-MM-dd") },
  { id: "b11", productId: "9", batchNumber: "B2024-301", quantity: 200, expiryDate: format(addDays(new Date(), 400), "yyyy-MM-dd") },
  { id: "b12", productId: "9", batchNumber: "B2024-302", quantity: 80, expiryDate: format(addDays(new Date(), 15), "yyyy-MM-dd") },
  { id: "b13", productId: "10", batchNumber: "EQ-002", quantity: 15, expiryDate: undefined },
  { id: "b14", productId: "11", batchNumber: "B2024-401", quantity: 50, expiryDate: format(addDays(new Date(), 90), "yyyy-MM-dd") },
  { id: "b15", productId: "11", batchNumber: "B2024-402", quantity: 30, expiryDate: format(addDays(new Date(), 20), "yyyy-MM-dd") },
  { id: "b16", productId: "12", batchNumber: "B2024-501", quantity: 150, expiryDate: format(addDays(new Date(), 250), "yyyy-MM-dd") },
  { id: "b17", productId: "12", batchNumber: "B2024-502", quantity: 45, expiryDate: format(subDays(new Date(), 2), "yyyy-MM-dd") },
  { id: "b18", productId: "3", batchNumber: "B2024-004", quantity: 30, expiryDate: format(addDays(new Date(), 100), "yyyy-MM-dd") },
  { id: "b19", productId: "2", batchNumber: "B2024-003", quantity: 25, expiryDate: format(addDays(new Date(), 12), "yyyy-MM-dd") },
  { id: "b20", productId: "6", batchNumber: "B2024-011", quantity: 12, expiryDate: format(addDays(new Date(), 60), "yyyy-MM-dd") },
];

const initialAdjustments: StockAdjustment[] = [
  { id: "adj-1", productId: "1", batchId: "b1", productName: "Paracetamol 500mg", batchNumber: "B2024-001", quantityDelta: 20, reason: "received", performedBy: "admin", performedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: "adj-2", productId: "4", batchId: "b5", productName: "Antiseptic solution", batchNumber: "B2023-101", quantityDelta: -3, reason: "damaged", performedBy: "pharmacist", performedAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: "adj-3", productId: "2", batchId: "b3", productName: "Ibuprofen 400mg", batchNumber: "B2024-002", quantityDelta: 50, reason: "received", performedBy: "admin", performedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "adj-4", productId: "12", batchId: "b17", productName: "Aspirin 100mg", batchNumber: "B2024-502", quantityDelta: -45, reason: "expired", performedBy: "pharmacist", performedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "adj-5", productId: "7", batchId: "b8", productName: "Omeprazole 20mg", batchNumber: "B2024-101", quantityDelta: 80, reason: "received", performedBy: "admin", performedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "adj-6", productId: "9", batchId: "b11", productName: "Bandages assorted", batchNumber: "B2024-301", quantityDelta: -10, reason: "damaged", performedBy: "pharmacist", performedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "adj-7", productId: "3", batchId: "b4", productName: "Vitamin C 1000mg", batchNumber: "B2024-003", quantityDelta: -15, reason: "sold", performedBy: "pharmacist", performedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "adj-8", productId: "1", batchId: "b2", productName: "Paracetamol 500mg", batchNumber: "B2024-002", quantityDelta: 5, reason: "correction", performedBy: "admin", performedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "adj-9", productId: "6", batchId: "b7", productName: "Insulin vial 10ml", batchNumber: "B2024-010", quantityDelta: -8, reason: "sold", performedBy: "pharmacist", performedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "adj-10", productId: "8", batchId: "b10", productName: "Vitamin D3 2000 IU", batchNumber: "B2024-201", quantityDelta: 40, reason: "received", performedBy: "admin", performedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "adj-11", productId: "10", batchId: "b13", productName: "Thermometer digital", batchNumber: "EQ-002", quantityDelta: -2, reason: "other", performedBy: "pharmacist", performedAt: new Date(Date.now() - 43200000).toISOString() },
  { id: "adj-12", productId: "11", batchId: "b14", productName: "Amoxicillin 500mg", batchNumber: "B2024-401", quantityDelta: 25, reason: "received", performedBy: "admin", performedAt: new Date(Date.now() - 43200000).toISOString() },
  { id: "adj-13", productId: "5", batchId: "b6", productName: "Blood pressure monitor", batchNumber: "EQ-001", quantityDelta: -1, reason: "damaged", performedBy: "pharmacist", performedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "adj-14", productId: "9", batchId: "b12", productName: "Bandages assorted", batchNumber: "B2024-302", quantityDelta: 30, reason: "received", performedBy: "admin", performedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: "adj-15", productId: "12", batchId: "b16", productName: "Aspirin 100mg", batchNumber: "B2024-501", quantityDelta: -20, reason: "sold", performedBy: "pharmacist", performedAt: new Date(Date.now() - 600000).toISOString() },
];

type PharmacyAction =
  | { type: "SET_PRODUCTS"; products: PharmacyProduct[] }
  | { type: "ADD_PRODUCT"; product: PharmacyProduct }
  | { type: "UPDATE_PRODUCT"; id: string; product: Partial<PharmacyProduct> }
  | { type: "REMOVE_PRODUCT"; id: string }
  | { type: "SET_BATCHES"; batches: PharmacyBatch[] }
  | { type: "ADD_BATCH"; batch: PharmacyBatch }
  | { type: "UPDATE_BATCH"; id: string; batch: Partial<PharmacyBatch> }
  | { type: "REMOVE_BATCH"; id: string }
  | { type: "SET_ADJUSTMENTS"; adjustments: StockAdjustment[] }
  | { type: "ADD_ADJUSTMENT"; adjustment: StockAdjustment }
  | { type: "SET_ROLE"; role: UserRole };

interface PharmacyState {
  products: PharmacyProduct[];
  batches: PharmacyBatch[];
  adjustments: StockAdjustment[];
  currentRole: UserRole;
}

function pharmacyReducer(
  state: PharmacyState,
  action: PharmacyAction
): PharmacyState {
  switch (action.type) {
    case "SET_PRODUCTS":
      return { ...state, products: action.products };
    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.product] };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.id ? { ...p, ...action.product } : p
        ),
      };
    case "REMOVE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.id),
        batches: state.batches.filter((b) => b.productId !== action.id),
      };
    case "SET_BATCHES":
      return { ...state, batches: action.batches };
    case "ADD_BATCH":
      return { ...state, batches: [...state.batches, action.batch] };
    case "UPDATE_BATCH":
      return {
        ...state,
        batches: state.batches.map((b) =>
          b.id === action.id ? { ...b, ...action.batch } : b
        ),
      };
    case "REMOVE_BATCH":
      return {
        ...state,
        batches: state.batches.filter((b) => b.id !== action.id),
      };
    case "SET_ADJUSTMENTS":
      return { ...state, adjustments: action.adjustments };
    case "ADD_ADJUSTMENT": {
      const adj = action.adjustment;
      return {
        ...state,
        adjustments: [adj, ...state.adjustments],
        batches: state.batches.map((b) => {
          if (b.id !== adj.batchId) return b;
          const q = b.quantity + adj.quantityDelta;
          return { ...b, quantity: Math.max(0, q) };
        }),
      };
    }
    case "SET_ROLE":
      return { ...state, currentRole: action.role };
    default:
      return state;
  }
}

interface PharmacyContextValue {
  products: PharmacyProduct[];
  batches: PharmacyBatch[];
  adjustments: StockAdjustment[];
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  addProduct: (product: Omit<PharmacyProduct, "id">) => void;
  addProductAndBatch: (
    product: Omit<PharmacyProduct, "id">,
    batch: Omit<PharmacyBatch, "id" | "productId">
  ) => void;
  updateProduct: (id: string, product: Partial<PharmacyProduct>) => void;
  removeProduct: (id: string) => void;
  addBatch: (batch: Omit<PharmacyBatch, "id">) => void;
  updateBatch: (id: string, batch: Partial<PharmacyBatch>) => void;
  removeBatch: (id: string) => void;
  addAdjustment: (
    productId: string,
    batchId: string,
    quantityDelta: number,
    reason: AdjustmentReason
  ) => void;
  getProductByBarcodeOrSku: (barcodeOrSku: string) => PharmacyProduct | null;
  getBatchesForProduct: (productId: string) => PharmacyBatch[];
  getProductTotalQuantity: (productId: string) => number;
}

const PharmacyContext = createContext<PharmacyContextValue | null>(null);

const initialState: PharmacyState = {
  products: initialProducts,
  batches: initialBatches,
  adjustments: initialAdjustments,
  currentRole: "pharmacist",
};

export function PharmacyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(pharmacyReducer, initialState);

  const setRole = useCallback((role: UserRole) => {
    dispatch({ type: "SET_ROLE", role });
  }, []);

  const addProduct = useCallback(
    (product: Omit<PharmacyProduct, "id">) => {
      const id = "p-" + Date.now();
      dispatch({ type: "ADD_PRODUCT", product: { ...product, id } });
    },
    []
  );

  const addProductAndBatch = useCallback(
    (
      product: Omit<PharmacyProduct, "id">,
      batch: Omit<PharmacyBatch, "id" | "productId">
    ) => {
      const productId = "p-" + Date.now();
      dispatch({ type: "ADD_PRODUCT", product: { ...product, id: productId } });
      dispatch({
        type: "ADD_BATCH",
        batch: { ...batch, id: "b-" + Date.now(), productId },
      });
    },
    []
  );

  const updateProduct = useCallback(
    (id: string, product: Partial<PharmacyProduct>) => {
      dispatch({ type: "UPDATE_PRODUCT", id, product });
    },
    []
  );

  const removeProduct = useCallback((id: string) => {
    dispatch({ type: "REMOVE_PRODUCT", id });
  }, []);

  const addBatch = useCallback(
    (batch: Omit<PharmacyBatch, "id">) => {
      const id = "b-" + Date.now();
      dispatch({ type: "ADD_BATCH", batch: { ...batch, id } });
    },
    []
  );

  const updateBatch = useCallback(
    (id: string, batch: Partial<PharmacyBatch>) => {
      dispatch({ type: "UPDATE_BATCH", id, batch });
    },
    []
  );

  const removeBatch = useCallback((id: string) => {
    dispatch({ type: "REMOVE_BATCH", id });
  }, []);

  const addAdjustment = useCallback(
    (
      productId: string,
      batchId: string,
      quantityDelta: number,
      reason: AdjustmentReason
    ) => {
      const product = state.products.find((p) => p.id === productId);
      const batch = state.batches.find((b) => b.id === batchId);
      if (!product || !batch) return;
      const adjustment: StockAdjustment = {
        id: "adj-" + Date.now(),
        productId,
        batchId,
        productName: product.name,
        batchNumber: batch.batchNumber,
        quantityDelta,
        reason,
        performedBy: state.currentRole,
        performedAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_ADJUSTMENT", adjustment });
    },
    [state.products, state.batches, state.currentRole]
  );

  const getProductByBarcodeOrSku = useCallback(
    (barcodeOrSku: string) => {
      const q = barcodeOrSku.trim().toLowerCase();
      if (!q) return null;
      return (
        state.products.find(
          (p) =>
            p.sku.toLowerCase() === q ||
            (p.barcode && p.barcode === barcodeOrSku.trim())
        ) ?? null
      );
    },
    [state.products]
  );

  const getBatchesForProduct = useCallback(
    (productId: string) =>
      state.batches.filter((b) => b.productId === productId),
    [state.batches]
  );

  const getProductTotalQuantity = useCallback(
    (productId: string) =>
      state.batches
        .filter((b) => b.productId === productId)
        .reduce((sum, b) => sum + b.quantity, 0),
    [state.batches]
  );

  const value: PharmacyContextValue = {
    products: state.products,
    batches: state.batches,
    adjustments: state.adjustments,
    currentRole: state.currentRole,
    setRole,
    addProduct,
    addProductAndBatch,
    updateProduct,
    removeProduct,
    addBatch,
    updateBatch,
    removeBatch,
    addAdjustment,
    getProductByBarcodeOrSku,
    getBatchesForProduct,
    getProductTotalQuantity,
  };

  return (
    <PharmacyContext.Provider value={value}>
      {children}
    </PharmacyContext.Provider>
  );
}

export function usePharmacy() {
  const ctx = useContext(PharmacyContext);
  if (!ctx) throw new Error("usePharmacy must be used within PharmacyProvider");
  return ctx;
}
