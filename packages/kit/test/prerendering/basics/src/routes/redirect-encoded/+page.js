import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Load} */
export function load() {
	throw redirect(
		301,
		`https://example.com/redirected?returnTo=${encodeURIComponent('/foo?bar=baz')}`
	);
}
