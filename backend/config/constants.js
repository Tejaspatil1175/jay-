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
      TIME_SERIES_DAILY: 'TIME_SERIES_DAILY'
    }
  },

  // Gemini API
  GEMINI: {
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
    MODEL: 'gemini-2.5-flash',
    TIMEOUT: 20000,
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.7
  },

  // Cache TTL (Time To Live)
  CACHE_TTL: {
    COMPANY_DATA: 24 * 60 * 60 * 1000, // 24 hours
    ANALYSIS: 7 * 24 * 60 * 60 * 1000  // 7 days
  },

  // Chart Data Configuration
  CHART: {
    MAX_DATA_POINTS: 365, // 1 year daily data
    DEFAULT_YEARS: 5      // Historical data years
  }
};
