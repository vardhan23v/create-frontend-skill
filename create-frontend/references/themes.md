# Colour themes

Eleven named palettes for step 6 of `create-frontend`. Each ships a light and a dark token set, a font pairing, a corner and shadow character, and contrast figures produced by `../scripts/check-contrast.js` (every text pair at least 4.5:1, every UI pair at least 3:1, in both modes). Pick one by project type, name it in the plan and the report, paste its blocks, and build with tokens only.

## Choosing

| Project | Theme |
|---|---|
| Product landing page, SaaS marketing site, startup homepage, pricing page | [Birch](#birch-birch) (or the theme of the product it markets, when that product already has one) |
| E-commerce, marketplace, D2C storefront | [Birch](#birch-birch); artisan or boutique → Terracotta; ethical or eco → Forest; luxury → Brass |
| Blog, help centre, handbook, newsletter, long-form reading | [Paper & Ink](#paper--ink-paper-ink) |
| SaaS dashboard, admin panel, internal tool, data-dense UI (light-first) | [Pewter](#pewter-pewter) |
| Farming, food production, outdoors, nutrition, climate, non-profit | [Forest](#forest-forest) |
| Restaurant, café, bar, hotel, travel, crafts, local business | [Terracotta](#terracotta-terracotta) |
| Developer tool, infrastructure, developer docs, trading, security (dark-first) | [Midnight](#midnight-midnight) |
| Healthcare, insurance, government, civic, school and university sites, consumer fintech | [Harbour](#harbour-harbour) |
| Upbeat consumer app, student-facing learning app, events, clubs, recipe and delivery apps | [Citrus](#citrus-citrus) |
| Portfolio, photography, architecture, fashion, agency, museum | [Gallery](#gallery-gallery) |
| Creative tool, beauty, lifestyle, music, meditation, sleep, journaling, habit tracker | [Dusk](#dusk-dusk) |
| Luxury, wealth, law, premium services | [Brass](#brass-brass) |

Midnight is dark-first: its light mode is a courtesy, so a light-first brief that sounds technical goes to Pewter. When the user supplies brand colours, a logo or a design file, do not pick from this table; take the closest theme by temperature and mood as a base, replace `primary` and `ring` with the brand colour (darken it in light mode and lighten it in dark mode until the checker passes), tint the neutrals toward the brand's temperature, and keep the rest. When the project already has tokens or a component library, use those and ignore this file.

## Token semantics

| Token | Used for |
|---|---|
| `background` / `foreground` | Page background and body text |
| `surface` | Cards, panels, popovers; lifted a step from `background`. Inputs are `surface` on `background` and `background` on `surface` |
| `muted` / `muted-foreground` | Subdued fills (table headers, secondary buttons, disabled fields) and secondary text, placeholders, captions |
| `border` | Dividers and card edges; deliberately light |
| `input` | Outline for text fields, selects and checkboxes: at least 3:1 against `surface` and `background` (WCAG 1.4.11); `border` is too light for this |
| `primary` / `primary-foreground` | The one action colour: primary buttons, links, active navigation. `primary` passes as text on `background` |
| `accent` / `accent-foreground` | Selected states, badges, highlights, chart emphasis; a different hue from `primary`. Where a theme marks accent as fill-only, never set it as body text |
| `ring` | Focus ring; visible at 3:1 on `background`, `surface` and `muted`. Always drawn with a 2px offset in `background`, because it is not visible against `primary` itself |
| `danger`, `success`, `warning` (+ `-foreground`) | Status only. Each passes as text on `background` and as a fill with its own foreground. Never as text inside a `muted` fill: use a status fill there |

Tokens deliberately not provided, because they are derivations: hover `color-mix(in oklch, var(--primary), black 8%)` in light and `color-mix(in oklch, var(--primary), white 10%)` in dark; secondary text on a primary fill `color-mix(in oklch, var(--primary-foreground) 72%, var(--primary))`; text selection `color-mix(in oklch, var(--accent) 25%, transparent)`. Links are `primary` (underlined in Gallery and Paper & Ink). Charts use `primary`, `accent`, `success`, `warning` and `muted-foreground`, in that order.

Colour is scarce: a screen that is mostly `background`, `surface` and `foreground` with one `primary` reads as designed; one that uses every token reads as a template.

## Wiring

Paste the theme's `:root` and `.dark` blocks into the global stylesheet, then map them once.

**Tailwind v4**

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

/* theme blocks from below go here */

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-ring: var(--ring);
  --color-danger: var(--danger);
  --color-danger-foreground: var(--danger-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --font-heading: var(--font-heading);
  --font-body: var(--font-body);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --shadow-card: var(--shadow-card);
  --shadow-popover: var(--shadow-popover);
}

html { color-scheme: light; }
html.dark { color-scheme: dark; }
body { background: var(--background); color: var(--foreground); font-family: var(--font-body); }
h1, h2, h3 { font-family: var(--font-heading); }
```

Then `bg-background text-foreground`, `bg-primary text-primary-foreground`, `border-border` on cards, `border-input` on form controls, `rounded-md`, `shadow-card`, `shadow-popover`, `font-heading`, and for focus `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`.

**Plain CSS or CSS modules**: use the variables directly (`background: var(--surface); border: 1px solid var(--border);`); focus is `outline: 2px solid var(--ring); outline-offset: 2px;`.

**Light and dark, without a flash**

Ship both only when the project or user wants them. The `.dark` class must be on `<html>` before the first paint, which means a plain inline script in `<head>` before any stylesheet, not a deferred or module script and not a React effect:

```html
<script>
  try {
    var s = localStorage.getItem('theme');
    if (s === 'dark' || (!s && matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark');
  } catch (e) {}
</script>
```

- Vite and Astro: put it in `index.html` / the layout `<head>` as the first child.
- Next.js App Router: the server does not know the stored preference, so render `<html suppressHydrationWarning>` and inject the same script in `<head>` with `<script dangerouslySetInnerHTML={{ __html: '...' }} />` (or use `next-themes`, which does exactly this). Without `suppressHydrationWarning`, React warns about the class mismatch.
- `color-scheme` follows the class (`html.dark { color-scheme: dark }`), not the OS, so form controls and scrollbars match the chosen mode. Set `<meta name="theme-color">` for each mode via `media="(prefers-color-scheme: ...)"`, or update it from the toggle.
- The toggle writes `localStorage.theme` and adds or removes the class. Offer a "system" option by removing the key.
- For a single-mode project keep one block, delete the other, drop the `@custom-variant` line and the script, and set `color-scheme` to that mode.

**Checking changes**: after deriving from a brand or editing any value, write the tokens as `{"light": {...}, "dark": {...}}` (camelCase keys: `mutedForeground`, `primaryForeground`, …) and run `node <skill directory>/scripts/check-contrast.js tokens.json`. Fix every pair reported with `ok: false` before building on the palette, and read the warnings: they name hue collisions and tokens that are fill-only.

Each theme below lists its fonts, shape and usage, then one `:root` block (light tokens, fonts, radii, shadows) and one `.dark` block.

## Birch `birch`

White bark, dark marks, one green leaf: a neutral canvas for screenshots and product photography with one emerald call to action and a coral promo accent. It signals a clean, current product without the template indigo.

- **Best for:** Product landing pages and SaaS marketing sites; startup and company homepages; pricing, comparison and sign-up flows; mainstream e-commerce and marketplaces; D2C consumer-goods storefronts; feature pages built around screenshots and product photos
- **Avoid for:** Long-form reading and editorial (use Paper & Ink); data-dense dashboards and consoles (use Pewter or Midnight); artisan, luxury or eco brands where a neutral canvas reads as generic (use Terracotta, Brass or Forest)
- **Fonts:** Bricolage Grotesque for headings, Figtree for body (Google Fonts). Bricolage Grotesque has enough personality in its headline cuts to carry a hero without a gradient; Figtree is a clean, friendly text sans that does not read as Inter.
- **Shape:** soft corners (8px / 12px / 16px); soft elevation
- **Use:** Primary (emerald) is add-to-cart, sign-up and checkout: one per view. Accent (coral) is for sale, new and promo badges and nothing else. Success means in stock, warning low stock, danger out of stock and errors; never colour prices. The canvas is near-white so screenshots and product photography carry the page; separate sections with background, surface and border only.
- **Dark mode:** Dark is a neutral charcoal ladder (background darkest, surface and muted lifted), off-white text, and emerald, coral and the status colours lifted to pass as text.
- **Contrast (checked):** body text 17.02:1 light, 15.02:1 dark; lowest text pair 4.79:1 light (successForeground on success), 5.84:1 dark (mutedForeground on muted); lowest UI pair 3.06:1 light, 3.13:1 dark. success never as text inside a muted fill

```css
:root {
  --background: #fafaf7;
  --foreground: #16181a;
  --surface: #fefefc;
  --muted: #eeede8;
  --muted-foreground: #5b5f64;
  --border: #d8d7d0;
  --input: #90908d;
  --primary: #0e7a50;
  --primary-foreground: #effbf4;
  --accent: #b8431a;
  --accent-foreground: #fff6f0;
  --ring: #15996a;
  --danger: #b01f45;
  --danger-foreground: #fdf2f4;
  --success: #4a7a12;
  --success-foreground: #eefaf1;
  --warning: #8c5a0a;
  --warning-foreground: #fdf6e8;
  --font-heading: "Bricolage Grotesque", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-body: "Figtree", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-card: 0 1px 2px rgba(22, 24, 26, 0.05), 0 8px 24px -8px rgba(22, 24, 26, 0.10);
  --shadow-popover: 0 4px 12px rgba(22, 24, 26, 0.12);
}
.dark {
  --background: #121416;
  --foreground: #e8e8e3;
  --surface: #1a1d20;
  --muted: #24282c;
  --muted-foreground: #9ea3a8;
  --border: #343a3f;
  --input: #666b6d;
  --primary: #4fd198;
  --primary-foreground: #05231a;
  --accent: #f28a5c;
  --accent-foreground: #2a140a;
  --ring: #66dcaa;
  --danger: #f27d8a;
  --danger-foreground: #2a0c11;
  --success: #a6d65c;
  --success-foreground: #07251a;
  --warning: #e9b24f;
  --warning-foreground: #291a05;
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.45), 0 6px 16px rgba(0, 0, 0, 0.35);
  --shadow-popover: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

## Paper & Ink `paper-ink`

Warm cream stock with ink-dark text, a fountain-pen blue for links and actions and a single vermilion highlight per page. It signals a considered, editorial voice: slow reading, typographic confidence, no neon.

- **Best for:** Blogs and personal essays; product help centres, handbooks and prose-first knowledge bases; newsletters and email-style archives; online magazines and journals; long-form reading apps and book-like sites; author and publication landing pages
- **Avoid for:** Data-dense dashboards that need many categorical colours; consumer apps or games that want punchy, saturated UI; status-heavy UIs where a vermilion highlight could be read as an error
- **Fonts:** Fraunces for headings, Source Serif 4 for body (Google Fonts). Fraunces is a soft, old-style display serif with optical sizes, so headlines feel set rather than typed; Source Serif 4 is a well-hinted text serif designed for screen reading at long measures. Two serifs keep the page feeling like print, and neither is Inter.
- **Shape:** sharp corners (2px / 4px / 6px); flat elevation
- **Use:** Primary (the ink blue) is for links, the one primary button per view and the active nav item; the page is mostly cream, ink text and hairline borders, with flat edged cards rather than shadows. Accent (vermilion) is the single highlight per page: a pull-quote rule, a tag, a "new" marker, chart series one. Danger is a cooler crimson kept strictly for errors, always with an icon or the word "Error", and never beside an accent badge. Aim for under 10% chromatic colour on any screen.
- **Dark mode:** The neutrals keep the same warm cast but run from a near-black ink background up through surface and muted in 3–5% lightness steps, with an aged-paper off-white for text. Primary, accent and the status colours keep their hues and are lifted to mid-light tints so each passes 4.5:1 as text on the dark background; their foregrounds flip to tinted near-blacks.
- **Contrast (checked):** body text 15.09:1 light, 14.25:1 dark; lowest text pair 5.06:1 light (mutedForeground on muted), 5.52:1 dark (mutedForeground on muted); lowest UI pair 3.07:1 light, 3.13:1 dark

```css
:root {
  --background: #f8f4ec;
  --foreground: #221e1a;
  --surface: #fdfaf4;
  --muted: #ebe5da;
  --muted-foreground: #675e55;
  --border: #dcd3c5;
  --input: #928b81;
  --primary: #3d5a73;
  --primary-foreground: #f4f8fb;
  --accent: #a2381d;
  --accent-foreground: #fdf6ee;
  --ring: #4f7596;
  --danger: #ab1f4a;
  --danger-foreground: #fdf2f4;
  --success: #3f6b34;
  --success-foreground: #f3f8ee;
  --warning: #8a5a0b;
  --warning-foreground: #fdf6e8;
  --font-heading: "Fraunces", Georgia, "Times New Roman", serif;
  --font-body: "Source Serif 4", Georgia, "Times New Roman", serif;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  --shadow-card: none;
  --shadow-popover: 0 4px 12px rgba(34, 30, 26, 0.12);
}
.dark {
  --background: #1a1612;
  --foreground: #ece4d6;
  --surface: #221d18;
  --muted: #2e2822;
  --muted-foreground: #a89e90;
  --border: #3a332b;
  --input: #716a60;
  --primary: #8fb0c9;
  --primary-foreground: #14181c;
  --accent: #e07a60;
  --accent-foreground: #1f1410;
  --ring: #a3c2d8;
  --danger: #ec7d9e;
  --danger-foreground: #1f1114;
  --success: #96c284;
  --success-foreground: #141a0f;
  --warning: #e0a94a;
  --warning-foreground: #1f1608;
  --shadow-card: none;
  --shadow-popover: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

## Pewter `pewter`

Cool, quiet and engineered: blue-grey neutrals stay out of the way so tables and charts carry the colour, while a deep petrol action colour and a plum highlight signal precision rather than marketing gloss. Light-first.

- **Best for:** B2B SaaS dashboards; admin panels and back-office tools; light-first business dashboards: finance, HR, CRM, logistics, inventory; reporting and BI views with many categorical chart series; internal tools and ops consoles; data-dense tables and forms
- **Avoid for:** Consumer or lifestyle marketing that needs warmth; dark-first developer-facing products (use Midnight); playful or kid-oriented products
- **Fonts:** Instrument Sans for headings, Public Sans for body (Google Fonts). Instrument Sans gives headings and KPI numbers a crisp, slightly condensed voice; Public Sans is a neutral workhorse with a full weight range and tabular figures (font-variant-numeric: tabular-nums) for dense tables. Neither is the template default.
- **Shape:** sharp corners (2px / 4px / 6px); flat elevation
- **Use:** Keep screens about 90% neutral: background for the page, surface for cards, tables and inputs, muted for table header rows, badges and secondary buttons. Primary is the single action colour (primary buttons, links, active nav, the main chart series); accent is reserved for selected rows, highlight badges and the one chart series you want the eye to land on. Status colours appear only as inline text or small filled pills so the rose, emerald and ochre stay meaningful in dense data. Cards and panels use 1px var(--border) on var(--surface); the popover shadow is reserved for menus and dialogs. Charts use primary, accent, success, warning and mutedForeground, in that order.
- **Dark mode:** Dark lifts the blue-grey ladder from a near-black background through surface and muted in small steps; primary, accent and status colours move to roughly 50–65% lightness so each passes as text; foreground is a cool off-white.
- **Contrast (checked):** body text 14.21:1 light, 14.87:1 dark; lowest text pair 5.12:1 light (mutedForeground on muted), 5.59:1 dark (danger on surface); lowest UI pair 3.09:1 light, 3.06:1 dark

```css
:root {
  --background: #f1f4f7;
  --foreground: #1a2430;
  --surface: #fafbfc;
  --muted: #e2e7ec;
  --muted-foreground: #52616e;
  --border: #c9d2da;
  --input: #838c96;
  --primary: #2b4d50;
  --primary-foreground: #eefafb;
  --accent: #a4408f;
  --accent-foreground: #fdf2fa;
  --ring: #1a8d97;
  --danger: #b52f45;
  --danger-foreground: #fff3f4;
  --success: #1c7049;
  --success-foreground: #ecfaf1;
  --warning: #8f5a12;
  --warning-foreground: #fff7e8;
  --font-heading: "Instrument Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-body: "Public Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  --shadow-card: none;
  --shadow-popover: 0 4px 12px rgba(26, 36, 48, 0.12);
}
.dark {
  --background: #10161c;
  --foreground: #e3e9ee;
  --surface: #171f26;
  --muted: #222c35;
  --muted-foreground: #97a6b3;
  --border: #303d49;
  --input: #606b76;
  --primary: #45adb5;
  --primary-foreground: #07242a;
  --accent: #c97fb6;
  --accent-foreground: #2a0f24;
  --ring: #5ec4cc;
  --danger: #e8707c;
  --danger-foreground: #2c0a10;
  --success: #5cc08a;
  --success-foreground: #08261a;
  --warning: #e3a84a;
  --warning-foreground: #2b1a04;
  --shadow-card: none;
  --shadow-popover: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

## Forest `forest`

Grounded and quietly confident, like a farm-shop label or a trail map: cream paper, deep conifer green and a warm ochre stamp. It signals care, provenance and patience rather than speed or hype.

- **Best for:** Farms, agriculture and food producers; outdoor, hiking and nutrition brands; sustainability and climate organisations; non-profits, charities and cause campaigns; eco-commerce and ethical product storefronts; garden, landscape and forestry services
- **Avoid for:** Meditation and calm wellness apps (use Dusk); dark-first or technical products (use Midnight); luxury brands (use Brass)
- **Fonts:** Lora for headings, Work Sans for body (Google Fonts). Lora is a calligraphic serif that reads as a field guide or farm label rather than a startup; Work Sans is an open, slightly wide sans that stays friendly at small sizes.
- **Shape:** soft corners (4px / 8px / 12px); soft elevation
- **Use:** Use primary (deep green) for the single call to action, links and active navigation, and let most of the screen be cream background with surface cards edged by border rather than heavy shadows. Reserve the ochre accent for small moments: selected tabs, badges, chart series and highlighted stats, no more than one or two per view. Keep colour density low overall so the palette feels like paper and plant rather than a UI kit; status colours only appear on inline messages, toasts and form validation. In light mode accent (ochre) is a fill, badge, chart or large-text colour only, never body-size text. Success never appears as bare coloured text next to a link; always with a check icon or the word.
- **Dark mode:** Dark swaps the paper/ink roles: backgrounds become conifer-tinted near-blacks (background darkest, surface and muted lifted) and foreground becomes the light cream rather than white; primary, accent and status colours are lifted so each passes as text.
- **Contrast (checked):** body text 13.9:1 light, 13.98:1 dark; lowest text pair 4.65:1 light (success on background), 6.12:1 dark (mutedForeground on muted); lowest UI pair 3.06:1 light, 3.06:1 dark. accent is fill-only in light mode (under 4.5:1 as text); success never as text inside a muted fill

```css
:root {
  --background: #f2f3e4;
  --foreground: #1c261f;
  --surface: #fafbf4;
  --muted: #e4e7d2;
  --muted-foreground: #55604f;
  --border: #cdd2b8;
  --input: #868d7b;
  --primary: #2e5c3b;
  --primary-foreground: #f5f1e6;
  --accent: #b07d22;
  --accent-foreground: #1f1706;
  --ring: #3f7a50;
  --danger: #ad2a3c;
  --danger-foreground: #fbf4ee;
  --success: #3f7a28;
  --success-foreground: #f3f8ee;
  --warning: #9c4a0e;
  --warning-foreground: #fbf5e8;
  --font-heading: "Lora", Georgia, "Times New Roman", serif;
  --font-body: "Work Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-card: 0 1px 2px rgba(28, 38, 31, 0.06), 0 6px 16px rgba(28, 38, 31, 0.08);
  --shadow-popover: 0 4px 12px rgba(28, 38, 31, 0.12);
}
.dark {
  --background: #111a14;
  --foreground: #e9e4d5;
  --surface: #192319;
  --muted: #243126;
  --muted-foreground: #a7b19f;
  --border: #34433a;
  --input: #656e64;
  --primary: #86bd8f;
  --primary-foreground: #0f1b13;
  --accent: #d8a94f;
  --accent-foreground: #1f1706;
  --ring: #9bd1a5;
  --danger: #ec7f88;
  --danger-foreground: #2b100b;
  --success: #a6d66a;
  --success-foreground: #112009;
  --warning: #f08a3c;
  --warning-foreground: #261b06;
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.45), 0 6px 16px rgba(0, 0, 0, 0.35);
  --shadow-popover: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

## Terracotta `terracotta`

Sun-warmed clay on sand with a olive glaze counterpoint: unhurried, handmade and hospitable. It signals a real place run by real people rather than a SaaS product.

- **Best for:** Restaurants, cafés and bars; hotels, guesthouses and travel; farmers markets, wine bars and delicatessens; independent boutiques and small e-commerce; craft, pottery and makers' studios; local services and neighbourhood businesses
- **Avoid for:** Farms and food producers (use Forest); data-dense dashboards (use Pewter); dark-first technical products (use Midnight)
- **Fonts:** Fraunces for headings, Nunito Sans for body (Google Fonts). Fraunces is a soft, slightly wonky display serif that feels hand-set and pairs naturally with clay and sand; Nunito Sans has gently rounded terminals that keep menus, listings and forms friendly and legible without the generic Inter look. Both are variable, well-hinted and widely cached.
- **Shape:** soft corners (6px / 10px / 16px); soft elevation
- **Use:** Let the sand background and parchment surfaces do most of the work; use the clay primary only for the main CTA, links and the active nav item, so it stays tactile rather than loud. The olive accent is for selected states, tags, chart series and small highlights, not for buttons, so that primary and accent never compete. Keep status colours to inline text and small badges; on a typical screen aim for roughly 80% neutrals, 10-15% primary, 5% accent. Links inside muted fills are underlined.
- **Dark mode:** Dark keeps the warm clay cast: a near-black umber background with surface and muted lifted in small steps, cream text, and primary, accent and status colours lifted into the 57–71% lightness band with chroma held roughly constant so each passes as text.
- **Contrast (checked):** body text 13.41:1 light, 14.75:1 dark; lowest text pair 4.83:1 light (warning on background), 5.11:1 dark (mutedForeground on muted); lowest UI pair 3.11:1 light, 3.09:1 dark. warning never as text inside a muted fill

```css
:root {
  --background: #f4ecdf;
  --foreground: #2b211a;
  --surface: #fbf6ee;
  --muted: #e9dece;
  --muted-foreground: #66554a;
  --border: #d8c9b4;
  --input: #918475;
  --primary: #a8432a;
  --primary-foreground: #fdf6ee;
  --accent: #6b6e27;
  --accent-foreground: #f6f6ea;
  --ring: #c4552f;
  --danger: #b01f48;
  --danger-foreground: #fdf2f0;
  --success: #3d6e3c;
  --success-foreground: #f0f7ee;
  --warning: #8f5c0f;
  --warning-foreground: #fdf6e8;
  --font-heading: "Fraunces", Georgia, "Times New Roman", serif;
  --font-body: "Nunito Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-card: 0 1px 2px rgba(60, 35, 20, 0.06), 0 4px 14px rgba(60, 35, 20, 0.08);
  --shadow-popover: 0 4px 12px rgba(43, 33, 26, 0.12);
}
.dark {
  --background: #1c1613;
  --foreground: #f1e8db;
  --surface: #262019;
  --muted: #332b23;
  --muted-foreground: #a89b8b;
  --border: #4a3f35;
  --input: #756b60;
  --primary: #e07b55;
  --primary-foreground: #2b1711;
  --accent: #c2c768;
  --accent-foreground: #23240a;
  --ring: #ea8a64;
  --danger: #f27d95;
  --danger-foreground: #2e0f0e;
  --success: #79b07e;
  --success-foreground: #0f2612;
  --warning: #e0a94a;
  --warning-foreground: #2a1b05;
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.45), 0 6px 16px rgba(0, 0, 0, 0.35);
  --shadow-popover: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

## Midnight `midnight`

Navy-ink dark mode with an electric cyan primary and a lime accent that glow like an aurora over a deep night sky; light mode keeps the same cool ink, tinted toward the cyan, and reads as crisp, technical and serious. It signals precision, uptime and competence rather than playfulness. Ship dark as the default mode; light is a secondary mode.

- **Best for:** Developer tools and CLIs with a web console; infrastructure, observability and log dashboards (dark-first); API reference, developer docs and status pages; trading, crypto and market-data terminals; security and monitoring products; technical SaaS aimed at engineers
- **Avoid for:** Light-first business back-office tools (use Pewter); editorial, long-form reading sites where a cool, cyan-tinted UI fights slow reading; children's and consumer lifestyle products
- **Fonts:** IBM Plex Mono for headings, IBM Plex Sans for body (Google Fonts). Monospace headlines are on-brief for a terminal-adjacent console and unlike every other theme; IBM Plex Sans is the matching text face with tabular figures for logs and metrics. Two families only; code blocks reuse the heading face.
- **Shape:** soft corners (4px / 6px / 10px); flat elevation
- **Use:** Keep screens mostly ink and off-white: primary cyan is reserved for the single main action per view, links and the active nav item, and the focus ring is its brighter sibling. Lime accent is the second voice only, for selected rows, chart series two and the occasional highlight, never a second button colour and never a fill larger than a badge or chart series; live, connected and healthy states belong to success, not accent, so the two greens are never asked to mean different things side by side. In dark mode let surfaces and 1px borders do the layering (shadows vanish on ink) and lean on muted fills for table headers, disabled fields and secondary buttons; in light mode cards are the near-white surface on the cool cyan-tinted background with the same border rule, and status colours appear mainly as text and thin badges rather than large fills. No card shadows: 1px var(--border) edges and muted fills for table headers carry the structure, so the hue stays scarce. Charts use primary, accent, success, warning and mutedForeground, in that order.
- **Dark mode:** Dark is the designed mode: an ink-navy background, surfaces lifted in small steps, off-white text, and a cyan primary and lime accent at mid-high lightness so they pass as text without glare; status colours sit around 7:1 on background.
- **Contrast (checked):** body text 16.06:1 light, 15.54:1 dark; lowest text pair 4.97:1 light (accentForeground on accent), 5.85:1 dark (mutedForeground on muted); lowest UI pair 3.07:1 light, 3.13:1 dark. success never as text inside a muted fill

```css
:root {
  --background: #f2f6f9;
  --foreground: #041b2f;
  --surface: #fafcfd;
  --muted: #dde8ef;
  --muted-foreground: #455f77;
  --border: #bccbd6;
  --input: #7d8f9d;
  --primary: #006a7e;
  --primary-foreground: #f0fbfc;
  --accent: #577600;
  --accent-foreground: #f7faef;
  --ring: #00869c;
  --danger: #be2132;
  --danger-foreground: #fff6f5;
  --success: #007840;
  --success-foreground: #f2fbf5;
  --warning: #975800;
  --warning-foreground: #fef8ed;
  --font-heading: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --font-body: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --shadow-card: none;
  --shadow-popover: 0 4px 12px rgba(4, 27, 47, 0.12);
}
.dark {
  --background: #06132a;
  --foreground: #e2edf2;
  --surface: #071c2f;
  --muted: #112c42;
  --muted-foreground: #90a9b9;
  --border: #263b4d;
  --input: #596b7a;
  --primary: #38c3d2;
  --primary-foreground: #01151b;
  --accent: #a9d64a;
  --accent-foreground: #121904;
  --ring: #5fdbe8;
  --danger: #fd7e82;
  --danger-foreground: #230708;
  --success: #56db8f;
  --success-foreground: #021709;
  --warning: #fab549;
  --warning-foreground: #231200;
  --shadow-card: none;
  --shadow-popover: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

## Harbour `harbour`

Calm, institutional and deliberately unflashy: a steel sea-blue on cool near-white reads as a public service that has nothing to hide, with a sea-teal accent that adds life without noise. It signals competence, safety and legibility first.

- **Best for:** Healthcare providers, clinics and patient portals; insurance quote and claims flows; government and civic services; schools, colleges and universities: public sites, admissions and parent portals; neobanks, budgeting, payments and credit-union apps; utilities, transport and public information
- **Avoid for:** Marketing landing pages chasing a bold, trend-driven identity (use Birch); dark-first developer products (use Midnight); luxury or lifestyle brands
- **Fonts:** Libre Franklin for headings, Source Sans 3 for body (Google Fonts). Libre Franklin is the civic, newspaper-and-signage grotesque: trustworthy without being corporate; Source Sans 3 is a plain, highly legible text face with a wide weight range for forms and long tables.
- **Shape:** soft corners (4px / 6px / 10px); soft elevation
- **Use:** Primary carries every action: buttons, links, active nav and the focus ring; it also passes as body-size text so inline links need no underline-only fallback. Use accent sparingly for selected rows, chips, progress and the second chart series, never for calls to action. Keep most of a screen in background, surface and muted with border-defined cards, so that status colours and the two brand hues stay rare enough to mean something. Render focus rings with a 2px offset in background so they read on primary fills.
- **Dark mode:** Dark keeps the same ~205° hue family but steps lightness instead of inverting: background is a deep harbour navy, surface is lifted a few percent, muted lifted again, and border lighter still, with text an off-white cool grey. Primary, accent and status colours are raised in lightness and slightly desaturated so each passes as text on the dark background, and their foregrounds flip to deep tints of the same hue.
- **Contrast (checked):** body text 14.7:1 light, 14.88:1 dark; lowest text pair 4.93:1 light (accentForeground on accent), 5.83:1 dark (mutedForeground on muted); lowest UI pair 3.08:1 light, 3.1:1 dark. success never as text inside a muted fill

```css
:root {
  --background: #f4f8fb;
  --foreground: #15252f;
  --surface: #fbfdfe;
  --muted: #dde7ee;
  --muted-foreground: #4d6273;
  --border: #c6d4de;
  --input: #81909a;
  --primary: #205a9a;
  --primary-foreground: #f4f9fc;
  --accent: #0f7a6c;
  --accent-foreground: #f2faf8;
  --ring: #2e6fb5;
  --danger: #b42d3a;
  --danger-foreground: #fdf4f4;
  --success: #2c7836;
  --success-foreground: #f1faf5;
  --warning: #8a5a0e;
  --warning-foreground: #fdf7ec;
  --font-heading: "Libre Franklin", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-body: "Source Sans 3", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --shadow-card: 0 1px 2px rgba(13, 26, 36, 0.06), 0 2px 8px rgba(13, 26, 36, 0.06);
  --shadow-popover: 0 4px 12px rgba(21, 37, 47, 0.12);
}
.dark {
  --background: #0d1a24;
  --foreground: #e4edf3;
  --surface: #15252f;
  --muted: #1f333f;
  --muted-foreground: #9bb0bf;
  --border: #2f4656;
  --input: #5e717f;
  --primary: #6facea;
  --primary-foreground: #0b1b27;
  --accent: #4fc3ae;
  --accent-foreground: #06201a;
  --ring: #86bdf0;
  --danger: #f08c92;
  --danger-foreground: #2a0b0e;
  --success: #74d27f;
  --success-foreground: #06271a;
  --warning: #e8b45c;
  --warning-foreground: #2b1d05;
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.45), 0 6px 16px rgba(0, 0, 0, 0.35);
  --shadow-popover: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

## Citrus `citrus`

Tangerine actions on warm off-white with an aubergine ink and a grape accent: energetic, friendly and legible without gradients. It signals a product that is fun to use and takes its users seriously.

- **Best for:** Consumer apps with an upbeat, social tone; student-facing classroom, e-learning and campus-life apps; events, ticketing and festivals; clubs, memberships and social community apps; recipe and food-delivery apps; playful marketing and campaign sites
- **Avoid for:** Healthcare, finance and government (use Harbour); luxury and editorial brands (use Brass or Paper & Ink); data-dense dashboards (use Pewter)
- **Fonts:** Red Hat Display for headings, Red Hat Text for body (Google Fonts). Red Hat Display has round, open headline forms that feel friendly without the geometric template look; Red Hat Text is its matching text face, so the pair is one voice at two sizes.
- **Shape:** round corners (8px / 12px / 20px); soft elevation
- **Use:** Keep the page mostly cream and aubergine; reserve the tangerine primary for the single main action, links and active navigation, and let the brighter ring colour carry focus states. Use the grape-grape accent sparingly for selected rows, badges, progress and the second chart series so it stays a highlight rather than a competing brand colour. Lean on the marigold-tinted muted fill and tan border for structure instead of grey, and aim for roughly one accent element per screen section. Warning stays in text, badges and thin banners rather than large fills beside primary actions; dividers inside muted regions use foreground at about 14% alpha; links inside muted fills are underlined.
- **Dark mode:** The aubergine ink becomes the neutral base: background is a plum-black (L≈0.7%), surface and muted step up a few percent in lightness on the same hue, and the cream page colour becomes the off-white foreground. Primary, accent and status colours keep their hues but rise in lightness and drop in saturation (tangerine #b35400 → #f0954f, jade #0f7f66 → #5fd4ad), so each passes as text on the dark background while their foregrounds flip to deep tints of the same hue.
- **Contrast (checked):** body text 13.62:1 light, 15.68:1 dark; lowest text pair 5.08:1 light (successForeground on success), 6.32:1 dark (danger on surface); lowest UI pair 3.06:1 light, 3.11:1 dark. success never as text inside a muted fill

```css
:root {
  --background: #fff8ec;
  --foreground: #3b1f42;
  --surface: #fffcf5;
  --muted: #f7e8cc;
  --muted-foreground: #6e5473;
  --border: #e8d5b4;
  --input: #a18a85;
  --primary: #a84e00;
  --primary-foreground: #fffaf0;
  --accent: #7a3fb0;
  --accent-foreground: #f8f3ff;
  --ring: #cf5f08;
  --danger: #bb2449;
  --danger-foreground: #fff5f0;
  --success: #33791f;
  --success-foreground: #f3fbe9;
  --warning: #855f00;
  --warning-foreground: #fff8e1;
  --font-heading: "Red Hat Display", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-body: "Red Hat Text", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --shadow-card: 0 1px 2px rgba(59, 31, 66, 0.06), 0 4px 14px rgba(179, 84, 0, 0.10);
  --shadow-popover: 0 4px 12px rgba(59, 31, 66, 0.12);
}
.dark {
  --background: #1a1120;
  --foreground: #f6ecdc;
  --surface: #251a2b;
  --muted: #332539;
  --muted-foreground: #b9a6bf;
  --border: #3f3046;
  --input: #746772;
  --primary: #f0954f;
  --primary-foreground: #2a1430;
  --accent: #c49bf0;
  --accent-foreground: #24103a;
  --ring: #f6a85e;
  --danger: #f5788f;
  --danger-foreground: #2d0f0c;
  --success: #86d06a;
  --success-foreground: #15260c;
  --warning: #f5cc4f;
  --warning-foreground: #2e2000;
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.45), 0 6px 16px rgba(0, 0, 0, 0.35);
  --shadow-popover: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

## Gallery `gallery`

White-cube walls, black type and one cobalt signal: buttons are ink, not colour; the work and the typography carry the page, and cobalt appears only when something is selected, focused or needs attention. It signals restraint, confidence and curation rather than product-marketing energy.

- **Best for:** Portfolios and personal sites; photography and architecture studios; fashion and editorial brands; design and creative agencies; museums, galleries and exhibitions; art and print shops with a few products
- **Avoid for:** Any product UI with many controls, states and status colours; Gallery is for portfolio and editorial pages where monochrome is the convention; promotion-heavy e-commerce with sale badges and multiple CTAs per screen (use Birch); dashboards (use Pewter)
- **Fonts:** Archivo for headings, Archivo for body (Google Fonts). One neutral grotesque used for everything is the gallery and agency convention: hierarchy comes from size, weight and tracking, not from a second voice that competes with the images. Archivo's variable build on Google Fonts carries both a weight axis (100-900) and a width axis (62-125), so the same family gives tight, heavy display headlines, Expanded wordmarks and Narrow caption/metadata text (plate numbers, dimensions, EXIF) without loading another family. It is well hinted at small sizes and has none of the Inter/Helvetica-clone sameness.
- **Shape:** sharp corners (0px / 2px / 4px); flat elevation
- **Use:** Primary is ink, so links are underlined and primary-as-text is intentionally indistinguishable from body text. Inactive nav, tabs and breadcrumbs use mutedForeground; the active item uses foreground plus a 2px cobalt (accent) rule or underline. In dark mode primary buttons carry a 1px border in the border token so a light block reads as a control. Cobalt is the only chromatic colour on most pages: selection, focus, one call-to-action marker.
- **Dark mode:** Dark is a warm near-black with surface and muted lifted about 5% each; text is a warm off-white; cobalt and the status colours are lightened to pass as text.
- **Contrast (checked):** body text 16.22:1 light, 15.32:1 dark; lowest text pair 5.11:1 light (mutedForeground on muted), 5.57:1 dark (mutedForeground on muted); lowest UI pair 3.08:1 light, 3.1:1 dark

```css
:root {
  --background: #f9f8f5;
  --foreground: #1c1b18;
  --surface: #fefdfb;
  --muted: #e9e6df;
  --muted-foreground: #625f58;
  --border: #dad7d0;
  --input: #908e88;
  --primary: #141311;
  --primary-foreground: #f9f8f5;
  --accent: #1446a0;
  --accent-foreground: #f9f8f5;
  --ring: #1446a0;
  --danger: #b4281e;
  --danger-foreground: #fdf6f4;
  --success: #3d6b2c;
  --success-foreground: #f4f8ef;
  --warning: #8c5a0c;
  --warning-foreground: #fdf7ec;
  --font-heading: "Archivo", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-body: "Archivo", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 0px;
  --radius-md: 2px;
  --radius-lg: 4px;
  --shadow-card: none;
  --shadow-popover: 0 4px 12px rgba(28, 27, 24, 0.12);
}
.dark {
  --background: #141311;
  --foreground: #ece9e3;
  --surface: #1c1b18;
  --muted: #2a2825;
  --muted-foreground: #a39f96;
  --border: #353330;
  --input: #6a6864;
  --primary: #f0ede7;
  --primary-foreground: #141311;
  --accent: #6190f2;
  --accent-foreground: #141311;
  --ring: #6f9af7;
  --danger: #ee7f6e;
  --danger-foreground: #1d0e0b;
  --success: #8dc283;
  --success-foreground: #121a0c;
  --warning: #e3a84e;
  --warning-foreground: #1e1507;
  --shadow-card: none;
  --shadow-popover: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

## Dusk `dusk`

The last ten minutes of light: a muted plum primary over warm, rose-tinted greys with a single ember of apricot. It signals calm, taste and unhurried focus rather than productivity or urgency.

- **Best for:** Creative tools and design apps; beauty, skincare and lifestyle brands; music, podcast and audio apps; meditation, sleep and mindfulness apps; journaling and writing apps; habit, mood and self-care trackers
- **Avoid for:** Children's products; finance, healthcare and government (use Harbour); data-dense dashboards (use Pewter)
- **Fonts:** Bodoni Moda for headings, Albert Sans for body (Google Fonts). Bodoni Moda brings the high-contrast Didone voice of beauty and fashion to headings; Albert Sans is a soft, low-contrast sans that keeps body text calm beneath it.
- **Shape:** round corners (10px / 14px / 20px); soft elevation
- **Use:** Primary (plum) carries every action: buttons, links, active nav and the focus ring; keep it to one or two instances per view so it stays quiet. Accent (apricot) is for the single warm highlight on a screen: a selected state, a badge, a chart series or a hero detail, never a second button colour. Let background, surface and muted do most of the work at near-zero saturation, so a typical screen is 90 percent warm grey, a few plum touches and one ember of apricot. In light mode accent (apricot) is a fill, badge, chart or large-text colour only, never body-size text.
- **Dark mode:** Background is a plum-black (hue ~320) with surface lifted about 1.7x in luminance and muted lifted again, all on the same mauve hue; primary, accent and status colours were raised to ~L 0.35-0.48 and desaturated so they pass 4.5:1 as text on the dark background, with their foregrounds flipped to deep tinted near-blacks instead of off-white; foreground is a rose-tinted off-white, not #ffffff.
- **Contrast (checked):** body text 14.12:1 light, 15.12:1 dark; lowest text pair 4.73:1 light (accentForeground on accent), 5.41:1 dark (mutedForeground on muted); lowest UI pair 3.05:1 light, 3.12:1 dark. accent is fill-only in light mode (under 4.5:1 as text); danger, success, warning never as text inside a muted fill

```css
:root {
  --background: #f8f4f5;
  --foreground: #2b2229;
  --surface: #fdfafb;
  --muted: #eae1e5;
  --muted-foreground: #6a5a63;
  --border: #d9ccd2;
  --input: #958a90;
  --primary: #7a4a6a;
  --primary-foreground: #fdf7f6;
  --accent: #c4724a;
  --accent-foreground: #2c1710;
  --ring: #8e5a7f;
  --danger: #b23f45;
  --danger-foreground: #fdf7f6;
  --success: #3f7355;
  --success-foreground: #fdf7f6;
  --warning: #93601e;
  --warning-foreground: #fdf7f6;
  --font-heading: "Bodoni Moda", Georgia, "Times New Roman", serif;
  --font-body: "Albert Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --shadow-card: 0 1px 2px rgba(43, 34, 41, 0.05), 0 10px 28px -10px rgba(43, 34, 41, 0.12);
  --shadow-popover: 0 4px 12px rgba(43, 34, 41, 0.12);
}
.dark {
  --background: #1a1418;
  --foreground: #f1e8ec;
  --surface: #241c22;
  --muted: #322730;
  --muted-foreground: #ab9ba3;
  --border: #3d313a;
  --input: #73686f;
  --primary: #cf9bbb;
  --primary-foreground: #2a1a24;
  --accent: #e8ab86;
  --accent-foreground: #2c1a12;
  --ring: #d9a8c8;
  --danger: #e2868a;
  --danger-foreground: #2a1214;
  --success: #8fbf9d;
  --success-foreground: #122018;
  --warning: #e6b84f;
  --warning-foreground: #2a1d0a;
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.45), 0 6px 16px rgba(0, 0, 0, 0.35);
  --shadow-popover: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

## Brass `brass`

Antique, unpolished brass on ivory and charcoal with a bottle-green second colour: money that does not need to shout. Sharp corners, no shadows, generous space.

- **Best for:** Wealth management and private banking; law firms and professional services; luxury hotels and members' clubs; watch, jewellery and fine-goods brands; architecture studios and property developers; premium consultancies
- **Avoid for:** Consumer apps and anything playful (use Citrus); children's and education products; promotion-heavy retail (use Birch)
- **Fonts:** Cormorant Garamond for headings, Jost for body (Google Fonts). A high-contrast old-style serif for headlines reads as engraved stationery, while Jost (a Futura revival) gives body copy and UI the crisp geometric restraint of luxury branding without the generic Inter look. Use Cormorant Garamond at weights 500 to 600 and sizes 28px and up; Jost at 400 and 500 for text and controls.
- **Shape:** sharp corners (0px / 2px / 4px); flat elevation
- **Use:** Keep screens almost entirely ivory, charcoal and hairline borders; brass primary appears only on the single main action, links and the active nav item, and ring is the brighter brass for focus. Bottle green is reserved for selected rows, highlighted badges and chart series so it stays rare and expensive. Cards sit flat on 1px borders with no shadow and square corners; let generous whitespace and the serif headlines do the work rather than colour.
- **Dark mode:** Dark keeps the same warm hue axis: background is a warm near-black charcoal, surface and muted are lifted by roughly 3 and 6 percent lightness rather than swapped, and the foreground is a warm ivory off-white. Primary moves from dark antique gold to a lighter, slightly desaturated brass with charcoal text on it; the bottle-green accent and the status colours are raised to mid-light, lower-chroma tints that pass as text on the dark ground and take dark foregrounds when used as fills.
- **Contrast (checked):** body text 15.24:1 light, 15.03:1 dark; lowest text pair 5.05:1 light (mutedForeground on muted), 5.66:1 dark (mutedForeground on muted); lowest UI pair 3.07:1 light, 3.09:1 dark

```css
:root {
  --background: #f6f1e7;
  --foreground: #1e1b17;
  --surface: #fcfaf5;
  --muted: #ebe3d3;
  --muted-foreground: #675d50;
  --border: #d5cab5;
  --input: #91897b;
  --primary: #7a5c10;
  --primary-foreground: #fbf6ea;
  --accent: #1c4a3a;
  --accent-foreground: #eef3ee;
  --ring: #9c7620;
  --danger: #9c1f38;
  --danger-foreground: #fcf1ee;
  --success: #3d6b2a;
  --success-foreground: #eef5ee;
  --warning: #9a4a0c;
  --warning-foreground: #fff3e6;
  --font-heading: "Cormorant Garamond", Georgia, "Times New Roman", serif;
  --font-body: "Jost", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 0px;
  --radius-md: 2px;
  --radius-lg: 4px;
  --shadow-card: none;
  --shadow-popover: 0 4px 12px rgba(30, 27, 23, 0.12);
}
.dark {
  --background: #141210;
  --foreground: #ede6d6;
  --surface: #1e1a16;
  --muted: #2b2620;
  --muted-foreground: #a89e8c;
  --border: #3a332a;
  --input: #6e675c;
  --primary: #c9a650;
  --primary-foreground: #1a1610;
  --accent: #5aa58c;
  --accent-foreground: #0f1a15;
  --ring: #d9b865;
  --danger: #e8707a;
  --danger-foreground: #2a1210;
  --success: #86bb84;
  --success-foreground: #0f1f14;
  --warning: #f0862e;
  --warning-foreground: #2a1a08;
  --shadow-card: none;
  --shadow-popover: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

