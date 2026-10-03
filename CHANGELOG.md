# Changelog

All notable changes to this project are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] — 2026-10-03

First stable release. Complete personal portfolio with all pages, easter eggs,
snake game, and hardened CI/CD pipeline.

### Added — Pages

- **`/projects/`** — project cards with filter by `?filter=` query param
  (`telegram` / `typescript` / `c++` / `python`), counter updates live. Filter
  syncs to URL via `history.replaceState`, reacts to browser back/forward via
  `popstate`.
  - `bushnews` — cybersecurity & IT news channel (telegram)
  - `bush-bot` — telegram bot for updates (typescript · node)
  - `bush-tasks` — cli task manager (c++), android version in kotlin wip
  - `bush-math` — math animations with manim (python)
- **`/about/`** — 8 cards: basics, code, languages, hobbies, music, music ru,
  sports, values. Includes calisthenics, russian rap (norma tale, horus,
  pyrokinesis, pharaoh, boulevard depo, jeembo), 6-item hobbies and 6-item
  values list.
- **`/rules/`** — 3 cards: respect, email, vigilance. Last card links to
  `/social/` for official account verification.
- **`/uses/`** — daily tools, editor, terminal, languages, hardware, music.
- **`/social/`** — 5 cards: primary, mirror, extra, channel, contact.
- **`/terminal/`** — interactive shell with 16+ commands, tab-completion,
  command history (arrow up/down), virtual file system (`about.md`,
  `projects.md`, `uses.md`, `social.md`, `rules.md`), fake `cd` prompt.
- **`/snake/`** — standalone snake.exe page with full-screen game over overlay,
  idle patrol, difficulty pills, swipe controls.
- **`/404.html`** — terminal-themed not found page with `./snake.exe` link to
  `/snake/`.

### Added — Snake game

- **Full-screen game over overlay** with glitch animation, blur backdrop,
  `score` and `best` values, restart button. Auto-hides on restart.
- **Idle patrol mode** — before first input, snake traces the perimeter of a
  central rectangle and cannot die, leave safe zone, or hit itself. First key
  press or `pointerdown` starts the game from current position (no reset).
- **Difficulty pills** — `low` / `medium` / `high` with green / yellow / red
  accents. Active pill pulses softly.
  - Keyboard shortcuts: `1` / `2` / `3`.
  - Persisted in `localStorage` under `snake_difficulty`.
  - Tick multiplier: low = 0.5, medium = 0.75, high = 1.0.
  - Base tick: 110 ms desktop, 140 ms on `pointer: coarse`.
- **Touch controls** — swipe to steer with `1.3×` dominant-axis deadzone for
  diagonal elimination. `touch-action: none` on canvas,
  `touch-action: manipulation` on body.
- **3-slot direction queue** for smooth combo steering.
- **Soft diffused teal glow frame** around play area (`strokeRect` with
  `shadowBlur` in three passes: 22 / 12 / 4).
- **Mobile-friendly restart button** — 44×44 px minimum (Apple HIG / Material
  Design).
- **Auto-pause** when tab is hidden (`visibilitychange` listener).

### Added — Terminal easter eggs

- **`hahaha` command** → chaotic disco overlay with 16 random neon projectors.
  Full-screen `.disco` overlay with `mix-blend-mode: screen`, random `--hue`,
  `--dx`, `--dy`, `--dur`, `--delay`, `--size` for each projector. Auto-stop
  after 12 s, `Esc` or click stops early. Respects `prefers-reduced-motion`
  (never spawns).
- **5-click easter egg** on hero title (`bushmasterson@arch:~$`) → redirect to
  `/terminal/`. Click window 2 s, 5 clicks needed.

### Added — Navigation

- **Footer links** on home: `about · projects · rules · social · uses`
  (terminal, snake, and 404 excluded).
- **`~$ more info`** link inside `card-about`, `card-projects`, `card-rules` on
  home page.

### Added — Accessibility & theming

- Respects `prefers-reduced-motion`, `prefers-color-scheme`,
  `prefers-reduced-transparency`, `prefers-contrast`, `prefers-reduced-data`.
- Light / dark theme with persistent toggle in `localStorage` (key: `theme`).
- Safe-area aware layout via `env(safe-area-inset-*)` for iPhone notch and
  rounded corners.
- Full keyboard navigation and `:focus-visible` outlines.
- ARIA labels on all interactive elements; `aria-pressed` on toggles.
- Screen reader support via `.sr-only` siblings on typed headings.

### Added — CI/CD

- **`.github/workflows/ci.yml`** — `Lint, type, build`: prettier check,
  `tsc --noEmit`, `vite build`, verify output.
- **`.github/workflows/codeql.yml`** — CodeQL for `javascript-typescript`,
  `security-and-quality` queries.
- **`.github/workflows/security.yml`** — 4 jobs: `Audit` (npm audit high+),
  `Secrets` (gitleaks), `Review` (dependency-review on PRs), `CodeQL` (matrix).
- **`.github/workflows/lighthouse.yml`** — Lighthouse CI, 3 runs, desktop
  preset, weekly Sunday 06:00 UTC.
- **`.github/workflows/deploy.yml`** — deploy to GitHub Pages via OIDC token (no
  deploy keys). Copies all page folders, minifies HTML + CSS.
- **`.github/dependabot.yml`** — npm + github-actions, weekly Monday 06:00 MSK,
  grouped dev-dependencies.

### Added — Repository configuration

- **Ruleset on `main`** (active):
  - `deletion` — cannot delete main
  - `non_fast_forward` — cannot `git push --force`
  - `required_status_checks` — 6 checks must pass
  - `pull_request` — PR-only, 0 approvals required
  - `required_linear_history` — squash only, no merge commits
