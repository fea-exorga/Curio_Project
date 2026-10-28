import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getJwtSecret } from '../config/security.js';

export const extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
};

// Enforces authentication
export const requireAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

// Optional auth: attaches req.user if valid token exists, doesn't block if guest
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      req.user = null;
      return next();
    }

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);
    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Enforces admin role on the backend
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: Administrator privileges required.',
    });
  }
  next();
};
