# bushmasterson — developer portfolio

Minimalist personal site with an interactive starfield. No frameworks, no
bundlers — plain HTML, CSS, and TypeScript compiled with `tsc`.

**Live:** https://bushmasterson.github.io

## Features

- Interactive starfield: layered depth, twinkle, pointer parallax.
- Mouse-driven constellation lines with eased falloff.
- Modular TS — features isolated in `src/ts/features/`.
- Layered CSS via `@layer` for a predictable cascade.
- Dark monospace aesthetic, fully responsive.
- Respects `prefers-reduced-motion`.

## Stack

HTML5 · CSS3 · TypeScript · Font Awesome 7

## Structure

```text
.
├── index.html              # entrypoint
├── 404.html
├── assets/
│   ├── css/main.css
│   ├── js/                 # compiled output (tsc)
│   ├── icons/
│   └── images/avatar.png
├── src/ts/
│   ├── main.ts             # boots features
│   ├── config.ts           # tuning constants
│   ├── types.ts
│   ├── utils/color.ts
│   └── features/
│       ├── particles.ts
│       ├── back-to-top.ts
│       └── avatar.ts
├── .github/workflows/deploy.yml
├── tsconfig.json
├── .prettierrc
└── package.json
```

## Scripts

| Command                | Description                 |
| ---------------------- | --------------------------- |
| `npm run build`        | Compile TS → `assets/js/`   |
| `npm run watch`        | Rebuild on change           |
| `npm run format`       | Format with Prettier        |
| `npm run format:check` | Check formatting (no write) |

Local preview (ES modules need HTTP, not `file://`):

```bash
npx serve
```

## Tuning the starfield

All visual parameters live in `src/ts/config.ts`:

| Key                                   | Effect                        |
| ------------------------------------- | ----------------------------- |
| `densityFar`                          | px² per star (smaller = more) |
| `countMin` / `countMax`               | Star count clamp              |
| `connectDistance`                     | Max link distance             |
| `lineAlpha` / `cursorLineAlpha`       | Line opacity                  |
| `pointerLerp`                         | Cursor smoothing (0..1)       |
| `parallax`                            | Pointer parallax strength     |
| `twinkleSpeedMin` / `twinkleSpeedMax` | Twinkle speed                 |

After editing, run `npm run build` and hard-reload.

## Deployment

Auto-deployed to GitHub Pages on every push to `main` via
`.github/workflows/deploy.yml`.
