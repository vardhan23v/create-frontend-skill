---
name: "create-frontend"
description: "Use when asked to create, scaffold, build, extend or fix a frontend (website, landing page, dashboard, web app UI, a page or component) in a new, existing or partially built code project. Classifies the project, decides the stack by priority, draws the frontend/backend boundary, builds (including motion, 3D and icons when wanted), verifies in seven explicit categories and prepares deploy. For visual direction alone, use frontend-design."
---

# Create Frontend

Build a working, verified frontend end to end: understand the project, respect or choose the stack, implement, verify, and leave it ready to deploy.

The finish line is a frontend that builds cleanly and has been checked in a browser, not code that merely looks right. Never report a check you did not run.

## 0. Classify the project and size the task

Classify before touching anything. Read `package.json`, the lockfile, the source tree and git state (`git status --short`, `git log --oneline -5`).

| Class | How to tell | What it means for the work |
|---|---|---|
| A. New | No `package.json` or source, or an untouched scaffold | Full workflow; you choose the stack (step 3) |
| B. Existing | Working build, consistent structure | Extend in its own style; no re-scaffold, framework migration, major-version upgrade or reformatting of untouched files |
| C. Partially implemented | Half-built pages, TODOs, failing build, mixed conventions, unused dependencies | Inventory first: what works, what is broken, what is missing. Finish in the dominant style. Do not delete half-done work without saying so. |
| D. Needs refactoring | The user asks for it, or the task cannot be done safely without it | Refactor only what the task needs, keep behaviour, work in small reviewable steps, and say what changed and why |

Then size the task so you run only the steps it needs:

| Task | Steps |
|---|---|
| New project | All |
| New page or feature in an existing frontend | 1, 2, 4, 7, 8, 9, 10, 13 |
| Single component or small change | 1 (conventions only), 7, 10 (code, types, build, browser), 13 |
| Fix or restyle | 1, the fix, 10, 13 |

For a new project, or a feature over about three screens, write a short plan first: stack and reason, pages, components, data sources, backend dependencies, order of work. Track it as a task list. Keep going unless a choice is expensive to undo and unclear, in which case ask.

## 1. Read the project

Existing conventions win over this skill's defaults unless the user asks for a change or a convention blocks the task. Inspect:

- `package.json`: framework, scripts (`dev`, `build`, `test`, `lint`, `typecheck`), dependencies, `engines`; `.nvmrc`
- Lockfile decides the package manager: `pnpm-lock.yaml` pnpm, `yarn.lock` yarn, `bun.lock`/`bun.lockb` bun, `package-lock.json` npm. Never mix managers.
- Config: `vite.config.*`, `next.config.*`, `astro.config.*`, `tsconfig.json`, ESLint, Prettier, Tailwind
- Routing: file-based (`app/`, `pages/`, `src/pages/`) or a router package and its route table
- Styling: Tailwind, CSS modules, styled-components or plain CSS; existing tokens, theme files, design system or component library (shadcn/ui, MUI, Chakra, Radix, Vuetify). Use what is there; never add a second.
- Components: naming, folder layout, import aliases, patterns for props, state and data
- Data: existing API client, response types, mocks; `.env.example` and which variables are public
- Tests: framework, location, how they run, whether they pass now
- Framework idioms: Vue/Nuxt, Svelte/SvelteKit, Angular and Solid projects keep their own idioms. Never introduce React into them.

Run the existing `install`, `typecheck`, `lint`, `test` and `build` once before changing anything and record what already fails. You are not responsible for pre-existing failures, but you must not make them worse, and the report lists them.

## 2. Settle the requirements

Infer what is safe to infer. Ask one short batch of questions only for items that materially change the implementation. If the user is unavailable, take the most reasonable reading, state it at the top of the report, and continue.

