import mongoose from 'mongoose';

const { Schema } = mongoose;

export const MENU_CATEGORIES = ['Appetizers', 'Main dishes', 'Rice meals', 'Drinks', 'Desserts'];
export const CUISINES = ['Filipino', 'Japanese', 'Korean', 'Italian', 'Fast Food', 'Chinese', 'Mexican', 'Irish'];

// Embedded sub-documents: a menu only makes sense inside its restaurant,
// so it is stored with it and fetched in a single read.
const menuItemSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, enum: MENU_CATEGORIES, required: true },
  popular: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
});

const reviewSchema = new Schema({
  name: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const restaurantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    cuisine: { type: String, enum: CUISINES, required: true, index: true }, // used for filtering
    type: { type: String, required: true }, // display label, e.g. "Bakery", "Hamburgers"
    description: { type: String, default: '' }, // one-liner for lists
    about: { type: String, default: '' }, // longer text for the About tab
    address: { type: String, default: 'Angeles City, Pampanga' },
    rating: { type: Number, min: 0, max: 5, default: 0, index: true },
    reviewCount: { type: Number, default: 0 },
    priceLevel: { type: Number, min: 1, max: 3, required: true }, // 1 = ₱, 2 = ₱₱, 3 = ₱₱₱
    deliveryMin: { type: Number, required: true },
    deliveryMax: { type: Number, required: true },
    deliveryAvailable: { type: Boolean, default: true },
    pickupAvailable: { type: Boolean, default: true },
    imageColor: { type: String, default: '#C4883C' }, // placeholder image colour (no photos in the design)
    featured: { type: Boolean, default: false },
    menu: [menuItemSchema],
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Restaurant', restaurantSchema);
