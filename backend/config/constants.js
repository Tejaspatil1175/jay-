module.exports = {
  // AlphaVantage API
  ALPHA_VANTAGE: {
    BASE_URL: 'https://www.alphavantage.co/query',
    TIMEOUT: 15000,
    FUNCTIONS: {
      OVERVIEW: 'OVERVIEW',
      INCOME_STATEMENT: 'INCOME_STATEMENT',
      BALANCE_SHEET: 'BALANCE_SHEET',
      CASH_FLOW: 'CASH_FLOW',
      TIME_SERIES_DAILY: 'TIME_SERIES_DAILY',
      SMA: 'SMA',
      RSI: 'RSI',
      MACD: 'MACD'
    }
  },

  // Finnhub API
  FINNHUB: {
    BASE_URL: 'https://finnhub.io/api/v1',
    TIMEOUT: 10000
  },

  // Gemini API
  GEMINI: {
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
    MODEL: 'gemini-2.5-flash',
    EMBEDDING_MODEL: 'text-embedding-004',
    TIMEOUT: 20000,
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.7
  },

  // Apache Tika
  TIKA: {
    BASE_URL: 'http://localhost:9998/tika',
    TIMEOUT: 30000
  },

  // Cache TTL (Time To Live)
  CACHE_TTL: {
    COMPANY_DATA: 24 * 60 * 60 * 1000, // 24 hours
    ANALYSIS: 7 * 24 * 60 * 60 * 1000,  // 7 days
    MARKET_MOVERS: 5 * 60 * 1000        // 5 minutes
  },

  // Chart Data Configuration
  CHART: {
    MAX_DATA_POINTS: 365, // 1 year daily data
    DEFAULT_YEARS: 5      // Historical data years
  },

  // File Upload
  UPLOAD: {
    MAX_SIZE: 25 * 1024 * 1024, // 25MB
    ALLOWED_TYPES: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]
  },

  // Market Cap Categories
  MARKET_CAP: {
    LARGE_CAP: 10_000_000_000,  // > $10B
    MID_CAP: 2_000_000_000,     // $2B - $10B
    SMALL_CAP: 300_000_000      // $300M - $2B
  }
};
