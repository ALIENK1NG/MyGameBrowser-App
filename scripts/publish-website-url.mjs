/**
 * Writes the GitHub Pages URL into website/downloads.json from githubPages config.
 */
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "website", "downloads.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const gp = manifest.githubPages || {};
const owner = gp.owner || "ALIENK1NG";
const repo = gp.repo || "MyGameBrowser-App";
const url = `https://${owner.toLowerCase()}.github.io/${repo}/`;

manifest.installPageUrl = url;
manifest.repositoryUrl = `https://github.com/${owner}/${repo}`;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`installPageUrl -> ${url}`);
