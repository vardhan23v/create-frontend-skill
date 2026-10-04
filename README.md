# front-end-skill-claude-code

A Claude Code skill (`create-frontend`) that turns "build me a frontend" into a production-oriented workflow: classify the project, respect or choose the stack, draw the frontend/backend boundary, build with real states and accessibility, verify in seven explicit categories, and finish with an honest verification report.

**Version:** 3.0.0 · **Status:** specification complete, not yet validated on real projects (see [Validation Status](#validation-status))

---

## Contents

- [What it does](#what-it-does)
- [Supported project types](#supported-project-types)
- [Installation](#installation)
- [Usage](#usage)
- [Workflow](#workflow)
- [Stack decisions](#stack-decisions)
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
- [Changelog](#changelog)

---

## What it does

| Stage | Outcome |
|---|---|
| Classify | Decides whether the project is new, existing, partially implemented, or needs refactoring, and sizes the task so a one-component change does not get the new-project treatment |
| Read | Inspects `package.json`, lockfile, config, routing, styling, components, data layer, tests and environment; runs the existing checks once and records what already fails |
| Decide | Chooses the stack by a fixed priority (user → existing architecture → conventions → team constraints → requirements → defaults) |
| Boundary | Detects features that need a backend, writes the API contract, and refuses to fake them |
| Build | Design tokens first, then screens with loading/empty/error/success states, responsive layout, accessibility, forms, security |
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

The skill is one file: `create-frontend/SKILL.md`.

| Scope | Copy to |
|---|---|
| One project (shared through the repo) | `<project>/.claude/skills/create-frontend/SKILL.md` |
| All your projects | `~/.claude/skills/create-frontend/SKILL.md` |

```bash
# all projects
mkdir -p ~/.claude/skills && cp -r create-frontend ~/.claude/skills/
```

If you saved the skill from a review card in Claude, it is already on your account.

## Usage

Claude loads the skill when a request matches its description. You can also call it by name:

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
PROJECT            framework, language, styling, testing, build tool
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

Edit `create-frontend/SKILL.md`:

| To change | Edit |
|---|---|
| Default framework, styling or test stack | The decision table in step 3 |
| Team constraints the skill must respect | Add them to `CLAUDE.md`; the skill reads it in step 1 and ranks it above its own defaults |
| Folder layout | Step 5 |
| Accessibility or browser-support standard | Step 2 defaults and step 7 |
| A fixed hosting provider | Step 12 |
| Report format | Step 13 |
| When the skill triggers | The `description` line in the frontmatter |

## Related skills

| Skill | Role |
|---|---|
| `frontend-design` | Visual direction (aesthetic, typography, avoiding templated defaults). `create-frontend` delegates to it in step 6 when the look matters rather than duplicating it. |

## Limitations

- Web frontends only; no native mobile or desktop apps.
- Backend work is identified and contracted, not implemented.
- Browser, visual and accessibility verification depend on a browser tool or Playwright being available in the session; without them those categories are reported as not verified.
- Scaffold commands and tool invocations (`create-vite`, `create-next-app`, `create-astro`, `sv create`, Playwright, axe, Lighthouse) are current major-version syntax and will drift; the skill is told to read current docs when a command fails.
- The skill reads `CLAUDE.md` and lint config for team constraints; constraints that live only in people's heads must be stated in the request.
- Design judgement is bounded: the skill avoids the generic AI look and follows supplied references, but does not replace a designer.

## Validation Status

Be aware of this before relying on the skill.

**Tested projects:** none. The skill has not yet driven a build on a real project.

**Verification performed on this version (4 Oct 2026, in a sandbox):**

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

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
