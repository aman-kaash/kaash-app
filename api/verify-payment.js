import crypto from "crypto";

const PLANS = { monthly: { amount: 49 }, yearly: { amount: 499 } };
const ALLOWED_ORIGIN = "https://kaash-app.vercel.app";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    razorpay_order_id, razorpay_payment_id, razorpay_signature,
    plan, userId, userEmail,
  } = req.body || {};

  // Input validation
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: "Missing payment fields" });
  }
  if (typeof razorpay_signature !== "string" || razorpay_signature.length > 256) {
    return res.status(400).json({ success: false, error: "Invalid signature format" });
  }
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ success: false, error: "Server config error" });
  }

  // HMAC signature verification — the core anti-fraud check
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  // Timing-safe comparison to prevent timing attacks
  const sigBuf = Buffer.from(razorpay_signature, "utf8");
  const expBuf = Buffer.from(expectedSignature, "utf8");
  const valid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

  if (!valid) {
    console.error("Payment signature mismatch for order:", razorpay_order_id);
    return res.status(400).json({ success: false, error: "Invalid payment signature" });
  }

  return res.status(200).json({
    success: true,
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    plan,
    amount: PLANS[plan]?.amount || 49,
    userId,
    userEmail,
    paidAt: new Date().toISOString(),
  });
}
