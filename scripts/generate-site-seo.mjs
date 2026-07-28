/**
 * Writes sitemap.xml, robots.txt, and site meta from website/site.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = path.join(root, "website");
const site = JSON.parse(readFileSync(path.join(siteDir, "site.json"), "utf8"));
const downloads = JSON.parse(readFileSync(path.join(siteDir, "downloads.json"), "utf8"));

const owner = (site.githubPages?.owner || downloads.githubPages?.owner || "ALIENK1NG").toLowerCase();
const repo = site.githubPages?.repo || downloads.githubPages?.repo || "MyGameBrowser-App";
const baseUrl = (
  site.publicUrl ||
  (site.customDomain ? `https://${site.customDomain.replace(/^https?:\/\//, "")}` : "") ||
  downloads.installPageUrl ||
  `https://${owner}.github.io/${repo}/`
)
  .trim()
  .replace(/\/?$/, "/");

const lastmod = downloads.released || new Date().toISOString().slice(0, 10);

writeFileSync(
  path.join(siteDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
  "utf8"
);

writeFileSync(
  path.join(siteDir, "robots.txt"),
  `User-agent: *
Allow: /

Sitemap: ${baseUrl}sitemap.xml
`,
  "utf8"
);

downloads.installPageUrl = baseUrl;
writeFileSync(path.join(siteDir, "downloads.json"), JSON.stringify(downloads, null, 2) + "\n", "utf8");

if (site.customDomain) {
  writeFileSync(path.join(siteDir, "CNAME"), site.customDomain.trim() + "\n", "utf8");
} else if (existsSync(path.join(siteDir, "CNAME"))) {
  // leave existing CNAME if user set one manually
}

console.log(`SEO files updated for: ${baseUrl}`);
