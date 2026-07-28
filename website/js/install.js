const MANIFEST_URL = "downloads.json";
const PUBLIC_URL_MANIFEST = "public-url.json";

let cachedPublicUrl = null;

async function loadPublicUrl() {
  if (cachedPublicUrl !== null) return cachedPublicUrl;
  try {
    const res = await fetch(PUBLIC_URL_MANIFEST, { cache: "no-store" });
    if (!res.ok) {
      cachedPublicUrl = "";
      return "";
    }
    const data = await res.json();
    cachedPublicUrl = (data.url || "").trim();
    return cachedPublicUrl;
  } catch {
    cachedPublicUrl = "";
    return "";
  }
}

function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("linux")) return "linux";
  return "windows";
}

function resolveDownloadUrl(entry, manifest) {
  if (!entry) return "";
  if (entry.url && entry.url.trim()) return entry.url.trim();
  const base = (manifest.releasesBaseUrl || "").trim();
  if (!base || !entry.file) return "";
  try {
    const root = base.startsWith("http")
      ? base.endsWith("/")
        ? base
        : `${base}/`
      : new URL(base.endsWith("/") ? base : `${base}/`, location.href).href;
    return new URL(encodeURI(entry.file), root).href;
  } catch {
    const rel = base.replace(/\/?$/, "/") + entry.file;
    return new URL(rel, location.href).href;
  }
}

function setLink(anchor, url, enabled, fileName) {
  if (!anchor) return;
  if (enabled && url) {
    anchor.href = url;
    if (fileName) anchor.setAttribute("download", fileName);
    anchor.removeAttribute("aria-disabled");
    anchor.classList.remove("is-disabled");
    anchor.removeAttribute("disabled");
  } else {
    anchor.removeAttribute("href");
    anchor.setAttribute("aria-disabled", "true");
    anchor.classList.add("is-disabled");
  }
}

function githubPagesUrl(manifest) {
  const gp = manifest.githubPages;
  if (!gp?.owner || !gp?.repo) return "";
  return `https://${String(gp.owner).toLowerCase()}.github.io/${gp.repo}/`;
}

async function effectiveInstallUrl(manifest) {
  const livePublic = await loadPublicUrl();
  if (livePublic) return livePublic;
  const configured = (manifest.installPageUrl || "").trim();
  const isLocal =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const onTunnel = location.hostname.endsWith(".trycloudflare.com");
  if (isLocal || onTunnel) return `${location.origin}${location.pathname}`;
  return configured || githubPagesUrl(manifest);
}

