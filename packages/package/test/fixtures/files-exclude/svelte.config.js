const config = {
	package: {
		files(filepath) {
			const ext = filepath.slice(filepath.lastIndexOf('.') + 1);
			if (ext === 'js' || ext === 'svelte') return !filepath.includes('exclude');
			return ext !== 'mjs';
		}
	}
};

export default config;
