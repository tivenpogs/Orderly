import { Router } from 'express';
import mongoose from 'mongoose';
import Restaurant, { CUISINES, MENU_CATEGORIES } from '../models/Restaurant.js';
import User from '../models/User.js';
import { requireAdmin } from '../middleware/auth.js';
import wrap from '../utils/wrap.js';

const router = Router();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  recommended: { featured: -1, rating: -1, reviewCount: -1 },
  rating: { rating: -1, reviewCount: -1 },
  time: { deliveryMin: 1, rating: -1 },
  price: { priceLevel: 1, rating: -1 },
};

// GET /api/restaurants?q=&cuisine=Filipino,Korean&price=2&rating=4.5&delivery=true&pickup=true&sort=rating&featured=true&limit=3
router.get('/', wrap(async (req, res) => {
  const { q, cuisine, price, rating, delivery, pickup, featured, sort = 'recommended', limit } = req.query;
  const and = [];

  if (q && String(q).trim()) {
    const rx = new RegExp(escapeRe(String(q).trim()), 'i');
    and.push({ $or: [{ name: rx }, { cuisine: rx }, { type: rx }, { 'menu.name': rx }] });
  }
  if (cuisine) {
    const list = String(cuisine).split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length) and.push({ cuisine: { $in: list } });
  }
  const p = Number(price);
  if ([1, 2, 3].includes(p)) and.push({ priceLevel: p });
  const r = Number(rating);
  if (r > 0 && r <= 5) and.push({ rating: { $gte: r } });

  const wantDelivery = delivery === 'true';
  const wantPickup = pickup === 'true';
  if (wantDelivery && wantPickup) and.push({ $or: [{ deliveryAvailable: true }, { pickupAvailable: true }] });
  else if (wantDelivery) and.push({ deliveryAvailable: true });
  else if (wantPickup) and.push({ pickupAvailable: true });

  if (featured === 'true') and.push({ featured: true });

  const filter = and.length ? { $and: and } : {};
  const max = Math.min(Math.max(Number(limit) || 50, 1), 100);

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter).select('-menu -reviews').sort(SORTS[sort] || SORTS.recommended).limit(max).lean(),
    Restaurant.countDocuments(filter),
  ]);
  res.json({ total, restaurants });
}));

router.get('/:id', wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Restaurant not found.' });
  const restaurant = await Restaurant.findById(req.params.id).lean();
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
  res.json({ restaurant });
}));

// ---------------------------------------------------------------------------
// Admin: add / delete restaurants and menu items
// ---------------------------------------------------------------------------
const HEX = /^#[0-9a-f]{6}$/i;

function validateRestaurant(b) {
  const errors = {};
  const name = String(b.name || '').trim();
  const type = String(b.type || '').trim();
  const priceLevel = Number(b.priceLevel);
  const min = Number(b.deliveryMin);
  const max = Number(b.deliveryMax);
  const deliveryAvailable = b.deliveryAvailable !== false;
  const pickupAvailable = b.pickupAvailable !== false;

  if (name.length < 2) errors.name = 'Enter the restaurant name.';
  if (!CUISINES.includes(b.cuisine)) errors.cuisine = 'Choose a cuisine.';
  if (!type) errors.type = 'Enter a label such as Bakery or Ramen.';
  if (![1, 2, 3].includes(priceLevel)) errors.priceLevel = 'Choose a price range.';
  if (!Number.isInteger(min) || min < 5 || min > 120) errors.deliveryMin = 'Use whole minutes between 5 and 120.';
  if (!Number.isInteger(max) || max < min || max > 180) errors.deliveryMax = 'Must be at least the minimum, up to 180.';
  if (!deliveryAvailable && !pickupAvailable) errors.deliveryAvailable = 'Offer delivery, pickup, or both.';

  return {
    errors,
    data: {
      name, cuisine: b.cuisine, type, priceLevel, deliveryMin: min, deliveryMax: max, deliveryAvailable, pickupAvailable,
      description: String(b.description || '').trim().slice(0, 160),
      about: String(b.about || '').trim().slice(0, 600),
      address: String(b.address || '').trim().slice(0, 120) || 'Angeles City, Pampanga',
      imageColor: HEX.test(b.imageColor) ? b.imageColor : '#C4883C',
    },
  };
}

// POST /api/restaurants
router.post('/', requireAdmin, wrap(async (req, res) => {
  const { errors, data } = validateRestaurant(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });
  const restaurant = await Restaurant.create(data); // starts with an empty menu, rating 0
  res.status(201).json({ restaurant });
}));

// DELETE /api/restaurants/:id
router.delete('/:id', requireAdmin, wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Restaurant not found.' });
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
  // Remove it from everyone's saved list. Past orders are kept: they store their own name/price snapshot.
  await User.updateMany({ favorites: restaurant._id }, { $pull: { favorites: restaurant._id } });
  res.json({ deleted: true });
}));

// POST /api/restaurants/:id/menu
router.post('/:id/menu', requireAdmin, wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Restaurant not found.' });
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });

  const b = req.body;
  const name = String(b.name || '').trim();
  const price = Number(b.price);
  const errors = {};
  if (!name) errors.name = 'Enter the dish name.';
  if (!Number.isFinite(price) || price < 0 || price > 100000) errors.price = 'Enter a price in pesos.';
  if (!MENU_CATEGORIES.includes(b.category)) errors.category = 'Choose a category.';
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });

  restaurant.menu.push({
    name, price, category: b.category,
    description: String(b.description || '').trim().slice(0, 160),
    popular: b.popular === true,
  });
  await restaurant.save();
  res.status(201).json({ item: restaurant.menu[restaurant.menu.length - 1], menu: restaurant.menu });
}));

// DELETE /api/restaurants/:id/menu/:itemId
router.delete('/:id/menu/:itemId', requireAdmin, wrap(async (req, res) => {
  const { id, itemId } = req.params;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(itemId)) return res.status(404).json({ message: 'Menu item not found.' });
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
  if (!restaurant.menu.id(itemId)) return res.status(404).json({ message: 'Menu item not found.' });
  restaurant.menu.pull(itemId);
  await restaurant.save();
  res.json({ menu: restaurant.menu });
}));

export default router;
