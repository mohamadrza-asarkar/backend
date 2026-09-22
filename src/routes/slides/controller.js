import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Slide } from '../../models/slide.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تابع کمکی برای حذف فیزیکی فایل تصویر از هاست
const deleteImageFile = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return;
  // اگر فایل در پوشه uploads قرار دارد
  if (imagePath.startsWith('/uploads/') || imagePath.startsWith('uploads/')) {
    const cleanPath = imagePath.replace(/^\//, '');
    const absolutePath = path.join(__dirname, '../../../public', cleanPath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
        console.log(`🗑️ Image file deleted: ${absolutePath}`);
      } catch (err) {
        console.error(`❌ Failed to delete image file: ${absolutePath}`, err.message);
      }
    }
  }
};

// دریافت اسلایدها
export const getSlides = async (req, res) => {
  try {
    const slides = await Slide.find();
    return res.json(slides);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// دریافت اسلاید با شناسه
export const getSlideById = async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'اسلاید یافت نشد' });
    }
    return res.json(slide);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ایجاد اسلاید (ادمین)
export const createSlide = async (req, res) => {
  try {
    const image = req.file ? `/uploads/slides/${req.file.filename}` : req.body.image;
    if (!image) {
      return res.status(400).json({ message: 'تصویر اسلاید الزامی است' });
    }
    const slide = await Slide.create({ image });
    return res.status(201).json(slide);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ویرایش اسلاید (ادمین)
export const updateSlide = async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'اسلاید یافت نشد' });
    }

    const newImage = req.file ? `/uploads/slides/${req.file.filename}` : req.body.image;
    
    // اگر تصویر جدید آپلود شده بود، تصویر قبلی حذف شود
    if (newImage && newImage !== slide.image) {
      deleteImageFile(slide.image);
      slide.image = newImage;
    }

    await slide.save();
    return res.json(slide);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// حذف اسلاید (ادمین)
export const deleteSlide = async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'اسلاید یافت نشد' });
    }

    // حذف فیزیکی فایل تصویر اسلاید از دیسک/سرور
    deleteImageFile(slide.image);

    // حذف رکورد از دیتابیس
    await Slide.findByIdAndDelete(req.params.id);

    return res.json({ success: true, message: 'اسلاید و تصویر مربوطه با موفقیت حذف شدند' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
