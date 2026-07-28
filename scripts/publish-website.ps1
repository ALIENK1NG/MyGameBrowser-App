# Publish Alienizor install site to GitHub Pages (fixes 404 until repo exists + Pages is on).
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$owner = "ALIENK1NG"
$repo = "MyGameBrowser-App"
$pagesUrl = "https://$($owner.ToLower()).github.io/$repo/"

Write-Host ""
Write-Host "  Alienizor install page -> $pagesUrl"
Write-Host ""

if (-not (Test-Path .git)) {
  Write-Host "Initializing git..."
  git init
  git branch -M main
}

$remote = $null
try { $remote = git remote get-url origin 2>$null } catch {}

if (-not $remote) {
  Write-Host "No git remote yet."
  Write-Host "  1. Create repo: https://github.com/new?name=$repo"
  Write-Host "     (leave README empty - we push from here)"
  Write-Host "  2. Then run:"
  Write-Host "     git remote add origin https://github.com/$owner/$repo.git"
  Write-Host "     git add -A"
  Write-Host '     git commit -m "Add Alienizor project and install website"'
  Write-Host "     git push -u origin main"
  Write-Host "  3. On GitHub: Repo -> Settings -> Pages -> Source = GitHub Actions"
  Write-Host "  4. Wait for the Deploy install website workflow to finish."
  Write-Host ""
  exit 0
}

Write-Host "Pushing to origin..."
git add -A
$status = git status --porcelain
if ($status) {
  git commit -m "Update Alienizor install website"
}
git push -u origin main

Write-Host ""
Write-Host "After the Deploy install website Action succeeds (about 2 min):"
Write-Host "  $pagesUrl"
Write-Host ""

node (Join-Path $root "scripts\publish-website-url.mjs")
Write-Host "downloads.json updated with installPageUrl."
