# Project Mapping: skills-codelab

## Directory Structure
- `app_build/backend`: Go backend application.
- `app_build/frontend`: Next.js frontend application.
- `app_build/ml-service`: Python ML service.
- `.agents/`: Local agent configuration and skills.

## Key Files & Configuration
- `opencode.jsonc`: OpenCode configuration (includes plugins and MCP).
- `.gitignore`: Files ignored by Git.
- `package.json`: Project dependencies and scripts.
- `README.md`: Project overview.

## Getting Started
To run the project, refer to individual README files within `app_build/backend`, `app_build/frontend`, and `app_build/ml-service`.

## Maintenance
- Lint/Typecheck commands: Run `npm run lint` and `npm run typecheck` in the respective directories (e.g., `app_build/frontend`).
- Ponytail mode: `/ponytail` activates the lazy-senior-dev mode.
- MCP Servers: GitHub, Context7, and Playwright are configured in `opencode.jsonc`.
