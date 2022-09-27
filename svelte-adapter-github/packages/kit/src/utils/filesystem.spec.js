import { mkdtempSync, writeFileSync, readdirSync, mkdirSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { copy, mkdirp } from './filesystem.js';

const suite_copy = suite('#copy()');

/** @type {string} */
let source_dir;
/** @type {string} */
let dest_dir;

suite_copy.before.each(() => {
	const temp_dir = mkdtempSync(join(tmpdir(), 'kit-core-filesystem-'));
	source_dir = join(temp_dir, 'source');
	dest_dir = join(temp_dir, 'dest');
	mkdirSync(source_dir);
	mkdirSync(dest_dir);
});

/**
 * @param {string} file
 * @param {string} contents
 */
const write = (file, contents) => {
	const filepath = join(source_dir, file);
	mkdirp(dirname(filepath));
	writeFileSync(filepath, contents);
};

suite_copy('without filter', () => {
	write('file-one.js', '');
	write('file-two.css', '');
	write('file-three', '');

	copy(source_dir, dest_dir);

	const copied = readdirSync(dest_dir);

	assert.equal(copied.sort(), ['file-one.js', 'file-two.css', 'file-three'].sort());
});

suite_copy('filters out subdirectory contents', () => {
	write('file-one.js', '');
	write('file-two.css', '');
	write('no-copy/do-not-copy.js', '');

	copy(source_dir, dest_dir, {
		filter: (f) => f !== 'no-copy'
	});

	const copied = readdirSync(dest_dir);

	assert.equal(copied.sort(), ['file-one.js', 'file-two.css'].sort());
});

suite_copy('copies recursively', () => {
	write('file-one.js', '');
	write('file-two.css', '');
	write('deep/a.js', '');
	write('deep/b.js', '');

	copy(source_dir, dest_dir);

	const root = readdirSync(dest_dir);

	assert.equal(root.sort(), ['file-one.js', 'file-two.css', 'deep'].sort());

	const subdir = readdirSync(join(dest_dir, 'deep'));

	assert.equal(subdir.sort(), ['a.js', 'b.js'].sort());
});

suite_copy('returns a list of copied files', () => {
	write('file-one.js', '');
	write('file-two.css', '');
	write('deep/a.js', '');
	write('deep/b.js', '');

	let file_list = copy(source_dir, dest_dir);
	assert.equal(file_list.sort(), ['file-one.js', 'file-two.css', 'deep/a.js', 'deep/b.js'].sort());

	file_list = copy(`${source_dir}/file-one.js`, `${dest_dir}/file-one-renamed.js`);
	assert.equal(file_list, ['file-one-renamed.js']);
});

suite_copy('replaces strings', () => {
	write('foo.md', 'the quick brown JUMPER jumps over the lazy JUMPEE');
	copy(source_dir, dest_dir, {
		replace: {
			JUMPER: 'fox',
			JUMPEE: 'dog'
		}
	});

	assert.equal(
		readFileSync(join(dest_dir, 'foo.md'), 'utf8'),
		'the quick brown fox jumps over the lazy dog'
	);
});

suite_copy.run();
