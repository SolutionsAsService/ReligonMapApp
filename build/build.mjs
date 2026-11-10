// Builds the static site into site/ from data/*.json. Run: npm run build
import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, NOW, loadData, aliveIn, yr, span, FOLDS, fold, foldRatios,
  MAP_W, MAP_H, WORLD, makeMap, km, routeOf, esc,
} from './lib.mjs';

const OUT = path.join(ROOT, 'site');
const { families, fam, traditions, byId, sources } = loadData();
const N = traditions.length;
const ENDED = traditions.filter(t => t.end !== null).sort((a, b) => a.end - b.end);
const LIVING = traditions.filter(t => t.end === null);
const ratios = foldRatios();
const FEATURED = ['buddhism', 'christianity', 'islam', 'manichaeism', 'judaism', 'hinduism'];

// ---------------------------------------------------------------- page shell
const NAV = [
  ['index.html', 'Map'],
  ['timeline.html', 'Timeline'],
  ['atlas.html', 'Atlas'],
  ['families.html', 'Families'],
  ['lost.html', 'Lost religions'],
  ['sources.html', 'Sources'],
];
function page({ file, title, desc, body, current, depth = 0 }) {
  const up = depth ? '../' : '';
  const nav = NAV.map(([href, label]) =>
    `<a href="${up}${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#f8f4ec">
<link rel="icon" href="${up}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${up}assets/style.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <a class="brand" href="${up}index.html"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="${up}favicon.svg#mark"/></svg><span>The Religion Map</span></a>
  <nav aria-label="Main">${nav}</nav>
</header>
<main id="main">
${body}
</main>
<footer class="foot">
  <p>${N} traditions, ${families.length} families, ${yr(FOLDS[0].from)} to ${NOW}. Dates marked c. are approximate; see <a href="${up}sources.html">Sources &amp; method</a>.</p>
  <p><a href="${up}data/traditions.json">Download the data (JSON)</a> · <a href="https://github.com/SolutionsAsService/ReligonMapApp">Source on GitHub</a></p>
</footer>
<script src="${up}assets/app.js" defer></script>
</body>
</html>
`;
  const p = path.join(OUT, file);
  const out = html.replace(/<table class="data">/g, '<div class="tscroll" tabindex="0" role="region" aria-label="Table, scrolls sideways on small screens"><table class="data">').replace(/<\/table>/g, '</table></div>');
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, out);
}

// ---------------------------------------------------------------- map

function marksSvg(M, list, up) {
  return list.map(t => {
    const [x, y] = M.pt(t.origin.lat, t.origin.lon);
    const halo = t.origin.precision === 'region' ? `<circle class="halo" cx="${x}" cy="${y}" r="16" fill="${t.color}"/>` : '';
    return `<a class="mk${t.living ? '' : ' ended'}" href="${up}t/${t.id}.html" data-id="${t.id}" data-s="${t.start}" data-e="${t.end ?? ''}" data-f="${t.family}" style="--c:${t.color}"><title>${esc(t.name)}: ${esc(span(t))}, ${esc(t.origin.place)}</title>${halo}<circle class="dot" cx="${x}" cy="${y}" r="5.5"/></a>`;
  }).join('');
}

function routeSvg(M, t) {
  const steps = routeOf(t);
  if (!steps.length) return '';
  const paths = steps.map(s => {
    const [x, y] = M.pt(s.lat, s.lon);
    return `<path class="leg" pathLength="1" d="${M.arc(s.fromPt, [s.lat, s.lon])}" data-y="${s.year}"/><circle class="stop" cx="${x}" cy="${y}" r="3.5" data-y="${s.year}"/>`;
  }).join('');
  return `<g class="route" data-route="${t.id}" style="--c:${t.color}" hidden>${paths}</g>`;
}

