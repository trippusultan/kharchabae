"use client";

import { useState } from "react";

declare global {
  interface Window { Razorpay: any; }
}

function loadRazorpay(): Promise<any> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(window.Razorpay);
    document.body.appendChild(s);
  });
}

export function PayButton({ plan, price, label }: { plan: "bae" | "pro"; price: string; label: string }) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function pay() {
    if (!/^\d{10}$/.test(phone)) { setStatus("10 digit ka number daal bae 📱"); return; }
    setBusy(true); setStatus("order bana raha...");
    const r = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, phone }),
    });
    const data = await r.json();
    if (data.demo) { setStatus(data.message + ` (demo ₹${price})`); setBusy(false); return; }
    if (!data.orderId) { setStatus("Order ban nahi paya — keys check karo."); setBusy(false); return; }

    const Razorpay = await loadRazorpay();
    const rzp = new Razorpay({
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "KharchaBae",
      description: label,
      order_id: data.orderId,
      prefill: { contact: phone },
      method: { upi: true, card: true, netbanking: true, wallet: true },
      handler: () => setStatus("Payment done! 🎉 Welcome to " + label + " bestie."),
      modal: { ondismiss: () => setStatus("Payment band kar diya? phir try karo 💸") },
    });
    rzp.open();
    setBusy(false);
  }

  return (
    <div className="neo p-5 flex-1">
      <h3 className="text-xl font-bold gold-text">{label}</h3>
      <p className="text-3xl font-extrabold my-2 gold-text">₹{price}<span className="text-sm text-[var(--muted)]">/mo</span></p>
      <input
        className="w-full neo-inset px-3 py-2 text-sm bg-transparent text-[var(--text)] mb-3 outline-none"
        placeholder="phone (10 digit)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button className="btn-gold w-full" onClick={pay} disabled={busy}>
        {busy ? "soch raha..." : "Pay via UPI 💳"}
      </button>
      {status && <p className="text-xs text-[var(--muted)] mt-2">{status}</p>}
    </div>
  );
}
