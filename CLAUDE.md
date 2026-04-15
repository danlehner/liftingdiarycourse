# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **IMPORTANT**: Before generating any code, ALWAYS first read the relevant documentation file in the `/docs` directory. Do not write code based on assumptions or prior knowledge — consult the docs first.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production server
```

No test framework is configured.

- /docs/ui.md
- /docs/data-fetching.md

## Architecture

- **Framework**: Next.js 16 with App Router (`src/app/`)
- **Language**: TypeScript (strict mode), path alias `@/*` → `src/*`
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`
- **React**: v19

All routes live under `src/app/` using the App Router file conventions. There are no Pages Router files.
