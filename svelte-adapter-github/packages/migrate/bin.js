#!/usr/bin/env node
import fs from 'fs';
import { fileURLToPath } from 'url';
import colors from 'kleur';

const migration = process.argv[2];
const dir = fileURLToPath(new URL('.', import.meta.url));

const migrations = fs
	.readdirSync(`${dir}/migrations`)
	.filter((migration) => fs.existsSync(`${dir}/migrations/${migration}/index.js`));

if (migrations.includes(migration)) {
	const { migrate } = await import(`./migrations/${migration}/index.js`);
	migrate();
} else {
	console.error(
		colors.bold().red(`You must specify one of the following migrations: ${migrations.join(', ')}`)
	);
}
