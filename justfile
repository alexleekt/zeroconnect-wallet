# ZeroConnectWallet - Task Runner

# Build the extension for production
build:
    rm -rf dist
    bunx vite build

# Watch mode for development
dev:
    bunx vite build --watch

# Type check
typecheck:
    bunx tsc --noEmit

# Lint and format
check:
    bunx biome check .

# Fix lint and format issues
fix:
    bunx biome check --fix .

# Clean build artifacts
clean:
    rm -rf dist

# Install dependencies
install:
    bun install

# Full CI check
ci: clean typecheck check build

# Package extension as XPI file for distribution
package: build
    cd dist && zip -r ../zeroconnect-wallet.xpi .

# Create a new release (requires gh CLI)
release version: package
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Creating release $version..."
    git tag -a "{{version}}" -m "Release {{version}}"
    git push origin "{{version}}"
    echo "Release {{version}} tagged and pushed. GitHub Actions will build and publish."
