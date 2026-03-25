import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Plugin to organize build output after bundling
const organizeBuild = () => ({
  name: 'organize-build',
  closeBundle() {
    // Ensure directories exist
    mkdirSync('dist/assets', { recursive: true });
    mkdirSync('dist/background', { recursive: true });

    // Copy static files
    copyFileSync('manifest.json', 'dist/manifest.json');
    copyFileSync('src/assets/icon-48.png', 'dist/assets/icon-48.png');
    copyFileSync('src/assets/icon-96.png', 'dist/assets/icon-96.png');
    copyFileSync('src/background/background.html', 'dist/background/background.html');

    // Move popup from dist/src/popup/ to dist/popup/
    if (existsSync('dist/src/popup')) {
      mkdirSync('dist/popup', { recursive: true });
      const files = readdirSync('dist/src/popup');
      for (const file of files) {
        renameSync(`dist/src/popup/${file}`, `dist/popup/${file}`);
      }
      rmdirSync('dist/src/popup');
      rmdirSync('dist/src');
    }

    // Find and move CSS file from assets to popup
    const assetFiles = existsSync('dist/assets') ? readdirSync('dist/assets') : [];
    const cssFile = assetFiles.find(f => f.endsWith('.css'));
    if (cssFile) {
      renameSync(`dist/assets/${cssFile}`, 'dist/popup/styles.css');
    }

    // Update HTML to reference correct paths (relative, not absolute)
    if (existsSync('dist/popup/index.html')) {
      let html = readFileSync('dist/popup/index.html', 'utf-8');
      // Replace all variations of paths with relative ones
      // The HTML is in dist/popup/, so:
      // - JS is at ./index.js (same directory)
      // - CSS is at ./styles.css (moved there)
      // - Shared chunks are at ../shared/
      html = html.replace(/src="[^"]*\/popup\/index\.js"/g, 'src="./index.js"');
      html = html.replace(/href="[^"]*\/assets\/[^"]+"/g, 'href="./styles.css"');
      html = html.replace(/href="[^"]*\/shared\/[^"]+"/g, 'href="../shared/config-BZq2fVqC.js"');
      writeFileSync('dist/popup/index.html', html);
      console.log('Updated popup/index.html with relative paths');
    }
  },
});

export default defineConfig({
  base: './', // Use relative paths
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'content/index': resolve(__dirname, 'src/content/index.ts'),
        'content/injected': resolve(__dirname, 'src/content/injected.ts'),
        'background/index': resolve(__dirname, 'src/background/index.ts'),
        'popup/index': resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'shared/[name]-[hash].js',
      },
    },
  },
  plugins: [organizeBuild()],
});
