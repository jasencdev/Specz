import { describe, it, expect, beforeEach } from 'vitest';
import { eq } from 'drizzle-orm';
import {
	testDb,
	schema,
	createTestUser,
	createTestSpec,
	clearTables,
	generateId
} from '../helpers';

describe('specs integration', () => {
	beforeEach(async () => {
		await clearTables();
	});

	describe('create spec', () => {
		it('should create a new spec for a user', async () => {
			const { userId } = await createTestUser();
			const specId = await createTestSpec(userId);

			const [spec] = await testDb
				.select()
				.from(schema.spec)
				.where(eq(schema.spec.id, specId));

			expect(spec).toBeDefined();
			expect(spec.userId).toBe(userId);
			expect(spec.status).toBe('draft');
			expect(spec.mode).toBe('specz');
		});

		it('should set default values correctly', async () => {
			const { userId } = await createTestUser();
			const specId = await createTestSpec(userId);

			const [spec] = await testDb
				.select()
				.from(schema.spec)
				.where(eq(schema.spec.id, specId));

			expect(spec.title).toBe('Test Spec');
			expect(spec.conversation).toEqual([]);
			expect(spec.output).toBeNull();
		});

		it('should allow custom values on creation', async () => {
			const { userId } = await createTestUser();
			const specId = await createTestSpec(userId, {
				title: 'Custom Title',
				mode: 'speczcheck',
				status: 'complete',
				conversation: [{ role: 'user', content: 'Hello' }],
				output: '# Spec Output'
			});

			const [spec] = await testDb
				.select()
				.from(schema.spec)
				.where(eq(schema.spec.id, specId));

			expect(spec.title).toBe('Custom Title');
			expect(spec.mode).toBe('speczcheck');
			expect(spec.status).toBe('complete');
			expect(spec.conversation).toEqual([{ role: 'user', content: 'Hello' }]);
			expect(spec.output).toBe('# Spec Output');
		});
	});

	describe('list specs', () => {
		it('should return all specs for a user', async () => {
			const { userId } = await createTestUser();
			await createTestSpec(userId, { title: 'Spec 1' });
			await createTestSpec(userId, { title: 'Spec 2' });
			await createTestSpec(userId, { title: 'Spec 3' });

			const specs = await testDb
				.select()
				.from(schema.spec)
				.where(eq(schema.spec.userId, userId));

			expect(specs).toHaveLength(3);
		});

		it('should not return specs from other users', async () => {
			const user1 = await createTestUser();
			const user2 = await createTestUser();

			await createTestSpec(user1.userId, { title: 'User 1 Spec' });
			await createTestSpec(user2.userId, { title: 'User 2 Spec' });

			const user1Specs = await testDb
				.select()
				.from(schema.spec)
				.where(eq(schema.spec.userId, user1.userId));

			expect(user1Specs).toHaveLength(1);
			expect(user1Specs[0].title).toBe('User 1 Spec');
		});
	});

	describe('update spec', () => {
		it('should update spec title', async () => {
			const { userId } = await createTestUser();
			const specId = await createTestSpec(userId, { title: 'Original' });

			await testDb
				.update(schema.spec)
				.set({ title: 'Updated Title' })
				.where(eq(schema.spec.id, specId));

			const [spec] = await testDb
				.select()
				.from(schema.spec)
				.where(eq(schema.spec.id, specId));

			expect(spec.title).toBe('Updated Title');
		});

		it('should update spec conversation', async () => {
			const { userId } = await createTestUser();
			const specId = await createTestSpec(userId);

			const newConversation = [
				{ role: 'assistant', content: 'Hello!' },
				{ role: 'user', content: 'Hi there' }
			];

			await testDb
				.update(schema.spec)
				.set({ conversation: newConversation })
				.where(eq(schema.spec.id, specId));

			const [spec] = await testDb
				.select()
				.from(schema.spec)
				.where(eq(schema.spec.id, specId));

			expect(spec.conversation).toEqual(newConversation);
		});

		it('should update spec status', async () => {
			const { userId } = await createTestUser();
			const specId = await createTestSpec(userId);

			await testDb
				.update(schema.spec)
				.set({ status: 'complete', output: '# Final Spec' })
				.where(eq(schema.spec.id, specId));

			const [spec] = await testDb
				.select()
				.from(schema.spec)
				.where(eq(schema.spec.id, specId));

			expect(spec.status).toBe('complete');
			expect(spec.output).toBe('# Final Spec');
		});
	});

	describe('delete spec', () => {
		it('should delete a spec', async () => {
			const { userId } = await createTestUser();
			const specId = await createTestSpec(userId);

			await testDb.delete(schema.spec).where(eq(schema.spec.id, specId));

			const specs = await testDb
				.select()
				.from(schema.spec)
				.where(eq(schema.spec.id, specId));

			expect(specs).toHaveLength(0);
		});

		it('should only delete the specified spec', async () => {
			const { userId } = await createTestUser();
			const specId1 = await createTestSpec(userId, { title: 'Keep' });
			const specId2 = await createTestSpec(userId, { title: 'Delete' });

			await testDb.delete(schema.spec).where(eq(schema.spec.id, specId2));

			const specs = await testDb
				.select()
				.from(schema.spec)
				.where(eq(schema.spec.userId, userId));

			expect(specs).toHaveLength(1);
			expect(specs[0].title).toBe('Keep');
		});
	});

	describe('spec modes', () => {
		it('should support specz mode', async () => {
			const { userId } = await createTestUser();
			const specId = await createTestSpec(userId, { mode: 'specz' });

			const [spec] = await testDb
				.select()
				.from(schema.spec)
				.where(eq(schema.spec.id, specId));

			expect(spec.mode).toBe('specz');
		});

		it('should support speczcheck mode', async () => {
			const { userId } = await createTestUser();
			const specId = await createTestSpec(userId, { mode: 'speczcheck' });

			const [spec] = await testDb
				.select()
				.from(schema.spec)
				.where(eq(schema.spec.id, specId));

			expect(spec.mode).toBe('speczcheck');
		});
	});
});
