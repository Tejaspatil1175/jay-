# 📊 Complete Data Flow Example

This document shows **exactly** how data flows through the Finora backend system with real examples.

---

## 🔄 Complete Workflow

```
User Selects Company (GOOGL)
         ↓
   Backend Fetches from AlphaVantage
         ↓
   Store Raw + Normalized Data in MongoDB
         ↓
   Send to Gemini for Analysis
         ↓
   Store Analysis in Same Document
         ↓
   Return Chart-Ready Data to Frontend
         ↓
   User Asks Question in Chatbot
         ↓
   Chatbot Uses Stored Data + Web Search
         ↓
   Return Intelligent Response
```

---

## Step 1: User Selects Company

**Frontend Request:**
```javascript
fetch('http://localhost:5000/api/company/GOOGL')
```

---

## Step 2: Backend Fetches from AlphaVantage

**What Happens:**
1. Check MongoDB - does GOOGL data exist and is it fresh (< 24 hours)?
2. If NO → Fetch from AlphaVantage (4 API calls):
   - `OVERVIEW`
   - `INCOME_STATEMENT`
   - `BALANCE_SHEET  `
   - `TIME_SERIES_DAILY`

**Raw AlphaVantage Response** (simplified):
```json
{
  "overview": {
    "Symbol": "GOOGL",
    "Name": "Alphabet Inc Class A",
    "MarketCapitalization": "3462017843000",
    "PERatio": "28.28",
    "EPS": "10.14",
    "ProfitMargin": "0.322"
  },
  "incomeStatement": {
    "annualReports": [
      {
        "fiscalDateEnding": "2024-12-31",
        "totalRevenue": "350018000000",
        "netIncome": "100118000000"
      }
    ]
  },
  "timeSeries": {
    "2024-11-14": {
      "1. open": "178.28",
      "4. close": "175.58",
      "5. volume": "31007457"
    }
  }
}
```

---

## Step 3: Normalize & Store in MongoDB

**What Happens:**
- `dataTransformer.js` normalizes the raw data
- Creates chart-ready arrays
- Stores in MongoDB with this **exact schema**:

**MongoDB Document:**
```json
{
  "_id": "ObjectId(...)",
  "symbol": "GOOGL",
  "providerUsed": "alphavantage",
  "fetchedAt": "2025-11-14T09:04:34.781Z",
  
  "raw": {
    "overview": { /* full response */ },
    "incomeStatement": { /* full response */ },
    "balanceSheet": { /* full response */ },
    "cashFlow": { /* full response */ },
    "historicalTrends": [
      {
        "year": "2024",
        "revenue": 350018000000,
        "netIncome": 100118000000,
        "totalAssets": 450256000000
      },
      {
        "year": "2023",
        "revenue": 307394000000,
        "netIncome": 73795000000
      }
    ]
  },
  
  "metrics": {
    "symbol": "GOOGL",
    "name": "Alphabet Inc Class A",
    "marketCap": 3462017843000,
    "peRatio": 28.28,
    "eps": 10.14,
    "profitMargin": 0.322,
    "revenue": 350018000000,
    "netIncome": 100118000000,
    "roe": 0.354,
    "roa": 0.163,
    "debtEquity": null,
    "fiftyTwoWeekHigh": 292,
    "fiftyTwoWeekLow": 140.23,
    "sector": "COMMUNICATION SERVICES",
    "industry": "INTERNET CONTENT & INFORMATION"
  },
  
  "chartData": [
    {
      "date": "2024-06-03T00:00:00.000Z",
      "open": 172.54,
      "high": 174.525,
      "low": 171.16,
      "close": 173.17,
      "volume": 27459118
    },
    {
      "date": "2024-06-04T00:00:00.000Z",
      "open": 173.28,
      "close": 173.79,
      "volume": 26879596
    }
    // ... 365 days of data
  ],
  
  "analysis": null,  // Not yet generated
  
  "embeddings": {
    "metricsEmbeddingId": null,
    "chartEmbeddingId": null,
    "analysisEmbeddingId": null
  },
  
  "access": {
    "userId": "anonymous",
    "visibility": "public"
  },
  
  "createdAt": "2025-11-14T09:04:34.781Z",
  "updatedAt": "2025-11-14T09:04:34.781Z"
}
```

**Backend Response to Frontend:**
```json
{
  "ok": true,
  "cached": false,
  "company": "GOOGL",
  "data": {
    "symbol": "GOOGL",
    "name": "Alphabet Inc Class A",
    "metrics": {
      "marketCap": 3462017843000,
      "peRatio": 28.28,
      "eps": 10.14,
      "profitMargin": 0.322,
      "revenue": 350018000000,
      "roe": 0.354
    },
    "chartData": [ /* 365 days */ ],
    "historicalTrends": [ /* 5 years */ ],
    "fetchedAt": "2025-11-14T09:04:34.781Z"
  }
}
```

---

## Step 4: User Clicks "Analyze"

**Frontend Request:**
```javascript
fetch('http://localhost:5000/api/analyze/GOOGL', { method: 'POST' })
```

