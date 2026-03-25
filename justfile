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
