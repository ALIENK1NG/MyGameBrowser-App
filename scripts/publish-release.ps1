# Permanent publish helper for Alienizor+ install site + GitHub Release.
# Requires: gh auth login
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$owner = "ALIENK1NG"
$repo = "MyGameBrowser-App"
$ver = (Get-Content ..\Alienizor-Plus\package.json -Raw | ConvertFrom-Json).version
if (-not $ver) { $ver = "1.1.0" }
$tag = "v$ver"
$pagesUrl = "https://$($owner.ToLowerInvariant()).github.io/$repo/"
$plusDist = Join-Path (Split-Path $root -Parent) "Alienizor-Plus\dist"

Write-Host ""
Write-Host "Alienizor+ permanent publish"
Write-Host "  version: $ver"
Write-Host "  pages:   $pagesUrl"
Write-Host ""

gh auth status | Out-Host

if (-not (Test-Path .git)) {
  git init
  git branch -M main
}

$remote = $null
try { $remote = git remote get-url origin 2>$null } catch {}
if (-not $remote) {
  Write-Host "Ensuring GitHub repo $owner/$repo exists..."
  gh repo view "$owner/$repo" 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) {
    gh repo create "$owner/$repo" --public --source=. --remote=origin --description "Alienizor+ game browser and install site"
  } else {
    git remote add origin "https://github.com/$owner/$repo.git"
  }
}

npm run website:downloads
npm run site:seo

# Stage website + workflow only (avoid dumping local app clutter if possible)
git add website .github HOSTING.md GO-LIVE.md package.json scripts/sync-website-downloads.mjs scripts/generate-site-seo.mjs scripts/publish-website.ps1 scripts/publish-website-url.mjs scripts/publish-release.ps1 .gitignore
$status = git status --porcelain
if ($status) {
  git commit -m "Publish Alienizor+ install site and update feed for v$ver"
}

git push -u origin main

Write-Host "Creating/updating GitHub Release $tag ..."
$assets = @(
  (Join-Path $plusDist "Alienizor+ Setup $ver.exe"),
  (Join-Path $plusDist "Alienizor+ Setup $ver.exe.blockmap"),
  (Join-Path $plusDist "Alienizor+ $ver.exe"),
  (Join-Path $plusDist "latest.yml")
) | Where-Object { Test-Path $_ }

$zip = Join-Path $root "website\downloads\Alienizor+-$ver-windows-portable.zip"
if (Test-Path $zip) { $assets += $zip }

gh release view $tag --repo "$owner/$repo" 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
  gh release upload $tag @assets --repo "$owner/$repo" --clobber
} else {
  gh release create $tag @assets --repo "$owner/$repo" --title "Alienizor+ $ver" --notes "Alienizor+ $ver Windows installer and portable builds. Auto-update feed included (latest.yml)."
}

Write-Host ""
Write-Host "Done."
Write-Host "  Install site: $pagesUrl"
Write-Host "  Release:      https://github.com/$owner/$repo/releases/tag/$tag"
Write-Host "  On GitHub: Settings → Pages → Source = GitHub Actions (if first time)"
Write-Host ""
