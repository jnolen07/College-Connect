import { T, display, mono } from "../theme";

export function Tag({ children, tone = "default" }) {
  const tones = {
    default: { bg: T.surface2, fg: T.muted },
    warm: { bg: T.warmDim, fg: T.warm },
    cool: { bg: T.coolDim, fg: T.cool },
  };
  const t = tones[tone];
  return (
    <span style={{ background: t.bg, color: t.fg, ...mono }} className="text-[11px] tracking-wide px-2 py-1 rounded-sm uppercase">
      {children}
    </span>
  );
}

export function Avatar({ initials, color, size = 40, image }) {
  return (
    <div
      style={{
        width: size, height: size,
        background: image ? `center/cover no-repeat url(${image})` : color,
        boxShadow: `0 0 0 1px ${T.border}`,
      }}
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0 overflow-hidden"
    >
      {!image && <span style={{ ...display, fontSize: size * 0.36 }}>{initials}</span>}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
      <div>
        <div style={{ ...mono, color: T.muted }} className="text-[11px] tracking-widest uppercase mb-1">{eyebrow}</div>
        <h1 style={{ ...display, color: T.text }} className="text-2xl md:text-3xl font-semibold">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({ children, onClick, className = "", disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ background: disabled ? T.surface2 : T.warm, color: disabled ? T.muted : "#0A0C11" }}
      className={`text-sm font-semibold px-4 py-2 rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function FilterPill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? T.warm : "transparent",
        color: active ? "#0A0C11" : T.muted,
        border: `1px solid ${active ? T.warm : T.border}`,
        ...mono,
      }}
      className="text-xs px-3 py-1.5 rounded-full transition-colors"
    >
      {children}
    </button>
  );
}

export function TextField({ label, ...props }) {
  return (
    <div>
      {label && <label style={{ ...mono, color: T.muted }} className="text-[11px] uppercase tracking-wide block mb-1.5">{label}</label>}
      <input
        style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }}
        className="w-full text-sm px-3 py-2.5 rounded-md outline-none focus:border-[#FF9F45] placeholder:text-[#5B5F6E]"
        {...props}
      />
    </div>
  );
}

export function TextAreaField({ label, ...props }) {
  return (
    <div>
      {label && <label style={{ ...mono, color: T.muted }} className="text-[11px] uppercase tracking-wide block mb-1.5">{label}</label>}
      <textarea
        style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }}
        className="w-full text-sm px-3 py-2.5 rounded-md outline-none focus:border-[#FF9F45] placeholder:text-[#5B5F6E]"
        {...props}
      />
    </div>
  );
}

export function SelectField({ label, children, ...props }) {
  return (
    <div>
      {label && <label style={{ ...mono, color: T.muted }} className="text-[11px] uppercase tracking-wide block mb-1.5">{label}</label>}
      <select
        style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }}
        className="w-full text-sm px-3 py-2.5 rounded-md outline-none focus:border-[#FF9F45]"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
