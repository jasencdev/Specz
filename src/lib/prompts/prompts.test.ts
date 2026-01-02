import { describe, it, expect } from 'vitest';
import { speczPrompt } from './specz';
import { generatePrompt } from './generate';
import { checkPrompt } from './check';

describe('prompts', () => {
	describe('speczPrompt', () => {
		it('should include interview instructions', () => {
			expect(speczPrompt).toContain('ONE AT A TIME');
			expect(speczPrompt).toContain('READY_TO_GENERATE');
		});

		it('should mention key questions to cover', () => {
			expect(speczPrompt).toContain('primary user');
			expect(speczPrompt).toContain('core problem');
			expect(speczPrompt).toContain('must-have features');
		});
	});

	describe('generatePrompt', () => {
		it('should include all required sections', () => {
			expect(generatePrompt).toContain('Overview');
			expect(generatePrompt).toContain('User Stories');
			expect(generatePrompt).toContain('Data Model');
			expect(generatePrompt).toContain('API Endpoints');
			expect(generatePrompt).toContain('UI Screens');
			expect(generatePrompt).toContain('Edge Cases');
		});

		it('should instruct not to wrap in markdown code blocks', () => {
			expect(generatePrompt).toContain('Do NOT wrap');
			expect(generatePrompt).toContain('markdown');
		});
	});

	describe('checkPrompt', () => {
		it('should include analysis categories', () => {
			expect(checkPrompt).toContain('Strengths');
			expect(checkPrompt).toContain('Gaps');
			expect(checkPrompt).toContain('Questions');
			expect(checkPrompt).toContain('Suggestions');
		});

		it('should mention what to analyze', () => {
			expect(checkPrompt).toContain('Missing sections');
			expect(checkPrompt).toContain('Edge cases');
			expect(checkPrompt).toContain('Data model');
		});
	});
});
