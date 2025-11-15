const axios = require('axios');

class FinnhubService {
  constructor() {
    this.apiKey = process.env.FINNHUB_API_KEY;
    this.baseURL = 'https://finnhub.io/api/v1';
  }

  /**
   * Fetch Market Movers - Top Gainers
   */
  async getTopGainers(exchange = 'US') {
    try {
      const response = await axios.get(`${this.baseURL}/stock/market-movers`, {
        params: {
          exchange,
          token: this.apiKey
        },
        timeout: 10000
      });

      return response.data.gainers || [];
    } catch (error) {
      console.error('Finnhub Top Gainers Error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch Market Movers - Top Losers
   */
  async getTopLosers(exchange = 'US') {
    try {
      const response = await axios.get(`${this.baseURL}/stock/market-movers`, {
        params: {
          exchange,
          token: this.apiKey
        },
        timeout: 10000
      });

      return response.data.losers || [];
    } catch (error) {
      console.error('Finnhub Top Losers Error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch Most Active Stocks
   */
  async getMostActive(exchange = 'US') {
    try {
      const response = await axios.get(`${this.baseURL}/stock/market-movers`, {
        params: {
          exchange,
          token: this.apiKey
        },
        timeout: 10000
      });

      return response.data.mostActive || [];
    } catch (error) {
      console.error('Finnhub Most Active Error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch Quote (Real-time price)
   */
  async getQuote(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/quote`, {
        params: {
          symbol,
          token: this.apiKey
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('Finnhub Quote Error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch Company Profile
   */
  async getCompanyProfile(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/stock/profile2`, {
        params: {
          symbol,
          token: this.apiKey
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('Finnhub Company Profile Error:', error.message);
      throw error;
    }
  }

  /**
   * Search stocks by query
   */
  async searchStocks(query) {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          q: query,
          token: this.apiKey
        },
        timeout: 10000
      });

      return response.data.result || [];
    } catch (error) {
      console.error('Finnhub Search Error:', error.message);
      throw error;
    }
  }

  /**
   * Get Market News
   */
  async getMarketNews(category = 'general') {
    try {
      const response = await axios.get(`${this.baseURL}/news`, {
        params: {
          category,
          token: this.apiKey
        },
        timeout: 10000
      });

      return response.data || [];
    } catch (error) {
      console.error('Finnhub Market News Error:', error.message);
      throw error;
    }
  }

  /**
   * Get Company News
   */
  async getCompanyNews(symbol, from, to) {
    try {
      const response = await axios.get(`${this.baseURL}/company-news`, {
        params: {
          symbol,
          from,
          to,
          token: this.apiKey
        },
        timeout: 10000
      });

      return response.data || [];
    } catch (error) {
      console.error('Finnhub Company News Error:', error.message);
      throw error;
    }
  }
}

module.exports = new FinnhubService();
