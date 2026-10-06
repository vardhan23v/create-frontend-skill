# Motion

Paste-ready animation for step 7 of `create-frontend`. Pick a motion level by project type, copy the tokens once, then use only the recipes that level allows. Every recipe animates `transform` and `opacity` only, uses the shared tokens, runs once where it reveals content, and collapses under `prefers-reduced-motion`. Motion must explain something: where an element came from, what changed, what is loading. If a recipe is not explaining anything on a given screen, do not use it.

## Levels

| Level | Allowed | Themes that default to it | Also when |
|---|---|---|---|
| **minimal** | hover and press feedback, focus, open/close of menus and dialogs, skeletons | Paper & Ink, Gallery, Brass, Pewter | reading-heavy pages, dense tools, the user asks for "calm" or "no animation" |
| **functional** (default) | minimal + reveal-once on scroll for sections, accordion and tab indicators, toasts, theme cross-fade | Harbour, Forest, Terracotta, Midnight, Dusk | any app or site where nothing in the brief asks for showmanship |
| **expressive** | functional + staggered hero entrance, scroll-driven hero progress, view transitions between pages, count-up stats | Birch, Citrus | landing and marketing pages, product launches, the user asks for motion or a reference relies on it |

State the level in the plan and the report (`Motion:` line). Budget at every level: entrances at most 400 ms, micro-interactions 100–250 ms, one animated focal point per view, nothing that delays the user's next action, nothing that loops without a job. 3D and designer-made animation (Lottie) are in step 7 of SKILL.md, not here.

## Tokens

Add to the theme's `:root` block (they do not change between light and dark):

```css
:root {
  --duration-1: 120ms;   /* press, hover, colour */
  --duration-2: 200ms;   /* open, close, indicator slide */
  --duration-3: 320ms;   /* reveal, entrance, page */
  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);   /* entrances: fast start, soft landing */
  --ease-in: cubic-bezier(0.6, 0, 0.8, 0.2);    /* exits: soft start, fast finish */
  --ease-spring: linear(0, 0.3 8%, 0.68 18%, 0.92 28%, 1.03 40%, 1 60%); /* expressive only */
  --rise: 12px;          /* how far a revealed element travels */
}
@media (prefers-reduced-motion: reduce) {
  :root { --duration-1: 1ms; --duration-2: 1ms; --duration-3: 1ms; --rise: 0px; }
}
```

Tailwind v4: map them in `@theme inline` as `--duration-*` and `--ease-*` to get `duration-2`, `ease-out` utilities; or use them through `transition-[transform,opacity] duration-(--duration-2) ease-(--ease-out)`.

Reducing the durations to 1 ms (rather than `animation: none`) keeps every `transitionend`/`animationend` listener firing, so open/close logic that waits for the end of a transition still works for reduced-motion users.

## Recipes

### 1. Hover and press (all levels)

```css
.button { transition: background-color var(--duration-1) var(--ease-out), transform var(--duration-1) var(--ease-out); }
.button:active { transform: translateY(1px); }

.card-link { transition: transform var(--duration-2) var(--ease-out), box-shadow var(--duration-2) var(--ease-out); }
@media (hover: hover) { .card-link:hover { transform: translateY(-2px); box-shadow: var(--shadow-popover); } }

.link { background: linear-gradient(currentColor, currentColor) no-repeat 0 100% / 0 1px; transition: background-size var(--duration-2) var(--ease-out); }
.link:hover { background-size: 100% 1px; }
```

`@media (hover: hover)` keeps lift effects off touch screens, where they would stick after a tap. Box-shadow may transition on hover (a one-off), never in a loop.

### 2. Menu, dialog and popover open/close (all levels)

Native `<dialog>` and `popover` need `@starting-style` and discrete transitions to animate from `display: none`:

