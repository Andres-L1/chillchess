# Sentry Integration Guide

## Setup

### 1. Install Sentry SDK

```bash
npm install @sentry/sveltekit
```

### 2. Configure Sentry

Create `.env` entry:
```env
PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_AUTH_TOKEN=your_auth_token_here
```

### 3. Initialize Sentry

Create `src/hooks.client.ts`:

```typescript
import * as Sentry from '@sentry/sveltekit';
import { PUBLIC_SENTRY_DSN } from '$env/static/public';
import { dev } from '$app/environment';

if (!dev && PUBLIC_SENTRY_DSN) {
    Sentry.init({
        dsn: PUBLIC_SENTRY_DSN,
        tracesSampleRate: 1.0,
        environment: dev ? 'development' : 'production',
        // Performance Monitoring
        integrations: [
            new Sentry.BrowserTracing(),
            new Sentry.Replay({
                maskAllText: false,
                blockAllMedia: false,
            }),
        ],
        // Session Replay
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% of errors
    });
}

export const handleError = Sentry.handleErrorWithSentry();
```

Create `src/hooks.server.ts`:

```typescript
import * as Sentry from '@sentry/sveltekit';
import { SENTRY_DSN } from '$env/static/private';
import { dev } from '$app/environment';

if (!dev && SENTRY_DSN) {
    Sentry.init({
        dsn: SENTRY_DSN,
        tracesSampleRate: 1.0,
    });
}

export const handleError = Sentry.handleErrorWithSentry();
```

### 4. Update Logger to Send to Sentry

In `src/lib/utils/logger.ts`, replace the `sendToExternalService` method:

```typescript
private sendToExternalService(entry: LogEntry): void {
    if (typeof window !== 'undefined') {
        const Sentry = await import('@sentry/sveltekit');
        
        Sentry.captureException(new Error(entry.message), {
            level: entry.level === LogLevel.ERROR ? 'error' : 'warning',
            extra: entry.context,
            tags: {
                component: entry.context?.component || 'unknown',
            },
        });
    }
}
```

### 5. Add Source Maps for Better Debugging

Update `svelte.config.js`:

```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { sentrySvelteKit } from '@sentry/sveltekit';

const config = {
    // ... other config
    vite: {
        plugins: [
            sentrySvelteKit({
                sourceMapsUploadOptions: {
                    org: 'your-org',
                    project: 'chillchess',
                    authToken: process.env.SENTRY_AUTH_TOKEN,
                },
            }),
            sveltekit(),
        ],
    },
};

export default config;
```

## Usage

Errors are automatically captured. For manual reporting:

```typescript
import * as Sentry from '@sentry/sveltekit';

try {
    // risky operation
} catch (error) {
    Sentry.captureException(error, {
        tags: { section: 'music-player' },
        extra: { userId: user.id },
    });
}
```

## Benefits

- **Real-time error tracking** in production
- **Stack traces** with source maps
- **Session replays** to see what user did before error
- **Performance monitoring** for slow pages
- **Release tracking** to see which version has bugs

---

**Status:** Ready to implement (requires Sentry account)
