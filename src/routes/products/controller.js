import { ProductModel } from '../../models/product.js';
import { successResponse, errorResponse, paginateResponse } from '../../utils/response.js';
import { formatImageUrl } from '../../utils/format.js';

/**
 * Format product object to include full server image URL
 */
const prepareProductResponse = (product, req) => {
  if (!product) return product;
  const image = formatImageUrl(product.image, req);
  return {
    ...product,
    image,
    imageUrl: image,
    fullImageUrl: image
  };
};

/**
 * دریافت لیست محصولات با قابلیت فیلتر، جستجو با کوئری، مرتب‌سازی و صفحه‌بندی
 * GET /api/products
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      q,
      isAvailable,
      minPrice,
      maxPrice,
      sortBy = 'newest'
    } = req.query;

    const filter = {};
    if (search || q) filter.search = search || q;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable;
    if (minPrice !== undefined) filter.minPrice = Number(minPrice);
    if (maxPrice !== undefined) filter.maxPrice = Number(maxPrice);
    if (sortBy) filter.sortBy = sortBy;

    const allProducts = await ProductModel.find(filter);
    const total = allProducts.length;

    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedItems = allProducts
      .slice(startIndex, startIndex + Number(limit))
      .map(p => prepareProductResponse(p, req));

    return paginateResponse(res, paginatedItems, page, limit, total, 'لیست محصولات برنج با موفقیت دریافت شد');
  } catch (error) {
    next(error);
  }
};

/**
 * جستجوی پیشرفته محصولات با کوئری
 * GET /api/products/search?q=...&minPrice=...&maxPrice=...&isAvailable=...
 */
export const searchProducts = async (req, res, next) => {
  try {
    const {
      q = '',
      isAvailable,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    const filter = { search: q };
    if (isAvailable !== undefined) filter.isAvailable = isAvailable;
    if (minPrice !== undefined) filter.minPrice = Number(minPrice);
    if (maxPrice !== undefined) filter.maxPrice = Number(maxPrice);
    if (sortBy) filter.sortBy = sortBy;

    const matchingProducts = await ProductModel.find(filter);
    const total = matchingProducts.length;

    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedItems = matchingProducts
      .slice(startIndex, startIndex + Number(limit))
      .map(p => prepareProductResponse(p, req));

    return successResponse(res, 200, `نتایج جستجو برای عبارت "${q}" با موفقیت دریافت شد`, {
      query: q,
      totalResults: total,
      page: Number(page),
      limit: Number(limit),
      products: paginatedItems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * دریافت اطلاعات یک محصول بر اساس شناسه
 * GET /api/products/:id
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product) {
      return errorResponse(res, 404, 'محصول مورد نظر یافت نشد');
    }

    return successResponse(res, 200, 'اطلاعات محصول با موفقیت دریافت شد', prepareProductResponse(product, req));
  } catch (error) {
    next(error);
  }
};

/**
 * ایجاد محصول جدید (مخصوص مدیر / Admin)
 * POST /api/products
 */
export const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }

    const createdProduct = await ProductModel.create(productData);

    return successResponse(res, 201, 'محصول برنج جدید با موفقیت ایجاد گردید', prepareProductResponse(createdProduct, req));
  } catch (error) {
    next(error);
  }
};

/**
 * ویرایش محصول موجود (مخصوص مدیر / Admin)
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
    }

    const updated = await ProductModel.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return errorResponse(res, 404, 'محصول مورد نظر جهت ویرایش یافت نشد');
    }

    return successResponse(res, 200, 'محصول با موفقیت به‌روزرسانی شد', prepareProductResponse(updated, req));
  } catch (error) {
    next(error);
  }
};

/**
 * حذف محصول (مخصوص مدیر / Admin)
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
