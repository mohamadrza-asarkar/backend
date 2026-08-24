import { db } from '../../models/db.js';
import { generateToken, verifyToken } from '../../utils/jwt.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { serverLogs } from '../../middlewares/logger.middleware.js';
import { successResponse } from '../../utils/response.js';

/**
 * OpenAPI 3.0 Specification in JSON format
 * GET /api/docs/openapi.json
 */
export const getOpenApiSpec = (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const serverUrl = `${protocol}://${host}/api`;

  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce Node.js Express REST API (Standard Schemas)',
      version: '1.0.0',
      description: 'Production-ready REST API built with Node.js, Express, ES Modules, and MongoDB/Mongoose architecture.\n\n' +
        '### اسکیماهای پیاده‌سازی شده:\n' +
        '- **اسلاید (Slide)**: فقط یک تصویر (image) که با مالتر (Multer) ذخیره می‌شود.\n' +
        '- **محصول (Product)**: شامل اسم (name)، توضیحات (description)، قیمت (price)، وضعیت موجودی (isAvailable) و نظرات (reviews).\n' +
        '- **کارت (Cart)**: شامل چند محصول (products).\n' +
        '- **سفارش (Order)**: شامل محصولات (products)، نام و نام خانوادگی خریدار (buyerName)، آدرس (address) و شماره تلفن (phone).\n' +
        '- **نظر (Review)**: شامل فرستنده (sender)، متن نظر (comment / text) و امتیاز (rating).',
      contact: {
        name: 'Backend Engineering Team',
        email: 'api-support@example.com'
      }
    },
    servers: [
      {
        url: serverUrl,
        description: 'Current Environment API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT Bearer token format: Bearer <token>'
        }
      },
      schemas: {
        Slide: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            image: { type: 'string', description: 'آدرس تصویر ذخیره شده توسط مالتر' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          required: ['name', 'price'],
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'گوشی موبایل آیفون 15 پرو مکس' },
            description: { type: 'string', example: 'توضیحات کامل محصول' },
            price: { type: 'number', example: 84500000 },
            isAvailable: { type: 'boolean', example: true },
            reviews: { type: 'array', items: { $ref: '#/components/schemas/Review' } }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  name: { type: 'string' },
                  price: { type: 'number' },
                  quantity: { type: 'number' },
                  totalPrice: { type: 'number' }
                }
              }
            },
            totalPrice: { type: 'number' }
          }
        },
        Order: {
          type: 'object',
          required: ['buyerName', 'address', 'phone'],
          properties: {
            _id: { type: 'string' },
            orderNumber: { type: 'string' },
            buyerName: { type: 'string', example: 'علیرضا رضایی' },
            address: { type: 'string', example: 'تهران، بلوار کشاورز، پلاک ۱۲' },
            phone: { type: 'string', example: '09351112233' },
            products: { type: 'array', items: { type: 'object' } },
            totalPrice: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] }
          }
        },
        Review: {
          type: 'object',
          required: ['productId', 'sender', 'comment', 'rating'],
          properties: {
            _id: { type: 'string' },
            productId: { type: 'string' },
            sender: { type: 'string', example: 'علیرضا رضایی' },
            comment: { type: 'string', example: 'کیفیت عالی و بدنه مقاوم' },
            rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    paths: {
      '/slides': {
        get: {
          tags: ['Slides'],
          summary: 'دریافت اسلایدرها (تصاویر)',
          responses: {
            200: { description: 'لیست اسلایدها' }
          }
        },
        post: {
          tags: ['Slides'],
          summary: 'افزودن اسلاید جدید با مالتر (Multer Upload) یا URL',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    image: { type: 'string', format: 'binary', description: 'فایل تصویر جهت آپلود با Multer' }
                  }
                }
              },
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    image: { type: 'string', example: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'اسلاید با موفقیت ایجاد شد' }
          }
        }
      },
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'لیست محصولات با نام، توضیحات، قیمت، موجودی (isAvailable) و نظرات',
          parameters: [
            { name: 'isAvailable', in: 'query', schema: { type: 'boolean' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: { 200: { description: 'لیست محصولات' } }
        },
        post: {
          tags: ['Products'],
          summary: 'ایجاد محصول جدید (Admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product'
                }
              }
            }
          },
          responses: { 201: { description: 'محصول ایجاد شد' } }
        }
      },
      '/cart': {
        get: {
          tags: ['Cart'],
          summary: 'مشاهده کارت / سبد خرید و لیست چند محصول',
          responses: { 200: { description: 'محتویات سبد خرید' } }
        }
      },
      '/cart/items': {
        post: {
          tags: ['Cart'],
          summary: 'افزودن محصول به کارت',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['productId'],
                  properties: {
                    productId: { type: 'string', example: 'prod-1' },
                    quantity: { type: 'number', default: 1 }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'محصول به سبد اضافه شد' } }
        }
      },
      '/orders': {
        get: {
          tags: ['Orders'],
          summary: 'مشاهده لیست سفارش‌ها',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'لیست سفارش‌ها' } }
        },
        post: {
          tags: ['Orders'],
          summary: 'ثبت سفارش شامل نام و نام خانوادگی خریدار، آدرس، شماره تلفن و محصولات',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['buyerName', 'address', 'phone'],
                  properties: {
                    buyerName: { type: 'string', example: 'علیرضا رضایی' },
                    address: { type: 'string', example: 'تهران، بلوار کشاورز، پلاک ۱۲' },
                    phone: { type: 'string', example: '09351112233' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'سفارش ثبت شد' } }
        }
      },
      '/reviews': {
        get: {
          tags: ['Reviews'],
          summary: 'مشاهده نظرات یک محصول',
          parameters: [{ name: 'productId', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'لیست نظرات' } }
        },
        post: {
          tags: ['Reviews'],
          summary: 'ثبت نظر شامل فرستنده (sender)، متن نظر (comment) و امتیاز (rating)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['productId', 'sender', 'comment', 'rating'],
                  properties: {
                    productId: { type: 'string', example: 'prod-1' },
                    sender: { type: 'string', example: 'علیرضا رضایی' },
                    comment: { type: 'string', example: 'کیفیت ساخت عالی و ارسال سریع' },
                    rating: { type: 'number', example: 5 }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'نظر ثبت شد' } }
        }
      }
    }
  };

  res.setHeader('Content-Type', 'application/json');
  return res.json(spec);
};

