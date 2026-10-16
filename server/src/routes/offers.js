import { Router } from 'express';
import Offer from '../models/Offer.js';
import wrap from '../utils/wrap.js';

const router = Router();

router.get('/', wrap(async (req, res) => {
  const offers = await Offer.find({ active: true }).sort({ order: 1 }).lean();
  res.json({ offers });
}));

export default router;
