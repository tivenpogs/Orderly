import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
}

// Logged in AND role === 'admin'. The role is read from the database on every call,
// so demoting an admin takes effect immediately (a JWT alone would stay valid for days).
export function requireAdmin(req, res, next) {
  requireAuth(req, res, async () => {
    try {
      const user = await User.findById(req.userId).select('role');
      if (user?.role !== 'admin') return res.status(403).json({ message: 'Only administrators can do this.' });
      next();
    } catch (err) {
      next(err);
    }
  });
}
