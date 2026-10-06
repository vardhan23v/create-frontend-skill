# Kiln & Bean — demo site

A small static site for a fictional coffee bar and pottery studio, built as a test run of the
[`create-frontend`](../../create-frontend/SKILL.md) skill. Everything here was produced by following
the skill: project classified as new, plain HTML + CSS + JS chosen for a one-page site, the
**Terracotta** theme picked by project type (local business), `functional` motion level (reveal-once sections, theme cross-fade, menu open/close, press feedback), light and dark modes, own favicon,
SEO basics, a labelled mock for the one backend dependency, and a Playwright smoke suite.

## Run

```bash
npm start          # python3 -m http.server 4173 → http://localhost:4173
```

No build step. Open `index.html` through a server, not from `file://`, because `main.js` is a module.

## Test

```bash
npm install && npx playwright install chromium
npm test           # 5 smoke tests × desktop and mobile
npx @axe-core/cli http://localhost:4173/
```

## Structure

```
index.html          the page: hero, menu, hours and visit, contact
404.html            not-found page with a way back
styles.css          Terracotta tokens (from references/themes.md), type/space/motion scales, components
main.js             mobile nav, theme toggle, today's hours, contact form states
mocks/contact.js    labelled mock for the contact endpoint; a banner shows while it is in use
docs/api-contract.md the backend contract the form is coded against
favicon.svg + .ico, apple-touch-icon.png, icon-192/512.png, og.png, site.webmanifest, robots.txt, sitemap.xml
tests/smoke.spec.js Playwright: clean load, navigation, form validation and submit, dark mode persistence, 404
```

## Deploy

Static host (Netlify, Cloudflare Pages, GitHub Pages, Vercel): publish directory is this folder, no build
command, no environment variables. Replace `https://example.com` in `index.html`, `robots.txt` and
`sitemap.xml` with the real origin, and point `CONTACT_ENDPOINT` in `main.js` at the contact API once it exists.
