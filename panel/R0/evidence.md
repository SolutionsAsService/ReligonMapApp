# R0 evidence (premortem on the inherited site, commit 01ad882)

Artifact: /home/user/religonmapapp (index.html, script.js, style.css, religions.json, dead-religons.json)
Screenshots: panel/R0/old-full.png (1280 full page), old-desk.png (1280x800), old-phone.png (375x812)

Measured with Playwright (Chromium), after no edits:
- d3 is loaded from https://d3js.org/d3.v6.min.js. In this sandbox that host fails (ERR_TUNNEL_CONNECTION_FAILED) and the page renders nothing but the h1 ("d3 is not defined"). Screenshots were taken with d3 v7 substituted locally.
- Desktop 1280x800: one SVG, fixed 1000x800 px, at y=78. Bottom edge at y=878 > 800 fold. scrollWidth 1280.
- Phone 375x812: SVG still 1000 px wide; documentElement.scrollWidth = 1019 vs innerWidth 375 (644 px sideways scroll).
- 11 religions, 48 rects, 20 text nodes, smallest text 10 px. Denominations are not labelled at all (only parent names on the y axis).
- Child bars are placed at y = i * bandwidth/3 inside a row; Christianity has 14 children, so children 4-14 draw into the Islam, Judaism and Hinduism rows (visible in old-full.png: dark bars overlapping other rows).
- dead-religons.json (12 extinct religions with origin and reason) is never fetched by script.js.
- No map, no geography, no origin coordinates in any data file. Tooltip shows name/start/end only.
- Data claims in religions.json: "Orthodox Judaism" start -2000; Judaism start -2000; Vaishnavism/Shaivism/Shaktism start -1500; all living traditions end 2025 (hard-coded "now"). Sikhism 1469 (Guru Nanak's birth year, not the founding of a community).
- Single page, no navigation, no sources, no about. Title "Religion Timeline and Relationships". Colours #69b3a2 and #404080 only; parent and child not distinguishable by anything but colour.

Brief for the redesign (the owner's words): "total review and make way better, add map with lite earth and make timeliness way better design, dada revamp, then add to portfolio".
