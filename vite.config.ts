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

    // Move CSS to popup directory
    if (existsSync('dist/assets/index-D11-pg6E.css')) {
      renameSync('dist/assets/index-D11-pg6E.css', 'dist/popup/styles.css');
    }

    // Update HTML to reference correct paths
    if (existsSync('dist/popup/index.html')) {
      let html = readFileSync('dist/popup/index.html', 'utf-8');
      html = html.replace(/\.\.\/..\/assets\/[^"]+/g, './styles.css');
      html = html.replace(/\.\.\/..\/popup\/[^"]+/g, './index.js');
      writeFileSync('dist/popup/index.html', html);
    }
  },
});

export default defineConfig({
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
