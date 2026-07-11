"use client";

import type { SetupStatus } from "@/lib/setup";

function Dot({ ok, warn }: { ok: boolean; warn?: boolean }) {
  const color = warn ? "#c9a227" : ok ? "#c9a227" : "#6b5d2a";
  const on = ok || warn;
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle"
      style={{ background: color, boxShadow: on ? `0 0 8px ${color}` : "none", opacity: on ? 1 : 0.5 }}
    />
  );
}

function Row({ label, ok, warn, hint }: { label: string; ok: boolean; warn?: boolean; hint?: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="flex items-center text-sm text-[var(--text)]">
        <Dot ok={ok} warn={warn} />
        {label}
      </span>
      <span className="text-xs text-[var(--muted)]">{hint}</span>
    </div>
  );
}

export function SetupStatusPanel({ status }: { status: SetupStatus }) {
  return (
    <div className="neo p-6 mt-10">
      <h2 className="text-lg font-bold gold-text">⚙️ Setup status</h2>
      <Row label="Razorpay UPI" ok={status.razorpay} hint={status.razorpay ? "live (test)" : "add keys"} />
      <Row label="Bright Data endpoint" ok={status.bdEndpoint} hint={status.bdEndpoint ? "wss set" : "missing"} />
      <Row label="Bright Data API key" ok={status.bdApiKey} hint={status.bdApiKey ? "set" : "missing"} />
      <Row
        label="Bright Data credits"
        ok={false}
        warn={status.bdCreditsCaveat}
        hint="⚠ add funds (free $2 ≠ Browser API)"
      />
      <Row label="Telegram alerts" ok={status.telegram} hint={status.telegram ? "on" : "optional"} />
      <p className="text-xs text-[var(--muted)] mt-3">
        Gold = configured. Dim = not set. Live rent needs a paid BD balance.
      </p>
    </div>
  );
}
