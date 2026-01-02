Let me consolidate everything into one clean spec:

---

# Specz — Product Specification (v2)

## Overview

Specz is a conversational AI tool that conducts product intake interviews and generates comprehensive software specifications. Instead of prompting AI to write code directly (which produces mediocre results from vague inputs), users describe what they want, answer clarifying questions, and receive a detailed specification document they can hand to any implementation tool or developer.

**Two modes:**
- **Specz:** Interview → Generate spec
- **SpeczCheck:** Feed a spec → Get feedback, gaps, improvements

> *Prompt for apps. Get specs, not code.*

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | SvelteKit |
| Runtime | Bun |
| Language | TypeScript |
| Auth | Lucia |
| Database | SQLite |
| ORM | Drizzle |
| AI | Mistral API (Codestral / Devstral) |
| Styling | Tailwind CSS |

---

## User Stories

### Authentication
- As a visitor, I can sign up / sign in with email (magic link or password)
- As a user, I remain signed in until I log out or session expires
- As a user, I can log out from any page

### Specz Mode (Interview → Spec)
- As a user, I can start a new spec conversation
- As a user, I can describe what I want to build in plain English
- As a user, I receive clarifying questions one at a time
- As a user, I can see suggested features I hadn't considered
- As a user, I can say "generate spec" to trigger final output
- As a user, I see the spec rendered as formatted markdown
- As a user, I can copy the spec to clipboard
- As a user, I can download the spec as .md file

### SpeczCheck Mode (Spec → Feedback)
- As a user, I can paste or upload an existing spec
- As a user, I receive analysis: gaps, missing edge cases, unclear requirements
- As a user, I can ask follow-up questions about the feedback
- As a user, I can regenerate an improved version of the spec

### Spec Management
- As a user, I can see a list of all my saved specs
- As a user, I can view any past spec
- As a user, I can continue a previous conversation
- As a user, I can rename a spec
- As a user, I can delete a spec

---

## Data Model

### users
| Field | Type | Description |
|-------|------|-------------|
| id | text (cuid) | Primary key |
| email | text | Unique, required |
| password_hash | text | Hashed password (nullable if magic link only) |
| created_at | integer | Unix timestamp |
| updated_at | integer | Unix timestamp |

### sessions
| Field | Type | Description |
|-------|------|-------------|
| id | text | Primary key |
| user_id | text | FK to users |
| expires_at | integer | Unix timestamp |

### specs
| Field | Type | Description |
|-------|------|-------------|
| id | text (cuid) | Primary key |
| user_id | text | FK to users |
| title | text | Spec title |
| mode | text | `specz` or `speczcheck` |
| status | text | `draft`, `complete` |
| conversation | text (JSON) | Array of messages |
| output | text | Generated spec markdown |
| created_at | integer | Unix timestamp |
| updated_at | integer | Unix timestamp |

### Drizzle Schema

```typescript
// src/lib/server/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const specs = sqliteTable('specs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull().default('Untitled Spec'),
  mode: text('mode').notNull().default('specz'),
  status: text('status').notNull().default('draft'),
  conversation: text('conversation', { mode: 'json' }).notNull().default([]),
  output: text('output'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
```

---

## Project Structure

```
specz/
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   ├── auth.ts          # Lucia setup
│   │   │   ├── db.ts            # Drizzle connection
│   │   │   └── schema.ts        # Drizzle schema
│   │   ├── components/
│   │   │   ├── Chat.svelte      # Chat interface
│   │   │   ├── SpecView.svelte  # Markdown renderer
│   │   │   └── Header.svelte    # Nav header
│   │   └── prompts/
│   │       ├── specz.ts         # Interview system prompt
│   │       ├── generate.ts      # Spec generation prompt
│   │       └── check.ts         # SpeczCheck prompt
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +layout.server.ts    # Auth check
│   │   ├── +page.svelte         # Landing
│   │   ├── login/
│   │   │   └── +page.svelte
│   │   ├── register/
│   │   │   └── +page.svelte
│   │   ├── specs/
│   │   │   ├── +page.svelte     # List specs
│   │   │   ├── +page.server.ts
│   │   │   ├── new/
│   │   │   │   └── +page.svelte # New spec (Specz mode)
│   │   │   ├── check/
│   │   │   │   └── +page.svelte # SpeczCheck mode
│   │   │   └── [id]/
│   │   │       ├── +page.svelte # View/continue spec
│   │   │       └── +page.server.ts
│   │   └── api/
│   │       ├── chat/
│   │       │   └── +server.ts   # Streaming chat
│   │       └── generate/
│   │           └── +server.ts   # Generate spec
│   └── app.d.ts
├── drizzle/
│   └── migrations/
├── static/
├── drizzle.config.ts
├── svelte.config.js
├── tailwind.config.js
├── vite.config.ts
├── package.json
├── bun.lockb
├── Dockerfile
└── docker-compose.yml
```