// Labels are HTML so they stay a readable size on a phone. Placement is solved at build for two scales:
// desktop (map ~880 px wide, 12 px type) and phone (map ~343 px wide, 11 px type). A label that fits nowhere is
// dropped at that scale; the route strip under the map still lists it.
const SCALES = { d: { k: 0.88, cw: 7.4, h: 18 }, m: { k: 0.343, cw: 6.9, h: 16 } };
function placeAll(M, items, sc, mustKeep) {
  const placed = [];
  const W = M.W * sc.k, H = M.H * sc.k;
  const boxes = items.map(it => ({ x: it.x * sc.k, y: it.y * sc.k }));
  const dots = boxes.map(b => [b.x - 5, b.y - 5, b.x + 5, b.y + 5]);
  const hit = (r, list) => list.some(q => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]);
  const order = items.map((it, i) => i).sort((i, j) => (mustKeep(items[j]) - mustKeep(items[i])));
  const res = new Array(items.length).fill(null);
  for (const i of order) {
    const { x, y } = boxes[i];
    const w = items[i].text.length * sc.cw + 12, h = sc.h;
    const cands = {
      r: [x + 7, y - h / 2, x + 7 + w, y + h / 2],
      l: [x - 7 - w, y - h / 2, x - 7, y + h / 2],
      t: [x - w / 2, y - 8 - h, x + w / 2, y - 8],
      b: [x - w / 2, y + 8, x + w / 2, y + 8 + h],
    };
    let pick = null;
    for (const [k, r] of Object.entries(cands)) {
      if (r[0] < 0 || r[2] > W || r[1] < 0 || r[3] > H) continue;
      if (hit(r, placed) || hit(r, dots.filter((_, j) => j !== i))) continue;
      pick = k; placed.push(r); break;
    }
    if (!pick && mustKeep(items[i])) { // keep it anyway, on the side that stays inside the map
      const k = x > W / 2 ? 'l' : 'r'; pick = k; placed.push(cands[k]);
    }
    res[i] = pick;
  }
  return res;
}
function labelSpans(M, items, mustKeep) {
  const d = placeAll(M, items, SCALES.d, mustKeep), m = placeAll(M, items, SCALES.m, mustKeep);
  return items.map((it, i) => {
    const cls = [it.cls, d[i] ? 'd-' + d[i] : 'd-x', m[i] ? 'm-' + m[i] : 'm-x'].join(' ');
    return `<span class="lbl ${cls}"${it.route ? ` data-route="${it.route}"` : ''}${it.year !== undefined ? ` data-y="${it.year}"` : ''} style="left:${(it.x / M.W * 100).toFixed(2)}%;top:${(it.y / M.H * 100).toFixed(2)}%;--c:${it.color}"${it.route ? ' hidden' : ''}>${esc(it.text)}</span>`;
  }).join('');
}
function routeLabels(M, t) {
  const steps = routeOf(t);
  const items = [];
  const [ox, oy] = M.pt(t.origin.lat, t.origin.lon);
  items.push({ x: ox, y: oy, text: `${t.origin.label || t.origin.place.split(',')[0]} · ${t.approx ? 'c. ' : ''}${yr(t.start)}`, year: t.start, cls: 'origin', route: t.id, color: t.color, key: 2 });
  const seen = new Set([t.origin.place]);
  steps.forEach((s, i) => {
    if (seen.has(s.place)) return; seen.add(s.place);
    const [x, y] = M.pt(s.lat, s.lon);
    items.push({ x, y, text: `${s.place.split(/[,(]/)[0].trim()} ${yr(s.year)}`, year: s.year, cls: i === steps.length - 1 ? 'last' : 'minor', route: t.id, color: t.color, key: i === steps.length - 1 ? 1 : 0 });
  });
  return labelSpans(M, items, it => it.key);
}

function routeStrip(t) {
  const steps = routeOf(t);
  const items = [`<li><b>${esc(t.origin.place)}</b> <span class="y">${t.approx ? 'c. ' : ''}${yr(t.start)}</span></li>`]
    .concat(steps.map(s => `<li data-y="${s.year}"><b>${esc(s.place)}</b> <span class="y">${yr(s.year)}</span>${s.from !== t.origin.place ? ` <span class="via">from ${esc(s.from)}</span>` : ''}</li>`));
  return `<ol class="strip" data-route="${t.id}" hidden>${items.join('')}</ol>`;
}

const MAPKEY = `<ul class="mapkey" aria-label="Map key">
<li><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" class="k-dot"/></svg> birthplace</li>
<li><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5" class="k-ended"/></svg> ended</li>
<li><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.5" class="k-halo"/><circle cx="8" cy="8" r="4" class="k-dot"/></svg> region, not one place</li>
<li><svg viewBox="0 0 34 12" aria-hidden="true"><path d="M2 6 H30" class="k-route"/><circle cx="30" cy="6" r="3" class="k-stop"/></svg> dated spread</li>
<li><svg viewBox="0 0 34 12" aria-hidden="true"><path d="M2 6 H32" class="k-born"/></svg> born from (parent → branch)</li>
</ul>`;
function mapFigure({ id, list, routes = [], up = '', caption = '', cls = '', labelOrigins = false, fit = false, lineage = false }) {
  let M = WORLD;
  // lineage pairs: child born away from its parent's birthplace
  const pairs = !lineage ? [] : list.flatMap(t => {
    const p = t.parent && byId[t.parent];
    if (!p) return [];
    const d = km([p.origin.lat, p.origin.lon], [t.origin.lat, t.origin.lon]);
    return d > 150 ? [[p, t]] : [];
  });
  const ghosts = pairs.map(([p]) => p).filter((p, i, a) => !list.includes(p) && a.indexOf(p) === i);
  if (fit) {
    const pts = list.concat(ghosts).map(t => [t.origin.lat, t.origin.lon]).concat(...routes.map(t => t.spread.map(s => [s[2], s[3]])));
    M = makeMap(pts);
  }
  const originLabels = labelOrigins ? labelSpans(M, (labelOrigins === 'ghosts' ? ghosts : list.concat(ghosts)).map(t => { const [x, y] = M.pt(t.origin.lat, t.origin.lon); return { x, y, text: t.name, cls: 'oname', color: t.color, key: list.length < 4 ? 1 : 0 }; }), it => it.key) : '';
  return `<figure class="map ${cls}${M.world ? '' : ' fitted'}" id="${id}" data-map>
<div class="map-box">
<svg viewBox="0 0 ${M.W} ${M.H}" role="group" aria-labelledby="${id}-cap">
${M.world ? `<path class="sphere" d="${M.sphere}"/>` : `<rect class="sea" width="${M.W}" height="${M.H}"/>`}<path class="grat" d="${M.grat}"/><path class="land" d="${M.land}"/>
<g class="lineage">${pairs.map(([p, t]) => `<path class="born" style="--c:${t.color}" d="${M.arc([p.origin.lat, p.origin.lon], [t.origin.lat, t.origin.lon])}" data-y="${t.start}"><title>${esc(t.name)} born from ${esc(p.name)}, ${esc(yr(t.start))}</title></path>`).join('')}</g>
<g class="routes">${routes.map(t => routeSvg(M, t)).join('')}</g>
<g class="marks">${marksSvg(M, ghosts, up).replace(/class="mk/g, 'class="mk ghost')}${marksSvg(M, list, up)}</g>
</svg>
<div class="labels">${routes.map(t => routeLabels(M, t)).join('')}${originLabels}</div>
</div>
${M.world ? '' : MAPKEY}
${caption ? `<figcaption id="${id}-cap">${caption}</figcaption>` : `<figcaption id="${id}-cap" class="sr">Map of origins</figcaption>`}
</figure>`;
}

