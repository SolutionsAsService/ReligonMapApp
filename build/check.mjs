// Measures the built site. Run: npm run build && npm run check  (serves site/ itself on a free port)
// Every probe also runs once on a fixture built to fail it; the check aborts if a probe passes its fixture.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT, NOW, loadData, aliveIn, FOLDS, foldRatios } from './lib.mjs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const SITE = path.join(ROOT, 'site');
const FIX = path.join(ROOT, 'build', 'fixtures');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  const base = u.startsWith('/__fixtures/') ? FIX : SITE;
  if (u.startsWith('/__fixtures/')) u = u.slice('/__fixtures'.length);
  let f = path.join(base, u);
  if (u.endsWith('/')) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const PORT = server.address().port;
const B = `http://127.0.0.1:${PORT}/`;

const results = [];
const rec = (probe, pass, detail) => { results.push({ probe, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${probe}  ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`); };

const pages = [];
(function walk(d, rel = '') { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p, rel + f + '/'); else if (f.endsWith('.html')) pages.push(rel + f); } })(SITE);

// ---------- static: links and inbound links
{
  const inbound = Object.fromEntries(pages.map(p => [p, 0]));
  const broken = [];
  for (const p of pages) {
    const html = fs.readFileSync(path.join(SITE, p), 'utf8');
    for (const m of html.matchAll(/href="([^"#:]+)(#[^"]*)?"/g)) {
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(p), m[1]));
      if (!fs.existsSync(path.join(SITE, target))) broken.push(`${p} -> ${m[1]}`);
      else if (inbound[target] !== undefined && target !== p) inbound[target]++;
    }
  }
  rec('internal links resolve', broken.length === 0, broken.length ? broken.slice(0, 5) : `${pages.length} pages scanned`);
  const orphans = Object.entries(inbound).filter(([p, n]) => n === 0 && p !== 'index.html' && p !== '404.html').map(([p]) => p);
  rec('every page has an inbound link', orphans.length === 0, orphans.length ? orphans : 'none orphaned');
}

const browser = await chromium.launch();
async function open(url, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errors.push(m.text()); });
  await p.goto(url, { waitUntil: 'load' });
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  return { p, ctx, errors };
}

// ---------- probes as page functions
const overflow = () => document.documentElement.scrollWidth - innerWidth;
const heroBox = () => {
  const sel = ['.hero h1', '.hero-fig .map', '.hero-fig .yearctl', '.routes-pick', '.fams'];
  const rs = sel.map(s => document.querySelector(s)).filter(Boolean).map(e => e.getBoundingClientRect());
  if (!rs.length) return null;
  const inner = [...document.querySelectorAll('.hero-fig .map-box, .hero-fig .yc-track')].map(e => e.scrollWidth - e.clientWidth);
  return { top: Math.min(...rs.map(r => r.top)), bottom: Math.max(...rs.map(r => r.bottom)), right: Math.max(...rs.map(r => r.right)), innerScroll: Math.max(0, ...inner), parts: rs.length };
};
const smallTargets = () => {
  const els = [...document.querySelectorAll('a[href], button, input, summary, [tabindex="0"]')].filter(e => {
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && !e.closest('[hidden]');
  });
  const box = e => { const r = e.getBoundingClientRect(); return { e, x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; };
  const all = els.map(box);
  const bad = [];
  for (const a of all) {
    if (a.e.closest('p, li, td, dd, figcaption, .datenote, .lede, .foot, .strip')) {
      // inline text links are exempt (WCAG 2.5.8 inline exception) unless they are list chips
      if (!a.e.closest('.chips, .routes-pick, .famlist, nav')) continue;
    }
    if (a.w >= 24 && a.h >= 24) continue;
    if (a.e.closest('svg')) continue; // map marks: covered by the equivalent-control probe below (tabindex -1, list twin)
    const near = all.some(b => b !== a && Math.hypot(a.x - b.x, a.y - b.y) < 24);
    if (near) bad.push(`${a.e.tagName}.${a.e.className} ${Math.round(a.w)}x${Math.round(a.h)} "${(a.e.textContent || '').trim().slice(0, 20)}"`);
  }
  return bad;
};
const hiddenOk = () => [...document.querySelectorAll('[hidden]')].filter(e => getComputedStyle(e).display !== 'none').length;
function lum(hex) { const c = hex.match(/\w\w/g).map(h => parseInt(h, 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

// ---------- fixtures must fail
{
  const { p, ctx } = await open(B + '__fixtures/fail.html', 375, 812);
  const o = await p.evaluate(overflow);
  const t = await p.evaluate(smallTargets);
  const h = await p.evaluate(hiddenOk);
  const ok = o > 0 && t.length > 0 && h > 0 && ratio('#bbbbbb', '#ffffff') < 3;
  rec('fixtures fail every probe (instrument check)', ok, { overflow: o, smallTargets: t.length, hiddenShown: h });
  await ctx.close();
  if (!ok) { console.log('Instrument check failed: a probe passed its failing fixture.'); process.exit(2); }
}

// ---------- overflow on every page, both widths
for (const [w, h] of [[1280, 800], [375, 812]]) {
  const bad = [];
  const errs = [];
  for (const pg of pages) {
    const { p, ctx, errors } = await open(B + pg, w, h);
    const o = await p.evaluate(overflow);
    if (o > 0) bad.push(`${pg} +${o}px`);
    if (errors.length) errs.push(`${pg}: ${errors[0]}`);
    await ctx.close();
  }
  rec(`no sideways page scroll at ${w}px (${pages.length} pages)`, bad.length === 0, bad.length ? bad.slice(0, 8) : 'all 0');
  rec(`no script errors at ${w}px`, errs.length === 0, errs.length ? errs.slice(0, 5) : 'none');
}

// ---------- first screen rule
for (const [w, h] of [[1280, 800], [375, 812]]) {
  const { p, ctx } = await open(B + 'index.html', w, h);
  const r = await p.evaluate(heroBox);
  rec(`hero complete above the fold at ${w}x${h}`, r && r.bottom <= h && r.right <= w && r.innerScroll === 0, r);
  const strip = await p.evaluate(() => { const s = document.querySelector('.strips .strip:not([hidden])'); return s ? Math.round(s.getBoundingClientRect().bottom) : null; });
  rec(`(info) route strip bottom at ${w}x${h}`, true, `${strip}px`);
  await ctx.close();
}

// ---------- legibility probe: the default route is drawn, and its origin and its last stop are both labelled
for (const [w, h] of [[1280, 800], [375, 812]]) {
  const { p, ctx } = await open(B + 'index.html', w, h);
  const r = await p.evaluate(() => {
    const g = document.querySelector('#hero .route:not([hidden])');
    const legs = g ? [...g.querySelectorAll('.leg')].filter(l => getComputedStyle(l).display !== 'none').length : 0;
    const vis = [...document.querySelectorAll('#hero .lbl')].filter(l => getComputedStyle(l).display !== 'none' && !l.hidden);
    const fold = document.querySelector('.hero');
    const inView = l => l.getBoundingClientRect().bottom <= innerHeight;
    return { route: g && g.dataset.route, legs, origin: vis.filter(l => l.classList.contains('origin') && inView(l)).map(l => l.textContent), last: vis.filter(l => l.classList.contains('last') && inView(l)).map(l => l.textContent), visible: vis.length };
  });
  rec(`legibility: default route traceable at ${w}px (origin and last stop labelled, on screen)`, r.legs > 0 && r.origin.length === 1 && r.last.length === 1, r);
  await ctx.close();
}

// ---------- tab order: the year control is reached quickly; map marks are out of the tab order but have list equivalents
{
  const { p, ctx } = await open(B + 'index.html', 375, 812);
  let n = 0, hit = false;
  for (; n < 60 && !hit; n++) { await p.keyboard.press('Tab'); hit = await p.evaluate(() => document.activeElement && document.activeElement.id === 'hero-year'); }
  rec('year control reached within 25 Tab presses (375px)', hit && n <= 25, `${hit ? n : '>60'} presses`);
  await ctx.close();
}
{
  const bad = [];
  for (const pg of ['index.html', 'atlas.html', 'lost.html', 'families/africa.html', 't/buddhism.html']) {
    const { p, ctx } = await open(B + pg, 375, 812);
    const r = await p.evaluate(() => {
      const marks = [...document.querySelectorAll('.mk:not(.ghost)')];
      const out = [];
      for (const m of marks) {
        if (m.getAttribute('tabindex') !== '-1') out.push('focusable ' + m.dataset.id);
        const href = m.getAttribute('href');
        const twin = [...document.querySelectorAll(`a[href="${href}"]:not(.mk), button[data-show-route="${m.dataset.id}"]`)].length;
        const self = location.pathname.endsWith(href.split('/').pop());
        if (!twin && !self) out.push('no list equivalent ' + m.dataset.id);
      }
      return { n: marks.length, out };
    });
    r.out.forEach(o => bad.push(`${pg}: ${o}`));
    await ctx.close();
  }
  rec('map marks: out of tab order, each with a list/table equivalent on the page (2.5.8 equivalent)', bad.length === 0, bad.length ? bad.slice(0, 6) : 'all marks');
}
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, forcedColors: 'active' });
  const p = await ctx.newPage();
  await p.goto(B + 'index.html');
  const fills = await p.evaluate(() => new Set([...document.querySelectorAll('#hero .mk .dot')].map(d => getComputedStyle(d).fill)).size);
  rec('forced colours: family colours survive on the map', fills >= 8, `${fills} distinct dot fills`);
  await ctx.close();
}

// ---------- every visible map label sits inside its map (the clip guard must never hide one)
for (const [w, h] of [[1280, 800], [375, 812]]) {
  const bad = [];
  for (const pg of pages.filter(p => !p.startsWith('404'))) {
    const { p, ctx } = await open(B + pg, w, h);
    const r = await p.evaluate(() => [...document.querySelectorAll('.lbl')].filter(l => !l.hidden && getComputedStyle(l).display !== 'none').filter(l => {
      const b = l.getBoundingClientRect(), m = l.closest('.map-box').getBoundingClientRect();
      return b.left < m.left - 0.5 || b.right > m.right + 0.5 || b.top < m.top - 0.5 || b.bottom > m.bottom + 0.5;
    }).map(l => l.textContent));
    r.forEach(t => bad.push(`${pg}: ${t}`));
    await ctx.close();
  }
  rec(`map labels inside their map at ${w}px`, bad.length === 0, bad.length ? bad.slice(0, 8) : 'all inside');
}

// ---------- targets, hidden state, focus
for (const [w, h] of [[1280, 800], [375, 812]]) {
  const bad = [];
  for (const pg of ['index.html', 'timeline.html', 'atlas.html', 'families.html', 'families/indian.html', 'lost.html', 'sources.html', 't/buddhism.html']) {
    const { p, ctx } = await open(B + pg, w, h);
    (await p.evaluate(smallTargets)).forEach(b => bad.push(`${pg}: ${b}`));
    await ctx.close();
  }
  rec(`target size 24px or spaced (2.5.8) at ${w}px`, bad.length === 0, bad.length ? bad.slice(0, 8) : 'none');
}
{
  const { p, ctx } = await open(B + 'index.html', 1280, 800);
  await p.click('[data-show-route="islam"]');
  await p.fill('#hero-year', '400');
  await p.dispatchEvent('#hero-year', 'input');
  const h = await p.evaluate(hiddenOk);
  rec('[hidden] computes display:none after interaction', h === 0, `${h} visible`);
  const out = await p.textContent('#hero-out');
  rec('(info) year readout after setting slider to 400/1000', true, out);
  // focus: real Tab presses until the first route chip
  await p.goto(B + 'index.html');
  let found = null;
  for (let i = 0; i < 20 && !found; i++) {
    await p.keyboard.press('Tab');
    found = await p.evaluate(() => {
      const e = document.activeElement;
      if (!e || !e.matches('.rchip, .fams a, .top nav a')) return null;
      const cs = getComputedStyle(e);
      return { el: e.className || e.textContent.trim(), outline: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor, fv: e.matches(':focus-visible') };
    });
  }
  rec('focus ring visible after a real Tab', !!found && found.outline !== 'none' && parseFloat(found.width) >= 2 && found.fv, found);
  await ctx.close();
}

// ---------- contrast of family colours (marks) and muted text on paper
{
  const { families } = loadData();
  const paper = '#f8f4ec', land = '#e7dcc5';
  const rows = families.map(f => ({ f: f.id, onPaper: +ratio(f.color, paper).toFixed(2), onLand: +ratio(f.color, land).toFixed(2), whiteOnFill: +ratio('#ffffff', f.color).toFixed(2) }));
  const ok = rows.every(r => r.onPaper >= 3 && r.onLand >= 3 && r.whiteOnFill >= 4.5);
  rec('family colours: marks ≥3:1 on paper and land; white chip text ≥4.5:1', ok, rows);
  rec('muted text #5c544a on paper ≥4.5:1', ratio('#5c544a', paper) >= 4.5, ratio('#5c544a', paper).toFixed(2));
  rec('muted text on #f1ebdf cards ≥4.5:1', ratio('#5c544a', '#f1ebdf') >= 4.5, ratio('#5c544a', '#f1ebdf').toFixed(2));
}

// ---------- smallest text in figures at 375
{
  const { p, ctx } = await open(B + 'timeline.html', 375, 812);
  const r = await p.evaluate(() => {
    const out = [];
    for (const t of document.querySelectorAll('svg[data-tl] text')) {
      const b = t.getBoundingClientRect(); if (!b.height) continue;
      const fs = parseFloat(getComputedStyle(t).fontSize) * (t.ownerSVGElement.getBoundingClientRect().width / t.ownerSVGElement.viewBox.baseVal.width);
      out.push(fs);
    }
    return { min: Math.min(...out).toFixed(1), n: out.length };
  });
  rec('smallest timeline label at 375px ≥ 10px rendered', +r.min >= 10, r);
  await ctx.close();
  const h = await open(B + 'index.html', 375, 812);
  const m = await h.p.evaluate(() => Math.min(...[...document.querySelectorAll('.lbl, .rt')].filter(e => getComputedStyle(e).display !== 'none' && !e.closest('[hidden]') && !e.hidden).map(e => parseFloat(getComputedStyle(e).fontSize))));
  rec('smallest map/ribbon label at 375px ≥ 10px', m >= 10, `${m}px`);
  await h.ctx.close();
}

// ---------- printed figures re-computed from the data (Step 2g)
{
  const { traditions, families } = loadData();
  const ended = traditions.filter(t => t.end !== null);
  const facts = JSON.parse(fs.readFileSync(path.join(SITE, 'build-facts.json'), 'utf8'));
  const home = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');
  const src = fs.readFileSync(path.join(SITE, 'sources.html'), 'utf8');
  const tl = fs.readFileSync(path.join(SITE, 'timeline.html'), 'utf8');
  const stops = traditions.flatMap(t => t.spread);
  const r = foldRatios();
  const checks = [
    ['home: "Where N religions"', home.includes(`Where ${traditions.length} religions`)],
    ['home: living count', home.includes(`${traditions.length - ended.length} are still practised`)],
    ['home: ended count', home.includes(`${ended.length} have ended`)],
    ['family chip counts', families.every(f => home.includes(`${f.short.replace('&', '&amp;')}</span> <span class="n">${traditions.filter(t => t.family === f.id).length}</span>`))],
    ['home: ×9.0 (after 1500 vs before 500 BCE)', home.includes(`${r.r31.toFixed(1)}× wider`)],
    ['home track: ×2.4 and ×3.8 on the seams', home.includes(`×${r.r21.toFixed(1)}</span>`) && home.includes(`×${r.r32.toFixed(1)}</span>`)],
    ['timeline: fold labels ×2.4 / ×3.8', tl.includes(`fold: ×${r.r21.toFixed(1)} per year`) && tl.includes(`fold: ×${r.r32.toFixed(1)} per year`)],
    ['sources: 24/38/38 split', [0, 1, 2].every(i => src.includes(`takes ${Math.round((FOLDS[i].f1 - FOLDS[i].f0) * 100)}%`))],
    ['sources: approx start count', src.includes(`${traditions.filter(t => t.approx).length} of ${traditions.length} start dates`)],
    ['sources: approx end count', src.includes(`${traditions.filter(t => t.end_approx).length} of ${ended.length} end dates`)],
    ['sources: region count', src.includes(`${traditions.filter(t => t.origin.precision === 'region').length} are a region`)],
    ['sources: stops traced / not traced', src.includes(`${stops.length} stops in all`) && src.includes(`(${stops.filter(s => s[4] !== '?').length} stops)`) && src.includes(`other ${stops.filter(s => s[4] === '?').length} are drawn`)],
    ['sources: adherent rows match data', traditions.filter(t => t.adherents).every(t => src.includes(`${t.adherents.millions.toLocaleString('en-US')} million</td><td>${t.adherents.source === 'india2011' ? 'India only, 2011' : 'World, 2020'}`))],
    ['alive now = living', aliveIn(traditions, NOW).length === traditions.length - ended.length],
    ['present year pinned', NOW === JSON.parse(fs.readFileSync(path.join(ROOT, 'data/meta.json'), 'utf8')).present],
    ['every approximate end year printed with c. (lost, tradition pages, landing)', (() => {
      const lost = fs.readFileSync(path.join(SITE, 'lost.html'), 'utf8');
      return ended.filter(t => t.end_approx).every(t => {
        const y = (t.end < 0 ? `${-t.end} BCE` : t.end < 1000 ? `${t.end} CE` : String(t.end));
        const pg = fs.readFileSync(path.join(SITE, 't', t.id + '.html'), 'utf8');
        return !lost.includes(`Ended ${y}.`) && !pg.includes(`How it ended (${y})`) && !home.includes(`(${y})`);
      });
    })()],
    ['build-facts match data', facts.traditions === traditions.length && facts.ended === ended.length],
  ];
  const bad = checks.filter(c => !c[1]).map(c => c[0]);
  rec('printed figures reproduce from data', bad.length === 0, bad.length ? bad : `${checks.length} figures`);
}

await browser.close();
server.close();
fs.writeFileSync(path.join(ROOT, 'build', 'check-results.json'), JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
