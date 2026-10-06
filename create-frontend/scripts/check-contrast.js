#!/usr/bin/env node
// WCAG 2.x contrast checker for the create-frontend colour tokens.
// Usage: node check-contrast.js <tokens.json>
// The JSON has `light` and/or `dark` objects with these keys (camelCase):
//   background foreground surface muted mutedForeground border input primary primaryForeground
//   accent accentForeground ring danger dangerForeground success successForeground warning warningForeground
// Exit 1 when any text pair is under 4.5:1 or any UI pair is under 3:1, or a hex is invalid.
// Advisory lines (warnings) cover pure black/white, inverted dark modes, indigo-band primaries,
// hue collisions in OKLCH, status text on muted fills and accents that are fill-only.
// No dependencies; Node 18 or later.

const fs = require('fs');

const TOKENS = [
  'background', 'foreground', 'surface', 'muted', 'mutedForeground', 'border', 'input',
  'primary', 'primaryForeground', 'accent', 'accentForeground', 'ring',
  'danger', 'dangerForeground', 'success', 'successForeground', 'warning', 'warningForeground',
];
const OPTIONAL = new Set(['input']);

// [fg, bg, required ratio, kind]  kind: text | ui | info
const PAIRS = [
  ['foreground', 'background', 4.5, 'text'],
  ['foreground', 'surface', 4.5, 'text'],
  ['foreground', 'muted', 4.5, 'text'],
  ['mutedForeground', 'background', 4.5, 'text'],
  ['mutedForeground', 'surface', 4.5, 'text'],
  ['mutedForeground', 'muted', 4.5, 'text'],
  ['primaryForeground', 'primary', 4.5, 'text'],
  ['accentForeground', 'accent', 4.5, 'text'],
  ['dangerForeground', 'danger', 4.5, 'text'],
  ['successForeground', 'success', 4.5, 'text'],
  ['warningForeground', 'warning', 4.5, 'text'],
  ['primary', 'background', 4.5, 'text'],   // primary is also used for links and emphasised text
  ['primary', 'surface', 4.5, 'text'],
  ['danger', 'background', 4.5, 'text'],    // inline error text
  ['danger', 'surface', 4.5, 'text'],
  ['success', 'background', 4.5, 'text'],
  ['warning', 'background', 4.5, 'text'],
  ['accent', 'background', 3, 'ui'],        // accent as a fill, badge or highlight
  ['ring', 'background', 3, 'ui'],          // focus ring must be visible against the page
  ['ring', 'surface', 3, 'ui'],
  ['ring', 'muted', 3, 'ui'],               // focused control on a muted fill
  ['input', 'surface', 3, 'ui'],            // form-control outline (WCAG 1.4.11)
  ['input', 'background', 3, 'ui'],
  ['border', 'background', 1.2, 'info'],    // not a WCAG rule; just must be visible
  ['surface', 'background', 1.0, 'info'],
];

