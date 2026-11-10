# R2 · Critic: Evidence (Tufte)

**Anchor used:** *Visual Display of Quantitative Information*: graphical integrity (lie factor), and aligned scales the eye can read down.

**Observed:** lib.mjs FOLDS/fold/GRID; build.mjs ribbonSvg, timelineSvg, spanBar; site/timeline.html; screenshots for timeline-top, home and timeline at both widths. Figures recomputed with lib.mjs.

**R1 status:** F1 holds (2.375, 3.802, 9.03). F2 resolved: lines are 9.5/22.6/86.0 units apart, as the note says. F3 resolved: a line on a zero baseline. F4 resolved: the "Years" figures are correct. F5 partly resolved; F6 mostly.

**Findings**
- F1 [claim] Seams, ratios and the key's ticks (LIN 54.3% and 90.5%, joined to fold()) all come from the scale. The folded axis is honest.
- F2 [defect] End years now collide with names. "c. 500 BCE" is overprinted by "Historical Vedic religion" (end text at x 293, name from 199) on the seam. "1521" is overprinted by "Mexica (Aztec) religion" (end text at 763, name from 707).
- F3 [defect] On timeline.html the ribbon and the timeline are out of register. The 500 BCE seam is at 330 vs 310 px, 1500 at 782 vs 742, and now at 1232 vs about 1180.
- F4 [defect] On phone, ".rt.m-x" hides "500 BCE", so the ×2.4 seam has no year. The ribbon tick "1000" is still hand-picked.
- F5 [claim] The fold note hard-codes 1190 (R−L), so it is true only while W=1200.
- F6 [premise] The ribbon's slope flattens 9× after 1500. The seams disclose this, so it is acceptable.

**Verdict:** OBJECT

**Requested change**
- F1, F6: none.
- F2: When the name overlaps x1, move the end year after the name or below the line.
- F3: Give the ribbon the timeline's plot insets, so both share x.
- F4: Keep the seam years at every width, take the ticks only from FOLDS, and drop "1000".
- F5: Compute the note from R−L.
