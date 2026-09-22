import { Cart } from '../../models/cart.js';
import { Product } from '../../models/product.js';

// دریافت سبد خرید
export const getCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || 'guest';
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, products: [], totalPrice: 0 });
    }
    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// افزودن محصول به سبد خرید
export const addItemToCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || 'guest';
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, products: [], totalPrice: 0 });

    const products = cart.products || [];
    const index = products.findIndex(item => String(item.productId || item._id) === String(productId));
    const qty = Number(quantity) || 1;

    if (index > -1) {
      products[index].quantity = (Number(products[index].quantity) || 0) + qty;
    } else {
      products.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty
      });
    }

    const totalPrice = products.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.quantity || 1)), 0);
    cart = await Cart.findOneAndUpdate({ userId }, { products, totalPrice }, { new: true });

    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ویرایش تعداد محصول در سبد خرید
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || 'guest';
    const { productId } = req.params;
    const qty = Number(req.body.quantity);

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'سبد خرید یافت نشد' });

    let products = cart.products || [];
    if (qty <= 0) {
      products = products.filter(item => String(item.productId || item._id) !== String(productId));
    } else {
      const item = products.find(item => String(item.productId || item._id) === String(productId));
      if (item) item.quantity = qty;
    }

    const totalPrice = products.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.quantity || 1)), 0);
    cart = await Cart.findOneAndUpdate({ userId }, { products, totalPrice }, { new: true });

    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateItemQuantity = updateCartItem;

// حذف یک محصول از سبد خرید
export const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || 'guest';
    const { productId } = req.params;

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'سبد خرید یافت نشد' });

    const products = (cart.products || []).filter(item => String(item.productId || item._id) !== String(productId));
    const totalPrice = products.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.quantity || 1)), 0);
    cart = await Cart.findOneAndUpdate({ userId }, { products, totalPrice }, { new: true });

    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// خالی کردن کامل سبد خرید
export const clearCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || 'guest';
    const cart = await Cart.findOneAndUpdate({ userId }, { products: [], totalPrice: 0 }, { new: true });
    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
