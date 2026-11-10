# Critic: Evidence (Cairo), R2

- Anchor used: *How Charts Lie* (Cairo). A figure is honest only if a reader can rebuild it from its source, without false precision or a hidden omission.
- Observed: I ran `npm run check` twice: 29/29 PASS both times. From data/traditions.json: 91 traditions (72 living, 19 ended), 60/91 approximate starts, 11/19 approximate ends, 34 regions and 57 sites. There are 196 stops: 153 traced and 43 "?", and every "from" resolves. atlas.html draws 153 `.leg` and 43 `.stop unk`. The ratios are 2.375, 3.802 and 9.030 (lib.mjs:52-66). The connectors sit at 54.3% and 90.5%. The 342 CE readout (26 alive) is correct. All 7 adherent rows match on sources.html and on the t/ pages. The durations are correct, with no year 0.

Findings:
- F1 [premise] The evidence is stale. build.mjs, check.mjs and site/ were rewritten at 02:32, after check-results.json (02:29). The current run gives 17 figures (evidence: 16), a 1280 hero bottom of 663.5 (evidence: 639) and a smallest timeline label of 10.9 px (evidence: 10.5).
- F2 [claim] The "present year pinned" probe (check.mjs:293) compares NOW with the same file it was read from (lib.mjs:9), so it can never fail. Also, "2026, the year this site was built" becomes false after a later rebuild.
- F3 [defect] The gridline-spacing note hardcodes 1190 (build.mjs:364). It is correct only at W=1200.
- F4 [claim] Still not probed: the 3.8×/9.0× ratios and the 57 sites on sources, the Years column, and the Followers lines on the t/ pages. All are true by hand.
- R1: F1 to F5 resolved. F6 resolved, with the caveat in F2. F7 mostly resolved.

Verdict: PASS

Requested change:
- F1: reissue the evidence from the current run.
- F2: say "the year this edition is pinned to"; test the printed year against meta.present.
- F3: derive the spacing from R−L.
- F4: extend the probe.
