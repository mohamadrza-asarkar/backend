import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { app } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite plugin to attach Express app middleware in development
function expressApiPlugin() {
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        app(req, res, next);
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [expressApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'index.js'),
        name: 'App',
        fileName: 'index',
        formats: ['es']
      },
      rollupOptions: {
        external: ['express', 'cors', 'multer', 'bcryptjs', 'jsonwebtoken', 'dotenv', 'fs', 'path', 'url', 'mongoose', 'express-rate-limit']
      }
    },
    server: {
      port: 3000,
      host: '0.0.0.0'
    },
  };
});
