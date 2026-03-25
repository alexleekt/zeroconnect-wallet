# Automated Mozilla Submission

You can automate submission to Mozilla Add-ons using `web-ext sign`.

## Prerequisites

1. **Get API Credentials**
   - Go to: https://addons.mozilla.org/en-US/developers/addon/api/key/
   - Generate JWT credentials
   - Save the `JWT issuer` (API key) and `JWT secret` (API secret)

## Usage

### Option 1: Environment Variables (Recommended)

```bash
export AMO_API_KEY="user:123456:789"
export AMO_API_SECRET="your-secret-here"

just submit-unlisted
```

### Option 2: Inline

```bash
AMO_API_KEY="user:123456:789" AMO_API_SECRET="your-secret-here" just submit-unlisted
```

## What Happens

1. ✅ Validates the extension locally
2. ✅ Packages the XPI
3. ✅ Uploads to Mozilla Add-ons
4. ✅ Uploads source code
5. ✅ Submits for review (unlisted)
6. ⏳ Waits for automated validation
7. 📧 You get an email when approved

## After Submission

### Download Signed XPI

Once approved (usually 1-24 hours):

1. Go to: https://addons.mozilla.org/en-US/developers/addons
2. Click on "ZeroConnectWallet"
3. Go to "Versions" tab
4. Download the signed XPI
5. Upload to GitHub Releases

### Or Use web-ext to Download

The signed XPI is automatically downloaded to `web-ext-artifacts/` directory after approval.

## GitHub Actions Integration

You can also automate this in GitHub Actions. See `.github/workflows/release.yml` for the manual release workflow, or add automated signing:

```yaml
- name: Sign with Mozilla
  uses: kewisch/action-web-ext@v1
  with:
    cmd: sign
    source: zeroconnect-wallet.xpi
    channel: unlisted
    apiKey: ${{ secrets.AMO_API_KEY }}
    apiSecret: ${{ secrets.AMO_API_SECRET }}
```

**Note:** For security, don't run automated signing on every commit. Only on releases.

## Troubleshooting

### "Approval timeout"

Normal! The extension needs manual review. You'll get an email when approved.

### "Version already exists"

Bump the version in `manifest.json` and `package.json`, then retry.

### "Invalid API credentials"

Double-check your credentials at:
https://addons.mozilla.org/en-US/developers/addon/api/key/

## Security Notes

- **Never commit API credentials to git**
- **Use GitHub Secrets for CI/CD**
- **Rotate credentials periodically**
