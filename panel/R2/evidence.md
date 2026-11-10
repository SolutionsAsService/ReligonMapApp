# R2 evidence: WHOLE round after the R1 resolutions (moves M11–M15)

Artifact: /home/user/religonmapapp. The source is data/*.json, build/*.mjs and src/*. The built site is in site/ (106 pages). A copy is served at http://localhost:8812/ when that server is running.

Screenshots are in panel/R2/ (open them with Read):
- home-desk.png and home-phone.png: first screens at 1280x800 and 375x812.
- timeline-top-desk.png.
- Full pages at both widths: timeline, atlas, families/africa, t/buddhism, t/candomble, t/hinduism, sources.
- lost-top-desk.png and lost_html-phone.png.
- cand-phone.png: the full Candomblé page at 375.

Measurement: `npm run check` (build/check.mjs) was run after the last edit, with 29/29 PASS. The output is in panel/R2/check-results.json.
- Correction to R1 evidence: R1 said 8 labels were visible at 1280 and 5 at 375. The real counts were 7 and 4. Cairo and Krug were right.
- First screen at 1280x800: the hero union (h1, map, year control, route chips, family chips) runs from 74 to 639. Inner scroll is 0.
- First screen at 375x812: the hero union runs from 85 to 710. The route strip ends at 997, below the fold. The fold note sits under the family chips on phone.
- Legibility: the default Buddhism route has 7 drawn legs. Its two stops with no recorded path (Lhasa, Borobudur) show as dots only. The origin label "Bodh Gaya · c. 450 BCE" and the last label "Hohhot 1578" are both visible on screen at both widths. Visible labels: 7 at 1280, 4 at 375.
- Tab order at 375: the year control is reached after 23 Tab presses (R1: 114). Map marks have tabindex=-1, and every mark has a list or table link to the same page on that page; this was checked on 5 pages.
- Forced colours: the hero dots keep 8 distinct fills (R1: 1).
- Other probes all pass:
  - no sideways scroll on any of the 106 pages at either width
  - labels stay inside their maps
  - targets, [hidden], focus ring and contrast (same values as R1)
  - smallest timeline label 10.5 px; map labels 11 px
- 16 printed figures are re-derived from the data:
  - the ratios ×2.4, ×3.8 and ×9.0 on the home track and the timeline
  - the 24/38/38 split
  - the approximate start and end counts (60/91 and 11/19)
  - region origins 34
  - stops: 196, of which 153 are traced and 43 untraced
  - the adherent rows with their coverage
  - the present year, pinned at 2026 in data/meta.json
- Not covered by a failing fixture yet: the tab-order, mark-equivalent, forced-colour and legibility probes. The fixture covers overflow, targets and [hidden] only.

What changed since R1:
- M11:
  - Every spread stop names where it came from (153), or "?" when the path is not traced (43). A line is drawn only for the 153.
  - The strip now starts "Buddhism route: born at Bodh Gaya…" and lists each stop with "from X" or "path not traced". There are no arrows.
  - The map key has a new item, "reached; path not traced".
- M12:
  - `end_approx` puts "c." on 11 approximate end dates.
  - The present year is pinned in data/meta.json.
  - Sources: "how each date was reasoned"; a Coverage column ("World, 2020" or "India only, 2011"); and "recent" is gone.
  - Lost: "One has a modern revival … Heathenry", linked.
  - Tradition pages say "in India (2011)" or "worldwide (2020)".
  - The legibility probe now asserts the origin and last labels. The figure probe is extended.
- M13:
  - One gridline every 100 years in all stretches. Measured in chart units, the lines are 9.5, 22.6 and 86 apart.
  - The fold labels ("fold: ×2.4 per year") sit in a header band above the first row.
  - End years print above the line.
  - The alive count is a line, not a filled area.
  - Ribbon ticks come from the FOLDS boundaries.
  - Durations appear in row titles, the table ("Years") and the tradition facts.
- M14 (BREAK):
  - The home and every year track now show zigzag seams with ×2.4 and ×3.8 printed on them.
  - Above the track sits a thin true-scale line of the same 5,526 years. Dashed connectors join where 500 BCE and 1500 fall in real time (54% and 90%) to where the folded slider puts them (24% and 62%).
  - The note is "The line counts how many of the 91 traditions listed here…".
- M15:
  - Map marks are out of the tab order.
  - The home page has an "All 91 traditions, A to Z" list.
  - On phone, the nav and route chips wrap, with short labels ("Lost"; family short names). Full names are kept in aria-label.
  - `forced-color-adjust: none` on the figures.
  - Glosses added for orixás and terreiros.
  - The atlas family filter also hides that family's buttons and its open route.
- Overruled: Shklovsky (Provocateur) F3, to merge the family chips into the ribbon. The Landing rule needs a link and figure per topic.
