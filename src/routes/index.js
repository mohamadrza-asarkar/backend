import { Router } from 'express';
import authRoutes from './auth/index.js';
import productRoutes from './products/index.js';
import amazingRoutes from './amazing/index.js';
import cartRoutes from './cart/index.js';
import orderRoutes from './orders/index.js';
import reviewRoutes from './reviews/index.js';
import slideRoutes from './slides/index.js';
import adminRoutes from './admin/index.js';

const apiRouter = Router();

// Mount modular sub-routers
apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/amazing-products', amazingRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/slides', slideRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
