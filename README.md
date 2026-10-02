# bushmasterson — developer portfolio

Minimalist personal site with an interactive starfield. Built with Vite,  
plain TypeScript, and zero runtime dependencies.

**Live:** https://bushmasterson.github.io

## Features

- Interactive starfield: layered depth, twinkle, pointer parallax.
- Mouse-driven constellation lines with eased falloff.
- Light / dark theme with persistent toggle.
- Boot screen, hidden terminal, vim-style highlight.
- Modular TS — features isolated in `src/ts/features/`.
- Layered CSS via `@layer` for a predictable cascade.
- Fully responsive, safe-area aware.
- Respects `prefers-reduced-motion`, `prefers-color-scheme`.

## Stack

HTML5 · CSS3 · TypeScript · Vite · Font Awesome 7

## Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Vite watch + static server         |
| `npm run build`     | Production bundle → `assets/js/`   |
| `npm run preview`   | Serve built site on localhost:3000 |
| `npm run typecheck` | `tsc --noEmit`                     |
| `npm run check`     | Typecheck + prettier               |
| `npm run clean`     | Remove build artifacts             |

## Tuning the starfield

All visual parameters live in `src/ts/config.ts`:

| Key                                   | Effect                        |
| ------------------------------------- | ----------------------------- |
| `densityFar`                          | px² per star (smaller = more) |
| `countMin` / `countMax`               | Star count clamp              |
| `connectDistance`                     | Max link distance             |
| `lineAlpha` / `cursorLineAlpha`       | Line opacity                  |
| `parallax`                            | Pointer parallax strength     |
| `twinkleSpeedMin` / `twinkleSpeedMax` | Twinkle speed                 |

After editing, run `npm run build` and hard-reload.

## Deployment

Auto-deployed to GitHub Pages via `.github/workflows/deploy.yml` on every  
push to `main`.
