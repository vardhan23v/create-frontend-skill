#!/usr/bin/env node
// Compose three distinct design directions for a project (references/design-directions.md).
// Usage: node design-direction.js --type <project type> --name "<project name>" [--avoid docs/design.md ...] [--json]
// Deterministic: the same name and type always give the same three candidates, different names give
// different ones. Candidates differ on at least four axes and never match an avoided direction on
// theme + hero + type voice. No dependencies.
const fs = require('fs');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const type = (opt('--type', '') || '').toLowerCase();
const name = opt('--name', '');
const json = args.includes('--json');
const avoidFiles = []; { let i = args.indexOf('--avoid'); if (i >= 0) for (let j = i + 1; j < args.length && !args[j].startsWith('--'); j++) avoidFiles.push(args[j]); }
if (!type || !name) { console.error('usage: design-direction.js --type <type> --name "<name>" [--avoid docs/design.md ...] [--json]'); process.exit(2); }

const THEMES = {
  landing: ['Birch', 'Pewter', 'Citrus', 'Midnight'], marketing: ['Birch', 'Pewter', 'Citrus', 'Midnight'], startup: ['Birch', 'Pewter', 'Citrus', 'Midnight'], saas: ['Birch', 'Pewter', 'Citrus', 'Midnight'],
  ecommerce: ['Birch', 'Terracotta', 'Forest', 'Brass', 'Citrus'], shop: ['Birch', 'Terracotta', 'Forest', 'Brass', 'Citrus'],
  blog: ['Paper & Ink', 'Gallery', 'Forest', 'Pewter'], docs: ['Paper & Ink', 'Pewter', 'Midnight', 'Gallery'], newsletter: ['Paper & Ink', 'Gallery', 'Forest'],
  dashboard: ['Pewter', 'Midnight', 'Harbour', 'Birch'], admin: ['Pewter', 'Midnight', 'Harbour', 'Birch'], internal: ['Pewter', 'Midnight', 'Harbour', 'Birch'],
  farming: ['Forest', 'Terracotta', 'Paper & Ink', 'Harbour'], outdoors: ['Forest', 'Terracotta', 'Paper & Ink'], climate: ['Forest', 'Harbour', 'Paper & Ink'], nonprofit: ['Forest', 'Harbour', 'Paper & Ink', 'Citrus'],
  cafe: ['Terracotta', 'Forest', 'Brass', 'Gallery', 'Citrus'], restaurant: ['Terracotta', 'Brass', 'Gallery', 'Forest'], hotel: ['Terracotta', 'Brass', 'Gallery', 'Harbour'], local: ['Terracotta', 'Forest', 'Citrus', 'Harbour'],
  devtool: ['Midnight', 'Pewter', 'Gallery', 'Birch'], infra: ['Midnight', 'Pewter', 'Gallery'], security: ['Midnight', 'Pewter', 'Harbour'], trading: ['Midnight', 'Pewter', 'Brass'],
  healthcare: ['Harbour', 'Pewter', 'Paper & Ink', 'Forest'], civic: ['Harbour', 'Pewter', 'Paper & Ink'], school: ['Harbour', 'Citrus', 'Paper & Ink'], fintech: ['Harbour', 'Pewter', 'Midnight', 'Brass'],
  'consumer-app': ['Citrus', 'Dusk', 'Birch', 'Terracotta'], events: ['Citrus', 'Birch', 'Dusk', 'Terracotta'], community: ['Citrus', 'Forest', 'Terracotta', 'Harbour'],
  portfolio: ['Gallery', 'Brass', 'Dusk', 'Paper & Ink'], agency: ['Gallery', 'Birch', 'Midnight', 'Brass'], fashion: ['Gallery', 'Brass', 'Dusk'], museum: ['Gallery', 'Paper & Ink', 'Brass'],
  'creative-tool': ['Dusk', 'Gallery', 'Citrus', 'Midnight'], beauty: ['Dusk', 'Gallery', 'Brass'], music: ['Dusk', 'Midnight', 'Citrus'], wellness: ['Dusk', 'Forest', 'Harbour'],
  luxury: ['Brass', 'Gallery', 'Harbour', 'Dusk'], wealth: ['Brass', 'Harbour', 'Pewter'], law: ['Brass', 'Harbour', 'Paper & Ink'],
};
const HERO = { marketing: ['split', 'statement', 'band', 'showcase'], content: ['editorial', 'statement', 'band'], place: ['editorial', 'showcase', 'split', 'statement'], tool: ['utility', 'split'], portfolio: ['showcase', 'statement', 'editorial'] };
const HERO_GROUP = (t) => /dashboard|admin|internal|devtool|infra|security|trading|creative-tool/.test(t) ? 'tool' : /blog|docs|newsletter|law|civic|healthcare|school/.test(t) ? 'content' : /cafe|restaurant|hotel|local|farming|outdoors|wellness|beauty/.test(t) ? 'place' : /portfolio|agency|fashion|museum|music/.test(t) ? 'portfolio' : 'marketing';
const NAV = ['inline', 'inline-cta', 'centered', 'minimal', 'sidebar'];
const RHYTHM = ['bands', 'rules', 'canvas-cards', 'columns'];
const CARDS = ['edged', 'elevated', 'tinted', 'bare'];
const BUTTONS = ['sharp', 'soft', 'pill', 'underline'];
const VOICE = ['serif-display', 'all-sans', 'sans-display-serif-body', 'mono-accent', 'all-serif'];
const SCALE = ['tight', 'regular', 'display'];
const IMAGERY = ['photo-soft', 'photo-sharp', 'blocks', 'illustration', 'none'];
const MOTION = ['minimal', 'functional', 'expressive'];
const DENSITY = ['airy', 'regular', 'dense'];