**What Happens:**
1. Backend retrieves GOOGL document from MongoDB
2. Extracts `metrics` object
3. Sends to Gemini AI with structured prompt:

**Gemini API Request:**
```json
{
  "contents": [{
    "parts": [{
      "text": "You are an expert financial analyst. Analyze the following company metrics...\n\nCompany Metrics:\n{\n  \"symbol\": \"GOOGL\",\n  \"name\": \"Alphabet Inc Class A\",\n  \"marketCap\": 3462017843000,\n  \"peRatio\": 28.28,\n  \"eps\": 10.14,\n  \"profitMargin\": 0.322,\n  \"revenue\": 350018000000,\n  \"roe\": 0.354\n}\n\nProvide analysis in JSON format with: summary, insights, risk, suggestion"
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2048
  }
}
```

**Gemini AI Response:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "{\n  \"summary\": \"Alphabet demonstrates exceptional financial strength with a market cap of $3.46 trillion and robust profitability metrics. The company shows strong revenue generation at $350 billion with an impressive 32.2% profit margin, indicating efficient operations.\",\n  \"insights\": {\n    \"peRatio\": \"A PE ratio of 28.28 suggests investors are willing to pay $28.28 for every $1 of earnings, reflecting positive growth expectations\",\n    \"roe\": \"ROE of 35.4% is outstanding, showing the company generates $0.35 profit for every dollar of shareholder investment\",\n    \"profitMargin\": \"32.2% profit margin demonstrates highly efficient operations and strong pricing power in the market\",\n    \"revenue\": \"$350 billion in annual revenue shows dominant market position and diversified income streams\",\n    \"eps\": \"EPS of $10.14 indicates solid per-share profitability for shareholders\",\n    \"debtEquity\": \"No debt-to-equity data available - further investigation recommended\"\n  },\n  \"risk\": \"Low - Strong financials, high profitability, and market leadership position\",\n  \"suggestion\": \"Excellent long-term investment candidate with strong fundamentals and growth potential\"\n}"
      }]
    }
  }]
}
```

---

## Step 5: Store Analysis in MongoDB

**Updated MongoDB Document:**
```json
{
  "_id": "ObjectId(...)",
  "symbol": "GOOGL",
  "metrics": { /* same as before */ },
  "chartData": [ /* same as before */ ],
  
  "analysis": {
    "analysisId": "550e8400-e29b-41d4-a716-446655440000",
    "summary": "Alphabet demonstrates exceptional financial strength with a market cap of $3.46 trillion...",
    "insights": {
      "peRatio": "A PE ratio of 28.28 suggests investors are willing to pay $28.28...",
      "roe": "ROE of 35.4% is outstanding...",
      "profitMargin": "32.2% profit margin demonstrates highly efficient operations...",
      "revenue": "$350 billion in annual revenue shows dominant market position...",
      "eps": "EPS of $10.14 indicates solid per-share profitability...",
      "debtEquity": "No debt-to-equity data available..."
    },
    "risk": "Low",
    "suggestion": "Excellent long-term investment candidate with strong fundamentals",
    "llmModel": "gemini-2.0-flash-exp",
    "llmRawResponse": { /* full Gemini response */ },
    "createdAt": "2025-11-14T09:05:12.345Z"
  }
}
```

**Backend Response to Frontend:**
```json
{
  "ok": true,
  "cached": false,
  "symbol": "GOOGL",
  "analysis": {
    "summary": "Alphabet demonstrates exceptional financial strength...",
    "insights": { /* all insights */ },
    "risk": "Low",
    "suggestion": "Excellent long-term investment candidate..."
  }
}
```

---

## Step 6: Frontend Displays Charts & Analysis

**What Frontend Shows:**
1. **Company Overview Card**
   - Name, Symbol, Sector
   - Market Cap: $3.46T
   - PE Ratio: 28.28

2. **Financial Metrics Grid**
   - EPS: $10.14
   - ROE: 35.4%
   - Profit Margin: 32.2%
   - Revenue: $350B

3. **Interactive Charts**
   - Stock Price Chart (365 days from `chartData`)
   - Revenue Trend (5 years from `historicalTrends`)
   - Profit Margin Trend

4. **AI Analysis Panel**
   - Summary (2-3 sentences)
   - Key Insights (6 metrics explained)
   - Risk Level: LOW (green badge)
   - Investment Suggestion

---

## Step 7: User Asks Question in Chatbot

### Example 1: Simple Question (No Web Search)

**User Message:**
```
"What is the PE ratio and what does it mean?"
```

**Frontend Request:**
```javascript
fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What is the PE ratio and what does it mean?",
    symbol: "GOOGL"
  })
})
```

**What Happens:**
1. Backend retrieves GOOGL document from MongoDB
2. Gemini checks: Does this need web search? → **NO** (data exists)
3. Gemini generates response using stored data

**Gemini Context Prompt:**
```
You are a helpful financial assistant helping a retail investor understand their selected company.

Company Context:
Symbol: GOOGL
Name: Alphabet Inc Class A
Key Metrics: {
  "peRatio": 28.28,
  "eps": 10.14,
  "marketCap": 3462017843000,
  ...
}
Analysis Summary: Alphabet demonstrates exceptional financial strength...

