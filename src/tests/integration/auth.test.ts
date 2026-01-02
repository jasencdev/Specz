import { describe, it, expect, beforeEach } from 'vitest';
import { verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import {
	testDb,
	schema,
	createTestUser,
	createTestSession,
	clearTables,
	generateId
} from '../helpers';

describe('auth integration', () => {
	beforeEach(async () => {
		await clearTables();
	});

	describe('user registration', () => {
		it('should create a new user with hashed password', async () => {
			const { userId, email, password } = await createTestUser();

			const [user] = await testDb
				.select()
				.from(schema.user)
				.where(eq(schema.user.id, userId));

			expect(user).toBeDefined();
			expect(user.email).toBe(email);
			expect(user.passwordHash).not.toBe(password);

			// Verify password was hashed correctly
			const isValid = await verify(user.passwordHash, password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});
			expect(isValid).toBe(true);
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

	describe('password verification', () => {
		it('should verify correct password', async () => {
			const { userId, password } = await createTestUser();

			const [user] = await testDb
				.select()
				.from(schema.user)
				.where(eq(schema.user.id, userId));

			const isValid = await verify(user.passwordHash, password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			expect(isValid).toBe(true);
		});

		it('should reject incorrect password', async () => {
			const { userId } = await createTestUser();

			const [user] = await testDb
				.select()
				.from(schema.user)
				.where(eq(schema.user.id, userId));

			const isValid = await verify(user.passwordHash, 'wrongpassword', {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			expect(isValid).toBe(false);
		});
	});
});
