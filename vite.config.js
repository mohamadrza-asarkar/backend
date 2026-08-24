import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { createApp } from './app.js';
import { db } from './src/models/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize in-memory seed database
db.init().catch(console.error);

// Vite plugin to attach Express app middleware in development
function expressApiPlugin() {
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      const expressApp = createApp();
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          expressApp(req, res, next);
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), expressApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
