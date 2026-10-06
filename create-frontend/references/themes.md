# Colour themes

Ten named palettes for step 6 of `create-frontend`. Each ships a light and a dark token set, a font pairing, a corner and shadow character, and contrast figures produced by `../scripts/check-contrast.js` (every text pair at least 4.5:1, every UI pair at least 3:1, in both modes). Pick one by project type, name it in the plan and the report, paste its blocks, and build with tokens only.

## Choosing

| Project | Theme |
|---|---|
| Blog, documentation, newsletter, long-form reading | [Paper & Ink](#paper--ink-paper-ink) |
| SaaS dashboard, admin panel, internal tool, data-dense UI | [Slate](#slate-slate) |
| Sustainability, outdoors, food, wellness, non-profit | [Forest](#forest-forest) |
| Restaurant, café, hospitality, crafts, travel, local business | [Terracotta](#terracotta-terracotta) |
| Developer tool, infrastructure, fintech, security (dark-first) | [Midnight](#midnight-midnight) |
| Healthcare, insurance, government, civic, school, consumer banking | [Harbor](#harbor-harbor) |
| Consumer app, students, events, community, playful marketing | [Citrus](#citrus-citrus) |
| Portfolio, photography, architecture, fashion, agency | [Gallery](#gallery-gallery) |
| Creative tool, beauty, lifestyle, music, journaling | [Dusk](#dusk-dusk) |
| Luxury, wealth, law, premium services | [Brass](#brass-brass) |

When the user supplies brand colours, a logo or a design file, do not pick from this table; take the closest theme by temperature and mood as a base, replace `primary` and `ring` with the brand colour (darken it in light mode and lighten it in dark mode until the checker passes), tint the neutrals toward the brand's temperature, and keep the rest. When the project already has tokens or a component library, use those and ignore this file.

## Token semantics

| Token | Used for |
|---|---|
| `background` / `foreground` | Page background and body text |
| `surface` | Cards, panels, inputs, popovers; lifted a step from `background` |
| `muted` / `muted-foreground` | Subdued fills (table headers, secondary buttons, disabled fields) and secondary text, placeholders, captions |
| `border` | Dividers and control outlines |
| `primary` / `primary-foreground` | The one action colour: primary buttons, links, active navigation. `primary` passes as text on `background` |
| `accent` / `accent-foreground` | Selected states, badges, highlights, chart emphasis; a different hue from `primary` |
| `ring` | Focus ring; visible at 3:1 on `background` and `surface` |
| `danger`, `success`, `warning` (+ `-foreground`) | Status only. Each passes as text on `background` and as a fill with its own foreground |

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
}

html { color-scheme: light dark; }
body { background: var(--background); color: var(--foreground); font-family: var(--font-body); }
h1, h2, h3 { font-family: var(--font-heading); }
```

Then `bg-background text-foreground`, `bg-primary text-primary-foreground`, `border-border`, `focus-visible:ring-2 ring-ring`, `rounded-md`, `shadow-card`, `font-heading`.

**Plain CSS or CSS modules**: use the variables directly (`background: var(--surface); border: 1px solid var(--border);`).

**Light and dark**: ship both only when the project or user wants them. Add `.dark` to `<html>` from the stored preference or the system setting before first paint, so there is no flash:

```html
<script>
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || (!stored && matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
</script>
```

The toggle writes `localStorage.theme` and adds or removes the class. Set `<meta name="theme-color">` per scheme to each mode's `background`. For a single-mode project keep one block, delete the other, and drop the `@custom-variant` line.

**Checking changes**: after deriving from a brand or editing any value, write the tokens as `{"light": {...}, "dark": {...}}` (camelCase keys: `mutedForeground`, `primaryForeground`, …) and run `node <skill directory>/scripts/check-contrast.js tokens.json`. Fix every pair reported with `ok: false` before building on the palette.

Each theme below lists its fonts, shape and usage, then one `:root` block (light tokens, fonts, radii, shadow) and one `.dark` block.

## Paper & Ink `paper-ink`

Warm cream stock with ink-dark text, a single vermilion-oxblood for links and actions and a quiet fountain-pen blue for everything secondary. It signals a considered, editorial voice: slow reading, typographic confidence, no neon.

- **Best for:** Blogs and personal essays; documentation and knowledge bases; newsletters and email-style archives; online magazines and journals; long-form reading apps and book-like sites; author and publication landing pages
- **Avoid for:** Data-dense dashboards that need many categorical colours; consumer apps or games that want punchy, saturated UI; fintech or developer tools where a red primary would be mistaken for an error state
- **Fonts:** Fraunces for headings, Source Serif 4 for body (Google Fonts). Fraunces is a soft, old-style display serif with optical sizes, so headlines feel set rather than typed; Source Serif 4 is a well-hinted text serif designed for screen reading at long measures. Two serifs keep the page feeling like print, and neither is Inter.
- **Shape:** sharp corners (2px / 4px / 6px); flat elevation
- **Use:** Use primary only for links, the one primary button per view, and the active nav item; the page should be mostly cream, ink text and hairline borders in the border token (cards are flat, edged, not shadowed). Accent is the quieter ink blue for selected rows, pull-quote rules, tags and chart series, so it never competes with the vermilion. Since primary is already red-orange, keep danger strictly for errors: it is a cooler crimson (350°) against the warmer vermilion (12°), and pairing it with an icon or the word "Error" avoids any ambiguity. Aim for under 10% chromatic colour on any screen.
- **Dark mode:** The neutrals keep the same warm brown-orange cast but run from a near-black ink background (#1a1612) up through surface and muted in roughly 3-5% lightness steps, with an aged-paper off-white for text instead of pure white. Primary, accent and the status colours keep their hues (vermilion 12°, ink blue ~207°, crimson 350°, moss, amber) but are lifted to mid-light tints with lower saturation so each passes 4.5:1 as text on the dark background, and their foregrounds flip to tinted near-blacks.
- **Contrast (checked):** body text 15.09:1 light, 14.25:1 dark; lowest text pair 5.06:1 light (mutedForeground on muted), 5.52:1 dark (mutedForeground on muted); lowest UI pair 4.45:1 light, 6.86:1 dark

```css
:root {
  --background: #f8f4ec;
  --foreground: #221e1a;
  --surface: #fdfaf4;
  --muted: #ebe5da;
  --muted-foreground: #675e55;
  --border: #dcd3c5;
  --primary: #a2381d;
  --primary-foreground: #fdf6ee;
  --accent: #3d5a73;
  --accent-foreground: #f4f8fb;
  --ring: #c8432f;
  --danger: #b4223b;
  --danger-foreground: #fdf2f4;
  --success: #466a2e;
  --success-foreground: #f3f8ee;
  --warning: #8a5a0b;
  --warning-foreground: #fdf6e8;
  --font-heading: "Fraunces", Georgia, "Times New Roman", serif;
  --font-body: "Source Serif 4", Georgia, "Times New Roman", serif;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  --shadow-card: none;
}
.dark {
  --background: #1a1612;
  --foreground: #ece4d6;
  --surface: #221d18;
  --muted: #2e2822;
  --muted-foreground: #a89e90;
  --border: #3a332b;
  --primary: #e07a60;
  --primary-foreground: #1f1410;
  --accent: #8fb0c9;
  --accent-foreground: #14181c;
  --ring: #ee8c70;
  --danger: #e8798c;
  --danger-foreground: #1f1114;
  --success: #9dbf7e;
  --success-foreground: #141a0f;
  --warning: #e0a94a;
  --warning-foreground: #1f1608;
}
```

## Slate `slate`

Cool, quiet and engineered: blue-grey neutrals stay out of the way so tables and charts carry the colour, while a petrol teal action colour and a plum highlight signal precision rather than marketing gloss.

- **Best for:** B2B SaaS dashboards; admin panels and back-office tools; internal tools and ops consoles; data-dense tables and reporting UIs; analytics and monitoring views; developer and infrastructure consoles
- **Avoid for:** Consumer marketing or landing pages that need warmth and punch; lifestyle, food or wellness brands; playful or kid-oriented products
- **Fonts:** Manrope for headings, IBM Plex Sans for body (Google Fonts). Manrope gives headings and KPI numbers a crisp geometric voice without feeling like a startup template; IBM Plex Sans is compact, superbly hinted at 12-14px and has true tabular figures (font-variant-numeric: tabular-nums), which keeps dense tables and many small controls legible.
- **Shape:** sharp corners (2px / 4px / 6px); flat elevation
- **Use:** Keep screens about 90% neutral: background for the page, surface for cards, tables and inputs, muted for table header rows, badges and secondary buttons. Primary is the single action colour (primary buttons, links, active nav, the main chart series); accent is reserved for selected rows, highlight badges and the one chart series you want the eye to land on. Status colours appear only as inline text or small filled pills so the rose, emerald and ochre stay meaningful in dense data.
- **Dark mode:** Neutrals keep the same ~208° cool hue but are rebuilt from the bottom up: background is the darkest step (#10161c), surface is lifted ~3% (#171f26), muted another ~4% (#222c35), with an off-white #e3e9ee foreground. Primary, accent and status hues are preserved but moved to roughly 55-65% lightness with slightly lower saturation so they pass 4.5:1 as text on the dark page, and their foregrounds flip to deep tints of the same hue.
- **Contrast (checked):** body text 14.21:1 light, 14.87:1 dark; lowest text pair 5.12:1 light (mutedForeground on muted), 5.59:1 dark (danger on surface); lowest UI pair 3.59:1 light, 6.24:1 dark

```css
:root {
  --background: #f1f4f7;
  --foreground: #1a2430;
  --surface: #fafbfc;
  --muted: #e2e7ec;
  --muted-foreground: #52616e;
  --border: #c9d2da;
  --primary: #0f6a78;
  --primary-foreground: #eefafb;
  --accent: #9a4a86;
  --accent-foreground: #fdf2fa;
  --ring: #1a8d97;
  --danger: #b52f45;
  --danger-foreground: #fff3f4;
  --success: #1c7049;
  --success-foreground: #ecfaf1;
  --warning: #8f5a12;
  --warning-foreground: #fff7e8;
  --font-heading: "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-body: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  --shadow-card: none — cards and panels use 1px solid var(--border) on var(--surface); reserve 0 4px 12px rgba(16, 22, 28, 0.12) for popovers and menus only;
}
.dark {
  --background: #10161c;
  --foreground: #e3e9ee;
  --surface: #171f26;
  --muted: #222c35;
  --muted-foreground: #97a6b3;
  --border: #2c3843;
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
}
```

## Forest `forest`

Grounded and quietly confident, like a farm-shop label or a trail map: cream paper, deep conifer green and a warm ochre stamp. It signals care, provenance and patience rather than speed or hype.

- **Best for:** Sustainability and climate organisations; farms, agriculture and food producers; wellness, nutrition and outdoor brands; non-profits and community initiatives; garden, landscaping and nursery businesses; eco-commerce and ethical product storefronts
- **Avoid for:** Fintech or crypto dashboards that need a cool, high-tech edge; gaming, nightlife or anything that wants neon energy; developer tools and SaaS that lean on a monochrome, data-dense look
- **Fonts:** Fraunces for headings, Nunito Sans for body (Google Fonts). Fraunces is a soft, slightly wonky old-style serif with optical sizes, which gives headings an artisanal, printed-label warmth without looking antique. Nunito Sans is rounded, friendly and extremely legible at body sizes, matching the wellness and community tone while staying far from the Inter default.
- **Shape:** soft corners (6px / 10px / 16px); soft elevation
- **Use:** Use primary (deep green) for the single call to action, links and active navigation, and let most of the screen be cream background with surface cards edged by border rather than heavy shadows. Reserve the ochre accent for small moments: selected tabs, badges, chart series and highlighted stats, no more than one or two per view. Keep colour density low overall so the palette feels like paper and plant rather than a UI kit; status colours only appear on inline messages, toasts and form validation.
- **Dark mode:** Dark keeps the same green-tinted neutrals: background is the darkest conifer-black, surface is lifted a few percent, muted lifted again, and foreground is the light cream rather than white. Primary, accent and status colours were raised in lightness and slightly desaturated (sage green, straw ochre, salmon-brick, straw amber) so they pass as text on the dark base, with their foregrounds flipped to near-black tints of the same hue.
- **Contrast (checked):** body text 13.82:1 light, 13.98:1 dark; lowest text pair 4.9:1 light (accentForeground on accent), 6.12:1 dark (mutedForeground on muted); lowest UI pair 3.21:1 light, 8.22:1 dark

```css
:root {
  --background: #f5f1e6;
  --foreground: #1c261f;
  --surface: #fbf9f3;
  --muted: #e8e2d1;
  --muted-foreground: #55604f;
  --border: #d4ccb6;
  --primary: #2e5c3b;
  --primary-foreground: #f5f1e6;
  --accent: #b07d22;
  --accent-foreground: #1f1706;
  --ring: #3f7a50;
  --danger: #a63d2d;
  --danger-foreground: #fbf4ee;
  --success: #35712f;
  --success-foreground: #f3f8ee;
  --warning: #8a5d10;
  --warning-foreground: #fbf5e8;
  --font-heading: "Fraunces", Georgia, "Times New Roman", serif;
  --font-body: "Nunito Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-card: 0 1px 2px rgba(28, 38, 31, 0.06), 0 6px 16px rgba(28, 38, 31, 0.08);
}
.dark {
  --background: #111a14;
  --foreground: #e9e4d5;
  --surface: #192319;
  --muted: #243126;
  --muted-foreground: #a7b19f;
  --border: #34433a;
  --primary: #86bd8f;
  --primary-foreground: #0f1b13;
  --accent: #d8a94f;
  --accent-foreground: #1f1706;
  --ring: #9bd1a5;
  --danger: #e8846f;
  --danger-foreground: #2b100b;
  --success: #96cc7c;
  --success-foreground: #112009;
  --warning: #e2b15a;
  --warning-foreground: #261b06;
}
```

## Terracotta `terracotta`

Sun-warmed clay on sand with a glazed-teal counterpoint: unhurried, handmade and hospitable. It signals a real place run by real people rather than a SaaS product.

- **Best for:** Restaurants, cafés and bakeries; boutique hotels, B&Bs and travel guides; craft, pottery and artisan shops; local service businesses and studios; independent boutiques and small e-commerce; farmers markets, wineries and food producers
- **Avoid for:** Fintech, banking or anything needing a cool, clinical authority; developer tools, dashboards and data-dense admin UIs; healthcare or legal products where warmth reads as informal
- **Fonts:** Fraunces for headings, Nunito Sans for body (Google Fonts). Fraunces is a soft, slightly wonky display serif that feels hand-set and pairs naturally with clay and sand; Nunito Sans has gently rounded terminals that keep menus, listings and forms friendly and legible without the generic Inter look. Both are variable, well-hinted and widely cached.
- **Shape:** soft corners (6px / 10px / 16px); soft elevation
- **Use:** Let the sand background and parchment surfaces do most of the work; use the clay primary only for the main CTA, links and the active nav item, so it stays tactile rather than loud. The teal accent is for selected states, tags, chart series and small highlights, not for buttons, so that primary and accent never compete. Keep status colours to inline text and small badges; on a typical screen aim for roughly 80% neutrals, 10-15% primary, 5% accent.
- **Dark mode:** Background is a warm near-black brown (hue 20°), with surface and muted lifted roughly 3% and 7% in lightness rather than swapped; foreground is a parchment off-white. Primary, accent and status colours were raised to the L60-70 band and desaturated so they pass as text on the dark ground, and their foregrounds flipped to deep warm browns/greens for fills.
- **Contrast (checked):** body text 13.41:1 light, 14.75:1 dark; lowest text pair 4.83:1 light (warning on background), 5.11:1 dark (mutedForeground on muted); lowest UI pair 3.82:1 light, 6.38:1 dark

```css
:root {
  --background: #f4ecdf;
  --foreground: #2b211a;
  --surface: #fbf6ee;
  --muted: #e9dece;
  --muted-foreground: #6b5a4c;
  --border: #d8c9b4;
  --primary: #a8432a;
  --primary-foreground: #fdf6ee;
  --accent: #2d6e6a;
  --accent-foreground: #f1f8f6;
  --ring: #c4552f;
  --danger: #b4243a;
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
}
.dark {
  --background: #1c1613;
  --foreground: #f1e8db;
  --surface: #262019;
  --muted: #332b23;
  --muted-foreground: #a89b8b;
  --border: #3f352c;
  --primary: #e07b55;
  --primary-foreground: #2b1711;
  --accent: #6fb3ad;
  --accent-foreground: #0f2a28;
  --ring: #ea8a64;
  --danger: #f07c84;
  --danger-foreground: #2e0f0e;
  --success: #79b07e;
  --success-foreground: #0f2612;
  --warning: #e0a94a;
  --warning-foreground: #2a1b05;
}
```

## Midnight `midnight`

Ink-blue dark mode with an electric cyan primary and a lime accent that glow like an aurora over a deep night sky; light mode keeps the same cool ink and reads as crisp, technical and serious. It signals precision, uptime and competence rather than playfulness.

- **Best for:** Developer tools and CLIs with a web console; infrastructure, observability and analytics dashboards; fintech and trading interfaces; security and compliance products; aPI documentation and status pages; terminal-adjacent SaaS (deploys, logs, pipelines)
- **Avoid for:** Consumer lifestyle, wellness or food brands that need warmth; editorial, long-form reading sites where a cool dark UI tires the eye; children's or education products that want friendly, soft colour
- **Fonts:** Space Grotesk for headings, IBM Plex Sans for body (Google Fonts). Space Grotesk gives headings a geometric, slightly engineered voice that suits infrastructure and dev-tool products without the generic Inter look; IBM Plex Sans is an exceptionally well-hinted humanist grotesque for dense UI text and has a sibling mono (IBM Plex Mono) if code samples are needed, so the whole product stays in one typographic family.
- **Shape:** soft corners (4px / 6px / 10px); flat elevation
- **Use:** Keep screens mostly ink and off-white: primary cyan is reserved for the single main action per view, links and the active nav item, and the focus ring is its brighter sibling. Lime accent is the second voice only — selected rows, live/connected badges, sparkline or chart series two, and the occasional highlight — so it reads as a signal, never a second button colour. In dark mode let surfaces and 1px borders do the layering (shadows vanish on ink), and lean on muted fills for table headers, disabled fields and secondary buttons; in light mode cards are the near-white surface on the cool grey background with the same border rule, and status colours appear mainly as text and thin badges rather than large fills.
- **Dark mode:** Dark is built as its own OKLCH ladder, not an inversion: background sits at L 0.17 on a constant ink-blue hue (262), with surface, muted and border lifted to L 0.22, 0.28 and 0.34 at the same hue so panels read as raised rather than swapped. Foreground is a cool off-white (#e5ecf1), and primary, accent and the three status colours move up to L 0.74–0.88 with chroma pulled back slightly so they stay inside sRGB and pass as text on the dark background, while each of their foregrounds flips to a deep ink tinted with the same hue.
- **Contrast (checked):** body text 16.53:1 light, 16.05:1 dark; lowest text pair 4.97:1 light (accentForeground on accent), 5.93:1 dark (mutedForeground on muted); lowest UI pair 3.43:1 light, 11.77:1 dark

```css
:root {
  --background: #f4f7fb;
  --foreground: #111826;
  --surface: #fbfdfe;
  --muted: #e3e8f0;
  --muted-foreground: #535e6f;
  --border: #cad2dc;
  --primary: #007287;
  --primary-foreground: #f0fbfc;
  --accent: #577600;
  --accent-foreground: #f7faef;
  --ring: #0092aa;
  --danger: #be2132;
  --danger-foreground: #fff6f5;
  --success: #007840;
  --success-foreground: #f2fbf5;
  --warning: #975800;
  --warning-foreground: #fef8ed;
  --font-heading: "Space Grotesk", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-body: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --shadow-card: none;
}
.dark {
  --background: #080f1d;
  --foreground: #e5ecf1;
  --surface: #121b2a;
  --muted: #212938;
  --muted-foreground: #97a7b7;
  --border: #2f3848;
  --primary: #36dcec;
  --primary-foreground: #01151b;
  --accent: #bbec4c;
  --accent-foreground: #121904;
  --ring: #4ae9f9;
  --danger: #fd7e82;
  --danger-foreground: #230708;
  --success: #56db8f;
  --success-foreground: #021709;
  --warning: #fab549;
  --warning-foreground: #231200;
}
```

## Harbor `harbor`

Calm, institutional and deliberately unflashy: a steel sea-blue on cool near-white reads as a public service that has nothing to hide, with a sea-teal accent that adds life without noise. It signals competence, safety and legibility first.

- **Best for:** Healthcare patient portals and clinic sites; insurance quote and claims flows; government and civic service portals; education and school administration platforms; consumer banking and credit-union dashboards; utility and public-transport account pages
- **Avoid for:** Consumer lifestyle, fashion or entertainment brands that need energy; developer tools or crypto products that want an edgy, dark-first look; marketing landing pages chasing a bold, trend-driven identity
- **Fonts:** Source Serif 4 for headings, Source Sans 3 for body (Google Fonts). A quiet transitional serif for headings gives civic and financial pages institutional gravitas, while Source Sans 3 is a well-hinted, highly legible humanist sans built for long forms and dense tables; both are mature Adobe families with wide weight ranges and no generic-AI association.
- **Shape:** soft corners (4px / 6px / 10px); soft elevation
- **Use:** Primary carries every action: buttons, links, active nav and the focus ring; it also passes as body-size text so inline links need no underline-only fallback. Use accent sparingly for selected rows, chips, progress and the second chart series, never for calls to action. Keep most of a screen in background, surface and muted with border-defined cards, so that status colours and the two brand hues stay rare enough to mean something.
- **Dark mode:** Dark keeps the same ~205° hue family but steps lightness instead of inverting: background is a deep harbor navy, surface is lifted a few percent, muted lifted again, and border lighter still, with text an off-white cool grey. Primary, accent and status colours are raised in lightness and slightly desaturated so each passes as text on the dark background, and their foregrounds flip to deep tints of the same hue.
- **Contrast (checked):** body text 14.7:1 light, 14.88:1 dark; lowest text pair 4.93:1 light (accentForeground on accent), 5.83:1 dark (mutedForeground on muted); lowest UI pair 4.05:1 light, 7.75:1 dark

```css
:root {
  --background: #f4f8fb;
  --foreground: #15252f;
  --surface: #fbfdfe;
  --muted: #e3ecf2;
  --muted-foreground: #4d6273;
  --border: #c6d4de;
  --primary: #1b6594;
  --primary-foreground: #f4f9fc;
  --accent: #0f7a6c;
  --accent-foreground: #f2faf8;
  --ring: #2a80b6;
  --danger: #b42d3a;
  --danger-foreground: #fdf4f4;
  --success: #1d6f47;
  --success-foreground: #f1faf5;
  --warning: #8a5a0e;
  --warning-foreground: #fdf7ec;
  --font-heading: "Source Serif 4", Georgia, "Times New Roman", serif;
  --font-body: "Source Sans 3", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --shadow-card: 0 1px 2px rgba(13, 26, 36, 0.06), 0 2px 8px rgba(13, 26, 36, 0.06);
}
.dark {
  --background: #0d1a24;
  --foreground: #e4edf3;
  --surface: #15252f;
  --muted: #1f333f;
  --muted-foreground: #9bb0bf;
  --border: #2f4656;
  --primary: #63b2e0;
  --primary-foreground: #0b1b27;
  --accent: #4fc3ae;
  --accent-foreground: #06201a;
  --ring: #74bfe8;
  --danger: #f08c92;
  --danger-foreground: #2a0b0e;
  --success: #5fcf96;
  --success-foreground: #06271a;
  --warning: #e8b45c;
  --warning-foreground: #2b1d05;
}
```

## Citrus `citrus`

Sun-warmed and upbeat: a burnt-tangerine primary over cream paper with aubergine ink, cut by a jade-mint accent. It signals friendliness, energy and approachability without reading as childish or as another indigo SaaS template.

- **Best for:** Consumer and lifestyle apps; student, classroom and e-learning products; event, ticketing and festival sites; community and membership platforms; playful marketing and campaign sites; food, drink and recipe apps
- **Avoid for:** Banking, legal and compliance dashboards; developer tools and data-dense admin consoles; healthcare or crisis-support services
- **Fonts:** Outfit for headings, Nunito for body (Google Fonts). Outfit's geometric, slightly wide letterforms give headlines a poster-like energy, while Nunito's rounded terminals keep body copy soft, legible and friendly at small sizes; both are well-hinted, widely cached and clearly not the default Inter look.
- **Shape:** round corners (8px / 12px / 20px); soft elevation
- **Use:** Keep the page mostly cream and aubergine; reserve the tangerine primary for the single main action, links and active navigation, and let the brighter ring colour carry focus states. Use the jade-mint accent sparingly for selected rows, badges, progress and the second chart series so it stays a highlight rather than a competing brand colour. Lean on the marigold-tinted muted fill and tan border for structure instead of grey, and aim for roughly one accent element per screen section.
- **Dark mode:** The aubergine ink becomes the neutral base: background is a plum-black (L≈0.7%), surface and muted step up a few percent in lightness on the same hue, and the cream page colour becomes the off-white foreground. Primary, accent and status colours keep their hues but rise in lightness and drop in saturation (tangerine #b35400 → #f0954f, jade #0f7f66 → #5fd4ad), so each passes as text on the dark background while their foregrounds flip to deep tints of the same hue.
- **Contrast (checked):** body text 13.62:1 light, 15.68:1 dark; lowest text pair 4.75:1 light (primary on background), 6.08:1 dark (danger on surface); lowest UI pair 3.19:1 light, 8.47:1 dark

```css
:root {
  --background: #fff8ec;
  --foreground: #3b1f42;
  --surface: #fffcf5;
  --muted: #f7e8cc;
  --muted-foreground: #6e5473;
  --border: #e8d5b4;
  --primary: #b35400;
  --primary-foreground: #fffaf0;
  --accent: #0f7f66;
  --accent-foreground: #f0fff8;
  --ring: #e06a10;
  --danger: #c23a1f;
  --danger-foreground: #fff5f0;
  --success: #3e7a1e;
  --success-foreground: #f3fbe9;
  --warning: #855f00;
  --warning-foreground: #fff8e1;
  --font-heading: "Outfit", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-body: "Nunito", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --shadow-card: 0 1px 2px rgba(59, 31, 66, 0.06), 0 4px 14px rgba(179, 84, 0, 0.10);
}
.dark {
  --background: #1a1120;
  --foreground: #f6ecdc;
  --surface: #251a2b;
  --muted: #332539;
  --muted-foreground: #b9a6bf;
  --border: #3f3046;
  --primary: #f0954f;
  --primary-foreground: #2a1430;
  --accent: #5fd4ad;
  --accent-foreground: #102a22;
  --ring: #f6a85e;
  --danger: #f07a63;
  --danger-foreground: #2d0f0c;
  --success: #8fd06a;
  --success-foreground: #15260c;
  --warning: #f5cc4f;
  --warning-foreground: #2e2000;
}
```

## Gallery `gallery`

Warm paper, ink type and a single cobalt signal: the hush of a white-cube gallery where the work and the typography carry the page, and colour appears only when something is selected, focused or needs attention. It signals restraint, confidence and curation rather than product-marketing energy.

- **Best for:** Portfolios and personal sites; photography and lookbooks; architecture and interior studios; fashion and editorial brands; creative agencies and design studios; museums, galleries and exhibition microsites
- **Avoid for:** Data-dense SaaS dashboards that need several colour-coded states at once; consumer or playful apps that want warmth and personality from colour; promotion-heavy e-commerce with sale badges, countdowns and multiple CTAs per screen
- **Fonts:** Archivo for headings, Archivo for body (Google Fonts). One neutral grotesque used for everything is the gallery and agency convention: hierarchy comes from size, weight and tracking, not from a second voice that competes with the images. Archivo's variable build on Google Fonts carries both a weight axis (100-900) and a width axis (62-125), so the same family gives tight, heavy display headlines, Expanded wordmarks and Narrow caption/metadata text (plate numbers, dimensions, EXIF) without loading another family. It is well hinted at small sizes and has none of the Inter/Helvetica-clone sameness.
- **Shape:** sharp corners (0px / 2px / 4px); flat elevation
- **Use:** Treat the page as monochrome: ink primary for buttons, underlined links and active nav, warm paper and hairline borders for everything else, and generous whitespace instead of cards wherever possible. Cobalt accent is the single signal and should appear on at most one or two things per screen (a selected filter, the current item in a list, one highlighted chart series, the focus ring); if it is on every screen element it stops being a signal. Status colours are reserved for inline validation, toasts and small badges and should not be used decoratively.
- **Dark mode:** The warm temperature is kept and the lightness ladder is rebuilt rather than flipped: background is the darkest warm near-black (#141311), surface is lifted about 3% (#1c1b18), muted about 8% more (#2a2825), with a hairline border at 1.47:1. Ink primary becomes a paper off-white button (#f0ede7 on #141311 text), cobalt is raised roughly 25 L points and desaturated (#5b8af0, with a brighter #6f9af7 ring), and the three status colours move to lighter, chalkier tints that still pass 4.5:1 as text on the dark page and carry near-black foregrounds as fills; body text is a warm off-white (#ece9e3), never #ffffff.
- **Contrast (checked):** body text 16.22:1 light, 15.32:1 dark; lowest text pair 5.39:1 light (mutedForeground on muted), 5.57:1 dark (mutedForeground on muted); lowest UI pair 7.02:1 light, 5.6:1 dark

```css
:root {
  --background: #f9f8f5;
  --foreground: #1c1b18;
  --surface: #fefdfb;
  --muted: #eeece7;
  --muted-foreground: #625f58;
  --border: #dad7d0;
  --primary: #141311;
  --primary-foreground: #f9f8f5;
  --accent: #0b4bc4;
  --accent-foreground: #f9f8f5;
  --ring: #0b4bc4;
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
}
.dark {
  --background: #141311;
  --foreground: #ece9e3;
  --surface: #1c1b18;
  --muted: #2a2825;
  --muted-foreground: #a39f96;
  --border: #353330;
  --primary: #f0ede7;
  --primary-foreground: #141311;
  --accent: #5b8af0;
  --accent-foreground: #141311;
  --ring: #6f9af7;
  --danger: #ee7f6e;
  --danger-foreground: #1d0e0b;
  --success: #9bc07a;
  --success-foreground: #121a0c;
  --warning: #e3a84e;
  --warning-foreground: #1e1507;
}
```

## Dusk `dusk`

The last ten minutes of light: a muted plum primary over warm, rose-tinted greys with a single ember of apricot. It signals calm, taste and unhurried focus rather than productivity or urgency.

- **Best for:** Creative tools and design editors; beauty, skincare and lifestyle brands; music players and audio apps; meditation and wellness apps; journaling and note-taking apps; portfolio and editorial sites
- **Avoid for:** Developer tools, terminals and ops dashboards; fintech, banking and data-dense admin panels; children's apps or anything needing high-energy saturated colour
- **Fonts:** Fraunces for headings, Nunito Sans for body (Google Fonts). Fraunces is a soft, slightly wonky serif with optical sizing that reads editorial and atmospheric at display sizes; Nunito Sans is a rounded, low-contrast sans that stays warm and legible for body copy and UI without the generic Inter look.
- **Shape:** soft corners (6px / 10px / 16px); soft elevation
- **Use:** Primary (plum) carries every action: buttons, links, active nav and the focus ring; keep it to one or two instances per view so it stays quiet. Accent (apricot) is for the single warm highlight on a screen: a selected state, a badge, a chart series or a hero detail, never a second button colour. Let background, surface and muted do most of the work at near-zero saturation, so a typical screen is 90 percent warm grey, a few plum touches and one ember of apricot.
- **Dark mode:** Background is a plum-black (hue ~320) with surface lifted about 1.7x in luminance and muted lifted again, all on the same mauve hue; primary, accent and status colours were raised to ~L 0.35-0.48 and desaturated so they pass 4.5:1 as text on the dark background, with their foregrounds flipped to deep tinted near-blacks instead of off-white; foreground is a rose-tinted off-white, not #ffffff.
- **Contrast (checked):** body text 14.12:1 light, 15.12:1 dark; lowest text pair 4.88:1 light (mutedForeground on muted), 5.41:1 dark (mutedForeground on muted); lowest UI pair 3.12:1 light, 8.21:1 dark

```css
:root {
  --background: #f8f4f5;
  --foreground: #2b2229;
  --surface: #fdfafb;
  --muted: #eee6e9;
  --muted-foreground: #6f5f68;
  --border: #e2d7dc;
  --primary: #7a4a6a;
  --primary-foreground: #fdf7f6;
  --accent: #c9764c;
  --accent-foreground: #2c1710;
  --ring: #8e5a7f;
  --danger: #b23f45;
  --danger-foreground: #fdf7f6;
  --success: #3f7355;
  --success-foreground: #fdf7f6;
  --warning: #93601e;
  --warning-foreground: #fdf7f6;
  --font-heading: "Fraunces", Georgia, "Times New Roman", serif;
  --font-body: "Nunito Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-card: 0 1px 2px rgba(43, 34, 41, 0.05), 0 10px 28px -10px rgba(43, 34, 41, 0.12);
}
.dark {
  --background: #1a1418;
  --foreground: #f1e8ec;
  --surface: #241c22;
  --muted: #322730;
  --muted-foreground: #ab9ba3;
  --border: #3d313a;
  --primary: #cf9bbb;
  --primary-foreground: #2a1a24;
  --accent: #e8ab86;
  --accent-foreground: #2c1a12;
  --ring: #d9a8c8;
  --danger: #e2868a;
  --danger-foreground: #2a1214;
  --success: #8fbf9d;
  --success-foreground: #122018;
  --warning: #e0b06c;
  --warning-foreground: #2a1d0a;
}
```

## Brass `brass`

Antique gold on ivory and charcoal, with a bottle-green accent: the palette of a private bank ledger or a watchmaker's showroom. It signals discretion, permanence and money that does not need to shout.

- **Best for:** Wealth management and private banking; law firms and professional advisory; luxury hotels and members' clubs; watch, jewellery and fine-goods brands; premium concierge and bespoke services; investor and annual-report microsites
- **Avoid for:** Consumer apps for a young or playful audience; developer tools and data-dense dashboards; health, wellness or childcare products that need a soft, friendly feel
- **Fonts:** Cormorant Garamond for headings, Jost for body (Google Fonts). A high-contrast old-style serif for headlines reads as engraved stationery, while Jost (a Futura revival) gives body copy and UI the crisp geometric restraint of luxury branding without the generic Inter look. Use Cormorant Garamond at weights 500 to 600 and sizes 28px and up; Jost at 400 and 500 for text and controls.
- **Shape:** sharp corners (0px / 2px / 4px); flat elevation
- **Use:** Keep screens almost entirely ivory, charcoal and hairline borders; brass primary appears only on the single main action, links and the active nav item, and ring is the brighter brass for focus. Bottle green is reserved for selected rows, highlighted badges and chart series so it stays rare and expensive. Cards sit flat on 1px borders with no shadow and square corners; let generous whitespace and the serif headlines do the work rather than colour.
- **Dark mode:** Dark keeps the same warm hue axis: background is a warm near-black charcoal, surface and muted are lifted by roughly 3 and 6 percent lightness rather than swapped, and the foreground is a warm ivory off-white. Primary moves from dark antique gold to a lighter, slightly desaturated brass with charcoal text on it; the bottle-green accent and the status colours are raised to mid-light, lower-chroma tints that pass as text on the dark ground and take dark foregrounds when used as fills.
- **Contrast (checked):** body text 15.24:1 light, 15.03:1 dark; lowest text pair 5.05:1 light (mutedForeground on muted), 5.66:1 dark (mutedForeground on muted); lowest UI pair 3.71:1 light, 6.4:1 dark

```css
:root {
  --background: #f6f1e7;
  --foreground: #1e1b17;
  --surface: #fcfaf5;
  --muted: #ebe3d3;
  --muted-foreground: #675d50;
  --border: #d5cab5;
  --primary: #7a5c10;
  --primary-foreground: #fbf6ea;
  --accent: #1c4a3a;
  --accent-foreground: #eef3ee;
  --ring: #9c7620;
  --danger: #9e2a22;
  --danger-foreground: #fcf1ee;
  --success: #2e6b3a;
  --success-foreground: #eef5ee;
  --warning: #a84b0a;
  --warning-foreground: #fff3e6;
  --font-heading: "Cormorant Garamond", Georgia, "Times New Roman", serif;
  --font-body: "Jost", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-sm: 0px;
  --radius-md: 2px;
  --radius-lg: 4px;
  --shadow-card: none;
}
.dark {
  --background: #141210;
  --foreground: #ede6d6;
  --surface: #1e1a16;
  --muted: #2b2620;
  --muted-foreground: #a89e8c;
  --border: #3a332a;
  --primary: #c9a650;
  --primary-foreground: #1a1610;
  --accent: #5aa58c;
  --accent-foreground: #0f1a15;
  --ring: #d9b865;
  --danger: #e07a6c;
  --danger-foreground: #2a1210;
  --success: #86bb84;
  --success-foreground: #0f1f14;
  --warning: #e0a052;
  --warning-foreground: #2a1a08;
}
```