// ---------------------------------------------------------------- alive ribbon (folded axis)
function aliveSeries() {
  const pts = [];
  for (let y = FOLDS[0].from; y <= NOW; y += (y < -500 ? 50 : y < 1500 ? 20 : 5)) pts.push([y, aliveIn(traditions, y).length]);
  pts.push([NOW, aliveIn(traditions, NOW).length]);
  return pts;
}
const ALIVE = aliveSeries();
const ALIVE_MAX = Math.max(...ALIVE.map(p => p[1]));

function ribbonSvg(w = 1000, h = 56) {
  const X = y => (fold(y) * w).toFixed(1);
  const Y = n => (h - 4 - (n / ALIVE_MAX) * (h - 14)).toFixed(1);
  let d = `M${X(ALIVE[0][0])},${h - 4}`;
  for (const [y, n] of ALIVE) d += `L${X(y)},${Y(n)}`;
  d += `L${X(NOW)},${h - 4}Z`;
  const seams = FOLDS.slice(1).map(s => `<line class="seam" x1="${X(s.from)}" x2="${X(s.from)}" y1="0" y2="${h}"/>`).join('');
  const ticks = [[-3000, 'm-x'], [-1500, 'm-x'], [-500, ''], [500, 'm-x'], [1000, ''], [1500, ''], [1800, 'm-x'], [NOW, '']].map(([y, c]) =>
    `<span class="rt ${c}" style="left:${(fold(y) * 100).toFixed(2)}%">${y === NOW ? 'now' : y < 0 ? `${-y} BCE` : y < 1000 ? `${y} CE` : y}</span>`).join('');
  return `<svg class="ribbon" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}"/>${seams}</svg><div class="rticks" aria-hidden="true">${ticks}</div>`;
}

function yearControl(target, { value = NOW } = {}) {
  return `<div class="yearctl" data-yearctl="${target}">
<div class="yc-head"><label for="${target}-year">Year</label> <output id="${target}-out" class="yc-out" for="${target}-year"></output></div>
<div class="yc-track">${ribbonSvg()}<input id="${target}-year" type="range" min="0" max="1000" step="1" value="${Math.round(fold(value) * 1000)}" aria-describedby="${target}-out"></div>
<p class="yc-note">The shaded band counts traditions alive in each year. The axis folds twice (at 500 BCE and 1500); a year after 1500 is ${ratios.r31.toFixed(1)}× wider than one before 500 BCE.</p>
</div>`;
}

