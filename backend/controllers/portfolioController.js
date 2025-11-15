const User = require('../models/User');
const Holding = require('../models/Holding');
const Order = require('../models/Order');
const Position = require('../models/Position');
const Company = require('../models/Company');
const alphaVantageService = require('../utils/alphaVantage');
const { v4: uuidv4 } = require('uuid');

/**
 * Get user portfolio summary
 */
exports.getPortfolioSummary = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    const holdings = await Holding.find({ userId });
    const positions = await Position.find({ userId, status: 'OPEN' });

    // Calculate total portfolio value
    let totalHoldingsValue = 0;
    holdings.forEach(h => {
      totalHoldingsValue += h.currentValue;
    });

    const totalValue = user.portfolio.cashBalance + totalHoldingsValue;
    const profitLoss = totalValue - 100000; // Initial balance
    const profitLossPercentage = ((profitLoss / 100000) * 100).toFixed(2);

    res.json({
      ok: true,
      data: {
        portfolio: {
          cashBalance: user.portfolio.cashBalance,
          totalInvested: user.portfolio.totalInvested,
          totalValue,
          profitLoss,
          profitLossPercentage: parseFloat(profitLossPercentage),
          holdingsCount: holdings.length,
          positionsCount: positions.length
        },
        holdings,
        positions
      }
    });
  } catch (error) {
    console.error('Get portfolio summary error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch portfolio summary',
      details: error.message
    });
  }
};

/**
 * Get all holdings
 */
exports.getHoldings = async (req, res) => {
  try {
    const userId = req.userId;
    const holdings = await Holding.find({ userId }).sort({ createdAt: -1 });

    res.json({
      ok: true,
      count: holdings.length,
      data: holdings
    });
  } catch (error) {
    console.error('Get holdings error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch holdings',
      details: error.message
    });
  }
};

/**
 * Get holding by symbol
 */
exports.getHoldingBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const userId = req.userId;

    const holding = await Holding.findOne({ userId, symbol: symbol.toUpperCase() });

    if (!holding) {
      return res.status(404).json({
        ok: false,
        error: 'Holding not found'
      });
    }

    res.json({
      ok: true,
      data: holding
    });
  } catch (error) {
    console.error('Get holding error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch holding',
      details: error.message
    });
  }
};

/**
 * Create buy order
 */
exports.createBuyOrder = async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    const userId = req.userId;

    if (!symbol || !quantity || !price) {
      return res.status(400).json({
        ok: false,
        error: 'Symbol, quantity, and price are required'
      });
    }

    if (quantity <= 0 || price <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'Quantity and price must be positive numbers'
      });
    }

    const totalAmount = quantity * price;

    // Check user balance
    const user = await User.findById(userId);
    if (user.portfolio.cashBalance < totalAmount) {
      return res.status(400).json({
        ok: false,
        error: 'Insufficient balance',
        available: user.portfolio.cashBalance,
        required: totalAmount
      });
    }

    // Get company data
    let company = await Company.findOne({ symbol: symbol.toUpperCase() });
    if (!company) {
      const overview = await alphaVantageService.fetchOverview(symbol);
      company = { metrics: { name: overview.Name } };
    }

    // Create order
    const order = new Order({
      userId,
      orderId: `ORD-${uuidv4()}`,
      symbol: symbol.toUpperCase(),
      companyName: company.metrics?.name || symbol,
      orderType: 'BUY',
      quantity,
      price,
      totalAmount,
      orderStatus: 'EXECUTED',
      executedAt: new Date()
    });

    await order.save();

    // Deduct from cash balance
    user.portfolio.cashBalance -= totalAmount;
    user.portfolio.totalInvested += totalAmount;
    await user.save();

    // Update or create holding
    let holding = await Holding.findOne({ userId, symbol: symbol.toUpperCase() });

    if (holding) {
      // Update existing holding
      const totalQuantity = holding.quantity + quantity;
      const totalInvested = holding.totalInvested + totalAmount;
      holding.averageBuyPrice = totalInvested / totalQuantity;
      holding.quantity = totalQuantity;
      holding.totalInvested = totalInvested;
      holding.currentPrice = price;
      await holding.save();
    } else {
      // Create new holding
      holding = new Holding({
        userId,
        symbol: symbol.toUpperCase(),
        companyName: company.metrics?.name || symbol,
        quantity,
        averageBuyPrice: price,
        currentPrice: price,
        totalInvested: totalAmount
      });
      await holding.save();
    }

    // Create or update position
    let position = await Position.findOne({ userId, symbol: symbol.toUpperCase(), status: 'OPEN' });

    if (!position) {
      position = new Position({
        userId,
        symbol: symbol.toUpperCase(),
        companyName: company.metrics?.name || symbol,
        positionType: 'LONG',
        quantity,
        entryPrice: price,
        currentPrice: price,
        entryValue: totalAmount
      });
      await position.save();
    }

    res.status(201).json({
      ok: true,
      message: 'Buy order executed successfully',
      data: {
        order,
        holding,
        position,
        portfolio: {
          cashBalance: user.portfolio.cashBalance,
          totalInvested: user.portfolio.totalInvested
        }
      }
    });
  } catch (error) {
    console.error('Create buy order error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to create buy order',
      details: error.message
    });
  }
};

