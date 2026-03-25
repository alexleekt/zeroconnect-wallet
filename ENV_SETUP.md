# Environment Variable Management with Varlock & Mise

This project uses [varlock](https://varlock.dev) and [mise](https://mise.jdx.dev) for secure environment variable management.

## Quick Start

```bash
# 1. Run setup (creates .env from template, trusts mise)
just setup

# 2. Get Mozilla API credentials
# Visit: https://addons.mozilla.org/en-US/developers/addon/api/key/

# 3. Edit .env and add your credentials
nano .env

# 4. Submit to Mozilla
just submit-unlisted
```

## Tools Overview

### Varlock (https://varlock.dev)
Schema-driven environment variable management with:
- `.env.schema` - Committable schema with types and validation
- Secret redaction in logs
- Integration with secret managers (1Password, etc.)
- AI-safe configuration (schema visible, secrets hidden)

### Mise (https://mise.jdx.dev)
Universal version manager that can:
- Load `.env` files automatically
- Manage tool versions (bun, node, etc.)
- Activate via `.mise.toml` in project root

## File Structure

```
.env.schema         # Schema definition (committed to git)
.env.example        # Template with empty values (committed to git)
.env                # Actual secrets (gitignored)
.mise.toml          # Mise configuration (committed to git)
```

## Schema Validation

The `.env.schema` file defines:
- Which variables are required
- Which are sensitive (automatically redacted)
- Type validation

Validate your env vars:
```bash
varlock load        # Validate and show resolved values
varlock check       # Validate without showing values
```

## Usage Patterns

### Pattern 1: Mise (Default)

Mise automatically loads `.env` when you enter the project directory:

```bash
# cd into project
cd ~/git/experiments/web3-wallet-shim

# mise loads .env automatically
just submit-unlisted    # Works with env vars loaded
```

### Pattern 2: Varlock Run

For extra validation and security:

```bash
# Run any command with varlock-injected env vars
varlock run -- just submit-unlisted

# Or with web-ext directly
varlock run -- web-ext sign --source-dir ./dist --channel=unlisted
```

### Pattern 3: Inline (One-off)

For CI/CD or quick testing:

```bash
AMO_API_KEY=xxx AMO_API_SECRET=yyy just submit-unlisted
```

## Security Features

### 1. Secret Redaction

Varlock automatically redacts sensitive values in logs:

```bash
$ varlock load
✅ AMO_API_KEY 🔒sensitive
   [hidden]
✅ AMO_API_SECRET 🔒sensitive
   [hidden]
```

### 2. Git Safety

- ✅ `.env.schema` - Safe to commit (no secrets)
- ✅ `.env.example` - Safe to commit (template)
- ❌ `.env` - Gitignored (contains secrets)

### 3. AI Safety

Your `.env.schema` can be read by AI agents for context, but secrets are never exposed:

```text
# @required @sensitive @type=string
AMO_API_KEY=       # AI sees: "Required API key for Mozilla"
                   # AI does NOT see the actual key
```

## Advanced: Secret Managers

You can integrate with 1Password or other secret managers:

```bash
# .env.schema
# @required @sensitive @type=string
AMO_API_KEY=exec('op read "op://vault/mozilla/api-key"')
```

Then run:
```bash
varlock run -- just submit-unlisted
```

Secrets are fetched at runtime from 1Password.

## Troubleshooting

### "Error: AMO_API_KEY environment variable required"

Your env vars aren't loaded. Solutions:

1. **Use mise:** `mise trust` then ensure mise is activated in your shell
2. **Use varlock:** `varlock run -- just submit-unlisted`
3. **Source manually:** `source .env && just submit-unlisted`

### "Permission denied" on .env

Mise needs permission to read the file:
```bash
mise trust
```

### Varlock not found

Install varlock:
```bash
brew install dmno-dev/tap/varlock
# or
curl -sSfL https://varlock.dev/install.sh | sh
```

## References

- Varlock Docs: https://varlock.dev
- Varlock GitHub: https://github.com/dmno-dev/varlock
- Mise Docs: https://mise.jdx.dev
- Mozilla API Keys: https://addons.mozilla.org/en-US/developers/addon/api/key/
