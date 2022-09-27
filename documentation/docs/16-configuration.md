---
title: Configuration
---

Your project's configuration lives in a `svelte.config.js` file. All values are optional. The complete list of options, with defaults, is shown here:

```js
/// file: svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
	// options passed to svelte.compile (https://svelte.dev/docs#compile-time-svelte-compile)
	compilerOptions: {},

	// an array of file extensions that should be treated as Svelte components
	extensions: ['.svelte'],

	kit: {
		adapter: undefined,
		alias: {},
		appDir: '_app',
		csp: {
			mode: 'auto',
			directives: {
				'default-src': undefined
				// ...
			}
		},
		csrf: {
			checkOrigin: true
		},
		env: {
			dir: process.cwd(),
			publicPrefix: 'PUBLIC_'
		},
		files: {
			assets: 'static',
			hooks: {
				client: 'src/hooks.client',
				server: 'src/hooks.server'
			},
			lib: 'src/lib',
			params: 'src/params',
			routes: 'src/routes',
			serviceWorker: 'src/service-worker',
			appTemplate: 'src/app.html',
			errorTemplate: 'src/error.html'
		},
		inlineStyleThreshold: 0,
		moduleExtensions: ['.js', '.ts'],
		outDir: '.svelte-kit',
		paths: {
			assets: '',
			base: ''
		},
		prerender: {
			concurrency: 1,
			crawl: true,
			enabled: true,
			entries: ['*'],
			onError: 'fail',
			origin: 'http://sveltekit-prerender'
		},
		serviceWorker: {
			register: true,
			files: (filepath) => !/\.DS_Store/.test(filepath)
		},
		trailingSlash: 'never',
		version: {
			name: Date.now().toString(),
			pollInterval: 0
		}
	},

	// options passed to @sveltejs/package
	package: {
		source: 'value of kit.files.lib, if available, else src/lib',
		dir: 'package',
		emitTypes: true,
		// excludes all .d.ts and files starting with _ as the name
		exports: (filepath) => !/^_|\/_|\.d\.ts$/.test(filepath),
		files: () => true
	},

	// options passed to svelte.preprocess (https://svelte.dev/docs#compile-time-svelte-preprocess)
	preprocess: null
};

export default config;
```

### adapter

Run when executing `vite build` and determines how the output is converted for different platforms. See [Adapters](/docs/adapters).

### alias

An object containing zero or more aliases used to replace values in `import` statements. These aliases are automatically passed to Vite and TypeScript.

```js
/// file: svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		alias: {
			// this will match a file
			'my-file': 'path/to/my-file.js',

			// this will match a directory and its contents
			// (`my-directory/x` resolves to `path/to/my-directory/x`)
			'my-directory': 'path/to/my-directory',

			// an alias ending /* will only match
			// the contents of a directory, not the directory itself
			'my-directory/*': 'path/to/my-directory/*'
		}
	}
};
```

> The built-in `$lib` alias is controlled by `config.kit.files.lib` as it is used for packaging.

> You will need to run `npm run dev` to have SvelteKit automatically generate the required alias configuration in `jsconfig.json` or `tsconfig.json`.

### appDir

The directory relative to `paths.assets` where the built JS and CSS (and imported assets) are served from. (The filenames therein contain content-based hashes, meaning they can be cached indefinitely). Must not start or end with `/`.

### csp

An object containing zero or more of the following values:

- `mode` — 'hash', 'nonce' or 'auto'
- `directives` — an object of `[directive]: value[]` pairs
- `reportOnly` — an object of `[directive]: value[]` pairs for CSP report-only mode

[Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) configuration. CSP helps to protect your users against cross-site scripting (XSS) attacks, by limiting the places resources can be loaded from. For example, a configuration like this...

```js
/// file: svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		csp: {
			directives: {
				'script-src': ['self']
			},
			reportOnly: {
				'script-src': ['self']
			}
		}
	}
};

export default config;
```

