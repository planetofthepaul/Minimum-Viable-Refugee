# Minimum Viable Expat

Static site powered by Airtable + Astro. Generates 242 city pages with real cost-of-living data.

## How to deploy (no terminal needed)

### Prerequisites
Make sure you've added these GitHub Secrets (Settings → Secrets → Actions):
- `AIRTABLE_API_KEY` — your Personal Access Token (starts with `pat`)
- `AIRTABLE_BASE_ID` — `appGZ59WCYhIbTniA`

### Upload steps
1. Go to your repo on github.com
2. Delete the old `city/` folder and `cities.json` (they're replaced by Astro)
3. Delete `index.html`, `about.html`, `terms.html` (replaced by Astro pages)
4. Upload all files from this zip, preserving folder structure
5. Keep your existing image files (logo-mve.png, placeholder PNGs, etc.)
   — move them into the `public/` folder
6. Push/commit. The GitHub Action handles building and deploying.

### Your existing images
These need to be in `public/`:
- logo-mve.png
- og-image.jpg
- duolingo-placeholder.png
- nordvpn-placeholder.png
- safetywing-placeholder.png
- vrbo-placeholder.png
- wise-placeholder.png
- HeadShot-min.png
- wck-logo.jpeg
- wck-logo1.jpg

### The math
```
Total = Rent + (food + utilities + transit + other) × Multiplier

Single: 1.0x | Couple: 1.7x | Family: 2.5x
Rent is picked by bedroom count and NEVER multiplied.
```

### Rebuild schedule
- Auto-rebuilds every 6 hours (picks up Airtable edits)
- Rebuilds on every push to main
- Manual trigger: Actions tab → Build & Deploy → Run workflow
