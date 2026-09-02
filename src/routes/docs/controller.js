import mongoose from 'mongoose';

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

export const getCollectionDocs = async (req, res) => {
  try {
    const { name } = req.params;
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database disconnected' });
    }
    const collection = mongoose.connection.db.collection(name);
    const count = await collection.countDocuments();
    const sample = await collection.find({}).limit(3).toArray();
    res.json({ collection: name, count, sample });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetDatabase = (req, res) => {
  res.json({ success: true, message: 'Database reset disabled in real DB mode' });
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
