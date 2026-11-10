# Critic: Usability (Krug), R0 premortem

- **Anchor used:** *Don't Make Me Think* (Krug): five-second test, obvious clickability, omit needless words. Signifiers per Norman.

- **Observed:** index.html is an h1 plus a fixed 1000x800 SVG. old-desk.png: the 800 px fold cuts off the year axis (SVG bottom 878). old-phone.png: 644 px sideways scroll, with years and most bars off screen. The only interaction is a hover tooltip, and nothing looks clickable. Two colours, no legend. old-full.png: Christianity's child bars spill into the Islam, Judaism and Hinduism rows. If the d3js.org CDN fails, the page shows only the h1.

- **Findings:**
  - F1 [defect] Fails five seconds: no years above the fold, no legend, and teal vs navy is unexplained.
  - F2 [defect] Nothing signals a next action. Hover-only tooltips don't work on touch and give no sign they exist.
  - F3 [defect] Child bars overlap other rows, so you can't tell which bar belongs to which religion.
  - F4 [defect] Phone: the fixed 1000 px width forces sideways scrolling.
  - F5 [claim] The title promises "Relationships". The page shows none, and denominations have no labels.
  - F6 [defect] If the CDN fails, users see a blank box and no message.
  - F7 [premise] The brief wants a map, but the data has no coordinates.

- **Verdict:** OBJECT

- **Requested change:**
  - F1: put the axis, a one-line "what this is" and a legend above the fold.
  - F2: use visible, tappable labels, with details on tap/focus.
  - F3: keep children inside their own row, labelled.
  - F4: make the width fluid, or use a vertical timeline on phone.
  - F5: retitle the page or show the lineage.
  - F6: host d3 locally and add a fallback message.
  - F7: source the origin coordinates before building the map.