```css
dialog, [popover] {
  opacity: 0; transform: translateY(var(--rise)) scale(0.98);
  transition: opacity var(--duration-2) var(--ease-in), transform var(--duration-2) var(--ease-in),
              overlay var(--duration-2) allow-discrete, display var(--duration-2) allow-discrete;
}
dialog[open], [popover]:popover-open { opacity: 1; transform: none; transition-timing-function: var(--ease-out); }
@starting-style { dialog[open], [popover]:popover-open { opacity: 0; transform: translateY(var(--rise)) scale(0.98); } }
dialog::backdrop { background: rgb(0 0 0 / 0.4); transition: background var(--duration-2), overlay var(--duration-2) allow-discrete, display var(--duration-2) allow-discrete; }
@starting-style { dialog[open]::backdrop { background: rgb(0 0 0 / 0); } }
```

A class-toggled menu (mobile nav) uses the same shape without the discrete parts: toggle `data-open`, animate `opacity` and `translateY`. Focus moves in on open and returns to the trigger on close; Escape closes; the animation never delays either.

### 3. Reveal once on scroll (functional and expressive)

CSS scroll-driven where supported, IntersectionObserver otherwise, content visible without JavaScript, runs once.

```css
.reveal { opacity: 1; }                        /* default: visible (no JS, old browsers) */
@supports (animation-timeline: view()) {
  .reveal {
    animation: rise var(--duration-3) var(--ease-out) both;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;       /* finishes once 40% of the element is in view */
  }
}
.js .reveal:not(.is-visible) { opacity: 0; transform: translateY(var(--rise)); }   /* fallback path */
.js .reveal.is-visible { animation: rise var(--duration-3) var(--ease-out) both; }
@keyframes rise { from { opacity: 0; transform: translateY(var(--rise)); } to { opacity: 1; transform: none; } }
```

```js
// fallback for browsers without scroll-driven animations; add class="js" to <html> in the head script
if (!CSS.supports('animation-timeline: view()')) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}
```

Use on section headings, cards and media below the fold, at most one `.reveal` group per section. Never on the hero or anything above the fold: it is already visible and would only flicker.

### 4. Staggered entrance (expressive; functional for short lists)

```css
.stagger > * { animation: rise var(--duration-3) var(--ease-out) both; animation-delay: calc(var(--i, 0) * 60ms); }
```
```html
<ul class="stagger"><li style="--i:0">…</li><li style="--i:1">…</li><li style="--i:2">…</li></ul>
```

Cap the stagger at six items (300 ms total); beyond that, animate the container, not the children. For a hero: eyebrow, heading, lede, actions as `--i` 0–3.

### 5. Accordion and disclosure (functional and expressive)

```css
.disclosure__panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--duration-2) var(--ease-out); }
.disclosure__panel > div { overflow: hidden; min-height: 0; }
.disclosure[data-open="true"] .disclosure__panel { grid-template-rows: 1fr; }
```

Animates height without measuring it. For native `<details>`, `interpolate-size: allow-keywords` on `:root` lets `height: auto` transition in supporting browsers; keep the grid version as the baseline.

### 6. Tab and nav indicator (functional and expressive)

```css
.tabs { position: relative; }
.tabs__indicator { position: absolute; bottom: 0; height: 2px; background: var(--primary); transition: transform var(--duration-2) var(--ease-out), width var(--duration-2) var(--ease-out); }
```
```js
function moveIndicator(tab) { const r = tab.getBoundingClientRect(), p = tab.parentElement.getBoundingClientRect(); indicator.style.width = r.width + 'px'; indicator.style.transform = `translateX(${r.left - p.left}px)`; }
```

Width transitions here are acceptable: one element, one change, not a loop.

### 7. Skeleton (all levels)

```css
.skeleton { background: var(--muted); border-radius: var(--radius-sm); position: relative; overflow: hidden; }
.skeleton::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, color-mix(in oklch, var(--surface) 60%, transparent), transparent); animation: shimmer 1.4s var(--ease-out) infinite; }
@keyframes shimmer { to { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) { .skeleton::after { animation: none; } }
```