// Advisory: these pairs should sit at least 20° apart in OKLCH hue (when both are chromatic)
const HUE_PAIRS = [
  ['primary', 'accent', 25], ['primary', 'danger', 20], ['primary', 'warning', 20], ['primary', 'success', 20],
  ['accent', 'danger', 20], ['accent', 'warning', 20], ['accent', 'success', 20], ['danger', 'warning', 20],
];

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function lum([r, g, b]) { return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); }
function ratio(a, b) {
  const la = lum(a), lb = lum(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
function hslHue([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return null;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return (Math.round(h * 60) + 360) % 360;
}
function oklch([r, g, b]) {
  const R = lin(r), G = lin(g), B = lin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  let h = (Math.atan2(bb, a) * 180) / Math.PI; if (h < 0) h += 360;
  return { L, C: Math.hypot(a, bb), h };
}
const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

const file = process.argv[2];
if (!file) { console.error('usage: node check-contrast.js <tokens.json>'); process.exit(2); }
let theme;
try { theme = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch (e) { console.error(`cannot read ${file}: ${e.message}`); process.exit(2); }
if (!theme || typeof theme !== 'object') { console.error('expected a `light` and/or `dark` object'); process.exit(2); }

const report = { pass: true, modes: {}, invalidHex: [], warnings: [] };
const modes = ['light', 'dark'].filter((m) => theme[m]);
if (!modes.length) { console.error('expected a `light` and/or `dark` object'); process.exit(2); }

for (const mode of modes) {
  const t = theme[mode];
  const rgb = {};
  for (const k of TOKENS) {
    if (t[k] === undefined && OPTIONAL.has(k)) continue;
    const v = hexToRgb(t[k]);
    if (!v) { report.invalidHex.push(`${mode}.${k}=${t[k]}`); report.pass = false; }
    rgb[k] = v;
  }
  if (!rgb.input) report.warnings.push(`${mode}: no input token; form-control outlines need 3:1 against surface (border is usually too light)`);

  const results = [];
  for (const [fg, bg, req, kind] of PAIRS) {
    if (!rgb[fg] || !rgb[bg]) continue;
    const r = ratio(rgb[fg], rgb[bg]);
    const ok = r >= req;
    if (!ok && kind !== 'info') report.pass = false;
    results.push({ pair: `${fg} on ${bg}`, ratio: Math.round(r * 100) / 100, required: req, kind, ok });
  }
  report.modes[mode] = results;

  // Advisory checks
  const bgHex = String(t.background).toLowerCase(), fgHex = String(t.foreground).toLowerCase();
  if (bgHex === '#000000' || bgHex === '#ffffff') report.warnings.push(`${mode}.background is pure ${bgHex}; use a tinted near-black/near-white`);
  if (fgHex === '#000000' || fgHex === '#ffffff') report.warnings.push(`${mode}.foreground is pure ${fgHex}; use a tinted near-black/near-white`);
  if (rgb.foreground && rgb.background && ratio(rgb.foreground, rgb.background) < 7) report.warnings.push(`${mode}: foreground on background is below 7:1 (AAA); fine for AA but aim higher if easy`);
  if (rgb.primary) {
    const h = hslHue(rgb.primary);
    if (h !== null && h >= 225 && h <= 265 && oklch(rgb.primary).C > 0.04) report.warnings.push(`${mode}: primary hue ${h}° is in the indigo/violet band that the generic AI look overuses; justify or move it`);
  }
  for (const [a, b, floor] of HUE_PAIRS) {
    if (!rgb[a] || !rgb[b]) continue;
    const A = oklch(rgb[a]), B = oklch(rgb[b]);
    if (A.C < 0.03 || B.C < 0.03) continue; // one of them is a neutral; hue is meaningless
    const gap = Math.round(hueGap(A.h, B.h));
    if (gap < floor) report.warnings.push(`${mode}: ${a} and ${b} are ${gap}° apart in OKLCH (floor ${floor}°); they will be confused for each other`);
  }
  for (const s of ['danger', 'success', 'warning']) {
    if (rgb[s] && rgb.muted && ratio(rgb[s], rgb.muted) < 4.5) report.warnings.push(`${mode}: ${s} on muted is ${ratio(rgb[s], rgb.muted).toFixed(2)}:1; never set ${s} as text inside a muted fill, use a ${s} fill with its foreground`);
  }
  if (rgb.accent && rgb.background && ratio(rgb.accent, rgb.background) < 4.5) report.warnings.push(`${mode}: accent on background is ${ratio(rgb.accent, rgb.background).toFixed(2)}:1; accent is fill-only in this mode (badge, chip, rule, chart), never body text`);
  if (rgb.ring && rgb.primary && ratio(rgb.ring, rgb.primary) < 3) report.warnings.push(`${mode}: ring is ${ratio(rgb.ring, rgb.primary).toFixed(2)}:1 against primary; draw focus rings with a 2px offset in background so they read on primary buttons`);
  if (rgb.surface && rgb.background && ratio(rgb.surface, rgb.background) < 1.03 && rgb.border && ratio(rgb.border, rgb.background) < 1.2) {
    report.warnings.push(`${mode}: surface is indistinguishable from background and border is nearly invisible; cards will have no edge`);
  }
}

if (theme.light && theme.dark) {
  const inv = (a, b) => a && b && String(a).toLowerCase() === String(b).toLowerCase();
  if (inv(theme.light.background, theme.dark.foreground) && inv(theme.light.foreground, theme.dark.background)) {
    report.warnings.push('dark mode is a plain inversion of light; dark surfaces should be lifted with lightness, not swapped');
  }
  for (const k of ['primary', 'accent', 'danger', 'success', 'warning']) {
    if (theme.light[k] && theme.dark[k] && inv(theme.light[k], theme.dark[k])) report.warnings.push(`${k} is the same hex in light and dark; dark-mode colours should be lighter`);
  }
}

console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
