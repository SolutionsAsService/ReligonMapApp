# Critic: Inclusion (Holmes), R0

- Anchor used: Holmes, *Mismatch*: exclusion is a person–design mismatch; solve for one, extend to many.
- Observed: index.html, script.js, style.css, religions.json; old-full.png, old-phone.png; evidence.md.

Findings:
- F1 [defect] The SVG is fixed at 1000 px (script.js); on a phone, scrollWidth is 1019 vs 375, and old-phone.png shows the bars cut off. Fails phones and narrow windows.
- F2 [defect] Details appear only on `mouseover`, so touch, keyboard and switch users never see a date.
- F3 [defect] The SVG has no title, role or text alternative, and the 48 rects have no names. A screen reader hears only tick numbers.
- F4 [defect] Parent and child differ by colour alone, and denominations have no labels. That fails colour-blind readers and everyone else.
- F5 [defect] Child bars spill into neighbouring rows (old-full.png), so nobody can read it correctly.
- F6 [claim] The axis shows "−2000…2000" with no BCE/CE gloss, and the hard-coded 2025 "end" reads like a death date to newcomers.
- F7 [defect] When d3js.org fails (as measured), the page is a bare h1 with no fallback. People on filtered or slow networks get nothing.
- F8 [premise] The brief's "lite earth" map must not become another hover-only, drag-only canvas.

Verdict: OBJECT

Requested change:
- F1: a responsive viewBox, with a vertical timeline on narrow screens.
- F2: focusable marks, and details shown on focus or tap.
- F3: an SVG title/desc plus a parallel list or table with every date.
- F4: direct labels plus shape or pattern, not hue alone.
- F5: give each child its own sub-row.
- F6: label the axis "BCE/CE", show "present" instead of 2025, and add a short glossary.
- F7: self-host d3 and add a failed-load message containing the list.
- F8: pair every map origin with a keyboard-reachable text entry.
