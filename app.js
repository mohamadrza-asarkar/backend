import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './src/routes/index.js';
import { requestLogger } from './src/middlewares/logger.middleware.js';
import { errorHandler, notFoundHandler } from './src/middlewares/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Basic Security & CORS configuration
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id']
  }));

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Traffic Logging
  app.use(requestLogger);

  // Serve static files from root 'public' folder
  app.use(express.static(path.join(__dirname, 'public')));

  // Mount API modular routes
  app.use('/api', apiRouter);

  // Fallback for API routes (404)
  app.use('/api/*', notFoundHandler);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp;
