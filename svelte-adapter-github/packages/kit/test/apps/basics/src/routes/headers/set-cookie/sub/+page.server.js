/** @type {import('./$types').PageServerLoad} */
export function load({ cookies }) {
	cookies.set('cookie2', 'value2', {
		secure: false // safari
	});
}
