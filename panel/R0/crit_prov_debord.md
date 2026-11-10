# Critic: Provocateur (Debord), round R0

- **Anchor used:** The Society of the Spectacle, thesis 1 (all that was lived has moved away into a representation) and thesis 4 (a social relation mediated by images).
- **Observed:** index.html title; README "Features"; script.js child y = i*bandwidth/3; religions.json; dead-religons.json; old-desk.png, old-phone.png; evidence.md.
- **Findings:**
  - F1 [claim] Title says "Relationships"; no edge or lineage is drawn, children are unlabelled.
  - F2 [claim] README promises "Responsive design"; SVG is fixed 1000 px, phone scrolls 644 px sideways (old-phone.png).
  - F3 [defect] Christianity's 14 children spill into the Islam, Judaism, Hinduism rows (old-desk.png): an image asserting false kinships.
  - F4 [claim] Unbacked dates: "Orthodox Judaism" -2000 (a 19th-century label), three Hindu sects all -1500, Sikhism 1469 = Nanak's birth. No sources.
  - F5 [claim] Every living tradition ends at hard-coded 2025; it is 2026.
  - F6 [defect] dead-religons.json is never fetched and is invalid JSON (Mithraism `"start": 1st century` unquoted); its starts (-3500, -3150) lie outside the axis domain [-2000, 2025].
  - F7 [premise] The brief wants a map, but no file holds a coordinate; "origin" is prose ("Mesoamerica"). A globe now would decorate places the data never located.
  - F8 [defect] With d3js.org unreachable the page is only an h1 promising a chart.
- **Verdict:** OBJECT
- **Requested change:** F1 draw lineage edges or drop the word. F2 make it fluid or cut the README line. F3 lay children inside their own row, labelled. F4 cite each date or mark it approximate with a range. F5 compute "now" at runtime. F6 fix, load, widen domain. F7 add origin coordinates with uncertainty (regions, not pins) before drawing any map. F8 vendor d3 locally.
