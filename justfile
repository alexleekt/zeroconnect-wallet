# ZeroConnectWallet - Task Runner
#
# Environment Setup:
#   This project uses mise (https://mise.jdx.dev) to manage environment variables.
#   The .mise.toml file is configured to load .env automatically.
#
#   1. Copy .env.example to .env and fill in your secrets
#   2. Run `mise trust` to allow mise to load the .env file
#   3. All just commands will automatically have access to env vars

# Load environment variables from .env file automatically
set dotenv-load

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

# Setup project - copy env template and trust mise
setup:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
        echo "📝 Please edit .env and add your Mozilla API credentials"
    else
        echo "✅ .env file already exists"
    fi
    if command -v mise &> /dev/null; then
        mise trust
        echo "✅ Trusted mise configuration"
    else
        echo "⚠️  mise not installed. Install from https://mise.jdx.dev"
    fi
    echo ""
    echo "Next steps:"
    echo "1. Get API credentials from https://addons.mozilla.org/en-US/developers/addon/api/key/"
    echo "2. Edit .env and add your AMO_API_KEY and AMO_API_SECRET"
    echo "3. Run: just submit-unlisted"

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
# 
# Prerequisites:
#   - Set up env vars via mise: `just setup` then edit .env
#   - Or use varlock: `varlock run -- just submit-unlisted`
#   - Or inline: AMO_API_KEY=xxx AMO_API_SECRET=yyy just submit-unlisted
#
# The .env.schema file defines the schema for validation
submit-unlisted: package
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -z "${AMO_API_KEY:-}" ] || [ -z "${AMO_API_SECRET:-}" ]; then
        echo "Error: AMO_API_KEY and AMO_API_SECRET environment variables required"
        echo ""
        echo "Setup options:"
        echo "  1. Use mise (recommended): just setup"
        echo "  2. Use varlock: varlock run -- just submit-unlisted"
        echo "  3. Inline: AMO_API_KEY=xxx AMO_API_SECRET=yyy just submit-unlisted"
        echo ""
        echo "Get API credentials at: https://addons.mozilla.org/en-US/developers/addon/api/key/"
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
