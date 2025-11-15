const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  companyName: String,
  orderType: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'EXECUTED', 'CANCELLED', 'FAILED'],
    default: 'PENDING'
  },
  executedAt: Date,
  cancelledAt: Date,
  notes: String,
  marketData: {
    marketPrice: Number,
    fiftyTwoWeekHigh: Number,
    fiftyTwoWeekLow: Number,
    volume: Number
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
OrderSchema.pre('save', function(next) {
  if (!this.totalAmount) {
    this.totalAmount = this.quantity * this.price;
  }
  next();
});

// Indexes
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ symbol: 1 });
OrderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', OrderSchema);
