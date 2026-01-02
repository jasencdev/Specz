import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Just return - the page handles everything client-side
	return {};
};
