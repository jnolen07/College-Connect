import { AlertTriangle } from "lucide-react";
import { T, display, mono } from "../theme";

export function ConfigNeeded() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ background: T.bg }}>
      <div style={{ background: T.warmDim }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-5">
        <AlertTriangle size={20} color={T.warm} />
      </div>
      <h1 style={{ ...display, color: T.text }} className="text-xl font-semibold mb-2">Almost there</h1>
      <p style={{ color: T.muted }} className="text-sm max-w-sm mb-1">
        This deploy is missing its Supabase configuration.
      </p>
      <p style={{ color: T.muted }} className="text-sm max-w-sm">
        Add <span style={{ ...mono, color: T.text }}>VITE_SUPABASE_URL</span> and{" "}
        <span style={{ ...mono, color: T.text }}>VITE_SUPABASE_ANON_KEY</span> in Vercel's Project Settings →
        Environment Variables, then redeploy.
      </p>
    </div>
  );
}
