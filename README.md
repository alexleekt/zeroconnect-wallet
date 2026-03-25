# ZeroConnectWallet

A read-only Firefox extension that mimics MetaMask's EIP-1193 provider API. Connect to DeFi applications without storing private keys - perfect for viewing balances and portfolio tracking.

## Features

- **Read-Only Wallet**: No private keys stored, ever
- **MetaMask Compatible**: Injects `window.ethereum` provider that works with most dApps
- **Multiple Addresses**: Configure one or many addresses
- **Firefox Sync**: Settings sync across devices via Firefox Account
- **Address Auto-Select**: Remembers your last connected address
- **Chain Support**: Ethereum, Polygon, Arbitrum, Optimism, Base, and Sepolia
- **Signing Notifications**: Shows notification when dApp tries to sign (rejected)

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Run `bun install` to install dependencies
3. Run `just build` to build the extension
4. Open Firefox and navigate to `about:debugging`
5. Click "This Firefox" → "Load Temporary Add-on"
6. Select the `dist/manifest.json` file

### Development

```bash
# Install dependencies
bun install

# Build for production
just build

# Watch mode (auto-rebuild on changes)
just dev

# Type check
just typecheck

# Lint and format check
just check

# Fix lint and format issues
just fix

# Full CI check
just ci
```

## Usage

### Current Implementation (Hardcoded Address)

This version uses a hardcoded address for immediate testing:
- **Address:** `0x8364f08a5b8737f07BE54b982A2089Cf70d73966`
- No configuration needed - works out of the box

**To use:**
1. Install the extension
2. Visit any DeFi application (e.g., Uniswap, Aave, Compound)
3. Click "Connect Wallet"
4. The extension automatically connects with the hardcoded address

### Planned Features

The popup UI includes configuration features for future releases:
- Custom address configuration
- Network selection (Ethereum, Polygon, Arbitrum, etc.)
- Custom RPC endpoints
- Firefox Sync support

### What Works

- Viewing balances and portfolio data
- Reading transaction history
- Viewing position information
- Network switching

### What Doesn't Work (By Design)

- Sending transactions
- Signing messages
- Approving token spend limits
- Any operation requiring a private key

When a dApp tries to initiate a transaction, you'll see a notification explaining that ZeroConnectWallet is read-only.

## How It Works

### Architecture

1. **Content Script** (`content/index.js`): Injected into all web pages
2. **Provider** (`content/provider.ts`): Implements EIP-1193 standard
3. **Injected Script** (`content/injected.js`): Runs in page context, exposes `window.ethereum`
4. **Background Script** (`background/index.js`): Manages state and RPC forwarding
5. **Popup** (`popup/`): Configuration UI and address selector

### Storage

- Uses `browser.storage.sync` (Firefox Sync) for cross-device settings
- Falls back to `browser.storage.local` if sync unavailable
- Stores: addresses, chainId, rpcUrl, lastConnectedAddress

### Firefox Sync

**Requirements for sync to work:**
1. Sign into Firefox Account on all devices
2. Enable Sync in Firefox settings
3. Install the extension on each device
4. Configure addresses on one device

**Important:** When you remove the extension, Firefox deletes all its data (including synced data). This is expected behavior for privacy/security. To keep your configuration:
- Don't remove the extension, just disable it
- Or note down your configured addresses before removing

**Debugging sync issues:**
- Check browser console for "Config: Sync storage result" logs
- Verify you're signed into Firefox Account
- Check `about:preferences#sync` to ensure sync is enabled

### Security

- No private keys, seed phrases, or secrets stored
- Read-only RPC calls forwarded to public endpoints
- All signing requests rejected with user notification
- CSP-compliant code injection

## Configuration

### Supported Networks

| Chain | Chain ID | Default RPC |
|-------|----------|-------------|
| Ethereum Mainnet | 0x1 | https://eth.llamarpc.com |
| Sepolia Testnet | 0xaa36a7 | Public endpoint |
| Polygon | 0x89 | Public endpoint |
| Arbitrum One | 0xa4b1 | Public endpoint |
| Optimism | 0xa | Public endpoint |
| Base | 0x2105 | Public endpoint |

### Custom RPC

You can specify your own RPC endpoint for better performance or privacy:
- Alchemy: `https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY`
- Infura: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`
- QuickNode: `https://YOUR_SUBDOMAIN.quiknode.pro/YOUR_TOKEN/`

## Project Structure

```
web3-wallet-shim/
├── manifest.json          # Extension manifest
├── package.json           # Dependencies
├── src/
│   ├── content/          # Content scripts
│   │   ├── index.ts      # Content script entry
│   │   ├── provider.ts   # EIP-1193 provider
│   │   └── injected.ts   # Page injection script
│   ├── background/       # Background script
│   │   └── index.ts      # Message router & state
│   ├── popup/           # Extension popup UI
│   │   ├── index.html
│   │   ├── index.ts
│   │   └── styles.css
│   ├── shared/          # Shared utilities
│   │   ├── types.ts     # TypeScript types
│   │   ├── config.ts    # Configuration management
│   │   └── messages.ts  # Message protocol
│   └── assets/          # Icons
└── dist/                # Build output
```

## Development

Uses [bun](https://bun.sh/) for package management and [just](https://github.com/casey/just) for task running.

```bash
just build     # Build for production
just dev       # Watch mode
just typecheck # Type check
just check     # Lint and format check
just fix       # Fix lint and format issues
just ci        # Full CI check
```

## Limitations

- Firefox only (Manifest v2)
- Cannot sign transactions (by design)
- Read-only wallet, not suitable for trading
- Some dApps may not recognize it as MetaMask (despite `isMetaMask: true`)

## License

MIT

## Contributing

Pull requests welcome! This is a simple utility extension - keep it lightweight and focused on read-only wallet connections.
