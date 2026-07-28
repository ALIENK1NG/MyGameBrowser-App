# Go live — searchable website

You do **not** have to use GitHub. See **HOSTING.md** for Netlify, Vercel, Cloudflare Pages, and custom domains.

Set your URL in `website/site.json` → `publicUrl` or `customDomain`, then:

```powershell
npm run site:seo
```

---

## GitHub Pages (one free option)

**https://harns.github.io/MyGameBrowser-App/**

---

## Step 1 — Publish the site (5 minutes)

1. Create an **empty** repo: [github.com/new?name=MyGameBrowser-App](https://github.com/new?name=MyGameBrowser-App) (no README).

2. In PowerShell from this project folder:

```powershell
npm run site:seo
git add website .github
git commit -m "Publish Alienizor website"
git remote add origin https://github.com/Harns/MyGameBrowser-App.git
git push -u origin main
```

Or run the guided script:

```powershell
npm run publish:github
```

3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

4. Wait ~2 minutes for the **Deploy install website** workflow to finish.

5. Open https://harns.github.io/MyGameBrowser-App/ — you should see the install page.

---

## Step 2 — Tell Google to index it

1. Go to [Google Search Console](https://search.google.com/search-console).
2. **Add property** → URL prefix → `https://harns.github.io/MyGameBrowser-App/`
3. Verify ownership (HTML file or DNS — GitHub Pages works with the HTML tag method in `website/` if needed).
4. **Sitemaps** → submit: `https://harns.github.io/MyGameBrowser-App/sitemap.xml`
5. **URL inspection** → enter your homepage → **Request indexing**.

Also submit to [Bing Webmaster Tools](https://www.bing.com/webmasters) (optional; helps Bing/Copilot).

Indexing usually takes **a few days to 2 weeks** for a new site.

---

## Step 3 — Rank better for “Alienizor”

Already included in the site:

- Page title and meta description with **Alienizor**, **game launcher**, **Steam**
- `robots.txt` and `sitemap.xml`
- Open Graph / Twitter cards
- JSON-LD `SoftwareApplication` schema for Google

**You can improve ranking by:**

- Linking from your GitHub repo README to the live site
- Posting on Reddit/Discord with the URL
- Using a short custom domain (e.g. `alienizor.app`) — set in `website/site.json`

---

## Update the site after changes

```powershell
npm run site:seo
npm run website:downloads
git add website
git commit -m "Update install site"
git push
```

GitHub Actions redeploys automatically.

---

## Commands

| Command | What it does |
|---------|----------------|
| `npm run site:seo` | Refresh sitemap, robots.txt, canonical URLs |
| `npm run website` | Preview locally |
| `npm run publish:github` | Guided first push |
| `npm run website:share` | Temporary public link (not for SEO) |
