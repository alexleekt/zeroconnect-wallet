set dotenv-load

# Main release command — creates GitHub release with unsigned XPI
# AMO submission is disabled (see DISTRIBUTION.md)
# Usage: just release [version]
# Examples:
#   just release        # Auto-increment (1.0.3 -> 1.0.4)
#   just release 1.0.5  # Specific version
release version="":
    #!/usr/bin/env bash
    set -euo pipefail

    # Get current version from manifest
    current_version=$(grep '"version"' manifest.json | head -1 | sed 's/.*"\([0-9.]*\)".*/\1/')

    # Determine new version
    if [ -z "{{version}}" ]; then
        # Auto-increment patch version
        IFS='.' read -r major minor patch <<< "$current_version"
        new_version="${major}.${minor}.$((patch + 1))"
        echo "🚀 Releasing ZeroConnectWallet v${new_version} (auto-incremented from v${current_version})"
    else
        new_version="{{version}}"
        echo "🚀 Releasing ZeroConnectWallet v${new_version}"
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

    # Build
    echo "Building..."
    rm -rf dist
    bunx vite build
    cd dist && zip -r ../zeroconnect-wallet.xpi . && cd ..

    # Create source code zip
    zip -q -r source-code.zip src/ manifest.json *.json *.ts *.md justfile README.md DISTRIBUTION.md CONTRIBUTING.md

    # Commit version bump
    if [ "$new_version" != "$current_version" ]; then
        git add manifest.json package.json
        git commit -m "chore: bump version to ${new_version}"
        git push
    fi

    # Create git tag
    echo "Creating git tag..."
    git tag -a "v${new_version}" -m "Release v${new_version}"
    git push origin "v${new_version}"

    # Create GitHub Release with assets
    echo "Creating GitHub release..."
    gh release create "v${new_version}" \
        --title "v${new_version}" \
        --notes "See [CHANGELOG.md](./CHANGELOG.md) or git log for details.\n\n**Distribution:** This release is distributed directly via GitHub. See [DISTRIBUTION.md](./DISTRIBUTION.md) for installation instructions. Mozilla Add-ons (AMO) permanently banned this extension; the unsigned XPI must be loaded temporarily in standard Firefox or installed permanently in Nightly/Developer Edition with \"xpinstall.signatures.required\" disabled." \
        zeroconnect-wallet.xpi \
        source-code.zip

    echo ""
    echo "✅ Released v${new_version} on GitHub!"
    echo "View: https://github.com/alexleekt/zeroconnect-wallet/releases/tag/v${new_version}"

# One-time setup — creates .env template (no longer needs AMO credentials)
setup:
    #!/usr/bin/env bash
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "✅ Created .env"
    else
        echo "✅ .env exists"
    fi
    echo "Note: AMO API credentials are no longer needed. See DISTRIBUTION.md."

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

# Build unsigned XPI for manual distribution
# Usage: just build-xpi
build-xpi:
    rm -rf dist
    bunx vite build
    cd dist && zip -r ../zeroconnect-wallet.xpi . && cd ..
    echo "✅ Built zeroconnect-wallet.xpi"

# Create source code archive for distribution
build-source:
    zip -q -r source-code.zip src/ manifest.json *.json *.ts *.md justfile README.md DISTRIBUTION.md CONTRIBUTING.md
    echo "✅ Built source-code.zip"
