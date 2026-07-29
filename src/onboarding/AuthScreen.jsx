import { useState } from "react";
import { Send, Lock } from "lucide-react";
import { supabase } from "../supabaseClient";
import { T, display } from "../theme";
import { PrimaryButton } from "../components/ui";

// Real authentication via Supabase Auth magic links — no password to manage,
// and the resulting session (auth.uid()) is what every Row Level Security
// policy in supabase/schema.sql scopes reads and writes to.
export function AuthScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!email.trim() || sending) return;
    setSending(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ background: "#080A0E" }}>
        <div style={{ background: T.coolDim }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-5">
          <Send size={18} color={T.cool} />
        </div>
        <h1 style={{ ...display, color: T.text }} className="text-2xl font-semibold mb-2">Check your email</h1>
        <p style={{ color: T.muted }} className="text-sm max-w-xs">
          We sent a sign-in link to <span style={{ color: T.text }}>{email}</span>. Open it on this device to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6" style={{ background: "#080A0E" }}>
      <div style={{ background: T.warmDim }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-5">
        <Lock size={20} color={T.warm} />
      </div>
      <h1 style={{ ...display, color: T.text }} className="text-2xl font-semibold mb-1 text-center">College Connect</h1>
      <p style={{ color: T.muted }} className="text-sm mb-8 text-center max-w-xs">
        Sign in with your email — we'll send a magic link, no password needed.
      </p>
      <div
        style={{ background: T.surface, border: `1px solid ${error ? "#F45B69" : T.border}` }}
        className="flex items-center gap-2 rounded-full px-4 py-3 w-full max-w-xs"
      >
        <input
          autoFocus
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="you@school.edu"
          style={{ color: T.text }}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#5B5F6E]"
        />
      </div>
      {error && <p style={{ color: "#F45B69" }} className="text-xs mt-2 max-w-xs text-center">{error}</p>}
      <PrimaryButton onClick={submit} disabled={sending || !email.trim()} className="mt-5 px-6 py-2.5">
        {sending ? "Sending..." : "Send magic link"}
      </PrimaryButton>
    </div>
  );
}
