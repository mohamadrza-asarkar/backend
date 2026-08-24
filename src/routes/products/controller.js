import { ProductModel } from '../../models/product.model.js';
import { successResponse, errorResponse, paginateResponse } from '../../utils/response.js';

/**
 * Get list of products with filtering, search, sorting and pagination
 * GET /api/products
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      isFeatured,
      minPrice,
      maxPrice,
      sortBy = 'newest'
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (search) filter.search = search;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (minPrice !== undefined) filter.minPrice = Number(minPrice);
    if (maxPrice !== undefined) filter.maxPrice = Number(maxPrice);
    if (sortBy) filter.sortBy = sortBy;

    const allProducts = await ProductModel.find(filter);
    const total = allProducts.length;

    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedItems = allProducts.slice(startIndex, startIndex + Number(limit));

    return paginateResponse(res, paginatedItems, page, limit, total, 'لیست محصولات با موفقیت دریافت شد');
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products
 * GET /api/products/featured
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await ProductModel.find({ isFeatured: true });
    return successResponse(res, 200, 'محصولات ویژه با موفقیت دریافت شد', products.slice(0, 8));
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by ID
 * GET /api/products/:id
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = await ProductModel.findById(id);
    if (!product) {
      product = await ProductModel.findBySlug(id);
    }

    if (!product) {
      return errorResponse(res, 404, 'محصول مورد نظر یافت نشد');
    }

    return successResponse(res, 200, 'اطلاعات محصول با موفقیت دریافت شد', product);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product (Admin Only)
 * POST /api/products
 */
export const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    const createdProduct = await ProductModel.create(productData);

    return successResponse(res, 201, 'محصول جدید با موفقیت ایجاد گردید', createdProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing product (Admin Only)
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await ProductModel.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return errorResponse(res, 404, 'محصول مورد نظر جهت ویرایش یافت نشد');
    }

    return successResponse(res, 200, 'محصول با موفقیت به‌روزرسانی شد', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (Admin Only)
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await ProductModel.findByIdAndDelete(id);

    if (!deleted) {
      return errorResponse(res, 404, 'محصول جهت حذف یافت نشد');
    }

    return successResponse(res, 200, 'محصول با موفقیت حذف گردید', { id });
  } catch (error) {
    next(error);
  }
};
