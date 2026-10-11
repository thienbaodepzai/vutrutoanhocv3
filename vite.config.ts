import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin ensuring GitHub Pages SPA compatibility (.nojekyll & 404.html fallback)
function githubPagesSpaPlugin(): Plugin {
  return {
    name: 'vite-plugin-github-pages-spa',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      try {
        if (fs.existsSync(distDir)) {
          // Bypass Jekyll on GitHub Pages
          fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
          // Duplicate index.html to 404.html so direct URL navigation/refresh never results in GitHub 404
          const indexPath = path.join(distDir, 'index.html');
          if (fs.existsSync(indexPath)) {
            fs.copyFileSync(indexPath, path.join(distDir, '404.html'));
          }
        }
      } catch (e) {
        console.warn('GitHub Pages SPA helper warning:', e);
      }
    },
  };
}

export default defineConfig(({ command }) => {
  // Current GitHub Pages repository: MathVerse-V-tr-To-n-h-c-Version-4
  const defaultRepoPath = '/MathVerse-V-tr-To-n-h-c-Version-4/';

  // Auto-detect repository name from GitHub Actions environment, or fallback to defaultRepoPath
  const repoName = process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
    : defaultRepoPath;

  // Use repoName for production build and '/' for local dev server
  const base = process.env.BASE_PATH || (command === 'build' ? repoName : '/');

  return {
    base,
    plugins: [react(), tailwindcss(), githubPagesSpaPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