---

## API Routes

### Auth (handled by Lucia)
| Method | Path | Description |
|--------|------|-------------|
| POST | /login | Login with email/password |
| POST | /register | Create account |
| POST | /logout | Destroy session |

### Specs
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/specs | List user's specs |
| POST | /api/specs | Create new spec |
| GET | /api/specs/[id] | Get single spec |
| PATCH | /api/specs/[id] | Update spec |
| DELETE | /api/specs/[id] | Delete spec |

### AI
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/chat | Stream chat response |
| POST | /api/generate | Generate final spec |
| POST | /api/check | Analyze existing spec |

---

## API Implementation

### POST /api/chat (Streaming)

```typescript
// src/routes/api/chat/+server.ts
import { Mistral } from '@mistralai/mistralai';
import { MISTRAL_API_KEY } from '$env/static/private';
import { speczPrompt } from '$lib/prompts/specz';

const mistral = new Mistral({ apiKey: MISTRAL_API_KEY });

export async function POST({ request, locals }) {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, mode } = await request.json();
  
  const systemPrompt = mode === 'check' ? checkPrompt : speczPrompt;

  const stream = await mistral.chat.stream({
    model: 'devstral-small-latest',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ]
  });

  return new Response(stream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

### POST /api/generate

```typescript
// src/routes/api/generate/+server.ts
import { Mistral } from '@mistralai/mistralai';
import { MISTRAL_API_KEY } from '$env/static/private';
import { generatePrompt } from '$lib/prompts/generate';
import { db } from '$lib/server/db';
import { specs } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

const mistral = new Mistral({ apiKey: MISTRAL_API_KEY });

