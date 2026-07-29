import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Stripe needs the raw request body to verify the webhook signature, so
// Vercel's default JSON body parsing has to be disabled for this route.
export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// service_role bypasses RLS -- this is the only place in the whole app that
// is allowed to write to the payments table (see supabase/schema.sql).
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const signature = req.headers["stripe-signature"];
  const rawBody = await readRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id || session.metadata?.userId;

    if (userId) {
      const { error } = await supabaseAdmin.from("payments").upsert({
        profile_id: userId,
        stripe_session_id: session.id,
        amount_cents: session.amount_total,
      });
      if (error) console.error("Failed to record payment:", error.message);
    } else {
      console.error("Checkout completed with no client_reference_id/userId in metadata");
    }
  }

  res.status(200).json({ received: true });
}
