import { Adapter } from '@sveltejs/kit';

export interface AdapterOptions {
	pages?: string;
	assets?: string;
	fallback?: string;
	precompress?: boolean;
	domain?: string;
	jekyll?: boolean;
}

export default function plugin(options?: AdapterOptions): Adapter;
