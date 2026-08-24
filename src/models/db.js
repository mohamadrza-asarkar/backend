import { v4 as uuidv4 } from 'uuid';
import {
  createInitialUsers,
  initialCategories,
  initialProducts,
  initialSlides,
  initialReviews,
  initialOrders
} from './seed.data.js';

class DatabaseManager {
  constructor() {
    this.users = [];
    this.categories = [];
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
    this.categories = JSON.parse(JSON.stringify(initialCategories));
    this.products = JSON.parse(JSON.stringify(initialProducts));
    this.slides = JSON.parse(JSON.stringify(initialSlides));
    this.reviews = JSON.parse(JSON.stringify(initialReviews));
    this.orders = JSON.parse(JSON.stringify(initialOrders));
    this.carts = [
      {
        _id: 'cart-1',
        userId: 'user-customer-1',
        items: [
          {
            productId: 'prod-4',
            title: 'ساعت هوشمند سامسونگ گلکسی واچ 6 کلاسیک 47mm',
            price: 16500000,
            discountPrice: 15300000,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
            quantity: 1,
            countInStock: 18
          }
        ],
        totalPrice: 16500000,
        totalDiscount: 1200000,
        finalPrice: 15300000,
        updatedAt: new Date().toISOString()
      }
    ];

    this.isInitialized = true;
    console.log('✅ In-Memory / MongoDB Database Storage Initialized with Seed Records');
  }

  async resetToSeed() {
    this.isInitialized = false;
    await this.init();
    return { success: true, message: 'دیتابیس با موفقیت به مقادیر اولیه بازنشانی شد' };
  }

  generateId() {
    return uuidv4().replace(/-/g, '').substring(0, 24);
  }
}

export const db = new DatabaseManager();
// Automatically initialize
db.init();
