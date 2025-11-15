const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const { optionalAuth } = require('../middleware/auth');

// Apply optional auth (works with or without token)
router.use(optionalAuth);

/**
 * @route   GET /api/market/movers
 * @desc    Get top gainers, losers, and most active stocks
 * @access  Public
 */
router.get('/movers', marketController.getTopMovers);

/**
 * @route   GET /api/market/screener
 * @desc    Get stocks by market cap filter
 * @access  Public
 */
router.get('/screener', marketController.getStocksByMarketCap);

/**
 * @route   GET /api/market/search
 * @desc    Search stocks by criteria
 * @access  Public
 */
router.get('/search', marketController.searchStocks);

/**
 * @route   GET /api/market/indicators/:symbol/sma
 * @desc    Get SMA (Simple Moving Average) for a symbol
 * @access  Public
 */
router.get('/indicators/:symbol/sma', marketController.getSMA);

/**
 * @route   GET /api/market/indicators/:symbol/rsi
 * @desc    Get RSI (Relative Strength Index) for a symbol
 * @access  Public
 */
router.get('/indicators/:symbol/rsi', marketController.getRSI);

/**
 * @route   GET /api/market/indicators/:symbol/all
 * @desc    Get all technical indicators for a symbol
 * @access  Public
 */
router.get('/indicators/:symbol/all', marketController.getAllIndicators);

module.exports = router;
