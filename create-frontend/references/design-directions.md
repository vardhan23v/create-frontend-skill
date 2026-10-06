# Design directions

A theme is a palette, not a design. Two cafés that both get Terracotta with the same hero, the same card grid and the same type would look like one template in two colours. Before the first screen, compose a **design direction** from the axes below, make three candidates that genuinely differ, pick one, write it to `docs/design.md`, and never repeat a direction that already exists in the workspace.

`scripts/design-direction.js` does the composition mechanically: it hashes the project name so every project starts from a different point, enforces that candidates differ on at least four axes, and avoids any `design.md` it is pointed at. Use it; then edit the result with judgement.

```bash
node <skill directory>/scripts/design-direction.js --type cafe --name "Kiln & Bean" --avoid docs/design.md ../other-site/docs/design.md
```

## Axes

Every axis has a reason column. A choice without a reason tied to the content is decoration; pick again.

### 1. Theme and alternates

| Project type | Primary theme | Alternates (use when the primary was used recently or the brief leans that way) |
|---|---|---|
| landing, saas-marketing, startup | Birch | Pewter (B2B, technical), Citrus (consumer, playful), Midnight (developer product) |
| ecommerce | Birch | Terracotta (artisan), Forest (eco), Brass (luxury), Citrus (youth) |
| blog, docs, newsletter | Paper & Ink | Gallery (visual essays), Forest (nature writing), Pewter (technical handbook) |
| dashboard, admin, internal | Pewter | Midnight (dark-first), Harbour (regulated), Birch (light SaaS) |
| farming, outdoors, climate, nonprofit | Forest | Terracotta (market, community), Paper & Ink (campaign writing), Harbour (institutional) |
| cafe, restaurant, hotel, local | Terracotta | Forest (farm-to-table), Brass (fine dining), Gallery (minimal bistro), Citrus (juice bar, brunch) |
| devtool, infra, security, trading | Midnight | Pewter (light console), Gallery (monochrome docs), Birch (developer marketing) |
| healthcare, civic, school, fintech | Harbour | Pewter (admin), Citrus (student-facing), Paper & Ink (patient information) |
| consumer-app, events, community | Citrus | Dusk (calm), Birch (neutral), Terracotta (local) |
| portfolio, agency, fashion, museum | Gallery | Brass (luxury), Dusk (beauty), Paper & Ink (writer) |
| creative-tool, beauty, music, wellness | Dusk | Gallery (studio), Citrus (upbeat), Midnight (pro audio) |
| luxury, wealth, law | Brass | Gallery (architectural), Harbour (private bank), Paper & Ink (chambers) |

**Remix rules** (any theme): swap the font pairing for another theme's pairing when the type voice (axis 7) calls for it; shift `primary` and `ring` up to 20° in OKLCH hue or 10% in lightness and re-run `check-contrast.js`; change the radius character one step (sharp ↔ soft ↔ round) and the shadow character (flat ↔ soft) to match axis 5 and 6. Never swap the neutrals of one theme with the chroma of another: that is how palettes go muddy.

### 2. Hero archetype

| Archetype | Shape | Suits | Avoid for |
|---|---|---|---|
| `split` | headline and actions left, visual (photo, product, screenshot) right; stacks on mobile | products, apps, places with a strong image | type-only brands, no imagery available |
| `statement` | centered headline over a quiet canvas, one action, visual below | launches, campaigns, portfolios | dense information |
| `editorial` | left-aligned, large display type, eyebrow, lede, no visual; a rule or a fact list under it | writing, cafés, studios, services | products that must be seen |
| `band` | full-bleed block in `primary` or `muted` with contrasting type, content breaks out below | civic, events, bold brands | luxury, editorial |
| `showcase` | one large image or product render with the headline overlaid or beside, surface card for actions | fashion, hotels, hardware | text-heavy briefs |
| `utility` | no hero: toolbar, page title, KPIs or filters first | dashboards, admin, tools | marketing |

