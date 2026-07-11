// KharchaBae — Razorpay helper (Indian UPI + subscriptions).
// Docs: https://razorpay.com/docs/api/payments/ . Set keys in .env.

import { createHmac } from "crypto";

const KEY = process.env.RAZORPAY_KEY_ID || "";
const SECRET = process.env.RAZORPAY_KEY_SECRET || "";

function auth() {
  return "Basic " + Buffer.from(`${KEY}:${SECRET}`).toString("base64");
}

export type Plan = "bae" | "pro";

export const PLAN_PRICE: Record<Plan, number> = {
  bae: 19900, // ₹199/mo (amount in paise)
  pro: 49900, // ₹499/mo
};

export const PLAN_LABEL: Record<Plan, string> = {
  bae: "Bae Plan",
  pro: "Pro Bae",
};

// Create a Razorpay order. Returns the full order object incl. id.
export async function createOrder(plan: Plan, receipt: string) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth() },
    body: JSON.stringify({
      amount: PLAN_PRICE[plan],
      currency: "INR",
      receipt,
      payment_capture: true,
    }),
  });
  return res.json();
}

// Verify the Razorpay signature on a successful payment.
// signature = sha256(order_id + "|" + payment_id, secret)
export async function verifyPayment(orderId: string, paymentId: string, signature: string) {
  if (!SECRET) return false;
  const expected = createHmac("sha256", SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}
