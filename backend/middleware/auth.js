const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify Access Token Middleware
 */
const verifyAccessToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        error: 'Access token required. Please provide a valid token.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'access_secret_key_change_this'
    );

    // Check if it's an access token
    if (decoded.type !== 'access') {
      return res.status(401).json({
        ok: false,
        error: 'Invalid token type. Access token required.'
      });
    }

    // Check if user exists
    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        ok: false,
        error: 'User not found or inactive'
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        ok: false,
        error: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        ok: false,
        error: 'Invalid access token'
      });
    }

    console.error('Access token verification error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Verify Refresh Token Middleware
 */
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        ok: false,
        error: 'Refresh token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_change_this'
    );

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        ok: false,
        error: 'Invalid token type. Refresh token required.'
      });
    }

    // Check if user exists and token matches
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        ok: false,
        error: 'User not found or inactive'
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        ok: false,
        error: 'Invalid refresh token. Please login again.'
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        ok: false,
        error: 'Refresh token expired. Please login again.',
        code: 'REFRESH_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        ok: false,
        error: 'Invalid refresh token'
      });
    }

    console.error('Refresh token verification error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Token refresh failed'
    });
  }
};

/**
 * Optional Authentication (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'access_secret_key_change_this'
    );

    if (decoded.type === 'access') {
      const user = await User.findById(decoded.userId).select('-password -refreshToken');
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    req.user = null;
    req.userId = null;
    next();
  }
};

module.exports = {
  verifyAccessToken,
  verifyRefreshToken,
  optionalAuth
};
