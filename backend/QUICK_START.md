# 🚀 Finora Backend - Quick Start Guide

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
