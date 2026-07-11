// KharchaBae — Telegram alert notifier (GenZ Urdu push).
// Create a bot via @BotFather, set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in .env.

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT = process.env.TELEGRAM_CHAT_ID || "";

export async function sendTelegram(message: string) {
  if (!TOKEN || !CHAT) {
    console.log("[telegram] (disabled) would send:\n" + message);
    return;
  }
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT, text: message, parse_mode: "Markdown" }),
  });
}

export function costAlertMessage(city: string, total: number, source: string): string {
  const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
  return (
    `💸 *KharchaBae update!*\n` +
    `${city} ka full monthly kharcha: *${inr(total)}*/month\n` +
    `Source: ${source === "live" ? "🔴 LIVE scrape" : "⚪ seed demo"}\n` +
    `Agar bombay se shift kiya, bae? Check now 🔗`
  );
}
