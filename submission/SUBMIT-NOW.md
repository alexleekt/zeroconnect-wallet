# Mozilla Add-ons Submission Guide

## Quick Submit (5 minutes)

### Step 1: Login (30 seconds)
1. Go to: https://addons.mozilla.org/en-US/developers/
2. Click "Register for a developer account or log in"
3. Sign in with your Firefox account (or create one)
4. Accept the developer agreement (if shown)

### Step 2: Submit Extension (2 minutes)
1. Click "Submit a New Add-on"
2. Choose **"On your own"** (NOT "On this site")
3. Upload: `zeroconnect-wallet.xpi`
4. Wait for upload validation (10-30 seconds)

### Step 3: Fill Details (2 minutes)

**Required Fields:**

| Field | Value |
|-------|-------|
| **Name** | ZeroConnectWallet |
| **Summary** | Read-only wallet extension for connecting to DeFi apps without storing private keys |
| **Description** | (Copy from submission-details.txt or below) |
| **Categories** | Privacy & Security |
| **Support Email** | (Your email) |
| **License** | MIT License |

**Description to paste:**
```
ZeroConnectWallet mimics MetaMask's EIP-1193 provider API for read-only wallet connections. Connect to DeFi applications to view balances and portfolio data without storing private keys.

Features:
- Read-only wallet (no private keys stored, ever)
- MetaMask-compatible provider injection
- Multiple address support
- Firefox Sync support
- Chain support: Ethereum, Polygon, Arbitrum, Optimism, Base, Sepolia
- Automatic rejection of signing requests with user notification

This extension is designed for users who want to view DeFi portfolio data without importing private keys into browser extensions.
```

### Step 4: Privacy Policy (30 seconds)

1. Check "This add-on doesn't require any special privacy policy"
2. OR paste this in the privacy policy field:

```
This extension does not collect, transmit, or share any user data. All data (wallet addresses, settings) is stored locally in your browser. No private keys or sensitive information is ever stored or transmitted.
```

### Step 5: Submit (30 seconds)

1. Click "Submit Version"
2. Wait for the confirmation page
3. You'll see: "Version 1.0.0 has been submitted for review"

## What Happens Next

**Automated Review** (5-30 minutes):
- Scans for malware and obvious issues
- Validates manifest.json
- Checks permissions

**Manual Review** (1-24 hours for unlisted):
- Mozilla reviewer checks the code
- May ask questions if unclear
- Unlisted extensions get priority review

**Email Notification**:
- You'll get an email when approved
- Subject: "Your add-on has been approved"

## After Approval

1. Go to https://addons.mozilla.org/en-US/developers/addons
2. Click on "ZeroConnectWallet"
3. Go to "Versions" tab
4. Click "Download" next to v1.0.0
5. Save the signed XPI file
6. Upload it to your GitHub Release (replaces the unsigned one)

## Troubleshooting

**"Source code required" error:**
- Mozilla detected minified/obfuscated code
- Create a zip of your `src/` folder
- Upload as "Source Code"

**Review rejected:**
- Common: Unclear description, missing privacy policy
- Read the feedback email and resubmit
- Most issues are easily fixable

**"Invalid manifest" error:**
- Check manifest.json syntax
- Ensure `browser_specific_settings.gecko.id` is present
- Validate at https://jsonlint.com/

## Checklist

- [ ] Mozilla account created
- [ ] Logged into Developer Hub
- [ ] XPI file uploaded
- [ ] All required fields filled
- [ ] Privacy policy added
- [ ] Submitted for review
- [ ] Email confirmation received
- [ ] Approved notification received
- [ ] Signed XPI downloaded
- [ ] Uploaded to GitHub Release

## Time Estimate

- **Your time:** 5 minutes to submit
- **Mozilla's time:** 1-24 hours to review
- **Total:** Usually same day approval

## Questions?

- Mozilla Extension Workshop: https://extensionworkshop.com/
- Developer Support: https://discourse.mozilla.org/c/add-ons/
- Review Policies: https://extensionworkshop.com/documentation/publish/add-on-policies/
