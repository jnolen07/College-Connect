import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "../supabaseClient";
import { T, display, mono } from "../theme";
import { PrimaryButton } from "../components/ui";

// $1.99, once, before a profile can be created. The real enforcement lives in
// the "own insert profile" RLS policy in supabase/schema.sql (which requires
// a row in `payments` to exist) -- this screen is just the UI for getting
// there. See api/create-checkout-session.js and api/stripe-webhook.js for the
// server side of this.
export function Paywall({ school, userId, onPaid }) {
  const params = new URLSearchParams(window.location.search);
  const returningSessionId = params.get("session_id");

  const [checking, setChecking] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("profile_id")
        .eq("profile_id", userId)
        .maybeSingle();
      if (!active) return;

      if (data && !error) {
        window.history.replaceState({}, "", window.location.pathname);
        onPaid();
        return;
      }

      attemptsRef.current += 1;
      // Just came back from Stripe -- the webhook may still be landing, so
      // give it a few seconds before showing the paywall as a fallback.
      if (returningSessionId && attemptsRef.current < 6) {
        setTimeout(check, 1500);
      } else {
        window.history.replaceState({}, "", window.location.pathname);
        setChecking(false);
      }
    };

    check();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const startCheckout = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, school }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout start failed:", err);
      setStarting(false);
      setError("Couldn't start checkout — check your connection and try again.");
    }
  };

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: T.bg }}>
        <span style={{ ...mono, color: T.muted }} className="text-xs uppercase tracking-widest">
          {returningSessionId ? "Confirming your payment..." : "Loading..."}
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ background: "#080A0E" }}>
      <div style={{ background: T.warm }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(255,159,69,0.5)]">
        <Sparkles size={22} color="#0A0C11" />
      </div>
      <h1 style={{ ...display, color: T.text }} className="text-2xl md:text-3xl font-semibold mb-2">Unlock College Connect</h1>
      <p style={{ color: T.muted }} className="text-sm mb-1 max-w-xs">
        A one-time $1.99 — no subscription, no recurring charge.
      </p>
      <p style={{ color: T.muted }} className="text-sm mb-8 max-w-xs">
        Covers your account at {school} for good.
      </p>
      <PrimaryButton onClick={startCheckout} disabled={starting} className="px-6 py-3">
        {starting ? "Redirecting to checkout..." : "Pay $1.99 to continue"}
      </PrimaryButton>
      {returningSessionId && !starting && (
        <p style={{ color: T.muted }} className="text-xs mt-4 max-w-xs">
          Already paid but still seeing this? Give it a moment and reload — payment confirmations can take a few seconds.
        </p>
      )}
      {error && <p style={{ color: "#F45B69" }} className="text-xs mt-4 max-w-xs">{error}</p>}
    </div>
  );
}
