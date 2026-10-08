/* read a css custom property from the document root */
export function cssVar(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/* extract the rgb triple from an rgba/hex color string */
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
