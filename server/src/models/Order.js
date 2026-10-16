import mongoose from 'mongoose';

const { Schema } = mongoose;

export const STATUS_FLOW = ['placed', 'preparing', 'out_for_delivery', 'delivered'];

// Atomic counter -> human-friendly order numbers (ORD-000001, ORD-000002, ...)
const counterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });
export const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

export async function nextOrderNumber() {
  const c = await Counter.findOneAndUpdate({ _id: 'order' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return `ORD-${String(c.seq).padStart(6, '0')}`;
}

// Items copy the name and price at purchase time (a snapshot), so later menu
// edits never change what a customer already ordered.
const orderItemSchema = new Schema(
  {
    menuItemId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1, max: 20 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    restaurantName: { type: String, required: true },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    specialInstructions: { type: String, default: '', maxlength: 300 },
    delivery: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['cod', 'gcash', 'card'], required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: STATUS_FLOW, default: 'preparing', index: true },
    statusHistory: [{ _id: false, status: { type: String, enum: STATUS_FLOW }, at: { type: Date, default: Date.now } }],
    estimatedDelivery: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
