/** @type {import('./$types').PageServerLoad} */
export function load() {
	return {
		initial: 'initial'
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({ request }) => {
		const fields = await request.formData();
		return {
			result: fields.get('username')
		};
	},
	register: async ({ request }) => {
		const fields = await request.formData();
		return {
			result: 'register: ' + fields.get('username')
		};
	},
	slow: async () => {
		await new Promise((resolve) => setTimeout(resolve, 500));
	},
	submitter: async ({ request }) => {
		const fields = await request.formData();
		return {
			result: 'submitter: ' + fields.get('submitter')
		};
	}
};
