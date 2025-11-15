# Finora AI Investment Analyst - Backend API

> **Democratizing Financial Intelligence Through AI-Powered Analysis**

A complete backend system for an AI-powered financial analysis platform that helps retail investors make data-driven investment decisions.

---

## 🎯 Project Overview

**Problem**: 10+ crore retail investors in India lack access to professional-grade financial analysis tools, leading to speculation-based investing (70% of retail investors).

**Solution**: AI-powered platform that:
- Fetches real-time financial data from AlphaVantage
- Stores and normalizes company metrics in MongoDB
- Uses Gemini AI for intelligent analysis in plain English
- Provides chart-ready data for frontend visualization
- Includes smart chatbot with web search capabilities

---

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│          Express.js API Server          │
├─────────────────────────────────────────┤
│  Routes:                                │
│  • /api/company/:symbol                 │
│  • /api/analyze/:symbol                 │
│  • /api/chat                            │
└──────┬──────────────┬───────────┬───────┘
       │              │           │
       ▼              ▼           ▼
┌─────────────┐ ┌──────────┐ ┌─────────┐
│ AlphaVantage│ │  Gemini  │ │   Web   │
│     API     │ │   AI     │ │ Search  │
└─────────────┘ └──────────┘ └─────────┘
       │              │           │
       └──────┬───────┴───────────┘
              ▼
       ┌──────────────┐
       │   MongoDB    │
       │  (Mongoose)  │
       └──────────────┘
```

---

## 📂 Project Structure

```
/backend
├── server.js                     # Main entry point
├── package.json                  # Dependencies
├── .env.example                  # Environment variables template
│
├── /config
│   ├── database.js              # MongoDB connection
│   └── constants.js             # API configs & constants
│
├── /models
│   ├── Company.js               # Company schema (metrics + analysis)
│   └── ChatHistory.js           # Chat session schema
│
├── /controllers
│   ├── companyController.js     # Company data logic
│   ├── analysisController.js    # AI analysis logic
│   └── chatController.js        # Chatbot logic
│
├── /routes
│   ├── companyRoutes.js         # Company endpoints
│   ├── analysisRoutes.js        # Analysis endpoints
│   └── chatRoutes.js            # Chat endpoints
│
└── /utils
    ├── alphaVantage.js          # AlphaVantage API wrapper
    ├── gemini.js                # Gemini AI wrapper
    ├── dataTransformer.js       # Data normalization
    ├── errorHandler.js          # Error handling
    └── webSearch.js             # Web search integration
```

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** v18+ 
- **MongoDB** (local or Atlas)
- **AlphaVantage API Key** ([Get here](https://www.alphavantage.co/support/#api-key))
- **Gemini API Key** ([Get here](https://makersuite.google.com/app/apikey))

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB (use your own connection string)
MONGO_URI=mongodb://localhost:27017/finora-ai

# AlphaVantage API Key
ALPHA_VANTAGE_KEY=your_key_here

# Gemini API Key
GEMINI_API_KEY=your_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Start Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start at `http://localhost:5000`

---

## 📡 API Endpoints

### 🏢 Company Data

#### **GET** `/api/company/:symbol`
Fetch company financial data from AlphaVantage, store in DB, return normalized metrics.

**Example Request:**
```bash
curl http://localhost:5000/api/company/AAPL
```

**Response:**
```json
{
  "ok": true,
  "cached": false,
  "company": "AAPL",
  "data": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "metrics": {
      "marketCap": 2800000000000,
      "peRatio": 29.5,
      "eps": 6.42,
      "profitMargin": 0.23,
      "revenue": 380000000000,
      "roe": 15.2,
      "debtEquity": 1.8
    },
    "chartData": [
      {
        "date": "2024-01-01",
        "open": 185.5,
        "close": 188.2,
        "volume": 50000000
      }
    ],
    "historicalTrends": [
      {
        "year": "2023",
        "revenue": 394000000000,
        "netIncome": 97000000000
      }
    ]
  }
}
```

