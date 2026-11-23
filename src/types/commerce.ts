import type { Timestamp } from "firebase/firestore";

export type OrderKind = "listing_fee" | "registration";

export type OrderDoc = {
  id: string;
  orderNumber: string;
  kind: OrderKind;
  hackathonId: string;
  hackathonName?: string;
  hackathonSlug?: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  organizerId: string;
  tierId?: string;
  tierName?: string;
  reservationId?: string;
  couponCode?: string;
  couponId?: string;
  subtotal: number; // paise
  discountAmount: number;
  total: number;
  currency: string;
  status: "pending" | "processing" | "paid" | "failed" | "cancelled" | "refunded" | "expired";
  paymentProvider?: "razorpay" | "dev";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  idempotencyKey: string;
  expiresAt?: Timestamp;
  paidAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type PaymentDoc = {
  id: string;
  orderId: string;
  kind: OrderKind;
  hackathonId: string;
  userId: string;
  organizerId: string;
  provider: "razorpay" | "dev";
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number; // paise
  currency: string;
  status: "pending" | "captured" | "failed" | "refund_pending" | "refunded";
  method?: string;
  failureCode?: string;
  failureMessage?: string;
  capturedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type TicketDoc = {
  id: string;
  ticketNumber: string;
  orderId?: string;
  registrationId: string;
  hackathonId: string;
  hackathonName: string;
  hackathonSlug: string;
  organizerId: string;
  userId: string;
  attendeeName: string;
  attendeeEmail: string;
  tierId?: string;
  tierName: string;
  status: "active" | "used" | "cancelled" | "refunded";
  qrCode: string | null;
  checkedInAt?: Timestamp;
  checkedInBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