// ---------------------------------------------------------------- timeline (folded, lineage)
function timelineSvg(list, { up = '', W = 1200, row = 26, showFamilies = true, highlight = null } = {}) {
  const L = 0, R = W - 10;
  const X = y => (L + fold(y) * (R - L));
  let y = 40;
  const rows = [];
  const rowY = {};
  let curFam = null;
  for (const t of list) {
    if (showFamilies && t.family !== curFam) {
      curFam = t.family;
      y += curFam === list[0].family ? 0 : 18;
      rows.push(`<text class="famhead" x="${X(-3480).toFixed(1)}" y="${y + 6}" style="fill:${fam[curFam].color}">${esc(fam[curFam].name)}</text>`);
      y += 22;
    }
    rowY[t.id] = y;
    y += row;
  }
  const H = y + 10;
  // grid
  const grid = [];
  for (const s of FOLDS) {
    for (let g = Math.ceil(s.from / s.grid) * s.grid; g <= s.to; g += s.grid) {
      if (g === s.from && s !== FOLDS[0]) continue;
      const major = g % s.label === 0 || g === s.to;
      grid.push(`<line class="g${major ? ' major' : ''}" x1="${X(g).toFixed(1)}" x2="${X(g).toFixed(1)}" y1="22" y2="${H}"/>`);
      if (major) grid.push(`<text class="gl" x="${X(g).toFixed(1)}" y="16" text-anchor="middle">${g === 0 ? '1 CE' : g < 0 ? `${-g} BCE` : g}</text>`);
    }
  }
  const seams = FOLDS.slice(1).map((s, i) => {
    const x = X(s.from).toFixed(1);
    const r = i === 0 ? ratios.r21 : ratios.r32;
    return `<g class="fold"><path d="M${x},22 ${Array.from({ length: Math.ceil((H - 22) / 12) }, (_, k) => `L${(+x + (k % 2 ? -3 : 3)).toFixed(1)},${22 + (k + 1) * 12}`).join(' ')}"/><text x="${(+x + 6).toFixed(1)}" y="34">fold · years ${r.toFixed(1)}× wider →</text></g>`;
  }).join('');
  // lineage connectors
  const links = list.filter(t => t.parent && rowY[t.parent] !== undefined).map(t => {
    const x = X(t.start).toFixed(1), y0 = rowY[t.parent], y1 = rowY[t.id];
    const p = byId[t.parent];
    const revival = p.end !== null && p.end < t.start;
    return `<path class="branch${revival ? ' revival' : ''}" style="stroke:${t.color}" d="M${x},${y0} C${x},${(y0 + y1) / 2} ${x},${(y0 + y1) / 2} ${x},${y1}"/>`;
  }).join('');
  // rows
  const bars = list.map(t => {
    const ry = rowY[t.id];
    const x0 = X(t.start), x1 = X(t.end ?? NOW);
    const endMark = t.end === null
      ? `<path class="open" d="M${(x1 - 2).toFixed(1)},${ry - 4} L${(x1 + 4).toFixed(1)},${ry} L${(x1 - 2).toFixed(1)},${ry + 4}"/>`
      : `<rect class="cap" x="${(x1 - 1.5).toFixed(1)}" y="${ry - 8}" width="3.5" height="16"/>`;
    const labelLeft = x0 > W * 0.8;
    const lx = labelLeft ? x0 - 9 : x0 + 9;
    const endText = t.end !== null ? `<text class="endtxt" x="${(x1 + 7).toFixed(1)}" y="${ry + 4}">${yr(t.end)}</text>` : '';
    const hl = highlight && highlight === t.id ? ' hl' : '';
    return `<a class="row${t.living ? '' : ' ended'}${hl}" href="${up}t/${t.id}.html" data-s="${t.start}" data-e="${t.end ?? ''}" style="--c:${t.color}">
<title>${esc(t.name)}: ${esc(span(t))}</title>
<rect class="hit" x="0" y="${ry - 12}" width="${W}" height="${row - 2}"/>
<line class="life" x1="${x0.toFixed(1)}" x2="${x1.toFixed(1)}" y1="${ry}" y2="${ry}"/>${endMark}
<circle class="start${t.approx ? ' approx' : ''}" cx="${x0.toFixed(1)}" cy="${ry}" r="4.5"/>
<text class="nm" x="${lx.toFixed(1)}" y="${ry - 6}"${labelLeft ? ' text-anchor="end"' : ''}>${esc(t.name)}</text>${endText}</a>`;
  }).join('');
  return { svg: `<svg class="tl" viewBox="0 0 ${W + 60} ${H}" data-tl data-w="${W}" role="img" aria-label="Lineage timeline of ${list.length} traditions on a folded time axis; the same data is listed in the table below.">
<g class="grid">${grid.join('')}</g>${seams}<g class="heads">${rows.join('')}</g><g class="links">${links}</g><g class="rows">${bars}</g>
<line class="cursor" x1="0" x2="0" y1="22" y2="${H}" hidden/>
</svg>`, H };
}

// mini span bar on the folded axis (small multiples)
function spanBar(t, w = 220) {
  const x0 = fold(t.start) * w, x1 = fold(t.end ?? NOW) * w;
  const seams = FOLDS.slice(1).map(s => `<line class="seam" x1="${(fold(s.from) * w).toFixed(1)}" x2="${(fold(s.from) * w).toFixed(1)}" y1="0" y2="14"/>`).join('');
  return `<svg class="spanbar" viewBox="0 0 ${w + 6} 14" aria-hidden="true"><line class="base" x1="0" x2="${w}" y1="7" y2="7"/>${seams}<line class="life" style="stroke:${t.color}" x1="${x0.toFixed(1)}" x2="${x1.toFixed(1)}" y1="7" y2="7"/>${t.end === null ? '' : `<rect x="${(x1 - 1.5).toFixed(1)}" y="1" width="3" height="12" style="fill:${t.color}"/>`}</svg>`;
}

function famChips(up = '', { counts = true } = {}) {
  return `<ul class="chips fams">${families.map(f => `<li><a href="${up}families/${f.id}.html" style="--c:${f.color}"><i aria-hidden="true"></i>${esc(f.name)}${counts ? ` <span class="n">${f.members.length}</span>` : ''}</a></li>`).join('')}</ul>`;
}

