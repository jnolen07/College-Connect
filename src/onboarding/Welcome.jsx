import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { T, display, mono } from "../theme";
import { PrimaryButton } from "../components/ui";

export function Welcome({ school, onNext }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6" style={{ background: "#080A0E" }}>
      <div className="transition-all" style={{ opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)", transitionDuration: "700ms" }}>
        <div style={{ ...mono, color: T.cool }} className="text-xs tracking-widest uppercase text-center mb-3">{school}</div>
        <h1 style={{ ...display, color: T.text }} className="text-4xl md:text-5xl font-semibold text-center mb-3">Welcome to<br />College Connect</h1>
        <p style={{ color: T.muted }} className="text-sm text-center mb-10 max-w-sm mx-auto">
          Find your people on campus — by major, by sport, by whatever you're into.
        </p>
        <div className="flex justify-center">
          <PrimaryButton onClick={onNext} className="px-6 py-3 flex items-center gap-2">
            Next <ArrowRight size={15} />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
