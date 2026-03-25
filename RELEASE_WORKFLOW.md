# Release Workflow Guide

## Overview

This project has an automated release workflow that can:
1. Build unsigned extensions for testing
2. Sign extensions with Mozilla Add-ons automatically
3. Create GitHub releases with both signed and unsigned versions

## Workflow Options

### Option 1: Manual Workflow (Current)

**Best for:** First-time setup, learning the process

1. **Build locally**
   ```bash
   just build
   ```

2. **Submit to Mozilla manually**
   ```bash
   just submit-unlisted
   ```

3. **Wait for approval** (1-24 hours)

4. **Download signed XPI from Mozilla**
   - Go to https://addons.mozilla.org/en-US/developers/addons
   - Find ZeroConnectWallet
   - Download signed XPI from Versions tab

5. **Upload to GitHub release**
   - Go to https://github.com/alexleekt/zeroconnect-wallet/releases
   - Edit the release
   - Upload the signed XPI

### Option 2: Semi-Automated (Recommended)

**Best for:** Regular releases, already have Mozilla secrets

1. **Push a tag**
   ```bash
   git tag -a v1.0.3 -m "Release v1.0.3"
   git push origin v1.0.3
   ```

2. **GitHub Actions builds unsigned release automatically**

3. **Submit to Mozilla**
   ```bash
   just submit-unlisted
   ```

4. **Once approved, download signed XPI and upload to GitHub release**

### Option 3: Fully Automated (Requires Secrets)

**Best for:** CI/CD, frequent releases

This requires setting up Mozilla API secrets in GitHub.

#### Setup Secrets

1. **Get Mozilla API credentials**
   - Visit: https://addons.mozilla.org/en-US/developers/addon/api/key/
   - Generate JWT credentials
   - Note the `JWT issuer` (API Key) and `JWT secret`

2. **Add to GitHub Secrets**
   - Go to: https://github.com/alexleekt/zeroconnect-wallet/settings/secrets/actions
   - Click "New repository secret"
   - Add `AMO_API_KEY` = your JWT issuer
   - Add `AMO_API_SECRET` = your JWT secret

3. **Trigger signed release**
   - Go to: https://github.com/alexleekt/zeroconnect-wallet/actions
   - Click "Build, Sign, and Release"
   - Click "Run workflow"
   - Check "Sign with Mozilla Add-ons"
   - Click "Run workflow"

4. **Wait for completion**
   - GitHub Actions will:
     - Build the extension
     - Submit to Mozilla for signing
     - Wait for approval (can take 1-24 hours)
     - Download signed XPI
     - Create GitHub release with both versions

## Release Files Explained

| File | Purpose | When to Use |
|------|---------|-------------|
| `zeroconnect-wallet-vX.X.X.xpi` | **Signed by Mozilla** | Production - works in any Firefox |
| `zeroconnect-wallet-vX.X.X-unsigned.xpi` | Unsigned build | Testing only - requires Firefox Developer Edition |

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** - Breaking changes (e.g., v2.0.0)
- **MINOR** - New features, backwards compatible (e.g., v1.1.0)
- **PATCH** - Bug fixes (e.g., v1.0.3)

## Release Checklist

- [ ] Update version in `manifest.json`
- [ ] Update version in `package.json`
- [ ] Run `just ci` to verify everything passes
- [ ] Commit version bump: `git commit -m "chore: bump version to X.X.X"`
- [ ] Create tag: `git tag -a vX.X.X -m "Release vX.X.X"`
- [ ] Push: `git push && git push origin vX.X.X`
- [ ] Submit to Mozilla (or wait for auto-signing)
- [ ] Wait for approval email
- [ ] Download signed XPI (if manual)
- [ ] Upload signed XPI to GitHub release (if manual)
- [ ] Update release notes with changelog

## Troubleshooting

### "AMO_API_KEY secret not found"

You haven't added the secrets to GitHub yet. Either:
- Use manual workflow (Option 1 or 2)
- Or add secrets to GitHub (Option 3)

### "Approval timeout" in GitHub Actions

This is normal! Mozilla review takes 1-24 hours. The workflow will wait up to 1 hour, then timeout. You can:
- Re-run the workflow later
- Or manually download the signed XPI once approved

### "Version already exists" on Mozilla

You can't re-submit the same version. Options:
1. Bump version in manifest.json
2. Or delete the old version from Mozilla Developer Hub first

### Release not created

Make sure you pushed a tag starting with `v`:
```bash
git tag -a v1.0.3 -m "Release v1.0.3"
git push origin v1.0.3
```

## Questions?

- GitHub Actions docs: https://docs.github.com/en/actions
- Mozilla Add-ons API: https://addons-server.readthedocs.io/en/latest/topics/api/index.html
- Web-ext sign docs: https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-sign
