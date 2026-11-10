# Critic: Evidence (Tufte), R0

**Anchor used:** *Visual Display of Quantitative Information*: graphical integrity (lie factor, label each mark where it sits) and data-ink.

**Observed:** Recomputed from script.js and religions.json: 0.219 px per year, a 68.5 px row step, 20.5 px child bars, and 11 parent plus 37 child bars.

**Findings:**
- F1 [defect] Christianity's 14 children stack to 287 px, or 4.2 rows. They overprint Islam, Judaism and Hinduism, and also 13 px of Buddhism, which the evidence omits. Row no longer means religion.
- F2 [defect] 37 of 48 bars (77%) have no label. Only hover identifies them, so touch screens cannot.
- F3 [defect] Children cover their parent bar, 100% of it for Hinduism. Colour is the only thing that separates parent from child.
- F4 [claim] The domain starts at -2000, Judaism's stated start, so that bar is cut by the frame and looks like it begins there.
- F5 [claim] Every living tradition ends at a hard-coded 2025. Starts such as 1469 and -2000 are disputed but drawn as exact lengths.
- F6 [defect] On a phone 644 of 1019 px (63%) is off-screen, and only 3 of 11 rows show any ink.
- F7 [premise] The 12 dead religions (20% of the 60 entities) are never drawn, and there are no map coordinates.

**Verdict:** OBJECT

**Requested changes:**
- F1, F2: use one strip per tradition (small multiples), label bars directly, and size rows to their number of children.
- F3: show parent and child by indentation or line weight.
- F4: start the domain at the earliest date in the data.
- F5: fade uncertain starts and leave ongoing traditions open-ended instead of ending them at 2025.
- F6: make the width fluid.
- F7: draw the dead religions, and add sourced coordinates.
