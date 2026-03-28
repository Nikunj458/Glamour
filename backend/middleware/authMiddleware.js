import jwt      from 'jsonwebtoken';
import User     from '../models/User.js';

// ── protect: verify JWT, attach user to req ──────────────────────────────────
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized — no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB — catches deleted/banned accounts
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized — user no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Not authorized — session expired, please log in again' :
      err.name === 'JsonWebTokenError' ? 'Not authorized — invalid token'                         :
      'Not authorized — token verification failed';

    res.status(401).json({ message });
  }
};

// ── adminOnly: must be called after protect ──────────────────────────────────
export const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Forbidden — admin access required' });
};

// ── optionalAuth: attaches user if token present, doesn't block if missing ───
// Useful for routes that work for both guests and logged-in users
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next(); // no token — continue as guest

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch {} // invalid token on optional route — just skip
  next();
};