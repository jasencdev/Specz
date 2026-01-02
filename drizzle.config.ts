import { defineConfig } from 'drizzle-kit';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Ensure directory exists
const dir = dirname(process.env.DATABASE_URL);
if (dir && dir !== '.' && !existsSync(dir)) {
	mkdirSync(dir, { recursive: true });
}

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: { url: process.env.DATABASE_URL },
	verbose: true,
	strict: true
});
