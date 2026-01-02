# Specz

A conversational AI tool for generating software specifications through guided interviews.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Development](#development)
- [Testing](#testing)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
  - [End-to-End Tests](#end-to-end-tests)
  - [Coverage](#coverage)
- [Database](#database)
- [Project Structure](#project-structure)

## Features

- **Specz Mode**: Interactive interview to gather requirements and generate comprehensive software specifications
- **SpeczCheck Mode**: Upload existing specs for AI-powered review and feedback
- **User Authentication**: Secure login/registration with Argon2 password hashing
- **Session Management**: Persistent sessions with secure cookie handling
- **Markdown Output**: Generated specs in clean, exportable Markdown format

## Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) with Svelte 5
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team/)
- **AI**: [Mistral AI](https://mistral.ai/) for conversational interviews and spec generation
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: Custom implementation with [Argon2](https://github.com/nicolo-ribaudo/node-rs-argon2) and [Oslo](https://oslo.js.org/)
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Mistral AI API key

### Installation

```sh
# Clone the repository
git clone <repository-url>
cd specz

# Install dependencies
bun install

# Install Playwright browsers (for e2e tests)
bunx playwright install chromium
```

### Environment Setup

Create a `.env` file in the project root:

```env
MISTRAL_API_KEY=your_mistral_api_key_here
```

## Development

```sh
# Start development server
bun run dev

# Type checking
bun run check

# Linting and formatting
bun run lint
bun run format
```

## Testing

### Unit Tests

Tests for pure functions, utilities, and prompts:

```sh
bun run test:unit
```

### Integration Tests

Tests database operations with an in-memory SQLite database:

```sh
bun run test:integration
```

### End-to-End Tests

Full browser tests with Playwright:

```sh
# Run e2e tests
bun run test:e2e

# Run with Playwright UI
bun run test:e2e:ui
```

### Coverage

```sh
bun run test -- --coverage
```

### Run All Tests

```sh
bun run test
```

## Database

The project uses SQLite with Drizzle ORM.

```sh
# Push schema changes to database
bun run db:push

# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate

# Open Drizzle Studio
bun run db:studio
```

## Project Structure

```
specz/
├── e2e/                    # Playwright e2e tests
│   ├── auth.test.ts
│   └── specs.test.ts
├── src/
│   ├── lib/
│   │   ├── components/     # Svelte components
│   │   ├── prompts/        # AI prompt templates
│   │   ├── server/         # Server-side code
│   │   │   ├── db/         # Database schema and connection
│   │   │   └── auth.ts     # Authentication logic
│   │   └── utils/          # Utility functions
│   ├── routes/             # SvelteKit routes
│   │   ├── api/            # API endpoints
│   │   ├── login/
│   │   ├── register/
│   │   ├── logout/
│   │   └── specs/          # Specs pages
│   └── tests/              # Integration tests
│       ├── helpers.ts
│       └── integration/
├── playwright.config.ts
├── vitest.config.ts
└── drizzle.config.ts
```
