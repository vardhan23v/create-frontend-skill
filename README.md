# create-frontend

A Claude Code skill that builds a working, verified frontend end to end: it reads the project, chooses or respects the stack, scaffolds, implements, checks the result in a real browser, and leaves it ready to deploy.

**The finish line is a frontend that builds cleanly and has been looked at in a browser, not code that merely looks right.**

---

## Contents

- [What it does](#what-it-does)
- [When it is used](#when-it-is-used)
- [Installation](#installation)
- [Usage](#usage)
- [Workflow](#workflow)
  - [1. Read the project](#1-read-the-project)
  - [2. Settle the requirements](#2-settle-the-requirements)
  - [3. Choose the stack](#3-choose-the-stack)
  - [4. Structure](#4-structure)
  - [5. Design tokens first](#5-design-tokens-first)
  - [6. Build](#6-build)
  - [7. Verify](#7-verify)
  - [8. Prepare for deploy](#8-prepare-for-deploy)
  - [9. Report](#9-report)
- [Rules](#rules)
- [Customising](#customising)
- [Related skills](#related-skills)
- [Limitations](#limitations)

---

## What it does

| Stage | Outcome |
|---|---|
| Read | Detects the framework, package manager, styling and component library already in the repo |
| Decide | Picks the simplest stack that fits a new project, with a one-line reason |
| Scaffold | Runs the official scaffold command and removes the demo boilerplate |
| Build | Implements screens with loading, empty, error and success states; responsive and accessible |
| Verify | Installs, typechecks, lints, builds, runs the app and screenshots it |
| Deploy prep | Records build command, output directory, SPA fallback and environment variables |
| Report | Short summary of what was built, how to run it, and what was not verified |

## When it is used

**Use it for:** creating, scaffolding or building a website, landing page, dashboard or web app UI inside a code project.

**Do not use it for:**

- Visual direction alone (typography, palette, look and feel) — use `frontend-design`
- Backend-only work, APIs or databases
- Deploying or pushing — the skill prepares deploy settings but does not deploy unless asked

## Installation

The skill is a single `SKILL.md` file in a folder named `create-frontend`.

| Scope | Location |
|---|---|
| One project (shared with the team through the repo) | `<project>/.claude/skills/create-frontend/SKILL.md` |
| All your projects | `~/.claude/skills/create-frontend/SKILL.md` |

If you saved the skill from the review card in Claude, it is already on your account and needs no manual install.

## Usage

Claude loads the skill automatically when a request matches its description. You can also call it by name:

```
/create-frontend
```

Example requests:

```
Build a landing page for our school admissions with a contact form.
```

```
Create a dashboard frontend for this API. Base URL is in .env.example.
```

```
Scaffold a React app here with a login page and a students list.
```

The more of these you give up front, the fewer questions it asks: **purpose and audience**, **pages or screens**, **where the data comes from**, **where it will be hosted**.

---

## Workflow

### 1. Read the project

An existing project's conventions always win over the skill's defaults. Before writing anything, the skill checks:

- `package.json`: framework, scripts, dependencies, Node version (`engines`, `.nvmrc`)
- The lockfile, which decides the package manager. Managers are never mixed.

  | Lockfile | Manager |
  |---|---|
  | `pnpm-lock.yaml` | pnpm |
  | `yarn.lock` | yarn |
  | `bun.lockb` / `bun.lock` | bun |
  | `package-lock.json` | npm |

- Styling approach: Tailwind config, CSS modules, styled-components, plain CSS
- Any component library already installed (shadcn/ui, MUI, Chakra, Radix). It uses that one and does not add a second.
- Folder layout, naming, import aliases, lint and format config
- `CLAUDE.md`, `README`, and any design tokens or brand files

If a frontend already exists, it is extended in its own style. The skill does not re-scaffold, migrate frameworks or reformat untouched files unless asked.

### 2. Settle the requirements

Four things are needed. They are inferred from the request and the repo; one short batch of questions is asked only for what is missing and would change the build.

1. **Purpose and audience** — what it is for and who uses it
2. **Pages or screens** — the list, and which one matters most
3. **Data** — static content, an existing API (base URL and a sample response), or mock data for now
4. **Deploy target** — where it will be hosted, if known

If you are not available to answer, it takes the most reasonable reading, states that assumption at the top of its report, and continues.

### 3. Choose the stack

For new projects only. The simplest option that meets the need is chosen.

| Need | Stack | Scaffold command |
|---|---|---|
| One or two simple pages, no build step wanted | Plain HTML + CSS + JS | none; creates `index.html` |
| Content site, marketing site, blog, docs (mostly static) | Astro | `npm create astro@latest` |
| Interactive app or dashboard, client-rendered | Vite + React + TypeScript | `npm create vite@latest <name> -- --template react-ts` |
| Needs server rendering, SEO on dynamic pages, or API routes | Next.js (App Router, TypeScript) | `npx create-next-app@latest <name>` |

Defaults, unless the project says otherwise:

| Area | Default |
|---|---|
| Language | TypeScript, strict mode |
| Styling | Tailwind CSS. With Vite: `npm install tailwindcss @tailwindcss/vite`, add the plugin to `vite.config.ts`, put `@import "tailwindcss";` in the main CSS file |
| Routing | The framework's own router; React Router for Vite SPAs |
| Forms | Native form elements first; a library only when forms get complex |
| Icons | One icon set, imported per icon (for example `lucide-react`) |

Scaffold commands change between major versions. If one fails or prompts unexpectedly, the skill reads the tool's current docs instead of guessing flags.

Dependencies are added sparingly, and each addition is explained.

### 4. Structure

For a React app (names adapt to the framework's conventions):

```
src/
  components/   reusable UI pieces (Button, Card, Modal)
  features/     feature-specific components, hooks and logic
  pages/        route-level screens (or app/ for Next.js)
  lib/          api client, utilities, constants
  styles/       global CSS and design tokens
  assets/       images, fonts
```

Components stay small and single-purpose, with styles and tests co-located. No dead code, commented-out blocks or leftover scaffold boilerplate (the default demo page, logos and counter are removed).

### 5. Design tokens first

Before any screen is built, tokens are defined once and used everywhere:

- Colours with semantic names: `background`, `foreground`, `primary`, `muted`, `border`, `danger`
- Type scale, spacing scale, radii, shadows

They live in CSS custom properties or the Tailwind theme, not as scattered literal values. Light and dark themes are supported if wanted; otherwise one theme is built well. Brand colours, fonts or a design file you supply are the source of truth. When the look matters and `frontend-design` is available, it is loaded for visual direction.

### 6. Build

The most important screen is built first and shown working, then the rest.

Every screen and component handles:

| Requirement | Detail |
|---|---|
| States | Loading, empty, error and success, not only the happy path |
| Responsive layout | Mobile first; checked at about 375 px, 768 px and 1280 px; no horizontal scroll |
| Accessibility | Semantic HTML (`button`, `nav`, `main`, `label`), keyboard operable, visible focus, alt text on meaningful images, inputs tied to labels, contrast of at least 4.5:1 for body text |
| Real content | Realistic copy and data shapes, not lorem ipsum, unless placeholders are wanted |

Data and configuration:

- One typed API module in `lib/`; components do not call `fetch` with hand-built URLs
- Base URL and public keys come from environment variables (`VITE_*`, `NEXT_PUBLIC_*`, `PUBLIC_*`). A `.env.example` is added and `.env` is kept in `.gitignore`.
- **No secrets in frontend code.** Anything shipped to the browser is public. Secret keys, database credentials and private tokens belong on a server or serverless function. If a task seems to need one in the client, the skill stops and says so.
- Untrusted HTML is never rendered with `dangerouslySetInnerHTML`, `v-html` or `innerHTML` without sanitising

Performance basics: images are sized and lazy-loaded with `width` and `height` set to prevent layout shift, heavy routes are lazy-loaded, and whole libraries are not imported for one function.

### 7. Verify

Each step is run and its findings fixed. Success is never reported for a step that was not run.

| # | Check | How |
|---|---|---|
| 1 | Install | Completes without errors |
| 2 | Typecheck | `tsc --noEmit` or the project's script |
| 3 | Lint | The project's lint script, if one exists |
| 4 | Production build | `npm run build` (or the manager's equivalent) with no errors |
| 5 | Run | Dev or preview server started in the background and confirmed responding |
| 6 | Look | With a browser tool or Playwright: each page opened, screenshots at mobile and desktop widths, console checked for errors. If no browser is available, the report says so plainly. |
| 7 | Tests | Existing tests run; tests added for non-trivial logic if a test setup exists |

Any server the skill started is stopped when it is done.

### 8. Prepare for deploy

Typical host settings:

| Stack | Build command | Output directory |
|---|---|---|
| Plain HTML | none | project root |
| Vite | `npm run build` | `dist` |
| Astro | `npm run build` | `dist` |
| Next.js | `npm run build` | handled by the host adapter (`.next`); static export uses `out` |

- Client-rendered SPAs need a fallback so deep links work: serve `index.html` for unknown routes (a `_redirects` file with `/* /index.html 200` on Netlify and Cloudflare Pages, or a rewrite in `vercel.json`)
- Every environment variable the host needs is listed
- Nothing is deployed, pushed or created on a host unless you ask. Free-plan terms differ between hosts (some restrict commercial use), so check the plan's current terms.

### 9. Report

A short summary:

- What was built and the stack chosen, with the one-line reason
- How to run it (`install`, `dev`, `build` commands)
- What was verified, and anything that was not (for example "not checked in a browser")
- Environment variables needed and deploy settings
- Assumptions made and open questions

---

## Rules

- Existing project conventions beat the skill's defaults
- No framework, UI library or state manager the task does not need
- No scaffold boilerplate left behind, no TODOs presented as done, no mock data presented as real
- No secrets in client code, ever
- A frontend that has not been built and run is not finished

## Customising

Edit `SKILL.md` to match how you work. Common changes:

| To change | Edit |
|---|---|
| Default framework (for example Vue or SvelteKit instead of React) | The stack table in step 3 |
| Styling (plain CSS, CSS modules, a component library) | The defaults list in step 3 |
| Folder layout | Step 4 |
| House accessibility or browser-support standards | Step 6 |
| A fixed hosting provider and its settings | Step 8 |
| When the skill triggers | The `description` line in the frontmatter |

## Related skills

| Skill | Role |
|---|---|
| `frontend-design` | Visual direction: aesthetic, typography, avoiding templated defaults. `create-frontend` hands off to it when the look matters. |

## Limitations

- The skill has not yet been tested on a real project; expect to adjust it after first use.
- Scaffold commands and Tailwind install steps reflect current major versions and will drift. The skill is told to check current docs when a command fails.
- Browser verification depends on a browser tool or Playwright being available in the session.
- It covers web frontends only, not native mobile or desktop apps.
