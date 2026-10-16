import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import { requireAuth } from '../middleware/auth.js';
import wrap from '../utils/wrap.js';

const router = Router();
router.use(requireAuth);

// GET /api/favorites - saved restaurants (without menus)
router.get('/', wrap(async (req, res) => {
  const user = await User.findById(req.userId).populate({ path: 'favorites', select: '-menu -reviews' });
  res.json({ restaurants: user ? user.favorites : [] });
}));

// POST /api/favorites/:restaurantId - toggles; returns the new list of ids
router.post('/:restaurantId', wrap(async (req, res) => {
  const { restaurantId } = req.params;
  if (!mongoose.isValidObjectId(restaurantId) || !(await Restaurant.exists({ _id: restaurantId }))) {
    return res.status(404).json({ message: 'Restaurant not found.' });
  }
  const user = await User.findById(req.userId);
  const has = user.favorites.some((id) => String(id) === restaurantId);
  await User.updateOne(
    { _id: req.userId },
    has ? { $pull: { favorites: restaurantId } } : { $addToSet: { favorites: restaurantId } }
  );
  const fresh = await User.findById(req.userId);
  res.json({ favorited: !has, favorites: fresh.favorites.map(String) });
}));

export default router;
