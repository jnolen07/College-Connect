import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, Search } from "lucide-react";
import { T, mono } from "../../theme";
import { SectionHeader, PrimaryButton, Avatar } from "../../components/ui";
import { fetchTeams } from "../../lib/sportsApi";

export function ChooseTeams({ league, initialSelected, onBack, onNext }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Map(initialSelected.map((t) => [t.id, t])));

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchTeams(league);
      setTeams(list);
    } catch (err) {
      console.error("Teams fetch failed:", err);
      setError("Couldn't load teams. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [league.id]);

  const toggle = (team) => {
    setSelected((prev) => {
      const next = new Map(prev);
      next.has(team.id) ? next.delete(team.id) : next.set(team.id, team);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) => t.name.toLowerCase().includes(q) || t.abbrev.toLowerCase().includes(q));
  }, [teams, query]);

  return (
    <div>
      <SectionHeader eyebrow="Step 2 of 3" title={`Follow your ${league.label.toLowerCase()} teams`} />
      <p style={{ color: T.muted }} className="text-sm mb-5 -mt-4">
        Pick one or more teams — we'll check them for games every day.
      </p>

      {!loading && !error && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}` }} className="flex items-center gap-2 mb-4 rounded-md px-3 py-2 max-w-sm">
          <Search size={15} color={T.muted} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams..."
            style={{ color: T.text }}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#5B5F6E]"
          />
        </div>
      )}

      {loading && <p style={{ color: T.muted }} className="text-sm">Loading teams...</p>}

      {error && (
        <div className="flex items-center gap-3">
          <p style={{ color: "#F45B69" }} className="text-sm">{error}</p>
          <button onClick={load} style={{ color: T.cool }} className="text-sm font-medium flex items-center gap-1">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {filtered.map((t) => {
            const isSelected = selected.has(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggle(t)}
                style={{
                  background: isSelected ? T.warmDim : T.surface,
                  border: `1px solid ${isSelected ? T.warm : T.border}`,
                }}
                className="rounded-md p-3 flex items-center gap-2.5 text-left transition-colors hover:brightness-110"
              >
                <Avatar initials={t.abbrev.slice(0, 2)} color={T.surface2} size={28} image={t.logo} />
                <span style={{ color: T.text }} className="text-sm font-medium truncate">{t.name}</span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p style={{ color: T.muted }} className="text-sm col-span-full">No teams match "{query}".</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button onClick={onBack} style={{ ...mono, color: T.muted }} className="text-xs uppercase tracking-wide flex items-center gap-1.5 hover:text-[#F2F1EC] transition-colors">
          <ArrowLeft size={13} /> Back
        </button>
        <PrimaryButton onClick={() => onNext(Array.from(selected.values()))} disabled={selected.size === 0} className="flex items-center gap-2">
          Continue ({selected.size}) <ArrowRight size={15} />
        </PrimaryButton>
      </div>
    </div>
  );
}
