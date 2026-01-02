import { describe, it, expect } from 'vitest';
import { generateSessionToken, sessionCookieName } from './auth';

describe('auth', () => {
	describe('generateSessionToken', () => {
		it('should generate a token', () => {
			const token = generateSessionToken();
			expect(token).toBeDefined();
			expect(typeof token).toBe('string');
		});

		it('should generate unique tokens', () => {
			const tokens = new Set<string>();
			for (let i = 0; i < 100; i++) {
				tokens.add(generateSessionToken());
			}
			expect(tokens.size).toBe(100);
		});

		it('should generate tokens of consistent length', () => {
			const token1 = generateSessionToken();
			const token2 = generateSessionToken();
			expect(token1.length).toBe(token2.length);
			expect(token1.length).toBeGreaterThan(20);
		});
	});

	describe('sessionCookieName', () => {
		it('should be defined', () => {
			expect(sessionCookieName).toBe('auth-session');
		});
	});
});
