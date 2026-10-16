import { Router } from 'express';
import mongoose from 'mongoose';
import Order, { STATUS_FLOW, nextOrderNumber } from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import { requireAuth } from '../middleware/auth.js';
import { computePricing } from '../utils/pricing.js';
import wrap from '../utils/wrap.js';

const router = Router();
router.use(requireAuth); // every order route needs a logged-in user

const PHONE_RE = /^(\+63|0)9\d{9}$/;
const PAYMENTS = ['cod', 'gcash', 'card'];

// POST /api/orders - validate, price on the server, snapshot items, save
router.post('/', wrap(async (req, res) => {
  const { restaurantId, items, specialInstructions = '', delivery = {}, paymentMethod } = req.body;

  if (!mongoose.isValidObjectId(restaurantId)) return res.status(400).json({ message: 'Choose a restaurant first.' });
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
  if (!restaurant.deliveryAvailable) return res.status(400).json({ message: 'This restaurant does not offer delivery.' });
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Your cart is empty.' });

  // Prices come from the database, never from the client.
  const lines = [];
  for (const it of items) {
    const quantity = Number(it.quantity);
    const menuItem = mongoose.isValidObjectId(it.menuItemId) ? restaurant.menu.id(it.menuItemId) : null;
    if (!menuItem) return res.status(400).json({ message: 'An item in your cart is no longer on the menu.' });
    if (!menuItem.available) return res.status(400).json({ message: `${menuItem.name} is sold out.` });
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return res.status(400).json({ message: 'Quantity must be between 1 and 20.' });
    }
    lines.push({ menuItemId: menuItem._id, name: menuItem.name, price: menuItem.price, quantity });
  }

  const errors = {};
  const fullName = String(delivery.fullName || '').trim();
  const address = String(delivery.address || '').trim();
  const phone = String(delivery.phone || '').replace(/[\s-]/g, '');
  if (fullName.length < 2) errors.fullName = 'Enter your full name.';
  if (address.length < 5) errors.address = 'Enter your delivery address.';
  if (!PHONE_RE.test(phone)) errors.phone = 'Use a PH mobile number, e.g. 0917 123 4567.';
  if (!PAYMENTS.includes(paymentMethod)) errors.paymentMethod = 'Choose a payment method.';
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const pricing = computePricing(subtotal);
  const now = new Date();

  const order = await Order.create({
    orderNumber: await nextOrderNumber(),
    user: req.userId,
    restaurant: restaurant._id,
    restaurantName: restaurant.name,
    items: lines,
    specialInstructions: String(specialInstructions).slice(0, 300),
    delivery: { fullName, address, phone },
    paymentMethod,
    ...pricing,
    // The restaurant "accepts" instantly in this demo, so new orders start at "preparing".
    status: 'preparing',
    statusHistory: [{ status: 'placed', at: now }, { status: 'preparing', at: now }],
    estimatedDelivery: `${restaurant.deliveryMin + 5}–${restaurant.deliveryMax + 10} minutes`,
  });
  res.status(201).json({ order });
}));

// GET /api/orders?status=active|completed
router.get('/', wrap(async (req, res) => {
  const filter = { user: req.userId };
  if (req.query.status === 'active') filter.status = { $ne: 'delivered' };
  if (req.query.status === 'completed') filter.status = 'delivered';
  const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('restaurant', 'name imageColor').lean();
  res.json({ orders });
}));

async function findOwnOrder(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: 'Order not found.' });
    return null;
  }
  // Scoping by user means one customer can never read another's order.
  const order = await Order.findOne({ _id: req.params.id, user: req.userId });
  if (!order) res.status(404).json({ message: 'Order not found.' });
  return order;
}

router.get('/:id', wrap(async (req, res) => {
  const order = await findOwnOrder(req, res);
  if (order) res.json({ order });
}));

// PATCH /api/orders/:id/advance - demo helper that moves an order to its next status
router.patch('/:id/advance', wrap(async (req, res) => {
  const order = await findOwnOrder(req, res);
  if (!order) return;
  const next = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
  if (!next) return res.status(400).json({ message: 'This order is already delivered.' });
  order.status = next;
  order.statusHistory.push({ status: next, at: new Date() });
  await order.save();
  res.json({ order });
}));

export default router;
