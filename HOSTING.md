# Host Alienizor anywhere (not just GitHub)

The install site is a **static folder**: `website/`. Upload it to any host with HTTPS. Google and Bing work with **any** public URL.

## Set your live URL

Edit `website/site.json` and set **one** of these:

```json
{
  "publicUrl": "https://alienizor.netlify.app",
  "customDomain": "getalienizor.com"
}
```

- **`publicUrl`** — full URL from Netlify, Vercel, Cloudflare, etc.
- **`customDomain`** — your own domain (no `https://`), e.g. `alienizor.app`

Then run:

```powershell
npm run site:seo
```

That updates `sitemap.xml`, `robots.txt`, and download links for search engines.

---

## Option 1 — Netlify (easy, free)

1. Sign up at [netlify.com](https://www.netlify.com)
2. **Add new site → Deploy manually** → drag the **`website`** folder onto the page  
   Or connect your Git repo and set **Publish directory** = `website`
3. You get a URL like `https://random-name.netlify.app` — put it in `site.json` → `publicUrl`
4. Optional: **Domain settings** → add `getalienizor.com` (buy domain from Namecheap, Google Domains, etc.)

Config file included: `website/netlify.toml`

```powershell
cd website
npx netlify deploy --prod
```

---

## Option 2 — Vercel (easy, free)

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Import repo OR run from `website` folder:

```powershell
cd website
npx vercel --prod
```

3. Set **Root Directory** = `website` if deploying from the full repo
4. Copy your `*.vercel.app` URL into `site.json` → `publicUrl`

Config included: `website/vercel.json`

---

## Option 3 — Cloudflare Pages (free, fast CDN)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Connect Git or **Direct Upload** of the `website` folder
3. Build command: *(leave empty)* — Publish directory: `website` (or upload folder contents)
4. URL like `https://alienizor.pages.dev` → `publicUrl` in `site.json`

Great if you already use Cloudflare for a domain.

---

## Option 4 — Your own domain + any host

Buy a domain (e.g. **alienizor.app**, **getalienizor.com**) from:

- Namecheap, Porkbun, Google Domains, Cloudflare Registrar

Point DNS to Netlify/Vercel/Cloudflare, or upload `website/` to:

- **cPanel** / shared hosting (public_html)
- **Azure Static Web Apps**
- **AWS S3** + CloudFront

Set `customDomain` in `site.json`, run `npm run site:seo`, redeploy.

---

## Option 5 — GitHub Pages (still fine)

See **GO-LIVE.md**. Free and works well with the included GitHub Action.

---

## Large download files (.exe)

Hosts have size limits:

| Host | Typical limit |
|------|----------------|
| GitHub Pages | ~100 MB per file (repo size limits apply) |
| Netlify | 100 MB per file on free tier |
| Vercel | 50 MB serverless; static files ~100 MB |

If installers are too big:

1. Host `.exe` files on **GitHub Releases** or **Cloudflare R2** / **S3**
2. Set `releasesBaseUrl` in `website/downloads.json` to that folder URL
3. Keep the marketing site on Netlify/Vercel with only HTML/CSS/JS

---

## Google search (any host)

1. Publish site at your HTTPS URL
2. [Google Search Console](https://search.google.com/search-console) → add your URL
3. Submit sitemap: `https://YOUR-DOMAIN/sitemap.xml`
4. Request indexing for the homepage

Same process for Bing Webmaster Tools.

---

## Quick compare

| | GitHub Pages | Netlify | Vercel | Cloudflare Pages |
|--|--------------|---------|--------|------------------|
| Free | Yes | Yes | Yes | Yes |
| Custom domain | Yes | Yes | Yes | Yes |
| Drag-and-drop upload | No* | Yes | CLI | Yes |
| Needs Git | Yes* | Optional | Optional | Optional |

\*GitHub Pages can use Actions without manual Git on your PC after setup.

**Recommendation:** Netlify drag-and-drop of the `website` folder is the fastest if you don’t want GitHub.
