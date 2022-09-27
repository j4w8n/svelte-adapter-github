import { expect } from '@playwright/test';
import { start_server, test } from '../../../utils.js';
import { fetch } from 'undici';
import { createHash, randomBytes } from 'node:crypto';

/** @typedef {import('@playwright/test').Response} Response */

test.skip(({ javaScriptEnabled }) => javaScriptEnabled);

test.describe.configure({ mode: 'parallel' });

test.describe('Caching', () => {
	test('caches pages', async ({ request }) => {
		const response = await request.get('/caching');
		expect(response.headers()['cache-control']).toBe('public, max-age=30');
	});
});

test.describe('Content-Type', () => {
	test('sets Content-Type on page', async ({ request }) => {
		const response = await request.get('/content-type-header');
		expect(response.headers()['content-type']).toBe('text/html');
	});
});

test.describe('Cookies', () => {
	test('does not forward cookies from external domains', async ({ request }) => {
		const { close, port } = await start_server(async (req, res) => {
			if (req.url === '/') {
				res.writeHead(200, {
					'set-cookie': 'external=true',
					'access-control-allow-origin': '*'
				});

				res.end('ok');
			} else {
				res.writeHead(404);
				res.end('not found');
			}
		});

		const response = await request.get(`/load/fetch-external-no-cookies?port=${port}`);
		expect(response.headers()['set-cookie']).not.toContain('external=true');

		close();
	});
});

test.describe('CSRF', () => {
	test('Blocks requests with incorrect origin', async ({ baseURL }) => {
		const res = await fetch(`${baseURL}/csrf`, {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			}
		});

		expect(res.status).toBe(403);
		expect(await res.text()).toBe('Cross-site POST form submissions are forbidden');
	});
});

test.describe('Endpoints', () => {
	test('HEAD with matching headers but without body', async ({ request }) => {
		const url = '/endpoint-output/body';

		const responses = {
			head: await request.head(url),
			get: await request.get(url)
		};

		const headers = {
			head: responses.head.headers(),
			get: responses.get.headers()
		};

		expect(responses.head.status()).toBe(200);
		expect(responses.get.status()).toBe(200);
		expect(await responses.head.text()).toBe('');
		expect(await responses.get.text()).toBe('{}');

		['date', 'transfer-encoding'].forEach((name) => {
			delete headers.head[name];
			delete headers.get[name];
		});

		expect(headers.head).toEqual(headers.get);
	});

	// TODO all the remaining tests in this section are really only testing
	// setResponse, since we're not otherwise changing anything on the response.
	// might be worth making these unit tests instead
	test('multiple set-cookie on endpoints using GET', async ({ request }) => {
		const response = await request.get('/set-cookie');

		const cookies = response
			.headersArray()
			.filter((obj) => obj.name === 'set-cookie')
			.map((obj) => obj.value);

		expect(cookies).toEqual([
			'answer=42; HttpOnly',
			'problem=comma, separated, values; HttpOnly',
			'name=SvelteKit; path=/; HttpOnly'
		]);
	});

	// TODO see above
	test('body can be a binary ReadableStream', async ({ request }) => {
		const interruptedResponse = request.get('/endpoint-output/stream-throw-error');
		await expect(interruptedResponse).rejects.toThrow('socket hang up');

		const response = await request.get('/endpoint-output/stream');
		const body = await response.body();
		const digest = createHash('sha256').update(body).digest('base64url');
		expect(response.headers()['digest']).toEqual(`sha-256=${digest}`);
	});

	// TODO see above
	test('stream can be canceled with TypeError', async ({ request }) => {
		const responseBefore = await request.get('/endpoint-output/stream-typeerror?what');
		expect(await responseBefore.text()).toEqual('null');

		const interruptedResponse = request.get('/endpoint-output/stream-typeerror');
		await expect(interruptedResponse).rejects.toThrow('socket hang up');

		const responseAfter = await request.get('/endpoint-output/stream-typeerror?what');
		expect(await responseAfter.text()).toEqual('TypeError');
	});

	// TODO see above
	test('request body can be read slow', async ({ request }) => {
		const data = randomBytes(1024 * 256);
		const digest = createHash('sha256').update(data).digest('base64url');
		const response = await request.put('/endpoint-input/sha256', { data });
		expect(await response.text()).toEqual(digest);
	});
});

