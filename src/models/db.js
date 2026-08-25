import { v4 as uuidv4 } from 'uuid';

/**
 * Clean memory-backed storage when running without external database
 * Starts completely clean and empty (no hardcoded data).
 */
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
    this.users = [];
    this.products = [];
    this.slides = [];
    this.reviews = [];
    this.orders = [];
    this.carts = [];
    this.isInitialized = true;
  }

  async clearAll() {
    this.users = [];
    this.products = [];
    this.slides = [];
    this.reviews = [];
    this.orders = [];
    this.carts = [];
    return { success: true, message: 'تمامی داده‌ها پاکسازی شدند' };
  }

  generateId() {
    return uuidv4().replace(/-/g, '').substring(0, 24);
  }
}

export const db = new DatabaseManager();
db.init();
