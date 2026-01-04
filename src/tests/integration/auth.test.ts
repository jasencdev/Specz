import { describe, it, expect, beforeEach } from 'vitest';
import { eq } from 'drizzle-orm';
import {
	testDb,
	schema,
	createTestUser,
	createTestSession,
	createTestMagicLink,
	clearTables
} from '../helpers';

describe('auth integration', () => {
	beforeEach(async () => {
		await clearTables();
	});

	describe('user creation', () => {
		it('should create a new user', async () => {
			const { userId, email } = await createTestUser();

			const [user] = await testDb
				.select()
				.from(schema.user)
				.where(eq(schema.user.id, userId));

			expect(user).toBeDefined();
			expect(user.email).toBe(email);
		});

		it('should reject duplicate emails', async () => {
			const email = 'duplicate@example.com';
			await createTestUser(email);

			await expect(createTestUser(email)).rejects.toThrow();
		});

		it('should set timestamps on creation', async () => {
			const before = Math.floor(Date.now() / 1000) * 1000; // Round to seconds
			const { userId } = await createTestUser();
			const after = Date.now() + 1000; // Add 1 second buffer

			const [user] = await testDb
				.select()
				.from(schema.user)
				.where(eq(schema.user.id, userId));

			expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before);
			expect(user.createdAt.getTime()).toBeLessThanOrEqual(after);
			expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
			expect(user.updatedAt.getTime()).toBeLessThanOrEqual(after);
		});
	});

	describe('session management', () => {
		it('should create a session for a user', async () => {
			const { userId } = await createTestUser();
			const { sessionId } = await createTestSession(userId);

			const [session] = await testDb
				.select()
				.from(schema.session)
				.where(eq(schema.session.id, sessionId));

			expect(session).toBeDefined();
			expect(session.userId).toBe(userId);
			expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
		});

		it('should allow multiple sessions per user', async () => {
			const { userId } = await createTestUser();
			await createTestSession(userId);
			await createTestSession(userId);

			const sessions = await testDb
				.select()
				.from(schema.session)
				.where(eq(schema.session.userId, userId));

			expect(sessions).toHaveLength(2);
		});

		it('should generate unique session tokens', async () => {
			const { userId } = await createTestUser();
			const session1 = await createTestSession(userId);
			const session2 = await createTestSession(userId);

			expect(session1.token).not.toBe(session2.token);
			expect(session1.sessionId).not.toBe(session2.sessionId);
		});
	});

	describe('magic link', () => {
		it('should create a magic link for an email', async () => {
			const email = 'test@example.com';
			const { tokenHash } = await createTestMagicLink(email);

			const [magicLink] = await testDb
				.select()
				.from(schema.magicLink)
				.where(eq(schema.magicLink.id, tokenHash));

			expect(magicLink).toBeDefined();
			expect(magicLink.email).toBe(email);
			expect(magicLink.expiresAt.getTime()).toBeGreaterThan(Date.now());
		});

		it('should generate unique tokens', async () => {
			const email = 'test@example.com';
			const link1 = await createTestMagicLink(email);
			const link2 = await createTestMagicLink(email);

			expect(link1.token).not.toBe(link2.token);
			expect(link1.tokenHash).not.toBe(link2.tokenHash);
		});
	});
});
