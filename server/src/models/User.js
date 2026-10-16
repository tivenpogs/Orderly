import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }, // never returned by default
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