...would prevent scripts loading from external sites. SvelteKit will augment the specified directives with nonces or hashes (depending on `mode`) for any inline styles and scripts it generates.

When pages are prerendered, the CSP header is added via a `<meta http-equiv>` tag (note that in this case, `frame-ancestors`, `report-uri` and `sandbox` directives will be ignored).

> When `mode` is `'auto'`, SvelteKit will use nonces for dynamically rendered pages and hashes for prerendered pages. Using nonces with prerendered pages is insecure and therefore forbidden.

> Note that most [Svelte transitions](https://svelte.dev/tutorial/transition) work by creating an inline `<style>` element. If you use these in your app, you must either leave the `style-src` directive unspecified or add `unsafe-inline`.

### csrf

Protection against [cross-site request forgery](https://owasp.org/www-community/attacks/csrf) attacks:

- `checkOrigin` — if `true`, SvelteKit will check the incoming `origin` header for `POST` form submissions and verify that it matches the server's origin

To allow people to make `POST` form submissions to your app from other origins, you will need to disable this option. Be careful!

### env

Environment variable configuration:

- `dir` — the directory to search for `.env` files.
- `publicPrefix` — a prefix that signals that an environment variable is safe to expose to client-side code. See [`$env/static/public`](/docs/modules#$env-static-public) and [`$env/dynamic/public`](/docs/modules#$env-dynamic-public). Note that Vite's [`envPrefix`](https://vitejs.dev/config/shared-options.html#envprefix) must be set separately if you are using Vite's environment variable handling - though use of that feature should generally be unnecessary.

### files

An object containing zero or more of the following `string` values:

- `assets` — a place to put static files that should have stable URLs and undergo no processing, such as `favicon.ico` or `manifest.json`
- `hooks` — the location of your client and server hooks (see [Hooks](/docs/hooks))
- `lib` — your app's internal library, accessible throughout the codebase as `$lib`
- `params` — a directory containing [parameter matchers](/docs/advanced-routing#matching)
- `routes` — the files that define the structure of your app (see [Routing](/docs/routing))
- `serviceWorker` — the location of your service worker's entry point (see [Service workers](/docs/service-workers))
- `template` — the location of the template for HTML responses

### inlineStyleThreshold

Inline CSS inside a `<style>` block at the head of the HTML. This option is a number that specifies the maximum length of a CSS file to be inlined. All CSS files needed for the page and smaller than this value are merged and inlined in a `<style>` block.

> This results in fewer initial requests and can improve your [First Contentful Paint](https://web.dev/first-contentful-paint) score. However, it generates larger HTML output and reduces the effectiveness of browser caches. Use it advisedly.

### moduleExtensions

An array of file extensions that SvelteKit will treat as modules. Files with extensions that match neither `config.extensions` nor `config.kit.moduleExtensions` will be ignored by the router.

### outDir

The directory that SvelteKit writes files to during `dev` and `build`. You should exclude this directory from version control.

### package

Options related to [creating a package](/docs/packaging).

- `source` - library directory
- `dir` - output directory
- `emitTypes` - by default, `svelte-package` will automatically generate types for your package in the form of `.d.ts` files. While generating types is configurable, we believe it is best for the ecosystem quality to generate types, always. Please make sure you have a good reason when setting it to `false` (for example when you want to provide handwritten type definitions instead)
- `exports` - a function with the type of `(filepath: string) => boolean`. When `true`, the filepath will be included in the `exports` field of the `package.json`. Any existing values in the `package.json` source will be merged with values from the original `exports` field taking precedence
- `files` - a function with the type of `(filepath: string) => boolean`. When `true`, the file will be processed and copied over to the final output folder, specified in `dir`

For advanced `filepath` matching, you can use `exports` and `files` options in conjunction with a globbing library:

```js
// @filename: ambient.d.ts
declare module 'micromatch';

/// file: svelte.config.js
// @filename: index.js
// ---cut---
import mm from 'micromatch';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	package: {
		exports: (filepath) => {
			if (filepath.endsWith('.d.ts')) return false;
			return mm.isMatch(filepath, ['!**/_*', '!**/internal/**']);
		},
		files: mm.matcher('!**/build.*')
	}
};

export default config;
```

### paths

An object containing zero or more of the following `string` values:

- `assets` — an absolute path that your app's files are served from. This is useful if your files are served from a storage bucket of some kind
- `base` — a root-relative path that must start, but not end with `/` (e.g. `/base-path`), unless it is the empty string. This specifies where your app is served from and allows the app to live on a non-root path

### prerender

See [Prerendering](/docs/page-options#prerender). An object containing zero or more of the following:

- `concurrency` — how many pages can be prerendered simultaneously. JS is single-threaded, but in cases where prerendering performance is network-bound (for example loading content from a remote CMS) this can speed things up by processing other tasks while waiting on the network response
- `crawl` — determines whether SvelteKit should find pages to prerender by following links from the seed page(s)
- `enabled` — set to `false` to disable prerendering altogether
- `entries` — an array of pages to prerender, or start crawling from (if `crawl: true`). The `*` string includes all non-dynamic routes (i.e. pages with no `[parameters]` )
- `onError`

  - `'fail'` — (default) fails the build when a routing error is encountered when following a link
  - `'continue'` — allows the build to continue, despite routing errors
  - `function` — custom error handler allowing you to log, `throw` and fail the build, or take other action of your choosing based on the details of the crawl

    ```js
    import adapter from '@sveltejs/adapter-static';

    /** @type {import('@sveltejs/kit').Config} */
    const config = {
    	kit: {
    		adapter: adapter(),
    		prerender: {
    			onError: ({ status, path, referrer, referenceType }) => {
    				if (path.startsWith('/blog')) throw new Error('Missing a blog page!');
    				console.warn(
    					`${status} ${path}${referrer ? ` (${referenceType} from ${referrer})` : ''}`
    				);
    			}
    		}
    	}
    };

    export default config;
    ```

- `origin` — the value of `url.origin` during prerendering; useful if it is included in rendered content

### serviceWorker

An object containing zero or more of the following values:

- `register` - if set to `false`, will disable automatic service worker registration
- `files` - a function with the type of `(filepath: string) => boolean`. When `true`, the given file will be available in `$service-worker.files`, otherwise it will be excluded.

### trailingSlash

Whether to remove, append, or ignore trailing slashes when resolving URLs (note that this only applies to pages, not endpoints).

- `'never'` — redirect `/x/` to `/x`
- `'always'` — redirect `/x` to `/x/`
- `'ignore'` — don't automatically add or remove trailing slashes. `/x` and `/x/` will be treated equivalently

This option also affects [prerendering](/docs/page-options#prerender). If `trailingSlash` is `always`, a route like `/about` will result in an `about/index.html` file, otherwise it will create `about.html`, mirroring static webserver conventions.

> Ignoring trailing slashes is not recommended — the semantics of relative paths differ between the two cases (`./y` from `/x` is `/y`, but from `/x/` is `/x/y`), and `/x` and `/x/` are treated as separate URLs which is harmful to SEO. If you use this option, ensure that you implement logic for conditionally adding or removing trailing slashes from `request.path` inside your [`handle`](/docs/hooks#server-hooks-handle) function.

### version

An object containing zero or more of the following values:

- `name` - current app version string
- `pollInterval` - interval in milliseconds to poll for version changes

Client-side navigation can be buggy if you deploy a new version of your app while people are using it. If the code for the new page is already loaded, it may have stale content; if it isn't, the app's route manifest may point to a JavaScript file that no longer exists. SvelteKit solves this problem by falling back to traditional full-page navigation if it detects that a new version has been deployed, using the `name` specified here (which defaults to a timestamp of the build).

If you set `pollInterval` to a non-zero value, SvelteKit will poll for new versions in the background and set the value of the [`updated`](/docs/modules#$app-stores) store to `true` when it detects one.
