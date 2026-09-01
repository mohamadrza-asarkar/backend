import { Slide } from '../../models/slide.js';

// دریافت اسلایدها
export const getSlides = async (req, res) => {
  try {
    const slides = await Slide.find();
    return res.json({ success: true, data: slides });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// دریافت اسلاید با شناسه
export const getSlideById = async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'اسلاید یافت نشد' });
    }
    return res.json({ success: true, data: slide });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ایجاد اسلاید (ادمین)
export const createSlide = async (req, res) => {
  try {
    const image = req.file ? `/uploads/slides/${req.file.filename}` : req.body.image;
    if (!image) {
      return res.status(400).json({ success: false, message: 'تصویر اسلاید الزامی است' });
    }
    const slide = await Slide.create({ image });
    return res.status(201).json({ success: true, message: 'اسلاید با موفقیت ثبت شد', data: slide });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ویرایش اسلاید (ادمین)
export const updateSlide = async (req, res) => {
  try {
    const image = req.file ? `/uploads/slides/${req.file.filename}` : req.body.image;
    const slide = await Slide.findByIdAndUpdate(req.params.id, { image });
    if (!slide) {
      return res.status(404).json({ success: false, message: 'اسلاید یافت نشد' });
    }
    return res.json({ success: true, message: 'اسلاید ویرایش شد', data: slide });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// حذف اسلاید (ادمین)
export const deleteSlide = async (req, res) => {
  try {
    const deleted = await Slide.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'اسلاید یافت نشد' });
    }
    return res.json({ success: true, message: 'اسلاید حذف شد' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
