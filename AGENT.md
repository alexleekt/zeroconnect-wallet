# Agent Guidelines - ZeroConnectWallet

## Project Overview

This is a Firefox WebExtension that provides a read-only wallet interface mimicking MetaMask's EIP-1193 provider API. The extension allows users to connect to DeFi applications and view balances without storing private keys.

## Architecture

### Extension Structure
- **Content Scripts** (`src/content/`): Injected into web pages, handles provider injection
- **Background Script** (`src/background/`): Event-driven script managing state and RPC calls
- **Popup UI** (`src/popup/`): Extension popup for configuration
- **Shared** (`src/shared/`): Types, configuration, and message protocols

### Key Components

| Component | Responsibility |
|-----------|---------------|
| `content/index.ts` | Content script entry point, message forwarding |
| `content/provider.ts` | EIP-1193 provider implementation |
| `content/injected.ts` | Injected script exposing `window.ethereum` |
| `background/index.ts` | Message router, state management, RPC forwarding |
| `popup/index.ts` | Configuration UI logic |
| `shared/config.ts` | Storage management (sync/local) |

## Communication Flow

### Request Flow (dApp → Background)
```
dApp → window.ethereum (injected) → postMessage → Content Script → browser.runtime.sendMessage → Background Script
```

### Response Flow (Background → dApp)
```
Background Script → sendResponse → Content Script → postMessage → Injected Script → dApp
```

## Development Workflow

### Building

**ALWAYS rebuild after making changes:**

```bash
npm run build
```

**Then reorganize the dist folder:**

```bash
cp manifest.json dist/ && \
mkdir -p dist/assets && \
cp src/assets/icon-48.png dist/assets/ && \
cp src/assets/icon-96.png dist/assets/ && \
mv dist/src/popup/index.html dist/popup/ 2>/dev/null || true && \
mv dist/popup/popup.js dist/popup/index.js 2>/dev/null || true && \
mv dist/popup/popup.css dist/popup/styles.css 2>/dev/null || true && \
mv dist/injected/index.js dist/content/injected.js 2>/dev/null || true && \
rmdir dist/src/popup dist/src 2>/dev/null || true && \
rmdir dist/injected 2>/dev/null || true && \
sed -i '' 's|../../popup/popup.js|./index.js|g' dist/popup/index.html 2>/dev/null || true && \
sed -i '' 's|../../popup/popup.css|./styles.css|g' dist/popup/index.html 2>/dev/null || true
```

### Testing Changes

After rebuilding:

1. Go to `about:debugging` in Firefox
2. Find ZeroConnectWallet
3. Click **"Reload"** button (not just the page refresh)
4. Test on a dApp

### Debugging

**Always check multiple consoles:**

1. **Web page console** (F12): Provider/injected script logs
2. **Content script console**: Content script logs
3. **Background script console**: Click "Inspect" in `about:debugging`

## Code Conventions

### TypeScript

- Use explicit types for function parameters and return values
- Avoid `any` types - use `unknown` with type guards
- Follow existing patterns in each file

### Firefox Extension APIs

**Use `browser.*` API, not `chrome.*`:**

```typescript
// Correct
await browser.storage.sync.get('key')
browser.runtime.sendMessage({...})

// Incorrect  
chrome.storage.sync.get('key')
chrome.runtime.sendMessage({...})
```

**Message Passing Pattern:**

```typescript
// Background script listener
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    const result = await handleMessage(message);
    sendResponse(result);
  })();
  return true; // Keep channel open for async
});
```

### Error Handling

Always handle errors gracefully:

```typescript
try {
  const response = await browser.runtime.sendMessage({...});
  if (!response) {
    throw new Error('No response from background');
  }
  return response;
} catch (error) {
  console.error('Message failed:', error);
  throw error;
}
```

## File Organization

### Source Files

- Keep all source in `src/` directory
- Build output goes to `dist/` (gitignored)
- Assets in `src/assets/`

### Never Edit Directly

- `dist/*` - Generated files, will be overwritten
- `node_modules/*` - Package files

## Manifest V2 Constraints

This extension uses Manifest V2 for Firefox compatibility:

- **Background script**: Must use `persistent: false` (event pages)
- **Permissions**: Explicitly declare all needed permissions
- **Content scripts**: Run at `document_start`

## Common Issues

### "browser is not defined"

- **Cause**: Code running in wrong context (e.g., injected script accessing `browser`)
- **Fix**: Use `window.postMessage` to communicate from injected to content script

### Messages not received

- **Cause**: Background script not loaded (Manifest V2 event pages sleep)
- **Fix**: Check background console for "Background script starting..." log

### Echo response (request comes back as response)

- **Cause**: Background script not handling the message properly
- **Fix**: Ensure `return true` from listener and call `sendResponse()`

## Testing Checklist

Before considering a feature complete:

- [ ] Extension reloads without errors
- [ ] Background script console shows startup message
- [ ] Content script logs appear in web console
- [ ] Provider is injected (`window.ethereum` exists)
- [ ] Connection flow works end-to-end
- [ ] No errors in any console

## Performance Considerations

- Keep popup bundle size small (<100KB)
- Minimize DOM operations in content scripts
- Use debouncing for rapid-fire RPC calls
- Clean up event listeners properly

## Security Rules

- **NEVER** store or handle private keys
- **NEVER** log sensitive data (addresses are OK, keys are not)
- Validate all addresses with regex: `/^0x[a-fA-F0-9]{40}$/`
- Sanitize all inputs before storage
- Use CSP-compliant code injection methods

## Version Control

### Commit Messages

Use conventional commits:

```
feat: add support for multiple addresses
fix: resolve connection timeout issue
docs: update README with installation steps
refactor: simplify message passing logic
```

### Files to Commit

**Include:**
- `src/*` - All source files
- `manifest.json` - Extension manifest
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `vite.config.ts` - Build config
- `README.md` - Documentation
- `.gitignore` - Git ignore rules

**Exclude:**
- `dist/*` - Build output
- `node_modules/*` - Dependencies
- `*.log` - Log files

## Communication Style

- Be direct and clear about what works/doesn't work
- Ask before making significant architecture changes
- Explain the "why" behind Firefox extension quirks
- When debugging, check ALL the consoles (page, content, background)

## Emergency Revert

If something breaks completely:

```bash
git checkout HEAD -- src/
npm run build
# Then reorganize dist folder as usual
```

## Useful Commands

```bash
# Quick rebuild
npm run build

# Watch mode for development
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

**Last Updated:** 2026-03-24
**Version:** 1.0
