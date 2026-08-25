import { OrderModel } from '../../models/order.js';
import { CartModel } from '../../models/cart.js';
import { ProductModel } from '../../models/product.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Create a new order
 * POST /api/orders
 * بدنه درخواست: buyerName (نام و نام‌خانوادگی خریدار), address (آدرس), phone (شماره تلفن), products (محصولات اختیاری در صورت خالی نبودن سبد)
 */
export const createOrder = async (req, res, next) => {
  try {
    const user = req.user;
    const { 
      buyerName, 
      address, 
      phone, 
      products: directProducts, 
      items: directItems,
      shippingAddress, 
      paymentMethod = 'online', 
      notes 
    } = req.body;

    const finalBuyerName = buyerName || (shippingAddress && shippingAddress.fullName) || user?.name || 'خریدار';
    const finalPhone = phone || (shippingAddress && shippingAddress.phone) || user?.phone || '';
    const finalAddress = address || (shippingAddress ? (typeof shippingAddress === 'string' ? shippingAddress : (shippingAddress.addressLine || `${shippingAddress.province || ''} ${shippingAddress.city || ''} ${shippingAddress.addressLine || ''}`)) : '');

    let orderProducts = directProducts || directItems;

    // If no direct products passed, pull from user's active cart
    if (!orderProducts || orderProducts.length === 0) {
      const cart = await CartModel.findOne({ userId: user ? user._id : 'guest-session' });
      if (!cart || (cart.products && cart.products.length === 0 && (!cart.items || cart.items.length === 0))) {
        return errorResponse(res, 400, 'سبد خرید شما خالی است و محصولی جهت ثبت سفارش وجود ندارد');
      }
      orderProducts = cart.products || cart.items;
    }

    // Verify inventory and calculate sums
    let totalPrice = 0;
    const processedProducts = [];

    for (const item of orderProducts) {
      const prodId = item.productId || (item.product && item.product._id);
      const product = await ProductModel.findById(prodId);
      if (!product) {
        return errorResponse(res, 400, `محصول با شناسه ${prodId} یافت نشد`);
      }

      if (product.isAvailable === false || (product.countInStock !== undefined && product.countInStock < (item.quantity || 1))) {
        return errorResponse(res, 400, `موجودی کالای "${product.name || product.title}" کافی نیست`);
      }

      const unitPrice = Number(product.price);
      const qty = Number(item.quantity) || 1;
      totalPrice += unitPrice * qty;

      processedProducts.push({
        product: {
          _id: product._id,
          name: product.name || product.title,
          price: product.price,
          image: product.image || (product.images && product.images[0]) || ''
        },
        productId: product._id,
        name: product.name || product.title,
        price: unitPrice,
        image: product.image || (product.images && product.images[0]) || '',
        quantity: qty
      });

      // Deduct inventory
      if (product.countInStock !== undefined) {
        await ProductModel.findByIdAndUpdate(product._id, {
          countInStock: Math.max(0, product.countInStock - qty),
          isAvailable: (product.countInStock - qty) > 0
        });
      }
    }

    const newOrder = await OrderModel.create({
      userId: user ? user._id : 'guest-user',
      buyerName: finalBuyerName,
      address: finalAddress,
      phone: finalPhone,
      products: processedProducts,
      items: processedProducts,
      totalPrice,
      paymentMethod,
      status: 'processing',
      notes
    });

    // Clear cart if user logged in
    if (user) {
      await CartModel.findOneAndUpdate({ userId: user._id }, { products: [], items: [], totalPrice: 0 });
    }

    return successResponse(res, 201, 'سفارش شما با موفقیت ثبت گردید', newOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * Get logged-in user orders
 * GET /api/orders
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find({ userId: req.user._id });
    return successResponse(res, 200, 'لیست سفارش‌های شما با موفقیت دریافت شد', orders);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);

    if (!order) {
      return errorResponse(res, 404, 'سفارش با این شناسه یافت نشد');
    }

    // Access check: Only owner or admin
    if (req.user.role !== 'admin' && order.userId !== req.user._id) {
      return errorResponse(res, 403, 'دسترسی غیرمجاز به فاکتور و اطلاعات این سفارش');
    }

    return successResponse(res, 200, 'جزئیات سفارش دریافت شد', order);
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (Admin only)
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, orderStatus } = req.body;
    const finalStatus = status || orderStatus;

    const updated = await OrderModel.findByIdAndUpdate(id, {
      status: finalStatus,
      orderStatus: finalStatus
    });

    if (!updated) {
      return errorResponse(res, 404, 'سفارش یافت نشد');
    }

    return successResponse(res, 200, 'وضعیت سفارش با موفقیت به‌روزرسانی شد', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Pay order
 * POST /api/orders/:id/pay
 */
export const payOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);

    if (!order) {
      return errorResponse(res, 404, 'سفارش یافت نشد');
    }

    const updated = await OrderModel.findByIdAndUpdate(id, {
      paymentStatus: 'paid',
      paidAt: new Date().toISOString(),
      status: 'processing'
    });

    return successResponse(res, 200, 'پرداخت سفارش با موفقیت ثبت شد', updated);
  } catch (error) {
    next(error);
  }
};

