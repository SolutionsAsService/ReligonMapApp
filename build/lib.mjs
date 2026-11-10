// Shared helpers for the build: data loading, date formatting, the folded time scale, and the Equal Earth map.
import fs from 'node:fs';
import path from 'node:path';
import { geoEqualEarth, geoPath, geoGraticule10, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// The present year is pinned in data/meta.json so a rebuild reproduces every printed figure.
export const NOW = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/meta.json'), 'utf8')).present;

export function loadData() {
  const families = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/families.json'), 'utf8'));
  const traditions = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/traditions.json'), 'utf8'));
  const sources = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/sources.json'), 'utf8'));
  const fam = Object.fromEntries(families.map(f => [f.id, f]));
  const byId = Object.fromEntries(traditions.map(t => [t.id, t]));
  for (const t of traditions) {
    t.children = traditions.filter(c => c.parent === t.id).sort((a, b) => a.start - b.start);
    t.color = fam[t.family].color;
    t.living = t.end === null;
  }
  // Depth-first order within each family: roots by start year, then their children.
  const ordered = [];
  for (const f of families) {
    const inFam = traditions.filter(t => t.family === f.id);
    const roots = inFam.filter(t => !t.parent || byId[t.parent].family !== f.id).sort((a, b) => a.start - b.start);
    const walk = (t, depth) => { t.depth = depth; ordered.push(t); t.children.filter(c => c.family === f.id).forEach(c => walk(c, depth + 1)); };
    roots.forEach(r => walk(r, 0));
    f.members = ordered.filter(t => t.family === f.id);
  }
  if (ordered.length !== traditions.length) throw new Error('ordering lost traditions');
  return { families, fam, traditions: ordered, byId, sources };
}

export function aliveIn(traditions, year) {
  return traditions.filter(t => t.start <= year && (t.end === null || t.end >= year));
}

// ---------- dates ----------
export function yr(y) {
  if (y < 0) return `${-y} BCE`;
  if (y < 1000) return `${y} CE`;
  return String(y);
}
export function span(t) {
  const s = (t.approx ? 'c. ' : '') + yr(t.start);
  const e = t.end === null ? 'present' : (t.end_approx ? 'c. ' : '') + yr(t.end);
  return `${s} – ${e}`;
}

// ---------- folded time scale ----------
// Three segments, each linear, each with its own scale. The folds are drawn on every chart that uses it.
// One gridline every 100 years in every stretch, so the spacing of the lines shows the fold.
export const GRID = 100;
export const FOLDS = [
  { from: -3500, to: -500, f0: 0, f1: 0.24, labels: [-3000, -2000, -500] },
  { from: -500, to: 1500, f0: 0.24, f1: 0.62, labels: [0, 500, 1000, 1500] },
  { from: 1500, to: NOW, f0: 0.62, f1: 1, labels: [1600, 1700, 1800, 1900, 2000] },
];
export function fold(y) {
  const s = FOLDS.find(s => y <= s.to) || FOLDS[FOLDS.length - 1];
  const yy = Math.max(FOLDS[0].from, Math.min(NOW, y));
  return s.f0 + (s.f1 - s.f0) * (yy - s.from) / (s.to - s.from);
}
export function foldRatios() {
  const per = FOLDS.map(s => (s.f1 - s.f0) / (s.to - s.from));
  return { per, r21: per[1] / per[0], r32: per[2] / per[1], r31: per[2] / per[0] };
}

// ---------- map ----------
const world = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/world-atlas/land-110m.json'), 'utf8'));
const land = feature(world, world.objects.land);
const r1 = n => Math.round(n * 10) / 10;
const trim = d => (d || '').replace(/\d+\.\d+/g, m => String(r1(+m)));

// A map frame: the whole world (points = null), or an Equal Earth view fitted to a set of [lat, lon] points.
export function makeMap(points = null, { W = 1000, H = 560, pad = 70, maxScale = 900 } = {}) {
  let projection, h;
  if (!points) {
    projection = geoEqualEarth().fitWidth(W, { type: 'Sphere' });
    h = Math.ceil(geoPath(projection).bounds({ type: 'Sphere' })[1][1]);
  } else {
    const padded = points.flatMap(([lat, lon]) => [[lat - 4, lon - 6], [lat + 4, lon + 6]]);
    const mp = { type: 'MultiPoint', coordinates: padded.map(([lat, lon]) => [lon, lat]) };
    const center = geoEqualEarth().fitExtent([[pad, pad], [W - pad, H - pad]], mp);
    projection = geoEqualEarth().rotate([-((geoBoundsCenterLon(points))), 0]).fitExtent([[pad, pad], [W - pad, H - pad]], mp);
    if (projection.scale() > maxScale) {
      const c = projection.invert([W / 2, H / 2]);
      projection.scale(maxScale).translate([W / 2, H / 2]);
      const p2 = projection(c); const t = projection.translate();
      projection.translate([t[0] + (W / 2 - p2[0]), t[1] + (H / 2 - p2[1])]);
    }
    void center;
    h = H;
  }
  const gp = geoPath(projection);
  return {
    W, H: h, world: !points,
    land: trim(gp(land)), grat: trim(gp(geoGraticule10())), sphere: trim(gp({ type: 'Sphere' })),
    pt(lat, lon) { const [x, y] = projection([lon, lat]); return [r1(x), r1(y)]; },
    arc(a, b) { return trim(gp({ type: 'LineString', coordinates: [[a[1], a[0]], [b[1], b[0]]] })); },
  };
}
function geoBoundsCenterLon(points) {
  const lons = points.map(p => p[1]);
  return (Math.min(...lons) + Math.max(...lons)) / 2;
}
export const WORLD = makeMap(null);
export const MAP_W = WORLD.W, MAP_H = WORLD.H;
export function km(a, b) { return Math.round(geoDistance([a[1], a[0]], [b[1], b[0]]) * 6371); }

// Resolve each spread step to the point it came from.
// Each step names the place it came from, or "?" when the path is not traced (no line is drawn for those).
export function routeOf(t) {
  const pts = { [t.origin.place]: [t.origin.lat, t.origin.lon] };
  const steps = [];
  for (const [year, place, lat, lon, from, note] of [...t.spread].sort((a, b) => a[0] - b[0])) {
    if (from !== '?' && !pts[from]) throw new Error(`${t.id}: stop ${place} comes from unknown place ${from}`);
    const unknown = from === '?';
    steps.push({ year, place, lat, lon, from: unknown ? null : from, fromPt: unknown ? null : pts[from], unknown, note });
    if (!pts[place]) pts[place] = [lat, lon];
  }
  return steps;
}
export function years(t) { return (t.end ?? NOW) - t.start - (t.start < 0 && (t.end ?? NOW) > 0 ? 1 : 0); }

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
