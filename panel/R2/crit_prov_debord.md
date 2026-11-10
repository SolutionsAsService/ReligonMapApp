# Critic: Provocateur (Debord), R2

- **Anchor used:** The Society of the Spectacle, thesis 4: the spectacle is a social relation mediated by images. A drawn leg or printed year asserts a relation, and the data must back it.
- **Observed:** I recomputed the figures from data/traditions.json: 91; 72/19; 60 and 11/19 approximate; 34 regions; 196 = 153 traced + 43 untraced; 91 date_notes; ×2.4/3.8/9.0; present = 2026. All hold. Every `from` resolves to an earlier place on the same route. The strip, the route tables and the map (home-desk.png) agree.
- **Andon (R1 F1): RESOLVED.** No leg is drawn without a recorded origin, and Sources states this exactly.
- **Findings:**
  - F1 [defect] R1 F3 is only half kept. lost.html prints "c. 3500 BCE – c. 2000 BCE", then "Ended 2000 BCE." (build.mjs:419). t/sumerian prints "How it ended (2000 BCE)" (:485). The landing Lost door prints "(2000 BCE)" (:337). All 11 end_approx traditions are affected, and under the footer rule each reads as exact.
  - F2 [claim] Stop years carry no approx flag. "Nippur 2900 BCE" and "Luoyang 68 CE" (a legend) print as exact. 50 of the 196 are round hundreds.
  - F3 [claim] Distances are given to the km from region centroids ("Trinidad … Ganges plain 14,467 km"). 46 traced legs start at a region origin.
  - F4 [claim] "Every dot is a birthplace", but the route stops are marks on the same map.
  - F5 [premise] "Cebu from Rome" is recorded, so it passes. It is a church lineage drawn as a 10,000 km path, though.
- **Verdict:** OBJECT (F1 only; F2–F5 are advisory)
- **Requested change:** F1: print `end_approx ? 'c. '` at build.mjs:337/419/485, and add a check. F2: add a stop approx flag, or a note that stop years are often approximate. F3: round region-origin distances ("c. 14,500 km"). F4: "Every dot is a birthplace; a route adds its dated stops." F5: none.
