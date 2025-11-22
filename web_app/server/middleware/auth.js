// web_app/server/middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'somerandomsecretstring123';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'No authentication token provided' 
      });
    }

    // Check for Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'Invalid token format. Use: Bearer <token>' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'No token provided' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'User no longer exists' 
      });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      username: user.username
    };
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token verification failed' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please login again' 
      });
    }
    
    res.status(500).json({ 
      error: 'Server error',
      message: 'Authentication failed' 
    });
  }
};

/**
 * Optional Auth Middleware
 * Attaches user to request if token is valid, but doesn't block if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (user) {
      req.user = {
        id: user._id,
        username: user.username
      };
      req.token = token;
    }
    
    next();
  } catch (error) {
    // Don't block the request, just continue without user
    next();
  }
};

/**
 * Generate JWT Token
 */
const generateToken = (user, expiresIn = '24h') => {
  const payload = {
    user: {
      id: user._id || user.id,
      username: user.username
    }
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Refresh Token
 */
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    
    // Check if token is not too old (e.g., within 7 days of expiry)
    const tokenExp = decoded.exp * 1000;
    const maxRefreshWindow = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    if (Date.now() - tokenExp > maxRefreshWindow) {
      return res.status(401).json({ 
        error: 'Token too old',
        message: 'Please login again' 
      });
    }
    
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const newToken = generateToken(user);
    
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;
module.exports.optionalAuth = optionalAuth;
module.exports.generateToken = generateToken;
module.exports.refreshToken = refreshToken;