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
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Firefox and navigate to `about:debugging`
5. Click "This Firefox" → "Load Temporary Add-on"
6. Select the `dist/manifest.json` file

### Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch mode (auto-rebuild on changes)
npm run dev
```

## Usage

### Initial Setup

1. Click the ZeroConnectWallet icon in your Firefox toolbar
2. Add your Ethereum address(es) in the configuration textarea
   - One address per line, or comma-separated
   - Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f1F0D8`
3. Select your preferred network from the dropdown
4. (Optional) Enter a custom RPC endpoint, or leave empty for defaults
5. Click "Save Configuration"

### Connecting to dApps

1. Visit any DeFi application (e.g., Uniswap, Aave, Compound)
2. Click "Connect Wallet" on the dApp
3. The extension will:
   - Auto-connect if you have only one address configured
   - Show a popup to select which address to use if you have multiple
4. The dApp will show you as connected and can read your balances

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

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
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