test.describe('Errors', () => {
	test('invalid route response is handled', async ({ request }) => {
		const response = await request.get('/errors/invalid-route-response');

		expect(/** @type {import('@playwright/test').APIResponse} */ (response).status()).toBe(500);
		expect(await response.text()).toMatch(
			'Invalid response from route /errors/invalid-route-response: handler should return a Response object'
		);
	});

	test('unhandled http method', async ({ request }) => {
		const response = await request.put('/errors/invalid-route-response');

		expect(response.status()).toBe(405);
		expect(await response.text()).toMatch('PUT method not allowed');
	});

	// TODO re-enable this if https://github.com/vitejs/vite/issues/7046 is implemented
	test.skip('error evaluating module', async ({ request }) => {
		const response = await request.get('/errors/init-error-endpoint');

		expect(response.status()).toBe(500);
		expect(await response.text()).toMatch('thisvariableisnotdefined is not defined');
	});

	test('returns 400 when accessing a malformed URI', async ({ page }) => {
		const response = await page.goto('/%c0%ae%c0%ae/etc/passwd');
		if (process.env.DEV) {
			// Vite will return a 500 error code
			// We mostly want to make sure malformed requests don't bring down the whole server
			expect(/** @type {Response} */ (response).status()).toBeGreaterThanOrEqual(400);
		} else {
			expect(/** @type {Response} */ (response).status()).toBe(400);
		}
	});

	test('stack traces are not fixed twice', async ({ page }) => {
		await page.goto('/errors/stack-trace');
		expect(await page.textContent('#message')).toBe(
			'This is your custom error page saying: "Cannot read properties of undefined (reading \'toUpperCase\')"'
		);

		// check the stack wasn't mutated
		await page.goto('/errors/stack-trace');
		expect(await page.textContent('#message')).toBe(
			'This is your custom error page saying: "Cannot read properties of undefined (reading \'toUpperCase\')"'
		);
	});

	test('throw error(...) in endpoint', async ({ request, read_errors }) => {
		// HTML
		{
			const res = await request.get('/errors/endpoint-throw-error', {
				headers: {
					accept: 'text/html'
				}
			});

			const error = read_errors('/errors/endpoint-throw-error');
			expect(error).toBe(undefined);

			expect(res.status()).toBe(401);
			expect(await res.text()).toContain(
				'This is the static error page with the following message: You shall not pass'
			);
		}

		// JSON (default)
		{
			const res = await request.get('/errors/endpoint-throw-error');

			const error = read_errors('/errors/endpoint-throw-error');
			expect(error).toBe(undefined);

			expect(res.status()).toBe(401);
			expect(await res.json()).toEqual({
				message: 'You shall not pass'
			});
		}
	});

	test('throw redirect(...) in endpoint', async ({ page, read_errors }) => {
		const res = await page.goto('/errors/endpoint-throw-redirect');
		expect(res?.status()).toBe(200); // redirects are opaque to the browser

		const error = read_errors('/errors/endpoint-throw-redirect');
		expect(error).toBe(undefined);

		expect(await page.textContent('h1')).toBe('the answer is 42');
	});

	test('error thrown in handle results in a rendered error page or JSON response', async ({
		request
	}) => {
		// HTML
		{
			const res = await request.get('/errors/error-in-handle', {
				headers: {
					accept: 'text/html'
				}
			});

			expect(res.status()).toBe(500);
			expect(await res.text()).toContain(
				'This is the static error page with the following message: Error in handle'
			);
		}

		// JSON (default)
		{
			const res = await request.get('/errors/error-in-handle');

			const error = await res.json();

			expect(error.stack).toBe(undefined);
			expect(res.status()).toBe(500);
			expect(error).toEqual({
				message: 'Error in handle'
			});
		}
	});
});

