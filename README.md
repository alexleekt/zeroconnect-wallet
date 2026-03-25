# ZeroConnectWallet

**Connect to DeFi apps without storing your private keys.**

ZeroConnectWallet is a read-only Firefox extension that mimics MetaMask's EIP-1193 provider API. It lets you view balances, portfolio data, and interact with DeFi applications without ever exposing your private keys to a browser extension.

## Why You Need This

**The Problem:** Most DeFi users face a dilemma:
- Import your wallet's private key into a browser extension (risky)
- Or miss out on using DeFi apps entirely

**The Risk:** Browser extensions can be compromised, phished, or contain vulnerabilities that expose your private keys and drain your funds.

**The Solution:** ZeroConnectWallet lets you:
- Connect to any DeFi app with a read-only wallet address
- View balances, portfolio data, and positions
- Interact with dApps without ever storing private keys
- Use multiple wallet addresses safely

## Installation

1. Download the latest `zeroconnect-wallet.xpi` from [Releases](../../releases)
2. Open Firefox and go to `about:addons`
3. Click the gear icon → "Install Add-on From File"
4. Select the downloaded `.xpi` file
5. Click "Add" when prompted

## How It Works

1. **Configure your address(es):** Add one or more Ethereum addresses you want to use (no private keys needed!)
2. **Visit any DeFi site:** Uniswap, Aave, Compound, etc.
3. **Click "Connect Wallet":** The extension automatically connects with your configured address
4. **View your data:** See balances, positions, portfolio - all read-only
5. **Stay safe:** Any attempt to sign transactions is automatically rejected with a notification

## Use Cases

- **Portfolio tracking:** View all your DeFi positions without importing keys
- **Price checking:** Check token prices and balances across protocols
- **Multi-account management:** Monitor several wallets from one extension
- **Safe browsing:** Explore new DeFi apps without risking your funds
- **Shared devices:** Use DeFi on shared computers safely

## Supported Chains

- Ethereum
- Polygon
- Arbitrum
- Optimism
- Base
- Sepolia (testnet)

## Security & Privacy

- **No private keys ever stored:** The extension only stores wallet addresses, never private keys or seed phrases
- **Read-only by design:** All signing attempts are rejected automatically
- **Local storage only:** Your data stays on your device (optionally synced via Firefox Sync)
- **Open source:** Full source code available for audit
- **No tracking:** No analytics, no data collection, no external calls except to your chosen RPC endpoint

## FAQ

**Q: Can I send transactions with this?**  
A: No, and that's intentional. This is read-only. For transactions, use your regular wallet (MetaMask, Rabby, etc.) in a separate browser profile.

**Q: Is this safe to use with my real wallet addresses?**  
A: Yes! Since we never store private keys, your funds are safe even if the extension is compromised.

**Q: Why would I use this instead of MetaMask?**  
A: Use this for browsing and viewing. Use MetaMask for actual transactions. It's like having a "view-only" mode for your DeFi experience.

**Q: Does this work with mobile Firefox?**  
A: Currently desktop Firefox only. Firefox for Android support coming soon.

**Q: Can I import multiple addresses?**  
A: Yes! Configure as many addresses as you want and switch between them.

## Development

For developers who want to build from source or contribute:

```bash
# Install dependencies
bun install

# Run in development mode
just dev

# Build extension
just build

# Create a release
just ship
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

MIT License - See [LICENSE](./LICENSE)