// ---------------------------------------------------------------- pages
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'data'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'src', 'style.css'), path.join(OUT, 'assets', 'style.css'));
fs.writeFileSync(path.join(OUT, 'assets', 'app.js'), fs.readFileSync(path.join(ROOT, 'src', 'app.js'), 'utf8').replaceAll('__FOLDS__', JSON.stringify(FOLDS)).replace('__NOW__', String(NOW)));
fs.copyFileSync(path.join(ROOT, 'src', 'favicon.svg'), path.join(OUT, 'favicon.svg'));
fs.copyFileSync(path.join(ROOT, 'data', 'traditions.json'), path.join(OUT, 'data', 'traditions.json'));
fs.copyFileSync(path.join(ROOT, 'data', 'families.json'), path.join(OUT, 'data', 'families.json'));

// HOME
{
  const feat = FEATURED.map(id => byId[id]);
  const chips = feat.map((t, i) => `<button type="button" class="rchip" data-show-route="${t.id}" aria-pressed="${i === 0}" style="--c:${t.color}">${esc(t.name)}</button>`).join('');
  const body = `
<section class="hero">
  <div class="hero-text">
    <h1>Where ${N} religions began, <em>and when</em></h1>
    <p class="lede">Every dot is a birthplace. Drag the year to watch them appear, spread and end. ${LIVING.length} are still practised; ${ENDED.length} have ended.</p>
    <div class="routes-pick" role="group" aria-label="Show the spread of">
      <span class="rp-label">Follow the spread of</span>${chips}
    </div>
    ${famChips()}
  </div>
  <div class="hero-fig">
    ${mapFigure({ id: 'hero', list: traditions, routes: feat, caption: '' })}
    ${yearControl('hero')}
    <div class="strips">${feat.map(routeStrip).join('')}</div>
  </div>
</section>
<section class="doors">
  <a class="door" href="timeline.html"><h2>Timeline</h2><p>All ${N} on one folded axis: who branched from whom, and which lines stop.</p></a>
  <a class="door" href="atlas.html"><h2>Atlas</h2><p>Every origin and every dated route, filterable by family and year.</p></a>
  <a class="door" href="lost.html"><h2>Lost religions</h2><p>${ENDED.length} traditions that ended, from ${esc(ENDED[0].name)} (${yr(ENDED[0].end)}) to ${esc(ENDED[ENDED.length - 1].name)} (${yr(ENDED[ENDED.length - 1].end)}), and what ended them.</p></a>
  <a class="door" href="sources.html"><h2>Sources &amp; method</h2><p>Where each date and number comes from, and what we do not know.</p></a>
</section>`;
  page({ file: 'index.html', current: 'index.html', title: 'The Religion Map: where religions began, and when', desc: `A light Equal Earth map and folded timeline of ${N} religious traditions: their birthplaces, how they spread, and which ones ended.`, body });
}

// TIMELINE
{
  const { svg } = timelineSvg(traditions);
  const table = `<table class="data"><caption>All ${N} traditions</caption><thead><tr><th scope="col">Tradition</th><th scope="col">Family</th><th scope="col">Branch of</th><th scope="col">Dates</th><th scope="col">Origin</th></tr></thead><tbody>${traditions.map(t => `<tr><th scope="row"><a href="t/${t.id}.html">${esc(t.name)}</a></th><td>${esc(fam[t.family].name)}</td><td>${t.parent ? `<a href="t/${t.parent}.html">${esc(byId[t.parent].name)}</a>` : '—'}</td><td class="num">${esc(span(t))}</td><td>${esc(t.origin.place)}</td></tr>`).join('')}</tbody></table>`;
  const body = `
<section class="pagehead">
  <h1>Timeline</h1>
  <p class="lede">Each line is one tradition, from its start to today or to its end. A branch drops from its parent's line in the year it split. The time axis is <strong>folded</strong>: three stretches, each drawn to its own scale, so the crowded last five centuries get room.</p>
  <ul class="legend">
    <li><svg viewBox="0 0 40 12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" class="lg-dot"/><line x1="10" x2="40" y1="6" y2="6" class="lg-line"/></svg> start known to the year or decade</li>
    <li><svg viewBox="0 0 40 12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" class="lg-dot approx"/><line x1="10" x2="40" y1="6" y2="6" class="lg-line"/></svg> start approximate (c.)</li>
    <li><svg viewBox="0 0 40 12" aria-hidden="true"><line x1="0" x2="32" y1="6" y2="6" class="lg-line"/><path d="M30,2 L36,6 L30,10" class="lg-open"/></svg> still practised</li>
    <li><svg viewBox="0 0 40 16" aria-hidden="true"><line x1="0" x2="32" y1="8" y2="8" class="lg-line"/><rect x="31" y="0" width="3.5" height="16" class="lg-cap"/></svg> ended</li>
    <li><svg viewBox="0 0 40 16" aria-hidden="true"><path d="M20,0 L23,4 L17,8 L23,12 L20,16" class="lg-fold"/></svg> fold: the scale changes</li>
  </ul>
  ${yearControl('tl')}
</section>
<div class="tl-scroll" tabindex="0" role="region" aria-label="Timeline chart, scrolls sideways on small screens">${svg}</div>
<p class="fold-note">At full width, 100 years is drawn ${FOLDS.map(f => ((f.f1 - f.f0) / (f.to - f.from) * 1190 * 100).toFixed(1)).map((v, i) => `${v} px ${['before 500 BCE', 'from 500 BCE to 1500', 'after 1500'][i]}`).join(', ')}. The gridlines (every 500, 100 and 50 years) show the same change.</p>
<details class="tablewrap"><summary>The same data as a table</summary>${table}</details>`;
  page({ file: 'timeline.html', current: 'timeline.html', title: 'Timeline · The Religion Map', desc: `Lineage of ${N} religious traditions on a folded time axis, from ${yr(FOLDS[0].from)} to ${NOW}.`, body });
}