export async function POST({ request, locals }) {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { specId, conversation } = await request.json();

  const conversationText = conversation
    .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const result = await mistral.chat.complete({
    model: 'devstral-small-latest',
    messages: [
      { role: 'system', content: generatePrompt },
      { role: 'user', content: conversationText }
    ]
  });

  const output = result.choices[0].message.content;
  const title = output.split('\n')[0].replace(/^#\s*/, '').replace(/\s*—.*$/, '').trim();

  await db.update(specs)
    .set({ title, status: 'complete', output, updatedAt: new Date() })
    .where(eq(specs.id, specId));

  return Response.json({ success: true, output, title });
}
```

---

## System Prompts

### Specz (Interview Mode)

```typescript
// src/lib/prompts/specz.ts
export const speczPrompt = `You are Specz, an AI product manager that helps users define software specifications through conversation.

Your job is to:
1. Understand what the user wants to build
2. Ask clarifying questions ONE AT A TIME
3. Suggest features they may not have considered
4. Know when you have enough information to generate a spec

Interview style:
- Friendly, conversational, concise
- Ask only ONE question at a time
- Acknowledge their answer before asking the next question
- After 5-8 questions, ask if they're ready to generate the spec
- If they say yes, respond with exactly: "READY_TO_GENERATE"

Questions to cover (adapt based on context):
- Who is the primary user?
- What is the core problem it solves?
- What are the must-have features?
- What data needs to be stored?
- Does it need user accounts/auth?
- Self-hosted or cloud?
- Any integrations needed?
- What should the UI feel like?

Do NOT generate the spec in this conversation. Just interview. When ready, say "READY_TO_GENERATE".`;
```

### Generate (Spec Output)

```typescript
// src/lib/prompts/generate.ts
export const generatePrompt = `You are Specz. Based on the conversation, generate a comprehensive software specification.

Include ALL sections:

# [Product Name] — Product Specification

## Overview
Brief description of what this product does and who it's for.

## User Stories
"As a [user], I can [action] so that [benefit]" format.

## Data Model
Tables with fields, types, and descriptions.

## API Endpoints
RESTful routes with method, path, and description.

## UI Screens
Describe each screen, its purpose, and key elements.

## Edge Cases
Error states, empty states, boundary conditions.

## Tech Stack Recommendation
Appropriate technologies based on requirements.

## Acceptance Criteria
Checklist for MVP launch.

## Open Questions
Unresolved decisions or future considerations.

---

Output ONLY the specification in clean Markdown. No preamble.`;
```

### SpeczCheck (Analysis Mode)

```typescript
// src/lib/prompts/check.ts
export const checkPrompt = `You are SpeczCheck, an AI that analyzes software specifications for completeness and quality.

When given a spec, analyze it for:

1. **Missing sections** — What's not covered?
2. **Vague requirements** — What needs more detail?
3. **Edge cases** — What could go wrong that isn't addressed?
4. **Data model gaps** — Missing fields, relationships, or types?
5. **API inconsistencies** — Missing endpoints, unclear parameters?
6. **Unclear user stories** — Who, what, why not defined?
7. **Technical concerns** — Scalability, security, performance issues?
8. **Open questions** — What decisions haven't been made?

Provide your analysis as:

## Spec Analysis

### Strengths
What's done well.

### Gaps
What's missing or incomplete.

### Questions
What needs clarification.

### Suggestions
Specific improvements.

Be constructive. The goal is to make the spec better, not criticize.`;
```

---

## UI Screens

### Landing (/)

```
┌─────────────────────────────────────────┐
│                                         │
│              Specz                      │
│                                         │
│     AI interviews you.                  │
│     Then writes the spec.               │
│                                         │
│         [ Get Started → ]               │
│                                         │
└─────────────────────────────────────────┘
```

### Specs List (/specs)

```
┌─────────────────────────────────────────┐
│  Specz                       user@email │
│                                         │
│  Your Specs                             │
│                                         │
│  [ + New Spec ]  [ Check a Spec ]       │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ SafeSpend              Complete   │  │
│  │ Updated 2 hours ago               │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Parking Garage         Complete   │  │
│  │ Updated yesterday                 │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Chat (/specs/new)

```
┌─────────────────────────────────────────┐
│  Specz              New Spec            │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │  Specz:                           │  │
│  │  Hey! I'm Specz. Tell me about    │  │
│  │  what you want to build.          │  │
│  │                                   │  │
│  │  You:                             │  │
│  │  I want to build a parking        │  │
│  │  garage management system         │  │
│  │                                   │  │
│  │  Specz:                           │  │
│  │  Nice! Who's the primary user —   │  │
│  │  drivers, garage staff, or both?  │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Type your response...         [→] │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### SpeczCheck (/specs/check)

```
┌─────────────────────────────────────────┐
│  Specz              SpeczCheck          │
│                                         │
│  Paste or upload a spec to analyze:     │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │  # My Product Spec                │  │
│  │                                   │  │
│  │  ## Overview                      │  │
│  │  ...                              │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [ Analyze Spec ]                       │
│                                         │
└─────────────────────────────────────────┘
```

---

## Edge Cases

### Authentication
- Magic link expired: Friendly error, offer resend
- Session expired: Redirect to login, preserve URL
- Invalid email: Client-side validation

### Chat
- Empty message: Don't send
- API error: Show error, allow retry
- READY_TO_GENERATE detected: Auto-trigger generation
- Very long conversation: May need summarization

### SpeczCheck
- Invalid markdown: Accept anyway, do best effort
- Empty spec: Prompt user to add content
- Spec too long: Chunk and analyze

### Generation
- Generation fails: Show error, allow retry
- User wants to regenerate: Allow, replace output

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runtime
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "./build"]
```

### docker-compose.yml (Axiomlayer addition)

```yaml
  specz:
    build: ./specz
    container_name: specz
    restart: unless-stopped
    ports:
      - "3100:3000"
    volumes:
      - ./data/specz:/app/data
    environment:
      - DATABASE_URL=file:/app/data/specz.db
      - MISTRAL_API_KEY=${MISTRAL_API_KEY}
    labels:
      - "caddy=specz.axiomlayer.com"
      - "caddy.reverse_proxy={{upstreams 3000}}"
```

---

## Environment Variables

```bash
# .env
DATABASE_URL="file:./data/specz.db"
MISTRAL_API_KEY="your-mistral-api-key"
```

---

## Acceptance Criteria (MVP)

### Auth
- [ ] User can register with email/password
- [ ] User can log in
- [ ] User can log out
- [ ] Sessions persist across browser restarts

### Specz Mode
- [ ] Chat streams responses in real-time
- [ ] Conversation saved to database
- [ ] READY_TO_GENERATE triggers spec generation
- [ ] Spec renders as formatted markdown
- [ ] Copy to clipboard works
- [ ] Download as .md works

### SpeczCheck Mode
- [ ] User can paste a spec
- [ ] Analysis is generated
- [ ] User can ask follow-up questions

### Management
- [ ] List all specs
- [ ] View past specs
- [ ] Delete specs
- [ ] Rename specs

### Deployment
- [ ] Runs in Docker
- [ ] Deploys to Axiomlayer
- [ ] specz.axiomlayer.com works

---

## Open Questions

1. **Magic links vs password?** — Start with password (simpler), add magic links later?
2. **Model selection?** — Always Devstral, or let user choose?
3. **Spec templates?** — Pre-built starting points for common app types?
4. **Export formats?** — Just markdown, or also JSON/PDF?

---

*Built with SvelteKit + Bun + Lucia + Drizzle + Mistral*

*Specz wrote this spec.*

---

Want me to save this to a file?