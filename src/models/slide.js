import mongoose from 'mongoose';

export const slideSchema = new mongoose.Schema({
  image: { type: String, required: true }
}, {
  timestamps: true
});

export const Slide = mongoose.models.Slide || mongoose.model('Slide', slideSchema);
export const SlideModel = Slide;
export default Slide;