// ATLAS
{
  const routed = traditions.filter(t => t.spread.length);
  const list = families.map(f => `<li><h3 style="--c:${f.color}"><label><input type="checkbox" data-fam-toggle="${f.id}" checked> ${esc(f.name)}</label></h3><ul>${f.members.map(t => `<li><button type="button" class="tbtn" data-show-route="${t.id}" aria-pressed="false" style="--c:${t.color}">${esc(t.name)}</button> <span class="y">${esc(span(t))}</span>${t.spread.length ? ` <span class="nstops">${t.spread.length} stop${t.spread.length > 1 ? 's' : ''}</span>` : ''}</li>`).join('')}</ul></li>`).join('');
  const body = `
<section class="pagehead">
  <h1>Atlas</h1>
  <p class="lede">All ${N} birthplaces on a light Equal Earth map, which keeps every region at its true area. Pick a tradition to draw its dated spread; drag the year to see the map as it stood then. A soft halo means the origin is a region, not a single place.</p>
</section>
<div class="atlas">
  <div class="atlas-fig">
    ${mapFigure({ id: 'atlas', list: traditions, routes: routed, caption: `Origins of ${N} traditions; ${routed.length} have dated spread routes.`, cls: 'big' })}
    ${yearControl('atlas')}
    <div class="strips">${routed.map(routeStrip).join('')}</div>
  </div>
  <aside class="atlas-list" aria-label="Traditions"><ul class="famlist">${list}</ul></aside>
</div>`;
  page({ file: 'atlas.html', current: 'atlas.html', title: 'Atlas · The Religion Map', desc: `Map of the origins and spread of ${N} religious traditions.`, body });
}

// FAMILIES INDEX + FAMILY PAGES
{
  const cards = families.map(f => {
    const alive = f.members.filter(t => t.living).length;
    return `<a class="famcard" href="families/${f.id}.html" style="--c:${f.color}"><h2>${esc(f.name)}</h2><p>${esc(f.blurb)}</p><p class="meta">${f.members.length} traditions · ${alive} living · ${f.members.length - alive} ended</p><div class="sm">${f.members.map(t => spanBar(t, 220)).join('')}</div></a>`;
  }).join('');
  page({ file: 'families.html', current: 'families.html', title: 'Families · The Religion Map', desc: 'Eight families of religious traditions, each with its members drawn on the same folded time axis.', body: `
<section class="pagehead"><h1>Families</h1><p class="lede">Eight families, grouped by shared roots and region. The small lines are each member's lifespan on the same folded axis as the timeline.</p></section>
<div class="famgrid">${cards}</div>` });

  families.forEach((f, i) => {
    const prev = families[(i + families.length - 1) % families.length], next = families[(i + 1) % families.length];
    const { svg } = timelineSvg(f.members, { up: '../', showFamilies: false, row: 28 });
    const rows = f.members.map(t => `<li style="--c:${t.color}"><a href="../t/${t.id}.html">${esc(t.name)}</a> <span class="y">${esc(span(t))}</span> <span class="pl">${esc(t.origin.place)}</span></li>`).join('');
    page({ file: `families/${f.id}.html`, depth: 1, current: 'families.html', title: `${f.name} · The Religion Map`, desc: f.blurb, body: `
<section class="pagehead fam" style="--c:${f.color}"><p class="kicker"><a href="../families.html">Families</a></p><h1>${esc(f.name)}</h1><p class="lede">${esc(f.blurb)}</p></section>
${mapFigure({ id: 'fam', list: f.members, routes: f.members.filter(t => t.spread.length), up: '../', caption: `Origins of the ${f.members.length} ${esc(f.name)} traditions and their dated routes.`, labelOrigins: true, cls: 'famall', fit: true, lineage: true })}
${yearControl('fam')}
<h2 class="sec">Lineage</h2>
<div class="tl-scroll" tabindex="0" role="region" aria-label="${esc(f.name)} lineage chart">${svg}</div>
<ul class="members">${rows}</ul>
<nav class="pn" aria-label="Other families"><a href="${prev.id}.html">← ${esc(prev.name)}</a><a href="${next.id}.html">${esc(next.name)} →</a></nav>` });
  });
}

