# API Testing Guide

Complete guide for testing all Finora API endpoints.

---

## 🛠️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finora-ai
ALPHA_VANTAGE_KEY=your_actual_key
GEMINI_API_KEY=your_actual_key
```

### 3. Start MongoDB
```bash
# If using local MongoDB
mongod

# OR use MongoDB Atlas (cloud)
```

### 4. Start Server
```bash
npm run dev
```

---

## 📡 Testing with cURL

### Test 1: Health Check
```bash
curl http://localhost:5000/
```

**Expected Response:**
```json
{
  "ok": true,
  "message": "Finora AI Investment Analyst API",
  "version": "1.0.0",
  "status": "Running"
}
```

---

### Test 2: Fetch Company Data (AAPL)
```bash
curl http://localhost:5000/api/company/AAPL
```

**Expected Response:**
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
      "profitMargin": 0.23
    },
    "chartData": [...],
    "historicalTrends": [...]
  }
}
```

**Note**: First call takes ~10-15 seconds (fetching from AlphaVantage).

---

### Test 3: Fetch Company Data (GOOGL)
```bash
curl http://localhost:5000/api/company/GOOGL
```

---

### Test 4: Get All Companies
```bash
curl http://localhost:5000/api/companies
```

---

### Test 5: Generate AI Analysis
```bash
curl -X POST http://localhost:5000/api/analyze/AAPL
```

**Expected Response:**
```json
{
  "ok": true,
  "cached": false,
  "symbol": "AAPL",
  "analysis": {
    "summary": "Apple shows strong financial health...",
    "insights": {
      "peRatio": "PE Ratio of 29.5 means...",
      "roe": "ROE of 15.2% shows...",
      "profitMargin": "23% profit margin..."
    },
    "risk": "Low",
    "suggestion": "Good for long-term investment"
  }
}
```

---

### Test 6: Get Existing Analysis
```bash
curl http://localhost:5000/api/analyze/AAPL
```

---

### Test 7: Chatbot - Simple Question
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the PE ratio of this company?",
    "symbol": "AAPL"
  }'
```

**Expected Response:**
```json
{
  "ok": true,
  "sessionId": "uuid-here",
  "message": "The PE ratio of Apple is 29.5, which means...",
  "usedWebSearch": false,
  "timestamp": "2025-11-13T..."
}
```

---

### Test 8: Chatbot - Web Search Question
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the latest news about Apple?",
    "symbol": "AAPL"
  }'
```

**Expected Response:**
```json
{
  "ok": true,
  "sessionId": "uuid-here",
  "message": "Based on recent news, Apple announced...",
  "usedWebSearch": true,
  "sources": ["https://..."],
  "timestamp": "2025-11-13T..."
}
```

---

### Test 9: Start New Chat Session
```bash
curl -X POST http://localhost:5000/api/chat/new \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL"
  }'
```

---

### Test 10: Get Chat History
```bash
# First, get sessionId from Test 7 or 8, then:
curl http://localhost:5000/api/chat/history/SESSION_ID_HERE
```

---

### Test 11: Force Refresh Company Data
```bash
curl http://localhost:5000/api/company/AAPL/refresh
```

---

### Test 12: Delete Analysis
```bash
curl -X DELETE http://localhost:5000/api/analyze/AAPL
```

---

## 📡 Testing with Postman

### Import Collection

1. Open Postman
2. Click **Import**
3. Create new collection: "Finora API"
4. Add requests below

### Request 1: Get Company Data
- **Method**: GET
- **URL**: `http://localhost:5000/api/company/AAPL`

### Request 2: Analyze Company
- **Method**: POST
- **URL**: `http://localhost:5000/api/analyze/AAPL`

### Request 3: Chat
- **Method**: POST
- **URL**: `http://localhost:5000/api/chat`
- **Body** (JSON):
```json
{
  "message": "Explain the profit margin",
  "symbol": "AAPL"
}
```

---

## 🧪 Testing Workflow

### Complete User Flow Test

