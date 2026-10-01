import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'assets/js',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: true,
    minify: 'esbuild',
    cssMinify: false,
    lib: {
      entry: 'src/ts/main.ts',
      formats: ['es'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'main.js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  esbuild: {
    legalComments: 'none',
  },
});
