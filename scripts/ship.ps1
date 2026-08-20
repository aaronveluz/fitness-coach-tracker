param (
    [string]$Message = "feat: auto-deploy updates to production"
)

Write-Host "🔨 [1/3] Compiling frontend production bundle..." -ForegroundColor Cyan
npm --prefix frontend run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Aborting auto-deployment." -ForegroundColor Red
    exit 1
}

Write-Host "📦 [2/3] Staging and committing changes..." -ForegroundColor Cyan
git add .
git commit -m "$Message"

Write-Host "🚀 [3/3] Pushing to GitHub (origin/main) to trigger automatic Vercel deployment..." -ForegroundColor Green
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Successfully deployed to GitHub! Vercel is now building the latest release live." -ForegroundColor Green
} else {
    Write-Host "⚠️ Git push encountered an issue. Please verify your connection." -ForegroundColor Yellow
}
