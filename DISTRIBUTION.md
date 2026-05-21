# Distribution Guide for Developers

## Background

Mozilla Add-ons (AMO) permanently disabled the ZeroConnectWallet listing, interpreting our implementation of the open [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) wallet provider standard as "deceptive or misleading" impersonation of MetaMask.

This document explains how we now build, release, and distribute the extension outside of AMO.

## The Ban — What Happened

Mozilla's review flagged the extension for:
> "Deceptive or misleading: This content does not comply with Mozilla's prohibition of deceptive, misleading, or fraudulent activity"

The reviewer's reasoning appeared to be:
- The extension injects a provider at `window.ethereum` (standard EIP-1193 behavior)
- The README described this as "mimics MetaMask's EIP-1193 provider API"
- A non-technical reviewer interpreted "mimics" as "impersonates"

**Why this is incorrect:**
- EIP-1193 is an open technical specification, not a MetaMask trademark
- Every major Ethereum wallet (Rabby, Phantom, Brave Wallet, Coinbase Wallet) implements this same standard
- The extension contains zero MetaMask branding, logos, or visual elements
- The name "ZeroConnectWallet" is completely distinct

**Outcome:** The ban is permanent and cannot be appealed through the normal developer portal. The extension ID `zeroconnect-wallet@wafflepanda.com` is blacklisted.

## Distribution Strategy

### GitHub Releases (Primary)

All new versions are released as GitHub Releases with unsigned `.xpi` files.

**User experience:**
- Standard Firefox users: Must load temporarily via `about:debugging` per session
- Firefox Nightly / Developer Edition users: Can disable `xpinstall.signatures.required` for permanent install
- Firefox for Android: Same constraints — temporary on Release, permanent on Nightly

**Pros:** Full control, no review delays, transparent  
**Cons:** Unsigned extensions can't auto-update in standard Firefox; users must manually check for updates

### What We Distribute

| File | Description |
|------|-------------|
| `zeroconnect-wallet.xpi` | Unsigned extension package (built from `dist/`) |
| `source-code.zip` | Full source code for audit/review |

### What We No Longer Do

- ❌ Submit to AMO (`web-ext sign`)
- ❌ Expect Mozilla signing
- ❌ Auto-update through AMO

## Release Process

### Step 1: Version Bump

```bash
# Manual version bump (or edit manifest.json directly)
# Update version in manifest.json and package.json
```

### Step 2: Build and Verify

```bash
just ci
```

This runs:
- `tsc --noEmit` (type checking)
- `biome check .` (linting)
- `vite build` (production build)
- `web-ext lint --source-dir ./dist` (manifest validation)

### Step 3: Create GitHub Release

```bash
just release
```

This command:
1. Verifies the build is clean
2. Creates a git tag (e.g., `v1.0.4`)
3. Pushes the tag
4. Creates a GitHub Release using `gh release create`
5. Attaches the unsigned XPI and source code zip

> **Note:** The old `just ship` command included AMO submission via `web-ext sign`. This has been removed since AMO submission will always fail now.

### Step 4: Update Release Notes

Edit the GitHub Release to include:
- What's new in this version
- Installation instructions (link to README)
- Note about the AMO situation (transparency)

## User Communication

### What Users Need to Know

1. **The extension is safe** — same code, same security model, just a different distribution channel
2. **Installation requires an extra step** — no one-click AMO install anymore
3. **Temporary installation is session-only** — they need to re-load after restart (or use Nightly)
4. **Settings persist** — even temporary unloading doesn't delete local storage data

### What to Emphasize

- Open source and auditable
- Read-only by design
- No private keys ever
- The AMO ban was a policy interpretation, not a security finding

## Future Considerations

### Alternative Distribution Channels

| Channel | Feasibility | Notes |
|---------|-------------|-------|
| Chrome Web Store | Low | Same EIP-1193 provider injection may trigger similar policy issues |
| Self-hosted with `update_url` | Limited | Unsigned extensions can't auto-update in standard Firefox |
| Firefox Nightly only | Possible | Could market specifically to Nightly users with signing disabled |
| Build from source | Always works | Power users can always clone and `just ci` |

### Technical Notes

**Why `web-ext sign` won't work:**
- The extension ID is blacklisted at the account level
- Any submission with this ID is auto-rejected
- Creating a new AMO account and new extension ID might work but:
  - Risks another ban for the same reason
  - Users would need to uninstall the old version and install the new one
  - Violates Mozilla's policy on circumventing bans

**Why we don't change the extension ID:**
- Existing users with v1.0.3 (signed) would lose their extension
- Firefox Sync ties extension data to the ID
- It's ethically questionable to circumvent a platform ban

## Developer Setup for Testing

### Loading the Extension Locally

```bash
# Build
just ci

# Load temporarily in Firefox
just dev        # Runs vite build --watch
```

Then:
1. Open Firefox → `about:debugging` → "This Firefox"
2. Click "Load Temporary Add-on..."
3. Select `dist/manifest.json`

### Testing on Android

```bash
just dev-android
```

This auto-detects your connected Android device and loads the extension temporarily in Firefox for Android.

## Legal / Policy Context

Mozilla's Add-on Policies state:
> "Add-ons must not be deceptive, misleading, or fraudulent."

The ambiguity is whether implementing an open web standard (EIP-1193) that happens to be popularized by MetaMask constitutes "deception." In the broader Ethereum ecosystem, it does not — it's interoperability. However, Mozilla's reviewers are not required to understand the nuances of Web3 standards.

We respect Mozilla's right to moderate their platform while disagreeing with the specific interpretation in this case. The extension is distributed outside AMO to respect their decision while still serving users who want a read-only wallet option.
