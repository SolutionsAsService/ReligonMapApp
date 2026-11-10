# R1 - Critic: Usability (Krug)

- Anchor used: Don't Make Me Think (Krug). The five-second test (what is this, where do I start) and "omit needless words".
- Observed: home-desk.png and home-phone.png, first screen only, plus the evidence table.
  - 1280: the name is "The Religion Map". The topics are birthplaces, start dates (h1) and spread or ending (subhead, chips). The nav adds Timeline, Atlas, Lost religions. The first action is "Drag the year": a black knob at "now", with the filled Buddhism chip next to it. Route: the strip reads Bodh Gaya c. 450 BCE -> Anuradhapura 250 BCE -> ... -> Hohhot 1578, and the map labels match it.
  - 375: the name, h1, map and slider are visible. I can read Bodh Gaya, Anuradhapura, Borobudur and Hohhot on the map. The strip shows the route up to Borobudur at the bottom edge.
- Findings:
  - F1 [claim] Both widths pass the five-second test. I can trace Bodh Gaya -> Anuradhapura without thinking.
  - F2 [defect] At 375 the route chips scroll sideways: Christianity is cut and four routes are hidden, with no sign that there are more. The nav is cut the same way ("Sou").
  - F3 [defect] The strip never says which route it shows; only the chip colour tells you, so it needs a "Buddhism:" label.
  - F4 [defect] Needless words: the axis-fold sentence ("9.0x wider") makes me decode the chart before I touch it.
  - F5 [premise] The evidence says 5 labels are visible at 375. The screenshot shows 4; I cannot find Bagan.
- Verdict: PASS
- Requested change: F2: wrap the chips or add a "+4" cue, and wrap the nav at 375. F3: start the strip with "Buddhism route:". F4: cut the sentence to "Axis folds at 500 BCE and 1500". F5: re-check the Bagan label. F1: none.
