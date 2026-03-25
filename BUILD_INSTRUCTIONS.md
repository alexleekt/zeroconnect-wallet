# Build Instructions for Mozilla Reviewers

## Source Code Structure

This extension is built with modern TypeScript tooling:
- **Vite** - Build tool and bundler
- **TypeScript** - Type-safe JavaScript
- **Biome** - Linter and formatter
- **Bun** - Package manager and runtime

## Prerequisites

- [Bun](https://bun.sh/) (v1.0 or later)
- Node.js compatibility (optional, Bun provides Node.js APIs)

## Build Steps

### 1. Install Dependencies

```bash
bun install
```

This installs:
- vite (build tool)
- typescript (type checking)
- @biomejs/biome (linting/formatting)
- @types/firefox-webext-browser (Firefox extension types)

### 2. Build the Extension

```bash
# Using just (recommended)
just build

# Or directly with bun
bunx vite build
```

### 3. Package as XPI

```bash
# Using just
just package

# Or manually
cd dist && zip -r ../zeroconnect-wallet.xpi .
```

## Output

The build process creates:
- `dist/` - Built extension files
- `zeroconnect-wallet.xpi` - Final packaged extension

## Reproducibility

The build should be reproducible:
1. Source code is in `src/`
2. `manifest.json` is copied as-is
3. All assets are copied from `src/assets/`
4. TypeScript files are compiled and bundled

## Verification

To verify the build matches the submitted XPI:
1. Extract the submitted XPI
2. Build from source using steps above
3. Compare file contents (excluding source maps and timestamps)

## Development Mode

For testing without building:
```bash
just dev
```
This runs Vite in watch mode for development.

## License

MIT License - See LICENSE file
