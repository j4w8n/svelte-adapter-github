import fs from 'fs';
import { sequence } from '@sveltejs/kit/hooks';
import { HttpError } from '../../../../src/runtime/control';

/**
 * Transform an error into a POJO, by copying its `name`, `message`
 * and (in dev) `stack`, plus any custom properties, plus recursively
 * serialized `cause` properties.
 *
 * @param {HttpError | Error } error
 */
export function error_to_pojo(error) {
	if (error instanceof HttpError) {
		return {
			status: error.status,
			...error.body
		};
	}

	const { name, message, stack, cause, ...custom } = error;
	return { name, message, stack, ...custom };
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export const handleError = ({ event, error: e }) => {
	const error = /** @type {Error} */ (e);
	// TODO we do this because there's no other way (that i'm aware of)
	// to communicate errors back to the test suite. even if we could
	// capture stderr, attributing an error to a specific request
	// is trickier when things run concurrently
	const errors = fs.existsSync('test/errors.json')
		? JSON.parse(fs.readFileSync('test/errors.json', 'utf8'))
		: {};
	errors[event.url.pathname] = error_to_pojo(error);
	fs.writeFileSync('test/errors.json', JSON.stringify(errors));
	return event.url.pathname.endsWith('404-fallback') ? undefined : { message: error.message };
};

export const handle = sequence(
	({ event, resolve }) => {
		event.locals.key = event.routeId;
		event.locals.params = event.params;
		event.locals.answer = 42;
		return resolve(event);
	},
	({ event, resolve }) => {
		event.locals.name = /** @type {string} */ (event.cookies.get('name'));
		return resolve(event);
	},
	async ({ event, resolve }) => {
		if (event.url.pathname === '/cookies/serialize') {
			event.cookies.set('before', 'before');
			const response = await resolve(event);
			response.headers.append('set-cookie', event.cookies.serialize('after', 'after'));
			return response;
		}
		return resolve(event);
	},
	async ({ event, resolve }) => {
		if (event.url.pathname === '/errors/error-in-handle') {
			throw new Error('Error in handle');
		}

		const response = await resolve(event, {
			transformPageChunk: event.url.pathname.startsWith('/transform-page-chunk')
				? ({ html }) => html.replace('__REPLACEME__', 'Worked!')
				: undefined
		});

		try {
			// in some tests we fetch stuff with undici, and the headers are immutable.
			// we can safely ignore it in those cases
			response.headers.append('set-cookie', 'name=SvelteKit; path=/; HttpOnly');
		} catch {}

		return response;
	}
);

/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ request, fetch }) {
	if (request.url.endsWith('/server-fetch-request.json')) {
		request = new Request(
			request.url.replace('/server-fetch-request.json', '/server-fetch-request-modified.json'),
			request
		);
	}

	return fetch(request);
}
