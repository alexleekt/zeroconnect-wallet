# Publishing to Mozilla Add-ons (Unlisted)

This guide walks through submitting ZeroConnectWallet to Mozilla Add-ons as an **unlisted** extension for distribution via GitHub Releases.

## Why Unlisted?

- **Faster review** than listed extensions
- **Signed XPI** that anyone can install
- **Not searchable** on addons.mozilla.org
- **You control distribution** via GitHub Releases

## Prerequisites

- Firefox account
- Extension files built (`just build` or GitHub Actions artifact)

## Step-by-Step Submission

### 1. Create Mozilla Account

1. Go to [addons.mozilla.org](https://addons.mozilla.org)
2. Click "Submit or manage extensions"
3. Create a Firefox Account or sign in
4. Accept developer agreement

### 2. Submit Extension

1. Click "Submit a New Add-on"
2. Choose **"On your own"** (unlisted)
3. Upload `zeroconnect-wallet.xpi`
4. Fill in details:
   - **Name**: ZeroConnectWallet
   - **Summary**: Read-only wallet extension for connecting to DeFi apps
   - **Description**: Mimics MetaMask's EIP-1193 provider API for read-only wallet connections. No private keys stored.
   - **Categories**: Privacy & Security, Other
   - **Support email**: Your email
   - **License**: MIT

### 3. Privacy Policy

Since this extension:
- Does NOT collect any user data
- Does NOT store private keys
- Only stores user-configured addresses locally

Use this simple privacy policy:

```
ZeroConnectWallet Privacy Policy

This extension does not collect, transmit, or share any user data.
All data (wallet addresses, settings) is stored locally in your browser.
No private keys or sensitive information is ever stored or transmitted.
```

Paste this in the "Privacy Policy" field.

### 4. Wait for Review

- **Automated review**: Usually minutes
- **Manual review**: 1-24 hours for unlisted extensions
- You'll get an email when complete

### 5. Download Signed XPI

Once approved:
1. Go to your extension's management page
2. Click "Versions"
3. Download the signed `.xpi` file
4. Rename it to `zeroconnect-wallet-v1.0.0.xpi` (include version)

### 6. Upload to GitHub Release

1. Go to GitHub repo → Releases
2. Click "Draft a new release"
3. Create tag: `v1.0.0`
4. Upload the **signed** XPI file
5. Add release notes
6. Publish

## Automating with web-ext (Optional)

You can sign via CLI instead of web UI:

```bash
# Install web-ext
npm install -g web-ext

# Sign the extension
web-ext sign --source-dir ./dist \
  --api-key $AMO_JWT_ISSUER \
  --api-secret $AMO_JWT_SECRET
```

Get API credentials from [AMO Developer Hub](https://addons.mozilla.org/en-US/developers/addon/api/key/).

## For Users Installing

Add this to README.md:

```markdown
## Installation

### From GitHub Releases (Signed)

1. Download the latest `zeroconnect-wallet-vX.X.X.xpi` from [Releases](../../releases)
2. Open Firefox → `about:addons`
3. Click gear icon → "Install Add-on From File"
4. Select the downloaded XPI file
5. Click "Add" when prompted

Note: This is a signed extension from Mozilla Add-ons, so it works in standard Firefox.
```

## Updating

For each new version:

1. Update `manifest.json` version
2. Build: `just build`
3. Package: `just package`
4. Submit to Mozilla (Step 2 above)
5. Wait for approval email
6. Download signed XPI
7. Create GitHub Release with new tag

## Troubleshooting

**"Source code required"**
- Mozilla may ask for source code if minified
- Upload a zip of the `src/` folder

**Review rejected**
- Common issues: missing privacy policy, unclear description
- Read the review feedback and resubmit

**Version number issues**
- Must follow semantic versioning
- Cannot reuse version numbers

## Timeline

- Submission: 5 minutes
- Automated review: 5-30 minutes  
- Manual review: 1-24 hours
- Total: Usually same day

## Contact

Mozilla Add-ons support: [extension-developers@mozilla.org](mailto:extension-developers@mozilla.org)
