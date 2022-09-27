import { redirect } from '@sveltejs/kit';
import { COOKIE_NAME } from '../shared';

/** @type {import('@sveltejs/kit').RequestHandler} */
export const GET = (event) => {
	event.cookies.delete(COOKIE_NAME);
	throw redirect(303, '/cookies');
};
