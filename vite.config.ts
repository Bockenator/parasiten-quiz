import { mkdirSync, copyFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// base muss dem GitHub-Repo-Namen entsprechen, sonst laden Assets auf Pages nicht.
const base = '/parasiten-quiz/';

// content/*.json ist die kuratierte Quelle (siehe scripts/validate-questions.ts).
// Die App lädt die Fragen zur Laufzeit per fetch() statt sie ins JS-Bundle zu
// importieren, damit der große Datensatz separat cachebar bleibt und keine
// TS-rootDir-Konflikte mit Dateien außerhalb von src/ entstehen.
function syncContentData(): void {
  mkdirSync('public/data', { recursive: true });
  copyFileSync('content/questions.json', 'public/data/questions.json');
  copyFileSync('content/categories.json', 'public/data/categories.json');
}

function copyContentDataPlugin(): Plugin {
  return {
    name: 'copy-content-data',
    configureServer(server) {
      syncContentData();
      server.watcher.add(['content/questions.json', 'content/categories.json']);
      server.watcher.on('change', (file) => {
        const normalized = file.replace(/\\/g, '/');
        if (normalized.endsWith('content/questions.json') || normalized.endsWith('content/categories.json')) {
          syncContentData();
        }
      });
    },
  };
}

syncContentData();

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    copyContentDataPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        id: base,
        name: 'ParaQuiz — Parasiten-Trainer',
        short_name: 'ParaQuiz',
        description: 'Lerntrainer für Veterinär-Parasitologie mit Spaced Repetition.',
        lang: 'de',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
  },
});
