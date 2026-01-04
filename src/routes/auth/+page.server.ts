import { fail, redirect } from '@sveltejs/kit';
import { createMagicLink } from '$lib/server/magic-link';
import { sendMagicLinkEmail } from '$lib/server/email';
import { validateEmail } from '$lib/utils/validation';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/specs');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const formData = await request.formData();
		const email = formData.get('email');

		if (!validateEmail(email)) {
			return fail(400, { message: 'Please enter a valid email address' });
		}

		try {
			const token = await createMagicLink(email);
			const magicLinkUrl = `${url.origin}/auth/verify?token=${token}`;

			await sendMagicLinkEmail({
				to: email,
				url: magicLinkUrl
			});
		} catch (error) {
			console.error('Magic link error:', error);
			return fail(500, { message: 'Failed to send magic link. Please try again.' });
		}

		throw redirect(303, '/auth/check-email');
	}
};
