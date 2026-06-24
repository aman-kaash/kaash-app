/**
 * /api/verify-play-purchase.js
 *
 * Verifies a Google Play subscription purchase token and grants premium.
 *
 * Called in two cases:
 *   1. Initial purchase: user just subscribed → reVerify: false
 *   2. Re-verification: app open, checking if sub still active → reVerify: true
 *
 * ── Google Play Developer API auth ──────────────────────────────────────
 * Uses a Service Account with "Android Publisher" scope.
 * Required env vars:
 *   GOOGLE_SERVICE_ACCOUNT_JSON  — full JSON string of the service account key
 *   FIREBASE_SERVICE_ACCOUNT_KEY — same key used in verify-payment.js
 *   GOOGLE_PACKAGE_NAME          — e.g. "app.kaash.android"
 *
 * ── Acknowledgement ─────────────────────────────────────────────────────
 * Google requires every purchase to be acknowledged within 3 days.
 * Unacknowledged purchases are auto-refunded. We acknowledge server-side
 * immediately after verification. Safe to call multiple times (idempotent).
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const ALLOWED_ORIGIN = "https://kaash-app.vercel.app";
const PACKAGE_NAME = process.env.GOOGLE_PACKAGE_NAME || "app.kaash.android";
const PLAY_API_BASE = "https://androidpublisher.googleapis.com/androidpublisher/v3";

const PRODUCT_PLAN_MAP = {
  kaash_monthly: { label: "Monthly", days: 30 },
  kaash_yearly:  { label: "Yearly",  days: 365 },
};

// ── Firebase Admin init ─────────────────────────────────────────────────
function getDb() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY not set");
    const sa = JSON.parse(raw);
    if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");
    initializeApp({ credential: cert(sa) });
  }
  return getFirestore();
}

// ── Google Play API auth via service account JWT ────────────────────────
// We use the service account to get a short-lived OAuth2 token, then call
// the Play Developer REST API with it. No googleapis SDK needed — pure fetch.
async function getPlayAccessToken() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not set");
  const sa = JSON.parse(raw);
  if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");

  // Build JWT for Google OAuth2
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const signingInput = `${encode(header)}.${encode(payload)}`;

  // Sign with private key using Web Crypto (available in Node 18+ / Vercel Edge)
  const keyData = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const keyBuffer = Buffer.from(keyData, "base64");

  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "pkcs8", keyBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );

  const signatureBuffer = await globalThis.crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5", cryptoKey,
    Buffer.from(signingInput)
  );
  const signature = Buffer.from(signatureBuffer).toString("base64url");
  const jwt = `${signingInput}.${signature}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Google OAuth2 token error: ${err}`);
  }
  const { access_token } = await tokenRes.json();
  return access_token;
}

// ── Verify subscription via Play Developer API ──────────────────────────
async function verifyPlaySubscription(productId, purchaseToken, accessToken) {
  const url = `${PLAY_API_BASE}/applications/${PACKAGE_NAME}/purchases/subscriptions/${productId}/tokens/${purchaseToken}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Play API error (${res.status}): ${err}`);
  }
  return res.json();
}

// ── Acknowledge purchase (mandatory within 3 days) ──────────────────────
async function acknowledgePlayPurchase(productId, purchaseToken, accessToken) {
  const url = `${PLAY_API_BASE}/applications/${PACKAGE_NAME}/purchases/subscriptions/${productId}/tokens/${purchaseToken}:acknowledge`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ developerPayload: "kaash_premium" }),
  });
  // 204 No Content = success; 200 = also success; already acknowledged = idempotent
  if (!res.ok && res.status !== 204) {
    console.warn(`Acknowledge returned ${res.status} — may already be acknowledged`);
  }
}

// ── Main handler ────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { purchaseToken, productId, userId, userEmail, reVerify } = req.body || {};

  // ── Input validation ─────────────────────────────────────────────────
  if (!purchaseToken || typeof purchaseToken !== "string" || purchaseToken.length > 1024) {
    return res.status(400).json({ success: false, error: "Invalid purchaseToken" });
  }
  if (!PRODUCT_PLAN_MAP[productId]) {
    return res.status(400).json({ success: false, error: "Invalid productId. Must be kaash_monthly or kaash_yearly" });
  }
  if (!userId || typeof userId !== "string" || userId.length > 128) {
    return res.status(400).json({ success: false, error: "Invalid userId" });
  }

  try {
    const accessToken = await getPlayAccessToken();
    const subscription = await verifyPlaySubscription(productId, purchaseToken, accessToken);

    // ── Subscription state check ──────────────────────────────────────
    // paymentState: 0 = pending, 1 = received, 2 = free trial, 3 = pending deferred
    // expiryTimeMillis: subscription end time (including grace period)
    // cancelReason: 0=user, 1=system, 2=replaced, 3=developer
    const now = Date.now();
    const expiryMs = parseInt(subscription.expiryTimeMillis || "0", 10);
    const paymentState = subscription.paymentState;
    const isExpired = expiryMs < now;
    const isCancelled = subscription.cancelReason !== undefined && isExpired;

    // Active: payment received OR free trial, AND not yet expired
    // Grace period: expiryTimeMillis can extend 3–7 days for payment retry
    // We honour the expiry time Google gives us (includes grace period)
    const isActive = (paymentState === 1 || paymentState === 2) && !isExpired;

    if (!isActive) {
      // Subscription lapsed or cancelled — don't update Firestore
      // Let the app handle UI (re-verification polling will catch this)
      return res.status(200).json({
        success: true,
        isActive: false,
        reason: isCancelled ? "cancelled" : "expired",
        expiryTimeMillis: subscription.expiryTimeMillis,
      });
    }

    // ── Acknowledge (mandatory, idempotent) ──────────────────────────
    if (!reVerify) {
      // Only acknowledge on fresh purchase — re-verification doesn't need it
      await acknowledgePlayPurchase(productId, purchaseToken, accessToken);
    }

    // ── Grant premium in Firestore ───────────────────────────────────
    const db = getDb();
    const expiry = new Date(expiryMs).toISOString();
    const plan = PRODUCT_PLAN_MAP[productId];
    const nowIso = new Date().toISOString();

    await db.collection("users").doc(userId).set({
      isPremium: true,
      premiumPlan: productId,
      premiumExpiry: expiry,
      premiumSince: nowIso,
      premiumSource: "play_billing",
      playPurchaseToken: purchaseToken,
    }, { merge: true });

    // Record payment (for admin visibility — no financial data, Play handles that)
    if (!reVerify) {
      await db.collection("payments").doc(`play_${purchaseToken.slice(-20)}`).set({
        userId,
        email: userEmail || "",
        plan: productId,
        source: "play_billing",
        purchaseToken,
        expiryTimeMillis: subscription.expiryTimeMillis,
        autoRenewing: subscription.autoRenewing || false,
        startTimeMillis: subscription.startTimeMillis || nowIso,
        paidAt: nowIso,
        status: "active",
      }, { merge: true });
    }

    return res.status(200).json({
      success: true,
      isActive: true,
      plan: productId,
      premiumExpiry: expiry,
      autoRenewing: subscription.autoRenewing || false,
    });

  } catch (error) {
    console.error("Play purchase verification failed:", error.message);
    // On re-verification, fail safe (don't revoke premium on network error)
    if (reVerify) {
      return res.status(200).json({
        success: true,
        isActive: true, // assume still active if we can't verify
        failSafe: true,
        error: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      error: "Purchase verification failed. Please contact support@kaash.app with your Play order ID.",
      detail: error.message,
    });
  }
}
