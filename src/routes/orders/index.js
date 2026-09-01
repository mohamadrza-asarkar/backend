import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderByTrackingCode,
  uploadPaymentReceipt,
  verifyPayment,
  updateOrderStatus
} from './controller.js';
import { isAuth } from '../../middlewares/isAuth.js';
import { isAdmin } from '../../middlewares/isAdmin.js';
import { uploadReceipt } from '../../middlewares/upload.js';

const router = Router();

// Public route: استعلام و پیگیری سفارش با کد رهگیری پستی
router.get('/track/:postTrackingCode', getOrderByTrackingCode);
router.get('/track/:code', getOrderByTrackingCode);

// احراز هویت برای بقیه عملیات‌های سفارش
router.use(isAuth);

// ثبت سفارش جدید (همراه با امکان آپلود مستقیم رسید)
router.post('/', uploadReceipt.single('receipt'), createOrder);

// دریافت سفارش‌های کاربر / لیست سفارش‌ها
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

// ارسال یا آپلود رسید پرداخت برای سفارش
router.post('/:id/receipt', uploadReceipt.single('receipt'), uploadPaymentReceipt);
router.put('/:id/receipt', uploadReceipt.single('receipt'), uploadPaymentReceipt);

// عملیات ادمین: تایید/رد رسید پرداخت و تغییر وضعیت
router.put('/:id/verify-payment', isAdmin, verifyPayment);
router.put('/:id/status', isAdmin, updateOrderStatus);

export default router;
