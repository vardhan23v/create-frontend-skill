#!/usr/bin/env node
// WCAG 2.x contrast checker for the create-frontend colour tokens.
// Usage: node check-contrast.js <tokens.json>
// The JSON has `light` and `dark` objects (one may be omitted for a single-mode project) with these keys:
//   background foreground surface muted mutedForeground border primary primaryForeground
//   accent accentForeground ring danger dangerForeground success successForeground warning warningForeground
// Prints a JSON report and exits 1 when any text pair is under 4.5:1 or any UI pair is under 3:1.
// No dependencies; Node 18 or later.

const fs = require('fs');

const TOKENS = [
  'background', 'foreground', 'surface', 'muted', 'mutedForeground', 'border',
  'primary', 'primaryForeground', 'accent', 'accentForeground', 'ring',
  'danger', 'dangerForeground', 'success', 'successForeground', 'warning', 'warningForeground',
];

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
  ['border', 'background', 1.2, 'info'],    // not a WCAG rule; just must be visible
  ['surface', 'background', 1.0, 'info'],
];

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lum([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a, b) {
  const la = lum(a), lb = lum(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
function hue([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return null;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);
  return (h + 360) % 360;
}

const file = process.argv[2];
if (!file) { console.error('usage: node contrast.js <theme.json>'); process.exit(2); }
const theme = JSON.parse(fs.readFileSync(file, 'utf8'));

const report = { pass: true, modes: {}, invalidHex: [], warnings: [] };
const modes = ['light', 'dark'].filter((m) => theme[m]);
if (!modes.length) { console.error('expected a `light` and/or `dark` object'); process.exit(2); }

for (const mode of modes) {
  const t = theme[mode];
  const rgb = {};
  for (const k of TOKENS) {
    const v = hexToRgb(t[k]);
    if (!v) { report.invalidHex.push(`${mode}.${k}=${t[k]}`); report.pass = false; }
    rgb[k] = v;
  }
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
  if (rgb.primary && rgb.accent) {
    const hp = hue(rgb.primary), ha = hue(rgb.accent);
    if (hp !== null && ha !== null) {
      const diff = Math.min(Math.abs(hp - ha), 360 - Math.abs(hp - ha));
      if (diff < 25) report.warnings.push(`${mode}: primary and accent hues are within ${diff}°; accent will not read as distinct`);
    }
  }
  if (rgb.primary) {
    const h = hue(rgb.primary);
    if (h !== null && h >= 225 && h <= 265) report.warnings.push(`${mode}: primary hue ${h}° is in the indigo/violet band that the generic AI look overuses; justify or move it`);
  }
  if (rgb.surface && rgb.background && ratio(rgb.surface, rgb.background) < 1.03 && rgb.border && ratio(rgb.border, rgb.background) < 1.2) {
    report.warnings.push(`${mode}: surface is indistinguishable from background and border is nearly invisible; cards will have no edge`);
  }
}

if (theme.light && theme.dark) {
  const inv = (a, b) => a && b && String(a).toLowerCase() === String(b).toLowerCase();
  if (inv(theme.light.background, theme.dark.foreground) && inv(theme.light.foreground, theme.dark.background)) {
    report.warnings.push('dark mode is a plain inversion of light; dark surfaces should be lifted with lightness, not swapped');
  }
}

console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