// constraints that keep a direction coherent
function coherent(d) {
  if (d.hero === 'utility' && (d.motion === 'expressive' || d.rhythm === 'bands')) return false;
  if (d.nav === 'sidebar' && !/tool|content/.test(HERO_GROUP(type))) return false;
  if (d.cards === 'bare' && d.rhythm === 'canvas-cards') return false;
  if (d.buttons === 'underline' && !/serif/.test(d.voice)) return false;
  if (d.imagery === 'none' && d.hero === 'showcase') return false;
  if (d.imagery === 'none' && d.hero === 'split') return false;
  if (d.density === 'dense' && d.hero !== 'utility') return false;
  if (d.theme === 'Midnight' && d.voice === 'all-serif') return false;
  if (HERO_GROUP(type) === 'tool' && (d.motion === 'expressive' || !/all-sans|mono-accent/.test(d.voice) || /underline|pill/.test(d.buttons) || !/none|blocks/.test(d.imagery))) return false;
  if ((d.theme === 'Brass' || d.theme === 'Gallery') && d.buttons === 'pill') return false;
  return true;
}

// deterministic PRNG seeded from the project name and type
let seed = 2166136261;
for (const ch of (name + '|' + type)) { seed ^= ch.charCodeAt(0); seed = Math.imul(seed, 16777619) >>> 0; }
function rand() { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; }
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const themes = THEMES[type] || THEMES[Object.keys(THEMES).find(k => type.includes(k)) || 'landing'];
const heroes = HERO[HERO_GROUP(type)];
const avoid = avoidFiles.flatMap((f) => {
  try { const t = fs.readFileSync(f, 'utf8'); const g = (k) => (new RegExp(`\\| ${k} \\| ([^|(]+)`).exec(t) || [])[1]; return [{ theme: (g('Theme') || '').trim(), hero: (g('Hero') || '').trim(), voice: ((g('Type') || '').split('/')[0]).trim() }]; }
  catch (e) { console.error(`cannot read ${f}: ${e.message}`); return []; }
});
const AXES = ['theme', 'hero', 'nav', 'rhythm', 'cards', 'buttons', 'voice', 'imagery', 'motion', 'density'];
const differs = (a, b) => AXES.filter(k => a[k] !== b[k]).length;
const avoided = (d) => avoid.some(a => a.theme === d.theme && a.hero === d.hero && a.voice === d.voice);

const out = [];
let guard = 0;
while (out.length < 3 && guard++ < 5000) {
  // A leads with the type's primary theme, B must use an alternate, C may use any
  const d = { theme: out.length === 0 ? themes[0] : out.length === 1 ? pick(themes.slice(1)) : pick(themes), hero: out.length === 0 ? heroes[0] : pick(heroes), nav: pick(NAV), rhythm: pick(RHYTHM), cards: pick(CARDS), buttons: pick(BUTTONS), voice: pick(VOICE), scale: pick(SCALE), imagery: pick(IMAGERY), motion: pick(MOTION), density: pick(DENSITY) };
  if (!coherent(d) || avoided(d)) { if (out.length === 0 && guard > 200) themes.push(themes.shift()); continue; } // primary theme avoided: rotate
  if (out.length === 1 && d.theme === out[0].theme) continue;
  if (out.some(o => differs(o, d) < 4)) continue;
  out.push(d);
}
if (out.length < 3) { console.error('could not compose three distinct coherent directions; loosen --avoid or check the type'); process.exit(1); }

if (json) { console.log(JSON.stringify({ type, name, candidates: out }, null, 2)); process.exit(0); }
const letters = ['A', 'B', 'C'];
console.log(`Design directions for "${name}" (${type}); themes considered: ${themes.join(', ')}${avoid.length ? `; avoiding ${avoid.length} previous` : ''}\n`);
out.forEach((d, i) => {
  console.log(`${letters[i]}. ${d.theme} · hero ${d.hero} · nav ${d.nav} · rhythm ${d.rhythm} · cards ${d.cards} · buttons ${d.buttons} · type ${d.voice}/${d.scale} · imagery ${d.imagery} · motion ${d.motion} · density ${d.density}`);
});
console.log('\nPick one, give every axis its reason, write docs/design.md (template in references/design-directions.md), and list the other two in the plan.');
