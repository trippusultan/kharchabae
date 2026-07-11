// POST /api/refresh — enqueue a cost refresh job (BullMQ).
import { NextRequest, NextResponse } from "next/server";
import { enqueueRefresh, startWorker } from "@/lib/queue";

export async function POST(req: NextRequest) {
  startWorker();
  await enqueueRefresh();
  return NextResponse.json({ ok: true, message: "refresh queued bae 💅" });
}
