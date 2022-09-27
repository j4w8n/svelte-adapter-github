import { read_samples } from '../utils.js';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { migrate_page_server } from './index.js';

for (const sample of read_samples(import.meta.url)) {
	test(sample.description, () => {
		const actual = migrate_page_server(sample.before, sample.filename ?? '+page.server.js');
		assert.equal(actual, sample.after);
	});
}

test.run();
