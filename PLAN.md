# Firefox Web3 Wallet Extension Plan

## Project Overview
A barebones Firefox extension that mimics MetaMask's EIP-1193 provider API for read-only wallet connections. No private keys or secrets stored. Allows users to connect to DeFi apps with a static list of addresses.

## Architecture

### Extension Structure
```
web3-wallet-extension/
├── manifest.json              # Firefox extension manifest
├── src/
│   ├── content/              # Content scripts (injects into web pages)
│   │   ├── index.ts          # Main content script entry
│   │   ├── provider.ts       # EIP-1193 provider implementation
│   │   └── injected.ts       # Script injected into page context
│   ├── background/           # Background/Service Worker script
│   │   └── index.ts          # Message handling, state management
│   ├── popup/               # Extension popup UI
│   │   ├── index.html
│   │   ├── index.ts
│   │   └── styles.css
│   ├── shared/              # Shared utilities
│   │   ├── types.ts         # TypeScript types (EIP-1193, messages)
│   │   ├── config.ts        # Address configuration
│   │   └── messages.ts      # Message passing protocol
│   └── assets/              # Icons and static assets
└── dist/                    # Build output
```

## Technical Specifications

### Manifest v2 (Firefox Compatibility)
- **manifest_version**: 2 (for maximum Firefox compatibility)
- **permissions**: 
  - `storage` - for persisting settings (uses `storage.sync` to sync across Firefox instances via Firefox Account)
  - `notifications` - to show rejection notifications
  - `activeTab` - for current tab access
  - `*://*/*` - inject on all sites
- **Content Security Policy**: Allow inline scripts for provider injection

### Core Components

#### 1. EIP-1193 Provider (content/provider.ts)
Implements the [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) standard:

```typescript
interface EthereumProvider {
  // Required
  request(args: RequestArguments): Promise<unknown>;
  
  // Events
  on(event: 'connect', handler: (info: ProviderInfo) => void): void;
  on(event: 'disconnect', handler: (error: ProviderError) => void): void;
  on(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
  on(event: 'chainChanged', handler: (chainId: string) => void): void;
  
  // Legacy MetaMask properties
  isMetaMask: boolean;
  selectedAddress: string | null;
  chainId: string;
  networkVersion: string;
}
```

**Request Methods to Support:**
- `eth_requestAccounts` - Returns configured addresses (opens popup if multiple)
- `eth_accounts` - Returns currently connected addresses
- `eth_chainId` - Returns configured chain ID (default: 0x1 for Ethereum mainnet)
- `wallet_switchEthereumChain` - Switch to a different chain (updates config)
- `eth_sendTransaction` - Reject with error + notification (read-only)
- `eth_sign` - Reject with error + notification (read-only)
- `personal_sign` - Reject with error + notification (read-only)
- `eth_signTypedData_v4` - Reject with error + notification (read-only)
- `eth_call`, `eth_getBalance`, etc. - Pass through to configured RPC endpoint

**Chain Handling:** Support one chain at a time (like MetaMask). User can switch chains via `wallet_switchEthereumChain` or popup settings.

#### 2. Content Script Injection (content/index.ts)
- Runs in page context
- Injects the EIP-1193 provider into `window.ethereum`
- Mimics MetaMask by setting `isMetaMask: true`
- Handles messages between page and background script

#### 3. Background Script (background/index.ts)
- Central message router
- Manages connection state
- Persists configuration
- Opens popup when needed

#### 4. Popup UI (popup/index.html, index.ts)
- Shows list of configured addresses
- Allow selection of which address to connect with
- Display connection status
- Simple settings (chain ID, RPC endpoint)

### Styling Approach

**Recommended: Plain CSS with CSS Custom Properties**

For a browser extension popup, keep styling simple and lightweight:

```
Popup dimensions: 360px x 600px (standard extension popup size)
```

**Why plain CSS over frameworks:**
- No build step complexity for styles
- Faster load times (critical for popup UX)
- Smaller bundle size
- Easier to maintain for simple UIs

**Implementation:**
- Use CSS custom properties (variables) for theming
- Support light/dark mode via `prefers-color-scheme`
- Use semantic HTML5 elements for structure
- Flexbox/Grid for layouts
- No external dependencies needed

**Structure:**
```css
/* styles.css */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --accent: #3b82f6;
  --border: #e5e5e5;
  --radius: 8px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2a2a2a;
    --text-primary: #ffffff;
  }
}
```

**About Tailwind CSS:**

Tailwind is **too heavy** for browser extensions without significant configuration:

- **Raw size**: ~3MB of CSS (unacceptable for extension popup)
- **Build complexity**: Requires PostCSS + PurgeCSS setup to strip unused styles
- **Configuration overhead**: Need custom `tailwind.config.js` with aggressive purging
- **Result**: Even with PurgeCSS, adds ~10-20KB for a simple popup vs <2KB with plain CSS

**Verdict**: For a simple popup with 2-3 screens (address list, settings, connection status), plain CSS is the pragmatic choice. Tailwind only makes sense if the UI becomes significantly more complex.

### Configuration (shared/config.ts)

