# 💼 Finora - AI-Powered Investment Platform

**Complete Backend Implementation**

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- Docker (for Apache Tika)

### Install & Run
```bash
# 1. Install dependencies
cd backend
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start services
docker-compose up -d        # Apache Tika
npm start                   # Backend server

# Windows shortcut:
START_BACKEND.bat
```

**Server runs at:** http://localhost:5000

---

## ✨ Features Implemented

### 🔐 Authentication
- JWT dual token system (access + refresh)
- User registration & login
- Profile management

### 📊 Market Data
- **Top Movers** - Gainers, losers, most active
- **Screeners** - Large cap, small cap filtering
- **Indicators** - SMA, RSI with trading signals
- **Search** - By symbol, name, sector

### 💼 Paper Trading Portfolio
- Virtual $100,000 starting balance
- Buy/Sell stock orders
- Holdings & positions tracking
- Real-time P&L calculations
- Order history

### 📄 Document Processing
- Upload PDF, Excel, CSV, Images (25MB max)
- **Apache Tika** - Text extraction
- **Gemini AI** - Financial analysis
- Bank statements → Income/expense analysis
- Company reports → Performance metrics
- Auto-generated charts

### 🤖 AI Chatbot (Multi-Source)
Intelligent responses using:
- ✅ Company data (AlphaVantage)
- ✅ User portfolio
- ✅ Uploaded documents
- ✅ Live web search
- ✅ Chat history

**Capabilities:**
- Investment recommendations
- Chart generation
- Source citations
- Risk analysis

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/profile
```

### Market Data
```
GET    /api/market/movers              # Top gainers/losers
GET    /api/market/screener            # Large/small cap
GET    /api/market/indicators/:symbol/sma
GET    /api/market/indicators/:symbol/rsi
```

### Portfolio
```
GET    /api/portfolio/summary
GET    /api/portfolio/holdings
POST   /api/portfolio/orders/buy
POST   /api/portfolio/orders/sell
GET    /api/portfolio/orders
GET    /api/portfolio/positions
```

### Documents
```
POST   /api/documents/upload
GET    /api/documents
GET    /api/documents/:documentId
```

### Chat
```
POST   /api/chat                       # AI chatbot
GET    /api/chat/history/:sessionId
```

### Company
```
GET    /api/company/:symbol
GET    /api/company/:symbol/refresh
```

**Total: 34 Endpoints**

---

## 🔧 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **AI:** Gemini 2.0 Flash
- **Data:** AlphaVantage API
- **Documents:** Apache Tika
- **Auth:** JWT (jsonwebtoken, bcryptjs)
- **File Upload:** Multer

---

## 📚 Documentation

- **[API Documentation](backend/API_DOCUMENTATION.md)** - Complete API reference
- **[Quick Start Guide](backend/QUICK_START.md)** - Setup instructions
- **[Features List](backend/FEATURES_COMPLETE.md)** - All implemented features
- **[Implementation Summary](backend/IMPLEMENTATION_SUMMARY.md)** - Overview

---

## 🎯 Complete Workflow

```
1. User Registers/Logs In
   ↓
2. Browse Market (Top Movers, Indicators)
   ↓
3. Select Company (GOOGL)
   → Fetch from AlphaVantage
   → AI Analysis with Gemini
   → Store in MongoDB
   ↓
4. Upload Bank Statement (PDF)
   → Extract with Apache Tika
   → AI Financial Analysis
   → Generate Charts
   ↓
5. Execute Paper Trade (Buy GOOGL)
   → Update Holdings
   → Track Position
   → Calculate P&L
   ↓
6. Ask AI Chatbot
   → Combines:
     • Company data
     • Portfolio holdings
     • Bank statement analysis
     • Live web search
   → Returns:
     • Intelligent answer
     • Visual chart
     • Source citations
```

---

## 🔑 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finora

# API Keys (Required)
ALPHA_VANTAGE_KEY=your_key
GEMINI_API_KEY=your_key

# JWT Secrets (Required)
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret

# Apache Tika
TIKA_SERVER_URL=http://localhost:9998/tika
```

---

## 🧪 Testing

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'
```

### 2. Get Market Movers
```bash
curl http://localhost:5000/api/market/movers
```

### 3. Fetch Company
```bash
curl http://localhost:5000/api/company/GOOGL
```

### 4. Buy Stock
```bash
curl -X POST http://localhost:5000/api/portfolio/orders/buy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","quantity":10,"price":175.50}'
```

### 5. Upload Document
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@statement.pdf" \
  -F "category=BANK_STATEMENT"
```

### 6. Ask Chatbot
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Should I invest in GOOGL?","symbol":"GOOGL"}'
```

---

## 📦 Project Structure

```
backend/
├── config/              # Configuration
├── controllers/         # Business logic
├── models/             # MongoDB schemas
├── routes/             # API routes
├── middleware/         # Auth & validation
├── utils/              # Utilities
│   ├── alphaVantage.js # Stock data API
│   ├── gemini.js       # AI integration
│   └── webSearch.js    # Web search
├── uploads/            # File storage
├── docker-compose.yml  # Apache Tika setup
└── server.js           # Entry point
```

---

## 🎉 What's Included

✅ **JWT Authentication** (dual token)
✅ **Market Data** (movers, screeners, indicators)
✅ **Paper Trading** (holdings, orders, positions)
✅ **Document Processing** (PDF, Excel, CSV)
✅ **AI Chatbot** (multi-source intelligence)
✅ **Technical Indicators** (SMA, RSI)
✅ **Web Search Integration**
✅ **Chart Generation**
✅ **Source Citations**
✅ **Real-time Updates**

---

## 🆘 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod
```

### Apache Tika Not Running
```bash
# Check Docker
docker ps

# Restart Tika
docker-compose restart tika
```

### API Rate Limit
```bash
# AlphaVantage: 5 req/min, 100/day (free tier)
# Solution: Data is cached in MongoDB (24 hours)
```

---

## 🔗 Resources

- **AlphaVantage:** https://www.alphavantage.co/
- **Gemini AI:** https://ai.google.dev/
- **Apache Tika:** https://tika.apache.org/
- **MongoDB:** https://www.mongodb.com/

---

## 📝 License

MIT

---

**Built by Team Certified Losers** 🚀

*Complete AI-powered investment platform with paper trading, document analysis, and intelligent chatbot!*
