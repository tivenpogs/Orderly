import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import wrap from '../utils/wrap.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sign = (id) => jwt.sign({ sub: String(id) }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  phone: u.phone,
  address: u.address,
  role: u.role || 'customer',
  favorites: (u.favorites || []).map(String),
});

router.post('/register', wrap(async (req, res) => {
  const { name = '', email = '', password = '', phone = '', address = '' } = req.body;
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Enter your name.';
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  if (password.length < 6) errors.password = 'Use at least 6 characters.';
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });

  if (await User.exists({ email: email.toLowerCase().trim() })) {
    return res.status(409).json({ message: 'An account with this email already exists.', errors: { email: 'Already registered.' } });
  }
  const user = await User.create({
    name, email, phone, address,
    passwordHash: await bcrypt.hash(password, 10),
  });
  res.status(201).json({ token: sign(user._id), user: publicUser(user) });
}));

router.post('/login', wrap(async (req, res) => {
  const { email = '', password = '' } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
  // Same message for unknown email and wrong password, so accounts can't be probed.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Incorrect email or password.' });
  }
  res.json({ token: sign(user._id), user: publicUser(user) });
}));

router.get('/me', requireAuth, wrap(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: 'Account not found. Please log in again.' });
  res.json({ user: publicUser(user) });
}));

router.put('/me', requireAuth, wrap(async (req, res) => {
  const { name, phone, address } = req.body;
  const update = {};
  if (typeof name === 'string' && name.trim().length >= 2) update.name = name.trim();
  if (typeof phone === 'string') update.phone = phone.trim();
  if (typeof address === 'string') update.address = address.trim();
  const user = await User.findByIdAndUpdate(req.userId, update, { new: true });
  res.json({ user: publicUser(user) });
}));

export default router;
