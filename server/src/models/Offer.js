import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    badge: { type: String, required: true }, // text shown in the circle: "20%", "₱", "★"
    tone: { type: String, enum: ['red', 'gold', 'rust'], default: 'gold' },
    layout: { type: String, enum: ['featured', 'card'], default: 'card' },
    cta: { type: String, required: true },
    link: { type: String, default: '/restaurants' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Offer', offerSchema);
