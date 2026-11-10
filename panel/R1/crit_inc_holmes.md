# Critic: Inclusion (Holmes), R1

- Anchor used: Kat Holmes, *Mismatch*: exclusion is a mismatch; solve for one (permanent, temporary or situational) and extend to many.

- Observed: home-phone.png, home-desk.png, t_candomble_html-phone.png; site/index.html (91 `<a class="mk">` dots precede `#hero-year`); src/app.js (aria-valuetext); src/style.css 76, 255-256.

- Findings:
  - F1 [defect] Keyboard and switch users must Tab past 91 map dots (at "now") before reaching the year slider and route chips. The skip link only reaches #main.
  - F2 [defect] Phone nav cuts "Sources" to "Sou" at 375, with the scrollbar hidden and no cue. A one-handed newcomer loses the trust page.
  - F3 [defect] In the Candomblé phone lineage, "Yoruba religion (Ifá, Orisha)" collides with "3.8× wider →", and the Candomblé label is clipped to "C".
  - F4 [claim] The year range is labelled and reads aloud "2026 · 72 of 91 alive". That works well for screen-reader users and for anyone who cannot read the ribbon.
  - F5 [premise] "orixás", "terreiros" and "Dharmic" go unexplained, and the fold note ("9.0× wider") is missing from the first phone screen, whose axis has no 3000 BCE label.
  - F6 [claim] The route strip is the map's text equivalent, but on the phone it falls below the fold.

- Verdict: OBJECT

- Requested change:
  - F1: put the slider and chips before the map in DOM order, keeping the visual order in CSS. Or make the dots one tab stop with arrow keys, and add a "skip map" link.
  - F2: wrap the nav to two rows at 375, or add an edge fade and arrow.
  - F3: move the ratio label off the row labels, and keep the row's own label inside the box.
  - F4: none.
  - F5: an inline gloss on first use, and show the fold note on the phone.
  - F6: put a "read the 9 stops as a list" link directly under the phone map.
