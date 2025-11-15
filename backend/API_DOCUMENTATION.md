# 🚀 Finora API - Complete Documentation

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Market Data](#market-data)
3. [Company Data](#company-data)
4. [Portfolio Management](#portfolio-management)
5. [Document Processing](#document-processing)
6. [AI Chatbot](#ai-chatbot)
7. [Analysis](#analysis)

---

## 🔐 Authentication

### Register New User
```http
POST # 🚀 Finora Backend - Quick Start Guide

## ⚡ Quick Setup (5 Minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API keys:
# - ALPHA_VANTAGE_KEY (get from: https://www.alphavantage.co/support/#api-key)
# - GEMINI_API_KEY (get from: https://ai.google.dev/)
# - MONGODB_URI (use local or MongoDB Atlas)
```

### 3. Start MongoDB
```bash
# If using local MongoDB
mongod --dbpath /data/db

# Or use MongoDB Atlas (cloud)
# Just update MONGODB_URI in .env
```

### 4. Start Apache Tika (for document processing)
```bash
# Using Docker (recommended)
docker-compose up -d

# Or download standalone JAR:
# wget https://dlcdn.apache.org/tika/2.9.1/tika-server-standard-2.9.1.jar
# java -jar tika-server-standard-2.9.1.jar
```

### 5. Start the Server
```bash
npm start

# For development with auto-reload:
npm run dev
```

**Server will start at:** http://localhost:5000

---

## 🧪 Test the API

### 1. Check Server Health
```bash
curl http://localhost:5000/
```

### 2. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Save the `accessToken` from response!**

### 3. Get Company Data
```bash
curl http://localhost:5000/api/company/GOOGL
```

### 4. Create a Buy Order
```bash
curl -X POST http://localhost:5000/api/portfolio/orders/buy \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "quantity": 10,
    "price": 175.50
  }'
```

### 5. Ask AI Chatbot
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Should I invest in GOOGL?",
    "symbol": "GOOGL"
  }'
```

---

## 📁 Project Structure

```
backend/
├── config/              # Configuration files
│   ├── constants.js     # API constants
│   └── database.js      # MongoDB connection
│
├── controllers/         # Request handlers
│   ├── authController.js
│   ├── companyController.js
│   ├── portfolioController.js
│   ├── marketController.js
│   ├── documentController.js
│   ├── chatController.js
│   └── analysisController.js
│
├── models/              # MongoDB schemas
│   ├── User.js
│   ├── Company.js
│   ├── Holding.js
│   ├── Order.js
│   ├── Position.js
│   ├── Document.js
│   └── ChatHistory.js
│
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── companyRoutes.js
│   ├── portfolioRoutes.js
│   ├── marketRoutes.js
│   ├── documentRoutes.js
│   ├── chatRoutes.js
│   └── analysisRoutes.js
│
├── middleware/          # Express middleware
│   └── auth.js          # JWT authentication
│
├── utils/               # Utility functions
│   ├── alphaVantage.js  # AlphaVantage API
│   ├── gemini.js        # Gemini AI
│   ├── webSearch.js     # Web search
│   ├── dataTransformer.js
│   └── errorHandler.js
│
├── uploads/             # Uploaded files storage
├── server.js            # Main server file
├── package.json
├── docker-compose.yml   # Apache Tika setup
└── .env                 # Environment variables
```

---

## 🔑 Features Implemented

### ✅ Authentication & User Management
- JWT-based authentication (access + refresh tokens)
- User registration & login
- Profile management
- Password change

### ✅ Market Data
- Top movers (gainers, losers, most active)
- Market cap filtering (large cap, small cap)
- Stock search
- Technical indicators (SMA, RSI)

### ✅ Company Data
- Fetch from AlphaVantage API
- Company overview, financials, time series
- Normalized data storage
- AI-powered analysis with Gemini

### ✅ Portfolio Management (Paper Trading)
- Holdings tracking
- Buy/Sell orders
- Position management
- P&L calculations
- Portfolio summary

### ✅ Document Processing
- PDF, Excel, CSV, Image upload (max 25MB)
- Apache Tika text extraction
- Gemini AI analysis
- Financial metrics extraction
- Chart data generation

### ✅ AI Chatbot (Multi-Source Intelligence)
- Company data integration
- User portfolio awareness
- Document context (bank statements, reports)
- Live web search
- Chat history
- Chart generation
- Source citations

---

## 📊 Data Flow

### Complete User Workflow:

```
1. User Selects Company (GOOGL)
   ↓
2. Backend Fetches from AlphaVantage
   - Overview
   - Income Statement
   - Balance Sheet
   - Cash Flow
   - Time Series Daily
   ↓
3. Normalize & Store in MongoDB
   ↓
4. Send to Gemini → Generate Insights + Charts
   ↓
5. Store Analysis in Same Document
   ↓
6. Return to Frontend
   ↓
7. User Uploads Bank Statement PDF
   ↓
8. Apache Tika Extracts Text
   ↓
9. Gemini Analyzes → Financial Metrics → Charts
   ↓
10. Store in MongoDB
    ↓
11. User Asks Chatbot: "Should I invest?"
    ↓
12. Chatbot Retrieves:
    - Company data
    - Portfolio holdings
    - Bank statement analysis
    - Document reports
    - Live web search results
    ↓
13. Gemini Combines Everything → Answer + Chart + Sources
    ↓
14. Frontend Displays:
    ✔ AI Answer
    ✔ Visual Charts
    ✔ Website Sources
```

---

## 🛠️ Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# If not installed, install MongoDB:
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com
# Linux: sudo apt install mongodb
```

### Apache Tika Not Running
```bash
# Check Docker containers
docker ps

# Restart Tika
docker-compose restart tika

# Check logs
docker-compose logs tika
```

### API Rate Limit Exceeded
```bash
# AlphaVantage free tier: 5 requests/min, 100/day
# Solution: 
# 1. Wait for rate limit reset
# 2. Use cached data from MongoDB
# 3. Upgrade to premium plan
```

### JWT Token Expired
```bash
# Access token expires in 15 minutes
# Use refresh token endpoint:
POST /api/auth/refresh
{
  "refreshToken": "your_refresh_token"
}
```

---

## 🔄 Update Commands

### Update Dependencies
```bash
npm update
```

### Reset Database
```bash
# Drop all collections
mongo finora --eval "db.dropDatabase()"

# Or use MongoDB Compass GUI
```

### Restart Services
```bash
# Restart Node.js server
npm run dev

# Restart Docker containers
docker-compose restart
```

---

## 📝 API Testing Tools

### Postman Collection
Import the provided Postman collection for easy API testing.

### cURL Examples
See `API_DOCUMENTATION.md` for complete cURL examples.

### VS Code REST Client
Use the `.http` files in the `tests/` folder.

---

## 🚨 Production Checklist

Before deploying to production:

- [ ] Change JWT secrets in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas (cloud database)
- [ ] Enable HTTPS
- [ ] Set proper CORS origin
- [ ] Use environment-specific API keys
- [ ] Setup monitoring (PM2, New Relic)
- [ ] Configure rate limiting
- [ ] Setup automated backups
- [ ] Use Docker for Tika in production
- [ ] Setup logging (Winston, Morgan)

---

## 💡 Tips

1. **AlphaVantage Rate Limits:** Cache company data in MongoDB to reduce API calls
2. **Gemini Tokens:** Keep prompts concise to save costs
3. **Document Storage:** Use AWS S3 or similar for production
4. **Authentication:** Access tokens expire in 15min, use refresh tokens
5. **Paper Trading:** Initial balance is $100,000 per user

---

## 🆘 Support

- **Documentation:** See `API_DOCUMENTATION.md`
- **Workflow:** See `WORKFLOW_EXAMPLE.md`
- **Deployment:** See `DEPLOYMENT.md`

---

**Happy Coding! 🎉**

Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "profile": {
    "riskTolerance": "Moderate",
    "investmentGoals": ["Retirement", "Wealth Building"]
  }
}
```

**Response:**
```json
{
  "ok": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "tokenType": "Bearer",
    "expiresIn": "15m"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Refresh Access Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbG..."
}
```

### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <accessToken>
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "John Updated",
  "profile": {
    "riskTolerance": "Aggressive"
  }
}
```

### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

---

## 📊 Market Data

### Get Top Movers (Gainers, Losers, Most Active)
```http
GET /api/market/movers
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "topGainers": [
      {
        "symbol": "AAPL",
        "price": 175.50,
        "change": 5.25,
        "changePercentage": 3.08,
        "volume": 52000000
      }
    ],
    "topLosers": [ ... ],
    "mostActive": [ ... ]
  }
}
```

### Get Stocks by Market Cap
```http
GET /api/market/screener?filter=large
GET /api/market/screener?filter=small
```

**Filters:**
- `large` = Market Cap > $10B
- `small` = Market Cap < $2B

### Search Stocks
```http
GET /api/market/search?query=Apple&sector=Technology
GET /api/market/search?minMarketCap=1000000000&maxMarketCap=50000000000
```

### Get SMA (Simple Moving Average)
```http
GET /api/market/indicators/AAPL/sma?timePeriod=20&seriesType=close
```

**Response:**
```json
{
  "ok": true,
  "symbol": "AAPL",
  "indicator": "SMA",
  "timePeriod": 20,
  "data": [
    { "date": "2024-01-01", "sma": 175.50 },
    { "date": "2024-01-02", "sma": 176.20 }
  ]
}
```

### Get RSI (Relative Strength Index)
```http
GET /api/market/indicators/GOOGL/rsi?timePeriod=14
```

**Response:**
```json
{
  "ok": true,
  "symbol": "GOOGL",
  "indicator": "RSI",
  "timePeriod": 14,
  "currentRSI": 65.5,
  "signal": "NEUTRAL",
  "data": [
    { "date": "2024-01-01", "rsi": 62.3 },
    { "date": "2024-01-02", "rsi": 65.5 }
  ]
}
```

**Signal Types:** `OVERBOUGHT` (>70), `OVERSOLD` (<30), `NEUTRAL`

### Get All Indicators
```http
GET /api/market/indicators/TSLA/all
```

---

## 🏢 Company Data

### Get Company Data
```http
GET /api/company/GOOGL
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "symbol": "GOOGL",
    "metrics": {
      "name": "Alphabet Inc.",
      "marketCap": 1500000000000,
      "peRatio": 25.3,
      "eps": 5.61,
      "revenue": 280000000000
    },
    "chartData": [ ... ],
    "analysis": {
      "summary": "...",
      "risk": "Medium",
      "suggestion": "..."
    }
  }
}
```

### Refresh Company Data
```http
GET /api/company/AAPL/refresh
```

### Get All Stored Companies
```http
GET /api/company
```

---

## 💼 Portfolio Management

**All portfolio endpoints require authentication**

### Get Portfolio Summary
```http
GET /api/portfolio/summary
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "portfolio": {
      "cashBalance": 50000,
      "totalInvested": 50000,
      "totalValue": 55000,
      "profitLoss": 5000,
      "profitLossPercentage": 10,
      "holdingsCount": 5,
      "positionsCount": 5
    },
    "holdings": [ ... ],
    "positions": [ ... ]
  }
}
```

### Get All Holdings
```http
GET /api/portfolio/holdings
Authorization: Bearer <accessToken>
```

### Get Holding by Symbol
```http
GET /api/portfolio/holdings/AAPL
Authorization: Bearer <accessToken>
```

### Create Buy Order
```http
POST /api/portfolio/orders/buy
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "symbol": "AAPL",
  "quantity": 10,
  "price": 175.50
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Buy order executed successfully",
  "data": {
    "order": {
      "orderId": "ORD-...",
      "symbol": "AAPL",
      "orderType": "BUY",
      "quantity": 10,
      "price": 175.50,
      "totalAmount": 1755.00,
      "orderStatus": "EXECUTED"
    },
    "holding": { ... },
    "portfolio": {
      "cashBalance": 48245.00
    }
  }
}
```

### Create Sell Order
```http
POST /api/portfolio/orders/sell
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "symbol": "AAPL",
  "quantity": 5,
  "price": 180.00
}
```

### Get All Orders
```http
GET /api/portfolio/orders
GET /api/portfolio/orders?status=EXECUTED
GET /api/portfolio/orders?orderType=BUY
GET /api/portfolio/orders?symbol=AAPL
Authorization: Bearer <accessToken>
```

### Get Order by ID
```http
GET /api/portfolio/orders/ORD-xxx-xxx-xxx
Authorization: Bearer <accessToken>
```

### Get All Positions
```http
GET /api/portfolio/positions
GET /api/portfolio/positions?status=OPEN
Authorization: Bearer <accessToken>
```

### Update Holdings Prices
```http
POST /api/portfolio/holdings/update-prices
Authorization: Bearer <accessToken>
```

---

## 📄 Document Processing

**All document endpoints require authentication**

### Upload Document
```http
POST /api/documents/upload
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

{
  "file": <PDF/Excel/CSV/Image>,
  "category": "BANK_STATEMENT" | "COMPANY_REPORT" | "INCOME_STATEMENT" | "TAX_DOCUMENT" | "OTHER"
}
```

**Supported Files:**
- PDF (max 25MB)
- Excel (.xlsx, .xls)
- CSV
- Images (JPG, PNG)

**Response:**
```json
{
  "ok": true,
  "message": "Document uploaded successfully. Processing started.",
  "data": {
    "documentId": "DOC-...",
    "fileName": "bank_statement.pdf",
    "fileType": "PDF",
    "category": "BANK_STATEMENT",
    "processingStatus": "UPLOADED"
  }
}
```

**Processing Status:** `UPLOADED` → `EXTRACTING` → `EXTRACTED` → `ANALYZING` → `COMPLETED`

### Get All Documents
```http
GET /api/documents
GET /api/documents?category=BANK_STATEMENT
GET /api/documents?status=COMPLETED
Authorization: Bearer <accessToken>
```

### Get Document by ID
```http
GET /api/documents/DOC-xxx-xxx-xxx
Authorization: Bearer <accessToken>
```

**Response includes analysis:**
```json
{
  "ok": true,
  "data": {
    "documentId": "DOC-...",
    "fileName": "bank_statement.pdf",
    "analysis": {
      "summary": "...",
      "keyFindings": [ ... ],
      "financialMetrics": {
        "totalIncome": 5000,
        "totalExpenses": 3000
      },
      "chartData": { ... },
      "risks": [ ... ],
      "opportunities": [ ... ]
    }
  }
}
```

### Delete Document
```http
DELETE /api/documents/DOC-xxx-xxx-xxx
Authorization: Bearer <accessToken>
```

---

## 🤖 AI Chatbot

### Send Message (Multi-Source AI)
```http
POST /api/chat
Authorization: Bearer <accessToken> (optional)
Content-Type: application/json

{
  "message": "Should I invest in GOOGL based on my portfolio?",
  "symbol": "GOOGL",
  "sessionId": "session-123" (optional)
}
```

**Chatbot Uses:**
- ✅ Company data from AlphaVantage
- ✅ User portfolio data
- ✅ Uploaded documents (bank statements, reports)
- ✅ Live web search results
- ✅ Chat history context

**Response:**
```json
{
  "ok": true,
  "sessionId": "session-123",
  "answer": "Based on your portfolio and GOOGL's current metrics...",
  "chart": {
    "type": "line",
    "title": "GOOGL Price Trend",
    "labels": ["2023-Q1", "2023-Q2", "2023-Q3"],
    "values": [120, 135, 150]
  },
  "sources": [
    {
      "name": "Reuters",
      "url": "https://reuters.com/..."
    }
  ],
  "usedWebSearch": true
}
```

### Get Chat History
```http
GET /api/chat/history/session-123
```

### Start New Chat Session
```http
POST /api/chat/new
Content-Type: application/json

{
  "symbol": "AAPL"
}
```

### Delete Chat History
```http
DELETE /api/chat/history/session-123
```

---

## 🧠 Analysis

### Analyze Company
```http
POST /api/analyze/GOOGL
```

**Response:**
```json
{
  "ok": true,
  "symbol": "GOOGL",
  "analysis": {
    "summary": "Alphabet shows strong financial health...",
    "insights": {
      "peRatio": "PE ratio of 25 indicates...",
      "revenue": "Strong revenue growth..."
    },
    "risk": "Medium",
    "suggestion": "Good long-term hold for growth investors"
  }
}
```

---

## 📌 Complete Workflow Example

### User Journey:
```
1. Register → POST /api/auth/register
2. Login → POST /api/auth/login (get access token)
3. Upload Bank Statement → POST /api/documents/upload
4. Select Company → GET /api/company/GOOGL
5. View Market Movers → GET /api/market/movers
6. Check Technical Indicators → GET /api/market/indicators/GOOGL/all
7. Buy Stock → POST /api/portfolio/orders/buy
8. Ask AI Question → POST /api/chat
   - AI uses: Company data + Portfolio + Bank statement + Web search
   - Returns: Answer + Chart + Sources
9. View Portfolio → GET /api/portfolio/summary
```

---

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Start Apache Tika (for document processing)
```bash
docker-compose up -d
```

### 4. Start MongoDB
```bash
# Local MongoDB or use MongoDB Atlas
```

### 5. Start Server
```bash
npm start
# or for development
npm run dev
```

---

## 🎯 API Response Format

**Success:**
```json
{
  "ok": true,
  "data": { ... },
  "message": "Success message" (optional)
}
```

**Error:**
```json
{
  "ok": false,
  "error": "Error message",
  "details": "Detailed error info" (optional)
}
```

---

## 🔑 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/finora

# API Keys
ALPHA_VANTAGE_KEY=your_key
GEMINI_API_KEY=your_key
FINNHUB_API_KEY=your_key

# JWT Secrets
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret

# Apache Tika
TIKA_SERVER_URL=http://localhost:9998/tika

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📚 Additional Resources

- AlphaVantage API: https://www.alphavantage.co/documentation/
- Gemini AI: https://ai.google.dev/
- Apache Tika: https://tika.apache.org/

---

**Built with ❤️ by Team Certified Losers**
