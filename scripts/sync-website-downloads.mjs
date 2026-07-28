/**
 * Copy built installers into website/downloads/ for the install site.
 * Prefers Alienizor-Plus/dist (Alienizor+ builds), falls back to this repo's dist/.
 * Also mirrors electron-updater artifacts into website/updates/.
 */
import {
  copyFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  createReadStream
} from "fs";
import { createHash } from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const plusDist = path.join(root, "..", "Alienizor-Plus", "dist");
const localDist = path.join(root, "dist");
const outDir = path.join(root, "website", "downloads");
const updatesDir = path.join(root, "website", "updates");

function readVersion() {
  const plusPkg = path.join(root, "..", "Alienizor-Plus", "package.json");
  if (existsSync(plusPkg)) {
    return JSON.parse(readFileSync(plusPkg, "utf8")).version || "1.1.0";
  }
  return JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version;
}

const ver = readVersion();
const releaseTag = `v${ver}`;
const releaseBase = `https://github.com/ALIENK1NG/MyGameBrowser-App/releases/download/${releaseTag}`;

function pickDistDir() {
  const plusInstaller = path.join(plusDist, `Alienizor+ Setup ${ver}.exe`);
  if (existsSync(plusInstaller)) return plusDist;
  const localInstaller = path.join(localDist, `Alienizor+ Setup ${ver}.exe`);
  if (existsSync(localInstaller)) return localDist;
  if (existsSync(path.join(localDist, `Alienizor Setup ${ver}.exe`))) return localDist;
  if (existsSync(plusDist)) return plusDist;
  return localDist;
}

const distDir = pickDistDir();

function encodeAsset(name) {
  return encodeURIComponent(name);
}

function syncDownloadsManifest() {
  const manifestPath = path.join(root, "website", "downloads.json");
  if (!existsSync(manifestPath)) return;
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.version = ver;
  manifest.released = new Date().toISOString().slice(0, 10);
  manifest.installPageUrl = "https://alienk1ng.github.io/MyGameBrowser-App/";
  manifest.repositoryUrl = "https://github.com/ALIENK1NG/MyGameBrowser-App";
  manifest.githubPages = {
    owner: "ALIENK1NG",
    repo: "MyGameBrowser-App",
    branch: "main"
  };
  // Prefer GitHub Releases for large binaries; keep local downloads/ as fallback/dev.
  manifest.releasesBaseUrl = `${releaseBase}/`;
  if (manifest.windows) {
    if (manifest.windows.installer) {
      manifest.windows.installer.file = `Alienizor+ Setup ${ver}.exe`;
      manifest.windows.installer.label = "Windows installer (recommended)";
      manifest.windows.installer.url = `${releaseBase}/${encodeAsset(`Alienizor+ Setup ${ver}.exe`)}`;
    }
    if (manifest.windows.portable) {
      manifest.windows.portable.file = `Alienizor+ ${ver}.exe`;
      manifest.windows.portable.label = "Windows portable (.exe)";
      manifest.windows.portable.url = `${releaseBase}/${encodeAsset(`Alienizor+ ${ver}.exe`)}`;
    }
    if (manifest.windows.portableZip) {
      manifest.windows.portableZip.file = `Alienizor+-${ver}-windows-portable.zip`;
      manifest.windows.portableZip.label = "Windows portable (.zip)";
      manifest.windows.portableZip.url = `${releaseBase}/${encodeAsset(`Alienizor+-${ver}-windows-portable.zip`)}`;
    }
  }
  if (manifest.linux) {
    if (manifest.linux.appimage) {
      manifest.linux.appimage.file = `Alienizor+-${ver}.AppImage`;
      manifest.linux.appimage.url = `${releaseBase}/${encodeAsset(`Alienizor+-${ver}.AppImage`)}`;
    }
    if (manifest.linux.deb) {
      manifest.linux.deb.file = `alienizor-plus_${ver}_amd64.deb`;
      manifest.linux.deb.url = `${releaseBase}/${encodeAsset(`alienizor-plus_${ver}_amd64.deb`)}`;
    }
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`  updated downloads.json → v${ver}`);
  console.log(`  dist source: ${distDir}`);
  console.log(`  release assets: ${releaseBase}/`);
}

