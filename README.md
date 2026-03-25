# ZeroConnectWallet

A read-only Firefox extension that mimics MetaMask for connecting to DeFi apps without storing private keys.

## Quick Start

```bash
# Install dependencies
bun install

# Run in development mode
just dev

# Ship a new release (auto-increments version)
just ship
```

## Installation

Download the latest signed XPI from [Releases](../../releases) and install in Firefox via `about:addons` → Install from File.

## Development

```bash
just dev        # Watch mode
just clean      # Clean build files
```

## Releasing

### One-time Setup

1. Get Mozilla API credentials: https://addons.mozilla.org/en-US/developers/addon/api/key/
2. Run `just setup` to create `.env`
3. Add credentials to `.env`:
   ```
   AMO_API_KEY=user:xxx:xxx
   AMO_API_SECRET=xxx
   ```

### Ship It

```bash
just ship        # Auto-increment version (1.0.2 -> 1.0.3)
just ship 1.1.0  # Or specify version manually
```

This will:
- ✅ Build the extension
- ✅ Submit to Mozilla for signing
- ✅ Create git tag (triggers GitHub Actions)
- 🤖 **GitHub Actions automatically fetches signed XPI within 24h**

### How It Works

**Fully Automated (CI/CD):**
1. You run `just ship`
2. GitHub Actions submits to Mozilla
3. GitHub Actions polls hourly for the signed version
4. Signed XPI automatically appears in GitHub release (within 24h)

**Manual Override (if needed):**
```bash
just fetch 1.0.3   # Manually download and upload signed XPI
```

## Features

- **Read-Only**: No private keys ever stored
- **MetaMask Compatible**: Works with most DeFi apps
- **Multi-Chain**: Ethereum, Polygon, Arbitrum, Optimism, Base, Sepolia
- **Firefox Sync**: Settings sync across devices

## License

MIT
