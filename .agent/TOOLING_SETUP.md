# ChillChess - Advanced Tooling Setup

This guide will install all development tools for improved code quality, testing, and monitoring.

## What will be installed:

1. **Husky** - Git hooks manager
2. **lint-staged** - Run linters on staged files
3. **Vitest** - Unit testing framework
4. **@testing-library/svelte** - Component testing utilities
5. **@testing-library/jest-dom** - Custom matchers  
6. **web-vitals** - Performance monitoring
7. **commitlint** - Conventional commits validation
8. **@sentry/sveltekit** - Error tracking (optional)

## Installation Steps

### 1. Install Dependencies

```bash
# Core testing dependencies
npm install -D vitest @vitest/ui jsdom
npm install -D @testing-library/svelte @testing-library/jest-dom

# Git hooks and linting
npm install -D husky lint-staged
npm install -D @commitlint/cli @commitlint/config-conventional

# Performance monitoring
npm install web-vitals

# Error tracking (optional - requires Sentry account)
# npm install @sentry/sveltekit
```

### 2. Initialize Husky

```bash
npx husky install
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### 3. Run Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui
```

### 4. Run Linting

```bash
# Check for lint errors
npm run lint

# Fix lint errors automatically
npm run lint:fix

# Check code formatting
npm run format:check

# Fix formatting
npm run format
```

## What Happens Now?

### On Every Commit:
1. **Pre-commit hook** runs:
   - ESLint fixes code issues
   - Prettier formats code
   - Only on staged files (fast!)

2. **Commit-msg hook** validates:
   - Commit message follows conventional format
   - Example: `feat: add new feature`
   - Fails if format is wrong

### During Development:
- Run `npm test` to execute unit tests
- Run `npm run lint` before pushing
- Web Vitals automatically track performance

## Commit Message Format

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `perf`: Performance
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```bash
git commit -m "feat: add volume control to music player"
git commit -m "fix: resolve dropdown closing issue on mobile"
git commit -m "docs: update README with new architecture"
```

## Troubleshooting

### Husky hooks not running?
```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### Tests failing?
Check that all dependencies are installed:
```bash
npm install
```

### Lint errors blocking commits?
Fix them first:
```bash
npm run lint:fix
npm run format
```

Or skip hooks temporarily (not recommended):
```bash
git commit --no-verify
```

## Performance Monitoring

Web Vitals are automatically tracked and logged. To view them:

1. Open Chrome DevTools
2. Go to Console
3. Look for `[WebVitals]` logs

Metrics tracked:
- **LCP** (Largest Contentful Paint): < 2.5s is good
- **FID** (First Input Delay): < 100ms is good
- **CLS** (Cumulative Layout Shift): < 0.1 is good

## CI/CD Integration (Future)

These tools are ready for CI/CD pipelines:

```yaml
# .github/workflows/ci.yml (example)
- name: Lint
  run: npm run lint
  
- name: Format Check
  run: npm run format:check
  
- name: Test
  run: npm test
```

---

**Setup Complete!** 🎉

Your codebase now has professional-grade tooling for quality, testing, and monitoring.