syncDownloadsManifest();

mkdirSync(outDir, { recursive: true });
mkdirSync(updatesDir, { recursive: true });

const candidates = [
  `Alienizor+ Setup ${ver}.exe`,
  `Alienizor+ ${ver}.exe`,
  `Alienizor Setup ${ver}.exe`,
  `Alienizor ${ver}.exe`,
  `Alienizor+-${ver}.AppImage`,
  `Alienizor-${ver}.AppImage`,
  `alienizor-plus_${ver}_amd64.deb`,
  `alienizor_${ver}_amd64.deb`
];

let copied = 0;
for (const name of candidates) {
  const from = path.join(distDir, name);
  if (!existsSync(from)) continue;
  let destName = name;
  if (name === `Alienizor Setup ${ver}.exe`) destName = `Alienizor+ Setup ${ver}.exe`;
  if (name === `Alienizor ${ver}.exe`) destName = `Alienizor+ ${ver}.exe`;
  const to = path.join(outDir, destName);
  copyFileSync(from, to);
  const mb = (statSync(to).size / (1024 * 1024)).toFixed(1);
  console.log(`  copied ${destName} (${mb} MB)`);
  copied++;
}

const updateArtifacts = [
  "latest.yml",
  `Alienizor+ Setup ${ver}.exe`,
  `Alienizor+ Setup ${ver}.exe.blockmap`
];
for (const name of updateArtifacts) {
  const from = path.join(distDir, name);
  if (!existsSync(from)) continue;
  const to = path.join(updatesDir, name);
  copyFileSync(from, to);
  console.log(`  updates/${name}`);
}
writeFileSync(
  path.join(updatesDir, "README.md"),
  [
    "# Alienizor+ update feed",
    "",
    "electron-updater generic mirror. Preferred feed is GitHub Releases",
    "(`provider: github`, repo `ALIENK1NG/MyGameBrowser-App`).",
    "",
    `Current version: **${ver}**`,
    ""
  ].join("\n"),
  "utf8"
);

const unpacked = path.join(distDir, "win-unpacked");
const zipName = `Alienizor+-${ver}-windows-portable.zip`;
const zipPath = path.join(outDir, zipName);
const hasPortableExe = existsSync(path.join(outDir, `Alienizor+ ${ver}.exe`));
const zipExists = existsSync(zipPath);

if ((!hasPortableExe || !zipExists) && existsSync(unpacked)) {
  console.log(`  creating ${zipName} from ${unpacked} ...`);
  if (process.platform === "win32") {
    const ps = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Compress-Archive -Path '${unpacked}\\*' -DestinationPath '${zipPath}' -Force`
      ],
      { stdio: "inherit" }
    );
    if (ps.status === 0 && existsSync(zipPath)) {
      const mb = (statSync(zipPath).size / (1024 * 1024)).toFixed(1);
      console.log(`  created ${zipName} (${mb} MB)`);
      copied++;
    }
  }
}

if (copied === 0) {
  console.log("No installers found. Build Alienizor+ with: npm run dist (in Alienizor-Plus)");
  process.exit(1);
}

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    createReadStream(filePath)
      .on("data", (d) => hash.update(d))
      .on("end", () => resolve(hash.digest("hex")))
      .on("error", reject);
  });
}

const files = readdirSync(outDir).filter((n) => !n.startsWith("."));
const checksums = { version: ver, algorithm: "sha256", files: {} };
for (const name of files) {
  if (name === ".gitkeep") continue;
  const full = path.join(outDir, name);
  if (!statSync(full).isFile()) continue;
  checksums.files[name] = {
    sha256: await sha256File(full),
    bytes: statSync(full).size
  };
}
writeFileSync(
  path.join(root, "website", "checksums.json"),
  JSON.stringify(checksums, null, 2) + "\n",
  "utf8"
);
console.log(`  wrote checksums.json (${Object.keys(checksums.files).length} hashes)`);
console.log(`\nDownloads ready in website/downloads/ (${copied} file(s))`);
console.log(`Update feed mirror in website/updates/`);
