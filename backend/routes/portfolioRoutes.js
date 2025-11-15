const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { verifyAccessToken } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(verifyAccessToken);

/**
 * @route   GET /api/portfolio/summary
 * @desc    Get portfolio summary
 * @access  Private
 */
router.get('/summary', portfolioController.getPortfolioSummary);

/**
 * @route   GET /api/portfolio/holdings
 * @desc    Get all holdings
 * @access  Private
 */
router.get('/holdings', portfolioController.getHoldings);

/**
 * @route   GET /api/portfolio/holdings/:symbol
 * @desc    Get holding by symbol
 * @access  Private
 */
router.get('/holdings/:symbol', portfolioController.getHoldingBySymbol);

/**
 * @route   POST /api/portfolio/holdings/update-prices
 * @desc    Update current prices for all holdings
 * @access  Private
 */
router.post('/holdings/update-prices', portfolioController.updateHoldingsPrices);

/**
 * @route   GET /api/portfolio/orders
 * @desc    Get all orders
 * @access  Private
 */
router.get('/orders', portfolioController.getOrders);

/**
 * @route   GET /api/portfolio/orders/:orderId
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/orders/:orderId', portfolioController.getOrderById);

/**
 * @route   POST /api/portfolio/orders/buy
 * @desc    Create buy order
 * @access  Private
 */
router.post('/orders/buy', portfolioController.createBuyOrder);

/**
 * @route   POST /api/portfolio/orders/sell
 * @desc    Create sell order
 * @access  Private
 */
router.post('/orders/sell', portfolioController.createSellOrder);

/**
 * @route   GET /api/portfolio/positions
 * @desc    Get all positions
 * @access  Private
 */
router.get('/positions', portfolioController.getPositions);

module.exports = router;
