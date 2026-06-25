import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Razorpay = require("razorpay");

// Prices in paise (100 paise = ₹1)
const PLANS = {
  monthly: { amount: 4900,  rupees: 49  },
  yearly:  { amount: 49900, rupees: 499 },
};

const ALLOWED_ORIGIN = "https://kaash-app.vercel.app";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { plan, userId, userEmail } = req.body || {};

  if (!PLANS[plan]) return res.status(400).json({ error: "Invalid plan" });
  if (!userId || typeof userId !== "string" || userId.length > 128) {
    return res.status(400).json({ error: "Invalid user" });
  }
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: "Payment system not configured" });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const receipt = `kaash_${userId.slice(0, 15)}_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: PLANS[plan].amount,
      currency: "INR",
      receipt,
      notes: { plan, userId, userEmail: userEmail || "", rupees: PLANS[plan].rupees },
    });
    return res.status(200).json({ id: order.id, amount: order.amount, currency: order.currency, plan });
  } catch (error) {
    console.error("Razorpay order error:", error.message || error);
    return res.status(500).json({ error: "Order creation failed", detail: error.message });
  }
}
