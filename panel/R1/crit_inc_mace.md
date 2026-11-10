# Critic: Inclusion (Mace) — R1

**Anchor used:** The Principles of Universal Design (Mace et al.), principles 2, 5 and 7: flexibility in use, tolerance for error, and size and space for use.

**Observed:** My own Playwright run on localhost:8812: real Tab presses at 1280 and 375, plus forced colours.
- Nav, chips and skip link: a 3px #1f1b16 outline, :focus-visible true.
- Map marks: `.mk:focus-visible{outline:none}` (style.css:73). Focus shows only as a 3px stroke on a dot 9.6px across at 1280 and 3.8px at 375.
- At 375 the year range is the 114th Tab stop, after all 91 marks. Its ring and aria-valuetext are good.
- At 375, 89 of 91 marks sit within 24px of another mark, and 31 share a point with another. check.mjs:87 skips SVG targets.
- Forced colours: every dot turns CanvasText, so the family colour is lost. Ended marks stay hollow.
- Reduced motion: honoured.
- At 375, the focused "Sources" link ends at x=385.

**Findings**
- F1 [defect] On a phone, the focus on a map mark is a ring nobody can see.
- F2 [defect] To reach the year control from the chips takes 91 Tab presses through tiny, stacked marks.
- F3 [premise] The evidence says no target is under 24px, but the probe never measured the map marks.
- F4 [claim] In forced colours, family on the map is shown by colour alone, and that colour is gone.
- F5 [defect] Focus in the phone nav row is cut off at the screen edge.

**Verdict:** OBJECT

**Requested change**
- F1: A ring of at least 2px in `--focus`.
- F2: Give the marks `tabindex="-1"`, or add a "Skip map" link.
- F3: Measure SVG targets and report which exception each one passes under.
- F4: A marker shape for each family, or `forced-color-adjust:none` on `.dot`.
- F5: `scroll-padding-inline` on the row, or scroll the focused item into view.
