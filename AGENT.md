# Agent Guidelines

## Communication Style
- Be direct and to the point
- Ask clarifying questions when requirements are unclear
- Always run lint/typecheck commands after making changes
- Never commit changes unless explicitly asked

## Project Conventions

### Release Workflow
- Use `just ship` for releases (auto-increments version)
- Use `just fetch <version>` to download signed XPI from Mozilla
- GitHub Actions automatically polls for signed extensions

### Code Quality
- Run `just ci` before any major changes
- Follow existing code style (enforced by Biome)
- Use TypeScript for all source files

### Environment Variables
- Store secrets in `.env` (gitignored)
- Never commit API keys or credentials
- Use `just setup` for initial environment configuration

## Tool Usage
- Use Edit tool for precise file changes
- Use glob for file discovery
- Use grep for content search
- Prefer just commands over npm scripts

## Decision Rules
- Ask before installing new global dependencies
- Ask before modifying CI/CD workflows
- Prefer bun over npm for package management
- Keep documentation minimal and focused
