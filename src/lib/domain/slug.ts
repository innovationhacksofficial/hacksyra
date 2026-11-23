export function slugify(input: string, max = 60): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/;

export const RESERVED_SLUGS = new Set([
  "new", "create", "edit", "admin", "api", "login", "signup", "register", "settings", "dashboard", "organizer", "search",
]);

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && !RESERVED_SLUGS.has(slug);
}

/** Lower-cased search tokens for array-contains queries (name words + prefixes, tags, city). */
export function buildSearchKeywords(...parts: (string | string[] | undefined | null)[]): string[] {
  const words = new Set<string>();
  for (const p of parts.flat()) {
    if (!p) continue;
    for (const w of p.toLowerCase().split(/[^a-z0-9+#.]+/)) {
      if (w.length < 2) continue;
      words.add(w);
      for (let i = 2; i < Math.min(w.length, 10); i++) words.add(w.slice(0, i));
    }
  }
  return Array.from(words).slice(0, 200);
}

