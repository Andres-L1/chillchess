#!/bin/bash

# ChillChess - Advanced Tooling Installation Script
# This script installs all development tools for improved code quality

echo "🚀 Installing ChillChess Advanced Tooling..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Installing testing dependencies...${NC}"
npm install -D vitest @vitest/ui jsdom
npm install -D @testing-library/svelte @testing-library/jest-dom

echo ""
echo -e "${BLUE}🪝 Installing git hooks and linting tools...${NC}"
npm install -D husky lint-staged
npm install -D @commitlint/cli @commitlint/config-conventional

echo ""
echo -e "${BLUE}📊 Installing performance monitoring...${NC}"
npm install web-vitals

echo ""
echo -e "${BLUE}⚙️  Setting up Husky...${NC}"
npx husky install

# Make hooks executable (Unix/Mac)
if [ -f ".husky/pre-commit" ]; then
    chmod +x .husky/pre-commit
fi

if [ -f ".husky/commit-msg" ]; then
    chmod +x .husky/commit-msg
fi

echo ""
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo ""
echo -e "${YELLOW}📚 Next Steps:${NC}"
echo "  1. Run tests: npm test"
echo "  2. Check linting: npm run lint"
echo "  3. Format code: npm run format"
echo ""
echo -e "📖 Read ${BLUE}.agent/TOOLING_SETUP.md${NC} for detailed documentation"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