User Question: What is the PE ratio and what does it mean?

Instructions:
- Answer based on the company data provided
- Use simple language for retail investors
- Keep responses concise and actionable

Your Response:
```

**Chatbot Response:**
```json
{
  "ok": true,
  "sessionId": "chat-uuid-123",
  "message": "Alphabet's PE ratio is 28.28, which means investors are paying $28.28 for every $1 of earnings the company makes. This is slightly higher than the market average, indicating investors expect strong future growth. For Alphabet specifically, this reflects confidence in their AI initiatives and cloud computing expansion. It's a reasonable valuation for a tech leader with 35.4% ROE.",
  "usedWebSearch": false,
  "timestamp": "2025-11-14T09:10:25.123Z"
}
```

**Chat History Saved in MongoDB:**
```json
{
  "_id": "ObjectId(...)",
  "sessionId": "chat-uuid-123",
  "symbol": "GOOGL",
  "messages": [
    {
      "role": "user",
      "content": "What is the PE ratio and what does it mean?",
      "timestamp": "2025-11-14T09:10:20.000Z"
    },
    {
      "role": "assistant",
      "content": "Alphabet's PE ratio is 28.28, which means...",
      "usedWebSearch": false,
      "sources": [],
      "timestamp": "2025-11-14T09:10:25.123Z"
    }
  ],
  "createdAt": "2025-11-14T09:10:20.000Z"
}
```

---

### Example 2: Web Search Question

**User Message:**
```
"What's the latest news about Alphabet's AI products?"
```

**What Happens:**
1. Backend retrieves GOOGL data
2. Gemini checks: Does this need web search? → **YES** (requires current info)
3. Backend performs web search
4. Gemini generates response with search results

**Web Search Query:**
```
"Alphabet Inc GOOGL AI products news latest"
```

**Web Search Results:**
```json
[
  {
    "title": "Google Launches Gemini 2.0 with Enhanced AI Capabilities",
    "url": "https://techcrunch.com/2025/11/gemini-2",
    "snippet": "Google announced Gemini 2.0, featuring multimodal AI..."
  },
  {
    "title": "Alphabet's AI Revenue Surges 40% in Q3 2025",
    "url": "https://bloomberg.com/alphabet-ai-revenue",
    "snippet": "AI-powered products driving significant growth..."
  }
]
```

**Gemini Context Prompt:**
```
Company Context:
Symbol: GOOGL
Metrics: { /* stored data */ }

Recent Web Search Results:
[1] Google Launches Gemini 2.0 with Enhanced AI Capabilities
Google announced Gemini 2.0, featuring multimodal AI...
Source: https://techcrunch.com/2025/11/gemini-2

[2] Alphabet's AI Revenue Surges 40% in Q3 2025
AI-powered products driving significant growth...
Source: https://bloomberg.com/alphabet-ai-revenue

User Question: What's the latest news about Alphabet's AI products?

Your Response:
```

**Chatbot Response:**
```json
{
  "ok": true,
  "sessionId": "chat-uuid-123",
  "message": "Recent news shows strong momentum in Alphabet's AI division! Google just launched Gemini 2.0 with enhanced multimodal AI capabilities, and their AI-powered products drove a 40% revenue surge in Q3 2025. This aligns with the company's strong fundamentals we see in the data - with 32.2% profit margins and $350B revenue, they're well-positioned to capitalize on the AI boom.",
  "usedWebSearch": true,
  "sources": [
    "https://techcrunch.com/2025/11/gemini-2",
    "https://bloomberg.com/alphabet-ai-revenue"
  ],
  "timestamp": "2025-11-14T09:15:30.456Z"
}
```

---

## 🎯 Key Takeaways

### Data Storage Strategy
✅ **Raw data** stored in `raw` field (full AlphaVantage responses)
✅ **Normalized metrics** in `metrics` field (clean, typed data)
✅ **Chart data** in `chartData` array (frontend-ready)
✅ **Analysis** in `analysis` object (Gemini output)

### Why This Architecture Works
1. **Single Source of Truth**: All company data in one MongoDB document
2. **Efficient Queries**: No joins needed, fast retrieval
3. **Caching**: 24-hour cache prevents redundant API calls
4. **Flexibility**: Raw data preserved for future processing
5. **Performance**: Chart-ready data reduces frontend processing

### Chatbot Intelligence
- Uses **stored data first** (fast, accurate)
- Performs **web search** only when needed (current info)
- **Cites sources** for transparency
- **Maintains context** across conversation
- **No hallucinations** (grounded in data)

---

## 🚀 Production Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Fetch Company (first time) | 10-15s | 4 AlphaVantage API calls |
| Fetch Company (cached) | <1s | Retrieved from MongoDB |
| Generate Analysis | 3-5s | Gemini API call |
| Chatbot (no search) | 1-2s | Uses stored data |
| Chatbot (with search) | 5-8s | Web search + Gemini |

---

This is **exactly** how your Finora backend works! 🎉
