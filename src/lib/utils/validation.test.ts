import { describe, it, expect } from 'vitest';
import { validateEmail } from './validation';

describe('validation', () => {
	describe('validateEmail', () => {
		it('should accept valid emails', () => {
			expect(validateEmail('test@example.com')).toBe(true);
			expect(validateEmail('user.name@domain.org')).toBe(true);
			expect(validateEmail('user+tag@example.co.uk')).toBe(true);
		});

		it('should reject invalid emails', () => {
			expect(validateEmail('notanemail')).toBe(false);
			expect(validateEmail('missing@domain')).toBe(false);
			expect(validateEmail('@nodomain.com')).toBe(false);
			expect(validateEmail('spaces in@email.com')).toBe(false);
			expect(validateEmail('')).toBe(false);
		});

		it('should reject non-string values', () => {
			expect(validateEmail(null)).toBe(false);
			expect(validateEmail(undefined)).toBe(false);
			expect(validateEmail(123)).toBe(false);
			expect(validateEmail({})).toBe(false);
		});

		it('should reject emails that are too short', () => {
			expect(validateEmail('a@b')).toBe(false);
			expect(validateEmail('a@b.')).toBe(false);
		});

		it('should reject emails that are too long', () => {
			const longEmail = 'a'.repeat(250) + '@b.com';
			expect(validateEmail(longEmail)).toBe(false);
		});
	});
});
