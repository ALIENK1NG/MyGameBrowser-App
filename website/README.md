# Alienizor+ install website

Static landing page for downloading and installing **Alienizor+**.

## Preview locally

From the MyGameBrowser-App repo root:

```bash
npm run website:downloads
npm run website
```

Open http://localhost:3456

> Opening `index.html` directly will not load `downloads.json`. Use the local server.

## Wire up downloads

1. Build installers in **Alienizor-Plus**: `npm run dist`
2. From this repo: `npm run website:downloads`  
   Copies `Alienizor+ Setup …` and portable builds from `../Alienizor-Plus/dist` into `website/downloads/`
3. Share temporarily: `npm run website:share` (Cloudflare tunnel)
4. Permanent hosting: put the site on GitHub Pages / Netlify / Vercel and either:
   - Host the `.exe` files next to the site (`releasesBaseUrl: "downloads/"`), or
   - Upload artifacts to GitHub Releases and set `releasesBaseUrl` in `downloads.json`

## Files

| File | Purpose |
|------|---------|
| `index.html` | Landing / install page |
| `css/install.css` | Styles |
| `js/install.js` | Platform detection + download links |
| `downloads.json` | Version and download file names |
| `assets/alienizor-logo.png` | Brand mark |