/**
 * Postman Collection v2.1 in JSON format
 * GET /api/docs/postman.json
 */
export const getPostmanCollection = (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const baseUrl = `${protocol}://${host}/api`;

  const collection = {
    info: {
      name: 'E-Commerce Backend REST API (Schemas Verified)',
      description: 'کالکشن کامل Postman با اسکیماهای اختصاصی اسلاید با مالتر، محصول با نظرات و موجودی، کارت با چند محصول، سفارش با اطلاعات خریدار و نظرات با فرستنده و امتیاز.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    variable: [
      { key: 'baseUrl', value: baseUrl, type: 'string' },
      { key: 'token', value: '', type: 'string' }
    ],
    item: [
      {
        name: 'Slides (Multer Image)',
        item: [
          {
            name: 'Get Slides',
            request: {
              method: 'GET',
              url: { raw: '{{baseUrl}}/slides', host: ['{{baseUrl}}'], path: ['slides'] }
            }
          },
          {
            name: 'Create Slide (Image URL or Multer)',
            request: {
              method: 'POST',
              header: [
                { key: 'Authorization', value: 'Bearer {{token}}' },
                { key: 'Content-Type', value: 'application/json' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80'
                }, null, 2)
              },
              url: { raw: '{{baseUrl}}/slides', host: ['{{baseUrl}}'], path: ['slides'] }
            }
          }
        ]
      },
      {
        name: 'Products (Name, Description, Price, isAvailable, Reviews)',
        item: [
          {
            name: 'List Products',
            request: {
              method: 'GET',
              url: { raw: '{{baseUrl}}/products?page=1&limit=10&isAvailable=true', host: ['{{baseUrl}}'], path: ['products'] }
            }
          },
          {
            name: 'Create Product',
            request: {
              method: 'POST',
              header: [
                { key: 'Authorization', value: 'Bearer {{token}}' },
                { key: 'Content-Type', value: 'application/json' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  name: 'گوشی موبایل گلکسی S24 اولترا',
                  description: 'گوشی پرچمدار با قابلیت‌های هوش مصنوعی Galaxy AI و قلم S-Pen',
                  price: 72000000,
                  isAvailable: true,
                  category: 'موبایل و تبلت',
                  image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80'
                }, null, 2)
              },
              url: { raw: '{{baseUrl}}/products', host: ['{{baseUrl}}'], path: ['products'] }
            }
          }
        ]
      },
      {
        name: 'Cart (Multiple Products)',
        item: [
          {
            name: 'Get Cart',
            request: {
              method: 'GET',
              url: { raw: '{{baseUrl}}/cart', host: ['{{baseUrl}}'], path: ['cart'] }
            }
          },
          {
            name: 'Add Product To Cart',
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ productId: 'prod-1', quantity: 1 }, null, 2)
              },
              url: { raw: '{{baseUrl}}/cart/items', host: ['{{baseUrl}}'], path: ['cart', 'items'] }
            }
          }
        ]
      },
      {
        name: 'Orders (Products, BuyerName, Address, Phone)',
        item: [
          {
            name: 'Create Order',
            request: {
              method: 'POST',
              header: [
                { key: 'Authorization', value: 'Bearer {{token}}' },
                { key: 'Content-Type', value: 'application/json' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  buyerName: 'علیرضا رضایی',
                  address: 'تهران، میدان ونک، خیابان ولیعصر، کوچه لاله، پلاک ۲۴',
                  phone: '09123456789'
                }, null, 2)
              },
              url: { raw: '{{baseUrl}}/orders', host: ['{{baseUrl}}'], path: ['orders'] }
            }
          },
          {
            name: 'Get My Orders',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
              url: { raw: '{{baseUrl}}/orders', host: ['{{baseUrl}}'], path: ['orders'] }
            }
          }
        ]
      },
      {
        name: 'Reviews (Sender, Comment, Rating)',
        item: [
          {
            name: 'Get Product Reviews',
            request: {
              method: 'GET',
              url: { raw: '{{baseUrl}}/reviews?productId=prod-1', host: ['{{baseUrl}}'], path: ['reviews'] }
            }
          },
          {
            name: 'Submit Review',
            request: {
              method: 'POST',
              header: [
                { key: 'Authorization', value: 'Bearer {{token}}' },
                { key: 'Content-Type', value: 'application/json' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  productId: 'prod-1',
                  sender: 'علیرضا رضایی',
                  comment: 'بسیار از کیفیت محصول و ارسال سریع راضی هستم.',
                  rating: 5
                }, null, 2)
              },
              url: { raw: '{{baseUrl}}/reviews', host: ['{{baseUrl}}'], path: ['reviews'] }
            }
          }
        ]
      }
    ]
  };

  res.setHeader('Content-Type', 'application/json');
  return res.json(collection);
};

