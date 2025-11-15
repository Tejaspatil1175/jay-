const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  symbol: {
    type: String,
    uppercase: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    usedWebSearch: {
      type: Boolean,
      default: false
    },
    sources: [String]
  }],
  userId: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days
  }
}, {
  timestamps: true
});

ChatHistorySchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
