import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { T, display, mono } from "../../theme";
import { SectionHeader, PrimaryButton } from "../../components/ui";
import { LEAGUES } from "../../data/sportsLeagues";

export function ChooseSport({ selected, onNext }) {
  const [pick, setPick] = useState(selected || null);

  return (
    <div>
      <SectionHeader eyebrow="Step 1 of 3" title="Pick your sport" />
      <p style={{ color: T.muted }} className="text-sm mb-6 -mt-4">
        We'll use this to find your teams next.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {LEAGUES.map((l) => {
          const isSelected = pick === l.id;
          return (
            <button
              key={l.id}
              onClick={() => setPick(l.id)}
              style={{
                background: isSelected ? T.warmDim : T.surface,
                border: `1px solid ${isSelected ? T.warm : T.border}`,
              }}
              className="rounded-lg p-4 text-left flex flex-col gap-2 transition-colors hover:brightness-110"
            >
              <span className="text-2xl">{l.emoji}</span>
              <div>
                <div style={{ ...display, color: T.text }} className="text-sm font-semibold leading-tight">{l.label}</div>
                <div style={{ ...mono, color: T.muted }} className="text-[10px] uppercase tracking-wide">{l.sublabel}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex justify-end mt-6">
        <PrimaryButton onClick={() => onNext(pick)} disabled={!pick} className="flex items-center gap-2">
          Continue <ArrowRight size={15} />
        </PrimaryButton>
      </div>
    </div>
  );
}
