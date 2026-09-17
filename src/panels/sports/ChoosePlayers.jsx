import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, RefreshCw, Search } from "lucide-react";
import { T, display, mono } from "../../theme";
import { SectionHeader, PrimaryButton, Avatar, Tag } from "../../components/ui";
import { fetchRoster } from "../../lib/sportsApi";

export function ChoosePlayers({ league, teams, initialSelected, onBack, onDone }) {
  const [rosters, setRosters] = useState({}); // teamId -> players[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Map(initialSelected.map((p) => [p.id, p])));

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(teams.map((t) => fetchRoster(league, t.id)));
      const byTeam = {};
      teams.forEach((t, i) => { byTeam[t.id] = results[i]; });
      setRosters(byTeam);
    } catch (err) {
      console.error("Rosters fetch failed:", err);
      setError("Couldn't load rosters. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [league.id, teams.map((t) => t.id).join(",")]);

  const toggle = (player) => {
    setSelected((prev) => {
      const next = new Map(prev);
      next.has(player.id) ? next.delete(player.id) : next.set(player.id, player);
      return next;
    });
  };

  const q = query.trim().toLowerCase();

  return (
    <div>
      <SectionHeader eyebrow="Step 3 of 3" title="Follow specific players" />
      <p style={{ color: T.muted }} className="text-sm mb-5 -mt-4">
        Optional — pick players to spotlight their stats. Skip to see the full team box score instead.
      </p>

      {!loading && !error && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}` }} className="flex items-center gap-2 mb-5 rounded-md px-3 py-2 max-w-sm">
          <Search size={15} color={T.muted} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players..."
            style={{ color: T.text }}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#5B5F6E]"
          />
        </div>
      )}

      {loading && <p style={{ color: T.muted }} className="text-sm">Loading rosters...</p>}

      {error && (
        <div className="flex items-center gap-3">
          <p style={{ color: "#F45B69" }} className="text-sm">{error}</p>
          <button onClick={load} style={{ color: T.cool }} className="text-sm font-medium flex items-center gap-1">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-6">
          {teams.map((team) => {
            const roster = (rosters[team.id] || []).filter((p) => !q || p.name.toLowerCase().includes(q));
            if (q && roster.length === 0) return null;
            return (
              <div key={team.id}>
                <div className="flex items-center gap-2 mb-2.5">
                  <Avatar initials={team.abbrev.slice(0, 2)} color={T.surface2} size={22} image={team.logo} />
                  <span style={{ ...display, color: T.text }} className="text-sm font-semibold">{team.name}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roster.map((p) => {
                    const isSelected = selected.has(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggle(p)}
                        style={{
                          background: isSelected ? T.warmDim : T.surface,
                          border: `1px solid ${isSelected ? T.warm : T.border}`,
                        }}
                        className="rounded-md p-2.5 flex items-center gap-2.5 text-left transition-colors hover:brightness-110"
                      >
                        <Avatar initials={(p.name || "?").slice(0, 2).toUpperCase()} color={T.surface2} size={26} image={p.headshot} />
                        <div className="min-w-0 flex-1">
                          <div style={{ color: T.text }} className="text-sm font-medium truncate">{p.name}</div>
                          {p.position && <span style={{ ...mono, color: T.muted }} className="text-[10px] uppercase">{p.position}{p.jersey ? ` · #${p.jersey}` : ""}</span>}
                        </div>
                        {isSelected && <Check size={15} color={T.warm} className="shrink-0" />}
                      </button>
                    );
                  })}
                  {roster.length === 0 && <p style={{ color: T.muted }} className="text-xs">No roster data for this team right now.</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected.size > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {Array.from(selected.values()).map((p) => <Tag key={p.id} tone="warm">{p.name}</Tag>)}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button onClick={onBack} style={{ ...mono, color: T.muted }} className="text-xs uppercase tracking-wide flex items-center gap-1.5 hover:text-[#F2F1EC] transition-colors">
          <ArrowLeft size={13} /> Back
        </button>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button onClick={() => onDone([])} style={{ ...mono, color: T.muted }} className="text-xs uppercase tracking-wide hover:text-[#F2F1EC] transition-colors">
              Clear & skip
            </button>
          )}
          <PrimaryButton onClick={() => onDone(Array.from(selected.values()))}>
            {selected.size === 0 ? "Skip for now" : `Done (${selected.size})`}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
