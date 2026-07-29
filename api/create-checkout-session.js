import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, school } = req.body || {};
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const schoolParam = encodeURIComponent(school || "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}&school=${schoolParam}`,
      cancel_url: `${origin}/?school=${schoolParam}`,
      client_reference_id: userId,
      metadata: { userId },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session error:", err);
    res.status(500).json({ error: "Couldn't start checkout" });
  }
}
