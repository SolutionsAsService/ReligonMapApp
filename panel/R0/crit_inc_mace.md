# R0 — Critic: Inclusion (Mace)

**Anchor used:** Principles of Universal Design (Mace et al.): P4 Perceptible Information, P5 Tolerance for Error, P7 Size and Space. I measure against WCAG 2.2.

**Observed:** In script.js, every `rect` responds only to `mouseover`/`mouseout`. Nothing has `tabindex`, `role` or `aria-*`. Fills are `#69b3a2` (parent) and `#404080` (child). `.tooltip` has `pointer-events:none`.

**Findings:**
- F1 [defect] Focus visibility: I traced a Tab press through the code and nothing takes focus. Keyboard users have no ring and no data.
- F2 [defect] 2.5.8: child rects are about 20.7 px tall, under 24 px. State Shinto is about 16.8 px wide. Christianity's children overlap other rows (old-full.png).
- F3 [defect] Parent and child differ only by colour. Denominations have no labels.
- F4 [defect] `#69b3a2` on white is 2.45:1, below the 3:1 that 1.4.11 requires.
- F5 [defect] 1.4.13: the tooltip has no hover persistence, cannot be dismissed, and never appears on touch.
- F6 [defect] 1.4.10: there is 644 px of sideways scroll at 375 px (evidence).
- F7 [claim] Forced colours: I did not test this. The hard-coded SVG fills are unverified.
- F8 [defect] The tooltip transitions ignore `prefers-reduced-motion`.
- F9 [defect] If the d3 CDN fails, the page shows only the h1 (evidence).

**Verdict:** OBJECT

**Requested change:**
- F1: back every mark with a focusable element or table, with a visible ring of at least 2 px at 3:1.
- F2: make marks at least 24 px and keep rows separate.
- F3: add labels plus a second channel such as outline or hatch.
- F4: raise the fill to 3:1 or better.
- F5: show details on click or focus, dismissible with Esc.
- F6: use a fluid viewBox.
- F7: test with Playwright `forcedColors` and use system colours.
- F8: honour reduced motion.
- F9: serve d3 locally and add a table fallback.
