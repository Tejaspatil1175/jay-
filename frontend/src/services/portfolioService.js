import api from './api';

export const portfolioService = {
  // Get portfolio summary
  getSummary: async () => {
    const response = await api.get('/api/portfolio/summary');
    return response.data;
  },

  // Get all holdings
  getHoldings: async () => {
    const response = await api.get('/api/portfolio/holdings');
    return response.data;
  },

  // Get holding by symbol
  getHolding: async (symbol) => {
    const response = await api.get(`/api/portfolio/holdings/${symbol}`);
    return response.data;
  },

  // Create buy order
  buyStock: async (orderData) => {
    const response = await api.post('/api/portfolio/orders/buy', orderData);
    return response.data;
  },

  // Create sell order
  sellStock: async (orderData) => {
    const response = await api.post('/api/portfolio/orders/sell', orderData);
    return response.data;
  },

  // Get all orders
  getOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/portfolio/orders${queryString ? '?' + queryString : ''}`);
    return response.data;
  },

  // Get order by ID
  getOrder: async (orderId) => {
    const response = await api.get(`/api/portfolio/orders/${orderId}`);
    return response.data;
  },

  // Get all positions
  getPositions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/portfolio/positions${queryString ? '?' + queryString : ''}`);
    return response.data;
  },

  // Update holdings prices
  updatePrices: async () => {
    const response = await api.post('/api/portfolio/holdings/update-prices');
    return response.data;
  },
};
