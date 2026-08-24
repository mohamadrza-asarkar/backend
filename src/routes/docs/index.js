import { Router } from 'express';
import {
  getOpenApiSpec,
  getPostmanCollection,
  getHealthCheck,
  getSystemMetrics,
  getCollectionDocs,
  resetDatabase,
  generateTestToken,
  verifyTestToken,
  testBcryptLab,
  getRequestLogs
} from './controller.js';

const router = Router();

// OpenAPI & Postman
router.get('/openapi.json', getOpenApiSpec);
router.get('/postman.json', getPostmanCollection);

// Health & Metrics
router.get('/health', getHealthCheck);
router.get('/metrics', getSystemMetrics);
router.get('/collections/:name', getCollectionDocs);
router.get('/logs', getRequestLogs);
router.post('/reset-db', resetDatabase);

// Security Labs
router.post('/lab/token', generateTestToken);
router.post('/lab/verify-token', verifyTestToken);
router.post('/lab/hash-password', testBcryptLab);

export default router;
