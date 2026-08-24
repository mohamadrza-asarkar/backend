import { CartModel } from '../../models/cart.model.js';
import { ProductModel } from '../../models/product.model.js';
import { successResponse, errorResponse } from '../../utils/response.js';

// Helper to recalculate cart totals
const recalculateCart = (cart) => {
  let totalPrice = 0;
  const items = cart.products || cart.items || [];

  for (const item of items) {
    totalPrice += Number(item.price || 0) * (Number(item.quantity) || 1);
  }

  cart.products = items;
  cart.items = items;
  cart.totalPrice = totalPrice;
  cart.updatedAt = new Date().toISOString();
  return cart;
};

/**
 * Get current cart
 * GET /api/cart
 */
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-guest-id'] || 'guest-session');
    let cart = await CartModel.findOne({ userId });

    if (!cart) {
      cart = await CartModel.create({
        userId,
        products: [],
        items: [],
        totalPrice: 0
      });
    }

    return successResponse(res, 200, 'اطلاعات سبد خرید دریافت شد', cart);
  } catch (error) {
    next(error);
  }
};

/**
 * Add or increase product in cart
 * POST /api/cart/items
 */
export const addItemToCart = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-guest-id'] || 'guest-session');
    const { productId, quantity = 1 } = req.body;

    const product = await ProductModel.findById(productId);
    if (!product) {
      return errorResponse(res, 404, 'محصول مورد نظر یافت نشد');
    }

    if (product.isAvailable === false || (product.countInStock !== undefined && product.countInStock <= 0)) {
      return errorResponse(res, 400, 'این محصول در حال حاضر موجود نمی‌باشد');
    }

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = await CartModel.create({
        userId,
        products: []
      });
    }

    const items = cart.products || cart.items || [];
    const existingIndex = items.findIndex(item => item.productId === productId);
    const addedQty = Number(quantity) || 1;

    if (existingIndex > -1) {
      items[existingIndex].quantity += addedQty;
      items[existingIndex].totalPrice = items[existingIndex].quantity * items[existingIndex].price;
    } else {
      items.push({
        product: {
          _id: product._id,
          name: product.name || product.title,
          price: product.price,
          isAvailable: product.isAvailable,
          image: product.image || (product.images && product.images[0]) || ''
        },
        productId: product._id,
        name: product.name || product.title,
        title: product.name || product.title,
        price: product.price,
        image: product.image || (product.images && product.images[0]) || '',
        quantity: addedQty,
        totalPrice: addedQty * product.price
      });
    }

    cart.products = items;
    cart.items = items;
    recalculateCart(cart);

    await CartModel.findOneAndUpdate({ userId }, cart);

    return successResponse(res, 200, 'کالا با موفقیت به سبد خرید اضافه گردید', cart);
  } catch (error) {
    next(error);
  }
};

/**
 * Update item quantity in cart
 * PUT /api/cart/items/:productId
 */
export const updateItemQuantity = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-guest-id'] || 'guest-session');
    const { productId } = req.params;
    const { quantity } = req.body;

    const newQty = Number(quantity);
    if (isNaN(newQty) || newQty < 0) {
      return errorResponse(res, 400, 'تعداد باید عدد مثبت یا صفر باشد');
    }

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      return errorResponse(res, 404, 'سبد خرید یافت نشد');
    }

    let items = cart.products || cart.items || [];
    const existingIndex = items.findIndex(item => item.productId === productId);

    if (existingIndex === -1) {
      return errorResponse(res, 404, 'این محصول در سبد خرید یافت نشد');
    }

    if (newQty === 0) {
      items.splice(existingIndex, 1);
    } else {
      items[existingIndex].quantity = newQty;
      items[existingIndex].totalPrice = newQty * items[existingIndex].price;
    }

    cart.products = items;
    cart.items = items;
    recalculateCart(cart);

    await CartModel.findOneAndUpdate({ userId }, cart);

    return successResponse(res, 200, 'تعداد محصول در سبد خرید به‌روزرسانی شد', cart);
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = updateItemQuantity;


/**
 * Remove item from cart
 * DELETE /api/cart/items/:productId
 */
export const removeItemFromCart = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-guest-id'] || 'guest-session');
    const { productId } = req.params;

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      return errorResponse(res, 404, 'سبد خرید یافت نشد');
    }

    let items = (cart.products || cart.items || []).filter(item => item.productId !== productId);
    cart.products = items;
    cart.items = items;
    recalculateCart(cart);

    await CartModel.findOneAndUpdate({ userId }, cart);

    return successResponse(res, 200, 'محصول از سبد خرید حذف شد', cart);
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 * DELETE /api/cart
 */
export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-guest-id'] || 'guest-session');
    let cart = await CartModel.findOne({ userId });

    if (cart) {
      cart.products = [];
      cart.items = [];
      cart.totalPrice = 0;
      cart.updatedAt = new Date().toISOString();
      await CartModel.findOneAndUpdate({ userId }, cart);
    }

    return successResponse(res, 200, 'سبد خرید به طور کامل تخلیه شد', { products: [], totalPrice: 0 });
  } catch (error) {
    next(error);
  }
};
