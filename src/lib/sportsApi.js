// Thin client for ESPN's public (unofficial, no API key needed) sports API.
// It's the same data that powers espn.com/scores, keyed by sport+league, e.g.
// https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard
const BASE = "https://site.api.espn.com/apis/site/v2/sports";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ESPN request failed (${res.status})`);
  return res.json();
}

export function todayStamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export async function fetchTeams(league) {
  const data = await getJson(`${BASE}/${league.sport}/${league.league}/teams?limit=400`);
  const list = data?.sports?.[0]?.leagues?.[0]?.teams || [];
  return list
    .map(({ team }) => ({
      id: String(team.id),
      name: team.displayName || team.name || team.abbreviation,
      abbrev: team.abbreviation || "",
      logo: team.logos?.[0]?.href || null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchRoster(league, teamId) {
  const data = await getJson(`${BASE}/${league.sport}/${league.league}/teams/${teamId}/roster`);
  const groups = data?.athletes || [];
  const players = [];
  for (const group of groups) {
    const items = group.items || group.athletes || [];
    for (const a of items) {
      players.push({
        id: String(a.id),
        name: a.fullName || a.displayName || "Unnamed player",
        position: a.position?.abbreviation || group.position || "",
        jersey: a.jersey || "",
        headshot: a.headshot?.href || null,
        teamId: String(teamId),
      });
    }
  }
  return players;
}

export async function fetchScoreboard(league, dateStamp) {
  const data = await getJson(`${BASE}/${league.sport}/${league.league}/scoreboard?dates=${dateStamp}&limit=300`);
  return data?.events || [];
}

// Finds the event (if any) on the scoreboard where the given team is playing.
export function findTeamEvent(events, teamId) {
  return (
    events.find((ev) =>
      ev.competitions?.[0]?.competitors?.some((c) => String(c.team?.id) === String(teamId))
    ) || null
  );
}

export async function fetchSummary(league, eventId) {
  return getJson(`${BASE}/${league.sport}/${league.league}/summary?event=${eventId}`);
}
