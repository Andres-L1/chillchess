# ChillChess - Advanced Tooling Installation Script (PowerShell)
# This script installs all development tools for improved code quality

Write-Host "🚀 Installing ChillChess Advanced Tooling..." -ForegroundColor Blue
Write-Host ""

Write-Host "📦 Installing testing dependencies..." -ForegroundColor Cyan
npm install -D vitest @vitest/ui jsdom
npm install -D @testing-library/svelte @testing-library/jest-dom

Write-Host ""
Write-Host "🪝 Installing git hooks and linting tools..." -ForegroundColor Cyan
npm install -D husky lint-staged
npm install -D @commitlint/cli @commitlint/config-conventional

Write-Host ""
Write-Host "📊 Installing performance monitoring..." -ForegroundColor Cyan
npm install web-vitals

Write-Host ""
Write-Host "⚙️  Setting up Husky..." -ForegroundColor Cyan
npx husky install

Write-Host ""
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Run tests: npm test"
Write-Host "  2. Check linting: npm run lint"
Write-Host "  3. Format code: npm run format"
Write-Host ""
Write-Host "📖 Read .agent/TOOLING_SETUP.md for detailed documentation" -ForegroundColor Blue
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Green
