import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        { src: 'src/background.js', dest: '.' }, // Copy background.js to the root of dist
        { src: 'src/content.js', dest: '.' }, // Copy content.js to the root of dist
        { src: 'manifest.json', dest: '.' },    // Copy manifest.json to the root of dist
        { src: 'icons/*', dest: 'icons' }       // Copy icons to dist/icons
      ],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        popup: 'index.html',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
