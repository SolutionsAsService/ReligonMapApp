# Critic: Provocateur (Debord), R1

- **Anchor used:** The Society of the Spectacle, thesis 4: the spectacle is a social relation mediated by images. A drawn leg asserts a relation, and the data must back it.
- **Observed:** I recomputed every number on the landing, Sources and Lost pages from data/traditions.json, and all of them hold (91, 72/19, family counts, 60 approximate, 57+34, 69/196, 9.0×, 7 adherent rows). All 91 traditions have a date_note. The five corrections match the data. The verbs fail.
- **Findings:**
  - F1 [claim] Sources says each leg is drawn "from the place it came from". But 156 of the 196 stops have no `from`, and lib.mjs:114 draws those from the origin instead. The home map asserts Bodh Gaya→Lhasa and Bodh Gaya→Borobudur, and the strip's arrows (Asuka → Lhasa) imply another lineage again.
  - F2 [claim] The landing promises "Where each date and number comes from". Sources names no source for any date, only "standard reference histories".
  - F3 [claim] End years print without "c." (Ājīvika 1400 "faded away", Celtic 600). There is no end-approx flag, so the footer rule makes them read as exact.
  - F4 [claim] Lost says "Several have modern revivals". Only Heathenry backs this, and Lost does not link to it.
  - F5 [claim] Atlas offers "every dated route, filterable by family". The family checkboxes toggle dots only, not routes.
  - F6 [premise] Sources calls the Census of India 2011 (India only) a "recent figure" and sets it beside world totals.
- **Verdict:** OBJECT
- **Requested change:** F1: draw a leg only where the data has `from`, and make the strip match the map. F2: cite date sources, or say "how each date was reasoned". F3: add an end-approx flag and print "c.". F4: say "One (Heathenry)" and link it. F5: filter routes too, or reword. F6: drop "recent" and give India-only counts their own column.
