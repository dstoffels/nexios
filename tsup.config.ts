import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/**/*.ts'],
	outDir: 'dist',
	format: ['esm', 'cjs'],
	target: 'node16',
	sourcemap: true,
	dts: true,
	clean: true,
	splitting: false,
	minify: false,
	esbuildOptions(options) {
		options.outbase = 'src';
	},
});
