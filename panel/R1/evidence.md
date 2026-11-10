# R1 evidence: WHOLE round on the redesigned site (after moves M1–M10)

Artifact: /home/user/religonmapapp
- source: data/*.json, build/build.mjs, build/lib.mjs, src/style.css, src/app.js
- built site: site/ (106 HTML pages)
- served for you at http://localhost:8812/ (if reachable); otherwise open the files.

Screenshots in panel/R1/ (open them with the Read tool):
- home-desk.png (1280x800 first screen), home-phone.png (375x812 first screen)
- full pages at 1280 (`*-desk.png`) and 375 (`*-phone.png`): timeline (timeline-top-desk.png is its top 1500 px), atlas, families, families/africa, t/buddhism, t/candomble, lost (lost-top-desk.png), sources

Measurements: `build/check.mjs` (run `npm run check` from the repo root; it serves site/ itself). It was run after the last edit, and its output is panel/R1/check-results.json: 26/26 PASS.

| Probe | Result |
|---|---|
| Instrument check (`build/fixtures/fail.html`) | The fixture fails every probe: overflow 533 px, 3 small targets, 1 visible [hidden] element. |
| Sideways scroll | None at 1280 or 375 on any of the 106 pages. |
| Hero union (h1, map, year control, route chips, family chips) at 1280x800 | top 74, bottom 639, right 1242, inner scroll 0. |
| Hero union at 375x812 | bottom 690. The route strip under it ends at 849 at 375 (below the fold) and at 711 at 1280. |
| Legibility | The default route (Buddhism) is drawn with 9 legs. Labels visible at 1280: 8. At 375: 5 (Bodh Gaya, Anuradhapura, Borobudur, Bagan, Hohhot). |
| Map labels | Every visible label is inside its map box on every page, at both widths. |
| Target size | No target under 24 px with a neighbour within 24 px, on 8 sample pages, at both widths. Inline text links are exempt. |
| Focus | After a real Tab, the ring is a 3px solid outline in #1f1b16 and matches :focus-visible. |
| [hidden] | All compute display:none after the route and year interactions. |
| Contrast of family colours | Every family colour is at least 3:1 on paper and on land; white chip text is at least 4.5:1. The lowest is Iranian on land at 3.72. Muted text is 6.78 on paper. |
| Smallest timeline label at 375 | 10.5 px. The chart has min-width 1100 and scrolls inside its own box; the page itself does not scroll. |
| Smallest map or ribbon label at 375 | 11 px. |
| Printed figures | Recomputed from the data: 91 traditions, 72 living, 19 ended, the family counts, "9.0× wider", 60 approximate, 34 region. |

Facts in the data (site/build-facts.json):
- 91 traditions in 8 families; 72 living and 19 ended
- 60 approximate start dates; 34 region-precision origins
- 69 traditions have dated routes, with 196 stops in total
- the folds: 3500 BCE–500 BCE takes 24% of the width, 500 BCE–1500 takes 38%, and 1500–2026 takes 38%
- per-year width ratios: ×2.4 (middle vs first), ×3.8 (last vs middle) and ×9.0 (last vs first)

Adherent counts appear for 7 traditions only:
- Pew 2020: Christianity 2,300M, Islam 2,000M, Hinduism 1,200M, Buddhism 324M, Judaism 14.8M
- Census of India 2011, India only: Sikhism 20.8M, Jainism 4.45M

What changed since R0 (moves, see DESIGN-LOG.md):
- M1: one data file with numeric years, an approx flag and a date note, origin coordinates with a precision, dated routes and parent links. The two old JSON files are deleted.
- M2: multi-page. Home, Timeline, Atlas, Families plus 8 family pages, 91 tradition pages, Lost religions, Sources, 404.
- M3: the folded time axis with zigzag seams and printed ratios. One row per tradition, branches dropping from the parent row; revivals are dashed.
- M4: the light Equal Earth map, pre-rendered SVG with no runtime library. The page JS (about 5 KB) toggles year and route only.
- M5: the landing. The map with all birthplaces, one featured route (Buddhism, with 5 more on chips), a year slider whose track is the alive-count ribbon, and 8 family chips with counts.
- M6: access. Every mark is a link with a title, every figure has a list or table, the year control is a native range, and reduced motion is honoured.
- M7: the old index.html, script.js, style.css and both JSON files are deleted.
- M8: endings drawn as a heavy cap with the end year; the Lost religions page lists the causes in words.
- M9: the tradition and family maps are fitted to their own region.
- M10: a dashed "born from" arc from the parent's birthplace to the child's, on the family and tradition maps.

Known and unresolved, for your judgement:
- On the phone the route strip (the text list of stops) is below the fold.
- The phone nav scrolls sideways inside its own row; "Sources" is cut at 375.
- The timeline is long (3279 px at 1280).