/**
 * Create sell order
 */
exports.createSellOrder = async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    const userId = req.userId;

    if (!symbol || !quantity || !price) {
      return res.status(400).json({
        ok: false,
        error: 'Symbol, quantity, and price are required'
      });
    }

    if (quantity <= 0 || price <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'Quantity and price must be positive numbers'
      });
    }

    // Check if user has holding
    const holding = await Holding.findOne({ userId, symbol: symbol.toUpperCase() });

    if (!holding) {
      return res.status(404).json({
        ok: false,
        error: 'You do not own this stock'
      });
    }

    if (holding.quantity < quantity) {
      return res.status(400).json({
        ok: false,
        error: 'Insufficient quantity',
        available: holding.quantity,
        requested: quantity
      });
    }

    const totalAmount = quantity * price;

    // Create order
    const order = new Order({
      userId,
      orderId: `ORD-${uuidv4()}`,
      symbol: symbol.toUpperCase(),
      companyName: holding.companyName,
      orderType: 'SELL',
      quantity,
      price,
      totalAmount,
      orderStatus: 'EXECUTED',
      executedAt: new Date()
    });

    await order.save();

    // Update user balance
    const user = await User.findById(userId);
    user.portfolio.cashBalance += totalAmount;
    
    // Calculate realized P&L
    const soldInvested = (holding.totalInvested / holding.quantity) * quantity;
    const realizedPL = totalAmount - soldInvested;

    await user.save();

    // Update holding
    holding.quantity -= quantity;
    holding.totalInvested -= soldInvested;
    
    if (holding.quantity === 0) {
      await Holding.deleteOne({ _id: holding._id });
    } else {
      holding.currentPrice = price;
      await holding.save();
    }

    // Update position
    const position = await Position.findOne({ userId, symbol: symbol.toUpperCase(), status: 'OPEN' });
    if (position) {
      position.quantity -= quantity;
      position.realizedPL += realizedPL;
      
      if (position.quantity === 0) {
        position.status = 'CLOSED';
        position.closedAt = new Date();
      }
      
      position.currentPrice = price;
      await position.save();
    }

    res.json({
      ok: true,
      message: 'Sell order executed successfully',
      data: {
        order,
        holding: holding.quantity > 0 ? holding : null,
        position,
        realizedPL,
        portfolio: {
          cashBalance: user.portfolio.cashBalance,
          totalInvested: user.portfolio.totalInvested
        }
      }
    });
  } catch (error) {
    console.error('Create sell order error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to create sell order',
      details: error.message
    });
  }
};

/**
 * Get all orders
 */
exports.getOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, orderType, symbol } = req.query;

    let query = { userId };
    
    if (status) query.orderStatus = status;
    if (orderType) query.orderType = orderType;
    if (symbol) query.symbol = symbol.toUpperCase();

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(100);

    res.json({
      ok: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch orders',
      details: error.message
    });
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ orderId, userId });

    if (!order) {
      return res.status(404).json({
        ok: false,
        error: 'Order not found'
      });
    }

    res.json({
      ok: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch order',
      details: error.message
    });
  }
};

/**
 * Get all positions
 */
exports.getPositions = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    let query = { userId };
    if (status) query.status = status;

    const positions = await Position.find(query).sort({ openedAt: -1 });

    res.json({
      ok: true,
      count: positions.length,
      data: positions
    });
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch positions',
      details: error.message
    });
  }
};

/**
 * Update current prices for all holdings
 */
exports.updateHoldingsPrices = async (req, res) => {
  try {
    const userId = req.userId;
    const holdings = await Holding.find({ userId });

    const updatePromises = holdings.map(async (holding) => {
      try {
        const timeSeries = await alphaVantageService.fetchTimeSeriesDaily(holding.symbol);
        const latestDate = Object.keys(timeSeries)[0];
        const latestPrice = parseFloat(timeSeries[latestDate]['4. close']);
        
        holding.currentPrice = latestPrice;
        await holding.save();
        
        return { symbol: holding.symbol, updated: true, price: latestPrice };
      } catch (error) {
        console.error(`Failed to update ${holding.symbol}:`, error.message);
        return { symbol: holding.symbol, updated: false, error: error.message };
      }
    });

    const results = await Promise.all(updatePromises);

    res.json({
      ok: true,
      message: 'Holdings prices updated',
      data: results
    });
  } catch (error) {
    console.error('Update holdings prices error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to update holdings prices',
      details: error.message
    });
  }
};

module.exports = exports;