test.describe('Load', () => {
	test('fetching a non-existent resource in root layout fails without hanging', async ({
		request
	}) => {
		const response = await request.get('/errors/error-in-layout');
		expect(await response.text()).toContain('Error: 404');
	});

	test('fetch does not load a file with a # character', async ({ request }) => {
		const response = await request.get('/load/static-file-with-hash');
		expect(await response.text()).toContain('status: 404');
	});

	test('includes origin header on non-GET internal request', async ({ page, baseURL }) => {
		await page.goto('/load/fetch-origin-internal');
		expect(await page.textContent('h1')).toBe(`origin: ${new URL(baseURL).origin}`);
	});

	test('includes origin header on external request', async ({ page, baseURL }) => {
		const { port, close } = await start_server((req, res) => {
			if (req.url === '/') {
				res.writeHead(200, {
					'content-type': 'application/json',
					'access-control-allow-origin': '*'
				});

				res.end(JSON.stringify({ origin: req.headers.origin }));
			} else {
				res.writeHead(404);
				res.end('not found');
			}
		});

		await page.goto(`/load/fetch-origin-external?port=${port}`);
		expect(await page.textContent('h1')).toBe(`origin: ${new URL(baseURL).origin}`);

		close();
	});
});

test.describe('Routing', () => {
	test('event.params are available in handle', async ({ request }) => {
		const response = await request.get('/routing/params-in-handle/banana');
		expect(await response.json()).toStrictEqual({
			key: 'routing/params-in-handle/[x]',
			params: { x: 'banana' }
		});
	});

	test('/favicon.ico is a valid route', async ({ request }) => {
		const response = await request.get('/favicon.ico');
		expect(response.status()).toBe(200);

		const data = await response.json();
		expect(data).toEqual({ surprise: 'lol' });
	});
});

test.describe('Shadowed pages', () => {
	test('Action can return undefined', async ({ baseURL, request }) => {
		const response = await request.post('/shadowed/simple/post', {
			form: {},
			headers: {
				accept: 'application/json',
				origin: new URL(baseURL).origin
			}
		});

		expect(response.status()).toBe(200);
		expect(await response.json()).toEqual({ type: 'success', status: 204 });
	});
});

test.describe('Static files', () => {
	test('static files', async ({ request }) => {
		let response = await request.get('/static.json');
		expect(await response.json()).toBe('static file');

		response = await request.get('/subdirectory/static.json');
		expect(await response.json()).toBe('subdirectory file');

		response = await request.get('/favicon.ico');
		expect(response.status()).toBe(200);
	});

	test('does not use Vite to serve contents of static directory', async ({ request }) => {
		const response = await request.get('/static/static.json');
		expect(response.status()).toBe(process.env.DEV ? 403 : 404);
	});

	test('Vite serves assets in allowed directories', async ({ page, request }) => {
		await page.goto('/assets');
		const path = await page.textContent('h1');
		if (!path) throw new Error('Could not determine path');

		const r1 = await request.get(path);
		expect(r1.status()).toBe(200);
		expect(await r1.text()).toContain('http://www.w3.org/2000/svg');

		// check that we can fetch a route which overlaps with the name of a file
		const r2 = await request.get('/package.json');
		expect(r2.status()).toBe(200);
		expect(await r2.json()).toEqual({ works: true });
	});

	test('Filenames are case-sensitive', async ({ request }) => {
		const response = await request.get('/static.JSON');
		expect(response.status()).toBe(404);
	});

	test('Serves symlinked asset', async ({ request }) => {
		const response = await request.get('/symlink-from/hello.txt');
		expect(response.status()).toBe(200);
		expect(await response.text()).toBe('hello');
	});
});

test.describe('setHeaders', () => {
	test('allows multiple set-cookie headers with different values', async ({ page }) => {
		const response = await page.goto('/headers/set-cookie/sub');
		const cookies = (await response?.allHeaders())['set-cookie'];
		expect(cookies.includes('cookie1=value1') && cookies.includes('cookie2=value2')).toBe(true);
	});
});

test.describe('cookies', () => {
	test('cookie.serialize created correct cookie header string', async ({ page }) => {
		const response = await page.goto('/cookies/serialize');
		const cookies = await response.headerValue('set-cookie');
		expect(
			cookies.includes('before=before') &&
				cookies.includes('after=after') &&
				cookies.includes('endpoint=endpoint')
		).toBe(true);
	});
});

test.describe('Miscellaneous', () => {
	test('does not serve version.json with an immutable cache header', async ({ request }) => {
		// this isn't actually a great test, because caching behaviour is down to adapters.
		// but it's better than nothing
		const response = await request.get('/_app/version.json');
		const headers = response.headers();
		expect(headers['cache-control'] || '').not.toContain('immutable');
	});
});
