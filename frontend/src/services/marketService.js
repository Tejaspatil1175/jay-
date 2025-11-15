import api from './api';

export const marketService = {
  // Get top movers (gainers, losers, most active)
  getMovers: async () => {
    const response = await api.get('/api/market/movers');
    return response.data;
  },

  // Get stocks by market cap
  getScreener: async (filter) => {
    const response = await api.get(`/api/market/screener?filter=${filter}`);
    return response.data;
  },

  // Search stocks
  searchStocks: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/market/search?${queryString}`);
    return response.data;
  },

  // Get SMA indicator
  getSMA: async (symbol, timePeriod = 20, seriesType = 'close') => {
    const response = await api.get(
      `/api/market/indicators/${symbol}/sma?timePeriod=${timePeriod}&seriesType=${seriesType}`
    );
    return response.data;
  },

  // Get RSI indicator
  getRSI: async (symbol, timePeriod = 14) => {
    const response = await api.get(
      `/api/market/indicators/${symbol}/rsi?timePeriod=${timePeriod}`
    );
    return response.data;
  },

  // Get all indicators
  getAllIndicators: async (symbol) => {
    const response = await api.get(`/api/market/indicators/${symbol}/all`);
    return response.data;
  },
};