The one loop that is allowed: it communicates loading and stops when content arrives. Match skeleton shapes to the content's layout so nothing shifts when it loads.

### 8. Toast (functional and expressive)

```css
.toast { transform: translateY(calc(var(--rise) * 2)); opacity: 0; transition: transform var(--duration-2) var(--ease-out), opacity var(--duration-2) var(--ease-out); }
.toast[data-shown="true"] { transform: none; opacity: 1; }
.toast[data-leaving="true"] { transition-timing-function: var(--ease-in); transform: translateY(var(--rise)); opacity: 0; }
```

`role="status"` on the container so it is announced; dismiss on click and after a delay that scales with text length (minimum 5 s); never stack more than three.

### 9. Theme cross-fade (functional and expressive)

```js
function setTheme(dark) {
  const apply = () => document.documentElement.classList.toggle('dark', dark);
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply); else apply();
}
```
```css
::view-transition-old(root), ::view-transition-new(root) { animation-duration: var(--duration-3); }
```

### 10. Page and view transitions (expressive; functional for list reorders)

Same document (SPA, list changes): wrap the DOM change in `document.startViewTransition(() => update())`. Give moving items `view-transition-name: item-<id>` so they slide rather than fade. Cross-document (Astro, Next.js static, plain HTML):

```css
@view-transition { navigation: auto; }
::view-transition-old(root) { animation: var(--duration-3) var(--ease-in) both fade-out; }
::view-transition-new(root) { animation: var(--duration-3) var(--ease-out) both fade-in; }
@keyframes fade-out { to { opacity: 0; } } @keyframes fade-in { from { opacity: 0; } }
```

Unsupported browsers simply navigate; do not polyfill. In React use the framework's own hook (`useTransition` + `startViewTransition`, or React Router's `viewTransition` prop).

### 11. Scroll-driven hero progress (expressive)

```css
@supports (animation-timeline: scroll()) {
  .hero__art { animation: parallax linear both; animation-timeline: scroll(root); animation-range: 0 60vh; }
  @keyframes parallax { to { transform: translateY(-40px) scale(0.98); opacity: 0.6; } }
}
```

CSS only, compositor-only properties, no scroll listeners. One element per page.

### 12. Count-up stat (expressive)

```js
function countUp(el, to, ms = 800) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to.toLocaleString(); return; }
  const start = performance.now();
  const tick = (now) => { const p = Math.min(1, (now - start) / ms); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString(); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
```

Trigger from the reveal observer so it runs when seen, once. Reserve space with `font-variant-numeric: tabular-nums` and a `min-width` so the number does not jitter.

## When a library is justified

Stop at the first row that works:

| Need | Use |
|---|---|
| Everything above | CSS and the snippets here; no dependency |
| Shared-element and layout animation in React (an item growing into a detail view, reordering lists) | `motion` (`import { motion, AnimatePresence, LayoutGroup } from "motion/react"`), `layout` and `layoutId` props; keep durations on the tokens via `transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}` |
| Gesture-driven motion (drag to dismiss, swipe) | `motion` drag props, or `@use-gesture` with CSS transforms |
| Multi-step timelines, scroll choreography across several elements, pinning | GSAP with ScrollTrigger; register once, `gsap.matchMedia()` for reduced motion and breakpoints, kill on unmount |
| A designer-made vector animation | dotLottie (`@lottiefiles/dotlottie-web` or the web component); lazy-load, poster frame, pause control if longer than 5 s |

Lazy-load any of these off the critical path; state their bundle cost in the report.

## Reduced motion, checked

With the tokens above, reduced motion collapses every transition to 1 ms and removes travel (`--rise: 0`), the skeleton stops shimmering, the theme and view transitions fall back to an instant swap, and count-ups print the final value. Verify it in step 10 by emulating `prefers-reduced-motion: reduce` in the browser tool or Playwright (`page.emulateMedia({ reducedMotion: 'reduce' })`) and confirming nothing moves; the report's Visual line says so.