- **6 required status checks**: `Lint, type, build`, `CodeQL`, `Audit`,
  `Secrets`, `CodeQL (javascript-typescript)`, `Review`.
- **Dependabot alerts** + **malware alerts** + **security updates** enabled.
- **CodeQL** Advanced setup with **Copilot Autofix**.
- **Secret Protection** + **push protection** + **private vulnerability
  reporting** enabled.
- **Actions default workflow permissions** → read-only, cannot approve PRs.
- **Pages**: HTTPS enforced, source `main` / `/`.

### Added — Tooling

- `.prettierrc`, `.prettierignore`
- `tsconfig.json` with strict mode, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, and 30+ other strict
  flags.
- `vite.config.ts` — ES module output, source maps, esbuild minify.
- `.husky/pre-commit` → `npx lint-staged`
- `.husky/pre-push` → `npm run check` (tsc + prettier)
- `.lighthouserc.json` — performance/accessibility/SEO budgets
- `.editorconfig`, `.gitattributes`, `.nvmrc`, `.npmrc`, `.browserslistrc`

### Changed

- **Merge strategy** → **squash only**. Repo settings:
  `allow_merge_commit=false`, `allow_rebase_merge=false`,
  `allow_squash_merge=true`, `delete_branch_on_merge=true`.
- **`git pull`** → rebase by default (`pull.rebase=true` globally). No more
  accidental `Merge branch 'main' of ...` commits.
- **`main.css`** — refactored into clean layered structure with one-line
  comments. Explicit 4-tier responsive breakpoints:
  - mobile ≤ 480 px
  - tablet 481–1024 px
  - monitor 1025–1440 px
  - extra ≥ 1441 px
- **`main.css`** — added `.snake-difficulty`,
  `.snake-diff-btn--low/medium/high`, `snakeDiffPulse` keyframe animation.
- **`main.css`** — CSS custom properties scale per breakpoint: `--container-max`
  100% → 640 → 720 → 780 px, `--footer-icon-size` 28 → 32 → 34 → 36 px.
- **`main.css`** — merged `#terminal` overlay styles removed (superseded by
  `/terminal/` page).
- **`README.md`** — rewrote for clarity.
- **Hero typing animation** — `whoami` text remains in the hero on home page as
  decoration (not a terminal command).

### Fixed

- **Game over overlay** not appearing in `/snake/` (markup + CSS link missing
  from `snake/index.html`).
- **Food spawning** in corners and adjacent to snake head. Now: 2-cell padding
  from edges, minimum 4-cell distance from head.
- **Direction queue overflow** — fast combo inputs lost (2 → 3 slots).
- **Tab unfocus death spiral** — `dt` capped at 3 ticks per frame.
- **Food rendered** during idle patrol and after death.
- **Space key** re-triggering `restart` button after death (`blur()` on click).
- **Swipe not registering** on mobile — `touch-action: none` on canvas.
- **Double-tap zoom** on mobile — `touch-action: manipulation` on body.
- **Restart button** too small for finger — 44×44 px minimum.
- **Filter not syncing to URL** — `?filter=python` now added via
  `history.replaceState`; back/forward works via `popstate`.
- **Full text flashing** before typing animation started — cleared `textContent`
  first.
- **`/uses/` card index** skipped `05` (was `01 02 03 04 06`).
- **`/about/` music** — split into `music` (western) and `music ru` (russian
  scene) cards.
- **`/about/` sports** — replaced `gym · running` with
  `calisthenics · running · mobility`.
- **Nested full `rules/index.html`** inside `card-about` on `index.html` — fixed
  by rewriting the entire file.
- **Trailing whitespace** after `</nav>` in `index.html` failing prettier check
  on pre-push hook.
- **`main.css`** — all unclosed block comments (`/* ... *`) fixed. Parser was
  treating the entire file below them as one comment.
- **`whoami`** command removed from terminal (`command not found` now).

### Removed

- **`projects.html`** (legacy, superseded by `projects/index.html`).
- **`terminal`** and **`snake`** from footer nav. Terminal accessible only via
  5-click easter egg, snake only via 404 page.
- **Floating `#terminal` overlay** — replaced by dedicated `/terminal/` page.
- **`whoami` command** from terminal. Hero typing animation still uses the text
  but it's not a command.
- **Legacy `.snake-over::after`** game-over CSS (superseded by full-screen
  `#snake-gameover`).
- **10 stale local branches** after squash/rebase merges:
  `chore/css-cleanup-and-responsive`, `chore/remove-whoami`,
  `feat/about-and-rules-pages`, `feat/nav-and-bugfixes`,
  `feat/projects-bush-math`, `feat/snake-difficulty`,
  `feat/snake-gameover-idle-walls`, `feat/snake-page-and-polish`,
  `feat/snake-section`, `hotfix/index-nested-html`.
- **4 stale remote branches** on GitHub.

### Security

- Enabled **Dependabot security updates** (auto-PR for CVEs).
- Enabled **secret scanning non-provider patterns** (custom API keys).
- Enabled **secret scanning validity checks** (fewer false positives).
- Enabled **private vulnerability reporting** (private security channel).
- Enabled **CodeQL Advanced setup** with **Copilot Autofix**.
- Enabled **push protection** for secrets.
- Enabled **malware alerts** in Dependabot.
- Repo ruleset prevents force-push, branch deletion, direct push to main.

### Docs

- `README.md` — features, stack, scripts, tuning, deployment.
- `CHANGELOG.md` — this file.
- `CONTRIBUTING.md` — setup, checks, branch naming, PR process.

---

## How to read this changelog

- **Added** — new features.
- **Changed** — changes to existing behavior.
- **Fixed** — bug fixes.
- **Removed** — deleted features or files.
- **Security** — vulnerability-related changes.
- **Docs** — documentation updates.
