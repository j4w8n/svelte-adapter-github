/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.jesuslivesineveryone', '.whokilledthemuffinman', '.svelte.md', '.svelte'],
	kit: {
		csp: {
			directives: {
				'script-src': ['self']
			}
		},
		files: {
			assets: 'public',
			lib: 'source/components',
			routes: 'source/pages',
			appTemplate: 'source/template.html',
			hooks: {
				client: 'source/hooks.client.js',
				server: 'source/hooks.server.js'
			},
			// while we specify a path for the service worker, we expect it to not exist in the test
			serviceWorker: 'source/service-worker'
		},
		appDir: '_wheee',
		inlineStyleThreshold: 1024,
		outDir: '.custom-out-dir',
		trailingSlash: 'always',
		paths: {
			base: '/path-base',
			assets: 'https://cdn.example.com/stuff'
		},
		env: {
			dir: './env-dir',
			publicPrefix: 'GO_AWAY_'
		}
	}
};

export default config;
