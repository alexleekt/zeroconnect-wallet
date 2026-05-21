# ZeroConnectWallet

**Connect to DeFi apps without storing your private keys.**

ZeroConnectWallet is a read-only Firefox extension that implements the open [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) wallet provider standard. It lets you view balances, portfolio data, and interact with DeFi applications without ever exposing your private keys to a browser extension.

> **⚠️ Distribution Update:** This extension is no longer distributed through Mozilla Add-ons (AMO). See [Distribution Status](#distribution-status) below for details and installation instructions.

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

## Distribution Status

### Why AMO is no longer an option

Mozilla Add-ons permanently banned this extension under their "Deceptive or misleading" policy. The reviewer's interpretation was that implementing the EIP-1193 provider standard (which all Ethereum wallets use — MetaMask, Rabby, Phantom, Brave Wallet, Coinbase Wallet, etc.) and injecting it at `window.ethereum` constitutes "impersonating MetaMask."

This is a misunderstanding of an open technical standard, not a legitimate security concern. The extension:
- Contains **zero** MetaMask branding, logos, or colors
- Has a completely distinct name and UI
- Is **read-only by design** — it cannot and does not sign transactions
- Is fully open source for audit

However, Mozilla's decision is final for this listing. We are distributing the extension directly through GitHub Releases instead.

### What this means for you

| Firefox Version | Installation Method |
|-----------------|---------------------|
| **Standard Firefox (Release/Beta)** | [Temporary installation](#method-1-temporary-installation) — loads for the session, must re-install after browser restart |
| **Firefox Nightly / Developer Edition** | [Permanent installation](#method-2-permanent-installation-for-nightlydev-edition) with signing requirement disabled |
| **Firefox for Android** | Same as above — temporary on Release, permanent on Nightly |

### Method 1: Temporary Installation (Standard Firefox)

This works on all Firefox versions but the extension is removed when you close Firefox.

1. Download the latest `zeroconnect-wallet.xpi` from [GitHub Releases](../../releases)
2. Open Firefox and go to `about:debugging`
3. Click **"This Firefox"** (or **"This Nightly"**)
4. Click **"Load Temporary Add-on..."**
5. Select the downloaded `.xpi` file
6. The extension is now active for this session

**To re-install after restart:** Repeat steps 2–5. Your settings are preserved in Firefox's local storage even though the extension is unloaded.

### Method 2: Permanent Installation (for Nightly / Developer Edition)

If you use Firefox Nightly or Developer Edition, you can disable the signing requirement and install unsigned extensions permanently:

1. Open Firefox and go to `about:config`
2. Search for `xpinstall.signatures.required`
3. Set it to `false`
4. Download the latest `zeroconnect-wallet.xpi` from [GitHub Releases](../../releases)
5. Open `about:addons` → click the gear icon → **"Install Add-on From File"**
6. Select the downloaded `.xpi` file
7. The extension is now installed permanently

> ⚠️ Only use this on Nightly or Developer Edition. Standard Firefox ignores `xpinstall.signatures.required`.

### Previous Signed Version (v1.0.3)

The last Mozilla-signed version **v1.0.3** is still available on [GitHub Releases](../../releases/tag/v1.0.3). If you already have it installed, it will continue working. However, it does **not** include the Firefox for Android support or the responsive UI improvements added in v1.0.4.

## How It Works

1. **Configure your address(es):** Add one or more Ethereum addresses you want to use (no private keys needed!)
2. **Visit any DeFi site:** Uniswap, Aave, Compound, etc.
3. **Click "Connect Wallet":** The extension automatically connects with your configured address
4. **View your data:** See balances, positions, portfolio — all read-only
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
A: Yes! Firefox for Android is supported. Load it temporarily via `about:debugging` in Firefox Nightly for Android. The popup UI adapts to mobile screens, and address selection works inline within the popup. On Nightly, you can also disable `xpinstall.signatures.required` for permanent installation.

**Q: Why can't I install it from addons.mozilla.org anymore?**  
A: Mozilla banned the extension under a "deceptive" policy, interpreting the open EIP-1193 wallet standard as impersonation. We disagree with this interpretation, but the decision is final. The extension is now distributed directly through GitHub Releases. See [Distribution Status](#distribution-status) above.

**Q: Can I import multiple addresses?**  
A: Yes! Configure as many addresses as you want and switch between them.

**Q: Will my settings be lost when I re-install after browser restart?**  
A: No — your wallet addresses, network selection, and last-connected address are stored in Firefox's local storage and persist even when the extension is temporarily unloaded.

## Development

For developers who want to build from source or contribute:

```bash
# Install dependencies
bun install

# Run in development mode (desktop)
just dev

# Build and lint
just ci

# Test on Firefox for Android (requires connected device + adb)
just dev-android

# Create a GitHub release (AMO submission disabled — see justfile)
just release
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [DISTRIBUTION.md](./DISTRIBUTION.md) for more details.

## License

MIT License — See [LICENSE](./LICENSE)