```typescript
interface WalletConfig {
  // Static list of addresses to expose
  addresses: string[];
  
  // Default chain (Ethereum mainnet)
  chainId: string; // '0x1'
  
  // RPC endpoint for read operations
  rpcUrl: string; // 'https://eth.llamarpc.com' or similar
  
  // Display name
  walletName: string;
}
```

**Default Configuration:**
```javascript
{
  addresses: [], // User must configure
  chainId: '0x1', // Ethereum mainnet
  rpcUrl: 'https://eth.llamarpc.com',
  walletName: 'ZeroConnectWallet',
  lastConnectedAddress: null // Persisted across sessions via Firefox Sync
}
```

**Storage Strategy:**
- Use `browser.storage.sync` instead of `storage.local` to sync configuration across Firefox instances
- Requires user to be signed into Firefox Account
- Falls back to `storage.local` if sync is not available

### Message Passing Protocol (shared/messages.ts)

```typescript
// Messages from content script to background
type BackgroundMessage =
  | { type: 'CONNECT_REQUEST'; addresses: string[] }
  | { type: 'GET_CONFIG' }
  | { type: 'RPC_REQUEST'; method: string; params: unknown[] };

// Messages from background to popup
type PopupMessage =
  | { type: 'SHOW_ADDRESS_SELECTOR'; addresses: string[] }
  | { type: 'CONNECTION_APPROVED'; selectedAddress: string }
  | { type: 'CONNECTION_REJECTED' };
```

## User Flow

### Initial Setup
1. User installs extension
2. User opens extension popup
3. User adds addresses to configuration (comma-separated list)
4. User selects chain/network
5. Extension persists configuration

### Connecting to a DeFi App
1. User visits DeFi app (e.g., Uniswap)
2. App calls `window.ethereum.request({ method: 'eth_requestAccounts' })`
3. Provider checks if already connected:
   - If yes: return connected addresses
   - If no: send message to background script
4. Background checks:
   - If `lastConnectedAddress` exists and is in configured addresses: use it
   - If only 1 address configured: auto-connect to it
   - If multiple addresses: open popup for selection
5. User selects address in popup (or closes to reject)
6. Selected address is saved to `lastConnectedAddress` via sync storage
7. Provider emits `connect` and `accountsChanged` events
8. App shows user as connected

### Handling Signing Requests
When app tries to sign:
```javascript
// eth_sendTransaction, eth_sign, personal_sign, etc.
return Promise.reject({
  code: 4001,
  message: 'This is a read-only wallet. Use your actual wallet to sign transactions.'
});
```

## Build System

### Recommended: Vite + TypeScript
- Fast builds
- Hot module replacement for development
- Easy output to `dist/` folder
- TypeScript support out of the box

### Build Scripts
```json
{
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  }
}
```

## Security Considerations

1. **No Private Keys**: Extension never stores or handles private keys
2. **Content Script Isolation**: Provider injection uses proper isolation
3. **CSP Headers**: Strict content security policy
4. **Message Validation**: Validate all messages between contexts
5. **Origin Checking**: Verify message origins in background script

## Testing Strategy

1. **Unit Tests**: EIP-1193 provider methods
2. **Integration Tests**: Message passing between contexts
3. **Manual Testing**: 
   - Connect to popular DeFi apps (Uniswap, Aave, Compound)
   - Verify read-only behavior
   - Test rejection of signing requests

## Files to Create

### Configuration
- `manifest.json` - Extension manifest
- `package.json` - Dependencies and build scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Build configuration

### Source Code
- `src/shared/types.ts` - Type definitions
- `src/shared/config.ts` - Configuration management
- `src/shared/messages.ts` - Message protocol
- `src/content/index.ts` - Content script entry
- `src/content/provider.ts` - EIP-1193 provider
- `src/content/injected.ts` - Page injection script
- `src/background/index.ts` - Background script
- `src/popup/index.html` - Popup markup
- `src/popup/index.ts` - Popup logic
- `src/popup/styles.css` - Popup styles

### Assets
- `src/assets/icon-48.png` - Extension icon
- `src/assets/icon-96.png` - Extension icon (2x)

## Implementation Phases

### Phase 1: Core Structure
- Set up project with Vite + TypeScript
- Create manifest.json
- Implement basic message passing

### Phase 2: Provider Injection
- Implement EIP-1193 provider
- Inject into page context
- Handle basic requests (eth_accounts, eth_chainId)

### Phase 3: Popup UI
- Create address selection popup
- Implement connection flow
- Add configuration UI

### Phase 4: Read Operations
- Add RPC passthrough for read methods
- Test with real DeFi apps

### Phase 5: Polish
- Error handling
- Edge cases
- Documentation

## References

- [EIP-1193 Standard](https://eips.ethereum.org/EIPS/eip-1193)
- [MetaMask Provider API](https://docs.metamask.io/wallet/reference/provider-api/)
- [Firefox Extension Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [WebExtension Manifest v2](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)

## Open Questions

1. Should we support multiple chains simultaneously or one at a time?
2. Do we need to persist which address was last selected?
3. Should we show a notification when signing is rejected?
4. Any specific DeFi apps to prioritize testing with?
