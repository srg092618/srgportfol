# srgportfol.io

Source for my data science portfolio, Steven Goncalves. Plain HTML, CSS and JavaScript with
no build step: GitHub Pages serves the `site/` folder exactly as it is.

## What's on the site

| Section | What it shows | Where it lives |
|---|---|---|
| Hero | Live chart of new HIV infections with my gradient-boosting forecast and its 50/80/95% intervals | `site/assets/main.js`, data in `site/assets/hero-data.js` |
| Forecasting | The full epicast dashboard (malaria, HIV, Ebola disease) in a frame | `site/demos/disease-forecasting/index.html` |
| Visualizations | "From forest to clusters": random forest and k-means on 64-D digits, in 3D | `site/demos/forest-to-clusters/index.html` |
| Model lab | Six interactive model demos built for PRONOME, shown one at a time | `site/demos/model-lab/index.html` |
| About, Contact | Bio, experience, tools, contact buttons | `site/index.html` |

```
site/
  index.html            the page
  assets/site.css       design tokens (colors, fonts) and layout
  assets/main.js        contact links, hero chart, model lab tabs
  assets/hero-data.js   generated data for the hero chart
  demos/                self-contained demo pages, each embedded with an <iframe>
  404.html, favicon.svg, robots.txt, .nojekyll
scripts/
  build_hero_data.py    rebuilds hero-data.js from a disease-forecasting run
docs/
  deployment.md         GitHub Pages and the srgportfol.io DNS records
.github/workflows/
  pages.yml             publishes site/ on every push to main
```

## First steps

1. **Add your contact details.** Open `site/assets/main.js` and fill in `CONTACT.email` and
   `CONTACT.linkedin`. Each button stays hidden until its value is filled in.
2. **Preview locally:**
   ```
   python -m http.server 8000 --directory site
   ```
   Then open http://localhost:8000. The demos need a server like this; opening `index.html`
   by double-clicking it breaks the frames.
3. **Push to GitHub and turn on Pages.** See [docs/deployment.md](docs/deployment.md).

## Updating the demos

**Forecasting dashboard.** After a new `python -m epicast run` in the disease-forecasting repo:

```
cp ../disease-forecasting/outputs/dashboard.html site/demos/disease-forecasting/index.html
python scripts/build_hero_data.py ../disease-forecasting/outputs
```

Then update the numbers in the "Featured project" tiles in `site/index.html` if the
metrics changed (`outputs/metrics_overall.csv`).

**Model lab.** `site/demos/model-lab/index.html` is a copy of the PRONOME site with a short
block added after `<body>`. When the page is inside a frame it adds the class `embed`, which
hides the PRONOME header, footer and "Where it is used" sections. To refresh it from a newer
PRONOME page, copy the new page in and paste that block after `<body>` again.

**Forest to clusters.** Replace `site/demos/forest-to-clusters/index.html` with the new
version. It loads three.js from cdnjs.

## Changing the look

All colors are CSS variables at the top of `site/assets/site.css`, with a dark-mode set
below them. The hero chart reads `--band` (forecast) and `--hist` (history), so changing
those recolors it.
