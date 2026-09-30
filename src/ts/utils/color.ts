/** Read a CSS custom property from :root. */
export function cssVar(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/** Convert "rgba(r,g,b,a)" → "r,g,b". */
export function rgbTriple(rgba: string, fallback = '212,212,212'): string {
  const match = rgba.match(/rgba?\(([^)]+)\)/);
  const inner = match?.[1];
  if (!inner) return fallback;
  return inner
    .split(',')
    .slice(0, 3)
    .map((v) => v.trim())
    .join(',');
}
