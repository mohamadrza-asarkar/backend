import { db } from '../../models/db.js';

export const getHealthCheck = (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date()
  });
};

export const getOpenApiSpec = (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'Rice Store E-Commerce API', version: '1.0.0' },
    paths: {
      '/api/products': { get: { summary: 'Get all products' }, post: { summary: 'Create product' } },
      '/api/auth/login': { post: { summary: 'User login' } },
      '/api/auth/register': { post: { summary: 'User register' } },
      '/api/orders': { get: { summary: 'Get orders' }, post: { summary: 'Create order' } },
      '/api/cart': { get: { summary: 'Get cart' } }
    }
  });
};

export const getPostmanCollection = (req, res) => {
  res.json({
    info: { name: 'Rice Store API', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
    item: []
  });
};

export const getSystemMetrics = (req, res) => {
  res.json({
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform
  });
};

export const getCollectionDocs = (req, res) => {
  const { name } = req.params;
  const items = db[name] || [];
  res.json({ collection: name, count: items.length, sample: items.slice(0, 3) });
};

export const resetDatabase = (req, res) => {
  res.json({ success: true, message: 'Database reset' });
};

export const generateTestToken = (req, res) => {
  res.json({ token: 'test-token' });
};

export const verifyTestToken = (req, res) => {
  res.json({ valid: true });
};

export const testBcryptLab = (req, res) => {
  res.json({ hashed: 'test-hash' });
};

export const getRequestLogs = (req, res) => {
  res.json({ logs: [] });
};
