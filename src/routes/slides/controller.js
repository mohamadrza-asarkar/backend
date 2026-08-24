import { SlideModel } from '../../models/slide.model.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Get all slides
 * GET /api/slides
 */
export const getSlides = async (req, res, next) => {
  try {
    const slides = await SlideModel.find();
    return successResponse(res, 200, 'اسلایدرها با موفقیت دریافت شدند', slides);
  } catch (error) {
    next(error);
  }
};

/**
 * Get slide by ID
 * GET /api/slides/:id
 */
export const getSlideById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slide = await SlideModel.findById(id);
    if (!slide) {
      return errorResponse(res, 404, 'اسلاید یافت نشد');
    }
    return successResponse(res, 200, 'اسلاید با موفقیت دریافت شد', slide);
  } catch (error) {
    next(error);
  }
};

/**
 * Create slide (با آپلود فایل مالتر یا آدرس تصویر)
 * POST /api/slides
 */
export const createSlide = async (req, res, next) => {
  try {
    let imageUrl = '';

    // If uploaded via Multer
    if (req.file) {
      imageUrl = `/uploads/slides/${req.file.filename}`;
    } else if (req.body && req.body.image) {
      imageUrl = req.body.image;
    }

    if (!imageUrl) {
      return errorResponse(res, 400, 'تصویر اسلاید الزامی است (از طریق فیلد image در فرم یا مالتر)');
    }

    const newSlide = await SlideModel.create({ image: imageUrl });
    return successResponse(res, 201, 'اسلاید جدید با موفقیت ایجاد و تصویر ذخیره شد', newSlide);
  } catch (error) {
    next(error);
  }
};

/**
 * Update slide image
 * PUT /api/slides/:id
 */
export const updateSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updateData = {};

    if (req.file) {
      updateData.image = `/uploads/slides/${req.file.filename}`;
    } else if (req.body && req.body.image) {
      updateData.image = req.body.image;
    }

    const updated = await SlideModel.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return errorResponse(res, 404, 'اسلاید یافت نشد');
    }

    return successResponse(res, 200, 'اسلاید با موفقیت به‌روزرسانی شد', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete slide
 * DELETE /api/slides/:id
 */
export const deleteSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await SlideModel.findByIdAndDelete(id);

    if (!deleted) {
      return errorResponse(res, 404, 'اسلاید یافت نشد');
    }

    return successResponse(res, 200, 'اسلاید حذف گردید', { id });
  } catch (error) {
    next(error);
  }
};
