import fs from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

import prettier from 'prettier';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { build, watch } from '../src/index.js';
import { load_config } from '../src/config.js';
import { rimraf, walk } from '../src/filesystem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

/**
 * @param {string} path
 */
async function test_make_package(path) {
	const cwd = join(__dirname, 'fixtures', path);
	const ewd = join(cwd, 'expected');
	const pwd = join(cwd, 'package');

	try {
		const config = await load_config({ cwd });
		config.package.dir = resolve(cwd, config.package.dir);

		await build(config, cwd);
		const expected_files = walk(ewd, true);
		const actual_files = walk(pwd, true);

		assert.equal(actual_files, expected_files);

		const extensions = ['.json', '.svelte', '.ts', 'js'];
		for (const file of actual_files) {
			const pathname = join(pwd, file);
			if (fs.statSync(pathname).isDirectory()) continue;
			assert.ok(expected_files.includes(file), `Did not expect ${file} in ${path}`);

			const expected = fs.readFileSync(join(ewd, file));
			const actual = fs.readFileSync(join(pwd, file));
			const err_msg = `Expected equal file contents for ${file} in ${path}`;

			if (extensions.some((ext) => pathname.endsWith(ext))) {
				const expected_content = format(file, expected.toString('utf-8'));
				const actual_content = format(file, actual.toString('utf-8'));
				assert.fixture(actual_content, expected_content, err_msg);
			} else {
				assert.ok(expected.equals(actual), err_msg);
			}
		}
	} finally {
		rimraf(pwd);
	}
}

/**
 * Format with Prettier in order to get expected and actual content aligned
 * @param {string} file
 * @param {string} content
 */
function format(file, content) {
	if (file.endsWith('package.json')) {
		// For some reason these are ordered differently in different test environments
		const json = JSON.parse(content);
		json.exports = Object.entries(json.exports).sort(([ak], [bk]) => ak.localeCompare(bk));
		content = JSON.stringify(json);
	}
	return prettier.format(content, {
		parser: file.endsWith('.svelte') ? 'svelte' : file.endsWith('.json') ? 'json' : 'typescript',
		plugins: ['prettier-plugin-svelte']
	});
}

for (const dir of fs.readdirSync(join(__dirname, 'errors'))) {
	test(`package error [${dir}]`, async () => {
		const cwd = join(__dirname, 'errors', dir);
		const pwd = join(cwd, 'package');

		const config = await load_config({ cwd });
		config.package.dir = resolve(cwd, config.package.dir);

		try {
			await build(config, cwd);
			assert.unreachable('Must not pass build');
		} catch (/** @type {any} */ error) {
			assert.instance(error, Error);
			switch (dir) {
				case 'duplicate-export':
					assert.match(
						error.message,
						'Duplicate "./utils" export. Please remove or rename either $lib/utils/index.js or $lib/utils.ts'
					);
					break;
				case 'no-lib-folder':
					assert.match(error.message, `${join(cwd, 'src', 'lib')} does not exist`);
					break;
				// TODO: non-existent tsconfig passes without error
				// 	it detects tsconfig in packages/kit instead and creates package folder
				// 	in packages/kit/package, not sure how to handle and test this yet
				// case 'no-tsconfig':
				// 	assert.match(error.message, 'Failed to locate tsconfig or jsconfig');
				// 	break;

				default:
					assert.unreachable('All error test must be handled');
					break;
			}
		} finally {
			rimraf(pwd);
		}
	});
}

test('create standard package with javascript', async () => {
	// should also preserve filename casing
	// should also correctly handle nested folders
	await test_make_package('javascript');
});

test('create standard package with typescript', async () => {
	await test_make_package('typescript');
});

test('create package and assets are not tampered', async () => {
	await test_make_package('assets');
});

test('create package with emitTypes settings disabled', async () => {
	await test_make_package('emitTypes-false');
});

test('create package and properly merge exports map', async () => {
	await test_make_package('exports-merge');
});

test('create package and properly exclude all exports', async () => {
	await test_make_package('exports-replace');
});

test('create package with files.exclude settings', async () => {
	await test_make_package('files-exclude');
});

test('create package and resolves $lib alias', async () => {
	await test_make_package('resolve-alias');
});

test('SvelteKit interop', async () => {
	await test_make_package('svelte-kit');
});

// chokidar doesn't fire events in github actions :shrug:
if (!process.env.CI) {
	test('watches for changes', async () => {
		const cwd = join(__dirname, 'watch');

		const config = await load_config({ cwd });
		config.package.dir = resolve(cwd, config.package.dir);

		const { watcher, ready, settled } = await watch(config, cwd);

		/** @param {string} file */
		function compare(file) {
			assert.equal(read(`package/${file}`), read(`expected/${file}`));
		}

		/** @param {string} file */
		function read(file) {
			return fs.readFileSync(join(__dirname, 'watch', file), 'utf-8');
		}

		/**
		 * @param {string} file
		 * @param {string} data
		 */
		function write(file, data) {
			return fs.writeFileSync(join(__dirname, 'watch', file), data);
		}

		/** @param {string} file */
		function remove(file) {
			const filepath = join(__dirname, 'watch', file);
			if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
		}

		try {
			await ready;

			// completes initial build
			compare('index.js');

			// processes a .js file
			write('src/lib/a.js', 'export const a = "a";');
			await settled();
			compare('a.js');
			compare('a.d.ts');

			// processes a .ts file
			write('src/lib/b.ts', 'export const b = "b";');
			await settled();
			compare('b.js');
			compare('b.d.ts');

			// processes a Svelte file
			write('src/lib/Test.svelte', '<script lang="ts">export let answer: number</script>');
			await settled();
			compare('Test.svelte');
			compare('Test.svelte.d.ts');
		} finally {
			watcher.close();

			remove('src/lib/Test.svelte');
			remove('src/lib/a.js');
			remove('src/lib/b.ts');
		}
	});
}

test.run();
