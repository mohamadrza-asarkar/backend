import fs from 'fs';
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
      isAmazing,
      minPrice,
      maxPrice,
      sortBy = 'newest'
    } = req.query;

    const filter = {};
    if (search || q) filter.search = search || q;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable;
    if (isAmazing !== undefined) filter.isAmazing = isAmazing;
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
 * دریافت لیست محصولات شگفت‌انگیز (پیشنهادهای ویژه برنج)
 * GET /api/products/amazing
 */
export const getAmazingProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sortBy = 'discount' } = req.query;

    const allAmazing = await ProductModel.find({
      isAmazing: true,
      sortBy: sortBy
    });

    const total = allAmazing.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedItems = allAmazing
      .slice(startIndex, startIndex + Number(limit))
      .map(p => prepareProductResponse(p, req));

    return successResponse(res, 200, 'لیست محصولات شگفت‌انگیز با موفقیت دریافت شد', {
      total,
      page: Number(page),
      limit: Number(limit),
      products: paginatedItems
    });
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
      isAmazing,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    const filter = { search: q };
    if (isAvailable !== undefined) filter.isAvailable = isAvailable;
    if (isAmazing !== undefined) filter.isAmazing = isAmazing;
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
 * ذخیره‌سازی عکس به صورت فایل در هاست و ثبت مسیر در دیتابیس
 * و نشان‌گذاری به عنوان محصول شگفت‌انگیز (isAmazing)
 * POST /api/products
 */
export const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    // If file uploaded via Multer, use its path.
    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }

    // Process amazing offer flags
    if (productData.isAmazing !== undefined) {
      productData.isAmazing = productData.isAmazing === 'true' || productData.isAmazing === true;
    }

    if (productData.originalPrice !== undefined) {
      productData.originalPrice = Number(productData.originalPrice);
    }
    if (productData.discountPercent !== undefined) {
      productData.discountPercent = Number(productData.discountPercent);
    }

    const createdProduct = await ProductModel.create(productData);

    const message = createdProduct.isAmazing 
      ? 'محصول شگفت‌انگیز با موفقیت ثبت و تصویر در هاست ذخیره شد'
      : 'محصول برنج جدید با موفقیت ایجاد و تصویر در هاست ذخیره شد';

    return successResponse(res, 201, message, prepareProductResponse(createdProduct, req));
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

    // If file uploaded via Multer, use its path
    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
    }

    if (updateData.isAmazing !== undefined) {
      updateData.isAmazing = updateData.isAmazing === 'true' || updateData.isAmazing === true;
    }
    if (updateData.originalPrice !== undefined) {
      updateData.originalPrice = Number(updateData.originalPrice);
    }
    if (updateData.discountPercent !== undefined) {
      updateData.discountPercent = Number(updateData.discountPercent);
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
