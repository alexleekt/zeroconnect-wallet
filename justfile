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

# Type check, lint, and verify build
ci:
    bunx tsc --noEmit
    bunx biome check .
    rm -rf dist
    bunx vite build
    bunx web-ext lint --source-dir ./dist

# Lint extension manifest for compatibility
lint:
    bunx vite build
    bunx web-ext lint --source-dir ./dist

# Run on connected Android device (auto-selects first device via adb)
# See: https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/
dev-android:
    #!/usr/bin/env bash
    set -euo pipefail

    # Check adb is available
    if ! command -v adb &> /dev/null; then
        echo "❌ adb not found. Install Android platform-tools:"
        echo "   brew install android-platform-tools"
        exit 1
    fi

    # Find first connected Android device
    device_id=$(adb devices | tail -n +2 | grep -v '^$' | awk '{print $1}' | head -n 1)

    if [ -z "$device_id" ]; then
        echo "❌ No Android device found via adb."
        echo ""
        echo "Make sure:"
        echo "   1. Your phone is connected via USB"
        echo "   2. USB Debugging is enabled (Settings → Developer Options → USB Debugging)"
        echo "   3. You've accepted the USB debugging prompt on your phone"
        echo ""
        echo "Run 'adb devices' to verify."
        exit 1
    fi

    echo "📱 Auto-selected Android device: $device_id"
    echo ""

    bunx vite build
    bunx web-ext run \
        --source-dir ./dist \
        --target=firefox-android \
        --android-device="$device_id" \
        --firefox-apk=org.mozilla.firefox

# Clean build artifacts
clean:
    rm -rf dist *.xpi source-code.zip web-ext-artifacts/

# Fetch signed XPI from Mozilla and upload to GitHub
# Run this after you get the approval email
# Usage: just fetch 1.0.2
fetch version:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "📥 Fetching signed v{{version}} from Mozilla..."
    
    # Use web-ext to download signed XPI (saves to web-ext-artifacts/ by default)
    bunx web-ext sign \
        --source-dir ./dist \
        --api-key "$AMO_API_KEY" \
        --api-secret "$AMO_API_SECRET" \
        --channel=unlisted \
        --approval-timeout=10000 \
        || echo "⚠️  If download failed, extension may still be pending review"
    
    # Find the signed XPI (not the unsigned one)
    signed_xpi=$(ls -t web-ext-artifacts/*.xpi 2>/dev/null | grep -v "unsigned" | head -1 || echo "")
    
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
    
    # Rename to standard format with v prefix
    final_name="zeroconnect-wallet-v{{version}}.xpi"
    cp "$signed_xpi" "$final_name"
    
    # Upload to GitHub release
    echo "📤 Uploading to GitHub release v{{version}}..."
    gh release upload "v{{version}}" "$final_name" --clobber
    
    echo "✅ Done! Signed XPI uploaded as $final_name"
    echo "View: https://github.com/alexleekt/zeroconnect-wallet/releases/tag/v{{version}}"
