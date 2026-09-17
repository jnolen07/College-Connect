// ESPN's public site API is organized as /sports/{sport}/{league}/... . Every
// entry here maps a human-facing "favorite sport" choice to that pair.
export const LEAGUES = [
  { id: "nfl", label: "Football", sublabel: "NFL", sport: "football", league: "nfl", emoji: "🏈" },
  { id: "college-football", label: "College Football", sublabel: "NCAA", sport: "football", league: "college-football", emoji: "🏈" },
  { id: "nba", label: "Basketball", sublabel: "NBA", sport: "basketball", league: "nba", emoji: "🏀" },
  { id: "mens-college-basketball", label: "College Basketball", sublabel: "Men's NCAA", sport: "basketball", league: "mens-college-basketball", emoji: "🏀" },
  { id: "womens-college-basketball", label: "Women's College Basketball", sublabel: "Women's NCAA", sport: "basketball", league: "womens-college-basketball", emoji: "🏀" },
  { id: "mlb", label: "Baseball", sublabel: "MLB", sport: "baseball", league: "mlb", emoji: "⚾" },
  { id: "nhl", label: "Hockey", sublabel: "NHL", sport: "hockey", league: "nhl", emoji: "🏒" },
];
