import { CategoryModel } from '../../models/category.model.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Get all categories
 * GET /api/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await CategoryModel.find();
    return successResponse(res, 200, 'لیست دسته‌بندی‌ها با موفقیت دریافت شد', categories);
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID or slug
 * GET /api/categories/:id
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let category = await CategoryModel.findById(id);
    if (!category) {
      category = await CategoryModel.findBySlug(id);
    }

    if (!category) {
      return errorResponse(res, 404, 'دسته‌بندی مورد نظر یافت نشد');
    }

    return successResponse(res, 200, 'اطلاعات دسته‌بندی دریافت شد', category);
  } catch (error) {
    next(error);
  }
};

/**
 * Create category (Admin Only)
 * POST /api/categories
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, icon, image, description } = req.body;
    const newCategory = await CategoryModel.create({
      name,
      slug,
      icon,
      image,
      description
    });

    return successResponse(res, 201, 'دسته‌بندی جدید با موفقیت ایجاد شد', newCategory);
  } catch (error) {
    next(error);
  }
};

/**
 * Update category (Admin Only)
 * PUT /api/categories/:id
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await CategoryModel.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return errorResponse(res, 404, 'دسته‌بندی جهت ویرایش یافت نشد');
    }

    return successResponse(res, 200, 'دسته‌بندی با موفقیت به‌روزرسانی شد', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category (Admin Only)
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await CategoryModel.findByIdAndDelete(id);

    if (!deleted) {
      return errorResponse(res, 404, 'دسته‌بندی جهت حذف یافت نشد');
    }

    return successResponse(res, 200, 'دسته‌بندی با موفقیت حذف گردید', { id });
  } catch (error) {
    next(error);
  }
};
