import crypto from "crypto";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const PLANS = {
  monthly: { amount: 49, days: 30 },
  yearly:  { amount: 499, days: 365 },
};

const ALLOWED_ORIGIN = "https://kaash-app.vercel.app";

// ── Firebase Admin init (runs once per serverless instance) ──────
function getDb() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY not set");
    const serviceAccount = JSON.parse(raw);
    // Vercel env vars store \n as literal "\\n" inside the private_key —
    // convert back to real newlines or the key parse will fail.
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    razorpay_order_id, razorpay_payment_id, razorpay_signature,
    plan, userId, userEmail, userName,
  } = req.body || {};

  // ── Input validation ──────────────────────────────────────────
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: "Missing payment fields" });
  }
  if (typeof razorpay_signature !== "string" || razorpay_signature.length > 256) {
    return res.status(400).json({ success: false, error: "Invalid signature format" });
  }
  if (!PLANS[plan]) {
    return res.status(400).json({ success: false, error: "Invalid plan" });
  }
  if (!userId || typeof userId !== "string" || userId.length > 128) {
    return res.status(400).json({ success: false, error: "Invalid user" });
  }
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ success: false, error: "Server config error" });
  }

  // ── HMAC signature verification — the core anti-fraud check ────
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const sigBuf = Buffer.from(razorpay_signature, "utf8");
  const expBuf = Buffer.from(expectedSignature, "utf8");
  const valid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

  if (!valid) {
    console.error("Payment signature mismatch for order:", razorpay_order_id);
    return res.status(400).json({ success: false, error: "Invalid payment signature" });
  }

  // ── Signature is valid. Grant premium SERVER-SIDE via Admin SDK. ──
  // The Admin SDK bypasses Firestore security rules — this is the
  // ONLY place isPremium/premiumExpiry should ever be set. The client
  // can no longer write these fields (see firestore.rules).
  try {
    const db = getDb();
    const now = new Date();
    const expiry = new Date(now.getTime() + PLANS[plan].days * 24 * 60 * 60 * 1000);

    // Idempotency guard: if this payment ID was already processed
    // (e.g. handler fired twice / retried), don't double-grant.
    const paymentRef = db.collection("payments").doc(razorpay_payment_id);
    const existing = await paymentRef.get();
    if (existing.exists) {
      return res.status(200).json({
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        plan,
        premiumExpiry: existing.data().premiumExpiry || expiry.toISOString(),
        alreadyProcessed: true,
      });
    }

    const financialYear = now.getMonth() >= 3
      ? `${now.getFullYear()}-${now.getFullYear() + 1}`
      : `${now.getFullYear() - 1}-${now.getFullYear()}`;

    await db.collection("users").doc(userId).set({
      isPremium: true,
      premiumPlan: plan,
      premiumExpiry: expiry.toISOString(),
      premiumSince: now.toISOString(),
    }, { merge: true });

    await paymentRef.set({
      userId, email: userEmail || "", name: userName || "",
      plan,
      amount: PLANS[plan].amount,
      currency: "INR",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paidAt: now.toISOString(),
      financialYear,
      status: "completed",
    });

    return res.status(200).json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      plan,
      premiumExpiry: expiry.toISOString(),
    });
  } catch (error) {
    console.error("Premium grant failed for payment:", razorpay_payment_id, error);
    // Signature was valid but DB write failed — the user PAID but
    // didn't get premium. Surface this clearly so support can fix it
    // manually rather than silently failing.
    return res.status(500).json({
      success: false,
      error: "Payment verified but activation failed. Contact support with this payment ID: " + razorpay_payment_id,
      paymentVerified: true,
      paymentId: razorpay_payment_id,
    });
  }
}
