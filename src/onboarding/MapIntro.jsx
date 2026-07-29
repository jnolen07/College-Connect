import { useState } from "react";
import { MapPin, ArrowRight, Sparkles } from "lucide-react";
import { T, display } from "../theme";
import { matchSchools } from "../data/schools";

const MAP_SPOTS = [
  { x: 165, y: 170 }, { x: 290, y: 165 }, { x: 470, y: 195 }, { x: 625, y: 180 },
  { x: 140, y: 360 }, { x: 605, y: 330 }, { x: 705, y: 525 }, { x: 190, y: 595 },
  { x: 355, y: 595 }, { x: 515, y: 605 }, { x: 650, y: 650 }, { x: 260, y: 690 },
];

function pickSpot(query) {
  let h = 0;
  for (let i = 0; i < query.length; i++) h = (h * 31 + query.charCodeAt(i)) % MAP_SPOTS.length;
  return MAP_SPOTS[Math.abs(h)];
}

export function MapIntro({ onDone }) {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("idle"); // idle -> liftoff -> flying -> arriving -> flashing -> fading
  const [spot, setSpot] = useState(MAP_SPOTS[0]);
  const suggestions = phase === "idle" ? matchSchools(query) : [];

  const go = (value) => {
    const finalQuery = (value ?? query).trim();
    if (!finalQuery || phase !== "idle") return;
    setQuery(finalQuery);
    setSpot(pickSpot(finalQuery.toLowerCase()));
    setPhase("liftoff");
    setTimeout(() => setPhase("flying"), 280);
    setTimeout(() => setPhase("arriving"), 1300);
    setTimeout(() => setPhase("flashing"), 2050);
    setTimeout(() => setPhase("fading"), 2300);
    setTimeout(() => onDone(finalQuery), 2950);
  };

  const fracX = spot.x / 800;
  const fracY = spot.y / 800;
  const dx = (0.5 - fracX) * 100;
  const dy = (0.5 - fracY) * 100;
  const panned = phase !== "idle" && phase !== "liftoff";
  const arrived = phase === "arriving" || phase === "flashing" || phase === "fading";

  const scale = phase === "idle" ? 1 : phase === "liftoff" ? 0.92 : phase === "flying" ? 2.3 : 9;
  const duration = phase === "liftoff" ? 280 : phase === "flying" ? 1000 : phase === "arriving" ? 750 : 300;
  const easing = phase === "flying" ? "cubic-bezier(0.45,0,0.2,1)" : phase === "arriving" ? "cubic-bezier(0.3,0,0.15,1)" : "ease-out";

  // Flight-path overlay lives in a fixed 0-100 percent space, independent of the map's own zoom.
  const pathId = "flightpath";
  const showPath = phase === "liftoff" || phase === "flying";

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#080A0E" }}>
      <div
        className="absolute inset-0 transition-transform"
        style={{
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: easing,
          transform: `translate(${panned ? dx : 0}%, ${panned ? dy : 0}%) scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      >
        <MapArt pinX={spot.x} pinY={spot.y} bounce={arrived} />
      </div>

      {/* Flight path: a curved line + traveling beacon from center to destination */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: showPath ? 1 : 0, transition: "opacity 300ms" }}>
        <path
          id={pathId}
          d={`M 50 50 Q ${(50 + dx * -1 + 50) / 2} ${(50 + dy * -1 + 50) / 2 - 12} ${50 - dx} ${50 - dy}`}
          fill="none" stroke={T.warm} strokeWidth="0.25" strokeDasharray="1.5 1.5" opacity="0.5"
        />
        {phase === "flying" && (
          <circle r="0.9" fill={T.warm}>
            <animateMotion dur="1000ms" fill="freeze" path={`M 50 50 Q ${(50 + dx * -1 + 50) / 2} ${(50 + dy * -1 + 50) / 2 - 12} ${50 - dx} ${50 - dy}`} />
          </circle>
        )}
      </svg>

      {/* Warm flash right before the cut to black */}
      <div
        className="absolute inset-0 transition-opacity pointer-events-none"
        style={{ background: T.warm, transitionDuration: "250ms", opacity: phase === "flashing" ? 0.55 : 0 }}
      />

      <div
        className="absolute inset-0 bg-black transition-opacity"
        style={{ transitionDuration: "650ms", opacity: phase === "fading" ? 1 : 0, pointerEvents: "none" }}
      />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 transition-opacity"
        style={{ opacity: phase === "idle" ? 1 : 0, transitionDuration: "300ms" }}
      >
        <div style={{ background: T.warm }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(255,159,69,0.5)]">
          <Sparkles size={22} color="#0A0C11" />
        </div>
        <h1 style={{ ...display, color: T.text }} className="text-3xl md:text-4xl font-semibold mb-2 text-center">College Connect</h1>
        <p style={{ color: T.muted }} className="text-sm mb-8 text-center">Type your school to find your campus</p>
        <div
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
          className="flex items-center gap-2 rounded-full px-4 py-3 w-full max-w-sm shadow-[0_0_60px_rgba(255,159,69,0.08)]"
        >
          <MapPin size={16} color={T.warm} className="shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go()}
            placeholder="e.g. UC Berkeley"
            style={{ color: T.text }}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#5B5F6E]"
          />
          <button
            onClick={() => go()}
            disabled={!query.trim()}
            style={{ background: query.trim() ? T.warm : T.surface2 }}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors disabled:cursor-not-allowed"
          >
            <ArrowRight size={15} color={query.trim() ? "#0A0C11" : T.muted} />
          </button>
        </div>
        {suggestions.length > 0 && (
          <div
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
            className="w-full max-w-sm mt-2 rounded-xl overflow-hidden"
          >
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => go(s)}
                style={{ color: T.text, borderColor: T.border }}
                className="w-full text-left text-sm px-4 py-2.5 hover:bg-[#1B1F2A] border-b last:border-b-0 flex items-center gap-2"
              >
                <MapPin size={12} color={T.muted} className="shrink-0" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MapArt({ pinX = 405, pinY = 440, bounce = false }) {
  // Decorative abstract campus map — grid of blocks, paths, and a glowing pin.
  return (
    <svg viewBox="0 0 800 800" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="800" fill="#0D1017" />
      <g stroke="#1C2130" strokeWidth="1.5">
        {Array.from({ length: 17 }).map((_, i) => (
          <line key={"v" + i} x1={i * 50} y1="0" x2={i * 50} y2="800" />
        ))}
        {Array.from({ length: 17 }).map((_, i) => (
          <line key={"h" + i} x1="0" y1={i * 50} x2="800" y2={i * 50} />
        ))}
      </g>
      <path d="M0 420 Q 250 380 400 430 T 800 400" stroke="#2A3142" strokeWidth="10" fill="none" opacity="0.6" />
      <path d="M300 0 Q 340 300 420 440 T 500 800" stroke="#2A3142" strokeWidth="10" fill="none" opacity="0.6" />
      {[
        [120, 140, 90, 60], [260, 120, 60, 90], [420, 160, 100, 70], [590, 130, 70, 100],
        [100, 320, 80, 80], [560, 300, 90, 60], [670, 480, 70, 90], [140, 560, 100, 70],
        [320, 560, 70, 70], [470, 560, 90, 90], [620, 620, 60, 60], [220, 660, 80, 60],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="6" fill="#161B26" stroke="#232838" strokeWidth="1" />
      ))}
      {bounce && (
        <circle cx={pinX} cy={pinY} r="4" fill="none" stroke={T.warm} strokeWidth="2" opacity="0.7">
          <animate attributeName="r" values="4;34;4" dur="900ms" begin="0s" fill="freeze" />
          <animate attributeName="opacity" values="0.7;0;0" dur="900ms" begin="0s" fill="freeze" />
        </circle>
      )}
      <circle cx={pinX} cy={pinY} r="7" fill={T.warm} />
      <circle cx={pinX} cy={pinY} r="16" fill={T.warm} opacity="0.25">
        <animate attributeName="r" values="10;26;10" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
