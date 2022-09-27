import { invalid } from '@sveltejs/kit';

/**
 * @type {import('./$types').Actions}
 */
export const actions = {
	default: async ({ request }) => {
		const fields = await request.formData();
		fields.delete('password');
		return invalid(400, {
			values: Object.fromEntries(fields),
			errors: {
				message: 'invalid credentials'
			}
		});
	}
};
