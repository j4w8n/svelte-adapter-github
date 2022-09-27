import * as assert from 'uvu/assert';
import { describe } from './unit_test.js';
import { resolve, normalize_path, make_trackable, disable_search } from './url.js';

describe('resolve', (test) => {
	test('resolves a root-relative path', () => {
		assert.equal(resolve('/a/b/c', '/x/y/z'), '/x/y/z');
	});

	test('resolves a relative path without a leading .', () => {
		assert.equal(resolve('/a/b/c', 'd'), '/a/b/d');
	});

	test('resolves a relative path with trailing /', () => {
		assert.equal(resolve('/a/b/c', 'd/'), '/a/b/d/');
	});

	test('resolves a relative path with leading .', () => {
		assert.equal(resolve('/a/b/c', './d'), '/a/b/d');
	});

	test('resolves a relative path with . in the middle', () => {
		assert.equal(resolve('/a/b/c', 'd/./e/./f'), '/a/b/d/e/f');
	});

	test('resolves a relative path with leading ..', () => {
		assert.equal(resolve('/a/b/c', '../d'), '/a/d');
	});

	test('resolves a relative path with .. in the middle', () => {
		assert.equal(resolve('/a/b/c', 'd/./e/../f'), '/a/b/d/f');
	});

	test('resolves a relative path with extraneous leading ..', () => {
		assert.equal(resolve('/a/b/c', '../../../../../d'), '/d');
	});

	test('resolves a root-relative path with .', () => {
		assert.equal(resolve('/a/b/c', '/x/./y/../z'), '/x/z');
	});

	test('resolves a protocol-relative path', () => {
		assert.equal(resolve('/a/b/c', '//example.com/foo'), '//example.com/foo');
	});

	test('resolves an absolute path', () => {
		assert.equal(resolve('/a/b/c', 'https://example.com/foo'), 'https://example.com/foo');
	});

	test('handles schemes like tel: and mailto:', () => {
		assert.equal(resolve('/a/b/c', 'mailto:hello@svelte.dev'), 'mailto:hello@svelte.dev');
	});
});

describe('normalize_path', (test) => {
	test('normalizes paths', () => {
		/** @type {Record<string, { ignore: string, always: string, never: string }>} */
		const paths = {
			'/': {
				ignore: '/',
				always: '/',
				never: '/'
			},
			'/foo': {
				ignore: '/foo',
				always: '/foo/',
				never: '/foo'
			},
			'/foo/': {
				ignore: '/foo/',
				always: '/foo/',
				never: '/foo'
			}
		};

		for (const path in paths) {
			const { ignore, always, never } = paths[path];

			assert.equal(normalize_path(path, 'ignore'), ignore);
			assert.equal(normalize_path(path, 'always'), always);
			assert.equal(normalize_path(path, 'never'), never);
		}
	});
});

describe('make_trackable', (test) => {
	test('makes URL properties trackable', () => {
		let tracked = false;

		const url = make_trackable(new URL('https://kit.svelte.dev/docs'), () => {
			tracked = true;
		});

		url.origin;
		assert.ok(!tracked);

		url.pathname;
		assert.ok(tracked);
	});

	test('throws an error when its hash property is accessed', () => {
		const url = make_trackable(new URL('https://kit.svelte.dev/docs'), () => {});

		assert.throws(
			() => url.hash,
			'url.hash is inaccessible from load. Consider accessing hash from the page store within the script tag of your component.'
		);
	});
});

describe('disable_search', (test) => {
	test('throws an error when its search property is accessed', () => {
		const url = new URL('https://kit.svelte.dev/docs');
		disable_search(url);

		/** @type {Array<keyof URL>} */
		const props = ['search', 'searchParams'];
		props.forEach((prop) => {
			assert.throws(
				() => url[prop],
				'Cannot access url.search on a page with prerendering enabled'
			);
		});
	});
});
