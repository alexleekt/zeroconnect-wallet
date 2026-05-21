# Contributing to ZeroConnectWallet

Thank you for your interest in contributing! This is a simple utility extension focused on read-only wallet connections.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/zeroconnect-wallet.git`
3. Install dependencies: `bun install`
4. Make your changes
5. Run checks: `just ci`
6. Submit a pull request

## Development Workflow

```bash
# Install dependencies
bun install

# Run in watch mode
just dev

# Type check, lint, and build
just ci

# Build unsigned XPI for distribution
just build-xpi

# Create GitHub release (maintainers only)
just release
```

## Code Style

- Use [Biome](https://biomejs.dev/) for linting and formatting
- Follow existing code patterns
- Keep it simple and focused
- No private keys or sensitive data in code

## Testing

Test your changes by loading the extension temporarily:
1. Build: `just build-xpi`
2. Go to `about:debugging` in Firefox
3. "This Firefox" → "Load Temporary Add-on"
4. Select `dist/manifest.json`

Or test on Firefox for Android:
1. Connect your Android device via USB with debugging enabled
2. Run: `just dev-android`
3. The extension will load temporarily in Firefox for Android

## Submitting Changes

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes with clear, focused commits
3. Run `just ci` to ensure everything passes
4. Push to your fork: `git push origin feature/my-feature`
5. Open a pull request with a clear description

## What We're Looking For

- Bug fixes
- Performance improvements
- Documentation improvements
- Support for additional chains (with good rationale)
- UI/UX improvements
- Mobile/responsive design improvements

## What We're NOT Looking For

- Features that require storing private keys
- Complex wallet management features
- Changes that break read-only nature
- External dependencies (keep it lightweight)
- Attempts to circumvent Mozilla's AMO ban (e.g., creating new extension IDs, rebranding to sneak past review)

## Questions?

Open an issue or discussion on GitHub.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