| Area | Default when not stated | Ask when |
|---|---|---|
| Purpose, users, devices | Infer from the request and repo | It is unclear who uses it |
| Pages, screens, user flows | The obvious set; most important screen first | Scope could reasonably double |
| Data and APIs | The existing API; otherwise a labelled mock behind a contract (step 4) | No API exists and the data model is unclear |
| Auth and roles | None for public sites; the existing auth for apps | Login or roles are needed and no provider exists |
| Responsive and browser support | Mobile first; current evergreen browsers | Legacy browsers, kiosk or tablet-only use |
| Accessibility | WCAG 2.1 AA basics (step 7) | A stricter or audited standard is required |
| SEO | Public site: yes; private app or dashboard: no | Unclear whether it is public |
| Performance | Core Web Vitals targets (step 8) | Unusual constraints (slow networks, very large data) |
| Loading, error, empty, success states | Always, on every async view | - |
| Design references | Use what is supplied; otherwise tokens from step 6 | Brand matters and nothing is supplied |
| Motion and 3D | Functional motion only (step 7); no 3D | The user asks for it, or a reference relies on it |
| Favicon and app icons | Always; from the user's logo or an original mark (step 7) | - |
| Deploy target, environment variables, integrations | Record what is known | A host or integration forces a framework choice |

## 3. Decide the stack

Priority, highest first:

1. Explicit user requirements
2. Existing project architecture
3. Existing dependencies and conventions
4. Team or company constraints (`CLAUDE.md`, contributing guides, lint rules)
5. Project requirements
6. This skill's defaults

An existing stack is preserved unless the user asks for a migration. For a new project, state the stack and the one-line reason before scaffolding.

| Decision | Existing project | New project default | Choose otherwise when |
|---|---|---|---|
| Framework | Keep | Plain HTML+CSS+JS for one or two static pages; Astro for content sites; Vite + React for client-rendered apps; Next.js (App Router) when server rendering, SEO on dynamic pages or API routes are needed | The user names Vue, Svelte, Angular or another: use its official scaffold and apply the rest of this skill unchanged |
| Language | Keep | TypeScript, strict | Plain HTML project |
| Styling | Keep | Tailwind CSS | An existing design system dictates otherwise |
| Component library | Keep the one present | None; build from tokens | Many standard widgets (dialogs, menus, tables) are needed: one accessible headless library (shadcn/ui, Radix) |
| State | Keep | Component state and context | Shared, frequently changing state across many screens: one small store (Zustand, Pinia) |
| Routing | Keep | The framework's router; React Router for Vite SPAs | - |
| Data fetching | Keep | `fetch` in a typed API module | Caching, refetching or shared server state: TanStack Query or framework loaders |
| Forms | Keep | Native elements and built-in validation | Multi-step or many fields: React Hook Form + Zod, or the framework equivalent |
| Testing | Keep | Vitest + Testing Library; Playwright for end-to-end | Plain HTML: Playwright smoke tests only |
| Icons | Keep | One icon set, imported per icon (for example `lucide-react`) | - |
| Animation | Keep | CSS transitions and keyframes | Orchestration, gestures or layout animation: `motion` in React, GSAP for timelines; designer-made vector animation: dotLottie |
| 3D | Keep | None | 3D is the content or the user asks: `<model-viewer>` for a model, `three` + `@react-three/fiber` for a scene (step 7) |
| Build tooling | Keep | The framework's own (Vite, Next, Astro) | - |

Scaffold commands: `npm create vite@latest <name> -- --template react-ts`, `npx create-next-app@latest <name>`, `npm create astro@latest`, `npm create vue@latest`, `npx sv create`. These change between major versions: if one fails or prompts unexpectedly, read the tool's current docs rather than guessing flags, and prefer non-interactive flags. With Vite + Tailwind: `npm install tailwindcss @tailwindcss/vite`, add the plugin to `vite.config.ts`, put `@import "tailwindcss";` in the main CSS.

Add dependencies sparingly and say why for each.

## 4. Backend boundary

This skill builds frontends. Detect when a request needs backend work and do not fake it.

**Backend triggers:** authentication and sessions; roles and permissions; database persistence; server-side validation; private API keys or service-role keys; file uploads to storage; payments; email or SMS; server-side processing, scheduling or webhooks; anything other users must see after a reload.