---

#### **GET** `/api/company/:symbol/refresh`
Force refresh company data (ignores cache).

---

#### **GET** `/api/companies`
Get all stored companies.

---

### 🤖 AI Analysis

#### **POST** `/api/analyze/:symbol`
Generate AI analysis using Gemini.

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/analyze/AAPL
```

**Response:**
```json
{
  "ok": true,
  "cached": false,
  "symbol": "AAPL",
  "analysis": {
    "analysisId": "uuid",
    "summary": "Apple shows strong financial health with solid profitability and reasonable valuation...",
    "insights": {
      "peRatio": "PE Ratio of 29.5 means investors pay $29.50 for every $1 of earnings...",
      "roe": "ROE of 15.2% shows excellent returns on shareholder investment...",
      "profitMargin": "23% profit margin demonstrates efficient operations..."
    },
    "risk": "Low",
    "suggestion": "Good for long-term investment with regular monitoring",
    "llmModel": "gemini-2.0-flash-exp",
    "createdAt": "2025-11-13T..."
  }
}
```

---

#### **GET** `/api/analyze/:symbol`
Get existing analysis.

---

#### **DELETE** `/api/analyze/:symbol`
Delete analysis (force regeneration).

---

### 💬 Smart Chatbot

#### **POST** `/api/chat`
Send message to AI chatbot with context awareness and web search.

**Request Body:**
```json
{
  "message": "What's the latest news about this company?",
  "symbol": "AAPL",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "ok": true,
  "sessionId": "uuid",
  "message": "Based on recent web search, Apple announced...",
  "usedWebSearch": true,
  "sources": [
    "https://example.com/news1",
    "https://example.com/news2"
  ],
  "timestamp": "2025-11-13T..."
}
```

---

#### **POST** `/api/chat/new`
Start new chat session.

**Request Body:**
```json
{
  "symbol": "AAPL"
}
```

---

#### **GET** `/api/chat/history/:sessionId`
Get chat history.

---

#### **DELETE** `/api/chat/history/:sessionId`
Delete chat history.

---

## 🔄 Complete Workflow

```
1. User selects company (e.g., AAPL)
   ↓
2. Frontend calls: GET /api/company/AAPL
   ↓
3. Backend:
   • Fetches data from AlphaVantage (OVERVIEW, INCOME_STATEMENT, etc.)
   • Normalizes metrics
   • Stores in MongoDB
   • Returns chart-ready data
   ↓
4. Frontend displays metrics & charts
   ↓
5. User clicks "Analyze"
   ↓
6. Frontend calls: POST /api/analyze/AAPL
   ↓
7. Backend:
   • Retrieves stored metrics from DB
   • Sends to Gemini AI with structured prompt
   • Stores analysis in DB
   • Returns plain-English insights
   ↓
8. Frontend displays analysis
   ↓
9. User asks question in chatbot
   ↓
10. Frontend calls: POST /api/chat
    ↓
11. Backend:
    • Retrieves stored company data
    • Checks if web search needed
    • Sends to Gemini with context
    • Returns intelligent response
