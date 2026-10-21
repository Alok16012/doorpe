export type CartLine = { variantId: string; qty: number };

export type QuoteLine = {
  variantId: string; productSlug: string; name: string; unit: string; icon: string; tint: string;
  qty: number; price: number; mrp: number; available: number; maxPerOrder: number; problem?: "out_of_stock" | "reduced";
};

export type Quote = {
  lines: QuoteLine[];
  itemCount: number;
  mrpTotal: number;
  itemsTotal: number;
  savings: number;
  deliveryFee: number;
  deliveryFeeWaived: number; // what the fee would have been
  handlingFee: number;
  smallCartFee: number;
  tip: number;
  coupon?: { code: string; title: string; discount: number; error?: string };
  grandTotal: number;
  freeDeliveryGap: number; // paise left to unlock free delivery, 0 if unlocked
  etaMin: number | null;
  storeId: string | null;
  storeOpen: boolean;
};

export type OrderStatus = "placed" | "packing" | "packed" | "out_for_delivery" | "delivered" | "cancelled";

export type Address = {
  id: string; userId: string; label: "home" | "work" | "other";
  houseNo: string; floor?: string; building?: string; landmark?: string;
  area: string; city: string; lat: number; lng: number;
  receiverName: string; receiverPhone: string; isDefault: boolean; createdAt: string;
};

export type User = {
  id: string; phone: string; name?: string; email?: string; role: "customer" | "admin";
  walletBalance: number; createdAt: string;
};

export type Order = {
  id: string; code: string; userId: string; storeId: string;
  address: Omit<Address, "userId" | "createdAt" | "isDefault">;
  items: { variantId: string; productSlug: string; name: string; unit: string; icon: string; tint: string; qty: number; price: number; mrp: number }[];
  mrpTotal: number; itemsTotal: number; deliveryFee: number; handlingFee: number; smallCartFee: number;
  tip: number; couponCode?: string; couponDiscount: number; grandTotal: number;
  paymentMethod: "upi" | "card" | "cod" | "wallet";
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  instructions?: string; etaMin: number; deliveryOtp: string;
  rider: { name: string; phone: string; vehicle: string };
  status: OrderStatus;
  /** "auto" = demo progression from timestamps; "manual" = staff advance from /admin. */
  mode: "auto" | "manual";
  placedAt: string; packedAt?: string; dispatchedAt?: string; deliveredAt?: string; cancelledAt?: string;
  cancelReason?: string; rating?: number; idempotencyKey?: string;
};

export type Issue = {
  id: string; orderId: string; userId: string; kind: "missing" | "damaged" | "wrong" | "quality" | "late" | "other";
  itemVariantId?: string; note?: string; photo?: string; status: "open" | "refunded" | "rejected"; refundAmount: number; createdAt: string;
};
