import { v4 as uuidv4 } from 'uuid';
import {
  createInitialUsers,
  initialProducts,
  initialSlides,
  initialReviews,
  initialOrders
} from './seed.data.js';

class DatabaseManager {
  constructor() {
    this.users = [];
    this.products = [];
    this.carts = [];
    this.orders = [];
    this.reviews = [];
    this.slides = [];
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    this.users = await createInitialUsers();
    this.products = JSON.parse(JSON.stringify(initialProducts));
    this.slides = JSON.parse(JSON.stringify(initialSlides));
    this.reviews = JSON.parse(JSON.stringify(initialReviews));
    this.orders = JSON.parse(JSON.stringify(initialOrders));
    this.carts = [
      {
        _id: 'cart-1',
        userId: 'user-customer-1',
        products: [
          {
            product: {
              _id: 'prod-1',
              name: 'برنج طارم هاشمی درجه یک گیلان (کیسه ۱۰ کیلوگرمی)',
              price: 1350000,
              image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80'
            },
            productId: 'prod-1',
            name: 'برنج طارم هاشمی درجه یک گیلان (کیسه ۱۰ کیلوگرمی)',
            price: 1350000,
            quantity: 1,
            totalPrice: 1350000
          }
        ],
        totalPrice: 1350000,
        updatedAt: new Date().toISOString()
      }
    ];

    this.isInitialized = true;
    console.log('✅ Rice E-Commerce Database Storage Initialized');
  }

  async resetToSeed() {
    this.isInitialized = false;
    await this.init();
    return { success: true, message: 'دیتابیس با موفقیت به مقادیر اولیه محصولات برنج بازنشانی شد' };
  }

  generateId() {
    return uuidv4().replace(/-/g, '').substring(0, 24);
  }
}

export const db = new DatabaseManager();
// Automatically initialize
db.init();
