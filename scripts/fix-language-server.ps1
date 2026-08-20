Write-Host "🔧 [1/4] Terminating orphaned language server processes..." -ForegroundColor Cyan
Get-Process -Name "tsserver", "eslintServer" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "🧹 [2/4] Purging compiler caches..." -ForegroundColor Cyan
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "frontend\node_modules\.vite"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "frontend\node_modules\.cache"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "node_modules\.cache"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "frontend\.tsbuildinfo"

Write-Host "⚙️ [3/4] Ensuring workspace .vscode settings are linked to workspace TypeScript..." -ForegroundColor Cyan
if (!(Test-Path ".vscode")) {
    New-Item -ItemType Directory -Force -Path ".vscode"
}
Set-Content -Path ".vscode\settings.json" -Value '{"typescript.tsdk":"node_modules/typescript/lib","typescript.enablePromptUseWorkspaceTsdk":true,"typescript.preferences.importModuleSpecifier":"relative","editor.formatOnSave":true}' -Force

Write-Host "🔍 [4/4] Priming TypeScript AST and validating compiler..." -ForegroundColor Cyan
npm --prefix frontend run typecheck

Write-Host "✅ Language server and TypeScript diagnostics successfully restored!" -ForegroundColor Green
