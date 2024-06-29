import path from 'path';
import { sveltekit } from '@sveltejs/kit/vite';
import { imagetools } from 'vite-imagetools';
import { plugin as MdPlugin } from 'vite-plugin-markdown';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		imagetools({}),
		sveltekit(),
		MdPlugin({ mode: 'html' })
	],
	resolve: {
		alias: {
			$post: path.resolve(__dirname, './src/post'),
			'@images': path.resolve(__dirname, './src/images')
		}
	},
	build: {
		chunkSizeWarningLimit: 350,
		target: ['es2020']
	}
};

export default config;
