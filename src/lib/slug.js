export function slugify(name) {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const suffix = Date.now().toString(36).slice(-4);
  return `${base || "group"}-${suffix}`;
}
