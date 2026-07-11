// POST /api/pay — create a Razorpay order for a plan + store the subscriber.
import { NextRequest, NextResponse } from "next/server";
import { createOrder, PLAN_PRICE, Plan } from "@/lib/razorpay";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { plan, phone } = await req.json();
  if (!plan || !["bae", "pro"].includes(plan)) {
    return NextResponse.json({ error: "plan must be bae|pro" }, { status: 400 });
  }
  if (!/^\d{10}$/.test(phone || "")) {
    return NextResponse.json({ error: "10-digit phone required" }, { status: 400 });
  }

  const receipt = `kb_${plan}_${phone}_${Date.now()}`;

  // If keys missing, return a clear demo signal instead of a fake order.
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({
      ok: true,
      demo: true,
      amount: PLAN_PRICE[plan as Plan],
      message: "Razorpay keys not set — add RAZORPAY_KEY_ID/SECRET in .env to go live.",
    });
  }

  const order = await createOrder(plan as Plan, receipt);
  if (order?.error) {
    return NextResponse.json({ error: order.error }, { status: 502 });
  }

  await prisma.subscription.upsert({
    where: { phone },
    update: { plan, status: "created" },
    create: { phone, plan, status: "created" },
  });

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
}
