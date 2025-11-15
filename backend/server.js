'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const { errorHandler } = require('./utils/errorHandler');

// Import routes
const companyRoutes = require('./routes/companyRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Finora AI Investment Analyst API',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      company: '/api/company/:symbol',
      analyze: '/api/analyze/:symbol',
      chat: '/api/chat'
    }
  });
});

// API Routes
app.use('/api/company', companyRoutes);
app.use('/api/analyze', analysisRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 Finora AI Investment Analyst API                 ║
║                                                        ║
║   📊 Server running on port ${PORT}                      ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                    ║
║   💾 Database: MongoDB                                 ║
║   🤖 AI Model: Gemini 2.0 Flash                       ║
║                                                        ║
║   Endpoints:                                           ║
║   • GET  /api/company/:symbol                         ║
║   • POST /api/analyze/:symbol                         ║
║   • POST /api/chat                                    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = app;
