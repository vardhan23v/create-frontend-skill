# front-end-skill-claude-code

An open-source [Agent Skill](https://agentskills.io) (`create-frontend`) for Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, OpenCode and any other agent that reads `SKILL.md`. It turns "build me a frontend" into a production-oriented workflow: classify the project, respect or choose the stack, draw the frontend/backend boundary, pick a contrast-checked colour theme, build with real states and accessibility, verify in seven explicit categories, and finish with an honest verification report.

**Version:** 3.1.0 · **Licence:** MIT · **Status:** specification complete, not yet validated on real projects (see [Validation Status](#validation-status))

---

## Contents

- [What it does](#what-it-does)
- [Supported project types](#supported-project-types)
- [Installation](#installation)
- [Usage](#usage)
- [Workflow](#workflow)
- [Stack decisions](#stack-decisions)
- [Colour themes](#colour-themes)
- [When backend work is required](#when-backend-work-is-required)
- [Testing expectations](#testing-expectations)
- [Verification levels](#verification-levels)
- [Browser verification behaviour](#browser-verification-behaviour)
- [Failure and recovery behaviour](#failure-and-recovery-behaviour)
- [The verification report](#the-verification-report)
- [Customising](#customising)
- [Related skills](#related-skills)
- [Limitations](#limitations)
- [Validation Status](#validation-status)
- [License](#license)
- [Changelog](#changelog)

---

## What it does

| Stage | Outcome |
|---|---|
| Classify | Decides whether the project is new, existing, partially implemented, or needs refactoring, and sizes the task so a one-component change does not get the new-project treatment |
| Read | Inspects `package.json`, lockfile, config, routing, styling, components, data layer, tests and environment; runs the existing checks once and records what already fails |
| Decide | Chooses the stack by a fixed priority (user → existing architecture → conventions → team constraints → requirements → defaults) |
| Boundary | Detects features that need a backend, writes the API contract, and refuses to fake them |
| Build | A named colour theme (from the library, or derived from the brand) and design tokens first, then screens with loading/empty/error/success states, responsive layout, accessibility, forms, security |
| Verify | Code, types, build, tests, browser, visual, accessibility, each reported separately and never fabricated |
| Recover | Diagnose → root cause → fix → re-verify, with a retry limit and explicit blocker handling |
| Deploy prep | Build command, output directory, SPA fallback, env variables (public vs private), Node version, risks; deploys only on request |
| Report | A fixed-format verification report at the end of every run |

## Supported project types

| Type | Support |
|---|---|
| React + Vite | Default for client-rendered apps; scaffold and Tailwind setup included |
| Next.js (App Router) | Default when server rendering, SEO on dynamic pages or API routes are needed; server/client component guidance; deploy notes |
| Astro | Default for content sites; static and SSR deploy notes |
| Plain HTML/CSS/JS | For one or two static pages; Playwright smoke tests only |
| Vue/Nuxt, Svelte/SvelteKit, Angular, Solid | Detected and respected in existing projects; scaffolded on request; the rest of the workflow applies unchanged |
| Existing repositories | Conventions, package manager, styling, component library, data layer and tests are reused; no re-scaffold or migration |
| Partially implemented or messy projects | Inventoried first (works / broken / missing), finished in the dominant style, half-done work never silently deleted |
| Projects with a design system | The existing tokens and component library are the source of truth; a second library is never added |
| Projects with existing APIs | The existing client and types are reused; new endpoints follow the same conventions |
| Projects with existing tests | Existing tools are preferred; pre-existing failures are recorded, not hidden |

## Installation

The skill is the `create-frontend/` folder, in the standard Agent Skills layout:

```
create-frontend/
  SKILL.md                    the workflow (self-sufficient: an appendix carries the theme tokens in compact form)
  references/themes.md        eleven colour themes with light and dark tokens, fonts, shape and wiring
  scripts/check-contrast.js   WCAG contrast checker for a token file (Node 18+, no dependencies)
  scripts/scaffold.sh         non-interactive scaffolds for Vite+React, Next.js, Astro, Vue, Svelte, plain HTML
  scripts/install.sh          installs or updates the skill for your agent(s)
```

Clone once, then install for the agent(s) you use. The installer symlinks the folder by default, so `git pull` in the clone updates every install; pass `--copy` if your agent cannot follow symlinks.

```bash
git clone https://github.com/vardhan23v/front-end-skill-claude-code.git
```

```bash
front-end-skill-claude-code/create-frontend/scripts/install.sh agents claude
```

| Agent | User-level directory | Project-level directory |
|---|---|---|
| Codex, Cursor, GitHub Copilot, Gemini CLI, OpenCode and other clients that scan the shared convention | `~/.agents/skills/` (`install.sh agents`) | `.agents/skills/` (`install.sh --project agents`) |
| Claude Code | `~/.claude/skills/` (`install.sh claude`) | `.claude/skills/` (`install.sh --project claude`) |
| GitHub Copilot in VS Code (native location) | `~/.copilot/skills/` (`install.sh copilot`) | `.github/skills/` (`install.sh --project copilot`) |
| Anything else | `install.sh <path your agent documents>` | same, with `--project` |

Which directories a client scans is documented in the [Agent Skills implementor guide](https://agentskills.io/client-implementation/adding-skills-support); the `.agents/skills/` convention is the one most clients share, and Claude Code is the notable exception.

If you copy only `SKILL.md` somewhere (for example into a hosted skill store that accepts a single file), the skill still works: step 6 falls back to the appendix for theme tokens and to an inline contrast check, and step 3 falls back to the plain scaffold commands. You lose the full reference, the per-theme wiring notes and the helper scripts, so prefer the folder.

## Usage

Your agent loads the skill when a request matches its description. Most agents also let you invoke it by name (`/create-frontend` in Claude Code and Codex, `$create-frontend` or a mention in others):

```
/create-frontend
```

Examples:

```
Build an admissions landing page with a contact form. Brand colours are in /brand.
```

```
Add a students list page to this app. API is in src/lib/api, see /students in the contract.
```

```
This repo is half-finished. Get the dashboard building and finish the reports page.
```

Giving these up front reduces questions: purpose and users, pages, where data comes from, whether login is needed, and where it will be hosted.

## Workflow

| Step | Name | Runs for |
|---|---|---|
| 0 | Classify the project and size the task | Always |
| 1 | Read the project | Always |
| 2 | Settle the requirements | New project, new feature |
| 3 | Decide the stack | New project only |
| 4 | Backend boundary | New project, new feature |
| 5 | Structure | New project |
| 6 | Design tokens and visual quality | New project, or more than a screen or two |
| 7 | Build | Always |
| 8 | Performance | New project, new feature |
| 9 | Tests | New project, new feature |
| 10 | Verify | Always (subset for small changes) |
| 11 | Failure recovery | Whenever something fails |
| 12 | Prepare for deploy | New project |
| 13 | Verification report | Always |

Requirements (step 2) are inferred where safe; the skill asks one short batch of questions only for items that materially change the implementation (unclear users, scope that could double, login with no provider, legacy browsers, unclear public/private, brand with no reference, a host that forces a framework).

## Stack decisions

Priority, highest first: explicit user requirements → existing project architecture → existing dependencies and conventions → team or company constraints → project requirements → skill defaults. An existing stack is never migrated unless asked.

| Decision | New project default | Changed when |
|---|---|---|
| Framework | Plain HTML (1–2 static pages) · Astro (content) · Vite + React (client app) · Next.js (SSR, dynamic SEO, API routes) | User names another framework |
| Language | TypeScript, strict | Plain HTML |
| Styling | Tailwind CSS | Existing design system |
| Component library | None | Many standard widgets needed → one accessible headless library |
| State | Component state + context | Widely shared, fast-changing state → one small store |
| Routing | Framework router; React Router for Vite SPAs | — |
| Data fetching | `fetch` in a typed module | Caching/refetching → TanStack Query or loaders |
| Forms | Native + built-in validation | Multi-step or many fields → React Hook Form + Zod |
| Testing | Vitest + Testing Library; Playwright e2e | Plain HTML → Playwright smoke only |
| Build tooling | The framework's own | — |

## Colour themes

Most generated frontends look the same: white page, grey text, indigo buttons, Inter. This skill does not start there. Step 6 makes the agent choose a palette on purpose, name it in the plan and the report, and build only with tokens.

| Situation | What happens |
|---|---|
| The project already has tokens, a theme file or a component library | They are used; no second palette is added |
| Brand colours, a logo or a design file are supplied | The closest theme is taken as a base, `primary` and `ring` are replaced by the brand colour (adjusted until it passes contrast), neutrals are tinted toward the brand's temperature |
| Nothing is supplied | A theme is picked by project type from the table below, and the choice is stated |

| Theme | Picked for | Character |
|---|---|---|
| Birch | Product landing pages, SaaS marketing, startup homepages, mainstream e-commerce | Near-white canvas for screenshots and photos, one emerald action, coral promo accent |
| Paper & Ink | Blogs, help centres, handbooks, newsletters, long-form reading | Warm paper, ink text, fountain-pen-blue links, one vermilion highlight, two serifs |
| Pewter | SaaS dashboards, admin panels, internal tools (light-first) | Cool quiet neutrals so data carries the colour; deep petrol primary, plum highlight |
| Forest | Farming, food production, outdoors, nutrition, climate, non-profits | Sage paper, conifer green, ochre |
| Terracotta | Restaurants, bars, hotels, travel, crafts, local businesses | Clay primary on warm sand, olive-glaze accent |
| Midnight | Developer tools, infrastructure, developer docs, trading, security (dark-first) | Ink-navy background, cyan and lime at restrained lightness, monospace headings |
| Harbour | Healthcare, insurance, government, civic, schools and universities, consumer fintech | Institutional sea blue, maximal legibility |
| Citrus | Upbeat consumer apps, student-facing learning apps, events, clubs, recipe and delivery apps | Tangerine actions, aubergine ink, grape accent |
| Gallery | Portfolios, photography, architecture, fashion, agencies, museums | White-cube monochrome, ink buttons, one cobalt signal |
| Dusk | Creative tools, beauty, lifestyle, music, meditation, sleep, journaling | Muted mauve, apricot accent, Didone headings |
| Brass | Luxury, wealth, law, premium services | Charcoal, ivory, antique gold, bottle green; sharp corners |

Every theme in [`create-frontend/references/themes.md`](create-frontend/references/themes.md) ships:

- light and dark token sets (`background`, `foreground`, `surface`, `muted`, `border`, `input`, `primary`, `accent`, `ring`, `danger`, `success`, `warning`, each with its `-foreground` where text sits on it) as ready-to-paste `:root` and `.dark` blocks, with fonts, radii and per-mode card and popover shadows
- a font pairing that no other theme uses, a corner radius scale and a shadow character that match the mood
- contrast figures produced by [`scripts/check-contrast.js`](create-frontend/scripts/check-contrast.js): every text pair at least 4.5:1 and every UI pair at least 3:1, in both modes, plus notes on tokens that are fill-only

The reference also carries the wiring: the Tailwind v4 `@theme inline` mapping, focus rings with an offset (so they show on primary buttons), `color-mix` recipes for hover and selection instead of extra tokens, and a dark-mode setup that does not flash: a blocking inline script in `<head>` sets the `.dark` class before first paint, `color-scheme` follows the class, and Next.js gets `suppressHydrationWarning` on `<html>`.

The checker is also what the skill runs when it derives a theme from a brand colour or edits any value. It fails on any text pair under 4.5:1 or UI pair under 3:1, and warns about OKLCH hue collisions (primary vs danger, accent vs warning, …), status colours used as text on muted fills, indigo-band primaries and inverted dark modes:

```bash
node create-frontend/scripts/check-contrast.js tokens.json
```

Dark mode is not an inversion of light: backgrounds are the darkest value, surfaces are lifted, primaries are lightened, and text is off-white. Light and dark both ship only when the project or user wants them; otherwise one mode is kept and the other block deleted.

## When backend work is required

The skill is frontend-only but detects these triggers: authentication and sessions, roles and permissions, database persistence, server-side validation, private API or service-role keys, file uploads to storage, payments, email or SMS, server-side processing, scheduling or webhooks, and anything other users must see after a reload.

When one is hit, the skill:

1. Names it as a backend dependency in the plan and the report
2. Does not simulate it with hard-coded data presented as working; any mock is labelled in code, UI and report, and sits behind the real interface
3. Never moves a secret into the client
4. Writes an API contract (method, path, request, response, errors, auth) in `src/lib/api/contracts.ts` or `docs/api-contract.md`
5. Integrates against the contract with real loading, error, empty and success handling
6. Lists exactly which backend pieces remain

## Testing expectations

| Level | Written for | Not written for |
|---|---|---|
| Unit | Utilities, formatters, validators, business logic, API mappers | Trivial wrappers |
| Component | Forms, interactive components, loading/error/empty states | Static presentational components |
| End-to-end | Sign-in, checkout/payment, main create/edit flow, primary navigation, a smoke test per main page | Everything else |

Existing project tools are preferred. Tests must be able to fail; render-only tests and weakened assertions are not accepted.

## Verification levels

| Category | Covers | Typical command |
|---|---|---|
| Code | Lint, format, no dead code or debug output, no secrets in the diff | project `lint`, `git diff` review |
| Types | Typecheck | `tsc --noEmit` |
| Build | Production build, bundle sizes | `npm run build` |
| Tests | Existing and new tests | project `test`, `npx playwright test` |
| Browser | Routes open, console and network clean, interactions and states work at desktop and mobile widths | dev server + browser tool or Playwright |
| Visual | Screenshots at 375 and 1280 wide, read by Claude | `npx playwright screenshot …` |
| Accessibility | Automated scan plus a keyboard walk | `npx @axe-core/cli <url>` + manual |

Each category is reported separately. If a tool is unavailable the report states exactly what was not verified and gives the command to run manually. Pre-existing failures are reported as pre-existing, never as fixed.

## Browser verification behaviour

**When a browser tool or Playwright is available:** the app is started, every important route is opened at 1280×800 and 375×812, console errors and failed network requests are read, the main interactions are exercised (navigation, forms with valid and invalid input, dialogs, menus), loading/error/empty states are triggered, and the responsive checklist (navigation, typography, grids, tables, forms, dialogs, buttons, images, overflow, touch targets) is walked. Findings are fixed and re-checked.

**When it is not available:** the report contains the literal line `BROWSER VERIFICATION: NOT AVAILABLE`, followed by manual steps: how to start the app, which URLs to open, what to look for, which interactions to try, and which widths to test. The skill does not imply a browser check happened.

Accessibility follows the same rule: semantic HTML in the code is not treated as verification. With a browser, the keyboard walk and axe scan are run; without one, the review is reported as code-level only.

## Failure and recovery behaviour

On any failure: diagnose from the actual error → identify the root cause → fix → re-run the verification that failed → report. The same command is not retried unchanged more than twice; after that the approach changes.

When blocked by missing credentials, an unavailable service or tool, or a decision only the user can make, the skill names the blocker, finishes everything that can be completed safely, and lists what remains. A table of common failures (Node version, port in use, Tailwind not applying, blank production page, hydration mismatch, CORS, SPA 404s, CI-only test failures) is included in the skill.

## The verification report

Every run ends with:

```
PROJECT            framework, language, styling, theme, testing, build tool
IMPLEMENTED        what was built
VERIFIED           code, types, build, tests, browser, visual, accessibility — each with its result
NOT VERIFIED       what, why, and the manual command
PRE-EXISTING ISSUES
KNOWN LIMITATIONS  including anything mock or placeholder and how to replace it
BACKEND DEPENDENCIES  each with its contract location
ENVIRONMENT VARIABLES  name (public|private, build-time|runtime): purpose
DEPLOYMENT NOTES   build command, output, fallback, Node version, risks
```

## Customising

Edit `create-frontend/SKILL.md` unless the table says otherwise:

| To change | Edit |
|---|---|
| Default framework, styling or test stack | The decision table in step 3 |
| Team constraints the skill must respect | Add them to `AGENTS.md` or `CLAUDE.md`; the skill reads them in step 1 and ranks them above its own defaults |
| Which theme a project type gets | The project → theme table in step 6 |
| Add or change a colour theme | `create-frontend/references/themes.md`; run `node create-frontend/scripts/check-contrast.js` on the new values until it exits 0 |
| Your company's palette as the only theme | Replace the library with one theme derived from your brand and delete the project → theme table |
| Folder layout | Step 5 |
| Accessibility or browser-support standard | Step 2 defaults and step 7 |
| A fixed hosting provider | Step 12 |
| Report format | Step 13 |
| When the skill triggers | The `description` line in the frontmatter |

## Related skills

| Skill | Role |
|---|---|
| A visual-design skill such as `frontend-design` | Optional. If one is installed alongside, step 6 loads it for art direction when the look matters more than usual. Nothing depends on it: the theme library, shape and font choices, and the "avoid the generic AI look" rules are the visual direction when no such skill exists. |

## Limitations

- Web frontends only; no native mobile or desktop apps.
- Backend work is identified and contracted, not implemented.
- Browser, visual and accessibility verification depend on a browser tool or Playwright being available in the session; without them those categories are reported as not verified.
- Scaffold commands and tool invocations (`create-vite`, `create-next-app`, `create-astro`, `sv create`, Playwright, axe, Lighthouse) are current major-version syntax and will drift; the skill is told to read current docs when a command fails.
- The skill reads `AGENTS.md`, `CLAUDE.md` and lint config for team constraints; constraints that live only in people's heads must be stated in the request.
- Design judgement is bounded: the skill avoids the generic AI look and follows supplied references, but does not replace a designer.
- The themes are starting palettes with verified contrast, not brand systems. A theme derived from a brand colour is only as accessible as the adjusted colour; the checker reports it, the skill must act on it.
- `check-contrast.js` checks token pairs, not rendered pages: text over images, gradients or overlapping surfaces still needs the axe scan.

## Validation Status

Be aware of this before relying on the skill.

**Tested projects:** none. The skill has not yet driven a build on a real project.

**Verification performed on 3.1.0 (6 Oct 2026):**

- Ten themes were designed by independent agents, each re-verified by a second agent with the checker, then critiqued as a set through three lenses (overlap, coverage, practicality). The critique produced the eleventh theme (Birch), two renames (Slate → Pewter, Harbor → Harbour), a primary swap for Paper & Ink, unique font pairings, the `input` token, per-mode shadows, the focus-ring offset and the hue-collision warnings in the checker
- `node create-frontend/scripts/check-contrast.js` exits 0 for every theme in both modes; the contrast figures in `references/themes.md` and the appendix in `SKILL.md` are generated from that run, not typed
- `check-contrast.js` runs on Node 18+ with no dependencies and accepts a light-only or dark-only file; `install.sh` and `scaffold.sh` were run once each on macOS
- Not yet done: a real build driven by the skill with one of the themes; rendering the font pairings (checked by name against Google Fonts only); `scaffold.sh` for `next`, `astro`, `vue` and `svelte` end to end (flags are current as of October 2026 and will drift)

**Verification performed on 3.0.0 (4 Oct 2026, in a sandbox):**

- Frontmatter parses; `name` and `description` present; description under the length limit
- No "production tested" or similar claims anywhere in the repo
- `npm create vite@latest --help`, `npx sv create --help`, `npx playwright screenshot --help` and `npx lighthouse --help` all resolve and run
- `npx playwright screenshot --viewport-size=375,812 <url> mobile.png` produced a screenshot of a locally served test page
- `@axe-core/cli` resolves on the registry (4.13.0) but could not be run here: it downloads a Chrome driver from a host the sandbox blocks. Untested end to end.
- `npx create-next-app@latest` and `npm create astro@latest` were not run

**Known issues:**

- Not yet exercised against a partially implemented or messy repository, which is the hardest class it claims to handle.
- The "ask only what materially matters" rule in step 2 has not been observed in practice; it may still ask too much or too little.
- Framework coverage beyond React/Vite, Next.js, Astro and plain HTML is by instruction only.

**Areas requiring further validation:**

1. A fresh Vite + React + TypeScript app from an empty folder (new project path, Tailwind setup, Playwright and axe commands)
2. An existing Next.js App Router project: add a page that reads an existing API, confirm no re-scaffold and server/client component choices are correct
3. A half-finished repository with a failing build: confirm the inventory, the pre-existing-failure reporting, and that nothing is silently deleted
4. A project with a design system (shadcn/ui or MUI already installed): confirm no second library is added and tokens are reused
5. A feature that needs auth with no provider present: confirm the backend boundary, the contract, and that nothing is faked
6. A session with no browser tooling: confirm the `BROWSER VERIFICATION: NOT AVAILABLE` block and manual steps appear

Recommended real projects to use: a personal portfolio (plain HTML or Astro), a small admin dashboard on Vite + React against a public demo API, an existing Next.js starter with a few pages, and one deliberately abandoned side project.

## License

[MIT](LICENSE). Use it, fork it, ship it inside your own agent or plugin; attribution stays in the file.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
