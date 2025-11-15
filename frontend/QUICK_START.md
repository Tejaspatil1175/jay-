# 🚀 Quick Start Guide

## Prerequisites
- ✅ Backend server running on `http://localhost:5000`
- ✅ MongoDB running
- ✅ Apache Tika running
- ✅ API keys configured in backend `.env`

## Start the Frontend

### Option 1: Using npm
```bash
cd frontend
npm install  # If not already done
npm run dev
```

### Option 2: Using the batch file
```bash
# From project root
START_FRONTEND.bat
```

The app will start at **http://localhost:5173**

## First Time Setup

1. **Register an Account**
   - Go to http://localhost:5173
   - Click "Get Started" or "Register"
   - Fill in your details
   - You'll get $100,000 initial balance for paper trading

2. **Login**
   - Use your registered credentials
   - You'll be redirected to the Dashboard

## Features Tour

### 1. Dashboard
- View your portfolio summary
- See market movers (Top Gainers, Losers, Most Active)
- Quick access to all features

### 2. Market
- **Movers Tab**: Real-time top gainers, losers, most active stocks
- **Screener Tab**: Filter stocks by market cap (Large/Small)
- **Search Tab**: Find stocks by symbol or name
- **Indicators Tab**: View SMA and RSI charts for any stock

### 3. Companies
- Browse all tracked companies
- Search companies
- Click "Add Company" to track new stocks
- Click any company card to see detailed analysis

### 4. Company Detail
- **Overview Tab**: Company info and valuation metrics
- **Financials Tab**: Revenue, income, balance sheet charts
- **Charts Tab**: Stock price and volume charts
- Click "AI Analysis" for AI-powered insights

### 5. Portfolio
- **Holdings Tab**: View all your stock holdings with P&L
- **Orders Tab**: See all buy/sell order history
- **Positions Tab**: Track open positions
- Click "Buy Stock" or "Sell Stock" to trade
- Charts show portfolio allocation and performance

### 6. Documents
- **Upload Documents**: Click "Upload Document"
  - Supports: PDF, Excel, CSV, Images
  - Max size: 25MB
  - Select category when uploading
- **View Analysis**: Click any document to see AI analysis
  - Processing happens automatically
  - Charts show extracted financial data
  - Key findings and metrics displayed

### 7. AI Chat
- **Ask Questions**: Type any financial question
- **Optional Symbol**: Enter stock symbol for specific analysis
- **Features**:
  - Formatted responses with markdown
  - Charts embedded in answers
  - Source citations with links
  - Web search integration
  - Portfolio-aware responses

### 8. Analysis
- Enter any stock symbol
- Click "Analyze Stock"
- Get comprehensive AI analysis with:
  - Executive summary
  - Risk assessment
  - Investment recommendation
  - Strengths and risks
  - Performance charts

## Sample Questions for AI Chat

1. "Should I invest in GOOGL based on my current portfolio?"
2. "What are the top tech stocks to buy right now?"
3. "Analyze my bank statement" (after uploading)
4. "Compare AAPL and MSFT"
5. "What is the current market sentiment?"
6. "Explain the latest financial report" (after uploading)
7. "Should I diversify my portfolio?"

## Tips for Best Experience

### 1. Start with Companies
- Add a few companies (AAPL, GOOGL, MSFT, TSLA, etc.)
- This populates data for AI to analyze

### 2. Make Some Trades
- Buy a few stocks in Portfolio
- This gives AI context about your investments

### 3. Upload Documents
- Upload a bank statement or financial report
- AI will extract and analyze financial metrics

### 4. Use AI Chat
- Ask questions about the stocks you added
- AI combines company data + your portfolio + documents + web search

### 5. Check Technical Indicators
- Go to Market → Indicators
- Enter a symbol to see SMA and RSI charts
- Use signals for trading decisions

## Refresh Data

All pages have a **"Refresh" button** to:
- Update stock prices
- Reload market data
- Refresh portfolio values
- Get latest company info

## Keyboard Shortcuts (Chat)

- `Enter`: Send message
- `Ctrl + R`: Start new chat (after confirming)

## Troubleshooting

### Backend Not Connected
- Check if backend is running on `http://localhost:5000`
- Look for CORS errors in browser console
- Verify API URL in `frontend/src/services/api.js`

### Charts Not Showing
- Data might be loading
- Click refresh button
- Check browser console for errors

### Upload Failing
- Check file size (max 25MB)
- Verify Apache Tika is running
- Check supported formats (PDF, Excel, CSV, Images)

### AI Chat Not Working
- Check Gemini API key in backend
- Verify backend logs for errors
- Try refreshing the page

## API Rate Limits

⚠️ **AlphaVantage Free Tier**:
- 5 requests per minute
- 100 requests per day

**Solution**:
- Data is cached in MongoDB
- Use "Refresh" only when needed
- Wait for rate limit reset if exceeded

## Development Mode

The app runs in development mode with:
- Hot reload enabled
- Source maps for debugging
- Error overlay
- React DevTools support

## Production Build

```bash
npm run build
npm run preview
```

## Support

- Check `IMPLEMENTATION_COMPLETE.md` for features list
- See backend `API_DOCUMENTATION.md` for API details
- Look at component code for implementation examples

---

**Enjoy your Financial Analysis Platform! 📈💰**
