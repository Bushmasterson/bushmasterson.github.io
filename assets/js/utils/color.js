export function cssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
}
export function rgbTriple(rgba, fallback = '212,212,212') {
    const match = rgba.match(/rgba?\(([^)]+)\)/);
    const inner = match?.[1];
    if (!inner)
        return fallback;
    return inner
        .split(',')
        .slice(0, 3)
        .map((v) => v.trim())
        .join(',');
}
//# sourceMappingURL=color.js.map