When a trigger is hit:

1. Name it in the plan and the report as a backend dependency.
2. Do not simulate it with hard-coded data presented as working. A mock is acceptable only when it is labelled as mock in code, in the UI (a dev-only banner or console warning) and in the report, and sits behind the same interface the real implementation will use.
3. Never move a secret into the client to make something "work".
4. Write the contract the frontend codes against: for each endpoint, the method and path, request shape, response shape, error shape and status codes, and auth requirement. Put it in a typed module (for example `src/lib/api/contracts.ts`) or `docs/api-contract.md`, following the existing API client conventions if any.
5. Integrate against the contract with real loading, error, empty and success handling, so the real backend drops in without UI changes.
6. If the user also asked for the backend and the session has the tools for it, hand the contract to that work; otherwise the report lists exactly which backend pieces remain.

## 5. Structure

For a React app (adapt names to the framework's conventions):

```
src/
  components/   reusable UI pieces (Button, Card, Modal)
  features/     feature-specific components, hooks and logic
  pages/        route-level screens (or app/ for Next.js)
  lib/          api client, contracts, utilities, constants
  styles/       global CSS and design tokens
  assets/       images, fonts
  mocks/        mock data, clearly named as mock
```

Keep components small and single-purpose. Co-locate a component's styles and tests with it. No dead code, commented-out blocks or leftover scaffold boilerplate (remove the default demo page, logos and counter). Do not create abstractions or components for a single use.

## 6. Design tokens and visual quality

Before building more than a screen or two, define the tokens once and use them everywhere: colours with semantic names (`background`, `foreground`, `primary`, `muted`, `border`, `danger`, `success`), type scale, spacing scale, radii, shadows, breakpoints, and the states each interactive component needs (hover, focus, active, disabled, loading, error).

- Put them in CSS custom properties or the Tailwind theme, never as scattered literal values
- A tiny project gets a short token file, not a design system
- **Themes**: light and dark only if the project or user wants it, driven by tokens and `prefers-color-scheme`, with a persisted manual toggle. Otherwise build one theme well.
- **Motion tokens**: two or three durations (about 120, 200 and 320 ms) and two easings (ease-out for entrances, ease-in for exits), defined once; every animation uses them. What may move, and how, is in step 7.
- **Fonts**: at most two families; `font-display: swap`; self-host or preconnect

Avoid the generic AI look: gradient backgrounds everywhere, glassmorphism, random animations, a grid of equally rounded cards, decorative elements that do not aid use, and inconsistent spacing or type sizes between screens. Every screen should look like it belongs to the same product.

When a design or reference is supplied, analyse it first: name the characteristics that matter (layout rhythm, type, colour, density, component shapes), reproduce those, and ignore incidental details. The user's brand colours, fonts or design file are the source of truth.

If the `frontend-design` skill is available and the look matters, load it for visual direction instead of improvising here.

## 7. Build

Build the most important screen first, show it works, then the rest.

### States

Every async view handles loading (skeletons over spinners for content), error with a retry, empty with a next action, and success. Long text, missing images, zero items and very many items must not break the layout. Use realistic copy and data shapes, not lorem ipsum, unless the user wants placeholders.

### Responsive

Mobile first. Design for about 375 px, 768 px and 1280 px, not one viewport. Check each explicitly: navigation (collapses, stays reachable), typography (readable at every width), grids (reflow, no orphan columns), tables (scroll within their container or stack), forms (full-width inputs, keyboard does not hide the submit), dialogs (fit the viewport, scroll inside), buttons (do not wrap awkwardly), images (scale, never overflow), no horizontal page scroll, touch targets at least 44 px, hover-only interactions have a touch equivalent.

### Accessibility

Native semantics first; ARIA only when a native element cannot express the role or state.

- Semantic HTML: `button` for actions, `a` for navigation, `nav`, `main`, `header`, `label`; one `h1` per page, headings in order
- Keyboard: everything reachable and operable in a logical order; visible focus; Escape closes dialogs and menus; arrow keys in menus, tabs and listboxes
- Dialogs: focus moves in on open, is trapped while open, and returns to the trigger on close
- Forms: inputs tied to labels; errors in text, linked with `aria-describedby`, announced on submit
- Images: alt text on meaningful images, empty `alt` on decorative ones
- Contrast at least 4.5:1 for body text, 3:1 for large text and UI controls; meaning never by colour alone
- Text scales to 200% zoom without clipping; motion honours `prefers-reduced-motion`; `lang` set on `<html>`

### Data and state

- One typed API module in `lib/`; components never call `fetch` with hand-built URLs
- Type responses; validate at the boundary when the data is not under your control
- Handle slow, failed and empty responses; cancel or ignore stale requests; no duplicate requests for the same data on one screen
- Mock data lives in `mocks/`, is labelled, and swaps for the real API through one switch

### Forms

- Client validation is for speed, never for security; the server must validate too
- Errors next to the field, in words, after the user has tried; keep what they typed
- Submitting: disable the button, show progress, prevent double submission
- Submission errors are shown with a retry; success is confirmed
- Correct input types and `autocomplete` values

### Auth (only when login is required)

- Use the project's existing auth or the provider the user names; never hand-roll crypto or sessions
- Prefer server-set `HttpOnly`, `Secure`, `SameSite` cookies; avoid long-lived tokens in `localStorage`
- Guard private routes, redirect to login and back, handle expired sessions
- Hiding a button is not authorisation; the server enforces permissions

### Errors

A real 404 page and a top-level error boundary (or framework error page) with a way back. User-facing messages say what happened and what to do; details go to the console or a logger.

### Animation

Motion must explain something: where an element came from, what changed, what is loading. Decorative or looping motion with no job is removed, not polished.

- Use the motion tokens from step 6; no ad-hoc durations or easings
- Implement in this order and stop at the first that works: CSS transitions and keyframes (hover, focus, open and close, skeletons) → the View Transitions API for page and list changes where supported → a library only for orchestration, gestures, layout or shared-element animation: `motion` in React, GSAP for complex timelines and scroll choreography, dotLottie for designer-made vector animations
- Animate `transform` and `opacity` only; never `width`, `height`, `top`, `left` or shadows in a loop. `will-change` only on elements about to animate, removed afterwards.
- Scroll-driven animation: CSS scroll-driven animations where supported, otherwise IntersectionObserver; never the scroll event. Reveal-on-scroll runs once, and the content is visible without JavaScript.
- Budget: entrances at most 400 ms, micro-interactions 100 to 250 ms, one animated focal point per view, nothing that delays the user's next action
- `prefers-reduced-motion: reduce` removes movement and leaves short fades or nothing; anything that autoplays for more than 5 s has a pause control

### 3D

Use 3D only when it is the content (a product, a model, a space, a data visualisation) or the user asks for it. A 3D hero on a page about something else is decoration (step 6).

| Need | Approach |
|---|---|
| Tilt, flip, parallax, card depth | CSS 3D transforms and `perspective`; no library |
| Show a model the user can rotate | `<model-viewer>` with a glTF/GLB file: lazy loading, poster image and AR built in |
| An interactive scene | `three` with `@react-three/fiber` and `@react-three/drei` in React; plain `three` elsewhere |
| A designer-made scene | Export it (Spline, or Blender to glTF) and load it; do not rebuild it by hand |

- Lazy-load the scene and its library off the critical path; show a poster image or skeleton until ready and keep it on failure or without WebGL
- Models: glTF/GLB, Draco or Meshopt compressed, textures at most 2048 px, about 5 MB total on a page people visit cold; state the size in the report
- Cap `devicePixelRatio` at 2; render on demand or pause when off-screen or the tab is hidden; dispose geometries, materials and textures on unmount
- Test at 375 px with CPU throttling; if it stutters, ship the poster image on mobile
- Reduced motion: no auto-rotate or camera flythrough; the scene is still until the user interacts
- The canvas has an accessible name and a text alternative; nothing essential exists only inside the scene; keyboard focus is never trapped in it

### Favicon and app icons

Every project ships its own icon; the scaffold default is boilerplate.

- Source: one `favicon.svg`. Use the user's logo if supplied; otherwise make a simple original mark (an initial or plain shape in the primary token colour on a rounded square) and say so in the report. Never copy a third-party logo or a well-known mark.
- It must read at 16 px: one shape, strong contrast, no thin lines, at most two characters. For dark tabs, embed `@media (prefers-color-scheme: dark)` styles inside the SVG.
- Generate from the SVG with `sharp` and `png-to-ico` (dev dependencies, or run once and delete):
  ```
  node -e "const s=require('sharp'),ico=require('png-to-ico').default;Promise.all([16,32,48,180,192,512].map(n=>s('favicon.svg').resize(n,n).png().toFile('icon-'+n+'.png'))).then(()=>ico(['icon-16.png','icon-32.png','icon-48.png'])).then(b=>require('fs').writeFileSync('favicon.ico',b))"
  ```
  Then rename: `icon-180.png` → `apple-touch-icon.png` (give it an opaque background; iOS ignores transparency), keep `icon-192.png` and `icon-512.png` for `site.webmanifest` (512 also as `maskable` with safe padding), delete the 16/32/48 PNGs.
- Head tags: `<link rel="icon" href="/favicon.ico" sizes="32x32">`, `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`, `<link rel="manifest" href="/site.webmanifest">`, `<meta name="theme-color">` per colour scheme
- Placement: Vite and Astro in `public/`; Next.js App Router uses `app/icon.svg`, `app/apple-icon.png` and `app/manifest.ts` and writes the tags itself
- The Open Graph image is a separate 1200×630 image, not the favicon

### SEO (public sites only; skip for private apps and dashboards)

Unique `<title>` and meta description per page; canonical URL where relevant; semantic headings; Open Graph and Twitter card tags with an image; `robots.txt`; a sitemap for multi-page sites; structured data (JSON-LD) when the content type has a schema (article, product, organisation, event). Indexable content is rendered on the server or at build time.

### Internationalisation (only when more than one language is needed)

No hard-coded user-facing strings; the framework's i18n library and message files; `Intl` for dates, numbers and currency; logical CSS properties (`margin-inline`) for right-to-left.

### Security

| Variable kind | Prefix | Where it may appear |
|---|---|---|
| Public (API base URL, public keys, feature flags) | `VITE_*`, `NEXT_PUBLIC_*`, `PUBLIC_*` | Client code, build output |
| Private (API secrets, service-role keys, database URLs, signing secrets) | No public prefix | Server, serverless functions, CI only. Never in client code, never in the bundle. |

- Anything shipped to the browser is public. If a task seems to need a secret in the client, stop and say so (step 4).
- Add `.env.example` with public variables and placeholders; keep `.env*` in `.gitignore`; before finishing, grep the diff for keys and tokens
- Never render untrusted HTML (`dangerouslySetInnerHTML`, `v-html`, `innerHTML`) without sanitising
- URLs: reject `javascript:` and unexpected schemes in user-supplied links; validate redirect targets; `rel="noopener noreferrer"` on external links in new tabs
- Run the package manager's audit after adding dependencies; report high-severity findings; do not auto-apply breaking fixes
- Frontend validation and hidden UI are never security controls

## 8. Performance

Targets on a mid-range phone: Largest Contentful Paint at or under 2.5 s, Interaction to Next Paint at or under 200 ms, Cumulative Layout Shift at or under 0.1. Measure before optimising; fix the largest cost first.

- Dependencies: no library for one function; check the build output for unexpectedly large chunks and say what is in them
- Images: modern formats, correct dimensions, `width` and `height` set, lazy-load below the fold, prioritise the hero
- JavaScript: split by route, lazy-load heavy components; in Next.js keep components server-rendered unless they need browser APIs or interactivity
- Rendering: avoid re-renders from unstable props and context that changes on every render; no API requests in loops or on every keystroke without debouncing
- Loading: no render-blocking scripts or stylesheets that are not needed for the first paint; avoid layout shift from late fonts, images and banners
- Motion and 3D: compositor-only properties; animation and 3D libraries, models and Lottie files lazy-loaded off the critical path and within the budgets in step 7

## 9. Tests

Prefer the project's existing tools. For a new project use the stack chosen in step 3. Do not write tests that only assert a component renders, and do not weaken an assertion to make it pass. Tests must be able to fail.

| Level | Write for | Skip for |
|---|---|---|
| Unit | Utilities, formatters, validators, non-trivial business logic, API mappers | Trivial wrappers |
| Component | Forms, interactive components, important UI states (loading, error, empty) | Static presentational components |
| End-to-end | Critical journeys: sign-in, checkout or payment, the main create/edit flow, primary navigation; a smoke test that each main page loads without console errors | Everything else |

## 10. Verify

Seven categories. Run what you can, fix what you find, and report each one honestly. If a tool or command is unavailable: say exactly what was not verified, do not fabricate a result, and give the command the user can run.

| Category | What it covers | Typical command |
|---|---|---|
| Code | Lint and format pass; no dead code, debug output, TODOs presented as done, or secrets in the diff | project `lint`; review `git diff` |
| Types | Typecheck passes | `tsc --noEmit` or the project script |
| Build | Production build succeeds; bundle sizes reviewed | `npm run build` (or the manager's equivalent) |
| Tests | Existing and new tests pass | project `test`; `npx playwright test` |
| Browser | App runs; routes open; console and network clean; interactions, states, forms and navigation work at desktop and mobile widths | dev or preview server plus a browser tool or Playwright |
| Visual | Screenshots at 375 and 1280 wide (both themes if two) read by you: layout, spacing and typography consistent; nothing clipped or overflowing; animations and 3D settle as intended, honour reduced motion and show their poster until loaded; the tab icon renders | `npx playwright screenshot --viewport-size=375,812 <url> mobile.png` |
| Accessibility | Automated scan plus a keyboard walk | `npx @axe-core/cli <url>` plus manual checks below |

Optional for public sites: `npx lighthouse <url> --only-categories=performance,accessibility,best-practices,seo`; report the scores and fix clear failures.

Pre-existing failures found in step 1 are reported as such, not as yours and not as fixed.

### Browser verification

When a browser tool or Playwright is available: start the app; open every important route at 1280x800 and 375x812; read console errors and warnings; check the network panel for failed requests (4xx, 5xx, CORS, mixed content); exercise the main interactions (navigation, forms with valid and invalid input, submit, dialogs, menus); trigger loading, error and empty states (throttle, block or mock the API); run through the responsive list in step 7; confirm the favicon, manifest and any model or Lottie file load without 404s. Fix what you find and re-check.

When it is not available, write exactly this in the report:

```
BROWSER VERIFICATION: NOT AVAILABLE
```

followed by manual steps the user can run: the command to start the app, the URLs to open, what to look for on each, which interactions to try, and which viewport widths to test.

### Accessibility verification

Semantic HTML existing in the code is not verification. When a browser is available: tab through every page (order logical, focus visible, no traps); Enter and Space activate buttons, Enter activates links; Escape closes dialogs and focus returns to the trigger; arrow keys move within menus and tabs; forms announce labels and errors; zoom to 200% without clipping; reduced motion honoured; touch targets and contrast checked. Run the axe scan and fix serious and critical issues. When no browser is available, report the review as code-level only.

Stop any server you started. Delete screenshots and temporary files unless the user wants them.

## 11. Failure recovery

When something fails: diagnose from the actual error, identify the root cause, fix it, re-run the verification that failed, then report the result. Do not retry the same command unchanged more than twice; change the approach or isolate the cause.

When blocked by missing credentials, an unavailable service or tool, or a decision only the user can make: name the blocker, finish everything that can be completed safely, and list what remains.

| Symptom | Likely cause |
|---|---|
| Install or build fails on syntax inside a dependency | Node older than the tool requires; check `engines` and `.nvmrc` |
| Port already in use | Another dev server; use the next port or stop the one you started |
| Tailwind classes have no effect | Plugin or `@import "tailwindcss"` missing; content paths wrong in older versions |
| Works in dev, blank page in production | Wrong `base` path, missing SPA fallback, or an env variable unset at build time |
| Hydration mismatch warnings | Server and client render differently (dates, random values, `window` access) |
| API calls blocked in the browser | CORS on the API, or a mixed http/https request; fix on the server or use a dev proxy |
| Deep links 404 after deploy | SPA fallback not configured on the host |
| Tests pass locally, fail in CI | Timezone, locale, missing env variable, or a timing-dependent test |
| 3D canvas blank or "WebGL context lost" | No GPU in a headless browser, too many contexts, or a disposed scene; test in a real browser and keep the poster fallback |

## 12. Prepare for deploy

Deployment is optional. Always record what the host needs; deploy only when the user explicitly asks.

| Stack | Build command | Output | Framework-specific |
|---|---|---|---|
| Plain HTML | none | project root | - |
| Vite | `npm run build` | `dist` | Set `base` if not served from `/`; SPA fallback for client routing |
| Astro | `npm run build` | `dist` | SSR needs the host's adapter; static needs none |
| Next.js | `npm run build` | `.next` via the host adapter; static export uses `out` | Needs a Node host or adapter unless statically exported; image optimisation needs a loader on static hosts |

- SPA fallback: serve `index.html` for unknown routes (`_redirects` with `/* /index.html 200` on Netlify and Cloudflare Pages, a rewrite in `vercel.json`, or the host's equivalent)
- List every environment variable, marked public or private, and which are needed at build time
- State the Node version the build needs
- Common risks: env variables set at runtime but needed at build; wrong output directory; missing fallback; free plans that sleep or restrict commercial use (tell the user to check the plan's current terms rather than asserting them); secrets in the repo
- Update the project README with run, build and deploy instructions
- No commits, pushes, hosting projects or deploys unless asked. If asked and the tooling is present: build locally first, confirm env variables are set on the host, deploy to a preview or staging target if the host has one, smoke-check the deployed URL, then promote.

## 13. Verification report

End every run with this report. Keep each line short; omit a section only if it is truly empty, and say so.

```
PROJECT
Framework:
Language:
Styling:
Testing:
Build tool:

IMPLEMENTED
- ...

VERIFIED
- Code:
- Types:
- Build:
- Tests:
- Browser:
- Visual:
- Accessibility:

NOT VERIFIED
- ... (what, why, and the command to run manually)

PRE-EXISTING ISSUES
- ...

KNOWN LIMITATIONS
- ... (including anything mock or placeholder, and how to replace it)

BACKEND DEPENDENCIES
- ... (each with its contract location)

ENVIRONMENT VARIABLES
- NAME (public|private, build-time|runtime): purpose

DEPLOYMENT NOTES
- build command, output directory, fallback, Node version, risks
```

## Definition of done

- [ ] Project classified; existing conventions followed, or the stack choice stated with a reason
- [ ] Code, types, build and tests pass (pre-existing failures reported, not hidden)
- [ ] Browser, visual and accessibility checks run, or reported as not available with manual steps
- [ ] Loading, empty, error and success states exist on every async view
- [ ] Backend dependencies named, with contracts; nothing faked as working
- [ ] No secrets in client code; `.env*` ignored; `.env.example` present
- [ ] No scaffold boilerplate (including the default favicon), dead code or unlabelled mock data
- [ ] README and deploy settings current; verification report produced

## Rules

- Existing project conventions beat this skill's defaults
- Match effort to the task size; do not rebuild what was not asked for
- Prefer the simplest solution that meets the requirements: no library, store, abstraction, component, animation or design system the task does not need; no framework migration without the user asking
- Do not fake backend behaviour; do not present mocks as real
- No secrets in client code, ever
- No commits, pushes or deploys unless asked
- Never claim a verification you did not run
- A frontend that has not been built and run is not finished