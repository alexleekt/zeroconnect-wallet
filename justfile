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
    echo "Creating release {{version}}..."
    git tag -a "{{version}}" -m "Release {{version}}"
    git push origin "{{version}}"
    echo "Release {{version}} tagged and pushed. GitHub Actions will build and publish."

# Lint extension with Mozilla's web-ext (catches validation errors)
lint-mozilla:
    bunx web-ext lint --source-dir ./dist

# Validate XPI before submission (catches errors early)
validate: build
    bunx web-ext lint --source-dir ./dist

# Submit to Mozilla Add-ons for signing (requires API credentials)
# Get API credentials: https://addons.mozilla.org/en-US/developers/addon/api/key/
# Usage: just submit-unlisted
# Or with env vars: AMO_API_KEY=xxx AMO_API_SECRET=yyy just submit-unlisted
submit-unlisted: package
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -z "${AMO_API_KEY:-}" ] || [ -z "${AMO_API_SECRET:-}" ]; then
        echo "Error: AMO_API_KEY and AMO_API_SECRET environment variables required"
        echo "Get your API credentials at: https://addons.mozilla.org/en-US/developers/addon/api/key/"
        echo ""
        echo "Usage: AMO_API_KEY=your-key AMO_API_SECRET=your-secret just submit-unlisted"
        exit 1
    fi
    echo "Submitting to Mozilla Add-ons (unlisted)..."
    bunx web-ext sign \
        --source-dir ./dist \
        --api-key "$AMO_API_KEY" \
        --api-secret "$AMO_API_SECRET" \
        --channel=unlisted \
        --upload-source-code=./submission/source-code.zip
    echo "✅ Submitted! Check your email for approval notification."
