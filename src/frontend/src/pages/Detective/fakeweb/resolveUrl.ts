/**
 * Normalizes a player-typed address so the fake browser doesn't punish
 * harmless variation (protocol, "www.", trailing slash, casing, stray
 * whitespace) that has nothing to do with the actual puzzle of figuring out
 * *which* address to visit. Pure function, no dependency on the page
 * registry, so it's unit-testable on its own.
 */
export function normalizeUrl(input: string): string {
  let url = input.trim().toLowerCase();
  url = url.replace(/^https?:\/\//, "");
  url = url.replace(/^www\./, "");
  url = url.replace(/\/+$/, "");
  return url;
}

/** Looks up a normalized address in a page registry. Pure, no React/DOM. */
export function resolveUrl<T extends { url: string }>(
  input: string,
  pages: Record<string, T>,
): T | null {
  const normalized = normalizeUrl(input);
  return pages[normalized] ?? null;
}
