# R0, Critic: Evidence (Cairo)

- **Anchor used:** *How Charts Lie* (Cairo). Know the source, and distrust precision the data can't support.
- **Observed:** script.js, both JSON files, README.md, old-full.png and old-phone.png. I re-counted the rects with python3: 48, which matches the evidence.

**Findings**
- F1 [defect] dead-religons.json:81-82 has `"start": 1st century`, which is invalid JSON. The evidence misses this.
- F2 [defect] script.js:46 sets `y=i*bandwidth/3`, so 11 Christianity bars draw into other religions' rows (old-full.png). Data is attributed to the wrong tradition.
- F3 [claim] README says "Responsive design". FALSE: script.js:2-3 fixes the chart at 1000x800, and the phone scrolls 644 px sideways.
- F4 [claim] The title and README say "Relationships". FALSE: no lineage is drawn.
- F5 [premise] The dates are falsely precise. Judaism and Orthodox Judaism are both -2000. Hindu sects are -1500, the same year as Hinduism. Catholicism and Orthodox are 1054, the schism year. Christianity's start is 0, a year that does not exist. Every end is 2025. No record cites a source or marks uncertainty.
- F6 [defect] The domain is [-2000,2025] (script.js:12), so Sumerian (-3500) and Egyptian (-3150) would be clipped.
- F7 [defect] Parent and child differ by colour only, and denominations are unlabelled.
- F8 [premise] The map has no data. There are no coordinates anywhere, only vague `origin` names, and religions.json has none.

**Verdict: OBJECT**

**Requested change**
- F1: Use numeric years and an approximate flag.
- F2: Stack each denomination inside its parent's band.
- F3, F4: Make the claims true or delete them.
- F5: Add a `source` and `approx` field per record, show "present" as an open end, and fix the 1054 dates.
- F6: Take the domain from the data extent.
- F7: Add labels and encode with more than colour.
- F8: Add cited coordinates per record and show their precision.