// LOST
{
  const W = 1000;
  const rows = ENDED.map(t => `<li class="lost" style="--c:${t.color}">
<div class="lost-head"><a href="t/${t.id}.html">${esc(t.name)}</a> <span class="y">${esc(span(t))}</span></div>
${spanBar(t, 600)}
<p class="why"><b>Ended ${yr(t.end)}.</b> ${esc(t.ended_by || '')}</p></li>`).join('');
  page({ file: 'lost.html', current: 'lost.html', title: 'Lost religions · The Religion Map', desc: `${ENDED.length} religious traditions that ended, in the order they ended, with what ended them.`, body: `
<section class="pagehead"><h1>Lost religions</h1><p class="lede">${ENDED.length} of the ${N} traditions here are no longer practised as living religions. They are listed in the order they ended. Most did not simply die: they were banned, conquered, absorbed, or became something else. Several have modern revivals, which are listed as new traditions.</p></section>
${mapFigure({ id: 'lostmap', list: ENDED, caption: `Birthplaces of the ${ENDED.length} ended traditions.`, labelOrigins: true })}
<ol class="lostlist">${rows}</ol>` });
}

// SOURCES
{
  const approx = traditions.filter(t => t.approx).length;
  const region = traditions.filter(t => t.origin.precision === 'region').length;
  const withAdh = traditions.filter(t => t.adherents);
  const src = Object.entries(sources).map(([k, s]) => `<li id="src-${k}"><b>${esc(s.title)}</b>, ${esc(s.publisher)}, ${s.year}. <a href="${esc(s.url)}">${esc(s.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>. ${esc(s.note)}</li>`).join('');
  const adh = withAdh.map(t => `<tr><th scope="row"><a href="t/${t.id}.html">${esc(t.name)}</a></th><td class="num">${t.adherents.millions.toLocaleString('en-US')} million</td><td><a href="#src-${t.adherents.source}">${esc(sources[t.adherents.source].short)}</a></td></tr>`).join('');
  page({ file: 'sources.html', current: 'sources.html', title: 'Sources & method · The Religion Map', desc: 'Where the dates, places and numbers on The Religion Map come from.', body: `
<section class="pagehead"><h1>Sources &amp; method</h1><p class="lede">This is a map of beginnings, not of today's believers. Dates of origin are often disputed; the map says so rather than hiding it.</p></section>
<div class="prose">
<h2>Dates</h2>
<p>${approx} of ${N} start dates are approximate and are written with "c." On the timeline their start dot is hollow. Each tradition's page explains its date in words, including where tradition and historians disagree (for example Zarathustra, the Buddha, or Shinto). Years are BCE/CE; there is no year 0. Living traditions run to ${NOW}, the year this site was built, and stay open-ended.</p>
<h2>Places</h2>
<p>Each origin is a single latitude and longitude. ${N - region} are a specific site (a city, a mountain, a temple); ${region} are a region, drawn with a soft halo, because the tradition has no single birthplace. Spread routes mark dated places a tradition reached, each drawn as a great-circle line from the place it came from. They are illustrative milestones, not complete histories.</p>
<h2>The folded time axis</h2>
<p>Every chart uses the same three-part axis: ${yr(FOLDS[0].from)}–500 BCE takes ${Math.round((FOLDS[0].f1 - FOLDS[0].f0) * 100)}% of the width, 500 BCE–1500 takes ${Math.round((FOLDS[1].f1 - FOLDS[1].f0) * 100)}%, and 1500–${NOW} takes ${Math.round((FOLDS[2].f1 - FOLDS[2].f0) * 100)}%. So a year after 1500 is drawn ${ratios.r31.toFixed(1)}× wider than a year before 500 BCE, and ${ratios.r32.toFixed(1)}× wider than a year between. Lengths compare honestly only inside one stretch. The folds are drawn as zigzag seams.</p>
<h2>Numbers of followers</h2>
<p>Only ${withAdh.length} traditions show a number of followers, because only these have a recent figure from one cited source.</p>
<table class="data"><thead><tr><th scope="col">Tradition</th><th scope="col">Followers</th><th scope="col">Source</th></tr></thead><tbody>${adh}</tbody></table>
<h2>Corrections to the earlier version</h2>
<ul>
<li>Sikhism began c. 1499 with Guru Nanak's revelation, not 1469 (his birth year).</li>
<li>"Orthodox Judaism" as a named movement dates from the early 19th century, not 2000 BCE.</li>
<li>Roman religion ended with the bans of 391–392; the Edict of Thessalonica (380) made Christianity official but did not ban other cults.</li>
<li>Shinto's 500 BCE start had no source; codified Shinto is dated from the 8th century.</li>
<li>Christianity's start is c. 30 CE; there is no year 0.</li>
</ul>
<h2>Sources</h2>
<ul class="srclist">${src}</ul>
<p>Dates and places otherwise follow standard reference histories; each tradition's page gives its reasoning. Corrections are welcome on <a href="https://github.com/SolutionsAsService/ReligonMapApp">GitHub</a>.</p>
</div>` });
}

