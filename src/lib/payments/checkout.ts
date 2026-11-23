"use client";

export type RazorpayCheckoutOptions = {
  key: string;
  amount: number; // paise
  currency?: string;
  name?: string;
  description: string;
  orderId: string;
  prefill?: { name?: string; email?: string };
  notes?: Record<string, string>;
};

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

let loadPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser only"));
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Razorpay Checkout. Check your internet connection or ad blocker."));
    };
    document.body.appendChild(script);
  });
  return loadPromise;
}

export async function openRazorpayCheckout(opts: RazorpayCheckoutOptions): Promise<RazorpaySuccessResponse> {
  await loadRazorpayScript();
  const Rzp = (window as unknown as { Razorpay?: new (o: Record<string, unknown>) => { open: () => void; on: (e: string, fn: (r: unknown) => void) => void } }).Razorpay;
  if (!Rzp) throw new Error("Razorpay Checkout failed to initialize.");

  return new Promise((resolve, reject) => {
    const instance = new Rzp({
      key: opts.key,
      amount: opts.amount,
      currency: opts.currency ?? "INR",
      name: opts.name ?? "HACKSYRA",
      description: opts.description,
      order_id: opts.orderId,
      prefill: opts.prefill,
      notes: opts.notes,
      theme: { color: "#1565D8" },
      modal: {
        ondismiss: () => reject(new Error("Payment was cancelled before completion.")),
      },
      handler: (response: RazorpaySuccessResponse) => resolve(response),
    });

    instance.on("payment.failed", (resp: unknown) => {
      const desc = (resp as { error?: { description?: string } })?.error?.description;
      reject(new Error(desc || "Payment failed. You can retry safely."));
    });
    instance.open();
  });
}

