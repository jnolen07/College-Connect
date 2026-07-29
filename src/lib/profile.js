import { YEAR_ABBR } from "../data/constants";

export function initialsOf(name = "?") {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export const AVATAR_PALETTE = ["#FF9F45", "#4FD1C5", "#8B7CF6", "#F45B69"];

export function colorFor(id = "") {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[Math.abs(h)];
}

export function codeFor(major = "", year = "") {
  const initials = major.split(/\s+/).map((w) => w[0]).slice(0, 3).join("").toUpperCase();
  return `${initials}·${YEAR_ABBR[year] || ""}`;
}
