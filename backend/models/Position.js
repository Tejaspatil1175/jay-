const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
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
  positionType: {
    type: String,
    enum: ['LONG', 'SHORT'],
    default: 'LONG'
  },
  quantity: {
    type: Number,
    required: true
  },
  entryPrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  entryValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    required: true
  },
  unrealizedPL: {
    type: Number,
    default: 0
  },
  unrealizedPLPercentage: {
    type: Number,
    default: 0
  },
  realizedPL: {
    type: Number,
    default: 0
  },
  dayChange: {
    value: Number,
    percentage: Number
  },
  stopLoss: Number,
  takeProfit: Number,
  openedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: Date,
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED', 'PARTIAL'],
    default: 'OPEN'
  }
}, {
  timestamps: true
});

// Calculate P&L before saving
PositionSchema.pre('save', function(next) {
  this.currentValue = this.quantity * this.currentPrice;
  
  if (this.positionType === 'LONG') {
    this.unrealizedPL = this.currentValue - this.entryValue;
  } else {
    this.unrealizedPL = this.entryValue - this.currentValue;
  }
  
  this.unrealizedPLPercentage = (this.unrealizedPL / this.entryValue) * 100;
  next();
});

// Indexes
PositionSchema.index({ userId: 1, symbol: 1 });
PositionSchema.index({ status: 1 });
PositionSchema.index({ openedAt: -1 });

module.exports = mongoose.model('Position', PositionSchema);
