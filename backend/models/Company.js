const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  providerUsed: {
    type: String,
    default: 'alphavantage'
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  },
  raw: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metrics: {
    symbol: String,
    name: String,
    marketCap: Number,
    peRatio: Number,
    eps: Number,
    profitMargin: Number,
    revenue: Number,
    netIncome: Number,
    fiftyTwoWeekHigh: Number,
    fiftyTwoWeekLow: Number,
    roe: Number,
    roa: Number,
    debtEquity: Number,
    currentRatio: Number,
    quickRatio: Number,
    bookValue: Number,
    dividendYield: Number,
    beta: Number,
    sector: String,
    industry: String,
    description: String
  },
  chartData: [{
    date: Date,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number
  }],
  analysis: {
    analysisId: String,
    summary: String,
    insights: mongoose.Schema.Types.Mixed,
    risk: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    suggestion: String,
    llmModel: String,
    llmRawResponse: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  embeddings: {
    metricsEmbeddingId: String,
    chartEmbeddingId: String,
    analysisEmbeddingId: String,
    updatedAt: Date
  },
  access: {
    userId: String,
    visibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'public'
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
CompanySchema.index({ symbol: 1, fetchedAt: -1 });
CompanySchema.index({ 'access.userId': 1 });

module.exports = mongoose.model('Company', CompanySchema);
