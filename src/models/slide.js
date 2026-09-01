import mongoose from 'mongoose';
import './db.js';

export const slideSchema = new mongoose.Schema({
  image: { type: String, required: true }
}, {
  timestamps: true
});

export const Slide = mongoose.models.Slide || mongoose.model('Slide', slideSchema);
export const SlideModel = Slide;
export default Slide;


