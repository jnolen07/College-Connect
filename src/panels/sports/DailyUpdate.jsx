import { useEffect, useMemo, useState } from "react";
import { Calendar, RefreshCw, Settings } from "lucide-react";
import { T, display, mono } from "../../theme";
import { SectionHeader, Avatar, Tag } from "../../components/ui";
import { fetchScoreboard, fetchSummary, todayStamp } from "../../lib/sportsApi";

function formatCategoryName(name = "") {
  const withSpaces = name.replace(/([a-z])([A-Z])/g, "$1 $2");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function statusLabel(event) {
  const status = event?.status;
  const state = status?.type?.state;
  if (state === "pre") {
    return new Date(event.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return status?.type?.shortDetail || status?.type?.description || "Final";
}

export function DailyUpdate({ league, teams, players, onEdit }) {
  const [events, setEvents] = useState([]);
  const [summaries, setSummaries] = useState({}); // eventId -> boxscore data | null (error)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const teamIds = useMemo(() => new Set(teams.map((t) => t.id)), [teams]);
  const playersByTeam = useMemo(() => {
    const map = new Map();
    for (const p of players) {
      if (!map.has(p.teamId)) map.set(p.teamId, new Set());
      map.get(p.teamId).add(p.id);
    }
    return map;
  }, [players]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const evs = await fetchScoreboard(league, todayStamp());
      const relevant = evs.filter((ev) =>
        ev.competitions?.[0]?.competitors?.some((c) => teamIds.has(String(c.team?.id)))
      );
      setEvents(relevant);

      const toFetch = relevant.filter((ev) => ev.status?.type?.state !== "pre");
      const results = {};
      await Promise.all(toFetch.map(async (ev) => {
        try {
          results[ev.id] = await fetchSummary(league, ev.id);
        } catch (err) {
          console.error(`Summary fetch failed for event ${ev.id}:`, err);
          results[ev.id] = null;
        }
      }));
      setSummaries(results);
      setLastChecked(new Date());
    } catch (err) {
      console.error("Scoreboard fetch failed:", err);
      setError("Couldn't load today's games. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [league.id, teams.map((t) => t.id).join(","), players.map((p) => p.id).join(",")]);

  const playingTeamIds = new Set();
  events.forEach((ev) => ev.competitions?.[0]?.competitors?.forEach((c) => {
    if (teamIds.has(String(c.team?.id))) playingTeamIds.add(String(c.team?.id));
  }));
  const idleTeams = teams.filter((t) => !playingTeamIds.has(t.id));

  return (
    <div>
      <SectionHeader
        eyebrow={new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        title="Sport Mode"
        action={
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading} style={{ background: T.surface2, color: T.muted }} className="p-2 rounded-md hover:brightness-125 transition-colors disabled:opacity-50">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={onEdit} style={{ background: T.surface2, color: T.muted }} className="p-2 rounded-md hover:brightness-125 transition-colors">
              <Settings size={15} />
            </button>
          </div>
        }
      />

      {lastChecked && (
        <p style={{ ...mono, color: T.muted }} className="text-[11px] uppercase tracking-wide -mt-4 mb-6">
          Checked {lastChecked.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </p>
      )}

      {loading && events.length === 0 && <p style={{ color: T.muted }} className="text-sm">Checking today's games...</p>}

      {error && (
        <div className="flex items-center gap-3 mb-4">
          <p style={{ color: "#F45B69" }} className="text-sm">{error}</p>
          <button onClick={load} style={{ color: T.cool }} className="text-sm font-medium flex items-center gap-1">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-6 flex items-center gap-3 mb-6">
          <Calendar size={18} color={T.muted} />
          <p style={{ color: T.muted }} className="text-sm">None of your teams play today. Check back tomorrow.</p>
        </div>
      )}

      <div className="space-y-5">
        {events.map((ev) => (
          <GameCard
            key={ev.id}
            event={ev}
            summary={summaries[ev.id]}
            followedTeamIds={teamIds}
            playersByTeam={playersByTeam}
          />
        ))}
      </div>

      {idleTeams.length > 0 && !loading && (
        <div className="mt-8">
          <div style={{ ...mono, color: T.muted }} className="text-[11px] uppercase tracking-widest mb-3">Not playing today</div>
          <div className="flex flex-wrap gap-2">
            {idleTeams.map((t) => (
              <div key={t.id} style={{ background: T.surface, border: `1px solid ${T.border}` }} className="flex items-center gap-2 rounded-md px-3 py-2">
                <Avatar initials={t.abbrev.slice(0, 2)} color={T.surface2} size={20} image={t.logo} />
                <span style={{ color: T.muted }} className="text-sm">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GameCard({ event, summary, followedTeamIds, playersByTeam }) {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];
  const state = event.status?.type?.state;
  const isPre = state === "pre";

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-5">
          {competitors.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <Avatar initials={(c.team?.abbreviation || "??").slice(0, 2)} color={T.surface2} size={30} image={c.team?.logos?.[0]?.href} />
              <div>
                <div style={{ color: followedTeamIds.has(String(c.team?.id)) ? T.text : "#C6C9D4" }} className="text-sm font-semibold">
                  {c.team?.shortDisplayName || c.team?.displayName}
                </div>
                {!isPre && <div style={{ ...display, color: T.text }} className="text-lg font-bold">{c.score}</div>}
              </div>
            </div>
          ))}
        </div>
        <Tag tone={state === "in" ? "cool" : "default"}>{statusLabel(event)}</Tag>
      </div>

      {isPre && <p style={{ color: T.muted }} className="text-sm">Game hasn't started — stats will show up here once it does.</p>}

      {!isPre && summary === undefined && <p style={{ color: T.muted }} className="text-sm">Loading stats...</p>}
      {!isPre && summary === null && <p style={{ color: "#F45B69" }} className="text-sm">Couldn't load stats for this game.</p>}

      {!isPre && summary && (
        <div className="space-y-5">
          {(summary.boxscore?.players || [])
            .filter((teamBlock) => followedTeamIds.has(String(teamBlock.team?.id)))
            .map((teamBlock) => (
              <div key={teamBlock.team.id}>
                <div style={{ ...mono, color: T.muted }} className="text-[11px] uppercase tracking-wide mb-2">{teamBlock.team.displayName}</div>
                <div className="space-y-4">
                  {(teamBlock.statistics || []).map((cat) => (
                    <StatTable key={cat.name} category={cat} highlightIds={playersByTeam.get(String(teamBlock.team.id))} />
                  ))}
                  {(teamBlock.statistics || []).length === 0 && (
                    <p style={{ color: T.muted }} className="text-xs">No player stats posted yet.</p>
                  )}
                </div>
              </div>
            ))}
          {(summary.boxscore?.players || []).filter((tb) => followedTeamIds.has(String(tb.team?.id))).length === 0 && (
            <p style={{ color: T.muted }} className="text-xs">Stats for this game aren't posted yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function StatTable({ category, highlightIds }) {
  const labels = category.labels || [];
  let rows = category.athletes || [];
  if (highlightIds && highlightIds.size > 0) {
    const matched = rows.filter((a) => highlightIds.has(String(a.athlete?.id)));
    if (matched.length > 0) rows = matched;
  }
  if (rows.length === 0) return null;

  return (
    <div>
      <div style={{ color: T.text }} className="text-xs font-semibold mb-1.5">{formatCategoryName(category.name)}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <th style={{ color: T.muted }} className="text-left py-1.5 pr-3 font-medium whitespace-nowrap">Player</th>
              {labels.map((l) => <th key={l} style={{ ...mono, color: T.muted }} className="text-right py-1.5 px-2 font-medium whitespace-nowrap">{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((a, i) => (
              <tr key={a.athlete?.id || i} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ color: T.text }} className="py-1.5 pr-3 whitespace-nowrap">{a.athlete?.displayName || "—"}</td>
                {(a.stats || []).map((s, j) => <td key={j} style={{ ...mono, color: "#C6C9D4" }} className="text-right py-1.5 px-2 whitespace-nowrap">{s}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
