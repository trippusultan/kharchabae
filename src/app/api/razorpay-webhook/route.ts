// POST /api/razorpay-webhook — verify + activate a subscription on payment success.
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  const body = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";

  if (secret) {
    const expected = createHmac("sha256", secret).update(body).digest("hex");
    if (expected !== sig) return NextResponse.json({ error: "bad sig" }, { status: 400 });
  }

  const evt = JSON.parse(body);
  if (evt?.event === "payment.captured") {
    const orderId = evt.payload?.payment?.entity?.order_id;
    const phone = (evt.payload?.payment?.entity?.notes?.phone ||
      evt.payload?.order?.entity?.notes?.phone || "") as string;
    if (phone) {
      await prisma.subscription.updateMany({
        where: { phone },
        data: { status: "active", razorpaySubId: orderId },
      });
    }
  }
  return NextResponse.json({ ok: true });
}
