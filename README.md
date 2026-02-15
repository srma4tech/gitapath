# GitaPath

GitaPath is a static Progressive Web App that delivers one Bhagavad Gita verse daily with Sanskrit, transliteration, Hindi meaning, English meaning, reflection, and streak tracking.

## What Is GitaPath

GitaPath is designed for daily spiritual consistency, not content overload.

Core experience:
- One daily verse from a local 700-verse dataset
- Hindi and English meaning toggle
- Reflection paragraph for practical application
- Streak tracking with milestones (7, 21, 108)
- Share card generation
- Offline-ready installable PWA

## Project Structure

```txt
.
|-- index.html
|-- about-gita.html
|-- read-gita-daily.html
|-- benefits-of-gita.html
|-- 404.html
|-- sitemap.xml
|-- robots.txt
|-- manifest.json
|-- sw.js
|-- styles.css
|-- tailwind.css
|-- tailwind.config.js
|-- tailwind.input.css
|-- data/
|   `-- verses.json
|-- js/
|   |-- app.js
|   |-- verse.js
|   |-- streak.js
|   |-- share.js
|   `-- pwa.js
|-- assets/
|   `-- images/
|       |-- app-icon.jpeg
|       |-- golden-celebration-glow.png
|       |-- krishna-aura-bg.png
|       |-- kurukshetra-sunrise-bg.png
|       |-- parchment-texture.png
|       |-- share-card-dark.jpeg
|       |-- share-card-light.jpeg
|       `-- splash-gradient.jpeg
`-- launch/
    |-- product-hunt-description.md
    |-- first-comment.md
    |-- launch-checklist.md
    `-- promo-message.txt
```

## SEO Setup Steps

1. Confirm `sitemap.xml` uses your production domain:
   - `https://srma4tech.github.io/gitapath/`
2. Confirm `robots.txt` points to:
   - `https://srma4tech.github.io/gitapath/sitemap.xml`
3. Keep metadata in each page unique:
   - Title
   - Meta description
   - Open Graph/Twitter tags
4. Validate structured data in `index.html` with Google Rich Results Test.
5. Submit your sitemap to Google Search Console.

Included SEO assets:
- Core meta tags and social metadata
- JSON-LD (`WebSite` + `MobileApplication`)
- `sitemap.xml`
- `robots.txt`
- Content pages with internal linking
- Custom `404.html`

## How to Deploy on GitHub Pages

1. Push repository to GitHub.
2. Open `Settings > Pages`.
3. Set source to `Deploy from a branch`.
4. Select branch (`main`) and folder (`/root`).
5. Save.
6. Enable custom domain if needed (optional).
7. Enable **Enforce HTTPS** in Pages settings.

### HTTPS Note

HTTPS improves trust and is a ranking signal. Always keep HTTPS enabled in GitHub Pages settings.

### GitHub Pages and SEO

GitHub Pages hosting does **not** negatively impact SEO by itself. Search visibility depends on crawlability, content quality, metadata, internal linking, and performance, all of which are included in this project.

## Local Run

```bash
npx serve .
```

Then open the local URL in your browser.

If you modify Tailwind classes or config:

```bash
npm install
npm run build:css
```

## How to Launch on Product Hunt

Use files in `launch/`:

- `product-hunt-description.md`
- `first-comment.md`
- `launch-checklist.md`
- `promo-message.txt`

Launch flow:
1. Finalize listing copy and visuals.
2. Set product URL.
3. Prepare first maker comment.
4. Schedule launch in advance (recommended).
5. Publish and engage quickly with comments.

## Growth Roadmap to First 1,000 Users

Phase 1 (0-100 users):
- Share in personal network and spiritual communities.
- Collect qualitative feedback on verse readability and streak utility.

Phase 2 (100-300 users):
- Improve onboarding clarity and daily reminder behavior.
- Publish short blog/social clips using share cards.

Phase 3 (300-700 users):
- Build SEO momentum through the long-form content pages.
- Submit sitemap to search consoles and monitor keyword impressions.

Phase 4 (700-1,000 users):
- Launch on Product Hunt and niche communities.
- Add user-requested UX refinements rapidly.
- Track retention around day 7/day 21 milestones.

## PWA Verification Checklist

- Open once while online.
- Reload while online.
- Switch offline and reload.
- Install app from browser prompt/menu.
- Launch installed app and verify standalone mode.
