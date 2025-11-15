const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  documentId: {
    type: String,
    required: true,
    unique: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['PDF', 'EXCEL', 'IMAGE', 'CSV', 'OTHER'],
    required: true
  },
  category: {
    type: String,
    enum: ['BANK_STATEMENT', 'COMPANY_REPORT', 'INCOME_STATEMENT', 'TAX_DOCUMENT', 'OTHER'],
    default: 'OTHER'
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: String,
  mimeType: String,
  extractedText: {
    type: String,
    select: false // Don't load by default (can be large)
  },
  metadata: {
    pageCount: Number,
    author: String,
    creationDate: Date,
    modificationDate: Date
  },
  analysis: {
    summary: String,
    keyFindings: [String],
    financialMetrics: mongoose.Schema.Types.Mixed,
    insights: mongoose.Schema.Types.Mixed,
    chartData: mongoose.Schema.Types.Mixed,
    risks: [String],
    opportunities: [String],
    analyzedAt: Date,
    llmModel: String
  },
  embeddings: {
    embeddingId: String,
    chunks: [{
      chunkId: String,
      text: String,
      embeddingVector: [Number],
      metadata: mongoose.Schema.Types.Mixed
    }],
    updatedAt: Date
  },
  processingStatus: {
    type: String,
    enum: ['UPLOADED', 'EXTRACTING', 'EXTRACTED', 'ANALYZING', 'COMPLETED', 'FAILED'],
    default: 'UPLOADED'
  },
  processingError: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
DocumentSchema.index({ userId: 1, uploadedAt: -1 });
DocumentSchema.index({ documentId: 1 });
DocumentSchema.index({ category: 1 });
DocumentSchema.index({ processingStatus: 1 });

module.exports = mongoose.model('Document', DocumentSchema);
