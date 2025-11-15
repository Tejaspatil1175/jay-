const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  profile: {
    phone: String,
    dateOfBirth: Date,
    address: String,
    riskTolerance: {
      type: String,
      enum: ['Conservative', 'Moderate', 'Aggressive'],
      default: 'Moderate'
    },
    investmentGoals: [String],
    experience: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    }
  },
  portfolio: {
    cashBalance: {
      type: Number,
      default: 100000 // Starting paper trading balance
    },
    totalValue: {
      type: Number,
      default: 100000
    },
    totalInvested: {
      type: Number,
      default: 0
    },
    profitLoss: {
      type: Number,
      default: 0
    },
    profitLossPercentage: {
      type: Number,
      default: 0
    }
  },
  documents: [{
    documentId: String,
    fileName: String,
    fileType: String,
    uploadedAt: Date,
    extractedText: String,
    analysis: mongoose.Schema.Types.Mixed
  }],
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    }
  },
  refreshToken: String,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Generate Access Token (short-lived: 15 minutes)
UserSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      email: this.email,
      type: 'access'
    },
    process.env.JWT_ACCESS_SECRET || 'access_secret_key_change_this',
    { expiresIn: '15m' }
  );
};

// Generate Refresh Token (long-lived: 7 days)
UserSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_change_this',
    { expiresIn: '7d' }
  );
};

// Update portfolio value
UserSchema.methods.updatePortfolioValue = async function(holdings) {
  let totalValue = this.portfolio.cashBalance;
  
  for (const holding of holdings) {
    totalValue += holding.currentValue;
  }
  
  this.portfolio.totalValue = totalValue;
  this.portfolio.profitLoss = totalValue - 100000; // Initial balance
  this.portfolio.profitLossPercentage = ((totalValue - 100000) / 100000) * 100;
  
  await this.save();
};

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);
