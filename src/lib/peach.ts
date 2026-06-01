import crypto from "crypto";

const PEACH_TEST_CHECKOUT_URL = "https://testsecure.peachpayments.com/checkout";
const PEACH_LIVE_CHECKOUT_URL = "https://secure.peachpayments.com/checkout";

export function getPeachCheckoutUrl() {
  return process.env.PEACH_SANDBOX === "false" ? PEACH_LIVE_CHECKOUT_URL : PEACH_TEST_CHECKOUT_URL;
}

export function hasPeachCheckoutConfig() {
  return Boolean(process.env.PEACH_ENTITY_ID && process.env.PEACH_SECRET_TOKEN);
}

export function buildPeachSignature(params: Record<string, string | number | undefined>, secretToken?: string) {
  if (!secretToken) return "";

  const message = Object.entries(params)
    .filter(([key]) => key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}${value ?? ""}`)
    .join("");

  return crypto.createHmac("sha256", secretToken).update(message).digest("hex");
}

export function verifyPeachSignature(params: Record<string, string>, secretToken?: string) {
  const received = params.signature;
  if (!received || !secretToken) return false;
  return buildPeachSignature(params, secretToken) === received;
}

export function buildPeachWebhookHeaderSignature({
  timestamp,
  webhookId,
  url,
  payload,
  secretToken
}: {
  timestamp: string;
  webhookId: string;
  url: string;
  payload: string;
  secretToken?: string;
}) {
  if (!secretToken) return "";
  return crypto
    .createHmac("sha256", secretToken)
    .update(`${timestamp}.${webhookId}.${url}.${payload}`)
    .digest("hex");
}

export function createPeachMerchantTransactionId(prefix = "SR") {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `${prefix}${stamp}${random}`.slice(0, 16);
}

export function createPeachNonce() {
  return crypto.randomBytes(24).toString("hex");
}

export function isPeachSuccessfulResult(code?: string) {
  return Boolean(code?.startsWith("000.100."));
}

export function isPeachPendingResult(code?: string) {
  return Boolean(code?.startsWith("000.200."));
}

export function isPeachCancelledOrFailedResult(code?: string) {
  return Boolean(code && !isPeachSuccessfulResult(code) && !isPeachPendingResult(code));
}
