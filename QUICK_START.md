# 🚀 Quick Start Guide - Finora AI

## ⚡ Fast Setup (2 Minutes)

### 1️⃣ Start Backend
```bash
cd backend
npm install           # Only first time
npm start            # Start server
```
**Expected Output:**
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

### 2️⃣ Open Frontend
**Option A**: Double-click `frontend/index.html`

**Option B**: Use VS Code Live Server
```
Right-click index.html → Open with Live Server
```

**Option C**: Python HTTP Server
```bash
cd frontend
python -m http.server 8080
# Open http://localhost:8080
```

### 3️⃣ Login
```
Email: admin@finora.ai
Password: finora2024
```

### 4️⃣ Test It!
1. Click "AAPL" chip (or type any stock symbol)
2. Click "Analyze"
3. Wait 5-10 seconds
4. View dashboard with AI analysis
5. Click "Chat" and ask questions

---

## 🎯 Demo Flow (For Presentation)

### Scenario: Analyzing Apple Inc.

**Step 1**: "Let me show you how easy it is to analyze any company..."
- Type `AAPL` → Click Analyze
- **Point out**: "Real-time data from financial APIs"

**Step 2**: Dashboard appears
- **Highlight**: "Look at these key metrics - Market Cap, PE Ratio, EPS"
- **Scroll to AI Analysis**: "Here's what makes us different - plain English analysis"
- **Show risk badge**: "Automatically calculates risk level"
- **Show chart**: "90-day price history visualization"

**Step 3**: Switch to Chat tab
- Ask: "What does the PE ratio mean?"
- **Show response**: "See how it explains in simple terms?"
- Ask: "Latest news about Apple"
- **Show web search**: "It can even search the web for current info!"

**Step 4**: Try another company
- Search `GOOGL`
- **Point out**: "Same analysis in seconds"
- **Highlight caching**: "Notice it says 'from cache' - faster subsequent loads"

---

## 📊 Features to Highlight

### 1. **Balance Sheet Decoding** ✅
- "We automatically extract and normalize data from financial statements"
- Show: Debt/Equity ratio, Current Assets, Liabilities

### 2. **Plain English Analysis** ✅
- "No more jargon - AI explains everything simply"
- Show: Insights section with metric explanations

### 3. **Interactive Chat** ✅
- "Ask anything about the company"
- Demo: Real conversation with context awareness

### 4. **Real-time Data** ✅
- "Connected to AlphaVantage for live financial data"
- Show: Refresh button to get latest info

### 5. **Web Search Integration** ✅
- "For current news and events"
- Ask: "Latest earnings report"

---

## 🎤 Talking Points

### Problem Statement
> "70% of retail investors in India rely on speculation and finfluencers because they can't understand complex financial statements. We're changing that."

### Your Solution
> "Finora AI automatically decodes balance sheets and financial statements, translating them into plain English insights that anyone can understand."

### Technology Stack
> "Full-stack solution using:
> - **Backend**: Node.js, Express, MongoDB
> - **AI**: Google Gemini for analysis
> - **Data**: AlphaVantage API for real financials
> - **Frontend**: Modern JavaScript with Chart.js"

### Impact
> "We're democratizing financial intelligence - making professional-grade analysis accessible to everyone, not just MBAs and CAs."

---

## 🐛 Quick Troubleshooting

### Backend not starting?
```bash
# Check MongoDB is running
# Check .env file exists with all keys
# Check port 5000 is free
```

### Frontend errors?
```
F12 → Console → Look for:
- "Failed to fetch" → Backend not running
- CORS error → Add CORS_ORIGIN=* to .env
- Chart not showing → Clear browser cache
```

### Login not working?
```
Credentials must match exactly:
Email: admin@finora.ai
Password: finora2024
```

---

## 📸 Screenshot Moments

Take screenshots of:
1. ✅ Login screen (professional UI)
2. ✅ Search with popular stock chips
3. ✅ Dashboard with metrics grid
4. ✅ AI Analysis section (highlight risk badge)
5. ✅ Stock price chart
6. ✅ Chat conversation with AI
7. ✅ Web search sources display

---

## 🏆 Winning Points

1. **Complete Solution**: Not just a prototype - production-ready
2. **Real Data**: Uses actual financial APIs, not mock data
3. **AI-Powered**: Genuine AI analysis using Gemini
4. **User-Centric**: Beautiful, intuitive interface
5. **Scalable**: Clean architecture, easy to extend
6. **Problem-Focused**: Directly addresses hackathon challenge

---

## ⚠️ Last-Minute Checks

Before demo:
- [ ] Backend running ✅
- [ ] MongoDB connected ✅
- [ ] Can login ✅
- [ ] AAPL analysis works ✅
- [ ] GOOGL analysis works ✅
- [ ] MSFT analysis works ✅
- [ ] Chat responds ✅
- [ ] Charts render ✅
- [ ] No console errors ✅

---

## 🎓 Bonus: Answer These Questions

**Q: How does it decode balance sheets?**
> "We use AlphaVantage API to fetch BALANCE_SHEET, INCOME_STATEMENT, and CASH_FLOW data, then normalize it using our data transformer to extract key metrics like assets, liabilities, debt ratios, and liquidity measures."

**Q: How does AI generate insights?**
> "We send the normalized financial metrics to Google's Gemini AI with a structured prompt asking it to explain each metric in plain English, assess risk, and provide investment suggestions."

**Q: Can it handle Indian stocks?**
> "Currently US stocks via AlphaVantage. For Indian markets, we'd integrate NSE/BSE APIs - the architecture supports multiple data providers."

**Q: How do you ensure accuracy?**
> "We use official financial data from AlphaVantage (same data professional analysts use), and AI provides explanations but always cites the actual numbers. We encourage users to verify and learn."

---

## 🚀 Quick Commands Reference

```bash
# Start everything
cd backend && npm start &
cd frontend && python -m http.server 8080

# Stop everything
Ctrl+C (in both terminals)

# Restart backend (after code changes)
cd backend
npm start

# View backend logs
cd backend
npm start
# Watch console output

# Test API directly
curl http://localhost:5000/api/company/AAPL
```

---

## 📝 Environment Variables (Backend .env)

```env
# Required
MONGO_URI=mongodb://localhost:27017/finora-ai
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
GEMINI_API_KEY=your_gemini_key

# Optional
PORT=5000
CORS_ORIGIN=*
NODE_ENV=development
```

---

## 🎯 Success Metrics

Your app is working if:
- ✅ Login takes < 1 second
- ✅ Search completes in 5-10 seconds (first time)
- ✅ Cached searches complete in < 2 seconds
- ✅ Charts render smoothly
- ✅ Chat responds in 3-5 seconds
- ✅ No console errors
- ✅ All buttons work
- ✅ Responsive on mobile

---

**Good luck with your demo! 🚀**

You've built something impressive - own it! 💪
