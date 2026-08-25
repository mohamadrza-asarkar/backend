export { db } from './db.js';
export { connectDB, isDBConnected } from '../config/database.js';

// Mongoose Models and Adapters
export { UserModel, User, userSchema } from './user.js';
export { ProductModel, Product, productSchema } from './product.js';
export { CartModel, Cart, cartSchema } from './cart.js';
export { OrderModel, Order, orderSchema } from './order.js';
export { ReviewModel, Review, reviewSchema } from './review.js';
export { SlideModel, Slide, slideSchema } from './slide.js';
