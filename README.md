# The Religion Map

Where 91 religious traditions began, and when. The site has:

- a light Equal Earth map of birthplaces and dated spread routes
- a lineage timeline on a folded time axis
- eight family pages, a page per tradition, and a page for the 19 traditions that have ended

## What is in it

| Page | What it shows |
|---|---|
| `index.html` | The map, which moves with a year slider. The slider's track counts how many traditions were alive in each year. Six featured spread routes. |
| `timeline.html` | Every tradition as one line, with each branch dropping from its parent in the year it split. The time axis is folded into three stretches, each to its own scale. |
| `atlas.html` | All births and all 69 dated routes, filterable by family and year. |
| `families/*.html` | Each family on a map fitted to its own region, with dashed lines from a parent's birthplace to its branch's. |
| `t/*.html` | One page per tradition: its dates with an explanation, its origin, its route table and its lineage. |
| `lost.html` | The ended traditions, in the order they ended, with what ended them. |
| `sources.html` | Method, sources, and corrections to the earlier version. |

Everything is pre-rendered SVG, so no map library loads in the browser. The page script (about 5 KB) only moves the year and switches routes.

## Data

- `data/traditions.json` holds one record per tradition: numeric `start`/`end` (negative = BCE), an `approx` flag and a `date_note`, an `origin` with lat/lon and a `precision` of `site` or `region`, a `spread` of `[year, place, lat, lon, from, note]` steps, a `parent`, and `adherents` only where `data/sources.json` cites a figure.
- `data/families.json` holds the 8 families and their colours.

## Build

```bash
npm install
npm run build   # writes site/
npm run check   # 26 measured probes: overflow, first screen, labels, targets, focus, contrast, printed figures
```

Deployed as static files from `site/` (`vercel.json`, `fluid.json`). Design decisions and critique rounds are in `DESIGN-LOG.md`.
