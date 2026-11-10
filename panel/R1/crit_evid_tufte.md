# R1 · Critic: Evidence (Tufte)

**Anchor used:** *Visual Display of Quantitative Information*: graphical integrity (lie factor = effect shown / effect in data).

**Observed:** lib.mjs `fold()`/FOLDS; build.mjs `timelineSvg`, `ribbonSvg`, `spanBar`; build-facts.json; timeline-top-desk.png. Figures recomputed with lib.mjs.

**Findings**
- F1 [claim] Every mark, gridline, seam, ribbon point, tick, slider value and span bar is placed by `fold()`, which is continuous at both seams. The widths (24/38/38%) and ratios (×2.4, ×3.8, ×9.0) are correct. The ribbon starts from zero.
- F2 [defect] The grid hides the fold. Gridlines every 500/100/50 years land 47.6/22.6/43.0 px apart, almost even, while the scale changes ninefold. The note that the gridlines "show the same change" is false.
- F3 [defect] The ribbon is a filled area on the folded axis. The three stretches hold 11.7/58.8/29.5% of tradition-years but take 2.8/33.4/63.7% of its area. Lie factor: 2.2 for the modern stretch, 0.24 for the ancient one.
- F4 [premise] Lifeline lengths across a fold mislead: 11.5% of pairs are inverted. Vedic religion (1000 years) is drawn 95 px; Ahmadiyya (137 years) is drawn 118 px. Lie factor 9.0. The page discloses this, so it is acceptable.
- F5 [defect] The axis labels "1000 BCE" and "500 BCE" collide. The end label "500 BCE" on Vedic religion runs into the Hinduism row.
- F6 [defect] The ribbon's ticks are hand-picked, not taken from FOLDS.

**Verdict:** OBJECT

**Requested change**
- F1: none.
- F2: Use one gridline interval (100 years) everywhere, so the lines land 9.5/22.6/86 px apart, and fix the note.
- F3: Draw the count as a line with no fill.
- F4: Print each tradition's duration in years in its row title and in the table.
- F5: Drop the 1000 BCE label and move end-year text clear of the seam.
- F6: Derive the ribbon ticks from FOLDS.
