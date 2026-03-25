# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

**Do NOT open a public issue.**

Instead, please email security concerns to: [Create a security advisory on GitHub](https://github.com/alexleekt/zeroconnect-wallet/security/advisories/new)

## Security Design Principles

This extension is designed with security in mind:

1. **No Private Keys**: We never store, transmit, or handle private keys
2. **Read-Only**: All operations are read-only RPC calls
3. **Local Storage**: User data is stored only in browser storage (Firefox Sync)
4. **No External Dependencies**: Minimal attack surface, no external scripts loaded
5. **CSP Compliant**: Content Security Policy compliant code injection

## What We DON'T Do

- ❌ Store private keys or seed phrases
- ❌ Sign transactions or messages
- ❌ Execute remote code
- ❌ Collect user data or analytics
- ❌ Make outbound connections except to user-configured RPC endpoints

## What We DO

- ✅ Forward read-only RPC calls to configured endpoints
- ✅ Store user addresses in browser storage
- ✅ Reject all signing requests with user notifications

## Auditing

The extension code is open source and can be audited by anyone. All functionality is contained in the `src/` directory.

## Acknowledgments

We appreciate responsible disclosure of security issues.
