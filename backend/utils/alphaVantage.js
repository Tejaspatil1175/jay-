const axios = require('axios');
const { ALPHA_VANTAGE } = require('../config/constants');

class AlphaVantageService {
  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_KEY;
    this.baseURL = ALPHA_VANTAGE.BASE_URL;
  }

  /**
   * Fetch company overview
   */
  async fetchOverview(symbol) {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          function: ALPHA_VANTAGE.FUNCTIONS.OVERVIEW,
          symbol,
          apikey: this.apiKey
        },
        timeout: ALPHA_VANTAGE.TIMEOUT
      });

      if (response.data.Note) {
        throw new Error('AlphaVantage API rate limit exceeded');
      }

      if (!response.data.Symbol) {
        throw new Error('Invalid symbol or no data available');
      }

      return response.data;
    } catch (error) {
      console.error('AlphaVantage OVERVIEW Error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch income statement
   */
  async fetchIncomeStatement(symbol) {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          function: ALPHA_VANTAGE.FUNCTIONS.INCOME_STATEMENT,
          symbol,
          apikey: this.apiKey
        },
        timeout: ALPHA_VANTAGE.TIMEOUT
      });

      if (response.data.Note) {
        throw new Error('AlphaVantage API rate limit exceeded');
      }

      return response.data;
    } catch (error) {
      console.error('AlphaVantage INCOME_STATEMENT Error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch balance sheet
   */
  async fetchBalanceSheet(symbol) {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          function: ALPHA_VANTAGE.FUNCTIONS.BALANCE_SHEET,
          symbol,
          apikey: this.apiKey
        },
        timeout: ALPHA_VANTAGE.TIMEOUT
      });

      if (response.data.Note) {
        throw new Error('AlphaVantage API rate limit exceeded');
      }

      return response.data;
    } catch (error) {
      console.error('AlphaVantage BALANCE_SHEET Error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch cash flow
   */
  async fetchCashFlow(symbol) {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          function: ALPHA_VANTAGE.FUNCTIONS.CASH_FLOW,
          symbol,
          apikey: this.apiKey
        },
        timeout: ALPHA_VANTAGE.TIMEOUT
      });

      if (response.data.Note) {
        throw new Error('AlphaVantage API rate limit exceeded');
      }

      return response.data;
    } catch (error) {
      console.error('AlphaVantage CASH_FLOW Error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch time series daily (for charts)
   */
  async fetchTimeSeriesDaily(symbol) {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          function: ALPHA_VANTAGE.FUNCTIONS.TIME_SERIES_DAILY,
          symbol,
          outputsize: 'full', // Get full history
          apikey: this.apiKey
        },
        timeout: ALPHA_VANTAGE.TIMEOUT
      });

      if (response.data.Note) {
        throw new Error('AlphaVantage API rate limit exceeded');
      }

      if (!response.data['Time Series (Daily)']) {
        throw new Error('No time series data available');
      }

      return response.data['Time Series (Daily)'];
    } catch (error) {
      console.error('AlphaVantage TIME_SERIES_DAILY Error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all company data
   */
  async fetchAllData(symbol) {
    try {
      const [overview, incomeStatement, balanceSheet, cashFlow, timeSeries] = await Promise.all([
        this.fetchOverview(symbol),
        this.fetchIncomeStatement(symbol),
        this.fetchBalanceSheet(symbol),
        this.fetchCashFlow(symbol),
        this.fetchTimeSeriesDaily(symbol)
      ]);

      return {
        overview,
        incomeStatement,
        balanceSheet,
        cashFlow,
        timeSeries
      };
    } catch (error) {
      console.error('AlphaVantage fetchAllData Error:', error.message);
      throw error;
    }
  }
}

module.exports = new AlphaVantageService();