// TRADITION PAGES
traditions.forEach(t => {
  const f = fam[t.family];
  const chain = [];
  for (let p = t.parent; p; p = byId[p].parent) chain.unshift(byId[p]);
  const lineage = [...chain, t, ...t.children];
  const { svg } = timelineSvg(lineage, { up: '../', showFamilies: false, row: 28, highlight: t.id });
  const steps = routeOf(t);
  const routeTable = steps.length ? `<table class="data"><caption>Dated spread of ${esc(t.name)}</caption><thead><tr><th scope="col">Year</th><th scope="col">Place</th><th scope="col">From</th><th scope="col">Distance</th><th scope="col">Note</th></tr></thead><tbody>${steps.map(s => `<tr><td class="num">${yr(s.year)}</td><td>${esc(s.place)}</td><td>${esc(s.from)}</td><td class="num">${km(s.fromPt, [s.lat, s.lon]).toLocaleString('en-US')} km</td><td>${esc(s.note || '')}</td></tr>`).join('')}</tbody></table>` : `<p class="muted">No spread route is recorded for ${esc(t.name)}.</p>`;
  const siblings = f.members;
  const i = siblings.indexOf(t);
  const prev = siblings[(i + siblings.length - 1) % siblings.length], next = siblings[(i + 1) % siblings.length];
  const adh = t.adherents ? `<div><dt>Followers</dt><dd>${t.adherents.millions.toLocaleString('en-US')} million <a class="src" href="../sources.html#src-${t.adherents.source}">${esc(sources[t.adherents.source].short)}</a></dd></div>` : '';
  const body = `
<article class="trad" style="--c:${t.color}">
<header class="pagehead">
  <p class="kicker"><a href="../families/${f.id}.html">${esc(f.name)}</a>${chain.length ? ' · ' + chain.map(p => `<a href="${p.id}.html">${esc(p.name)}</a>`).join(' → ') : ''}</p>
  <h1>${esc(t.name)}</h1>
  <p class="lede">${esc(t.summary)}</p>
  <dl class="facts">
    <div><dt>Dates</dt><dd>${esc(span(t))}</dd></div>
    <div><dt>Origin</dt><dd>${esc(t.origin.place)}${t.origin.precision === 'region' ? ' <span class="muted">(region)</span>' : ''}</dd></div>
    ${adh}
    ${t.children.length ? `<div><dt>Branches</dt><dd>${t.children.map(c => `<a href="${c.id}.html">${esc(c.name)}</a>`).join(', ')}</dd></div>` : ''}
  </dl>
  <p class="datenote"><b>About the date:</b> ${esc(t.date_note)}</p>
  ${t.ended_by ? `<p class="endnote"><b>How it ended (${yr(t.end)}):</b> ${esc(t.ended_by)}</p>` : ''}
</header>
${mapFigure({ id: 'tmap', list: [t], routes: steps.length ? [t] : [], up: '../', caption: steps.length ? `${esc(t.name)}: birthplace and ${steps.length} dated stop${steps.length > 1 ? 's' : ''}.` : `Birthplace of ${esc(t.name)}.`, cls: 'solo', labelOrigins: steps.length ? 'ghosts' : true, fit: true, lineage: true })}
${routeTable}
<h2 class="sec">Lineage</h2>
<div class="tl-scroll" tabindex="0" role="region" aria-label="Lineage of ${esc(t.name)}">${svg}</div>
<nav class="pn" aria-label="More in ${esc(f.name)}"><a href="${prev.id}.html">← ${esc(prev.name)}</a><a href="${next.id}.html">${esc(next.name)} →</a></nav>
</article>`;
  page({ file: `t/${t.id}.html`, depth: 1, current: '', title: `${t.name} · The Religion Map`, desc: `${t.name} (${span(t)}), from ${t.origin.place}. ${t.summary}`, body });
});

// 404
page({ file: '404.html', current: '', title: 'Not found · The Religion Map', desc: 'Page not found.', body: `<section class="pagehead"><h1>Not on the map</h1><p class="lede">That page does not exist. Try the <a href="index.html">map</a> or the <a href="timeline.html">timeline</a>.</p></section>` });

fs.writeFileSync(path.join(OUT, 'build-facts.json'), JSON.stringify({
  built: NOW, traditions: N, living: LIVING.length, ended: ENDED.length, families: families.length,
  approx: traditions.filter(t => t.approx).length, region: traditions.filter(t => t.origin.precision === 'region').length,
  routed: traditions.filter(t => t.spread.length).length, stops: traditions.reduce((a, t) => a + t.spread.length, 0),
  folds: FOLDS, ratios, aliveNow: aliveIn(traditions, NOW).length, aliveMax: ALIVE_MAX,
  firstEnded: [ENDED[0].name, ENDED[0].end], lastEnded: [ENDED.at(-1).name, ENDED.at(-1).end],
}, null, 2));
console.log(`built ${N} traditions, ${fs.readdirSync(path.join(OUT, 't')).length} tradition pages, map ${MAP_W}x${MAP_H}`);