/**
 * Health Check
 * GET /api/docs/health
 */
export const getHealthCheck = (req, res) => {
  return res.json({
    status: 'online',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'Node.js Express REST API (ESM)'
  });
};

/**
 * System Metrics & Database Counts
 * GET /api/docs/metrics
 */
export const getSystemMetrics = (req, res) => {
  const memoryUsage = process.memoryUsage();
  return res.json({
    uptimeSeconds: Math.round(process.uptime()),
    memoryUsageMB: {
      rss: (memoryUsage.rss / 1024 / 1024).toFixed(1),
      heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(1),
      heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(1)
    },
    counts: {
      users: db.users.length,
      products: db.products.length,
      categories: db.categories.length,
      orders: db.orders.length,
      carts: db.carts.length,
      reviews: db.reviews.length,
      slides: db.slides.length
    },
    schemas: {
      slide: 'فقط یک تصویر ذخیره شده با مالتر (image)',
      product: 'اسم (name), توضیحات (description), قیمت (price), موجودی (isAvailable), نظرات (reviews)',
      cart: 'چند محصول (products)',
      order: 'محصولات (products), نام و نام خانوادگی خریدار (buyerName), آدرس (address), تلفن (phone)',
      review: 'فرستنده (sender), متن نظر (comment), امتیاز (rating)'
    }
  });
};

/**
 * Get Collection Documents for DB Inspector
 * GET /api/docs/collections/:name
 */
export const getCollectionDocs = (req, res) => {
  const { name } = req.params;
  let docs = [];

  switch (name) {
    case 'products':
      docs = db.products;
      break;
    case 'users':
      docs = db.users.map(u => {
        const { password, ...rest } = u;
        return rest;
      });
      break;
    case 'categories':
      docs = db.categories;
      break;
    case 'orders':
      docs = db.orders;
      break;
    case 'carts':
      docs = db.carts;
      break;
    case 'reviews':
      docs = db.reviews;
      break;
    case 'slides':
      docs = db.slides;
      break;
    default:
      docs = [];
  }

  return res.json({
    success: true,
    collection: name,
    count: docs.length,
    documents: docs
  });
};

/**
 * Get Server Logs
 * GET /api/docs/logs
 */
export const getRequestLogs = (req, res) => {
  return res.json({
    success: true,
    count: serverLogs.length,
    logs: serverLogs.slice(0, 100)
  });
};

/**
 * Reset Database
 * POST /api/docs/reset-db
 */
export const resetDatabase = async (req, res) => {
  const result = await db.resetToSeed();
  return res.json(result);
};

/**
 * JWT Token Generator Lab
 * POST /api/docs/lab/token
 */
export const generateTestToken = (req, res) => {
  const { userId = 'user-test-1', role = 'admin', expiresIn = '7d' } = req.body;
  const token = generateToken({ id: userId, role, test: true }, expiresIn);
  return res.json({
    token,
    payload: { id: userId, role, expiresIn }
  });
};

/**
 * JWT Token Verification Lab
 * POST /api/docs/lab/verify-token
 */
export const verifyTestToken = (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ valid: false, error: 'Token is required' });
  }

  try {
    const decoded = verifyToken(token);
    return res.json({ valid: true, decoded });
  } catch (error) {
    return res.status(400).json({ valid: false, error: error.message });
  }
};

/**
 * Bcrypt Hashing Lab
 * POST /api/docs/lab/hash-password
 */
export const hashTestPassword = async (req, res) => {
  const { password, rounds = 10, compareWithHash } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (compareWithHash) {
    const isMatch = await comparePassword(password, compareWithHash);
    return res.json({
      password,
      hash: compareWithHash,
      isMatch,
      compareResult: isMatch ? 'Match ✅' : 'Mismatch ❌'
    });
  }

  const hash = await hashPassword(password, Number(rounds) || 10);
  return res.json({
    password,
    saltRounds: rounds,
    hash
  });
};

export const testBcryptLab = hashTestPassword;

