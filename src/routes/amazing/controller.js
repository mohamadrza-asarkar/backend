import fs from 'fs';
import { ProductModel } from '../../models/product.js';
import { successResponse, errorResponse, paginateResponse } from '../../utils/response.js';
import { formatImageUrl } from '../../utils/format.js';

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
 * Get all amazing products (محصولات شگفت‌انگیز)
 * GET /api/amazing-products
 */
export const getAmazingProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'discount'
    } = req.query;

    const allAmazing = await ProductModel.find({
      isAmazing: true,
      sortBy: sortBy
    });

    const total = allAmazing.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = allAmazing
      .slice(startIndex, startIndex + Number(limit))
      .map(p => prepareProductResponse(p, req));

    return paginateResponse(res, paginated, page, limit, total, 'لیست محصولات شگفت‌انگیز با موفقیت دریافت شد');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single amazing product
 * GET /api/amazing-products/:id
 */
export const getAmazingProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product || !product.isAmazing) {
      return errorResponse(res, 404, 'محصول شگفت‌انگیز مورد نظر یافت نشد');
    }

    return successResponse(res, 200, 'اطلاعات محصول شگفت‌انگیز با موفقیت دریافت شد', prepareProductResponse(product, req));
  } catch (error) {
    next(error);
  }
};

/**
 * Create amazing product (Admin Only)
 * POST /api/amazing-products
 */
export const createAmazingProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body, isAmazing: true };

    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }

    if (productData.originalPrice !== undefined) {
      productData.originalPrice = Number(productData.originalPrice);
    }
    if (productData.discountPercent !== undefined) {
      productData.discountPercent = Number(productData.discountPercent);
    }

    // Note: Any base64 string passed in productData.image or productData.imageBase64
    // will be automatically saved to disk as a file by ProductModel's internal normalize helper,
    // keeping the database completely clean from raw image binaries!
    const created = await ProductModel.create(productData);

    return successResponse(res, 201, 'محصول شگفت‌انگیز جدید با تصویر در سرور ثبت گردید', prepareProductResponse(created, req));
  } catch (error) {
    next(error);
  }
};

/**
 * Update amazing product (Admin Only)
 * PUT /api/amazing-products/:id
 */
export const updateAmazingProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
    }

    if (updateData.originalPrice !== undefined) {
      updateData.originalPrice = Number(updateData.originalPrice);
    }
    if (updateData.discountPercent !== undefined) {
      updateData.discountPercent = Number(updateData.discountPercent);
    }

    const updated = await ProductModel.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return errorResponse(res, 404, 'محصول شگفت‌انگیز یافت نشد');
    }

    return successResponse(res, 200, 'محصول شگفت‌انگیز به‌روزرسانی شد', prepareProductResponse(updated, req));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete amazing product (Admin Only)
 * DELETE /api/amazing-products/:id
 */
export const deleteAmazingProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await ProductModel.findByIdAndDelete(id);

    if (!deleted) {
      return errorResponse(res, 404, 'محصول شگفت‌انگیز جهت حذف یافت نشد');
    }

    return successResponse(res, 200, 'محصول با موفقیت حذف گردید', { id });
  } catch (error) {
    next(error);
  }
};
