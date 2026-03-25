set dotenv-load

# Main release command - builds, signs, and publishes
# Usage: just ship 1.0.3
ship version:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "🚀 Shipping ZeroConnectWallet {{version}}"
    echo ""
    
    # Verify env vars
    if [ -z "${AMO_API_KEY:-}" ] || [ -z "${AMO_API_SECRET:-}" ]; then
        echo "❌ Missing AMO_API_KEY or AMO_API_SECRET in .env"
        echo "Run: just setup"
        exit 1
    fi
    
    # Build
    echo "Building..."
    rm -rf dist
    bunx vite build
    cd dist && zip -r ../zeroconnect-wallet.xpi . && cd ..
    
    # Create source code zip
    zip -q -r source-code.zip src/ manifest.json *.json *.ts *.md justfile
    
    # Submit to Mozilla
    echo "Submitting to Mozilla..."
    bunx web-ext sign \
        --source-dir ./dist \
        --api-key "$AMO_API_KEY" \
        --api-secret "$AMO_API_SECRET" \
        --channel=unlisted \
        --upload-source-code=./source-code.zip || true
    
    # Create git tag (triggers GitHub Actions)
    echo "Creating git tag..."
    git tag -a "{{version}}" -m "Release {{version}}"
    git push origin "{{version}}"
    
    echo ""
    echo "✅ Shipped! Check email for Mozilla approval (1-24h)"
    echo "View: https://github.com/alexleekt/zeroconnect-wallet/releases"

# One-time setup - creates .env template
setup:
    #!/usr/bin/env bash
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "✅ Created .env - add your Mozilla API credentials"
    else
        echo "✅ .env exists"
    fi
    echo "Get API keys: https://addons.mozilla.org/en-US/developers/addon/api/key/"

# Development server
dev:
    bunx vite build --watch

# Clean build artifacts
clean:
    rm -rf dist *.xpi source-code.zip
