// The Religion Map: small runtime. Every figure is pre-rendered; this only moves the year and shows routes.
(() => {
  const FOLDS = [{"from":-3500,"to":-500,"f0":0,"f1":0.24,"labels":[-3000,-2000,-500]},{"from":-500,"to":1500,"f0":0.24,"f1":0.62,"labels":[0,500,1000,1500]},{"from":1500,"to":2026,"f0":0.62,"f1":1,"labels":[1600,1700,1800,1900,2000]}];
  const NOW = 2026;
  const fold = y => {
    const s = FOLDS.find(s => y <= s.to) || FOLDS[FOLDS.length - 1];
    return s.f0 + (s.f1 - s.f0) * (y - s.from) / (s.to - s.from);
  };
  const unfold = f => {
    const s = FOLDS.find(s => f <= s.f1) || FOLDS[FOLDS.length - 1];
    return Math.round(s.from + (s.to - s.from) * (f - s.f0) / (s.f1 - s.f0));
  };
  const yr = y => y < 0 ? `${-y} BCE` : y < 1000 ? `${y || 1} CE` : String(y);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  // ---- year on a map
  function setMapYear(map, year) {
    let alive = 0, total = 0;
    $$('.mk', map).forEach(m => {
      const s = +m.dataset.s, e = m.dataset.e === '' ? null : +m.dataset.e;
      const born = s <= year, gone = e !== null && e < year;
      m.classList.toggle('unborn', !born);
      m.classList.toggle('gone', born && gone);
      if (born && !gone && !m.classList.contains('famoff')) alive++;
      if (!m.classList.contains('famoff')) total++;
    });
    $$('[data-y]', map).forEach(el => el.classList.toggle('future', +el.dataset.y > year));
    return { alive, total };
  }
  function setStripYear(scope, year) {
    $$('.strip li[data-y]', scope).forEach(li => li.classList.toggle('future', +li.dataset.y > year));
  }
  function setTimelineYear(year) {
    $$('svg[data-tl]').forEach(svg => {
      const l = +svg.dataset.l, r = +svg.dataset.r;
      const c = svg.querySelector('.cursor');
      const x = (l + fold(year) * (r - l)).toFixed(1);
      c.setAttribute('x1', x); c.setAttribute('x2', x); c.removeAttribute('hidden');
      $$('.row', svg).forEach(r => {
        const s = +r.dataset.s, e = r.dataset.e === '' ? null : +r.dataset.e;
        r.classList.toggle('dim', !(s <= year && (e === null || e >= year)));
      });
    });
  }

  $$('[data-yearctl]').forEach(ctl => {
    const input = ctl.querySelector('input[type=range]');
    const out = ctl.querySelector('output');
    const scope = ctl.closest('section, .atlas, main') || document;
    const maps = $$('[data-map]', scope);
    const isTl = ctl.dataset.yearctl === 'tl';
    const apply = () => {
      const year = Math.min(NOW, unfold(+input.value / 1000));
      let txt = yr(year);
      if (maps.length) {
        const { alive, total } = setMapYear(maps[0], year);
        maps.slice(1).forEach(m => setMapYear(m, year));
        txt += ` · ${alive} of ${total} alive`;
      }
      setStripYear(scope, year);
      if (isTl && touched) {
        setTimelineYear(year);
        const n = $$('svg[data-tl] .row').filter(r => !r.classList.contains('dim')).length;
        txt += ` · ${n} alive`;
      }
      out.textContent = txt;
      input.setAttribute('aria-valuetext', txt);
    };
    let touched = !isTl;
    input.addEventListener('input', () => { touched = true; apply(); });
    if (isTl) { out.textContent = 'drag to place a year line'; } else apply();
  });

  // ---- route pickers (one route at a time per page)
  const pickers = $$('[data-show-route]');
  function showRoute(id) {
    pickers.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.showRoute === id)));
    $$('[data-map]:not(.solo):not(.famall) [data-route], .strips [data-route]').forEach(el => el.toggleAttribute('hidden', el.dataset.route !== id));
    $$('[data-map] .mk').forEach(m => m.classList.toggle('picked', m.dataset.id === id));
  }
  pickers.forEach(b => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') === 'true';
    showRoute(on && b.classList.contains('tbtn') ? null : b.dataset.showRoute);
  }));
  const first = pickers.find(b => b.getAttribute('aria-pressed') === 'true');
  if (first) showRoute(first.dataset.showRoute);

  // pages with one route, or a family's routes: show them all
  $$('[data-map].solo [data-route], [data-map].famall .route').forEach(el => el.removeAttribute('hidden'));

  // ---- atlas family filters
  $$('[data-fam-toggle]').forEach(cb => cb.addEventListener('change', () => {
    const f = cb.dataset.famToggle;
    $$(`.mk[data-f="${f}"]`).forEach(m => m.classList.toggle('famoff', !cb.checked));
    // hide the family's buttons and, if its route is showing, the route
    cb.closest('li').querySelectorAll('ul .tbtn').forEach(b => b.closest('li').classList.toggle('famoff-li', !cb.checked));
    const on = pickers.find(b => b.getAttribute('aria-pressed') === 'true');
    const fm = on && document.querySelector(`.mk[data-id="${on.dataset.showRoute}"]`);
    if (!cb.checked && fm && fm.dataset.f === f) showRoute(null);
    const ctl = document.querySelector('[data-yearctl] input');
    if (ctl) ctl.dispatchEvent(new Event('input'));
  }));
})();

// On narrow screens, open each scrolling lineage chart at its earliest row rather than at 3500 BCE.
(() => {
  const FOLDS = [{"from":-3500,"to":-500,"f0":0,"f1":0.24,"labels":[-3000,-2000,-500]},{"from":-500,"to":1500,"f0":0.24,"f1":0.62,"labels":[0,500,1000,1500]},{"from":1500,"to":2026,"f0":0.62,"f1":1,"labels":[1600,1700,1800,1900,2000]}];
  const fold = y => { const s = FOLDS.find(s => y <= s.to) || FOLDS[FOLDS.length - 1]; return s.f0 + (s.f1 - s.f0) * (y - s.from) / (s.to - s.from); };
  document.querySelectorAll('.tl-scroll').forEach(box => {
    const svg = box.querySelector('svg[data-tl]');
    if (!svg || box.scrollWidth <= box.clientWidth) return;
    const starts = [...svg.querySelectorAll('.row')].map(r => +r.dataset.s);
    const first = Math.min(...starts);
    const vb = svg.viewBox.baseVal.width, l = +svg.dataset.l, r = +svg.dataset.r;
    const px = (l + fold(first) * (r - l)) * (svg.getBoundingClientRect().width / vb);
    box.scrollLeft = Math.max(0, px - 60);
  });
})();
