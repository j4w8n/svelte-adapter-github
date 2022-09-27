import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import create_manifest_data from './index.js';
import options from '../../config/options.js';

const cwd = fileURLToPath(new URL('./test', import.meta.url));

/**
 * @param {string} dir
 * @param {import('types').Config} config
 */
const create = (dir, config = {}) => {
	const initial = options(config, 'config');

	initial.kit.files.assets = path.resolve(cwd, 'static');
	initial.kit.files.params = path.resolve(cwd, 'params');
	initial.kit.files.routes = path.resolve(cwd, dir);

	return create_manifest_data({
		config: /** @type {import('types').ValidatedConfig} */ (initial),
		fallback: cwd,
		cwd
	});
};

const default_layout = {
	component: 'layout.svelte'
};

const default_error = {
	component: 'error.svelte'
};

/** @param {import('types').PageNode} node */
function simplify_node(node) {
	/** @type {import('types').PageNode} */
	const simplified = {};

	if (node.component) simplified.component = node.component;
	if (node.shared) simplified.shared = node.shared;
	if (node.server) simplified.server = node.server;
	if (node.parent_id !== undefined) simplified.parent_id = node.parent_id;

	return simplified;
}

/** @param {import('types').RouteData} route */
function simplify_route(route) {
	/** @type {{ id: string, pattern: string, page?: import('types').PageNodeIndexes, endpoint?: { file: string } }} */
	const simplified = {
		id: route.id,
		pattern: route.pattern.toString().replace(/\\\//g, '/').replace(/\\\./g, '.')
	};

	if (route.page) simplified.page = route.page;
	if (route.endpoint) simplified.endpoint = route.endpoint;

	return simplified;
}

test('creates routes', () => {
	const { nodes, routes } = create('samples/basic');

	assert.equal(nodes.map(simplify_node), [
		default_layout,
		default_error,
		{ component: 'samples/basic/+page.svelte' },
		{ component: 'samples/basic/about/+page.svelte' },
		{ component: 'samples/basic/blog/+page.svelte' },
		{ component: 'samples/basic/blog/[slug]/+page.svelte' }
	]);

	assert.equal(routes.map(simplify_route), [
		{
			id: '',
			pattern: '/^/$/',
			page: { layouts: [0], errors: [1], leaf: 2 }
		},

		{
			id: 'blog.json',
			pattern: '/^/blog.json$/',
			endpoint: { file: 'samples/basic/blog.json/+server.js' }
		},

		{
			id: 'about',
			pattern: '/^/about/?$/',
			page: { layouts: [0], errors: [1], leaf: 3 }
		},

		{
			id: 'blog',
			pattern: '/^/blog/?$/',
			page: { layouts: [0], errors: [1], leaf: 4 }
		},

		{
			id: 'blog/[slug].json',
			pattern: '/^/blog/([^/]+?).json$/',
			endpoint: {
				file: 'samples/basic/blog/[slug].json/+server.ts'
			}
		},

		{
			id: 'blog/[slug]',
			pattern: '/^/blog/([^/]+?)/?$/',
			page: { layouts: [0], errors: [1], leaf: 5 }
		}
	]);
});

const symlink_survived_git = fs
	.statSync(path.join(cwd, 'samples/symlinks/routes/foo'))
	.isSymbolicLink();

const test_symlinks = symlink_survived_git ? test : test.skip;

test_symlinks('creates symlinked routes', () => {
	const { nodes, routes } = create('samples/symlinks/routes');

	assert.equal(nodes.map(simplify_node), [
		default_layout,
		default_error,
		{ component: 'samples/symlinks/routes/foo/index.svelte' },
		{ component: 'samples/symlinks/routes/index.svelte' }
	]);

	assert.equal(routes, [
		{
			id: '',
			pattern: '/^/$/',
			page: { layouts: [0], errors: [1], leaf: 1 }
		},

		{
			id: 'foo',
			pattern: '/^/foo/?$/',
			page: { layouts: [0], errors: [1], leaf: 2 }
		}
	]);
});

test('creates routes with layout', () => {
	const { nodes, routes } = create('samples/basic-layout');

	assert.equal(nodes.map(simplify_node), [
		{ component: 'samples/basic-layout/+layout.svelte' },
		default_error,
		{ component: 'samples/basic-layout/foo/+layout.svelte' },
		{ component: 'samples/basic-layout/+page.svelte' },
		{ component: 'samples/basic-layout/foo/+page.svelte' }
	]);

	assert.equal(routes.map(simplify_route), [
		{
			id: '',
			pattern: '/^/$/',
			page: { layouts: [0], errors: [1], leaf: 3 }
		},

		{
			id: 'foo',
			pattern: '/^/foo/?$/',
			page: { layouts: [0, 2], errors: [1, undefined], leaf: 4 }
		}
	]);
});

test('succeeds when routes does not exist', () => {
	const { nodes, routes } = create('samples/basic/routes');
	assert.equal(nodes.map(simplify_node), [
		{ component: 'layout.svelte' },
		{ component: 'error.svelte' }
	]);
	assert.equal(routes.map(simplify_route), [
		{
			id: '',
			pattern: '/^$/'
		}
	]);
});

// TODO some characters will need to be URL-encoded in the filename
test('encodes invalid characters', () => {
	const { nodes, routes } = create('samples/encoding');

	// had to remove ? and " because windows

	// const quote = 'samples/encoding/".svelte';
	const hash = { component: 'samples/encoding/%23/+page.svelte' };
	// const question_mark = 'samples/encoding/?.svelte';

	assert.equal(nodes.map(simplify_node), [
		default_layout,
		default_error,
		// quote,
		hash
		// question_mark
	]);

	assert.equal(
		routes.map((p) => p.pattern),
		[
			/^\/$/,
			// /^\/%22\/?$/,
			/^\/%23\/?$/
			// /^\/%3F\/?$/
		]
	);
});

test('sorts routes correctly', () => {
	const { routes } = create('samples/sorting');

	assert.equal(
		routes.map((p) => p.id),
		[
			'',
			'(foo)',
			'(foo)/(bar)',
			'about',
			'foo',
			'post',
			'post/bar',
			'post/foo',
			'post/f[yy].json',
			'post/f[zz]',
			'post/f[xx]',
			'post/f[yy]',
			'foo/[bar]',
			'post/[id]',
			'[endpoint]',
			'[wildcard]',
			'[...rest]/deep/[...deep_rest]/xyz',
			'[...rest]/deep/[...deep_rest]',
			'[...rest]/abc',
			'[...rest]/deep',
			'(foo)/(bar)/[...all]',
			'[...anotherrest]',
			'[...rest]'
		]
	);
});

test('sorts routes with rest correctly', () => {
	const { nodes, routes } = create('samples/rest');

	assert.equal(nodes.map(simplify_node), [
		default_layout,
		default_error,
		{
			component: 'samples/rest/a/[...rest]/+page.svelte',
			server: 'samples/rest/a/[...rest]/+page.server.js'
		},
		{
			component: 'samples/rest/b/[...rest]/+page.svelte',
			server: 'samples/rest/b/[...rest]/+page.server.ts'
		}
	]);

	assert.equal(routes.map(simplify_route), [
		{
			id: '',
			pattern: '/^/$/'
		},
		{
			id: 'a',
			pattern: '/^/a/?$/'
		},
		{
			id: 'b',
			pattern: '/^/b/?$/'
		},
		{
			id: 'a/[...rest]',
			pattern: '/^/a(?:/(.*))?/?$/',
			page: { layouts: [0], errors: [1], leaf: 2 }
		},
		{
			id: 'b/[...rest]',
			pattern: '/^/b(?:/(.*))?/?$/',
			page: { layouts: [0], errors: [1], leaf: 3 }
		}
	]);
});

test('allows rest parameters inside segments', () => {
	const { nodes, routes } = create('samples/rest-prefix-suffix');

	assert.equal(nodes.map(simplify_node), [
		default_layout,
		default_error,
		{
			component: 'samples/rest-prefix-suffix/prefix-[...rest]/+page.svelte'
		}
	]);

	assert.equal(routes.map(simplify_route), [
		{
			id: '',
			pattern: '/^/$/'
		},
		{
			id: 'prefix-[...rest]',
			pattern: '/^/prefix-(.*?)/?$/',
			page: { layouts: [0], errors: [1], leaf: 2 }
		},
		{
			id: '[...rest].json',
			pattern: '/^/(.*?).json$/',
			endpoint: {
				file: 'samples/rest-prefix-suffix/[...rest].json/+server.js'
			}
		}
	]);
});

test('ignores files and directories with leading underscores', () => {
	const { routes } = create('samples/hidden-underscore');

	assert.equal(routes.map((r) => r.endpoint?.file).filter(Boolean), [
		'samples/hidden-underscore/e/f/g/h/+server.js'
	]);
});

test('ignores files and directories with leading dots except .well-known', () => {
	const { routes } = create('samples/hidden-dot');

	assert.equal(routes.map((r) => r.endpoint?.file).filter(Boolean), [
		'samples/hidden-dot/.well-known/dnt-policy.txt/+server.js'
	]);
});

test('allows multiple slugs', () => {
	const { routes } = create('samples/multiple-slugs');

	assert.equal(routes.filter((route) => route.endpoint).map(simplify_route), [
		{
			id: '[file].[ext]',
			pattern: '/^/([^/]+?).([^/]+?)$/',
			endpoint: {
				file: 'samples/multiple-slugs/[file].[ext]/+server.js'
			}
		}
	]);
});

test('fails if dynamic params are not separated', () => {
	assert.throws(() => {
		create('samples/invalid-params');
	}, /Invalid route \[foo\]\[bar\] — parameters must be separated/);
});

test('ignores things that look like lockfiles', () => {
	const { routes } = create('samples/lockfiles');

	assert.equal(routes.map(simplify_route), [
		{
			id: '',
			pattern: '/^/$/'
		},
		{
			id: 'foo',
			pattern: '/^/foo/?$/',
			endpoint: {
				file: 'samples/lockfiles/foo/+server.js'
			}
		}
	]);
});

test('works with custom extensions', () => {
	const { nodes, routes } = create('samples/custom-extension', {
		extensions: ['.jazz', '.beebop', '.funk', '.svelte']
	});

	assert.equal(nodes.map(simplify_node), [
		default_layout,
		default_error,
		{ component: 'samples/custom-extension/+page.funk' },
		{ component: 'samples/custom-extension/about/+page.jazz' },
		{ component: 'samples/custom-extension/blog/+page.svelte' },
		{ component: 'samples/custom-extension/blog/[slug]/+page.beebop' }
	]);

	assert.equal(routes.map(simplify_route), [
		{
			id: '',
			pattern: '/^/$/',
			page: { layouts: [0], errors: [1], leaf: 2 }
		},

		{
			id: 'blog.json',
			pattern: '/^/blog.json$/',
			endpoint: {
				file: 'samples/custom-extension/blog.json/+server.js'
			}
		},

		{
			id: 'about',
			pattern: '/^/about/?$/',
			page: { layouts: [0], errors: [1], leaf: 3 }
		},

		{
			id: 'blog',
			pattern: '/^/blog/?$/',
			page: { layouts: [0], errors: [1], leaf: 4 }
		},

		{
			id: 'blog/[slug].json',
			pattern: '/^/blog/([^/]+?).json$/',
			endpoint: {
				file: 'samples/custom-extension/blog/[slug].json/+server.js'
			}
		},

		{
			id: 'blog/[slug]',
			pattern: '/^/blog/([^/]+?)/?$/',
			page: { layouts: [0], errors: [1], leaf: 5 }
		}
	]);
});

test('lists static assets', () => {
	const { assets } = create('samples/basic');

	assert.equal(assets, [
		{
			file: 'bar/baz.txt',
			size: 14,
			type: 'text/plain'
		},
		{
			file: 'foo.txt',
			size: 9,
			type: 'text/plain'
		}
	]);
});

test('includes nested error components', () => {
	const { nodes, routes } = create('samples/nested-errors');

	assert.equal(nodes.map(simplify_node), [
		default_layout,
		default_error,
		{ component: 'samples/nested-errors/foo/+layout.svelte' },
		{ component: 'samples/nested-errors/foo/bar/+error.svelte' },
		{ component: 'samples/nested-errors/foo/bar/baz/+layout.svelte' },
		{ component: 'samples/nested-errors/foo/bar/baz/+error.svelte' },
		{ component: 'samples/nested-errors/foo/bar/baz/+page.svelte' }
	]);

	assert.equal(routes.map(simplify_route), [
		{
			id: '',
			pattern: '/^/$/'
		},
		{
			id: 'foo',
			pattern: '/^/foo/?$/'
		},
		{
			id: 'foo/bar',
			pattern: '/^/foo/bar/?$/'
		},
		{
			id: 'foo/bar/baz',
			pattern: '/^/foo/bar/baz/?$/',
			page: { layouts: [0, 2, undefined, 4], errors: [1, undefined, 3, 5], leaf: 6 }
		}
	]);
});

test('creates routes with named layouts', () => {
	const { nodes, routes } = create('samples/named-layouts');

	assert.equal(nodes.map(simplify_node), [
		// layouts
		{ component: 'samples/named-layouts/+layout.svelte' }, // 0
		default_error, // 1
		{
			component: 'samples/named-layouts/(special)/+layout.svelte',
			shared: 'samples/named-layouts/(special)/+layout.js',
			server: 'samples/named-layouts/(special)/+layout.server.js'
		}, // 2
		{ component: 'samples/named-layouts/(special)/(alsospecial)/+layout.svelte' }, // 3
		{ component: 'samples/named-layouts/a/+layout.svelte' }, // 4
		{ component: 'samples/named-layouts/b/c/+layout.svelte' }, // 5
		{ component: 'samples/named-layouts/b/d/(special)/+layout.svelte' }, // 6
		{ component: 'samples/named-layouts/b/d/(special)/(extraspecial)/+layout.svelte' }, // 7

		// pages
		{ component: 'samples/named-layouts/(special)/(alsospecial)/b/c/c1/+page.svelte' }, // 8
		{ component: 'samples/named-layouts/(special)/a/a2/+page.svelte' }, // 9
		{ component: 'samples/named-layouts/a/a1/+page.svelte' }, // 10
		{ component: 'samples/named-layouts/b/c/c2/+page@.svelte', parent_id: '' }, // 11
		{ component: 'samples/named-layouts/b/d/(special)/+page.svelte' }, // 12
		{ component: 'samples/named-layouts/b/d/(special)/(extraspecial)/d2/+page.svelte' }, // 13
		{
			component: 'samples/named-layouts/b/d/(special)/(extraspecial)/d3/+page@(special).svelte',
			parent_id: '(special)'
		}, // 14
		{ component: 'samples/named-layouts/b/d/d1/+page.svelte' } // 15
	]);

	assert.equal(routes.filter((route) => route.page).map(simplify_route), [
		{
			id: '(special)/a/a2',
			pattern: '/^/a/a2/?$/',
			page: { layouts: [0, 2], errors: [1, undefined], leaf: 9 }
		},
		{
			id: 'a/a1',
			pattern: '/^/a/a1/?$/',
			page: { layouts: [0, 4], errors: [1, undefined], leaf: 10 }
		},
		{
			id: 'b/d/(special)',
			pattern: '/^/b/d/?$/',
			page: { layouts: [0, 6], errors: [1, undefined], leaf: 12 }
		},
		{
			id: '(special)/(alsospecial)/b/c/c1',
			pattern: '/^/b/c/c1/?$/',
			page: { layouts: [0, 2, 3], errors: [1, undefined, undefined], leaf: 8 }
		},
		{
			id: 'b/c/c2',
			pattern: '/^/b/c/c2/?$/',
			page: { layouts: [0], errors: [1], leaf: 11 }
		},
		{
			id: 'b/d/(special)/(extraspecial)/d2',
			pattern: '/^/b/d/d2/?$/',
			page: { layouts: [0, 6, 7], errors: [1, undefined, undefined], leaf: 13 }
		},
		{
			id: 'b/d/(special)/(extraspecial)/d3',
			pattern: '/^/b/d/d3/?$/',
			page: { layouts: [0, 6], errors: [1, undefined], leaf: 14 }
		},
		{
			id: 'b/d/d1',
			pattern: '/^/b/d/d1/?$/',
			page: { layouts: [0], errors: [1], leaf: 15 }
		}
	]);
});

test('handles pages without .svelte file', () => {
	const { nodes, routes } = create('samples/page-without-svelte-file');

	assert.equal(nodes.map(simplify_node), [
		default_layout,
		default_error,
		{ component: 'samples/page-without-svelte-file/error/+error.svelte' },
		{ component: 'samples/page-without-svelte-file/layout/+layout.svelte' },
		{ component: 'samples/page-without-svelte-file/+page.svelte' },
		{ shared: 'samples/page-without-svelte-file/error/[...path]/+page.js' },
		{ component: 'samples/page-without-svelte-file/layout/exists/+page.svelte' },
		{ server: 'samples/page-without-svelte-file/layout/redirect/+page.server.js' }
	]);

	assert.equal(routes.map(simplify_route), [
		{
			id: '',
			pattern: '/^/$/',
			page: { layouts: [0], errors: [1], leaf: 4 }
		},
		{
			id: 'error',
			pattern: '/^/error/?$/'
		},
		{
			id: 'layout',
			pattern: '/^/layout/?$/'
		},
		{
			id: 'layout/exists',
			pattern: '/^/layout/exists/?$/',
			page: { layouts: [0, 3], errors: [1, undefined], leaf: 6 }
		},
		{
			id: 'layout/redirect',
			pattern: '/^/layout/redirect/?$/',
			page: { layouts: [0, 3], errors: [1, undefined], leaf: 7 }
		},
		{
			id: 'error/[...path]',
			pattern: '/^/error(?:/(.*))?/?$/',
			page: { layouts: [0, undefined], errors: [1, 2], leaf: 5 }
		}
	]);
});

test('errors on missing layout', () => {
	assert.throws(
		() => create('samples/named-layout-missing'),
		/samples\/named-layout-missing\/\+page@missing.svelte references missing segment "missing"/
	);
});

test('errors on invalid named layout reference', () => {
	assert.throws(
		() => create('samples/invalid-named-layout-reference'),
		/Only Svelte files can reference named layouts. Remove '@' from \+page@.js \(at samples\/invalid-named-layout-reference\/x\/\+page@.js\)/
	);
});

test('creates param matchers', () => {
	const { matchers } = create('samples/basic'); // directory doesn't matter for the test

	assert.equal(matchers, {
		foo: path.join('params', 'foo.js'),
		bar: path.join('params', 'bar.js')
	});
});

test('errors on param matchers with bad names', () => {
	const boogaloo = path.resolve(cwd, 'params', 'boo-galoo.js');
	fs.writeFileSync(boogaloo, '');
	try {
		assert.throws(() => create('samples/basic'), /Matcher names can only have/);
	} finally {
		fs.unlinkSync(boogaloo);
	}
});

test('errors on duplicate matchers', () => {
	const ts_foo = path.resolve(cwd, 'params', 'foo.ts');
	fs.writeFileSync(ts_foo, '');
	try {
		assert.throws(() => {
			create('samples/basic', {
				kit: {
					moduleExtensions: ['.js', '.ts']
				}
			});
		}, /Duplicate matchers/);
	} finally {
		fs.unlinkSync(ts_foo);
	}
});

test('prevents route conflicts between groups', () => {
	assert.throws(
		() => create('samples/conflicting-groups'),
		/\(x\)\/a and \(y\)\/a occupy the same route/
	);
});

// TODO remove for 1.0
test('errors on encountering a declared layout', () => {
	assert.throws(
		() => create('samples/declared-layout'),
		/samples\/declared-layout\/\+layout-foo.svelte should be reimplemented with layout groups: https:\/\/kit\.svelte\.dev\/docs\/advanced-routing#advanced-layouts/
	);
});

test.run();
