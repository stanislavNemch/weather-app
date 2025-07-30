import { defineConfig } from 'vite';
import { resolve, basename } from 'path';
import { glob } from 'glob';

import injectHTML from 'vite-plugin-html-inject';
import FullReload from 'vite-plugin-full-reload';
import SortCss from 'postcss-sort-media-queries';
import purgecss from '@fullhuman/postcss-purgecss';
import viteCompression from 'vite-plugin-compression';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  const htmlEntries = Object.fromEntries(
    glob
      .sync('src/**/*.html')
      .map(file => [basename(file, '.html'), resolve(__dirname, file)])
  );

  return {
    root: resolve(__dirname, 'src'),
    base: './',

    // Плагины Vite
    plugins: [
      injectHTML(),
      !isBuild && FullReload(['src/partials/**/*.html']),
      isBuild &&
        viteStaticCopy({
          targets: [
            {
              src: 'img/icon/*',
              dest: 'img/icon',
            },
          ],
        }),
      isBuild &&
        viteCompression({
          verbose: true,
          algorithm: 'brotliCompress',
          ext: '.br',
        }),
      isBuild &&
        viteCompression({
          verbose: true,
          algorithm: 'gzip',
          ext: '.gz',
        }),
    ].filter(Boolean),

    css: {
      postcss: {
        plugins: [
          SortCss(),
          isBuild &&
            purgecss.default({
              content: ['./src/**/*.html', './src/js/**/*.js'],
              safelist: {
                standard: [
                  'loaded',
                  'is-active',
                  'is-visible',
                  'chart-legend-item',
                  'disabled',
                  'chart-legend-item.disabled',
                ],
                deep: [/swiper/, /modal/],
              },
            }),
        ].filter(Boolean),
      },
    },

    build: {
      sourcemap: !isBuild,
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: htmlEntries,
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('gsap')) return 'vendor-gsap';
              if (id.includes('swiper')) return 'vendor-swiper';
              return 'vendor-common';
            }
          },
        },
      },
    },
  };
});
