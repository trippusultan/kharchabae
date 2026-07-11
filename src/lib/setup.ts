// KharchaBae — setup status (server-side env checks for the status panel).
// Env vars are server-only, so we compute booleans here and pass to the client.

export type SetupStatus = {
  razorpay: boolean;       // RAZORPAY_KEY_ID present
  bdEndpoint: boolean;     // SBR_WS_ENDPOINT is a wss:// url
  bdApiKey: boolean;       // BRIGHTDATA_API_KEY present
  telegram: boolean;       // TELEGRAM_BOT_TOKEN present
  // Known billing caveat: the free $2 test credit does NOT cover the Browser API
  // (confirmed from Bright Data's own UI). Live rent scraping needs a real balance.
  bdCreditsCaveat: boolean;
};

export function getSetupStatus(): SetupStatus {
  return {
    razorpay: Boolean(process.env.RAZORPAY_KEY_ID),
    bdEndpoint: (process.env.SBR_WS_ENDPOINT || "").startsWith("wss://"),
    bdApiKey: Boolean(process.env.BRIGHTDATA_API_KEY),
    telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    bdCreditsCaveat: true,
  };
}
