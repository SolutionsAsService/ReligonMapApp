# Critic: Evidence (Cairo), R1

- Anchor used: *How Charts Lie* (Cairo). A chart lies through false precision, scale and omission. Every number must be one a reader can reproduce.
- Observed: I ran `npm run check` myself: 26/26 PASS. I recomputed the figures from data/traditions.json: 91 traditions, 72 living, 19 ended, 60 approximate, 34 region-precision, 69 routed, 196 stops. The family counts and the living/ended splits on families.html are correct. The fold ratios are 2.375, 3.802 and 9.030 (build/lib.mjs:52-63), printed as 2.4×, 3.8× and 9.0×. The seven adherent figures in the data match the Sources table and the tradition pages. The ribbon baseline is zero (build/build.mjs:202).

Findings:
- F1 [claim] The evidence is wrong about the legibility probe. My run and panel/R1/check-results.json both give 7 labels at 1280 (evidence: 8) and 4 at 375 (evidence: 5). Bagan is not visible at 375.
- F2 [defect] The probe's comment says "origin + last stop are labelled" (check.mjs:134). The code only tests `labels.length >= 2` (check.mjs:143). At 375 only 4 of the route's 10 places are labelled.
- F3 [defect] False precision on end dates. `span()` puts "c." on the start only (lib.mjs:44-47). So "c. 3500 BCE – 2000 BCE", Celtic "600 CE" and Germanic "1100" print as exact years, and lost.html repeats "Sumerian religion (2000 BCE)".
- F4 [premise] The ribbon peaks today (aliveMax = aliveNow = 72, build-facts.json). That reflects how the catalogue was chosen: 36 Abrahamic entries, mostly modern branches. History did not necessarily peak now. The note "counts traditions alive in each year" (build.mjs:216) does not say "of the 91 listed here".
- F5 [claim] "Only these have a recent figure": the India 2011 census is 15 years old and covers India only. On t/sikhism.html it sits under "Followers" next to world totals.
- F6 [defect] `NOW = getUTCFullYear()` (lib.mjs:8). A rebuild in 2027 changes the axis, the ratios and the "2026" text, so the build cannot be reproduced.
- F7 [claim] The printed-figures probe (check.mjs:236-246) never tests the 2.4× and 3.8× ratios, the 24/38/38% split or the adherent figures. "Printed figures recomputed" overstates its coverage.

Verdict: OBJECT

Requested change:
- F1: correct the evidence to 7 and 4.
- F2: assert that the origin and the last stop are among the visible labels.
- F3: add an `end_approx` flag and print "c." on ends.
- F4: say "of the 91 listed".
- F5: label the column "India only", or drop the word "recent".
- F6: pin the built year in the data.
- F7: extend the probe to the remaining printed figures.
