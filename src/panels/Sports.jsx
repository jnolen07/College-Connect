import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../theme";
import { LEAGUES } from "../data/sportsLeagues";
import { ChooseSport } from "./sports/ChooseSport";
import { ChooseTeams } from "./sports/ChooseTeams";
import { ChoosePlayers } from "./sports/ChoosePlayers";
import { DailyUpdate } from "./sports/DailyUpdate";

const EMPTY_PREFS = { league: null, teams: [], players: [], onboarded: false };

export function Sports({ profile }) {
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState(null);
  const [mode, setMode] = useState("sport"); // sport -> teams -> players -> update

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("sports_preferences")
        .select("*")
        .eq("profile_id", profile.id)
        .maybeSingle();
      if (!active) return;
      if (error) console.error("Sport Mode prefs fetch failed:", error.message);
      const loaded = data
        ? { league: data.league, teams: data.teams || [], players: data.players || [], onboarded: data.onboarded }
        : EMPTY_PREFS;
      setPrefs(loaded);
      setMode(loaded.onboarded && loaded.league ? "update" : "sport");
      setLoading(false);
    })();
    return () => { active = false; };
  }, [profile.id]);

  const persist = async (next) => {
    const { error } = await supabase.from("sports_preferences").upsert(
      {
        profile_id: profile.id,
        league: next.league,
        teams: next.teams,
        players: next.players,
        onboarded: next.onboarded,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id" }
    );
    if (error) console.error("Sport Mode prefs save failed:", error.message);
  };

  if (loading || !prefs) {
    return <p style={{ color: T.muted }} className="text-sm">Loading Sport Mode...</p>;
  }

  const league = LEAGUES.find((l) => l.id === prefs.league) || null;

  if (mode === "sport") {
    return (
      <ChooseSport
        selected={prefs.league}
        onNext={(leagueId) => {
          const sameLeague = leagueId === prefs.league;
          const next = sameLeague ? prefs : { ...prefs, league: leagueId, teams: [], players: [] };
          setPrefs(next);
          setMode("teams");
        }}
      />
    );
  }

  if (mode === "teams" && league) {
    return (
      <ChooseTeams
        league={league}
        initialSelected={prefs.teams}
        onBack={() => setMode("sport")}
        onNext={(teams) => {
          const keptPlayers = prefs.players.filter((p) => teams.some((t) => t.id === p.teamId));
          setPrefs({ ...prefs, teams, players: keptPlayers });
          setMode("players");
        }}
      />
    );
  }

  if (mode === "players" && league) {
    return (
      <ChoosePlayers
        league={league}
        teams={prefs.teams}
        initialSelected={prefs.players}
        onBack={() => setMode("teams")}
        onDone={(players) => {
          const next = { ...prefs, players, onboarded: true };
          setPrefs(next);
          persist(next);
          setMode("update");
        }}
      />
    );
  }

  if (league) {
    return (
      <DailyUpdate
        league={league}
        teams={prefs.teams}
        players={prefs.players}
        onEdit={() => setMode("sport")}
      />
    );
  }

  return <ChooseSport selected={null} onNext={(leagueId) => { setPrefs({ ...prefs, league: leagueId, teams: [], players: [] }); setMode("teams"); }} />;
}