```bash
#!/bin/bash

echo "=== Finora API Complete Flow Test ==="

echo "\n1. Health Check"
curl http://localhost:5000/

echo "\n\n2. Fetch AAPL Data"
curl http://localhost:5000/api/company/AAPL

echo "\n\n3. Generate Analysis"
curl -X POST http://localhost:5000/api/analyze/AAPL

echo "\n\n4. Get Analysis"
curl http://localhost:5000/api/analyze/AAPL

echo "\n\n5. Chat - PE Ratio Question"
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the PE ratio?", "symbol": "AAPL"}'

echo "\n\n6. Chat - Latest News (Web Search)"
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Latest news about this company?", "symbol": "AAPL"}'

echo "\n\n=== Test Complete ==="
```

Save as `test.sh`, make executable, and run:
```bash
chmod +x test.sh
./test.sh
```

---

## 📊 Testing Multiple Companies

```bash
# Test various companies
for symbol in AAPL GOOGL MSFT TSLA AMZN; do
  echo "Testing $symbol..."
  curl http://localhost:5000/api/company/$symbol
  sleep 15  # AlphaVantage rate limit (5 calls/min)
done
```

---

## ⚠️ Common Issues

### Issue 1: AlphaVantage Rate Limit
**Error**: `"AlphaVantage API rate limit exceeded"`

**Solution**: Wait 1 minute between requests (free tier: 5 calls/min)

---

### Issue 2: Invalid Symbol
**Error**: `"Invalid symbol or no data available"`

**Solution**: Use valid stock symbols (e.g., AAPL, GOOGL, MSFT)

---

### Issue 3: MongoDB Connection Failed
**Error**: `"MongoDB Connection Error"`

**Solution**: 
```bash
# Start MongoDB locally
mongod

# OR update MONGO_URI in .env to use Atlas
```

---

### Issue 4: Missing API Keys
**Error**: `"GEMINI_KEY not set in environment"`

**Solution**: Add keys to `.env`:
```env
ALPHA_VANTAGE_KEY=your_key
GEMINI_API_KEY=your_key
```

---

## 🔍 Monitoring & Debugging

### Check MongoDB Data
```bash
# Open MongoDB shell
mongosh

# Use database
use finora-ai

# See all companies
db.companies.find().pretty()

# See specific company
db.companies.findOne({symbol: "AAPL"})

# See chat history
db.chathistories.find().pretty()
```

### Check Server Logs
```bash
# Development mode shows all logs
npm run dev

# Look for:
# ✅ MongoDB Connected
# 📊 Fetching fresh data for AAPL...
# 🤖 Generating AI analysis...
# 🔍 Performing web search...
```

---

## 📈 Performance Benchmarks

| Endpoint | First Call | Cached Call | Notes |
|----------|-----------|-------------|-------|
| `/api/company/:symbol` | 10-15s | <1s | AlphaVantage API |
| `/api/analyze/:symbol` | 5-8s | <1s | Gemini AI |
| `/api/chat` (no search) | 2-3s | - | With stored data |
| `/api/chat` (with search) | 5-10s | - | Web search + AI |

---

## ✅ Test Checklist

- [ ] Health check returns 200
- [ ] Company data fetches successfully
- [ ] Data is stored in MongoDB
- [ ] Second request uses cache (faster)
- [ ] Analysis generates properly
- [ ] Analysis contains all required fields
- [ ] Chatbot answers from stored data
- [ ] Chatbot uses web search when needed
- [ ] Chat history is saved
- [ ] Rate limiting works (101st request fails)
- [ ] Invalid symbols return 400 error
- [ ] CORS works with frontend

---

## 🚀 Next Steps

After testing:

1. **Deploy to production**:
   - Railway, Render, or AWS
   - Set production environment variables
   
2. **Connect frontend**:
   - Update CORS_ORIGIN in .env
   - Test with React frontend

3. **Monitor performance**:
   - Add logging service (LogRocket, Sentry)
   - Set up alerts

---

## 📞 Support

Issues during testing? Check:
- Server logs (`npm run dev`)
- MongoDB logs (`mongod`)
- API key validity
- Rate limits

Still stuck? Open an issue on GitHub!