async function checkPublished(url) {
  if (!url || url.includes("localhost")) return true;
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

function formatBytes(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `~${mb.toFixed(0)} MB` : `~${(bytes / 1024).toFixed(0)} KB`;
}

function formatReleaseDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

async function applySiteLinks(manifest) {
  const installUrl = await effectiveInstallUrl(manifest);
  const repoUrl = (manifest.repositoryUrl || "").trim();

  const canonical = document.getElementById("canonicalLink");
  const ogUrl = document.getElementById("ogUrl");
  if (canonical && installUrl && !installUrl.includes("localhost")) {
    canonical.href = installUrl;
  }
  if (ogUrl && installUrl && !installUrl.includes("localhost")) {
    ogUrl.content = installUrl;
  }

  const repoLink = document.getElementById("repoLink");
  if (repoLink && repoUrl) repoLink.href = repoUrl;

  if (installUrl && !installUrl.includes("localhost")) {
    const ogImage = document.getElementById("ogImage");
    const twitterImage = document.getElementById("twitterImage");
    const imgUrl = new URL("assets/alienizor-logo.png", installUrl).href;
    if (ogImage) ogImage.content = imgUrl;
    if (twitterImage) twitterImage.content = imgUrl;

    const ld = document.getElementById("structuredData");
    if (ld) {
      try {
        const data = JSON.parse(ld.textContent);
        data.url = installUrl;
        data.downloadUrl = installUrl;
        if (manifest.version) data.softwareVersion = manifest.version;
        ld.textContent = JSON.stringify(data, null, 2);
      } catch {
        /* ignore */
      }
    }
  }
}

async function renderDownloads(manifest) {
  await applySiteLinks(manifest);
  const versionEl = document.getElementById("appVersion");
  const releasedEl = document.getElementById("releaseDate");
  const heroBtn = document.getElementById("heroDownloadBtn");
  const noteEl = document.getElementById("downloadNote");
  const osHint = document.getElementById("osHint");

  const version = manifest.version || "—";
  if (versionEl) versionEl.textContent = version;
  const dlVersion = document.getElementById("dlVersion");
  if (dlVersion) dlVersion.textContent = version;
  if (releasedEl && manifest.released) {
    releasedEl.innerHTML = `Released <strong>${formatReleaseDate(manifest.released)}</strong>`;
  }

  const platform = detectPlatform();
  const panels = {
    windows: document.getElementById("panel-windows"),
    linux: document.getElementById("panel-linux")
  };
  const tabs = document.querySelectorAll(".platform-tabs .tab");

  function activateTab(id) {
    tabs.forEach((tab) => {
      const active = tab.dataset.platform === id;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    Object.entries(panels).forEach(([key, panel]) => {
      if (panel) panel.classList.toggle("is-active", key === id);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.platform));
  });
  activateTab(platform);

  const winInstaller = manifest.windows?.installer;
  const winPortable = manifest.windows?.portable;
  const winPortableZip = manifest.windows?.portableZip;
  const linuxApp = manifest.linux?.appimage;
  const linuxDeb = manifest.linux?.deb;

  const urls = {
    winInstaller: resolveDownloadUrl(winInstaller, manifest),
    winPortable: resolveDownloadUrl(winPortable, manifest),
    winPortableZip: resolveDownloadUrl(winPortableZip, manifest),
    linuxApp: resolveDownloadUrl(linuxApp, manifest),
    linuxDeb: resolveDownloadUrl(linuxDeb, manifest)
  };

  const bindings = [
    ["dl-win-installer", urls.winInstaller, winInstaller?.file],
    ["dl-win-portable", urls.winPortable, winPortable?.file],
    ["dl-win-portable-zip", urls.winPortableZip, winPortableZip?.file],
    ["dl-linux-appimage", urls.linuxApp, linuxApp?.file],
    ["dl-linux-deb", urls.linuxDeb, linuxDeb?.file]
  ];

  let anyReady = false;
  bindings.forEach(([id, url, file]) => {
    const el = document.getElementById(id);
    setLink(el, url, Boolean(url), file);
    if (url) anyReady = true;
  });

  const primary =
    platform === "linux"
      ? urls.linuxApp || urls.linuxDeb
      : urls.winInstaller || urls.winPortable || urls.winPortableZip;

  setLink(heroBtn, primary, Boolean(primary), null);

  if (osHint) {
    const label =
      platform === "linux"
        ? "Linux"
        : platform === "windows"
          ? "Windows"
          : "your system";
    osHint.innerHTML = `Detected <strong>${label}</strong> — showing matching downloads.`;
  }

  if (noteEl) {
    noteEl.hidden = anyReady;
    if (!anyReady) {
      noteEl.textContent =
        "Downloads are being prepared. Check back soon or contact support.";
    }
  }

  const plusUrl = (manifest.plusCheckoutUrl || "").trim();
  const plusBtn = document.getElementById("plusCheckoutBtn");
  const plusBanner = document.getElementById("plusBanner");
  if (plusBtn && plusUrl) {
    plusBtn.href = plusUrl;
    plusBtn.hidden = false;
  } else if (plusBanner && !plusUrl) {
    plusBanner.hidden = true;
  }
}

async function renderChecksums(manifest) {
  try {
    const res = await fetch("checksums.json", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const panel = document.getElementById("checksumPanel");
    const list = document.getElementById("checksumList");
    if (!panel || !list || !data.files) return;
    panel.hidden = false;
    list.innerHTML = "";

    const sizeMap = {
      [manifest?.windows?.installer?.file]: "size-win-installer",
      [manifest?.windows?.portable?.file]: "size-win-portable",
      [manifest?.windows?.portableZip?.file]: "size-win-portable-zip",
      [manifest?.linux?.appimage?.file]: "size-linux-appimage",
      [manifest?.linux?.deb?.file]: "size-linux-deb"
    };

    for (const [name, info] of Object.entries(data.files)) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${name}</strong> <span class="dl-size-inline">${formatBytes(info.bytes)}</span><code>${info.sha256}</code>`;
      list.appendChild(li);

      const sizeId = sizeMap[name];
      const sizeEl = sizeId ? document.getElementById(sizeId) : null;
      if (sizeEl) sizeEl.textContent = formatBytes(info.bytes);
    }
  } catch {
    /* optional */
  }
}

async function init() {
  try {
    const res = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const manifest = await res.json();
    await renderDownloads(manifest);
    await renderChecksums(manifest);
  } catch (err) {
    console.warn("Could not load downloads.json", err);
    const noteEl = document.getElementById("downloadNote");
    if (noteEl) {
      noteEl.hidden = false;
      noteEl.textContent =
        "Could not load download links. Open this site through a local server (see website/README.md).";
    }
  }
}

document.getElementById("heroDownloadBtn")?.addEventListener("click", (e) => {
  if (e.currentTarget.classList.contains("is-disabled")) {
    e.preventDefault();
    document.getElementById("download")?.scrollIntoView({ behavior: "smooth" });
  }
});

init();
