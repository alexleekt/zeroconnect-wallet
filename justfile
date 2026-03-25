set dotenv-load

# Main release command - builds, signs, and publishes
# Usage: just ship [version]
# Examples:
#   just ship        # Auto-increment (1.0.2 -> 1.0.3)
#   just ship 1.0.5  # Specific version
ship version="":
    #!/usr/bin/env bash
    set -euo pipefail
    
    # Get current version from manifest
    current_version=$(grep '"version"' manifest.json | head -1 | sed 's/.*"\([0-9.]*\)".*/\1/')
    
    # Determine new version
    if [ -z "{{version}}" ]; then
        # Auto-increment patch version
        IFS='.' read -r major minor patch <<< "$current_version"
        new_version="${major}.${minor}.$((patch + 1))"
        echo "🚀 Shipping ZeroConnectWallet v${new_version} (auto-incremented from v${current_version})"
    else
        new_version="{{version}}"
        echo "🚀 Shipping ZeroConnectWallet v${new_version}"
    fi
    echo ""
    
    # Update version in files
    if [ "$new_version" != "$current_version" ]; then
        echo "Updating version to ${new_version}..."
        sed -i '' "s/\"version\": \"${current_version}\"/\"version\": \"${new_version}\"/" manifest.json
        sed -i '' "s/\"version\": \"${current_version}\"/\"version\": \"${new_version}\"/" package.json
        echo "✅ Updated manifest.json and package.json"
        echo ""
    fi
    
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
    
    # Commit version bump
    if [ "$new_version" != "$current_version" ]; then
        git add manifest.json package.json
        git commit -m "chore: bump version to ${new_version}"
        git push
    fi
    
    # Create git tag (triggers GitHub Actions)
    echo "Creating git tag..."
    git tag -a "v${new_version}" -m "Release v${new_version}"
    git push origin "v${new_version}"
    
    echo ""
    echo "✅ Shipped v${new_version}! Check email for Mozilla approval (1-24h)"
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

# Fetch signed XPI from Mozilla and upload to GitHub
# Run this after you get the approval email
# Usage: just fetch 1.0.2
fetch version:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "📥 Fetching signed v{{version}} from Mozilla..."
    
    # Use web-ext to download signed XPI
    bunx web-ext sign \
        --source-dir ./dist \
        --api-key "$AMO_API_KEY" \
        --api-secret "$AMO_API_SECRET" \
        --channel=unlisted \
        --download-dir=./web-ext-artifacts \
        || echo "⚠️  If download failed, extension may still be pending review"
    
    # Find the signed XPI
    signed_xpi=$(ls -t web-ext-artifacts/*.xpi 2>/dev/null | head -1 || echo "")
    
    if [ -z "$signed_xpi" ]; then
        echo "❌ No signed XPI found in web-ext-artifacts/"
        echo ""
        echo "The extension might still be pending review."
        echo "Check status at: https://addons.mozilla.org/en-US/developers/addons"
        echo ""
        echo "Or manually download from Mozilla and run:"
        echo "  gh release upload v{{version}} /path/to/zeroconnect-wallet.xpi --clobber"
        exit 1
    fi
    
    echo "✅ Found signed XPI: $signed_xpi"
    
    # Upload to GitHub release
    echo "📤 Uploading to GitHub release v{{version}}..."
    gh release upload "v{{version}}" "$signed_xpi" --clobber
    
    echo "✅ Done! Signed XPI uploaded to GitHub release"
    echo "View: https://github.com/alexleekt/zeroconnect-wallet/releases/tag/v{{version}}"
