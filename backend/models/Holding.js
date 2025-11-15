const mongoose = require('mongoose');

const HoldingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  companyName: String,
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  averageBuyPrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  totalInvested: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    required: true
  },
  profitLoss: {
    type: Number,
    default: 0
  },
  profitLossPercentage: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate P&L before saving
HoldingSchema.pre('save', function(next) {
  this.currentValue = this.quantity * this.currentPrice;
  this.profitLoss = this.currentValue - this.totalInvested;
  this.profitLossPercentage = (this.profitLoss / this.totalInvested) * 100;
  this.lastUpdated = Date.now();
  next();
});

// Compound index for user and symbol
HoldingSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Holding', HoldingSchema);
