import { SlideModel } from '../../models/slide.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { formatImageUrl } from '../../utils/format.js';

const prepareSlideResponse = (slide, req) => {
  if (!slide) return slide;
  const image = formatImageUrl(slide.image, req);
  return {
    ...slide,
    image,
    imageUrl: image,
    fullImageUrl: image
  };
};

/**
 * Get all slides (Public)
 * GET /api/slides
 */
export const getSlides = async (req, res, next) => {
  try {
    const slides = await SlideModel.find();
    const formatted = slides.map(s => prepareSlideResponse(s, req));
    return successResponse(res, 200, 'اسلایدرها با موفقیت دریافت شدند', formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * Get slide by ID (Public)
 * GET /api/slides/:id
 */
export const getSlideById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slide = await SlideModel.findById(id);
    if (!slide) {
      return errorResponse(res, 404, 'اسلاید یافت نشد');
    }
    return successResponse(res, 200, 'اسلاید با موفقیت دریافت شد', prepareSlideResponse(slide, req));
  } catch (error) {
    next(error);
  }
};

/**
 * Create slide (با آپلود فایل مالتر، Base64 یا آدرس تصویر)
 * ذخیره فیزیکی روی دیسک به عنوان فایل تصویری (نه به صورت متن طولانی در دیتابیس)
 * POST /api/slides
 */
export const createSlide = async (req, res, next) => {
  try {
    let imageUrl = '';

    if (req.file) {
      imageUrl = `/uploads/slides/${req.file.filename}`;
    } else if (req.body) {
      imageUrl = req.body.image || req.body.imageBase64 || '';
    }

    if (!imageUrl) {
      return errorResponse(res, 400, 'تصویر اسلاید الزامی است (از طریق فیلد image در فرم، مالتر یا کد Base64)');
    }

    const newSlide = await SlideModel.create({ image: imageUrl });
    return successResponse(res, 201, 'اسلاید جدید با موفقیت ایجاد و تصویر روی دیسک ذخیره شد', prepareSlideResponse(newSlide, req));
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
    } else if (req.body) {
      const img = req.body.image || req.body.imageBase64;
      if (img !== undefined) {
        updateData.image = img;
      }
    }

    const updated = await SlideModel.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return errorResponse(res, 404, 'اسلاید یافت نشد');
    }

    return successResponse(res, 200, 'اسلاید با موفقیت به‌روزرسانی شد', prepareSlideResponse(updated, req));
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