```

---

## 🗄️ Database Schema

### Company Collection
```javascript
{
  "_id": "ObjectId",
  "symbol": "AAPL",
  "providerUsed": "alphavantage",
  "fetchedAt": "2025-11-13T...",
  "raw": {
    "overview": { /* full AlphaVantage response */ },
    "incomeStatement": { /* ... */ },
    "balanceSheet": { /* ... */ },
    "cashFlow": { /* ... */ },
    "historicalTrends": [ /* ... */ ]
  },
  "metrics": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "marketCap": 2800000000000,
    "peRatio": 29.5,
    "eps": 6.42,
    "profitMargin": 0.23,
    "revenue": 380000000000,
    "roe": 15.2,
    "debtEquity": 1.8
  },
  "chartData": [
    { "date": "2024-01-01", "open": 185.5, "close": 188.2 }
  ],
  "analysis": {
    "analysisId": "uuid",
    "summary": "...",
    "insights": { /* ... */ },
    "risk": "Low",
    "suggestion": "...",
    "llmModel": "gemini-2.0-flash-exp",
    "createdAt": "..."
  },
  "access": {
    "userId": "user123",
    "visibility": "public"
  }
}
```

### ChatHistory Collection
```javascript
{
  "_id": "ObjectId",
  "sessionId": "uuid",
  "symbol": "AAPL",
  "messages": [
    {
      "role": "user",
      "content": "What's the PE ratio?",
      "timestamp": "..."
    },
    {
      "role": "assistant",
      "content": "The PE ratio is 29.5, which means...",
      "usedWebSearch": false,
      "timestamp": "..."
    }
  ],
  "createdAt": "..."
}
```

---

## ⚙️ Configuration

### AlphaVantage API
- **Rate Limit (Free)**: 5 calls/minute, 500 calls/day
- **Functions Used**: 
  - `OVERVIEW` - Company fundamentals
  - `INCOME_STATEMENT` - Revenue, profit
  - `BALANCE_SHEET` - Assets, liabilities
  - `CASH_FLOW` - Cash flow data
  - `TIME_SERIES_DAILY` - Stock price history

### Gemini AI
- **Model**: `gemini-2.0-flash-exp`
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 2048
- **Use Cases**:
  - Financial analysis generation
  - Plain-English translation
  - Smart chatbot responses
  - Web search decision-making

### MongoDB
- **Collections**: `companies`, `chathistories`
- **Indexes**: symbol, fetchedAt, sessionId
- **TTL**: Chat history auto-deleted after 30 days

---

## 🛡️ Error Handling

All errors follow this format:

```json
{
  "ok": false,
  "status": "fail",
  "error": "Error message here"
}
```

Common errors:
- `400` - Bad request (missing params)
- `404` - Resource not found
- `429` - Rate limit exceeded
- `500` - Internal server error

---

## 🔒 Security Features

- ✅ **Helmet.js** - Security headers
- ✅ **CORS** - Cross-origin protection
- ✅ **Rate Limiting** - 100 requests per 15 minutes
- ✅ **Input Validation** - Sanitized inputs
- ✅ **Error Handling** - No sensitive data leakage

---

## 📊 Performance Optimizations

- **Caching**: Company data cached for 24 hours
- **Analysis Caching**: AI analysis cached for 7 days
- **Compression**: Gzip compression enabled
- **Async Operations**: Non-blocking I/O
- **Connection Pooling**: MongoDB connection reuse

---

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:5000/

# Test company data
curl http://localhost:5000/api/company/AAPL

# Test analysis
curl -X POST http://localhost:5000/api/analyze/AAPL

# Test chatbot
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain the PE ratio", "symbol": "AAPL"}'
```

---

## 🚀 Deployment

### Option 1: Railway / Render

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Option 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Option 3: VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Start server
pm2 start server.js --name finora-api
pm2 startup
pm2 save
```

---

## 📈 Future Enhancements

- [ ] User authentication (JWT)
- [ ] Portfolio tracking
- [ ] Real-time stock prices (WebSocket)
- [ ] Multiple data providers (fallback)
- [ ] Advanced charts (candlestick, indicators)
- [ ] Email alerts
- [ ] Premium features (more API calls)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - Team Certified Losers

---

## 👥 Team

**Team Certified Losers** - GlobalTech Hackathon 2025
- Yashodip More
- Komal Kumavat
- Jaykumar Girase
- Tejas Patil

---

## 📞 Support

For issues or questions:
- Open GitHub issue
- Email: support@finora.ai
- Discord: [Join our community]

---

**Built with ❤️ to democratize financial intelligence for retail investors**