### 3. Navigation

`inline` (logo left, links right) · `inline-cta` (links plus one primary button) · `centered` (logo centered, links split either side; editorial and luxury) · `sidebar` (apps and docs) · `minimal` (logo and one menu button at every width; portfolios).

### 4. Section rhythm

`bands` (alternating `background` and `muted` sections, generous padding) · `rules` (continuous canvas, 1px `border` dividers, tighter) · `canvas-cards` (sections are `surface` cards on the page `background`) · `columns` (persistent two-column: sticky aside plus content; docs, long pages).

### 5. Card and surface character

`edged` (flat, 1px `border`, no shadow) · `elevated` (`shadow-card`, no border) · `tinted` (no border, `muted` fill) · `bare` (no cards at all: lists with rules; editorial, luxury).

### 6. Button and control shape

`sharp` (0–2px) · `soft` (6–10px) · `pill` (999px) · `underline` (text actions with a rule; editorial). Inputs follow the same radius one step smaller.

### 7. Type voice

`serif-display` (serif headings, sans body: warm, considered) · `all-sans` (one or two sans: clean, product) · `sans-display-serif-body` (modern headings over readable serif text: magazines) · `mono-accent` (sans body with a monospace eyebrow and numbers: technical) · `all-serif` (two serifs: literary). Pair with a scale: `tight` (1.2 ratio, dense), `regular` (1.25), `display` (1.333, big hero, small body).

### 8. Imagery treatment

`photo-soft` (photos in `radius-lg` masks) · `photo-sharp` (full-bleed or hard-edged photos) · `blocks` (no photos: colour blocks, large numbers, icons) · `illustration` (flat spot illustrations in theme colours) · `none` (type-led; use whitespace and rules).

### 9. Motion level

`minimal` · `functional` · `expressive` (see `motion.md`); plus one *signature* recipe the site is allowed to use beyond its level's basics, or `none`.

### 10. Density and width

`airy` (max 64rem content, 6rem section padding) · `regular` (68–72rem, 4rem) · `dense` (full width, 2rem; tools).

## Composing a direction

1. Run the script, or compose by hand: one value per axis.
2. Three candidates must differ on at least four axes, and at least one must use an alternate theme.
3. Reject any candidate that matches a previous `docs/design.md` in the workspace on theme + hero + type voice.
4. Pick the one the brief and references lean toward. If none lean, pick the first.
5. Write `docs/design.md` in the project with the table below filled in, and list the two alternatives as one line each in the plan and the report, so the user can switch with one word.
6. Every choice gets its reason in the table. "Looks nice" is not a reason; "menu prices read better in tabular numerals, so mono-accent" is.

```markdown
# Design direction

| Axis | Choice | Reason |
|---|---|---|
| Theme | Terracotta (remix: Lora headings) | local café; Lora instead of Fraunces because the last build used Fraunces |
| Hero | editorial | no photography supplied; the copy carries it |
| Navigation | inline | four links, no CTA worth a button |
| Rhythm | bands | hours and menu need separation on one page |
| Cards | edged | menus read as printed cards |
| Buttons | soft | matches the theme radius |
| Type | serif-display / regular | warm, handmade |
| Imagery | none | nothing supplied; avoid stock |
| Motion | functional + reveal-once | one page, sections below the fold |
| Density | regular | |

Alternatives offered: (B) Forest · statement · canvas-cards · all-sans · blocks; (C) Gallery · showcase · rules · all-serif · photo-sharp.
```

## Why this works

Variety comes from the combination, not from random colours: 12 themes × 6 heroes × 5 navs × 4 rhythms × 4 cards × 4 buttons × 5 voices × 5 imagery treatments is tens of thousands of coherent directions, and each axis still has a reason. The script seeds from the project name so a second café is different from the first by construction, and the avoid list makes it different from the last five on purpose.
