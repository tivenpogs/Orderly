import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurants.js';
import orderRoutes from './routes/orders.js';
import offerRoutes from './routes/offers.js';
import favoriteRoutes from './routes/favorites.js';

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-only-secret-change-me';
  console.warn('JWT_SECRET is not set - using an insecure development default.');
}
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/orderly';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api', (req, res) => res.status(404).json({ message: 'Endpoint not found.' }));

// In production, serve the built React app from the same server.
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong on our side. Please try again.' });
});

connectDB(MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`Orderly API running on http://localhost:${PORT}`)))
  .catch((e) => {
    console.error('Could not connect to MongoDB:', e.message);
    process.exit(1);
  });
