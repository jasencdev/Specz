# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
bun run dev          # Start development server
bun run build        # Production build
bun run preview      # Preview production build
bun run check        # TypeScript and Svelte checks
bun run lint         # Run Prettier + ESLint
bun run format       # Auto-format with Prettier
bun run test         # Run all tests once
bun run test:unit    # Run unit tests (src/lib)
bun run test:integration  # Run integration tests (src/tests)
bun run test:watch   # Run tests in watch mode
bun run test:e2e     # Run Playwright e2e tests
bun run test:e2e:ui  # Run e2e with Playwright UI
```

### Database Commands (Drizzle)

```bash
bun run db:push      # Push schema changes to database
bun run db:generate  # Generate migration files
bun run db:migrate   # Run migrations
bun run db:studio    # Open Drizzle Studio GUI
```

## Architecture

Specz is a conversational AI tool that conducts product intake interviews and generates software specifications.

**Two modes** (stored as `mode` field in spec table):
- **specz**: Interview → Generate spec (AI says `READY_TO_GENERATE` when done interviewing)
- **speczcheck**: Analyze existing spec → Feedback

### Tech Stack

- **Svelte 5** with runes syntax ($state, $props, $effect)
- **SvelteKit** for routing and SSR
- **Drizzle ORM** with better-sqlite3 (local SQLite)
- **Tailwind CSS v4** via Vite plugin
- **Mistral API** (devstral-small-latest) for AI chat
- **mdsvex** for Markdown/Svelte hybrid files (.svx extension)

### Key Directories

- `src/lib/server/` - Server-only code (auth, database)
- `src/lib/server/db/schema.ts` - Drizzle tables (user, session, spec)
- `src/lib/components/` - Reusable Svelte components (Chat, SpecView, Header)
- `src/lib/prompts/` - System prompts for Mistral (specz, generate, check)
- `src/routes/` - SvelteKit file-based routing
- `src/routes/api/` - API endpoints (chat, generate, specs)

### Database Schema

- **user**: id, email, createdAt, updatedAt
- **session**: id, userId, expiresAt
- **magic_link**: id (token hash), email, expiresAt, createdAt
- **spec**: id, userId, title, mode (`specz`|`speczcheck`), status (`draft`|`complete`), conversation (JSON array of `{role, content}`), output (generated markdown), createdAt, updatedAt

### Authentication

Magic link authentication via Resend:
- User enters email at `/auth` → magic link sent → click link → authenticated
- Tokens: 18 random bytes, stored as SHA256 hash, 15-min expiry, single-use
- Session validation in `hooks.server.ts` populates `event.locals.user` and `event.locals.session`
- Protected routes under `/specs/*` redirect to `/auth` if not authenticated

### API Streaming

Chat endpoint (`/api/chat`) uses Mistral streaming with SSE format. The Chat component parses `data:` lines and updates UI incrementally.

### Environment

Requires in `.env`:
- `DATABASE_URL` - SQLite file path (e.g., `local.db`)
- `MISTRAL_API_KEY` - Mistral API key for AI chat
- `RESEND_API_KEY` - Resend API key for magic link emails
